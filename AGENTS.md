# LLM Frontend (Next.js)

Goal: Build a ChatGPT/Claude-like web UI that I can later connect to my own backend.

Tech:
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui for components
- No backend integration yet; use a mock API layer with clearly marked TODOs.

UI requirements:
- Left sidebar: conversations list + "New chat"
- Main: message thread with roles (user/assistant), markdown rendering
- Composer: multiline input, send button, enter-to-send, shift+enter newline
- File upload UI: attach files (UI only for now) on the left side (as a paperclip), show attached file chips as a scroll through option on the left sidebar as section above the conversations.
- Streaming-ready architecture (render partial assistant text)
- Add ability to change the name of the conversation.

Code quality:
- Clean, readable components
- Use env vars for API base URL (but don’t require them yet)
- Provide a README with run instructions
