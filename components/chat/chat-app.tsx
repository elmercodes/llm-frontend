"use client";

import * as React from "react";
import { mockStreamAssistantReply } from "@/lib/mockApi";
import Sidebar from "@/components/chat/sidebar";
import ChatThread from "@/components/chat/chat-thread";
import Composer from "@/components/chat/composer";
import TitleEditor from "@/components/chat/title-editor";
import { Button } from "@/components/ui/button";
import { useTheme, type Theme } from "@/components/theme-provider";
import { Settings, Moon, Sun, PanelLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
};

export type Attachment = {
  id: string;
  name: string;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  attachments: Attachment[];
  createdAt: number;
  lastUpdatedAt: number;
};

const seedTimestamp = Date.now();
const seedConversations: Conversation[] = [
  {
    id: "conv-aurora",
    title: "Aurora launch plan",
    attachments: [
      { id: "file-1", name: "product-brief.pdf" },
      { id: "file-2", name: "personas.csv" }
    ],
    messages: [
      {
        id: "msg-1",
        role: "assistant",
        content:
          "Welcome back. Want me to draft a launch timeline, or start with a press-ready overview?"
      },
      {
        id: "msg-2",
        role: "user",
        content: "Start with a timeline and include key risks."
      }
    ],
    createdAt: seedTimestamp - 1000 * 60 * 60 * 2,
    lastUpdatedAt: seedTimestamp - 1000 * 60 * 45
  },
  {
    id: "conv-research",
    title: "Research recap",
    attachments: [],
    messages: [
      {
        id: "msg-3",
        role: "assistant",
        content:
          "I summarized the top findings and highlighted the gaps you can validate next week."
      }
    ],
    createdAt: seedTimestamp - 1000 * 60 * 60 * 6,
    lastUpdatedAt: seedTimestamp - 1000 * 60 * 60 * 3
  }
];

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export default function ChatApp() {
  const { theme, setTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const settingsRef = React.useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const [conversations, setConversations] = React.useState<Conversation[]>(
    seedConversations
  );
  const [activeId, setActiveId] = React.useState(seedConversations[0].id);

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeId
  );
  const sortedConversations = React.useMemo(() => {
    return [...conversations].sort((a, b) => {
      if (a.lastUpdatedAt !== b.lastUpdatedAt) {
        return b.lastUpdatedAt - a.lastUpdatedAt;
      }
      return b.createdAt - a.createdAt;
    });
  }, [conversations]);

  const updateConversation = React.useCallback(
    (id: string, updater: (conversation: Conversation) => Conversation) => {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === id ? updater(conversation) : conversation
        )
      );
    },
    []
  );

  const handleNewChat = () => {
    const now = Date.now();
    const newConversation: Conversation = {
      id: createId(),
      title: "New chat",
      attachments: [],
      messages: [
        {
          id: createId(),
          role: "assistant",
          content:
            "Tell me what you want to build, and I will help you map the next steps."
        }
      ],
      createdAt: now,
      lastUpdatedAt: now
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveId(newConversation.id);
    setIsSidebarOpen(false);
  };

  const handleRenameConversation = (id: string, title: string) => {
    const nextTitle = title.trim();
    if (!nextTitle) return;
    updateConversation(id, (conversation) => ({
      ...conversation,
      title: nextTitle
    }));
  };

  const handleAttachFiles = (files: FileList) => {
    if (!activeConversation || files.length === 0) return;
    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      id: createId(),
      name: file.name
    }));

    updateConversation(activeConversation.id, (conversation) => ({
      ...conversation,
      attachments: [...newAttachments, ...conversation.attachments]
    }));
  };

  const handleSendMessage = async (content: string) => {
    if (!activeConversation) return;
    const trimmed = content.trim();
    if (!trimmed) return;

    const conversationId = activeConversation.id;
    const now = Date.now();
    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: trimmed
    };
    const assistantMessage: Message = {
      id: createId(),
      role: "assistant",
      content: "",
      isStreaming: true
    };

    updateConversation(conversationId, (conversation) => ({
      ...conversation,
      messages: [...conversation.messages, userMessage, assistantMessage],
      lastUpdatedAt: now
    }));

    for await (const chunk of mockStreamAssistantReply(trimmed)) {
      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        messages: conversation.messages.map((message) =>
          message.id === assistantMessage.id
            ? { ...message, content: `${message.content}${chunk}` }
            : message
        )
      }));
    }

    updateConversation(conversationId, (conversation) => ({
      ...conversation,
      messages: conversation.messages.map((message) =>
        message.id === assistantMessage.id
          ? { ...message, isStreaming: false }
          : message
      )
    }));
  };

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    setIsSidebarOpen(false);
  };

  const isStreaming = Boolean(
    activeConversation?.messages.some((message) => message.isStreaming)
  );

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleThemeSelect = (value: Theme) => {
    setTheme(value);
    setIsSettingsOpen(false);
  };

  return (
    <div className="relative flex h-full w-full min-w-0 overflow-hidden border border-border bg-panel/70 shadow-soft backdrop-blur">
      <div className="hidden md:flex">
        <Sidebar
          conversations={sortedConversations}
          activeId={activeId}
          attachments={activeConversation?.attachments ?? []}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
        />
      </div>
      {isSidebarOpen ? (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="Close sidebar"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative z-10 h-full">
            <Sidebar
              conversations={sortedConversations}
              activeId={activeId}
              attachments={activeConversation?.attachments ?? []}
              onNewChat={handleNewChat}
              onSelectConversation={handleSelectConversation}
            />
          </div>
        </div>
      ) : null}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-panel/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Toggle sidebar"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="h-10 w-10 rounded-2xl border border-border bg-card/80 text-ink shadow-glow hover:bg-accent/50 md:hidden"
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <PanelLeft className="h-5 w-5" />
              )}
            </Button>
            {activeConversation ? (
              <TitleEditor
                title={activeConversation.title}
                onRename={(title) =>
                  handleRenameConversation(activeConversation.id, title)
                }
              />
            ) : (
              <div className="text-lg font-semibold">
                No conversation selected
              </div>
            )}
          </div>
          <div className="relative z-10" ref={settingsRef}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Open settings"
              aria-expanded={isSettingsOpen}
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              className="h-10 w-10 rounded-2xl border border-border bg-card/80 text-ink shadow-glow hover:bg-accent/50"
            >
              <Settings className="h-5 w-5" />
            </Button>
            {isSettingsOpen ? (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card p-3 shadow-soft">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                  Theme
                </div>
                <div className="mt-2 space-y-2">
                  {["light", "dark"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleThemeSelect(option as Theme)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition",
                        theme === option
                          ? "border-accent-strong bg-accent/40 text-ink shadow-glow"
                          : "border-border bg-panel/60 text-muted hover:bg-accent/30 hover:text-ink"
                      )}
                      aria-pressed={theme === option}
                    >
                      <span className="flex items-center gap-2 text-ink">
                        {option === "light" ? (
                          <Sun className="h-4 w-4" />
                        ) : (
                          <Moon className="h-4 w-4" />
                        )}
                        {option === "light" ? "Light" : "Dark"}
                      </span>
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          theme === option
                            ? "bg-accent-strong"
                            : "bg-border"
                        )}
                        aria-hidden
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </header>
        <ChatThread messages={activeConversation?.messages ?? []} />
        <Composer
          disabled={!activeConversation}
          isStreaming={isStreaming}
          onAttachFiles={handleAttachFiles}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
