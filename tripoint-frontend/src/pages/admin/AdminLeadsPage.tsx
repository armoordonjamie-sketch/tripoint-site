import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { useToast } from '@/hooks/useToast';
import { adminFetch, fetchLeads } from '@/lib/adminApi';
import type { LeadFilters, LeadWithMeta } from '@/types/leads';
import { AdminNav } from '@/pages/admin/AdminNav';
import { LeadFilters as LeadFiltersBar } from '@/pages/admin/components/LeadFilters';
import { LeadTable } from '@/pages/admin/components/LeadTable';
import { BulkActionsBar } from '@/pages/admin/components/BulkActionsBar';
import { LeadDetailDrawer } from '@/pages/admin/components/LeadDetailDrawer';
import { GoogleAdsExportPanel } from '@/pages/admin/components/GoogleAdsExportPanel';
import { ExternalLink, Loader2 } from 'lucide-react';

const defaultFilters = (): LeadFilters => ({
    page: 1,
    per_page: 50,
    sort_by: 'occurred_at',
    sort_dir: 'desc',
});

export function AdminLeadsPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [filters, setFilters] = useState<LeadFilters>(defaultFilters);
    const [leads, setLeads] = useState<LeadWithMeta[]>([]);
    const [total, setTotal] = useState(0);
    const [sheetUrl, setSheetUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [detailLead, setDetailLead] = useState<LeadWithMeta | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const sortBy = filters.sort_by ?? 'occurred_at';
    const sortDir = filters.sort_dir ?? 'desc';

    const loadLeads = useCallback(async () => {
        const res = await adminFetch('/admin/session');
        const json = (await res.json()) as { authenticated?: boolean };
        if (!json.authenticated) {
            navigate('/admin/login', { replace: true });
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const r = await fetchLeads(filters);
            setLeads(r.leads);
            setTotal(r.total);
            setSheetUrl(r.sheet_url ?? null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load leads');
            setLeads([]);
        } finally {
            setLoading(false);
        }
    }, [filters, navigate]);

    useEffect(() => {
        void loadLeads();
    }, [loadLeads]);

    const detailEventId = detailLead?.event_id;
    useEffect(() => {
        if (!drawerOpen || !detailEventId) return;
        const u = leads.find((l) => l.event_id === detailEventId);
        if (u) setDetailLead(u);
    }, [leads, drawerOpen, detailEventId]);

    const handleLogout = async () => {
        await adminFetch('/admin/logout', { method: 'POST' });
        navigate('/admin/login', { replace: true });
    };

    const onSort = (col: string) => {
        setFilters((f) => {
            const prev = f.sort_by ?? 'occurred_at';
            const dir = f.sort_dir ?? 'desc';
            if (prev === col) {
                return { ...f, sort_dir: dir === 'asc' ? 'desc' : 'asc', page: 1 };
            }
            return { ...f, sort_by: col, sort_dir: 'desc', page: 1 };
        });
    };

    const toggleSelect = (eventId: string, selected: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (selected) next.add(eventId);
            else next.delete(eventId);
            return next;
        });
    };

    const toggleSelectAll = (selected: boolean) => {
        if (selected) {
            setSelectedIds(new Set(leads.map((l) => l.event_id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const onCopy = (text: string, key: string) => {
        void navigator.clipboard.writeText(text);
        setCopiedId(key);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const onRowClick = (eventId: string) => {
        const row = leads.find((l) => l.event_id === eventId);
        if (row) {
            setDetailLead(row);
            setDrawerOpen(true);
        }
    };

    const totalPages = Math.max(1, Math.ceil(total / (filters.per_page ?? 50)));

    const exportCsvVisible = () => {
        const headers = [
            'occurred_at',
            'lead_channel',
            'event_name',
            'qualification_status',
            'vehicle_make',
            'vehicle_model',
            'page',
            'gclid',
            'lead_value',
            'journey_id',
            'event_id',
        ];
        const lines = [
            headers.join(','),
            ...leads.map((row) =>
                headers
                    .map((h) => {
                        const v = String((row as unknown as Record<string, unknown>)[h] ?? '').replace(
                            /"/g,
                            '""'
                        );
                        return `"${v}"`;
                    })
                    .join(',')
            ),
        ];
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-page-${filters.page ?? 1}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast('CSV downloaded', 'success');
    };

    const leadIds = useMemo(() => Array.from(selectedIds), [selectedIds]);

    const pageStats = useMemo(() => {
        const withClick = leads.filter((l) => l.has_click_id).length;
        const exportable = leads.filter((l) => l.ads_exportable).length;
        const exported = leads.filter((l) => {
            const ex = (l.google_ads_export_status || '').toLowerCase();
            const batch = (l.google_ads_export_batch_id || '').trim();
            return ex === 'exported' || ex === 'adjustment_exported' || Boolean(batch);
        }).length;
        return { withClick, exportable, exported, pageRows: leads.length };
    }, [leads]);

    return (
        <>
            <Seo title="Admin - Leads" noIndex />
            <Section>
                <div className="mx-auto max-w-[1600px] space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h1 className="text-2xl font-bold text-text-primary">Leads</h1>
                        <AdminNav onLogout={handleLogout} />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {sheetUrl && (
                            <a
                                href={sheetUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Open Google Sheet
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={exportCsvVisible}
                            disabled={!leads.length}
                            className="rounded-lg border border-border-default px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-alt disabled:opacity-50"
                        >
                            Export visible table CSV
                        </button>
                        <button
                            type="button"
                            onClick={() => void loadLeads()}
                            className="inline-flex items-center gap-1 rounded-lg border border-border-default px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-alt"
                        >
                            <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    <LeadFiltersBar filters={filters} onChange={setFilters} sticky />

                    {!loading && !error && leads.length > 0 && (
                        <div className="flex flex-wrap gap-3 rounded-xl border border-border-default bg-surface-alt px-4 py-3 text-xs text-text-secondary">
                            <span>
                                <span className="text-text-muted">This page:</span> {pageStats.pageRows} rows
                            </span>
                            <span>
                                <span className="text-text-muted">With click ID:</span> {pageStats.withClick}
                            </span>
                            <span>
                                <span className="text-text-muted">Ads-exportable:</span> {pageStats.exportable}
                            </span>
                            <span>
                                <span className="text-text-muted">Exported:</span> {pageStats.exported}
                            </span>
                            <span className="text-text-muted">
                                Total matching filters: <strong className="text-text-primary">{total}</strong>
                            </span>
                        </div>
                    )}

                    <GoogleAdsExportPanel selectedIds={leadIds} onExported={() => void loadLeads()} />

                    <LeadTable
                        leads={leads}
                        loading={loading}
                        error={error}
                        sortBy={sortBy}
                        sortDir={sortDir as 'asc' | 'desc'}
                        onSort={onSort}
                        selectedIds={selectedIds}
                        onToggleSelect={toggleSelect}
                        onToggleSelectAll={toggleSelectAll}
                        onRowClick={onRowClick}
                        copiedId={copiedId}
                        onCopy={onCopy}
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-text-muted">
                        <span>
                            Page {filters.page ?? 1} of {totalPages}, {total} total rows
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={(filters.page ?? 1) <= 1}
                                onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))}
                                className="rounded border border-border-default px-3 py-1 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                type="button"
                                disabled={(filters.page ?? 1) >= totalPages}
                                onClick={() =>
                                    setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))
                                }
                                className="rounded border border-border-default px-3 py-1 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </Section>

            <BulkActionsBar
                selectedIds={leadIds}
                onDone={() => {
                    setSelectedIds(new Set());
                    void loadLeads();
                }}
            />

            <LeadDetailDrawer
                lead={detailLead}
                open={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false);
                    setDetailLead(null);
                }}
                onSaved={() => {
                    void loadLeads();
                }}
            />
        </>
    );
}
