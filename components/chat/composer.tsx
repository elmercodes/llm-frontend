"use client";

import * as React from "react";
import { Paperclip, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ComposerProps = {
  disabled?: boolean;
  isStreaming?: boolean;
  onSendMessage: (message: string) => void;
  onAttachFiles: (files: FileList) => void;
};

export default function Composer({
  disabled,
  isStreaming,
  onSendMessage,
  onAttachFiles
}: ComposerProps) {
  const [value, setValue] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!value.trim()) return;
    onSendMessage(value);
    setValue("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onAttachFiles(event.target.files);
      event.target.value = "";
    }
  };

  return (
    <div className="shrink-0 border-t border-border bg-white/80 px-5 py-4">
      <div className="flex items-end gap-3">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-white/80 text-ink shadow-glow transition hover:bg-accent/40"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          aria-label="Attach files"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />
        <div className="flex-1">
          <Textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything. Shift + Enter for a new line."
            className="min-h-[88px] resize-none"
            disabled={disabled}
          />
        </div>
        <Button
          type="button"
          onClick={handleSend}
          disabled={disabled || isStreaming || !value.trim()}
          className="h-11 rounded-2xl px-5"
        >
          <SendHorizontal className="h-4 w-4" />
          Send
        </Button>
      </div>
      <div className="mt-2 text-xs text-muted">
        Enter to send, Shift + Enter for newline.
      </div>
    </div>
  );
}
