import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Copy, Check, Loader2 } from 'lucide-react';
import { fetchJourney, updateLead, type Ga4QualificationSync } from '@/lib/adminApi';
import { useToast } from '@/hooks/useToast';
import {
    DISQUALIFY_REASON_OPTIONS,
    QUALIFICATION_STATUS_OPTIONS,
    VEHICLE_MAKE_OPTIONS,
    type LeadWithMeta,
} from '@/types/leads';

const schema = z.object({
    qualification_status: z.string().optional(),
    disqualify_reason: z.string().optional(),
    vehicle_make: z.string().optional(),
    vehicle_model: z.string().optional(),
    notes: z.string().optional(),
    lead_value: z.string().optional(),
    google_ads_conversion_name: z.string().optional(),
    google_ads_conversion_value: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function formatOccurredLondon(iso: string): string {
    if (!iso) return '—';
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
        second: '2-digit',
    });
}

interface LeadDetailDrawerProps {
    lead: LeadWithMeta | null;
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
}

export function LeadDetailDrawer({ lead, open, onClose, onSaved }: LeadDetailDrawerProps) {
    const { toast } = useToast();
    const [journeyEvents, setJourneyEvents] = useState<LeadWithMeta[]>([]);
    const [copied, setCopied] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [lastGa4Sync, setLastGa4Sync] = useState<Ga4QualificationSync | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { isDirty },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {},
    });

    useEffect(() => {
        if (!lead || !open) return;
        reset({
            qualification_status: lead.qualification_status || '',
            disqualify_reason: lead.disqualify_reason || '',
            vehicle_make: lead.vehicle_make || '',
            vehicle_model: lead.vehicle_model || '',
            notes: lead.notes || '',
            lead_value: lead.lead_value != null && lead.lead_value !== '' ? String(lead.lead_value) : '',
            google_ads_conversion_name: lead.google_ads_conversion_name || '',
            google_ads_conversion_value:
                lead.google_ads_conversion_value != null && lead.google_ads_conversion_value !== ''
                    ? String(lead.google_ads_conversion_value)
                    : '',
        });
    }, [lead, open, reset]);

    useEffect(() => {
        if (!lead?.journey_id || !open) {
            setJourneyEvents([]);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const j = await fetchJourney(lead.journey_id);
                if (!cancelled) setJourneyEvents(j.events);
            } catch {
                if (!cancelled) setJourneyEvents([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [lead?.journey_id, open]);

    useEffect(() => {
        setLastGa4Sync(null);
    }, [lead?.event_id, open]);

    const copy = (label: string, text: string) => {
        void navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    };

    const onSubmit = async (data: FormValues) => {
        if (!lead) return;
        setSaving(true);
        try {
            const payload: Record<string, string | number | undefined> = {};
            if (data.qualification_status !== undefined) payload.qualification_status = data.qualification_status;
            if (data.disqualify_reason !== undefined) payload.disqualify_reason = data.disqualify_reason;
            if (data.vehicle_make !== undefined) payload.vehicle_make = data.vehicle_make;
            if (data.vehicle_model !== undefined) payload.vehicle_model = data.vehicle_model;
            if (data.notes !== undefined) payload.notes = data.notes;
            if (data.lead_value !== undefined && data.lead_value !== '') {
                const n = parseFloat(data.lead_value);
                if (!Number.isNaN(n)) payload.lead_value = n;
            }
            if (data.google_ads_conversion_name !== undefined) {
                payload.google_ads_conversion_name = data.google_ads_conversion_name;
            }
            if (data.google_ads_conversion_value !== undefined && data.google_ads_conversion_value !== '') {
                const n = parseFloat(data.google_ads_conversion_value);
                if (!Number.isNaN(n)) payload.google_ads_conversion_value = n;
            }
            const res = await updateLead(lead.event_id, payload);
            toast('Lead saved', 'success');
            const g4 = res.ga4_qualification_sync;
            setLastGa4Sync(g4 ?? null);
            if (g4?.ga4_sync_sent) {
                toast(`GA4: ${g4.event ?? 'event'} sent via Measurement Protocol`, 'info');
            } else if (g4?.skipped_reason === 'no_qualification_transition') {
                /* no MP for this save */
            } else if (g4?.skipped_reason === 'ga4_not_configured') {
                toast('GA4 MP not configured (set GA4_MEASUREMENT_ID + GA4_API_SECRET on server)', 'info');
            } else if (g4?.skipped_reason === 'missing_ga_client_id') {
                toast('GA4 MP skipped: lead row has no ga_client_id (capture from site after deploy)', 'info');
            } else if (g4?.skipped_reason === 'missing_ga_session_id') {
                toast('GA4 MP skipped: lead row has no ga_session_id (needed for Realtime/session linkage)', 'info');
            } else if (g4?.event && g4.measurement_protocol_sent === false) {
                toast('Lead saved; GA4 sync failed (see drawer + server logs)', 'error');
            }
            onSaved();
        } catch (e) {
            toast(e instanceof Error ? e.message : 'Save failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!open || !lead) return null;

    return (
        <>
            <button
                type="button"
                className="fixed inset-0 z-40 bg-black/50"
                aria-label="Close drawer"
                onClick={onClose}
            />
            <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-border-default bg-surface shadow-2xl">
                <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
                    <h2 className="text-lg font-semibold text-text-primary">Lead detail</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 hover:bg-surface-alt"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4 text-sm">
                    <section className="mb-6 space-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                            Lead info
                        </h3>
                        <p>
                            <span className="text-text-muted">event_name:</span> {lead.event_name || '—'}
                        </p>
                        <p>
                            <span className="text-text-muted">lead_channel:</span> {lead.lead_channel || '—'}
                        </p>
                        <p>
                            <span className="text-text-muted">click_location:</span> {lead.click_location || '—'}
                        </p>
                        <p>
                            <span className="text-text-muted">occurred_at (London):</span>{' '}
                            {formatOccurredLondon(lead.occurred_at)}
                        </p>
                    </section>

                    <section className="mb-6 space-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                            Page context
                        </h3>
                        <p className="break-all">
                            <span className="text-text-muted">page:</span> {lead.page || '—'}
                        </p>
                        <p>
                            <span className="text-text-muted">title:</span> {lead.title || '—'}
                        </p>
                        <p>
                            <span className="text-text-muted">page_type:</span> {lead.page_type || '—'}
                        </p>
                        <p>
                            <span className="text-text-muted">service_category:</span> {lead.service_category || '—'}
                        </p>
                        <p>
                            <span className="text-text-muted">service_name:</span> {lead.service_name || '—'}
                        </p>
                        <p>
                            <span className="text-text-muted">area_slug:</span> {lead.area_slug || '—'}
                        </p>
                    </section>

                    <section className="mb-6 space-y-3 rounded-lg border border-border-default bg-surface-alt p-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                            Attribution &amp; Google Ads
                        </h3>
                        <div className="flex flex-wrap gap-2 text-xs">
                            <span
                                className={`rounded px-2 py-0.5 font-medium ${lead.has_click_id ? 'bg-success/20 text-success' : 'bg-surface text-text-muted'}`}
                            >
                                Has click ID: {lead.has_click_id ? 'yes' : 'no'}
                            </span>
                            <span
                                className={`rounded px-2 py-0.5 font-medium ${lead.ads_exportable ? 'bg-success/20 text-success' : 'bg-surface text-text-muted'}`}
                            >
                                Ads exportable: {lead.ads_exportable ? 'yes' : 'no'}
                            </span>
                        </div>
                        <p className="text-xs text-text-muted">
                            <span className="text-text-muted">Resolved identifier:</span>{' '}
                            <span className="font-mono text-text-primary">
                                {lead.identifier_type || '—'} {lead.identifier_value ? `· ${lead.identifier_value}` : ''}
                            </span>
                        </p>
                        {lead.ineligible_reason === 'missing_click_identifier' && (
                            <p className="text-xs text-amber-200/90">
                                This lead cannot be exported to Google Ads because no gclid/wbraid/gbraid was captured on
                                the original visit.
                            </p>
                        )}
                        {lead.ineligible_reason &&
                            lead.ineligible_reason !== 'missing_click_identifier' &&
                            !lead.ads_exportable && (
                                <p className="text-xs text-text-muted">Ineligible: {lead.ineligible_reason}</p>
                            )}
                        <p className="text-xs text-text-muted">
                            Export status: {lead.google_ads_export_status || '—'} · batch:{' '}
                            {lead.google_ads_export_batch_id || '—'}
                        </p>
                        <h4 className="pt-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                            Raw attribution (sheet)
                        </h4>
                        {(
                            [
                                ['gclid', lead.gclid],
                                ['gbraid', lead.gbraid],
                                ['wbraid', lead.wbraid],
                                ['utm_source', lead.utm_source],
                                ['utm_medium', lead.utm_medium],
                                ['utm_campaign', lead.utm_campaign],
                                ['utm_content', lead.utm_content],
                                ['utm_term', lead.utm_term],
                            ] as const
                        ).map(([k, v]) => (
                            <div key={k} className="flex items-center gap-2 font-mono text-xs">
                                <span className="w-28 shrink-0 text-text-muted">{k}</span>
                                <span className="min-w-0 flex-1 truncate">{v || '—'}</span>
                                {v ? (
                                    <button
                                        type="button"
                                        className="shrink-0 rounded p-1 hover:bg-surface"
                                        onClick={() => copy(k, v)}
                                    >
                                        {copied === k ? (
                                            <Check className="h-3 w-3 text-success" />
                                        ) : (
                                            <Copy className="h-3 w-3" />
                                        )}
                                    </button>
                                ) : null}
                            </div>
                        ))}
                    </section>

                    <section className="mb-6 space-y-2 rounded-lg border border-border-default bg-surface-alt p-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                            GA4 web identifiers (Measurement Protocol)
                        </h3>
                        <p className="font-mono text-xs break-all">
                            <span className="text-text-muted">ga_client_id:</span>{' '}
                            {lead.ga_client_id?.trim() || (
                                <span className="text-text-muted">not captured on this lead</span>
                            )}
                        </p>
                        <p className="font-mono text-xs break-all">
                            <span className="text-text-muted">ga_session_id:</span>{' '}
                            {lead.ga_session_id?.trim() || (
                                <span className="text-text-muted">not captured on this lead</span>
                            )}
                        </p>
                    </section>

                    {lastGa4Sync && (
                        <section className="mb-6 space-y-2 rounded-lg border border-border-default bg-surface-alt p-3 text-xs">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                                Last GA4 sync (after save)
                            </h3>
                            <p>
                                <span className="text-text-muted">Event:</span> {lastGa4Sync.event ?? '—'}
                            </p>
                            <p>
                                <span className="text-text-muted">ga4_sync_attempted:</span>{' '}
                                {lastGa4Sync.ga4_sync_attempted ? 'yes' : 'no'}
                            </p>
                            <p>
                                <span className="text-text-muted">ga4_sync_sent:</span>{' '}
                                {lastGa4Sync.ga4_sync_sent ? 'yes' : 'no'}
                            </p>
                            <p>
                                <span className="text-text-muted">ga4_sync_skipped_reason:</span>{' '}
                                {lastGa4Sync.ga4_sync_skipped_reason ?? lastGa4Sync.skipped_reason ?? '—'}
                            </p>
                            <p>
                                <span className="text-text-muted">ga4_sync_session_id_policy:</span>{' '}
                                {lastGa4Sync.ga4_sync_session_id_policy ?? '—'}
                            </p>
                            {lastGa4Sync.ga4_sync_validation_messages &&
                                lastGa4Sync.ga4_sync_validation_messages.length > 0 && (
                                    <div>
                                        <span className="text-text-muted">Validation messages (debug MP):</span>
                                        <ul className="mt-1 list-inside list-disc text-amber-200/90">
                                            {lastGa4Sync.ga4_sync_validation_messages.map((m) => (
                                                <li key={m}>{m}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                        </section>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="mb-6 space-y-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                            Qualification & notes
                        </h3>
                        <label className="flex flex-col gap-1">
                            <span className="text-text-muted">qualification_status</span>
                            <select
                                {...register('qualification_status')}
                                className="rounded-lg border border-border-default bg-surface-alt px-3 py-2 text-text-primary"
                            >
                                <option value="">—</option>
                                {QUALIFICATION_STATUS_OPTIONS.map((o) => (
                                    <option key={o} value={o}>
                                        {o}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-text-muted">disqualify_reason</span>
                            <select
                                {...register('disqualify_reason')}
                                className="rounded-lg border border-border-default bg-surface-alt px-3 py-2 text-text-primary"
                            >
                                <option value="">—</option>
                                {DISQUALIFY_REASON_OPTIONS.map((o) => (
                                    <option key={o} value={o}>
                                        {o}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-text-muted">vehicle_make</span>
                            <select
                                {...register('vehicle_make')}
                                className="rounded-lg border border-border-default bg-surface-alt px-3 py-2 text-text-primary"
                            >
                                <option value="">—</option>
                                {VEHICLE_MAKE_OPTIONS.map((o) => (
                                    <option key={o} value={o}>
                                        {o}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-text-muted">vehicle_model</span>
                            <input
                                {...register('vehicle_model')}
                                className="rounded-lg border border-border-default bg-surface-alt px-3 py-2 text-text-primary"
                            />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-text-muted">lead_value</span>
                            <input
                                {...register('lead_value')}
                                type="text"
                                inputMode="decimal"
                                className="rounded-lg border border-border-default bg-surface-alt px-3 py-2 text-text-primary"
                            />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-text-muted">notes</span>
                            <textarea
                                {...register('notes')}
                                rows={4}
                                className="rounded-lg border border-border-default bg-surface-alt px-3 py-2 text-text-primary"
                            />
                        </label>

                        <h3 className="pt-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                            Google Ads overrides
                        </h3>
                        <label className="flex flex-col gap-1">
                            <span className="text-text-muted">google_ads_conversion_name</span>
                            <input
                                {...register('google_ads_conversion_name')}
                                className="rounded-lg border border-border-default bg-surface-alt px-3 py-2 text-text-primary"
                            />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-text-muted">google_ads_conversion_value</span>
                            <input
                                {...register('google_ads_conversion_value')}
                                type="text"
                                inputMode="decimal"
                                className="rounded-lg border border-border-default bg-surface-alt px-3 py-2 text-text-primary"
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={saving || !isDirty}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Save changes
                        </button>
                    </form>

                    <section>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                            Journey history ({lead.journey_id.slice(0, 8)}…)
                        </h3>
                        <div className="overflow-x-auto rounded-lg border border-border-default">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-border-default bg-surface">
                                        <th className="px-2 py-1 text-left">When (London)</th>
                                        <th className="px-2 py-1 text-left">Event</th>
                                        <th className="px-2 py-1 text-left">Channel</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {journeyEvents.map((e) => (
                                        <tr
                                            key={e.event_id}
                                            className={
                                                e.event_id === lead.event_id
                                                    ? 'bg-brand/10'
                                                    : 'border-b border-border-default'
                                            }
                                        >
                                            <td className="px-2 py-1 whitespace-nowrap">
                                                {formatOccurredLondon(e.occurred_at)}
                                            </td>
                                            <td className="px-2 py-1">{e.event_name}</td>
                                            <td className="px-2 py-1">{e.lead_channel}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {journeyEvents.length === 0 && (
                                <p className="p-3 text-text-muted">No other events in journey.</p>
                            )}
                        </div>
                    </section>
                </div>
            </aside>
        </>
    );
}
