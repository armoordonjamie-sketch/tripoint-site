import { cn } from '@/lib/utils';

type DividerVariant = 'wave' | 'angle' | 'curve' | 'fade';

interface SectionDividerProps {
    variant?: DividerVariant;
    /** Color token for the fill — should match the NEXT section's background */
    fillClass?: string;
    /** Flip vertically (use at bottom of a section instead of top) */
    flip?: boolean;
    className?: string;
}

export function SectionDivider({
    variant = 'wave',
    fillClass = 'fill-surface',
    flip = false,
    className,
}: SectionDividerProps) {
    const base = cn(
        'relative z-10 -mb-px w-full overflow-hidden leading-[0]',
        flip && 'rotate-180',
        className,
    );

    if (variant === 'fade') {
        return (
            <div
                className={cn(
                    'relative z-10 h-24 md:h-32',
                    className,
                )}
                aria-hidden="true"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface" />
            </div>
        );
    }

    if (variant === 'angle') {
        return (
            <div className={base} aria-hidden="true">
                <svg
                    viewBox="0 0 1200 60"
                    preserveAspectRatio="none"
                    className={cn('block h-10 w-full md:h-16', fillClass)}
                >
                    <polygon points="0,60 1200,0 1200,60" />
                </svg>
            </div>
        );
    }

    if (variant === 'curve') {
        return (
            <div className={base} aria-hidden="true">
                <svg
                    viewBox="0 0 1200 80"
                    preserveAspectRatio="none"
                    className={cn('block h-12 w-full md:h-20', fillClass)}
                >
                    <path d="M0,80 C300,0 900,0 1200,80 L1200,80 L0,80 Z" />
                </svg>
            </div>
        );
    }

    // Default: wave
    return (
        <div className={base} aria-hidden="true">
            <svg
                viewBox="0 0 1200 80"
                preserveAspectRatio="none"
                className={cn('block h-12 w-full md:h-20', fillClass)}
            >
                <path d="M0,40 C150,80 350,0 600,40 C850,80 1050,0 1200,40 L1200,80 L0,80 Z" />
            </svg>
        </div>
    );
}
