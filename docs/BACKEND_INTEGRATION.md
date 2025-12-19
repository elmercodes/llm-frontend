# Backend Integration Specification

## Overview
- Frontend: Next.js (App Router) web client.
- Backend: Existing Python pipeline (ingest → retrieve/rerank → LLM → verify → citations → persist history).
- Recommended API layer: thin HTTP service in Python (prefer FastAPI; Flask acceptable) that wraps the existing logic and exposes stable JSON/SSE contracts consumable by the Next.js app.

## Data model
Use these canonical JSON shapes (snake_case in Python, camelCase to the client). Timestamps are ISO 8601 strings in UTC.

### Conversation
```json
{
  "id": "string",
  "title": "string",
  "createdAt": "2024-05-04T12:00:00Z",
  "updatedAt": "2024-05-04T12:00:00Z"
}
```

### Message
```json
{
  "id": "string",
  "conversationId": "string",
  "role": "user | assistant | system",
  "content": "string",
  "createdAt": "2024-05-04T12:00:00Z",
  "attachments": [Attachment],
  "citations": [Citation],
  "answerMeta": AnswerMeta
}
```

### Attachment (pdf/txt/docx supported)
```json
{
  "id": "string",
  "conversationId": "string",
  "filename": "report.pdf",
  "mimeType": "application/pdf",
  "size": 123456,
  "status": "pending | processing | ready | error",
  "createdAt": "2024-05-04T12:00:00Z"
}
```

### Citation (page-level)
```json
{
  "id": "string",
  "attachmentId": "string",
  "page": 3,
  "snippet": "string",
  "score": 0.89
}
```

### AnswerMeta
```json
{
  "usedRag": true,
  "verification": {
    "passed": true,
    "method": "self-check"
  },
  "citations": [Citation]
}
```

## Routes
All responses use the error envelope below on failure. Examples show typical payloads; fields beyond the data model above are optional but must remain backward compatible.

### Health
- `GET /api/health`
  - **Response** `200 OK`
  ```json
  { "status": "ok" }
  ```

### Conversations
- `GET /api/conversations`
  - Sorted by `updatedAt` desc.
  - **Response** `200 OK`
  ```json
  { "items": [Conversation] }
  ```

- `POST /api/conversations`
  - **Request**
  ```json
  { "title": "New chat" }
  ```
  - **Response** `201 Created`
  ```json
  Conversation
  ```

- `GET /api/conversations/{conversationId}`
  - **Response** `200 OK`
  ```json
  Conversation
  ```

- `PATCH /api/conversations/{conversationId}`
  - **Request** (partial)
  ```json
  { "title": "Renamed chat" }
  ```
  - **Response** `200 OK`
  ```json
  Conversation
  ```

- `DELETE /api/conversations/{conversationId}`
  - **Response** `204 No Content`

### Messages
- `GET /api/conversations/{conversationId}/messages`
  - **Response** `200 OK`
  ```json
  { "items": [Message] }
  ```

- `POST /api/conversations/{conversationId}/messages`
  - **Request**
  ```json
  {
    "content": "How do embeddings work?",
    "options": { "useDocs": true },
    "attachmentIds": ["att-123"],
    "context": { "systemPrompt": "optional" }
  }
  ```
  - **Response** `201 Created`
  ```json
  Message
  ```

- `POST /api/conversations/{conversationId}/messages:stream`
  - Server-Sent Events stream.
  - **Request body** same as non-streaming POST.
  - **Events**
    - `event: message.delta` — `data: {"delta": "partial text"}`
    - `event: message.citations` — `data: {"citations": [Citation]}`
    - `event: message.done` — `data: Message` (final assembled message)
    - `event: error` — `data: {"error": {"code": "...", "message": "..."}}`

### Attachments
- `GET /api/conversations/{conversationId}/attachments`
  - **Response** `200 OK`
  ```json
  { "items": [Attachment] }
  ```

- `POST /api/conversations/{conversationId}/attachments`
  - Multipart form: `file` (pdf/txt/docx). Optional fields: `title`, `mimeType` override.
  - **Response** `202 Accepted`
  ```json
  Attachment
  ```

- `GET /api/attachments/{attachmentId}/content`
  - Returns raw bytes with `Content-Type` matching the stored file.

- `GET /api/attachments/{attachmentId}/preview` (optional)
  - Returns HTML/Docx preview or lightweight text rendering.

### Optional ingestion status
- `GET /api/attachments/{attachmentId}/status`
  - **Response** `200 OK`
  ```json
  { "status": "pending | processing | ready | error", "progress": 0.42 }
  ```

## Ingestion / Vector store expectations
1. Upload → store raw file (preserve original media type).
2. Extract text (per type: pdf, txt, docx) → chunk → embed.
3. Upsert embeddings into vector store keyed by `attachmentId` and page/range metadata.
4. Link attachments to conversations so retrieval filters by `conversationId` when `useDocs` is enabled.
5. Produce page-level citations from retrieval/rerank results, surfaced in `Citation` objects.

## Conversation ordering
- Update `updatedAt` whenever a conversation is created or when a new message is saved. Optionally also update when a new attachment is uploaded to the conversation.

## Error handling conventions
Standard error envelope for all non-2xx responses:
```json
{ "error": { "code": "string", "message": "human-readable description" } }
```
Include HTTP status codes aligned with the error condition (e.g., 400 validation, 404 not found, 500 internal error).

## Frontend integration checklist
- Health check: `GET /api/health`.
- Conversations CRUD: list/create/get/update/delete.
- Messages: list and send; support `options.useDocs` flag and optional `attachmentIds`.
- Streaming: handle SSE `message.delta`, `message.citations`, `message.done`, `error`.
- Attachments: list per conversation, upload multipart, fetch raw content, optional preview.
- Optional ingestion status endpoint for upload progress.
- Expect `AnswerMeta` and `citations` on assistant messages.

## Mapping from Streamlit functions
| Existing Streamlit action | HTTP route |
| --- | --- |
| Start new chat | `POST /api/conversations` |
| Load chat history | `GET /api/conversations/{conversationId}/messages` |
| Rename chat | `PATCH /api/conversations/{conversationId}` |
| Delete chat | `DELETE /api/conversations/{conversationId}` |
| Upload document | `POST /api/conversations/{conversationId}/attachments` |
| Check ingestion status (if applicable) | `GET /api/attachments/{attachmentId}/status` |
| Retrieve documents for chat | `GET /api/conversations/{conversationId}/attachments` |
| Send question (non-stream) | `POST /api/conversations/{conversationId}/messages` |
| Send question (stream) | `POST /api/conversations/{conversationId}/messages:stream` |
| Fetch answer with citations | SSE `message.citations` + final `message.done` payload |
