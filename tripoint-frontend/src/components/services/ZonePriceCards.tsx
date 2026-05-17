import { VatLabel } from '@/components/VatLabel';

export interface ZonePriceRow {
    zone: string;
    driveTime: string;
    price: number;
}

interface ZonePriceCardsProps {
    rows: ZonePriceRow[];
    footnote?: string;
}

/** Mobile-friendly zone pricing (desktop can use a table separately) */
export function ZonePriceCards({ rows, footnote }: ZonePriceCardsProps) {
    return (
        <div className="lg:hidden">
            <div className="grid gap-3 sm:grid-cols-3">
                {rows.map((row) => (
                    <div
                        key={row.zone}
                        className="rounded-xl border border-border-default bg-surface-alt/80 px-4 py-3 text-center"
                    >
                        <p className="text-sm font-bold text-brand-light">{row.zone}</p>
                        <p className="mt-0.5 text-xs text-text-muted">{row.driveTime}</p>
                        <p className="mt-2 text-xl font-bold text-text-primary">
                            £{row.price}
                            <VatLabel />
                        </p>
                    </div>
                ))}
            </div>
            {footnote ? <p className="mt-3 text-sm text-text-muted">{footnote}</p> : null}
        </div>
    );
}
