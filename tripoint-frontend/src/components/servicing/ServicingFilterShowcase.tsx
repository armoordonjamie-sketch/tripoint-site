import { OptimizedImage } from '@/components/OptimizedImage';

const FILTERS = [
    {
        src: '/images/servicing-work/oil-filter-old-vs-new.jpg',
        label: 'Oil filter',
        caption: 'Old (left) vs new genuine MB oil filter (right).',
        alt: 'Old and new Mercedes oil filters side by side',
    },
    {
        src: '/images/servicing-work/air-filter-old-vs-new.jpg',
        label: 'Air filter',
        caption: 'Air filter replaced at major-service interval.',
        alt: 'Old and new Mercedes air filters side by side',
    },
    {
        src: '/images/servicing-work/cabin-filter-old-vs-new.jpg',
        label: 'Cabin filter',
        caption: 'Cabin / pollen filter — often skipped by generalists.',
        alt: 'Old and new Mercedes cabin filters side by side',
    },
    {
        src: '/images/servicing-work/fuel-filter-old-vs-new.jpg',
        label: 'Fuel filter',
        caption: 'Fuel filter — critical on diesel, replaced on every major.',
        alt: 'Old and new Mercedes fuel filters side by side',
    },
] as const;

export function ServicingFilterShowcase() {
    return (
        <div className="mt-10 reveal">
            <h3 className="text-lg font-semibold text-text-primary text-center">What we actually replace on a major service</h3>
            <p className="mt-1 text-sm text-text-secondary text-center max-w-2xl mx-auto">
                Side-by-side proof from real jobs — old filter on the left, genuine Mercedes replacement on the right.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {FILTERS.map((item) => (
                    <figure key={item.src} className="overflow-hidden rounded-xl border border-border-default bg-surface-alt">
                        <div className="relative aspect-[4/3] min-h-[180px] bg-surface-alt flex items-center justify-center p-3">
                            <OptimizedImage
                                src={item.src}
                                alt={item.alt}
                                className="max-h-full w-full object-contain object-center"
                            />
                        </div>
                        <figcaption className="border-t border-border-default bg-surface-alt px-3 py-2.5">
                            <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                            <p className="mt-0.5 text-xs text-text-secondary">{item.caption}</p>
                        </figcaption>
                    </figure>
                ))}
            </div>
        </div>
    );
}
