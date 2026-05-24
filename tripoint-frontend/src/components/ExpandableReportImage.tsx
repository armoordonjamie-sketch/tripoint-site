import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ZoomIn, X } from 'lucide-react';
import { OptimizedImage } from '@/components/OptimizedImage';
import { cn } from '@/lib/utils';

interface ExpandableReportImageProps {
    src: string;
    alt: string;
    className?: string;
    imgClassName?: string;
    priority?: boolean;
    width?: number;
    height?: number;
}

export function ExpandableReportImage({
    src,
    alt,
    className,
    imgClassName,
    priority,
    width,
    height,
}: ExpandableReportImageProps) {
    const [open, setOpen] = useState(false);
    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        document.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [open, close]);

    const lightbox =
        open &&
        typeof document !== 'undefined' &&
        createPortal(
            <div
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
                role="dialog"
                aria-modal="true"
                aria-label={`Enlarged view: ${alt}`}
                onClick={close}
            >
                <button
                    type="button"
                    className="absolute right-4 top-4 rounded-full border border-border-default bg-surface-elevated p-2.5 text-text-primary shadow-lg transition hover:bg-surface-alt"
                    aria-label="Close enlarged image"
                    onClick={(e) => {
                        e.stopPropagation();
                        close();
                    }}
                >
                    <X className="h-5 w-5" />
                </button>
                <div
                    className="flex max-h-[90vh] max-w-full items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                    role="presentation"
                >
                    <img
                        src={src}
                        alt={alt}
                        className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
                    />
                </div>
            </div>,
            document.body,
        );

    return (
        <>
            <div className={cn('group relative', className)}>
                <button
                    type="button"
                    className="block w-full cursor-zoom-in rounded-[inherit] text-left outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    onClick={() => setOpen(true)}
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    aria-label={`Enlarge image: ${alt}`}
                >
                    <span className="relative block overflow-hidden rounded-[inherit]">
                        <OptimizedImage
                            src={src}
                            alt={alt}
                            className={cn('w-full', imgClassName)}
                            priority={priority}
                            width={width}
                            height={height}
                        />
                        <span
                            className="pointer-events-none absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white shadow-md ring-1 ring-white/25 backdrop-blur-sm transition group-hover:bg-black/75 group-focus-within:ring-2 group-focus-within:ring-brand"
                            aria-hidden
                        >
                            <ZoomIn className="h-4 w-4" strokeWidth={2.25} />
                        </span>
                    </span>
                </button>
            </div>
            {lightbox}
        </>
    );
}
