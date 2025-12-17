# LLM Frontend

A clean, streaming-ready chat UI inspired by ChatGPT and Claude. Built with Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui components.

## Requirements

- Node.js 18+
- npm, pnpm, or yarn

## Quick start

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Environment variables

The app reads an optional API base URL for future backend integration:

```
NEXT_PUBLIC_API_BASE_URL=
```

## Notes

- The chat flow uses a mock streaming API (`lib/mockApi.ts`) with TODOs for real backend integration.
- File uploads are UI-only for now and are stored in client state.
