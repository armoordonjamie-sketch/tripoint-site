import { useEffect, useRef, useState, useCallback } from "react";
import { useChatStore } from "../../store/chatStore";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { LeadCapturedCard } from "./LeadCapturedCard";
import { useChat } from "../../hooks/useChat";
import { X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const WELCOME = "Hi, I'm Carl! Whether you have a fault, need a service, or are looking for tuning and upgrades, just tell me what you need and I'll help figure out the next step.";

const QUICK_CHIPS = [
  "What does a diagnostic cost?",
  "Is my area covered?",
  "Book a visit",
  "What vans do you work on?",
];

interface ChatWindowProps {
  onClose?: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const { messages, leadCaptured } = useChatStore();
  const { send, isStreaming } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  const hasMessages = messages.length > 0;

  // Auto-focus input on mount.
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  // Track whether the scroll area is at the bottom.
  const handleScroll = useCallback(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAtBottom(distFromBottom < 40);
  }, []);

  // Auto-scroll only when already at bottom.
  useEffect(() => {
    if (atBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, atBottom]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setAtBottom(true);
  };

  // Determine which messages should show a timestamp.
  // Show timestamp after the last message in a consecutive same-role run,
  // and always on the final message.
  const shouldShowTimestamp = (index: number) => {
    const next = messages[index + 1];
    if (!next) return true;
    return next.role !== messages[index].role;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-800/80 bg-[#0d0d0d]">
        <div className="relative shrink-0">
          <img
            src="/carl-icon.png"
            alt="Carl"
            className="w-10 h-10 object-contain"
            draggable={false}
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0d0d0d]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-gray-100 leading-tight">Carl</p>
            <span className="px-1.5 py-px text-[9px] font-bold tracking-wider uppercase rounded bg-blue-600/25 text-blue-400 border border-blue-600/40 leading-tight">
              Beta
            </span>
          </div>
          <p className="text-[11px] text-gray-500 leading-tight">TriPoint Diagnostics</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-gray-800/60 transition-colors"
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        )}
      </header>

      {/* Messages */}
      <div
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 relative"
      >
        {/* Welcome card */}
        {!hasMessages && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-3"
          >
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-[#111827] border-l-2 border-blue-700 text-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed">
                {WELCOME}
              </div>
            </div>

            {/* Quick-start chips */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="flex flex-wrap gap-2 pl-1"
            >
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => send(chip)}
                  disabled={isStreaming}
                  className="px-3 py-1.5 rounded-full border border-gray-700/70 bg-gray-900/60 text-gray-300 text-xs hover:border-blue-700/60 hover:text-gray-100 hover:bg-gray-800/60 transition-colors disabled:opacity-40"
                >
                  {chip}
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isLast={i === messages.length - 1}
            showTimestamp={shouldShowTimestamp(i)}
          />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom button */}
      <AnimatePresence>
        {!atBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={scrollToBottom}
            className="absolute bottom-[88px] right-5 z-10 w-8 h-8 rounded-full bg-gray-800 border border-gray-700/60 text-gray-400 hover:text-gray-200 hover:bg-gray-700 flex items-center justify-center shadow-lg transition-colors"
            aria-label="Scroll to bottom"
          >
            <ChevronDown size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input or lead-captured confirmation */}
      <div className="shrink-0 border-t border-gray-800/60 bg-[#0a0a0a]">
        <AnimatePresence mode="wait">
          {leadCaptured ? (
            <LeadCapturedCard key="captured" />
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="px-4 pb-4 pt-2"
            >
              <ChatInput onSend={send} disabled={isStreaming} inputRef={inputRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
