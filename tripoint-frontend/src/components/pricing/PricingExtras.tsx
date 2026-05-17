import { siteConfig } from '@/config/site';
import { VatLabel } from '@/components/VatLabel';

/** Add-ons and deposits — card layout on mobile, tables on desktop */
export function PricingExtras() {
    const { addOns, deposits } = siteConfig.pricing;

    return (
        <div className="space-y-8">
            <section>
                <h3 className="text-lg font-bold text-text-primary lg:text-xl">Add-ons</h3>
                <p className="mt-1 text-sm text-text-secondary lg:hidden">Optional extras on top of your booked service.</p>
                <ul className="mt-3 space-y-2 lg:hidden">
                    {addOns.map((addon) => (
                        <li
                            key={addon.name}
                            className="flex flex-col gap-1 rounded-xl border border-border-default bg-surface-alt/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <span className="text-sm text-text-primary">{addon.name}</span>
                            <span className="shrink-0 text-sm font-semibold text-brand-light">
                                {addon.price}
                                <VatLabel />
                            </span>
                        </li>
                    ))}
                </ul>
                <div className="mt-4 hidden rounded-xl border border-border-default lg:block">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border-default bg-surface-alt">
                                <th className="px-6 py-3 text-sm font-semibold text-text-primary">Add-On</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {addOns.map((addon, i) => (
                                <tr
                                    key={addon.name}
                                    className={i < addOns.length - 1 ? 'border-b border-border-default' : ''}
                                >
                                    <td className="px-6 py-3 text-sm text-text-primary">{addon.name}</td>
                                    <td className="px-4 py-3 text-right text-sm font-semibold text-brand-light">
                                        {addon.price}
                                        <VatLabel />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-bold text-text-primary lg:text-xl">Deposits</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:hidden">
                    {deposits.map((dep) => (
                        <div
                            key={dep.zone}
                            className="rounded-xl border border-border-default bg-surface-alt/60 px-4 py-3"
                        >
                            <p className="text-sm font-medium text-text-primary">{dep.zone}</p>
                            <p className="mt-1 text-xl font-bold text-brand-light">
                                {dep.amount}
                                <VatLabel />
                            </p>
                        </div>
                    ))}
                </div>
                <p className="mt-3 text-sm text-text-muted">
                    Reschedule free with 24 hours notice. Late cancellation or no-show retains deposit.
                </p>
                <div className="mt-4 hidden rounded-xl border border-border-default lg:block">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border-default bg-surface-alt">
                                <th className="px-6 py-3 text-sm font-semibold text-text-primary">Booking Type</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Deposit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deposits.map((dep, i) => (
                                <tr
                                    key={dep.zone}
                                    className={i < deposits.length - 1 ? 'border-b border-border-default' : ''}
                                >
                                    <td className="px-6 py-3 text-sm text-text-primary">{dep.zone}</td>
                                    <td className="px-4 py-3 text-right text-sm font-semibold text-brand-light">
                                        {dep.amount}
                                        <VatLabel />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
