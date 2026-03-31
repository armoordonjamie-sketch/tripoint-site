import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { CTAButton } from './CTAButton';

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

export function PricingTable({ compact = false, className }: PricingTableProps) {
    const { services, addOns, deposits } = siteConfig.pricing;

    return (
        <div className={cn('space-y-8', className)}>
            {/* Main services table */}
            <div className="rounded-xl border border-border-default">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border-default">
                            <th
                                className={cn(
                                    'sticky top-20 z-30 border-b border-border-default bg-surface-alt px-4 py-3 text-sm font-semibold text-text-primary shadow-sm sm:px-6',
                                )}
                            >
                                Service
                            </th>
                            <th
                                className={cn(
                                    'sticky top-20 z-30 border-b border-border-default bg-surface-alt px-4 py-3 text-center text-sm font-semibold text-text-primary shadow-sm',
                                )}
                            >
                                Zone A
                            </th>
                            <th
                                className={cn(
                                    'sticky top-20 z-30 border-b border-border-default bg-surface-alt px-4 py-3 text-center text-sm font-semibold text-text-primary shadow-sm',
                                )}
                            >
                                Zone B
                            </th>
                            <th
                                className={cn(
                                    'sticky top-20 z-30 border-b border-border-default bg-surface-alt px-4 py-3 text-center text-sm font-semibold text-text-primary shadow-sm',
                                )}
                            >
                                Zone C
                            </th>
                            {!compact && (
                                <th className="sticky top-20 z-30 hidden border-b border-border-default bg-surface-alt px-4 py-3 text-sm font-semibold text-text-primary shadow-sm lg:table-cell">
                                    Included
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((service, i) => (
                            <Fragment key={service.slug}>
                                <tr
                                    className={cn(
                                        'border-b border-border-default transition-colors hover:bg-surface-alt/50',
                                        i === services.length - 1 && compact && 'border-b-0',
                                        i === services.length - 1 && !compact && 'lg:border-b-0',
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
                                        <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-text-muted lg:hidden">
                                            Zone A
                                        </span>
                                        £{service.zoneA}
                                    </td>
                                    <td className="px-4 py-4 text-center text-sm font-bold text-brand-light">
                                        <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-text-muted lg:hidden">
                                            Zone B
                                        </span>
                                        £{service.zoneB}
                                    </td>
                                    <td className="px-4 py-4 text-center text-sm font-bold text-brand-light">
                                        <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-text-muted lg:hidden">
                                            Zone C
                                        </span>
                                        £{service.zoneC}
                                    </td>
                                    {!compact && (
                                        <td className="hidden px-4 py-4 text-sm text-text-secondary lg:table-cell">
                                            {service.included}
                                        </td>
                                    )}
                                </tr>
                                {!compact && (
                                    <tr
                                        className={cn(
                                            'border-b border-border-default bg-surface-alt/40 lg:hidden',
                                            i === services.length - 1 && 'border-b-0',
                                        )}
                                    >
                                        <td colSpan={4} className="px-4 py-3 text-xs leading-relaxed text-text-secondary sm:px-6">
                                            <span className="font-semibold text-text-primary">Included: </span>
                                            {service.included}
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
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
                        <div className="rounded-xl border border-border-default">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-border-default">
                                        <th className="sticky top-20 z-30 border-b border-border-default bg-surface-alt px-4 py-3 text-sm font-semibold text-text-primary shadow-sm sm:px-6">
                                            Add-On
                                        </th>
                                        <th className="sticky top-20 z-30 border-b border-border-default bg-surface-alt px-4 py-3 text-right text-sm font-semibold text-text-primary shadow-sm">
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
                        <div className="rounded-xl border border-border-default">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-border-default">
                                        <th className="sticky top-20 z-30 border-b border-border-default bg-surface-alt px-4 py-3 text-sm font-semibold text-text-primary shadow-sm sm:px-6">
                                            Booking Type
                                        </th>
                                        <th className="sticky top-20 z-30 border-b border-border-default bg-surface-alt px-4 py-3 text-right text-sm font-semibold text-text-primary shadow-sm">
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
