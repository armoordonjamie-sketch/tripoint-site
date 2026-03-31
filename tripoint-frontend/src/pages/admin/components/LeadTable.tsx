import { Check, Copy } from 'lucide-react';
import type { LeadWithMeta } from '@/types/leads';

const Q_BADGE: Record<string, string> = {
    pending: 'bg-slate-500/20 text-slate-200',
    qualified: 'bg-success/20 text-success',
    disqualified: 'bg-danger/20 text-danger',
    won: 'bg-brand/25 text-brand',
};

function formatOccurredLondon(iso: string): string {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('en-GB', {
        timeZone: 'Europe/London',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function trunc(s: string, n: number): string {
    if (!s) return '-';
    return s.length <= n ? s : `${s.slice(0, n)}…`;
}

function isLeadExported(row: LeadWithMeta): boolean {
    const ex = (row.google_ads_export_status || '').toLowerCase();
    const batch = (row.google_ads_export_batch_id || '').trim();
    return ex === 'exported' || ex === 'adjustment_exported' || Boolean(batch);
}

function adsExportBadge(row: LeadWithMeta): { label: string; className: string; title: string } {
    const reason = row.ineligible_reason || '';
    const exported = isLeadExported(row);
    if (row.ads_exportable && exported) {
        return {
            label: 'Exported',
            className: 'text-sky-300',
            title: 'Marked exported or has export batch id',
        };
    }
    if (row.ads_exportable && !exported) {
        return {
            label: 'Exportable',
            className: 'text-success',
            title: 'Eligible for Google Ads offline conversion export',
        };
    }
    if (reason === 'missing_click_identifier') {
        return {
            label: 'No click ID',
            className: 'text-amber-200',
            title:
                'This lead cannot be exported to Google Ads because no gclid/wbraid/gbraid was captured on the original visit.',
        };
    }
    if (reason === 'qualification_not_exportable') {
        return {
            label: 'Not qualified',
            className: 'text-text-muted',
            title: 'Only qualified or won leads are exportable',
        };
    }
    if (reason === 'missing_conversion_name') {
        return {
            label: 'No conversion',
            className: 'text-amber-200',
            title: 'Missing conversion name for export',
        };
    }
    return {
        label: 'No',
        className: 'text-text-muted',
        title: reason || 'Not exportable',
    };
}

interface LeadTableProps {
    leads: LeadWithMeta[];
    loading: boolean;
    error: string | null;
    sortBy: string;
    sortDir: 'asc' | 'desc';
    onSort: (col: string) => void;
    selectedIds: Set<string>;
    onToggleSelect: (eventId: string, selected: boolean) => void;
    onToggleSelectAll: (selected: boolean) => void;
    onRowClick: (eventId: string) => void;
    copiedId: string | null;
    onCopy: (text: string, key: string) => void;
}

export function LeadTable({
    leads,
    loading,
    error,
    sortBy,
    sortDir,
    onSort,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    onRowClick,
    copiedId,
    onCopy,
}: LeadTableProps) {
    const allSelected = leads.length > 0 && leads.every((l) => selectedIds.has(l.event_id));

    const th = (id: string, label: string) => (
        <th className="px-2 py-2 text-left">
            <button
                type="button"
                onClick={() => onSort(id)}
                className="inline-flex items-center gap-1 font-semibold text-text-primary hover:text-brand"
            >
                {label}
                {sortBy === id && <span className="text-xs text-text-muted">{sortDir === 'asc' ? '↑' : '↓'}</span>}
            </button>
        </th>
    );

    if (error) {
        return (
            <div className="rounded-xl border border-danger/30 bg-danger/5 p-6 text-danger">
                {error}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center py-16 text-text-muted">
                Loading leads…
            </div>
        );
    }

    if (leads.length === 0) {
        return (
            <div className="rounded-xl border border-border-default bg-surface-alt py-16 text-center text-text-muted">
                No leads match your filters.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-border-default bg-surface-alt">
            <table className="w-full min-w-[1200px] text-xs">
                <thead>
                    <tr className="border-b border-border-default bg-surface">
                        <th className="w-10 px-2 py-2">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={(e) => onToggleSelectAll(e.target.checked)}
                                aria-label="Select all"
                            />
                        </th>
                        {th('occurred_at', 'Occurred')}
                        {th('lead_channel', 'Channel')}
                        {th('event_name', 'Event')}
                        {th('qualification_status', 'Qual.')}
                        <th className="px-2 py-2 text-left font-semibold">Disqualify</th>
                        <th className="px-2 py-2 text-left font-semibold">Make / Model</th>
                        {th('service_interest', 'Interest')}
                        {th('service_category', 'Cat.')}
                        {th('service_name', 'Service')}
                        {th('click_location', 'Click loc.')}
                        {th('page', 'Page')}
                        <th className="px-2 py-2 text-left font-semibold">Click ID</th>
                        {th('lead_value', 'Value')}
                        <th className="px-2 py-2 text-left font-semibold">Ads OK</th>
                        {th('journey_id', 'Journey')}
                        {th('event_id', 'Event ID')}
                    </tr>
                </thead>
                <tbody>
                    {leads.map((row) => {
                        const qs = (row.qualification_status || '').toLowerCase();
                        const badge = Q_BADGE[qs] || 'bg-surface text-text-secondary';
                        return (
                            <tr
                                key={row.event_id}
                                className="cursor-pointer border-b border-border-default hover:bg-surface/60"
                                onClick={() => onRowClick(row.event_id)}
                            >
                                <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(row.event_id)}
                                        onChange={(e) => onToggleSelect(row.event_id, e.target.checked)}
                                        aria-label="Select row"
                                    />
                                </td>
                                <td className="whitespace-nowrap px-2 py-2 text-text-secondary">
                                    {formatOccurredLondon(row.occurred_at)}
                                </td>
                                <td className="px-2 py-2">{row.lead_channel || '-'}</td>
                                <td className="max-w-[120px] truncate px-2 py-2">{row.event_name || '-'}</td>
                                <td className="px-2 py-2">
                                    <span className={`inline-flex rounded px-1.5 py-0.5 font-medium ${badge}`}>
                                        {row.qualification_status || '-'}
                                    </span>
                                </td>
                                <td className="max-w-[100px] truncate px-2 py-2 text-text-muted">
                                    {row.disqualify_reason || '-'}
                                </td>
                                <td className="max-w-[120px] truncate px-2 py-2">
                                    {[row.vehicle_make, row.vehicle_model].filter(Boolean).join(' ') || '-'}
                                </td>
                                <td className="max-w-[80px] truncate px-2 py-2">{row.service_interest || '-'}</td>
                                <td className="max-w-[80px] truncate px-2 py-2">{row.service_category || '-'}</td>
                                <td className="max-w-[120px] truncate px-2 py-2">{row.service_name || '-'}</td>
                                <td className="max-w-[100px] truncate px-2 py-2">{row.click_location || '-'}</td>
                                <td className="max-w-[140px] truncate px-2 py-2 text-text-muted">{row.page || '-'}</td>
                                <td className="px-2 py-2 text-center">
                                    {row.has_click_id && row.identifier_type ? (
                                        <span
                                            className="inline-flex items-center gap-1 text-success"
                                            title={row.identifier_value || row.identifier_type}
                                        >
                                            <span>●</span>
                                            <span className="text-[10px] uppercase">{row.identifier_type}</span>
                                        </span>
                                    ) : (
                                        '-'
                                    )}
                                </td>
                                <td className="px-2 py-2">{row.lead_value || '-'}</td>
                                <td className="px-2 py-2">
                                    {(() => {
                                        const b = adsExportBadge(row);
                                        return (
                                            <span className={`font-medium ${b.className}`} title={b.title}>
                                                {b.label}
                                            </span>
                                        );
                                    })()}
                                </td>
                                <td className="px-2 py-2 font-mono text-[10px]">
                                    <span className="inline-flex items-center gap-1">
                                        {trunc(row.journey_id, 8)}
                                        <button
                                            type="button"
                                            className="rounded p-0.5 hover:bg-surface"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCopy(row.journey_id, `j-${row.event_id}`);
                                            }}
                                            title="Copy journey_id"
                                        >
                                            {copiedId === `j-${row.event_id}` ? (
                                                <Check className="h-3 w-3 text-success" />
                                            ) : (
                                                <Copy className="h-3 w-3" />
                                            )}
                                        </button>
                                    </span>
                                </td>
                                <td className="px-2 py-2 font-mono text-[10px]">
                                    <span className="inline-flex items-center gap-1">
                                        {trunc(row.event_id, 8)}
                                        <button
                                            type="button"
                                            className="rounded p-0.5 hover:bg-surface"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCopy(row.event_id, `e-${row.event_id}`);
                                            }}
                                            title="Copy event_id"
                                        >
                                            {copiedId === `e-${row.event_id}` ? (
                                                <Check className="h-3 w-3 text-success" />
                                            ) : (
                                                <Copy className="h-3 w-3" />
                                            )}
                                        </button>
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
