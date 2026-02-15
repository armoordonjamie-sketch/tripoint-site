import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';

interface TownChipsProps {
    className?: string;
    max?: number;
}

export function TownChips({ className, max }: TownChipsProps) {
    const allTowns = siteConfig.coverageTowns;
    const towns = max ? allTowns.slice(0, max) : allTowns;

    return (
        <div className={cn('flex flex-wrap items-center justify-center gap-2', className)}>
            {towns.map((town: string) => (
                <span
                    key={town}
                    className="inline-flex items-center rounded-full border border-brand/15 bg-brand/5 px-3 py-1 text-xs font-medium text-brand-light backdrop-blur-sm transition-all hover:bg-brand/10 hover:border-brand/30 hover:scale-105 cursor-default"
                >
                    {town}
                </span>
            ))}
            {max && allTowns.length > max && (
                <span className="inline-flex items-center rounded-full border border-border-default bg-surface-alt px-3 py-1 text-xs text-text-muted">
                    +{allTowns.length - max} more
                </span>
            )}
        </div>
    );
}
