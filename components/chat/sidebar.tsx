"use client";

import * as React from "react";
import { Plus, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { badgeVariants } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Attachment, Conversation } from "@/components/chat/chat-app";

type SidebarProps = {
  conversations: Conversation[];
  activeId: string;
  attachments: Attachment[];
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onSelectAttachment: (attachment: Attachment) => void;
};

export default function Sidebar({
  conversations,
  activeId,
  attachments,
  onNewChat,
  onSelectConversation,
  onSelectAttachment
}: SidebarProps) {
  return (
    <aside className="flex h-full min-h-0 w-[clamp(220px,22vw,320px)] min-w-[220px] max-w-[320px] shrink-0 flex-col border-r border-border bg-panel/80">
      <div className="px-5 pb-4 pt-5">
        <div className="flex items-center gap-3 text-ink">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/70 text-ink">
            <Stethoscope className="h-5 w-5" />
          </span>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Studio
            </div>
            <div className="text-lg font-semibold">Doc. Chat</div>
          </div>
        </div>
        <Button
          className="mt-4 w-full justify-center bg-accent text-accent-contrast shadow-glow hover:bg-accent/90"
          onClick={onNewChat}
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>
      </div>

      <div className="px-5 pb-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
          Attachments
        </div>
        <div className="mt-3 flex max-w-full gap-2 overflow-x-auto pb-2">
          {attachments.length === 0 ? (
            <div className="text-xs text-muted">
              No files attached to this conversation.
            </div>
          ) : (
            attachments.map((attachment) => (
              <button
                key={attachment.id}
                type="button"
                onClick={() => onSelectAttachment(attachment)}
                className={cn(
                  badgeVariants(),
                  "shrink-0 cursor-pointer transition hover:border-accent hover:bg-accent/60 hover:text-ink"
                )}
              >
                {attachment.name}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-5 pb-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
          Conversations
        </span>
      </div>

      <ScrollArea className="flex-1 px-3 pb-6">
        <div className="space-y-2">
          {conversations.map((conversation) => {
            const lastMessage =
              conversation.messages[conversation.messages.length - 1];
            const isActive = conversation.id === activeId;

            return (
              <button
                key={conversation.id}
                className={cn(
                  "w-full rounded-2xl border px-4 py-3 text-left transition",
                  isActive
                    ? "border-active-border bg-active-bg text-active-text shadow-glow"
                    : "border-chip/60 bg-chip/70 text-chip-text hover:bg-chip/80"
                )}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div
                  className={cn(
                    "text-sm font-semibold",
                    isActive ? "text-active-text" : "text-ink"
                  )}
                >
                  {conversation.title}
                </div>
                <div
                  className={cn(
                    "mt-1 text-xs",
                    isActive ? "text-active-text/80" : "text-muted"
                  )}
                >
                  {lastMessage?.content ?? "No messages yet."}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}
