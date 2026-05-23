import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { areasData } from '@/data/areas';
import { trackSelectContent } from '@/lib/analytics';

interface TownChipsProps {
    className?: string;
    max?: number;
}

// Special-case overrides for labels that don't slugify to their areasData key
const TOWN_LABEL_OVERRIDES: Record<string, string> = {
    'gillingham and medway': 'medway',
};

function townLabelToAreaSlug(town: string): string | null {
    const normalised = town.trim().toLowerCase();
    if (TOWN_LABEL_OVERRIDES[normalised]) return TOWN_LABEL_OVERRIDES[normalised];
    const slug = normalised.replace(/\s+/g, '-');
    return slug in areasData ? slug : null;
}


export function TownChips({ className, max }: TownChipsProps) {
    const allTowns = siteConfig.coverageTowns;
    const towns = max ? allTowns.slice(0, max) : allTowns;

    return (
        <div className={cn('flex flex-wrap items-center justify-center gap-2', className)}>
            {towns.map((town: string) => {
                const slug = townLabelToAreaSlug(town);
                const chipClass =
                    'inline-flex items-center rounded-full border border-brand/15 bg-brand/5 px-3 py-1 text-xs font-medium text-brand-light backdrop-blur-sm transition-all hover:bg-brand/10 hover:border-brand/30 hover:scale-105';
                if (slug) {
                    return (
                        <Link
                            key={town}
                            to={`/areas-covered/${slug}`}
                            onClick={() => trackSelectContent('area_town', slug)}
                            className={cn(chipClass, 'cursor-pointer')}
                        >
                            {town}
                        </Link>
                    );
                }
                return (
                    <span key={town} className={cn(chipClass, 'cursor-default')}>
                        {town}
                    </span>
                );
            })}
            {max && allTowns.length > max && (
                <span className="inline-flex items-center rounded-full border border-border-default bg-surface-alt px-3 py-1 text-xs text-text-muted">
                    +{allTowns.length - max} more
                </span>
            )}
        </div>
    );
}
