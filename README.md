# Doc. Chat

Doc. Chat is a ChatGPT-style document-aware chat interface built with Next.js. It supports multi-conversation chat, theme switching, responsive sidebars, and an in-app document viewer for PDFs, TXT files, and DOCX files.

The UI is designed to feel familiar to ChatGPT while remaining lightweight, extensible, and developer-friendly.

## ✨ Features

### 💬 Chat Experience

- Full-screen, responsive chat layout (ChatGPT-style)
- Independent scrolling:
  - Conversation sidebar
  - Chat message history
  - Sticky message composer
- Conversations automatically reorder by most recent activity
- Active conversation is visually highlighted (theme-aware)

### 📂 Attachments & Document Viewer

- Click attachments to open them in a right-side document viewer
- Supported formats:
  - PDF (iframe/embed)
  - TXT (rendered text)
  - DOCX (client-side preview)
- Attachment viewer replaces the left sidebar to maximize space
- Back arrow restores the conversation sidebar
- Dropdown in viewer header lets you switch between all attachments in the conversation
- Dropdown always renders above document content (no z-index issues)

### 🤖 AI Model Selector

- Sidebar “AI Model” section between Attachments and Conversations
- Dropdown defaults to `gpt-5-nano`, with `Qwen3` as an alternative
- Selection is stored client-side (persisted) and ready to be passed to a backend when wired up

### 🎨 Theming

- Light mode + Dark mode
- Theme controlled via a Settings (gear) icon
- Theme selection persists across reloads
- Fully tokenized color system using CSS variables

### 📱 Responsive Design

- Sidebar widths adapt using responsive clamps
- On small screens:
  - Left sidebar collapses automatically
  - Right document viewer hides when space is insufficient
  - No horizontal scrolling or layout breakage on resize

### 🧠 UX Principles

- Only one sidebar (left or right) visible at a time
- Chat remains the primary focus at all times
- No “double scrolling” or layout jank
- Minimal UI changes, maximum clarity

### 🚧 Future Ideas (Optional)

- Search within documents
- Per-document chat context
- Drag-and-drop uploads
- Conversation export
- Auth + persistence backend

## 🧱 Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- shadcn/ui + Radix
- Client-side DOCX parsing (docx-preview / mammoth)
- Local demo assets via `/public`

## 📁 Project Structure (Simplified)

```
app/
  layout.tsx
  page.tsx
  globals.css

components/
  chat/
    chat-app.tsx
    chat-thread.tsx
    sidebar.tsx
    attachment-viewer.tsx
  ui/

lib/
  config.ts
  utils.ts
```

## 🧪 Demo Assets

For development and testing, the app includes demo attachments:

```
public/
  demo.pdf
  demo.txt
  demo.docx
```

These are used to validate the attachment viewer and file-switching behavior.

## Getting started

### Requirements

- Node.js 18+
- npm, pnpm, or yarn

### Quick start

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Configuration

The app is backend-agnostic and can run:
- **Without OpenAI (default):** uses the built-in mock streaming API with no external calls.
- **With OpenAI or another provider:** point the frontend at your backend; the UI will pass along the selected model once wired.

Optional API base URL for your backend:

```
NEXT_PUBLIC_API_BASE_URL=
```

Notes:
- Expect a future `GET /api/models` endpoint to populate the sidebar model list (currently mocked in the UI).
- The mock stream in `lib/mockApi.ts` is used when no backend is configured.
- File uploads are UI-only for now and are stored in client state.
- If your backend uses a separate embedding model (e.g., local vector DB) instead of an OpenAI embedding endpoint, keep it distinct from the chat model above; the UI only forwards the chat model selection and does not assume OpenAI embeddings.

### Wiring to your backend

When you add a backend, forward the selected model and user message. A minimal payload shape:

```json
{
  "model": "gpt-5-nano",
  "prompt": "<user text>",
  "useDocs": true
}
```

Use `NEXT_PUBLIC_API_BASE_URL` to point the frontend at your API; until then, the mock responder will stream locally.
