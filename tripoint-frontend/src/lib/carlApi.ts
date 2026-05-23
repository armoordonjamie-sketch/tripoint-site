/**
 * Low-level API layer.
 * Sends FormData to POST /chat and consumes the SSE stream,
 * calling the provided callbacks for each event type.
 *
 * In development the Vite proxy buffers SSE streams, swallowing tool_status
 * events before they can be rendered. We bypass it by connecting directly to
 * the FastAPI backend on port 8000. In production the empty prefix is used so
 * the request goes to the same origin.
 */

const _API_BASE =
  import.meta.env.DEV ? "http://localhost:8000" : "/api";

export interface StreamCallbacks {
  onChunk: (content: string) => void;
  onToolStatus: (label: string, tool: string) => void;
  onDone: (data: {
    promptTokens?: number;
    completionTokens?: number;
    tokensUsed?: number;
    toolCalled?: string | null;
    attachmentIds?: number[];
    leadCaptured?: boolean;
  }) => void;
  onError: (message: string) => void;
}

/**
 * Post a chat message (with optional files) and stream the response.
 * Returns a cleanup / abort function.
 */
export function streamChat(
  sessionId: string,
  message: string,
  files: File[],
  callbacks: StreamCallbacks
): () => void {
  const controller = new AbortController();

  const body = new FormData();
  body.append("session_id", sessionId);
  body.append("message", message);
  for (const file of files) {
    body.append("files", file);
  }

  fetch(`${_API_BASE}/chat`, {
    method: "POST",
    body,
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok || !response.body) {
        const text = await response.text().catch(() => "Unknown error");
        callbacks.onError(text);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const pump = async (): Promise<void> => {
        const { done, value } = await reader.read();
        if (done) return;

        buffer += decoder.decode(value, { stream: true });
        // Normalise \r\n → \n so the block delimiter \n\n always matches.
        const blocks = buffer.replace(/\r\n/g, "\n").split("\n\n");
        buffer = blocks.pop() ?? "";

        for (const block of blocks) {
          if (block.includes("tool_status")) {
            console.debug("[SSE] tool_status block:", JSON.stringify(block));
          }
          parseSSEBlock(block, callbacks);
        }

        return pump();
      };

      await pump();
    })
    .catch((err: unknown) => {
      if (err instanceof Error && err.name === "AbortError") return;
      callbacks.onError("Connection error. Please try again.");
    });

  return () => controller.abort();
}

function parseSSEBlock(block: string, callbacks: StreamCallbacks) {
  let eventType = "";
  let dataStr = "";

  for (const rawLine of block.split("\n")) {
    const line = rawLine.replace(/\r$/, "");
    if (line.startsWith("event: ")) {
      eventType = line.slice(7).trim();
    } else if (line.startsWith("data: ")) {
      dataStr = line.slice(6).trim();
    }
  }

  if (!eventType || !dataStr) return;

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(dataStr);
  } catch {
    return;
  }

  if (eventType === "chunk") {
    const content = typeof data.content === "string" ? data.content : "";
    if (content) callbacks.onChunk(content);
  } else if (eventType === "tool_status") {
    const label = typeof data.label === "string" ? data.label : "Working...";
    const tool = typeof data.tool === "string" ? data.tool : "";
    console.debug("[SSE] tool_status parsed:", label, tool);
    callbacks.onToolStatus(label, tool);
  } else if (eventType === "done") {
    callbacks.onDone({
      promptTokens:
        typeof data.prompt_tokens === "number" ? data.prompt_tokens : undefined,
      completionTokens:
        typeof data.completion_tokens === "number"
          ? data.completion_tokens
          : undefined,
      tokensUsed:
        typeof data.tokens_used === "number" ? data.tokens_used : undefined,
      toolCalled:
        typeof data.tool_called === "string" ? data.tool_called : null,
      attachmentIds: Array.isArray(data.attachment_ids)
        ? (data.attachment_ids as number[])
        : [],
      leadCaptured: data.lead_captured === true,
    });
  } else if (eventType === "error") {
    const message =
      typeof data.message === "string"
        ? data.message
        : "Carl is temporarily unavailable. Please call 020 8058 6095.";
    callbacks.onError(message);
  }
}
