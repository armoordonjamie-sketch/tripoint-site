import { useContext } from 'react';
import { ToastContext, type ToastContextValue } from '@/components/toast-context';

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        return {
            toast: (message: string) => {
                console.warn('Toast:', message);
            },
        };
    }
    return ctx;
}
