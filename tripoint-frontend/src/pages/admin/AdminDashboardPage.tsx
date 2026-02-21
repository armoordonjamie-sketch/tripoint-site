import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { Loader2, LogOut, AlertCircle, Copy, CheckCircle2, Link2, Banknote, FileText } from 'lucide-react';

const API_BASE = '/api';

async function fetchApi(path: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    return res;
}

interface Booking {
    id: string;
    status: string;
    full_name: string;
    email: string;
    phone: string;
    postcode: string;
    vehicle_reg: string;
    vehicle_make: string;
    vehicle_model: string;
    service_ids: string;
    slot_start_iso: string;
    slot_end_iso: string;
    deposit_amount: number;
    balance_due: number;
    total_amount: number;
    payment_link_token: string;
}

const STATUS_COLOURS: Record<string, string> = {
    PENDING_DEPOSIT: 'bg-amber-100 text-amber-800',
    DEPOSIT_PAID: 'bg-yellow-100 text-yellow-800',
    COMPLETED_UNPAID: 'bg-red-100 text-red-800',
    COMPLETED_PAID: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-gray-100 text-gray-600',
};

function CreateReportButton({ bookingId }: { bookingId: string }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const handleCreate = async () => {
        setLoading(true);
        try {
            const res = await fetchApi(`/admin/reports`, {
                method: 'POST',
                body: JSON.stringify({ booking_id: bookingId }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.detail || 'Failed');
            navigate(`/admin/reports/${json.id}`);
        } finally {
            setLoading(false);
        }
    };
    return (
        <button
            onClick={handleCreate}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-brand/20 text-brand hover:bg-brand/30 disabled:opacity-50"
        >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
            Create Report
        </button>
    );
}

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

export function AdminDashboardPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
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

    const loadBookings = async () => {
        if (!(await loadSession())) return;
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set('status', statusFilter);
            const res = await fetchApi(`/admin/bookings?${params}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.detail || 'Failed to load');
            setBookings(json.bookings || []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, [statusFilter]);

    const handleComplete = async (id: string) => {
        setActionLoading(id);
        try {
            const res = await fetchApi(`/admin/bookings/${id}/complete`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed');
            await loadBookings();
        } finally {
            setActionLoading(null);
        }
    };

    const handleMarkPaid = async (id: string) => {
        setActionLoading(id);
        try {
            const res = await fetchApi(`/admin/bookings/${id}/mark-paid`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed');
            await loadBookings();
        } finally {
            setActionLoading(null);
        }
    };

    const handleGenerateLink = async (id: string) => {
        setActionLoading(id);
        try {
            const res = await fetchApi(`/admin/bookings/${id}/generate-balance-link`, { method: 'POST' });
            const json = await res.json();
            if (!res.ok) throw new Error('Failed');
            if (json.payment_url) {
                await navigator.clipboard.writeText(json.payment_url);
                setCopiedId(id);
                setTimeout(() => setCopiedId(null), 2000);
            }
            await loadBookings();
        } finally {
            setActionLoading(null);
        }
    };

    const copyPaymentLink = (token: string) => {
        const url = `${window.location.origin}/pay/${token}`;
        navigator.clipboard.writeText(url);
        setCopiedId(token);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <>
            <Seo title="Admin Dashboard" noIndex />
            <Section>
                <div className="mx-auto max-w-6xl">
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
                        <div className="flex items-center gap-2">
                            <Link
                                to="/admin/reports"
                                className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-surface-alt px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface"
                            >
                                <FileText className="h-4 w-4" />
                                Reports
                            </Link>
                            <CTAButton variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                                <LogOut className="h-4 w-4" />
                                Log out
                            </CTAButton>
                        </div>
                    </div>

                    <div className="mb-4 flex items-center gap-2">
                        <label className="text-sm font-medium text-text-primary">Filter:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-border-default bg-surface px-3 py-1.5 text-sm text-text-primary"
                        >
                            <option value="">All</option>
                            <option value="PENDING_DEPOSIT">Pending deposit</option>
                            <option value="DEPOSIT_PAID">Deposit paid</option>
                            <option value="COMPLETED_UNPAID">Completed (unpaid)</option>
                            <option value="COMPLETED_PAID">Completed (paid)</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
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
                                        <th className="px-4 py-3 text-left font-semibold text-text-primary">Customer</th>
                                        <th className="px-4 py-3 text-left font-semibold text-text-primary">Slot</th>
                                        <th className="px-4 py-3 text-left font-semibold text-text-primary">Status</th>
                                        <th className="px-4 py-3 text-left font-semibold text-text-primary">Amount</th>
                                        <th className="px-4 py-3 text-left font-semibold text-text-primary">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((b) => (
                                        <tr key={b.id} className="border-b border-border-default hover:bg-surface/50">
                                            <td className="px-4 py-3 font-mono text-xs text-text-secondary">{b.id}</td>
                                            <td className="px-4 py-3">
                                                <div>{b.full_name}</div>
                                                <div className="text-xs text-text-muted">{b.email}</div>
                                                <div className="text-xs text-text-muted">{b.vehicle_reg} • {b.vehicle_make} {b.vehicle_model}</div>
                                            </td>
                                            <td className="px-4 py-3 text-text-secondary">{formatDate(b.slot_start_iso)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLOURS[b.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {b.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>£{(b.deposit_amount || 0) / 100} dep</div>
                                                <div className="text-xs text-text-muted">£{(b.balance_due || 0) / 100} bal</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {b.status === 'DEPOSIT_PAID' && (
                                                        <button
                                                            onClick={() => handleComplete(b.id)}
                                                            disabled={actionLoading === b.id}
                                                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-success/20 text-success hover:bg-success/30 disabled:opacity-50"
                                                        >
                                                            {actionLoading === b.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                                                            Complete
                                                        </button>
                                                    )}
                                                    {b.status === 'COMPLETED_UNPAID' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleGenerateLink(b.id)}
                                                                disabled={actionLoading === b.id}
                                                                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-brand/20 text-brand hover:bg-brand/30 disabled:opacity-50"
                                                            >
                                                                {actionLoading === b.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Link2 className="h-3 w-3" />}
                                                                {copiedId === b.id ? 'Copied!' : 'Send Link'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleMarkPaid(b.id)}
                                                                disabled={actionLoading === b.id}
                                                                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-brand/20 text-brand hover:bg-brand/30 disabled:opacity-50"
                                                            >
                                                                {actionLoading === b.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Banknote className="h-3 w-3" />}
                                                                Mark Paid
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => copyPaymentLink(b.payment_link_token)}
                                                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-surface text-text-secondary hover:bg-surface-alt disabled:opacity-50"
                                                        title="Copy payment link"
                                                    >
                                                        {copiedId === b.payment_link_token ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                                        Copy
                                                    </button>
                                                    <CreateReportButton bookingId={b.id} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {bookings.length === 0 && (
                                <div className="py-12 text-center text-text-muted">No bookings found</div>
                            )}
                        </div>
                    )}
                </div>
            </Section>
        </>
    );
}
