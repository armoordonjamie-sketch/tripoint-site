import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { bulkUpdateLeads } from '@/lib/adminApi';
import { useToast } from '@/hooks/useToast';
import { QUALIFICATION_STATUS_OPTIONS, VEHICLE_MAKE_OPTIONS } from '@/types/leads';

interface BulkActionsBarProps {
    selectedIds: string[];
    onDone: () => void;
}

export function BulkActionsBar({ selectedIds, onDone }: BulkActionsBarProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [qStatus, setQStatus] = useState('');
    const [dqReason, setDqReason] = useState('');
    const [vMake, setVMake] = useState('');
    const [adjType, setAdjType] = useState<'RETRACTION' | 'RESTATEMENT' | ''>('');

    if (selectedIds.length === 0) return null;

    const run = async (payload: Parameters<typeof bulkUpdateLeads>[0]) => {
        setLoading(true);
        try {
            const r = await bulkUpdateLeads(payload);
            toast(`Updated ${r.updated} row(s)`, 'success');
            if (r.missing_event_ids?.length) {
                toast(`Missing: ${r.missing_event_ids.length} id(s)`, 'error');
            }
            onDone();
        } catch (e) {
            toast(e instanceof Error ? e.message : 'Bulk update failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 left-1/2 z-30 flex max-w-[95vw] -translate-x-1/2 flex-wrap items-center gap-2 rounded-xl border border-brand/40 bg-surface px-4 py-3 shadow-xl">
            <span className="text-sm font-medium text-text-primary">
                {selectedIds.length} selected
            </span>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-brand" />}

            <select
                value={qStatus}
                onChange={(e) => setQStatus(e.target.value)}
                className="rounded border border-border-default bg-surface px-2 py-1 text-xs"
            >
                <option value="">Set qualification…</option>
                {QUALIFICATION_STATUS_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                        {o}
                    </option>
                ))}
            </select>
            <button
                type="button"
                disabled={!qStatus || loading}
                onClick={() =>
                    run({ event_ids: selectedIds, updates: { qualification_status: qStatus } })
                }
                className="rounded bg-brand/20 px-2 py-1 text-xs font-medium text-brand hover:bg-brand/30 disabled:opacity-50"
            >
                Apply qual.
            </button>

            <select
                value={dqReason}
                onChange={(e) => setDqReason(e.target.value)}
                className="rounded border border-border-default bg-surface px-2 py-1 text-xs"
            >
                <option value="">Set disqualify…</option>
                <option value="wrong_vehicle_make">wrong_vehicle_make</option>
                <option value="wrong_service">wrong_service</option>
                <option value="wrong_area">wrong_area</option>
                <option value="price_shopping">price_shopping</option>
                <option value="spam">spam</option>
                <option value="no_response">no_response</option>
                <option value="other">other</option>
            </select>
            <button
                type="button"
                disabled={!dqReason || loading}
                onClick={() =>
                    run({ event_ids: selectedIds, updates: { disqualify_reason: dqReason } })
                }
                className="rounded bg-surface-alt px-2 py-1 text-xs hover:bg-surface disabled:opacity-50"
            >
                Apply DQ
            </button>

            <button
                type="button"
                disabled={loading}
                onClick={() => run({ event_ids: selectedIds, updates: { disqualify_reason: '' } })}
                className="rounded bg-surface-alt px-2 py-1 text-xs hover:bg-surface disabled:opacity-50"
            >
                Clear DQ reason
            </button>

            <select
                value={vMake}
                onChange={(e) => setVMake(e.target.value)}
                className="rounded border border-border-default bg-surface px-2 py-1 text-xs"
            >
                <option value="">Set vehicle make…</option>
                {VEHICLE_MAKE_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                        {o}
                    </option>
                ))}
            </select>
            <button
                type="button"
                disabled={!vMake || loading}
                onClick={() => run({ event_ids: selectedIds, updates: { vehicle_make: vMake } })}
                className="rounded bg-surface-alt px-2 py-1 text-xs hover:bg-surface disabled:opacity-50"
            >
                Apply make
            </button>

            <button
                type="button"
                disabled={loading}
                onClick={() => run({ event_ids: selectedIds, mark_exported: true })}
                className="rounded bg-success/15 px-2 py-1 text-xs text-success hover:bg-success/25 disabled:opacity-50"
            >
                Mark exported
            </button>
            <button
                type="button"
                disabled={loading}
                onClick={() => run({ event_ids: selectedIds, mark_not_exported: true })}
                className="rounded bg-amber-500/15 px-2 py-1 text-xs text-amber-200 hover:bg-amber-500/25 disabled:opacity-50"
            >
                Mark not exported
            </button>

            <button
                type="button"
                disabled={loading}
                onClick={() => run({ event_ids: selectedIds, queue_qualified_export: true })}
                className="rounded bg-brand/15 px-2 py-1 text-xs text-brand hover:bg-brand/25 disabled:opacity-50"
            >
                Queue qualified export
            </button>

            <select
                value={adjType}
                onChange={(e) => setAdjType((e.target.value as typeof adjType) || '')}
                className="rounded border border-border-default bg-surface px-2 py-1 text-xs"
            >
                <option value="">Adjustment type…</option>
                <option value="RETRACTION">RETRACTION</option>
                <option value="RESTATEMENT">RESTATEMENT</option>
            </select>
            <button
                type="button"
                disabled={!adjType || loading}
                onClick={() =>
                    run({
                        event_ids: selectedIds,
                        queue_adjustment_export: adjType as 'RETRACTION' | 'RESTATEMENT',
                    })
                }
                className="rounded bg-danger/15 px-2 py-1 text-xs text-danger hover:bg-danger/25 disabled:opacity-50"
            >
                Queue adjustment
            </button>
        </div>
    );
}
