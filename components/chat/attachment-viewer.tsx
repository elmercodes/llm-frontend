"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Attachment } from "@/components/chat/chat-app";

type AttachmentViewerProps = {
  attachment: Attachment;
  onClose: () => void;
};

export default function AttachmentViewer({
  attachment,
  onClose
}: AttachmentViewerProps) {
  const [textContent, setTextContent] = React.useState<string>("");
  const [isLoadingText, setIsLoadingText] = React.useState(false);
  const isPdf = attachment.type === "pdf";
  const isTxt = attachment.type === "txt";

  React.useEffect(() => {
    if (!isTxt) {
      setTextContent("");
      return;
    }

    if (!attachment.url) {
      setTextContent("Preview unavailable.");
      return;
    }

    let isActive = true;
    setIsLoadingText(true);
    fetch(attachment.url)
      .then((response) => response.text())
      .then((text) => {
        if (isActive) {
          setTextContent(text);
        }
      })
      .catch(() => {
        if (isActive) {
          setTextContent("Unable to load text preview.");
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingText(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [attachment.type, attachment.url, isTxt]);

  return (
    <aside className="flex h-full min-h-0 w-[min(100vw,clamp(320px,30vw,520px))] shrink-0 flex-col border-l border-border bg-panel/80">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Back to chats"
          onClick={onClose}
          className="h-9 w-9 rounded-xl border border-border bg-card/80 text-ink shadow-glow hover:bg-accent/50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex min-w-0 flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
            Attachment
          </span>
          <span className="truncate text-sm font-semibold text-ink">
            {attachment.name}
          </span>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {isPdf ? (
            attachment.url ? (
              <div className="h-[70vh] w-full overflow-hidden rounded-2xl border border-border bg-card">
                <iframe
                  title={attachment.name}
                  src={attachment.url}
                  className="h-full w-full"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-panel/60 p-6 text-sm text-muted">
                Preview unavailable.
              </div>
            )
          ) : null}
          {isTxt ? (
            <div className="rounded-2xl border border-border bg-card p-4">
              <pre className="whitespace-pre-wrap text-sm text-ink">
                {isLoadingText ? "Loading text preview..." : textContent}
              </pre>
            </div>
          ) : null}
          {!isPdf && !isTxt ? (
            <div className="rounded-2xl border border-dashed border-border bg-panel/60 p-6 text-sm text-muted">
              <div className="font-semibold text-ink">{attachment.name}</div>
              <div className="mt-2">Preview not supported yet.</div>
            </div>
          ) : null}
        </div>
      </ScrollArea>
    </aside>
  );
}
