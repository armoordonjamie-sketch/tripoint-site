import { Phone, MessageCircle } from "lucide-react";
import { motion } from "motion/react";

interface ContactCTAProps {
  visible: boolean;
}

export function ContactCTA({ visible }: ContactCTAProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-2 mt-3"
    >
      <a
        href="https://wa.me/442080586095"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700/20 border border-emerald-700/40 text-emerald-400 text-xs font-medium hover:bg-emerald-700/30 transition-colors"
      >
        <MessageCircle size={13} />
        WhatsApp
      </a>
      <a
        href="tel:02080586095"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/50 text-gray-300 text-xs font-medium hover:bg-gray-700/60 transition-colors"
      >
        <Phone size={13} />
        020 8058 6095
      </a>
    </motion.div>
  );
}

/** Returns true if the message text suggests a CTA is relevant. */
export function shouldShowCTA(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("020 8058 6095") ||
    lower.includes("whatsapp") ||
    lower.includes("call us") ||
    lower.includes("get in touch") ||
    lower.includes("we will be in touch") ||
    lower.includes("we will call") ||
    lower.includes("we will pick this up") ||
    lower.includes("get back to you") ||
    lower.includes("follow up") ||
    lower.includes("booked") ||
    lower.includes("booking")
  );
}
