interface TokenBadgeProps {
  promptTokens?: number;
  completionTokens?: number;
  tokensUsed?: number;
  toolCalled?: string | null;
}

const isDev = import.meta.env.DEV;

export function TokenBadge({
  promptTokens,
  completionTokens,
  tokensUsed,
  toolCalled,
}: TokenBadgeProps) {
  if (!isDev) return null;
  if (tokensUsed == null && promptTokens == null) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {promptTokens != null && (
        <span className="text-[10px] text-gray-500 bg-gray-800/60 rounded px-1.5 py-0.5 font-mono">
          in {promptTokens}
        </span>
      )}
      {completionTokens != null && (
        <span className="text-[10px] text-gray-500 bg-gray-800/60 rounded px-1.5 py-0.5 font-mono">
          out {completionTokens}
        </span>
      )}
      {tokensUsed != null && (
        <span className="text-[10px] text-gray-500 bg-gray-800/60 rounded px-1.5 py-0.5 font-mono">
          total {tokensUsed}
        </span>
      )}
      {toolCalled && (
        <span className="text-[10px] text-blue-400/70 bg-blue-950/40 rounded px-1.5 py-0.5 font-mono">
          ⚙ {toolCalled}
        </span>
      )}
    </div>
  );
}
