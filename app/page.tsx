import ChatApp from "@/components/chat/chat-app";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-[28px] border border-border bg-panel/70 shadow-soft backdrop-blur">
        <ChatApp />
      </div>
    </main>
  );
}
