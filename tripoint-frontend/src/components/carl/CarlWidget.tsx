import { useState, useEffect } from "react";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import { X } from "lucide-react";
import { ChatWindow } from "./ChatWindow";
import { useChatStore } from "../../store/chatStore";

export function CarlWidget() {
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showHelper, setShowHelper] = useState(false);
  const messages = useChatStore((s) => s.messages);
  const iconControls = useAnimation();

  useEffect(() => {
    // Show helper pill after 2.5 seconds
    const t = setTimeout(() => setShowHelper(true), 2500);
    // Hide it after 10 seconds to not be annoying
    const t2 = setTimeout(() => setShowHelper(false), 10000);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);

  // Periodic shake animation
  useEffect(() => {
    if (open) return;

    const interval = setInterval(() => {
      iconControls.start({
        rotate: [0, -12, 12, -12, 12, 0],
        transition: { duration: 0.6, ease: "easeInOut" }
      });
    }, 6000); // Shake every 6 seconds
    
    return () => clearInterval(interval);
  }, [open, iconControls]);

  // Set unread dot when an assistant message completes while widget is closed.
  useEffect(() => {
    if (open) return;
    const last = messages[messages.length - 1];
    if (last && last.role === "assistant" && !last.streaming) {
      setHasUnread(true);
    }
  }, [messages, open]);

  const handleOpen = () => {
    setOpen(true);
    setHasUnread(false);
    setShowHelper(false);
  };

  const handleClose = () => setOpen(false);

  return (
    <>
      {/* Chat popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            style={{ transformOrigin: "bottom right" }}
            className={[
              // Full-screen on mobile, constrained popup on sm+
              "fixed z-[9999]",
              "max-sm:inset-0 max-sm:rounded-none",
              "sm:bottom-24 sm:right-4 sm:w-[380px] sm:h-[560px] sm:rounded-2xl",
              "flex flex-col overflow-hidden",
              "border border-gray-800/70",
              "bg-[#0a0a0a] shadow-2xl shadow-black/60",
            ].join(" ")}
          >
            <ChatWindow onClose={handleClose} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger container */}
      {/* max-lg applies up to 1024px, same breakpoint where MobileStickyCTA is visible. */}
      <div className={`fixed z-[9999] max-lg:bottom-[calc(180px+env(safe-area-inset-bottom,0px))] lg:bottom-6 right-4 flex items-center justify-end gap-3 pointer-events-none ${open ? "max-sm:hidden" : ""}`}>
        
        {/* Helper Pill */}
        <AnimatePresence>
          {showHelper && !open && (
            <motion.div
              initial={{ opacity: 0, x: 15, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, x: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg border border-white/10 text-xs sm:text-sm font-medium whitespace-nowrap pointer-events-auto cursor-pointer flex items-center gap-1.5 sm:gap-2"
              style={{
                background: "rgba(15, 23, 42, 0.85)",
                backdropFilter: "blur(12px)",
                color: "#f8fafc"
              }}
              onClick={handleOpen}
            >
              <motion.span 
                className="text-base origin-bottom-right inline-block"
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatType: "loop" }}
              >
                👋
              </motion.span>
              <span>Hi, I'm Carl!</span>
              
              {/* Subtle right arrow */}
              <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 border-[6px] border-transparent border-l-[#0f172a]/80" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trigger button */}
        <motion.button
          onClick={open ? handleClose : handleOpen}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.93 }}
          aria-label={open ? "Close chat" : "Chat with Carl"}
          className="w-14 h-14 lg:w-20 lg:h-20 flex items-center justify-center bg-transparent pointer-events-auto relative shrink-0"
        >
          {/* Unread dot */}
          {hasUnread && !open && (
            <span className="absolute top-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-blue-500 border-2 border-white animate-pulse z-10" />
          )}

          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="close"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-blue-600/90 shadow-lg"
              >
                <X size={20} className="text-white" />
              </motion.span>
            ) : (
              <motion.div
                key="mascot"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full"
              >
                <motion.picture
                  animate={iconControls}
                  className="w-full h-full block"
                >
                  <source srcSet="/carl-icon.webp" type="image/webp" />
                  <img
                    src="/carl-icon-fallback.png"
                    alt="Chat with Carl"
                    width={98}
                    height={98}
                    className="w-full h-full object-contain drop-shadow-xl"
                    draggable={false}
                  />
                </motion.picture>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
}
