import { motion, AnimatePresence } from "motion/react";
import { MapPin, Calendar, CalendarCheck, Cog } from "lucide-react";
import type { ReactNode } from "react";

/** Tool metadata for rendering the correct icon and accent colour. */
interface ToolMeta {
  icon: ReactNode;
  accentFrom: string;
  accentTo: string;
  glowColor: string;
  iconBg: string;
}

const TOOL_MAP: Record<string, ToolMeta> = {
  get_zone_and_price: {
    icon: <MapPin size={13} strokeWidth={2.2} />,
    accentFrom: "from-emerald-400/80",
    accentTo: "to-teal-500/60",
    glowColor: "shadow-emerald-500/20",
    iconBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  },
  get_availability: {
    icon: <Calendar size={13} strokeWidth={2.2} />,
    accentFrom: "from-blue-400/80",
    accentTo: "to-indigo-500/60",
    glowColor: "shadow-blue-500/20",
    iconBg: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  },
  create_booking: {
    icon: <CalendarCheck size={13} strokeWidth={2.2} />,
    accentFrom: "from-violet-400/80",
    accentTo: "to-purple-500/60",
    glowColor: "shadow-violet-500/20",
    iconBg: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  },
};

const FALLBACK_META: ToolMeta = {
  icon: <Cog size={13} strokeWidth={2.2} />,
  accentFrom: "from-blue-400/80",
  accentTo: "to-cyan-500/60",
  glowColor: "shadow-blue-500/20",
  iconBg: "bg-blue-500/15 text-blue-400 border-blue-500/25",
};

interface ToolStatusPillProps {
  label: string;
  tool?: string | null;
  /** Use "compact" inside message bubbles, "full" in the empty typing state */
  variant?: "full" | "compact";
}

export function ToolStatusPill({ label, tool, variant = "full" }: ToolStatusPillProps) {
  const meta = (tool && TOOL_MAP[tool]) || FALLBACK_META;
  const isCompact = variant === "compact";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={label}
        initial={{ opacity: 0, y: 6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.96 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`
          tool-status-pill relative overflow-hidden
          flex items-center
          ${isCompact ? "gap-2 px-2.5 py-1.5 rounded-lg mt-2.5" : "gap-2.5 px-3 py-2 rounded-xl"}
          bg-gray-900/70 backdrop-blur-sm
          border border-gray-700/40
          shadow-md ${meta.glowColor}
          w-fit
        `}
      >
        {/* Shimmer overlay */}
        <div className="tool-shimmer absolute inset-0 pointer-events-none" />

        {/* Subtle gradient left accent */}
        <div className={`absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b ${meta.accentFrom} ${meta.accentTo} rounded-l-xl`} />

        {/* Icon container with micro-animation */}
        <motion.span
          className={`
            relative flex items-center justify-center shrink-0 rounded-md border
            ${meta.iconBg}
            ${isCompact ? "w-5 h-5" : "w-6 h-6"}
          `}
          animate={{ rotate: [0, 0, -8, 8, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 0.6, 0.7, 0.8],
          }}
        >
          {meta.icon}
        </motion.span>

        {/* Label text */}
        <span className={`
          relative font-medium leading-none tracking-wide text-gray-300
          ${isCompact ? "text-[11px]" : "text-[12px]"}
        `}>
          {label}
        </span>

        {/* Animated trailing dots */}
        <span className="relative flex items-center gap-[2.5px] shrink-0 ml-0.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className={`block rounded-full bg-gray-500 ${isCompact ? "w-[3px] h-[3px]" : "w-1 h-1"}`}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
