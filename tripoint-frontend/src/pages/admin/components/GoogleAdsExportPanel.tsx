import { useCallback, useEffect, useState } from 'react';
import { Loader2, Download, FileSpreadsheet } from 'lucide-react';
import {
    exportAdjustments,
    exportQualified,
    fetchGoogleAdsExports,
    getExportDownloadUrl,
    syncSheetValidations,
} from '@/lib/adminApi';
import { useToast } from '@/hooks/useToast';
import type { GoogleAdsExportRecord } from '@/types/leads';

interface GoogleAdsExportPanelProps {
    selectedIds: string[];
    onExported: () => void;
}

export function GoogleAdsExportPanel({ selectedIds, onExported }: GoogleAdsExportPanelProps) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [exports, setExports] = useState<GoogleAdsExportRecord[]>([]);
    const [writeQualified, setWriteQualified] = useState(false);
    const [writeAdj, setWriteAdj] = useState(false);
    const [listLoading, setListLoading] = useState(false);

    const loadExports = useCallback(async () => {
        setListLoading(true);
        try {
            const r = await fetchGoogleAdsExports();
            setExports(r.exports);
        } catch (e) {
            toast(e instanceof Error ? e.message : 'Failed to load exports', 'error');
        } finally {
            setListLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (open) void loadExports();
    }, [open, loadExports]);

    const runQualified = async () => {
        setLoading(true);
        try {
            const r = await exportQualified({
                event_ids: selectedIds.length ? selectedIds : undefined,
                only_not_exported: true,
                write_to_sheet: writeQualified,
            });
            toast(`Exported ${r.row_count} row(s). Download CSV from history.`, 'success');
            window.open(getExportDownloadUrl(r.export_id), '_blank', 'noopener,noreferrer');
            onExported();
            void loadExports();
        } catch (e) {
            toast(e instanceof Error ? e.message : 'Export failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const runAdjustments = async () => {
        setLoading(true);
        try {
            const r = await exportAdjustments({
                event_ids: selectedIds.length ? selectedIds : undefined,
                write_to_sheet: writeAdj,
            });
            toast(`Exported ${r.row_count} adjustment row(s).`, 'success');
            window.open(getExportDownloadUrl(r.export_id), '_blank', 'noopener,noreferrer');
            onExported();
            void loadExports();
        } catch (e) {
            toast(e instanceof Error ? e.message : 'Adjustment export failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const runSync = async () => {
        setLoading(true);
        try {
            await syncSheetValidations();
            toast('Sheet validations and header formatting applied', 'success');
        } catch (e) {
            toast(e instanceof Error ? e.message : 'Sync failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-xl border border-border-default bg-surface-alt p-4">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between text-left font-semibold text-text-primary"
            >
                Google Ads export & history
                <span className="text-xs text-text-muted">{open ? '▼' : '▶'}</span>
            </button>
            {open && (
                <div className="mt-4 space-y-4">
                    <div className="flex flex-wrap gap-3">
                        <label className="flex items-center gap-2 text-xs">
                            <input
                                type="checkbox"
                                checked={writeQualified}
                                onChange={(e) => setWriteQualified(e.target.checked)}
                            />
                            Write qualified tab to Sheet
                        </label>
                        <button
                            type="button"
                            disabled={loading}
                            onClick={runQualified}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand/20 px-3 py-2 text-sm font-medium text-brand hover:bg-brand/30 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            Export qualified / won
                        </button>
                    </div>
                    <p className="text-xs text-text-muted">
                        Uses selected rows if any; otherwise exports all eligible not-yet-exported leads.
                    </p>
                    <div className="flex flex-wrap gap-3 border-t border-border-default pt-4">
                        <label className="flex items-center gap-2 text-xs">
                            <input
                                type="checkbox"
                                checked={writeAdj}
                                onChange={(e) => setWriteAdj(e.target.checked)}
                            />
                            Write adjustments tab to Sheet
                        </label>
                        <button
                            type="button"
                            disabled={loading}
                            onClick={runAdjustments}
                            className="inline-flex items-center gap-2 rounded-lg bg-amber-500/15 px-3 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/25 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
                            Export adjustments
                        </button>
                    </div>
                    <p className="text-xs text-text-muted">
                        Rows must have google_ads_adjustment_type RETRACTION or RESTATEMENT set.
                    </p>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={runSync}
                        className="rounded-lg border border-border-default px-3 py-2 text-xs text-text-secondary hover:bg-surface"
                    >
                        Sync sheet dropdown validations & header formatting
                    </button>

                    <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase text-text-muted">Export history</h4>
                        {listLoading ? (
                            <p className="text-xs text-text-muted">Loading…</p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-border-default">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-border-default bg-surface">
                                            <th className="px-2 py-1 text-left">Created</th>
                                            <th className="px-2 py-1 text-left">Type</th>
                                            <th className="px-2 py-1 text-left">Rows</th>
                                            <th className="px-2 py-1 text-left">Target</th>
                                            <th className="px-2 py-1 text-left">Status</th>
                                            <th className="px-2 py-1 text-left">CSV</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {exports.map((ex) => (
                                            <tr key={ex.id} className="border-b border-border-default">
                                                <td className="px-2 py-1 whitespace-nowrap">
                                                    {new Date(ex.created_at).toLocaleString('en-GB')}
                                                </td>
                                                <td className="px-2 py-1">{ex.export_type}</td>
                                                <td className="px-2 py-1">{ex.row_count}</td>
                                                <td className="max-w-[120px] truncate px-2 py-1" title={ex.target || ''}>
                                                    {ex.target || '—'}
                                                </td>
                                                <td className="px-2 py-1">{ex.status}</td>
                                                <td className="px-2 py-1">
                                                    <a
                                                        href={getExportDownloadUrl(ex.id)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-brand underline"
                                                    >
                                                        Download
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {exports.length === 0 && (
                                    <p className="p-3 text-text-muted">No exports yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
