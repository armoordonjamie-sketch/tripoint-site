import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { CTAButton } from './CTAButton';

const slugToHref: Record<string, string> = {
    'diagnostic-callout': '/services/diagnostic-callout',
    'vor-triage': '/services/vor-van-diagnostics',
    'emissions-diagnostics': '/services/emissions-diagnostics',
    'pre-purchase-digital-health-check': '/services/pre-purchase-digital-health-check',
};

interface PricingTableProps {
    /** When true, show a compact version for teasers */
    compact?: boolean;
    className?: string;
}

export function PricingTable({ compact = false, className }: PricingTableProps) {
    const { services, addOns, deposits } = siteConfig.pricing;

    return (
        <div className={cn('space-y-8', className)}>
            {/* Main services table */}
            <div className="overflow-x-auto rounded-xl border border-border-default">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border-default bg-surface-alt">
                            <th className="px-4 py-3 text-sm font-semibold text-text-primary sm:px-6">
                                Service
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">
                                Zone A
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">
                                Zone B
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">
                                Zone C
                            </th>
                            {!compact && (
                                <th className="hidden px-4 py-3 text-sm font-semibold text-text-primary lg:table-cell">
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
                                <td className="px-4 py-4 text-sm font-medium text-text-primary sm:px-6">
                                    {slugToHref[service.slug] ? (
                                        <Link to={slugToHref[service.slug]} className="text-brand hover:underline">{service.name}</Link>
                                    ) : (
                                        service.name
                                    )}
                                </td>
                                <td className="px-4 py-4 text-center text-sm font-bold text-brand-light">
                                    £{service.zoneA}
                                </td>
                                <td className="px-4 py-4 text-center text-sm font-bold text-brand-light">
                                    £{service.zoneB}
                                </td>
                                <td className="px-4 py-4 text-center text-sm font-bold text-brand-light">
                                    £{service.zoneC}
                                </td>
                                {!compact && (
                                    <td className="hidden px-4 py-4 text-sm text-text-secondary lg:table-cell">
                                        {service.included}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add-ons */}
            {!compact && (
                <>
                    <div>
                        <h3 className="mb-4 text-xl font-bold text-text-primary">
                            Add-Ons
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-border-default">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-border-default bg-surface-alt">
                                        <th className="px-4 py-3 text-sm font-semibold text-text-primary sm:px-6">
                                            Add-On
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">
                                            Price
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {addOns.map((addon, i) => (
                                        <tr
                                            key={addon.name}
                                            className={cn(
                                                'border-b border-border-default transition-colors hover:bg-surface-alt/50',
                                                i === addOns.length - 1 && 'border-b-0',
                                            )}
                                        >
                                            <td className="px-4 py-3 text-sm text-text-primary sm:px-6">
                                                {addon.name}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-semibold text-brand-light">
                                                {addon.price}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Deposits */}
                    <div>
                        <h3 className="mb-4 text-xl font-bold text-text-primary">
                            Deposits
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-border-default">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-border-default bg-surface-alt">
                                        <th className="px-4 py-3 text-sm font-semibold text-text-primary sm:px-6">
                                            Booking Type
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">
                                            Deposit
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deposits.map((dep, i) => (
                                        <tr
                                            key={dep.zone}
                                            className={cn(
                                                'border-b border-border-default transition-colors hover:bg-surface-alt/50',
                                                i === deposits.length - 1 && 'border-b-0',
                                            )}
                                        >
                                            <td className="px-4 py-3 text-sm text-text-primary sm:px-6">
                                                {dep.zone}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-semibold text-brand-light">
                                                {dep.amount}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-3 text-sm text-text-muted">
                            Reschedule free with 24 hours notice. Late cancellation or no-show retains deposit.
                        </p>
                    </div>
                </>
            )}

            {compact && (
                <div className="text-center">
                    <CTAButton href="/pricing" variant="outline" size="sm">
                        View Full Pricing & Add-Ons
                    </CTAButton>
                </div>
            )}
        </div>
    );
}
