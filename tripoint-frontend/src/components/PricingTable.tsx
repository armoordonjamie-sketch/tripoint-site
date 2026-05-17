import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { CTAButton } from './CTAButton';
import { VatLabel } from './VatLabel';

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

interface PricingTableProps {
    /** When true, show a compact version for teasers */
    compact?: boolean;
    className?: string;
}

/** Desktop pricing grid (mobile uses PricingMobileCards) */
export function PricingTable({ compact = false, className }: PricingTableProps) {
    const { services } = siteConfig.pricing;

    return (
        <div className={cn('hidden lg:block', className)}>
            <div className="rounded-xl border border-border-default">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border-default">
                            <th className="sticky top-20 z-30 border-b border-border-default bg-surface-alt px-6 py-3 text-sm font-semibold text-text-primary shadow-sm">
                                Service
                            </th>
                            <th className="sticky top-20 z-30 border-b border-border-default bg-surface-alt px-4 py-3 text-center text-sm font-semibold text-text-primary shadow-sm">
                                Zone A
                            </th>
                            <th className="sticky top-20 z-30 border-b border-border-default bg-surface-alt px-4 py-3 text-center text-sm font-semibold text-text-primary shadow-sm">
                                Zone B
                            </th>
                            <th className="sticky top-20 z-30 border-b border-border-default bg-surface-alt px-4 py-3 text-center text-sm font-semibold text-text-primary shadow-sm">
                                Zone C
                            </th>
                            {!compact && (
                                <th className="sticky top-20 z-30 border-b border-border-default bg-surface-alt px-4 py-3 text-sm font-semibold text-text-primary shadow-sm">
                                    Included
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((service, i) => (
                            <tr
                                key={service.slug}
                                className={cn(
                                    'border-b border-border-default transition-colors hover:bg-surface-alt/50',
                                    i === services.length - 1 && 'border-b-0',
                                )}
                            >
                                <td className="px-6 py-4 text-sm font-medium text-text-primary">
                                    {slugToHref[service.slug] ? (
                                        <Link to={slugToHref[service.slug]} className="text-brand hover:underline">
                                            {service.name}
                                        </Link>
                                    ) : (
                                        service.name
                                    )}
                                </td>
                                <td className="px-4 py-4 text-center text-sm font-bold text-brand-light">
                                    £{service.zoneA}
                                    <VatLabel />
                                </td>
                                <td className="px-4 py-4 text-center text-sm font-bold text-brand-light">
                                    £{service.zoneB}
                                    <VatLabel />
                                </td>
                                <td className="px-4 py-4 text-center text-sm font-bold text-brand-light">
                                    £{service.zoneC}
                                    <VatLabel />
                                </td>
                                {!compact && (
                                    <td className="px-4 py-4 text-sm text-text-secondary">{service.included}</td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {compact && (
                <div className="mt-6 text-center">
                    <CTAButton href="/pricing" variant="outline" size="sm">
                        View Full Pricing & Add-Ons
                    </CTAButton>
                </div>
            )}
        </div>
    );
}
