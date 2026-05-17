import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { CATEGORY_META, SERVICE_CATEGORY_ORDER, type ServiceCategoryId } from '@/config/servicesCatalog';
import { VatLabel } from '@/components/VatLabel';

const slugToHref: Record<string, string> = {
    'diagnostic-callout': '/services/diagnostic-callout',
    'vor-van-diagnostics': '/services/vor-van-diagnostics',
    'pre-purchase-digital-health-check': '/services/pre-purchase-digital-health-check',
    'mercedes-van-minor-service': '/services/mercedes-van-servicing',
    'mercedes-van-major-service': '/services/mercedes-van-servicing',
    'sprinter-brakes': '/services/sprinter-brakes',
    'vito-brakes': '/services/vito-brakes',
    'citan-brakes': '/services/citan-brakes',
    'van-load-driveability-tune': '/services/van-load-driveability-tune',
    'van-economy-tune': '/services/van-economy-tune',
    'fleet-van-tuning': '/services/fleet-van-tuning',
};

const SLUGS_BY_CATEGORY: Record<ServiceCategoryId, string[]> = {
    diagnostics: ['diagnostic-callout', 'vor-van-diagnostics', 'pre-purchase-digital-health-check'],
    servicing: [
        'mercedes-van-minor-service',
        'mercedes-van-major-service',
        'sprinter-brakes',
        'vito-brakes',
        'citan-brakes',
    ],
    tuning: ['van-load-driveability-tune', 'van-economy-tune', 'fleet-van-tuning'],
};

function ZonePrices({ zoneA, zoneB, zoneC }: { zoneA: number; zoneB: number; zoneC: number }) {
    return (
        <dl className="mt-3 grid grid-cols-3 gap-2">
            {(
                [
                    ['A', zoneA],
                    ['B', zoneB],
                    ['C', zoneC],
                ] as const
            ).map(([zone, price]) => (
                <div key={zone} className="rounded-lg bg-surface/80 px-2 py-2.5 text-center ring-1 ring-border-default/60">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Zone {zone}</dt>
                    <dd className="mt-0.5 text-base font-bold text-brand-light">
                        £{price}
                        <VatLabel />
                    </dd>
                </div>
            ))}
        </dl>
    );
}

export function PricingMobileCards() {
    const [categoryId, setCategoryId] = useState<ServiceCategoryId>('diagnostics');
    const slugs = new Set(SLUGS_BY_CATEGORY[categoryId]);
    const services = siteConfig.pricing.services.filter((s) => slugs.has(s.slug));

    return (
        <div className="lg:hidden">
            <h2 className="text-lg font-bold text-text-primary">Service prices</h2>
            <p className="mt-1 text-sm text-text-secondary">All prices include travel in your zone.</p>

            <div
                className="mt-4 flex gap-1.5 rounded-lg bg-surface-alt/90 p-1 ring-1 ring-border-default"
                role="tablist"
                aria-label="Pricing category"
            >
                {SERVICE_CATEGORY_ORDER.map((id) => {
                    const meta = CATEGORY_META[id];
                    const active = categoryId === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => setCategoryId(id)}
                            className={cn(
                                'flex-1 rounded-md px-2 py-2 text-xs font-semibold transition-colors sm:text-sm',
                                active
                                    ? 'bg-brand text-white shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary',
                            )}
                        >
                            {meta.short}
                        </button>
                    );
                })}
            </div>

            <ul className="mt-4 space-y-3" role="tabpanel">
                {services.map((service) => (
                    <li
                        key={service.slug}
                        className="rounded-xl border border-border-default bg-surface-alt/60 p-4"
                    >
                        <h3 className="text-base font-semibold leading-snug text-text-primary">
                            {slugToHref[service.slug] ? (
                                <Link to={slugToHref[service.slug]} className="text-brand hover:underline">
                                    {service.name}
                                </Link>
                            ) : (
                                service.name
                            )}
                        </h3>
                        <ZonePrices zoneA={service.zoneA} zoneB={service.zoneB} zoneC={service.zoneC} />
                        <p className="mt-2.5 text-xs leading-relaxed text-text-secondary">
                            <span className="font-medium text-text-primary">Includes: </span>
                            {service.included}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
