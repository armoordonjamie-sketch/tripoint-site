import { motion } from "motion/react";
import { ToolStatusPill } from "./ToolStatusPill";

interface TypingIndicatorProps {
  label?: string | null;
  tool?: string | null;
}

export function TypingIndicator({ label, tool }: TypingIndicatorProps) {
  // When a tool label is present, render the rich status pill
  if (label) {
    return <ToolStatusPill label={label} tool={tool} variant="full" />;
  }

  // Default: simple bouncing dots (no tool label — just "thinking")
  return (
    <div className="flex items-center gap-2 px-1 py-1">
      <div className="flex items-center gap-[5px]">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block w-[5px] h-[5px] rounded-full bg-gray-500"
            animate={{
              y: [0, -4, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
