import { motion } from "motion/react";
import { CheckCircle, Phone } from "lucide-react";

export function LeadCapturedCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
      className="flex flex-col items-center gap-4 px-6 py-6 text-center"
    >
      {/* Animated tick circle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.25 }}
        className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.25 }}
        >
          <CheckCircle size={32} className="text-emerald-400" strokeWidth={1.75} />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="flex flex-col gap-1.5"
      >
        <p className="text-gray-100 font-semibold text-base leading-snug">
          We have your details
        </p>
        <p className="text-gray-400 text-sm leading-relaxed max-w-[260px]">
          We will call you to arrange a visit. If you need us sooner, give us a ring directly.
        </p>
      </motion.div>

      <motion.a
        href="tel:02080586095"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.25 }}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
      >
        <Phone size={15} />
        020 8058 6095
      </motion.a>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
        className="text-[11px] text-gray-600"
      >
        TriPoint Diagnostics
      </motion.p>
    </motion.div>
  );
}
