import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { Loader2, LogOut, AlertCircle, Copy, CheckCircle2, Pencil, Archive, Plus } from 'lucide-react';

const API_BASE = '/api';

async function fetchApi(path: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    return res;
}

interface Report {
    id: string;
    booking_id: string;
    status: string;
    customer_name: string;
    customer_email: string;
    vehicle_reg?: string;
    vehicle_make?: string;
    vehicle_model?: string;
    created_at: string;
    share_token?: string;
}

const STATUS_COLOURS: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-800',
    IN_PROGRESS: 'bg-amber-100 text-amber-800',
    COMPLETED: 'bg-green-100 text-green-800',
    ARCHIVED: 'bg-gray-100 text-gray-600',
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function AdminReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createBookingId, setCreateBookingId] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await fetchApi('/admin/logout', { method: 'POST' });
        navigate('/admin/login', { replace: true });
    };

    const loadSession = async () => {
        const res = await fetchApi('/admin/session');
        const json = await res.json();
        if (!json.authenticated) {
            navigate('/admin/login', { replace: true });
            return false;
        }
        return true;
    };

    const loadReports = async () => {
        if (!(await loadSession())) return;
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set('status', statusFilter);
            if (searchQuery) params.set('q', searchQuery);
            if (dateFrom) params.set('date_from', dateFrom);
            if (dateTo) params.set('date_to', dateTo);
            const res = await fetchApi(`/admin/reports?${params}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.detail || 'Failed to load');
            setReports(json.reports || []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, [statusFilter, searchQuery, dateFrom, dateTo]);

    const handleCreateReport = async () => {
        const bid = createBookingId.trim();
        if (!bid) {
            setCreateError('Please enter a booking ID');
            return;
        }
        setCreateLoading(true);
        setCreateError(null);
        try {
            const res = await fetchApi('/admin/reports', {
                method: 'POST',
                body: JSON.stringify({ booking_id: bid }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.detail || 'Failed to create report');
            setCreateModalOpen(false);
            setCreateBookingId('');
            navigate(`/admin/reports/${json.id}`);
        } catch (e) {
            setCreateError(e instanceof Error ? e.message : 'Failed to create report');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleCopyLink = async (report: Report) => {
        if (report.status !== 'COMPLETED' || !report.share_token) return;
        const url = `${window.location.origin}/report/${report.share_token}`;
        await navigator.clipboard.writeText(url);
        setCopiedId(report.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleArchive = async (id: string) => {
        setActionLoading(id);
        try {
            const res = await fetchApi(`/admin/reports/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed');
            await loadReports();
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <>
            <Seo title="Admin Reports" noIndex />
            <Section>
                <div className="mx-auto max-w-6xl">
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold text-text-primary">Diagnostic Reports</h1>
                            <Link
                                to="/admin"
                                className="text-sm text-text-secondary hover:text-text-primary"
                            >
                                ← Back to bookings
                            </Link>
                        </div>
                        <div className="flex items-center gap-2">
                            <CTAButton
                                onClick={() => setCreateModalOpen(true)}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Create Report
                            </CTAButton>
                            <CTAButton variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                                <LogOut className="h-4 w-4" />
                                Log out
                            </CTAButton>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-4 flex flex-wrap items-center gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-border-default bg-surface px-3 py-1.5 text-sm text-text-primary"
                        >
                            <option value="">All statuses</option>
                            <option value="DRAFT">Draft</option>
                            <option value="IN_PROGRESS">In progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="rounded-lg border border-border-default bg-surface px-3 py-1.5 text-sm text-text-primary w-48"
                        />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="rounded-lg border border-border-default bg-surface px-3 py-1.5 text-sm text-text-primary"
                        />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="rounded-lg border border-border-default bg-surface px-3 py-1.5 text-sm text-text-primary"
                        />
                    </div>

                    {error && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/5 p-3 text-danger">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-12 text-text-muted">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading…
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-border-default bg-surface-alt">
                            <table className="w-full min-w-[800px] text-sm">
                                <thead>
                                    <tr className="border-b border-border-default bg-surface">
                                        <th className="px-4 py-3 text-left font-semibold text-text-primary">ID</th>
                                        <th className="px-4 py-3 text-left font-semibold text-text-primary">Booking</th>
                                        <th className="px-4 py-3 text-left font-semibold text-text-primary">Customer</th>
                                        <th className="px-4 py-3 text-left font-semibold text-text-primary">Vehicle</th>
                                        <th className="px-4 py-3 text-left font-semibold text-text-primary">Status</th>
                                        <th className="px-4 py-3 text-left font-semibold text-text-primary">Date</th>
                                        <th className="px-4 py-3 text-left font-semibold text-text-primary">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((r) => (
                                        <tr key={r.id} className="border-b border-border-default hover:bg-surface/50">
                                            <td className="px-4 py-3 font-mono text-xs text-text-secondary">{r.id}</td>
                                            <td className="px-4 py-3 text-text-secondary">{r.booking_id}</td>
                                            <td className="px-4 py-3">
                                                <div>{r.customer_name}</div>
                                                <div className="text-xs text-text-muted">{r.customer_email}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {r.vehicle_reg || '-'}
                                                {(r.vehicle_make || r.vehicle_model) && (
                                                    <span className="text-text-muted"> • {[r.vehicle_make, r.vehicle_model].filter(Boolean).join(' ')}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLOURS[r.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {r.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-text-secondary">{formatDate(r.created_at)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    <Link
                                                        to={`/admin/reports/${r.id}`}
                                                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-brand/20 text-brand hover:bg-brand/30"
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                        Edit
                                                    </Link>
                                                    {r.status === 'COMPLETED' && r.share_token && (
                                                        <button
                                                            onClick={() => handleCopyLink(r)}
                                                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-surface text-text-secondary hover:bg-surface-alt"
                                                        >
                                                            {copiedId === r.id ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                                            Copy Link
                                                        </button>
                                                    )}
                                                    {r.status !== 'ARCHIVED' && (
                                                        <button
                                                            onClick={() => handleArchive(r.id)}
                                                            disabled={actionLoading === r.id}
                                                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-surface text-text-secondary hover:bg-surface-alt disabled:opacity-50"
                                                        >
                                                            {actionLoading === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Archive className="h-3 w-3" />}
                                                            Archive
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {reports.length === 0 && (
                                <div className="py-12 text-center text-text-muted">No reports found</div>
                            )}
                        </div>
                    )}
                </div>
            </Section>

            {/* Create Report Modal */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="mx-4 w-full max-w-md rounded-xl border border-border-default bg-surface-alt p-6">
                        <h2 className="text-lg font-semibold text-text-primary mb-4">Create Report from Booking</h2>
                        <p className="text-sm text-text-secondary mb-4">Enter the booking ID to create a new diagnostic report.</p>
                        <input
                            type="text"
                            placeholder="e.g. TPD-20250218-AB12"
                            value={createBookingId}
                            onChange={(e) => setCreateBookingId(e.target.value)}
                            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-text-primary mb-4"
                        />
                        {createError && (
                            <p className="text-sm text-danger mb-4">{createError}</p>
                        )}
                        <div className="flex justify-end gap-2">
                            <CTAButton variant="outline" onClick={() => { setCreateModalOpen(false); setCreateError(null); }}>
                                Cancel
                            </CTAButton>
                            <CTAButton onClick={handleCreateReport} disabled={createLoading}>
                                {createLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                            </CTAButton>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
