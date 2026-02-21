import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import {
    Loader2,
    LogOut,
    AlertCircle,
    ChevronDown,
    ChevronRight,
    Plus,
    Trash2,
    Upload,
    X,
    Car,
    Wrench,
    FileText,
    CheckCircle2,
} from 'lucide-react';

const API_BASE = '/api';

async function fetchApi(path: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: options.headers as HeadersInit,
    });
    return res;
}

async function fetchJson(path: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) },
    });
    return res;
}

interface Fault {
    id: string;
    title: string;
    severity?: string;
    status?: string;
    impact?: string;
    dtcs?: unknown;
    root_causes?: unknown;
    conclusion?: string;
    action_plan?: unknown;
    parts_required?: unknown;
    coding_required?: unknown;
    explanation?: string;
    solution?: string;
}

interface Test {
    id: string;
    fault_id?: string;
    test_name: string;
    tool_used?: string;
    result?: string;
    readings?: unknown;
    notes?: string;
}

interface Vehicle {
    id: string;
    reg?: string;
    vin?: string;
    make?: string;
    model?: string;
    variant?: string;
    mileage?: string;
    drivability_status?: string;
    notes?: string;
    faults: Fault[];
    tests: Test[];
}

interface Media {
    id: string;
    media_type: string;
    filename: string;
    url: string;
    caption?: string;
    vehicle_id?: string;
    fault_id?: string;
    test_id?: string;
}

interface Report {
    id: string;
    booking_id: string;
    status: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    customer_address?: string;
    customer_postcode?: string;
    vehicles: Vehicle[];
    media: Media[];
}

const STATUS_OPTIONS = ['DRAFT', 'IN_PROGRESS', 'COMPLETED'];
const SEVERITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const RESULT_OPTIONS = ['PASS', 'FAIL', 'BORDERLINE'];
const DRIVABILITY_OPTIONS = ['DRIVABLE', 'LIMITED', 'NOT_DRIVABLE'];

