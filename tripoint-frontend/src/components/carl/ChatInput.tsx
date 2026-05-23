import {
  useRef,
  useState,
  useCallback,
  type RefObject,
  type KeyboardEvent,
  type ClipboardEvent,
  type ChangeEvent,
} from "react";
import { Paperclip, Camera, Send, X, Image, FileText } from "lucide-react";
import { useChatStore } from "../../store/chatStore";
import { toast } from "sonner";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);
const MAX_SIZE_MB = 10;

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  /** Optional external ref so the parent can focus the textarea. */
  inputRef?: RefObject<HTMLTextAreaElement | null>;
}

export function ChatInput({ onSend, disabled, inputRef }: ChatInputProps) {
  const [text, setText] = useState("");
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = inputRef ?? internalRef;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { pendingFiles, addPendingFile, removePendingFile } = useChatStore();

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      for (const file of arr) {
        if (!ALLOWED_TYPES.has(file.type)) {
          toast.error(`${file.name}: only JPEG, PNG, and PDF are allowed.`);
          continue;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          toast.error(`${file.name}: file exceeds ${MAX_SIZE_MB} MB limit.`);
          continue;
        }
        addPendingFile(file);
      }
    },
    [addPendingFile]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLTextAreaElement>) => {
      const items = Array.from(e.clipboardData.items);
      const imageItems = items.filter((it) => it.type.startsWith("image/"));
      if (imageItems.length === 0) return;
      e.preventDefault();
      const files = imageItems
        .map((it) => it.getAsFile())
        .filter((f): f is File => f !== null)
        .map((f) => {
          const ext = f.type === "image/jpeg" ? "jpg" : "png";
          return new File([f], `pasted-image.${ext}`, { type: f.type });
        });
      addFiles(files);
    },
    [addFiles]
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addFiles(e.target.files);
      e.target.value = "";
    },
    [addFiles]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, pendingFiles, disabled]
  );

  const submit = useCallback(() => {
    if (disabled) return;
    if (!text.trim() && pendingFiles.length === 0) return;
    onSend(text);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [disabled, text, pendingFiles, onSend]);

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  };

  const canSend = !disabled && (text.trim().length > 0 || pendingFiles.length > 0);

  return (
    <div className="flex flex-col gap-2">
      {/* Pending file chips */}
      {pendingFiles.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-1">
          {pendingFiles.map((pf, i) => (
            <FileChip
              key={i}
              name={pf.file.name}
              type={pf.file.type}
              previewUrl={pf.previewUrl}
              onRemove={() => removePendingFile(i)}
            />
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 bg-[#111827] border border-gray-700/60 rounded-2xl px-3 py-2.5 focus-within:border-blue-700/70 transition-colors">
        {/* File attach button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="shrink-0 p-1 text-gray-500 hover:text-gray-300 disabled:opacity-40 transition-colors"
          title="Attach image or PDF"
        >
          <Paperclip size={17} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Camera button — opens device camera on mobile, file picker on desktop */}
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={disabled}
          className="shrink-0 p-1 text-gray-500 hover:text-gray-300 disabled:opacity-40 transition-colors"
          title="Take a photo"
        >
          <Camera size={17} />
        </button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Message Carl, or paste an image"
          className="flex-1 resize-none bg-transparent text-sm text-gray-100 placeholder-gray-600 outline-none leading-relaxed min-h-[22px] max-h-[160px]"
        />

        {/* Send button */}
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          className="shrink-0 p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={15} />
        </button>
      </div>

      <p className="text-center text-[10px] text-gray-700 leading-tight">
        Carl may make mistakes. For urgent issues call{" "}
        <a href="tel:02080586095" className="text-gray-600 hover:text-gray-500">
          020 8058 6095
        </a>
        .
      </p>
    </div>
  );
}

function FileChip({
  name,
  type,
  previewUrl,
  onRemove,
}: {
  name: string;
  type: string;
  previewUrl: string;
  onRemove: () => void;
}) {
  const isImage = type.startsWith("image/");
  return (
    <div className="flex items-center gap-1.5 pr-1 pl-2 py-1 rounded-lg bg-gray-800 border border-gray-700/60 text-gray-300 text-xs max-w-[200px] group">
      {isImage ? (
        <img
          src={previewUrl}
          alt={name}
          className="w-5 h-5 object-cover rounded"
        />
      ) : (
        <FileText size={14} className="text-blue-400 shrink-0" />
      )}
      <span className="truncate">{name}</span>
      <button
        onClick={onRemove}
        className="ml-1 text-gray-600 hover:text-gray-300 shrink-0 transition-colors"
        title="Remove"
      >
        <X size={12} />
      </button>
    </div>
  );
}

// suppress unused import warning for Image icon used indirectly
void Image;
