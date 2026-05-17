import { siteConfig } from '@/config/site';

export function ZoneLegend() {
    return (
        <>
            <div className="mt-8 lg:hidden">
                <h2 className="mb-3 text-lg font-bold text-text-primary">Travel zones</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    {siteConfig.zones.map((z) => (
                        <div
                            key={z.zone}
                            className="rounded-xl border border-border-default bg-surface-alt/80 px-4 py-3"
                        >
                            <div className="flex items-baseline justify-between gap-2">
                                <span className="text-lg font-bold text-brand-light">
                                    {z.zone === 'Out of area' ? 'Out of area' : `Zone ${z.zone}`}
                                </span>
                                <span className="text-sm font-medium text-text-primary">{z.driveTime}</span>
                            </div>
                            <p className="mt-1 text-sm text-text-secondary">{z.note}</p>
                        </div>
                    ))}
                </div>
                <p className="mt-3 text-xs text-text-muted">
                    Drive time from our nearest base at booking (Google/Apple Maps).
                </p>
            </div>

            <div className="mx-auto mt-12 hidden max-w-3xl lg:block">
                <h2 className="mb-4 text-2xl font-bold text-text-primary">Travel Zones</h2>
                <div className="overflow-x-auto rounded-xl border border-border-default">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border-default bg-surface-alt">
                                <th className="px-6 py-3 text-sm font-semibold text-text-primary">Zone</th>
                                <th className="px-4 py-3 text-sm font-semibold text-text-primary">Drive Time</th>
                                <th className="px-4 py-3 text-sm font-semibold text-text-primary">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {siteConfig.zones.map((z, i) => (
                                <tr
                                    key={z.zone}
                                    className={i < siteConfig.zones.length - 1 ? 'border-b border-border-default' : ''}
                                >
                                    <td className="px-6 py-3 text-sm font-bold text-brand-light">{z.zone}</td>
                                    <td className="px-4 py-3 text-sm text-text-primary">{z.driveTime}</td>
                                    <td className="px-4 py-3 text-sm text-text-secondary">{z.note}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-3 text-sm text-text-muted">
                    Drive time is calculated from our nearest base using Google/Apple Maps at time of booking.
                </p>
            </div>
        </>
    );
}
