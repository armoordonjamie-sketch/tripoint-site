import { create } from "zustand";

export type MessageRole = "user" | "assistant" | "error";

export interface Attachment {
  name: string;
  type: string;
  /** Object URL for local preview (user files) or /attachments/{id} URL */
  url: string;
  id?: number;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  /** True while streaming from Carl */
  streaming?: boolean;
  /** Transient label shown during tool resolution (e.g. "Checking availability...") */
  toolStatus?: string | null;
  /** Tool function name for icon rendering (e.g. "get_zone_and_price") */
  toolName?: string | null;
  attachments?: Attachment[];
  promptTokens?: number;
  completionTokens?: number;
  tokensUsed?: number;
  toolCalled?: string | null;
}

export interface PendingFile {
  file: File;
  previewUrl: string;
}

interface ChatState {
  sessionId: string;
  messages: Message[];
  pendingFiles: PendingFile[];
  isStreaming: boolean;
  leadCaptured: boolean;

  /** Called when the user sends a message - adds the user bubble. */
  addUserMessage: (content: string, attachments?: Attachment[]) => string;

  /** Creates a streaming assistant bubble and returns its id. */
  beginAssistantMessage: () => string;

  /** Appends a chunk to an in-progress assistant bubble. */
  appendChunk: (id: string, chunk: string) => void;

  /** Marks the assistant bubble as done and writes token counts. */
  finaliseAssistantMessage: (
    id: string,
    opts: {
      promptTokens?: number;
      completionTokens?: number;
      tokensUsed?: number;
      toolCalled?: string | null;
    }
  ) => void;

  /** Replaces the assistant streaming bubble with an error bubble. */
  setMessageError: (id: string, message: string) => void;

  /** Sets a transient tool-status label on a streaming bubble (e.g. "Checking availability...") */
  setToolStatus: (id: string, label: string, tool: string) => void;

  setLeadCaptured: () => void;

  addPendingFile: (file: File) => void;
  removePendingFile: (index: number) => void;
  clearPendingFiles: () => void;
  setStreaming: (v: boolean) => void;
}

function uuid() {
  return crypto.randomUUID();
}

export const useChatStore = create<ChatState>((set) => ({
  sessionId: uuid(),
  messages: [],
  pendingFiles: [],
  isStreaming: false,
  leadCaptured: false,

  addUserMessage(content, attachments) {
    const id = uuid();
    set((s) => ({
      messages: [
        ...s.messages,
        { id, role: "user", content, attachments, timestamp: new Date() },
      ],
    }));
    return id;
  },

  beginAssistantMessage() {
    const id = uuid();
    set((s) => ({
      messages: [
        ...s.messages,
        { id, role: "assistant", content: "", streaming: true, timestamp: new Date() },
      ],
    }));
    return id;
  },

  appendChunk(id, chunk) {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + chunk } : m
      ),
    }));
  },

  finaliseAssistantMessage(id, opts) {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id
          ? {
              ...m,
              streaming: false,
              toolStatus: null,
              toolName: null,
              promptTokens: opts.promptTokens,
              completionTokens: opts.completionTokens,
              tokensUsed: opts.tokensUsed,
              toolCalled: opts.toolCalled,
            }
          : m
      ),
    }));
  },

  setMessageError(id, message) {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id
          ? { ...m, role: "error" as MessageRole, content: message, streaming: false }
          : m
      ),
    }));
  },

  addPendingFile(file) {
    const previewUrl = URL.createObjectURL(file);
    set((s) => ({
      pendingFiles: [...s.pendingFiles, { file, previewUrl }],
    }));
  },

  removePendingFile(index) {
    set((s) => {
      const next = [...s.pendingFiles];
      URL.revokeObjectURL(next[index].previewUrl);
      next.splice(index, 1);
      return { pendingFiles: next };
    });
  },

  clearPendingFiles() {
    set((s) => {
      s.pendingFiles.forEach((pf) => URL.revokeObjectURL(pf.previewUrl));
      return { pendingFiles: [] };
    });
  },

  setStreaming(v) {
    set({ isStreaming: v });
  },

  setToolStatus(id, label, tool) {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, toolStatus: label, toolName: tool } : m
      ),
    }));
  },

  setLeadCaptured() {
    set({ leadCaptured: true });
  },
}));
