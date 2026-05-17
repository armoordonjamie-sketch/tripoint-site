import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ViewportScaledFitProps = {
    children: ReactNode;
    className?: string;
    /** Pixels reserved below the clip (margins + typical safe-area). */
    bottomGap?: number;
    /** When true, never scale (normal document flow). */
    disabled?: boolean;
};

function viewportHeight(): number {
    if (typeof window === 'undefined') return 0;
    return window.visualViewport?.height ?? window.innerHeight;
}

/**
 * Below the `lg` breakpoint, measures this block vs the visible viewport and
 * applies a uniform `transform: scale()` with a clipped height so the subtree
 * dynamically fits on screen as the user scrolls, resizes, or changes steps.
 */
export function ViewportScaledFit({
    children,
    className,
    bottomGap = 24,
    disabled = false,
}: ViewportScaledFitProps) {
    const clipRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [clipHeight, setClipHeight] = useState<number | undefined>(undefined);
    const frameRef = useRef<number | null>(null);

    const measure = useCallback(() => {
        if (disabled) {
            setScale(1);
            setClipHeight(undefined);
            return;
        }

        const clip = clipRef.current;
        const content = contentRef.current;
        if (!clip || !content) return;

        if (window.matchMedia('(min-width: 1024px)').matches) {
            setScale(1);
            setClipHeight(undefined);
            return;
        }

        const vh = viewportHeight();
        const top = clip.getBoundingClientRect().top;
        // Scheduler not meaningfully in view — keep natural layout until user scrolls to it
        if (top > vh - 16) {
            setScale(1);
            setClipHeight(undefined);
            return;
        }

        const available = Math.max(140, vh - top - bottomGap);

        const naturalH = content.offsetHeight;
        const naturalW = content.scrollWidth;
        const maxW = clip.clientWidth;
        if (naturalH <= 0 || maxW <= 0) return;

        const scaleW = maxW / naturalW;
        const scaleH = available / naturalH;
        const next = Math.min(1, scaleH, scaleW);

        setScale(next);
        setClipHeight(next < 0.999 ? Math.ceil(naturalH * next) : undefined);
    }, [bottomGap, disabled]);

    const scheduleMeasure = useCallback(() => {
        if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(() => {
            frameRef.current = null;
            measure();
        });
    }, [measure]);

    useLayoutEffect(() => {
        if (disabled) return;

        const clip = clipRef.current;
        const content = contentRef.current;
        if (!clip || !content) return;

        scheduleMeasure();

        const ro = new ResizeObserver(() => scheduleMeasure());
        ro.observe(content);
        ro.observe(clip);

        const vv = window.visualViewport;
        const onWin = () => scheduleMeasure();
        window.addEventListener('resize', onWin);
        vv?.addEventListener('resize', onWin);
        vv?.addEventListener('scroll', onWin);

        return () => {
            ro.disconnect();
            window.removeEventListener('resize', onWin);
            vv?.removeEventListener('resize', onWin);
            vv?.removeEventListener('scroll', onWin);
            if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
        };
    }, [disabled, scheduleMeasure]);

    const scaled = scale < 0.999;

    return (
        <div
            ref={clipRef}
            className={cn('w-full overflow-hidden', className)}
            style={clipHeight != null ? { height: clipHeight } : undefined}
        >
            <div
                ref={contentRef}
                className="w-full"
                style={
                    scaled
                        ? {
                              transform: `scale(${scale})`,
                              transformOrigin: 'top center',
                          }
                        : undefined
                }
            >
                {children}
            </div>
        </div>
    );
}
