import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
}

export interface ToastContextValue {
    toast: (message: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

const TYPE_STYLES: Record<ToastType, string> = {
    success: 'border-success/40 bg-success/10 text-text-primary',
    error: 'border-danger/40 bg-danger/10 text-danger',
    info: 'border-brand/40 bg-brand/10 text-text-primary',
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<ToastItem[]>([]);
    const toast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now() + Math.random();
        setItems((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setItems((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const dismiss = useCallback((id: number) => {
        setItems((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const value = useMemo(() => ({ toast }), [toast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2 pointer-events-none">
                {items.map((t) => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg ${TYPE_STYLES[t.type]}`}
                    >
                        <p className="flex-1">{t.message}</p>
                        <button
                            type="button"
                            onClick={() => dismiss(t.id)}
                            className="shrink-0 rounded p-0.5 hover:bg-surface/50"
                            aria-label="Dismiss"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
