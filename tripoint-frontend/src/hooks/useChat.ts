import { useRef, useCallback } from "react";
import { useChatStore } from "../store/chatStore";
import { streamChat } from "../lib/carlApi";

export function useChat() {
  const store = useChatStore();
  const abortRef = useRef<(() => void) | null>(null);

  const send = useCallback(
    (text: string) => {
      if (store.isStreaming) return;

      const trimmed = text.trim();
      const files = store.pendingFiles.map((pf) => pf.file);

      if (!trimmed && files.length === 0) return;

      const attachments = files.map((f) => ({
        name: f.name,
        type: f.type,
        url: "",
      }));

      store.addUserMessage(trimmed, attachments);
      store.clearPendingFiles();
      store.setStreaming(true);

      // Create the assistant bubble immediately so the typing indicator
      // appears right away, even before the first SSE chunk arrives.
      const assistantId = store.beginAssistantMessage();

      abortRef.current = streamChat(store.sessionId, trimmed, files, {
        onChunk(content) {
          store.appendChunk(assistantId, content);
        },
        onToolStatus(label, tool) {
          store.setToolStatus(assistantId, label, tool);
        },
        onDone(data) {
          store.finaliseAssistantMessage(assistantId, {
            promptTokens: data.promptTokens,
            completionTokens: data.completionTokens,
            tokensUsed: data.tokensUsed,
            toolCalled: data.toolCalled,
          });
          if (data.leadCaptured) {
            store.setLeadCaptured();
          }
          store.setStreaming(false);
          abortRef.current = null;
        },
        onError(message) {
          // Show the error inline as a chat bubble rather than a toast.
          store.setMessageError(
            assistantId,
            message || "Carl is temporarily unavailable. Please call 020 8058 6095."
          );
          store.setStreaming(false);
          abortRef.current = null;
        },
      });
    },
    [store]
  );

  const abort = useCallback(() => {
    abortRef.current?.();
    abortRef.current = null;
    store.setStreaming(false);
  }, [store]);

  return { send, abort, isStreaming: store.isStreaming };
}
