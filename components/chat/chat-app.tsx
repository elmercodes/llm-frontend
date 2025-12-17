"use client";

import * as React from "react";
import { mockStreamAssistantReply } from "@/lib/mockApi";
import Sidebar from "@/components/chat/sidebar";
import ChatThread from "@/components/chat/chat-thread";
import Composer from "@/components/chat/composer";
import TitleEditor from "@/components/chat/title-editor";

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
};

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
    ]
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
    ]
  }
];

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export default function ChatApp() {
  const [conversations, setConversations] = React.useState<Conversation[]>(
    seedConversations
  );
  const [activeId, setActiveId] = React.useState(seedConversations[0].id);

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeId
  );

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
      ]
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveId(newConversation.id);
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
      messages: [...conversation.messages, userMessage, assistantMessage]
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

  const isStreaming = Boolean(
    activeConversation?.messages.some((message) => message.isStreaming)
  );

  return (
    <div className="flex w-full">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        attachments={activeConversation?.attachments ?? []}
        onNewChat={handleNewChat}
        onSelectConversation={setActiveId}
      />
      <div className="flex min-w-0 flex-1 flex-col min-h-0">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-white/80 px-6 py-4">
          {activeConversation ? (
            <TitleEditor
              title={activeConversation.title}
              onRename={(title) =>
                handleRenameConversation(activeConversation.id, title)
              }
            />
          ) : (
            <div className="text-lg font-semibold">No conversation selected</div>
          )}
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {isStreaming ? "Streaming" : "Ready"}
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
