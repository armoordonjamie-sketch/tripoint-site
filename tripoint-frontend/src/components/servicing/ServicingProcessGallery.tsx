import { OptimizedImage } from '@/components/OptimizedImage';
import { Section } from '@/components/Section';

interface ProcessStep {
    src: string;
    alt: string;
    caption: string;
}

interface ServicingProcessGalleryProps {
    oilDrainSrc?: string;
    className?: string;
}

export function ServicingProcessGallery({
    oilDrainSrc = '/images/servicing-work/oil-draining.jpg',
    className,
}: ServicingProcessGalleryProps) {
    const steps: ProcessStep[] = [
        {
            src: '/images/servicing-work/vehicle-jacked-up.jpg',
            alt: 'Mercedes van safely jacked up on axle stands for mobile servicing',
            caption: 'Vehicle safely lifted with axle stands.',
        },
        {
            src: '/images/servicing-work/drain-plug-undone.jpg',
            alt: 'Sump drain plug being loosened during an oil change',
            caption: 'Sump plug cracked at correct torque.',
        },
        {
            src: oilDrainSrc,
            alt: 'Old engine oil draining from sump during service',
            caption: 'Old oil drained completely — no shortcuts.',
        },
        {
            src: '/images/servicing-work/drain-plug-new-washer.jpg',
            alt: 'Drain plug reinstalled with new crush washer',
            caption: 'New crush washer fitted and torqued to spec.',
        },
        {
            src: '/images/servicing-work/oil-filter-fitted.jpg',
            alt: 'Genuine Mercedes oil filter being fitted',
            caption: 'Genuine oil filter fitted, housing torqued.',
        },
        {
            src: '/images/servicing-work/dipstick-check.jpg',
            alt: 'Engine oil level checked on dipstick after service',
            caption: 'Oil level verified on dipstick before handover.',
        },
    ];

    return (
        <Section className={className ?? 'bg-surface-alt/50'}>
            <div className="mx-auto max-w-5xl reveal">
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">The full process, photographed</h2>
                <p className="mt-2 text-text-secondary text-center max-w-2xl mx-auto">
                    Every step documented — so you know exactly what was done to your van.
                </p>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {steps.map((step, i) => (
                        <figure key={step.src} className="overflow-hidden rounded-xl border border-border-default">
                            <div className="relative aspect-[16/10] min-h-[180px]">
                                <OptimizedImage
                                    src={step.src}
                                    alt={step.alt}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                                <span className="absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                            </div>
                            <figcaption className="border-t border-border-default bg-surface-alt px-3 py-2.5 text-sm text-text-secondary">
                                {step.caption}
                            </figcaption>
                        </figure>
                    ))}
                </div>
                <figure className="mt-4 overflow-hidden rounded-xl border border-border-default">
                    <div className="relative aspect-[16/10] min-h-[200px] sm:min-h-[240px]">
                        <OptimizedImage
                            src="/images/servicing-work/road-test-after-service.jpg"
                            alt="Mercedes van being road tested after a mobile service"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    </div>
                    <figcaption className="border-t border-border-default bg-surface-alt px-4 py-3 text-sm text-text-secondary">
                        Road-tested before handover — not just topped up and sent on its way.
                    </figcaption>
                </figure>
            </div>
        </Section>
    );
}
