"use client";

import * as React from "react";
import {
  MoreHorizontal,
  Pin as PinIcon,
  PinOff,
  Plus,
  Stethoscope,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { badgeVariants } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Attachment, Conversation } from "@/components/chat/chat-app";

type SidebarProps = {
  pinnedConversations: Conversation[];
  conversations: Conversation[];
  activeId: string;
  attachments: Attachment[];
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onSelectAttachment: (attachment: Attachment) => void;
  onTogglePin: (id: string) => void;
  onDeleteConversation: (id: string) => void;
};

export default function Sidebar({
  pinnedConversations,
  conversations,
  activeId,
  attachments,
  onNewChat,
  onSelectConversation,
  onSelectAttachment,
  onTogglePin,
  onDeleteConversation
}: SidebarProps) {
  const handleKeyPress = (event: React.KeyboardEvent, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectConversation(id);
    }
  };

  const renderConversation = (conversation: Conversation) => {
    const lastMessage =
      conversation.messages[conversation.messages.length - 1];
    const isActive = conversation.id === activeId;

    return (
      <div
        key={conversation.id}
        role="button"
        tabIndex={0}
        className={cn(
          "group relative w-full rounded-2xl border px-4 py-3 text-left transition",
          isActive
            ? "border-active-border bg-active-bg text-active-text shadow-glow"
            : "border-chip/60 bg-chip/70 text-chip-text hover:bg-chip/80"
        )}
        onClick={() => onSelectConversation(conversation.id)}
        onKeyDown={(event) => handleKeyPress(event, conversation.id)}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
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
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "rounded-full p-1 text-muted transition hover:bg-accent/50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong/40",
                  "opacity-100 md:opacity-0 md:group-hover:opacity-100"
                )}
                aria-label="Conversation actions"
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="end"
              sideOffset={8}
              onClick={(event) => event.stopPropagation()}
              className="z-50"
            >
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  onTogglePin(conversation.id);
                }}
              >
                {conversation.isPinned ? (
                  <PinOff className="h-4 w-4" />
                ) : (
                  <PinIcon className="h-4 w-4" />
                )}
                <span>{conversation.isPinned ? "Unpin" : "Pin"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onSelect={(event) => {
                  event.preventDefault();
                  onDeleteConversation(conversation.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

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
        <div className="space-y-4">
          {pinnedConversations.length > 0 ? (
            <div className="space-y-2">
              <div className="px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                Pinned
              </div>
              {pinnedConversations.map(renderConversation)}
            </div>
          ) : null}
          <div className="space-y-2">
            {conversations.map(renderConversation)}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
