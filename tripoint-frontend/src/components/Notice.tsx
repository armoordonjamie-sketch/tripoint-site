import { AlertTriangle, Info, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type NoticeVariant = 'info' | 'compliance' | 'warning';

interface NoticeProps {
    children: ReactNode;
    variant?: NoticeVariant;
    className?: string;
}

const config: Record<NoticeVariant, { icon: ReactNode; border: string; bg: string; iconColor: string }> = {
    info: {
        icon: <Info className="h-5 w-5" />,
        border: 'border-brand/30',
        bg: 'bg-brand/5',
        iconColor: 'text-brand',
    },
    compliance: {
        icon: <ShieldCheck className="h-5 w-5" />,
        border: 'border-success/30',
        bg: 'bg-success/5',
        iconColor: 'text-success',
    },
    warning: {
        icon: <AlertTriangle className="h-5 w-5" />,
        border: 'border-warning/30',
        bg: 'bg-warning/5',
        iconColor: 'text-warning',
    },
};

export function Notice({ children, variant = 'info', className }: NoticeProps) {
    const { icon, border, bg, iconColor } = config[variant];

    return (
        <div
            className={cn(
                'flex items-start gap-3 rounded-xl border p-4',
                border,
                bg,
                className,
            )}
            role="note"
        >
            <span className={cn('mt-0.5 shrink-0', iconColor)}>{icon}</span>
            <div className="text-sm text-text-secondary">{children}</div>
        </div>
    );
}
