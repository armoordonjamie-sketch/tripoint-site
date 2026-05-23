import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "motion/react";
import type { Message } from "../../store/chatStore";
import { TypingIndicator } from "./TypingIndicator";
import { ToolStatusPill } from "./ToolStatusPill";
import { ContactCTA, shouldShowCTA } from "./ContactCTA";
import { FileText, Image, AlertCircle } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
  showTimestamp: boolean;
}

/**
 * Strip tool-call XML artifacts that occasionally leak into the streamed text,
 * e.g. <get_availability><date>…</date></get_availability>
 * Removes any <tag>…</tag> block where the tag is a known tool name,
 * plus any stray leading/trailing whitespace left behind.
 */
const TOOL_TAG_RE = /<(get_availability|create_booking|get_zone_and_price)[\s\S]*?<\/\1>/g;

function sanitiseContent(text: string): string {
  return text.replace(TOOL_TAG_RE, "").replace(/^\s+/, "");
}

/** Format a Date as a relative string: "just now", "5 min ago", or HH:MM */
function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({ message, isLast, showTimestamp }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isError = message.role === "error";
  const isEmpty = !message.content && message.streaming;
  const showCTA =
    !isUser &&
    !isError &&
    !message.streaming &&
    isLast &&
    shouldShowCTA(message.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {/* Attachments row (user side) */}
        {isUser && message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-end mb-1">
            {message.attachments.map((att, i) => (
              <AttachmentChip key={i} name={att.name} type={att.type} />
            ))}
          </div>
        )}

        {/* Bubble — skip the bubble wrapper entirely when empty + has tool status */}
        {isEmpty && message.toolStatus ? (
          <TypingIndicator label={message.toolStatus} tool={message.toolName} />
        ) : isEmpty ? (
          <div className="bg-[#111827] border-l-2 border-blue-700 text-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed">
            <TypingIndicator />
          </div>
        ) : isError ? (
          <div className="flex items-start gap-2 bg-red-950/40 border-l-2 border-red-600 text-red-300 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-500" />
            <span>{message.content}</span>
          </div>
        ) : (
          <>
            <div
              className={
                isUser
                  ? "bg-[#1e3a5f] text-gray-100 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed"
                  : "bg-[#111827] border-l-2 border-blue-700 text-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed"
              }
            >
              {isUser ? (
                <span className="whitespace-pre-wrap">{message.content}</span>
              ) : (
                <div className="carl-prose">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {sanitiseContent(message.content)}
                  </ReactMarkdown>
                  {message.streaming && (
                    <span className="inline-block w-1.5 h-3.5 bg-blue-400 ml-0.5 animate-pulse rounded-sm align-middle" />
                  )}
                </div>
              )}
            </div>
            {/* Tool status pill — rendered OUTSIDE the bubble */}
            {message.streaming && message.toolStatus && (
              <ToolStatusPill label={message.toolStatus} tool={message.toolName} variant="compact" />
            )}
          </>
        )}

        {/* Timestamp */}
        {showTimestamp && !message.streaming && (
          <p className={`text-[10px] text-gray-600 leading-none mt-0.5 ${isUser ? "text-right" : "text-left"}`}>
            {relativeTime(message.timestamp)}
          </p>
        )}

        {/* CTA buttons */}
        {showCTA && <ContactCTA visible />}
      </div>
    </motion.div>
  );
}

function AttachmentChip({ name, type }: { name: string; type: string }) {
  const isImage = type.startsWith("image/");
  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-900/30 border border-blue-800/40 text-blue-300 text-[11px] font-medium max-w-[180px]">
      {isImage ? <Image size={11} className="shrink-0" /> : <FileText size={11} className="shrink-0" />}
      <span className="truncate">{name}</span>
    </div>
  );
}