export function AdminReportEditorPage() {
    const { reportId } = useParams<{ reportId: string }>();
    const navigate = useNavigate();
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [expandedVehicles, setExpandedVehicles] = useState<Set<string>>(new Set());
    const [completeModalOpen, setCompleteModalOpen] = useState(false);
    const [completeLoading, setCompleteLoading] = useState(false);

    const loadSession = async () => {
        const res = await fetchJson('/admin/session');
        const json = await res.json();
        if (!json.authenticated) {
            navigate('/admin/login', { replace: true });
            return false;
        }
        return true;
    };

    const loadReport = async () => {
        if (!reportId || !(await loadSession())) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetchJson(`/admin/reports/${reportId}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.detail || 'Failed to load');
            setReport(json);
            if (json.vehicles?.length) {
                setExpandedVehicles(new Set(json.vehicles.map((v: Vehicle) => v.id)));
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReport();
    }, [reportId]);

    const handleLogout = async () => {
        await fetchJson('/admin/logout', { method: 'POST' });
        navigate('/admin/login', { replace: true });
    };

    const patchReport = async (updates: Record<string, unknown>) => {
        if (!reportId) return;
        setSaving(true);
        try {
            const res = await fetchJson(`/admin/reports/${reportId}`, {
                method: 'PATCH',
                body: JSON.stringify(updates),
            });
            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.detail || 'Failed to save');
            }
            await loadReport();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = (status: string) => {
        if (status === 'COMPLETED') {
            setCompleteModalOpen(true);
        } else {
            patchReport({ status });
        }
    };

    const handleConfirmComplete = async () => {
        if (!reportId) return;
        setCompleteLoading(true);
        try {
            const res = await fetchJson(`/admin/reports/${reportId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'COMPLETED' }),
            });
            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.detail || 'Failed');
            }
            setCompleteModalOpen(false);
            await loadReport();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to complete');
        } finally {
            setCompleteLoading(false);
        }
    };

    const handleCustomerUpdate = (field: string, value: string) => {
        if (!report) return;
        patchReport({ [field]: value });
    };

    const addVehicle = async () => {
        if (!reportId) return;
        setSaving(true);
        try {
            const res = await fetchJson(`/admin/reports/${reportId}/vehicles`, {
                method: 'POST',
                body: JSON.stringify({}),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.detail || 'Failed');
            await loadReport();
            if (json.id) setExpandedVehicles((s) => new Set([...s, json.id]));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to add vehicle');
        } finally {
            setSaving(false);
        }
    };

    const updateVehicle = async (vehicleId: string, updates: Record<string, unknown>) => {
        setSaving(true);
        try {
            const res = await fetchJson(`/admin/vehicles/${vehicleId}`, {
                method: 'PATCH',
                body: JSON.stringify(updates),
            });
            if (!res.ok) throw new Error('Failed');
            await loadReport();
        } finally {
            setSaving(false);
        }
    };

    const deleteVehicle = async (vehicleId: string) => {
        if (!confirm('Delete this vehicle and all its faults, tests, and media?')) return;
        setSaving(true);
        try {
            const res = await fetchJson(`/admin/vehicles/${vehicleId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed');
            await loadReport();
        } finally {
            setSaving(false);
        }
    };

    const addFault = async (vehicleId: string) => {
        setSaving(true);
        try {
            const res = await fetchJson(`/admin/vehicles/${vehicleId}/faults`, {
                method: 'POST',
                body: JSON.stringify({ title: 'New fault' }),
            });
            if (!res.ok) throw new Error('Failed');
            await loadReport();
        } finally {
            setSaving(false);
        }
    };

    const updateFault = async (faultId: string, updates: Record<string, unknown>) => {
        setSaving(true);
        try {
            const res = await fetchJson(`/admin/faults/${faultId}`, {
                method: 'PATCH',
                body: JSON.stringify(updates),
            });
            if (!res.ok) throw new Error('Failed');
            await loadReport();
        } finally {
            setSaving(false);
        }
    };

    const deleteFault = async (faultId: string) => {
        if (!confirm('Delete this fault?')) return;
        setSaving(true);
        try {
            await fetchJson(`/admin/faults/${faultId}`, { method: 'DELETE' });
            await loadReport();
        } finally {
            setSaving(false);
        }
    };

    const addTest = async (vehicleId: string, faultId?: string) => {
        setSaving(true);
        try {
            const res = await fetchJson(`/admin/vehicles/${vehicleId}/tests`, {
                method: 'POST',
                body: JSON.stringify({ test_name: 'New test', fault_id: faultId || null }),
            });
            if (!res.ok) throw new Error('Failed');
            await loadReport();
        } finally {
            setSaving(false);
        }
    };

    const updateTest = async (testId: string, updates: Record<string, unknown>) => {
        setSaving(true);
        try {
            const res = await fetchJson(`/admin/tests/${testId}`, {
                method: 'PATCH',
                body: JSON.stringify(updates),
            });
            if (!res.ok) throw new Error('Failed');
            await loadReport();
        } finally {
            setSaving(false);
        }
    };

    const deleteTest = async (testId: string) => {
        if (!confirm('Delete this test?')) return;
        setSaving(true);
        try {
            await fetchJson(`/admin/tests/${testId}`, { method: 'DELETE' });
            await loadReport();
        } finally {
            setSaving(false);
        }
    };

    const uploadMedia = async (file: File, vehicleId?: string, faultId?: string, testId?: string, caption?: string) => {
        if (!reportId) return;
        const form = new FormData();
        form.append('file', file);
        if (vehicleId) form.append('vehicle_id', vehicleId);
        if (faultId) form.append('fault_id', faultId);
        if (testId) form.append('test_id', testId);
        if (caption) form.append('caption', caption);
        setSaving(true);
        try {
            const res = await fetchApi(`/admin/reports/${reportId}/media`, {
                method: 'POST',
                body: form,
            });
            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.detail || 'Upload failed');
            }
            await loadReport();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Upload failed');
        } finally {
            setSaving(false);
        }
    };

    const deleteMedia = async (mediaId: string) => {
        if (!confirm('Delete this file?')) return;
        setSaving(true);
        try {
            await fetchJson(`/admin/media/${mediaId}`, { method: 'DELETE' });
            await loadReport();
        } finally {
            setSaving(false);
        }
    };

    const toggleVehicle = (id: string) => {
        setExpandedVehicles((s) => {
            const next = new Set(s);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    if (loading || !report) {
        return (
            <>
                <Seo title="Edit Report" noIndex />
                <Section>
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="mt-4 text-text-secondary">Loading report...</p>
                    </div>
                </Section>
            </>
        );
    }

    return (
        <>
            <Seo title={`Edit Report ${report.id}`} noIndex />
            <Section>
                <div className="mx-auto max-w-4xl">
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <Link to="/admin/reports" className="text-sm text-text-secondary hover:text-text-primary">
                                ← Reports
                            </Link>
                            <h1 className="text-2xl font-bold text-text-primary">{report.id}</h1>
                        </div>
                        <CTAButton variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                            <LogOut className="h-4 w-4" />
                            Log out
                        </CTAButton>
                    </div>

                    {error && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/5 p-3 text-danger">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Status bar */}
                    <div className="mb-6 rounded-xl border border-border-default bg-surface-alt p-4">
                        <h2 className="text-sm font-semibold text-text-primary mb-3">Status</h2>
                        <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => handleStatusChange(s)}
                                    disabled={saving || report.status === 'COMPLETED'}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                                        report.status === s
                                            ? 'bg-brand text-white'
                                            : 'bg-surface text-text-secondary hover:bg-surface-alt'
                                    } disabled:opacity-50`}
                                >
                                    {s.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Customer info */}
                    <div className="mb-6 rounded-xl border border-border-default bg-surface-alt p-4">
                        <h2 className="text-sm font-semibold text-text-primary mb-3">Customer</h2>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label className="text-xs text-text-muted">Name</label>
                                <input
                                    type="text"
                                    value={report.customer_name}
                                    onChange={(e) => setReport({ ...report, customer_name: e.target.value })}
                                    onBlur={(e) => handleCustomerUpdate('customer_name', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-text-primary"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">Email</label>
                                <input
                                    type="email"
                                    value={report.customer_email}
                                    onChange={(e) => setReport({ ...report, customer_email: e.target.value })}
                                    onBlur={(e) => handleCustomerUpdate('customer_email', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-text-primary"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">Phone</label>
                                <input
                                    type="text"
                                    value={report.customer_phone || ''}
                                    onChange={(e) => setReport({ ...report, customer_phone: e.target.value })}
                                    onBlur={(e) => handleCustomerUpdate('customer_phone', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-text-primary"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">Postcode</label>
                                <input
                                    type="text"
                                    value={report.customer_postcode || ''}
                                    onChange={(e) => setReport({ ...report, customer_postcode: e.target.value })}
                                    onBlur={(e) => handleCustomerUpdate('customer_postcode', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-text-primary"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-xs text-text-muted">Address</label>
                                <input
                                    type="text"
                                    value={report.customer_address || ''}
                                    onChange={(e) => setReport({ ...report, customer_address: e.target.value })}
                                    onBlur={(e) => handleCustomerUpdate('customer_address', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-text-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vehicles */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-text-primary">Vehicles</h2>
                            <CTAButton size="sm" onClick={addVehicle} disabled={saving}>
                                <Plus className="h-4 w-4" />
                                Add vehicle
                            </CTAButton>
                        </div>
                        {report.vehicles.length === 0 ? (
                            <p className="text-text-muted text-sm">No vehicles yet. Add one to get started.</p>
                        ) : (
                            <div className="space-y-2">
                                {report.vehicles.map((v) => (
                                    <div key={v.id} className="rounded-xl border border-border-default bg-surface-alt overflow-hidden">
                                        <div
                                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface/50"
                                            onClick={() => toggleVehicle(v.id)}
                                        >
                                            <div className="flex items-center gap-2">
                                                {expandedVehicles.has(v.id) ? (
                                                    <ChevronDown className="h-4 w-4 text-text-muted" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-text-muted" />
                                                )}
                                                <Car className="h-4 w-4 text-text-muted" />
                                                <span className="font-medium">
                                                    {v.reg || 'Vehicle'} - {[v.make, v.model].filter(Boolean).join(' ') || 'No details'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteVehicle(v.id); }}
                                                className="rounded p-1 text-danger hover:bg-danger/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        {expandedVehicles.has(v.id) && (
                                            <div className="border-t border-border-default p-4 space-y-4">
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    {(['reg', 'vin', 'make', 'model', 'variant', 'mileage'] as const).map((f) => (
                                                        <div key={f}>
                                                            <label className="text-xs text-text-muted capitalize">{f.replace('_', ' ')}</label>
                                                            <input
                                                                type="text"
                                                                defaultValue={(v[f] as string) || ''}
                                                                onBlur={(e) => updateVehicle(v.id, { [f]: e.target.value })}
                                                                className="mt-1 w-full rounded border border-border-default bg-surface px-2 py-1.5 text-sm"
                                                            />
                                                        </div>
                                                    ))}
                                                    <div>
                                                        <label className="text-xs text-text-muted">Drivability</label>
                                                        <select
                                                            value={v.drivability_status || ''}
                                                            onChange={(e) => updateVehicle(v.id, { drivability_status: e.target.value || undefined })}
                                                            className="mt-1 w-full rounded border border-border-default bg-surface px-2 py-1.5 text-sm"
                                                        >
                                                            <option value="">-</option>
                                                            {DRIVABILITY_OPTIONS.map((o) => (
                                                                <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-text-muted">Notes</label>
                                                    <textarea
                                                        defaultValue={v.notes || ''}
                                                        onBlur={(e) => updateVehicle(v.id, { notes: e.target.value })}
                                                        className="mt-1 w-full rounded border border-border-default bg-surface px-2 py-1.5 text-sm"
                                                        rows={2}
                                                    />
                                                </div>

                                                {/* Faults */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-sm font-semibold flex items-center gap-1">
                                                            <Wrench className="h-4 w-4" /> Faults
                                                        </h3>
                                                        <button
                                                            onClick={() => addFault(v.id)}
                                                            disabled={saving}
                                                            className="text-xs text-brand hover:underline"
                                                        >
                                                            + Add
                                                        </button>
                                                    </div>
                                                    {v.faults?.map((f) => (
                                                        <div key={f.id} className="mb-3 rounded border border-border-default p-3">
                                                            <div className="flex justify-between mb-2">
                                                                <input
                                                                    defaultValue={f.title}
                                                                    onBlur={(e) => updateFault(f.id, { title: e.target.value })}
                                                                    className="flex-1 font-medium text-sm border-0 bg-transparent focus:ring-0"
                                                                />
                                                                <button onClick={() => deleteFault(f.id)} className="text-danger"><Trash2 className="h-3 w-3" /></button>
                                                            </div>
                                                            <div className="grid gap-2 sm:grid-cols-2 text-xs">
                                                                <div>
                                                                    <label className="text-text-muted">Severity</label>
                                                                    <select
                                                                        value={f.severity || ''}
                                                                        onChange={(e) => updateFault(f.id, { severity: e.target.value || undefined })}
                                                                        className="ml-1 rounded border px-1 py-0.5"
                                                                    >
                                                                        {SEVERITY_OPTIONS.map((o) => (
                                                                            <option key={o} value={o}>{o}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="text-text-muted">Impact</label>
                                                                    <input
                                                                        defaultValue={f.impact || ''}
                                                                        onBlur={(e) => updateFault(f.id, { impact: e.target.value })}
                                                                        className="ml-1 w-full rounded border px-1 py-0.5"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="mt-2">
                                                                <label className="text-text-muted">Conclusion</label>
                                                                <textarea
                                                                    defaultValue={f.conclusion || ''}
                                                                    onBlur={(e) => updateFault(f.id, { conclusion: e.target.value })}
                                                                    className="mt-1 w-full rounded border px-1 py-0.5 text-xs"
                                                                    rows={2}
                                                                />
                                                            </div>
                                                            <div className="mt-2">
                                                                <label className="text-text-muted">Explanation</label>
                                                                <textarea
                                                                    defaultValue={f.explanation || ''}
                                                                    onBlur={(e) => updateFault(f.id, { explanation: e.target.value })}
                                                                    className="mt-1 w-full rounded border px-1 py-0.5 text-xs"
                                                                    rows={3}
                                                                    placeholder="Explain the fault in plain terms"
                                                                />
                                                            </div>
                                                            <div className="mt-2">
                                                                <label className="text-text-muted">Solution</label>
                                                                <textarea
                                                                    defaultValue={f.solution || ''}
                                                                    onBlur={(e) => updateFault(f.id, { solution: e.target.value })}
                                                                    className="mt-1 w-full rounded border px-1 py-0.5 text-xs"
                                                                    rows={3}
                                                                    placeholder="Describe the recommended fix"
                                                                />
                                                            </div>

                                                            {/* Tests for this fault */}
                                                            <div className="mt-3 border-t border-border-default pt-3">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <h4 className="text-xs font-semibold text-text-muted flex items-center gap-1">
                                                                        <FileText className="h-3 w-3" /> Tests
                                                                    </h4>
                                                                    <button
                                                                        onClick={() => addTest(v.id, f.id)}
                                                                        disabled={saving}
                                                                        className="text-xs text-brand hover:underline"
                                                                    >
                                                                        + Add test
                                                                    </button>
                                                                </div>
                                                                {(v.tests || []).filter((t) => t.fault_id === f.id).map((t) => (
                                                                    <div key={t.id} className="mb-3 rounded border border-border-default p-3">
                                                            <div className="flex justify-between mb-2">
                                                                <input
                                                                    defaultValue={t.test_name}
                                                                    onBlur={(e) => updateTest(t.id, { test_name: e.target.value })}
                                                                    className="flex-1 font-medium text-sm border-0 bg-transparent focus:ring-0"
                                                                />
                                                                <button onClick={() => deleteTest(t.id)} className="text-danger"><Trash2 className="h-3 w-3" /></button>
                                                            </div>
                                                            <div className="grid gap-2 sm:grid-cols-2 text-xs">
                                                                <div>
                                                                    <label className="text-text-muted">Tool</label>
                                                                    <input
                                                                        defaultValue={t.tool_used || ''}
                                                                        onBlur={(e) => updateTest(t.id, { tool_used: e.target.value })}
                                                                        className="ml-1 rounded border px-1 py-0.5"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-text-muted">Result</label>
                                                                    <select
                                                                        value={t.result || ''}
                                                                        onChange={(e) => updateTest(t.id, { result: e.target.value || undefined })}
                                                                        className="ml-1 rounded border px-1 py-0.5"
                                                                    >
                                                                        {RESULT_OPTIONS.map((o) => (
                                                                            <option key={o} value={o}>{o}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2">
                                                                <label className="text-text-muted">Notes</label>
                                                                <textarea
                                                                    defaultValue={t.notes || ''}
                                                                    onBlur={(e) => updateTest(t.id, { notes: e.target.value })}
                                                                    className="mt-1 w-full rounded border px-1 py-0.5 text-xs"
                                                                    rows={2}
                                                                />
                                                            </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Unlinked tests (vehicle-level) */}
                                                <div className="mt-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-sm font-semibold flex items-center gap-1">
                                                            <FileText className="h-4 w-4" /> Other tests
                                                        </h3>
                                                        <button
                                                            onClick={() => addTest(v.id)}
                                                            disabled={saving}
                                                            className="text-xs text-brand hover:underline"
                                                        >
                                                            + Add (unlinked)
                                                        </button>
                                                    </div>
                                                    {(v.tests || []).filter((t) => !t.fault_id).map((t) => (
                                                        <div key={t.id} className="mb-3 rounded border border-border-default p-3">
                                                            <div className="flex justify-between mb-2">
                                                                <input
                                                                    defaultValue={t.test_name}
                                                                    onBlur={(e) => updateTest(t.id, { test_name: e.target.value })}
                                                                    className="flex-1 font-medium text-sm border-0 bg-transparent focus:ring-0"
                                                                />
                                                                <button onClick={() => deleteTest(t.id)} className="text-danger"><Trash2 className="h-3 w-3" /></button>
                                                            </div>
                                                            <div className="grid gap-2 sm:grid-cols-2 text-xs">
                                                                <div>
                                                                    <label className="text-text-muted">Tool</label>
                                                                    <input
                                                                        defaultValue={t.tool_used || ''}
                                                                        onBlur={(e) => updateTest(t.id, { tool_used: e.target.value })}
                                                                        className="ml-1 rounded border px-1 py-0.5"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-text-muted">Result</label>
                                                                    <select
                                                                        value={t.result || ''}
                                                                        onChange={(e) => updateTest(t.id, { result: e.target.value || undefined })}
                                                                        className="ml-1 rounded border px-1 py-0.5"
                                                                    >
                                                                        {RESULT_OPTIONS.map((o) => (
                                                                            <option key={o} value={o}>{o}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2">
                                                                <label className="text-text-muted">Notes</label>
                                                                <textarea
                                                                    defaultValue={t.notes || ''}
                                                                    onBlur={(e) => updateTest(t.id, { notes: e.target.value })}
                                                                    className="mt-1 w-full rounded border px-1 py-0.5 text-xs"
                                                                    rows={2}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Media upload */}
                                                <div>
                                                    <h3 className="text-sm font-semibold mb-2">Media</h3>
                                                    <label className="flex flex-col items-center justify-center w-full h-24 rounded-lg border-2 border-dashed border-border-default cursor-pointer hover:bg-surface/50">
                                                        <Upload className="h-6 w-6 text-text-muted" />
                                                        <span className="text-xs text-text-muted mt-1">Drop file or click to upload</span>
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const f = e.target.files?.[0];
                                                                if (f) uploadMedia(f, v.id);
                                                                e.target.value = '';
                                                            }}
                                                        />
                                                    </label>
                                                    {report.media?.filter((m) => m.vehicle_id === v.id).map((m) => (
                                                        <div key={m.id} className="mt-2 flex items-center gap-2">
                                                            {m.media_type === 'IMAGE' ? (
                                                                <img src={m.url} alt="" className="h-12 w-12 rounded object-cover" />
                                                            ) : (
                                                                <span className="text-xs">{m.filename}</span>
                                                            )}
                                                            <button onClick={() => deleteMedia(m.id)} className="text-danger"><X className="h-3 w-3" /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Report-level media */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-text-primary mb-3">Report media</h2>
                        <label className="flex flex-col items-center justify-center w-full h-24 rounded-lg border-2 border-dashed border-border-default cursor-pointer hover:bg-surface/50">
                            <Upload className="h-6 w-6 text-text-muted" />
                            <span className="text-xs text-text-muted mt-1">Drop file or click to upload</span>
                            <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) uploadMedia(f);
                                    e.target.value = '';
                                }}
                            />
                        </label>
                        {report.media?.filter((m) => !m.vehicle_id && !m.fault_id && !m.test_id).map((m) => (
                            <div key={m.id} className="mt-2 flex items-center gap-2">
                                {m.media_type === 'IMAGE' ? (
                                    <img src={m.url} alt="" className="h-12 w-12 rounded object-cover" />
                                ) : (
                                    <span className="text-xs">{m.filename}</span>
                                )}
                                <button onClick={() => deleteMedia(m.id)} className="text-danger"><X className="h-3 w-3" /></button>
                            </div>
                        ))}
                    </div>

                    {saving && (
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving…
                        </div>
                    )}
                </div>
            </Section>

            {/* Complete confirmation modal */}
            {completeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="mx-4 w-full max-w-md rounded-xl border border-border-default bg-surface-alt p-6">
                        <h2 className="text-lg font-semibold text-text-primary mb-4">Mark report as completed?</h2>
                        <p className="text-sm text-text-secondary mb-4">
                            This will send an email to the customer with a link to view the report. This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <CTAButton variant="outline" onClick={() => setCompleteModalOpen(false)}>
                                Cancel
                            </CTAButton>
                            <CTAButton onClick={handleConfirmComplete} disabled={completeLoading}>
                                {completeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                Mark completed
                            </CTAButton>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
