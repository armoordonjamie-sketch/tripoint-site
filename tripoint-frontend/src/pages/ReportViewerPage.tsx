import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { siteConfig } from '@/config/site';
import { Loader2, Car, AlertTriangle, FileText, Wrench, CheckCircle2 } from 'lucide-react';

interface Fault {
    id: string;
    title: string;
    severity?: string;
    status?: string;
    impact?: string;
    dtcs?: string[] | Record<string, unknown>;
    root_causes?: string[] | Record<string, unknown>;
    conclusion?: string;
    action_plan?: string[] | Record<string, unknown>;
    parts_required?: string[] | Record<string, unknown>;
    coding_required?: string[] | Record<string, unknown>;
    explanation?: string;
    solution?: string;
}

interface Test {
    id: string;
    fault_id?: string;
    test_name: string;
    tool_used?: string;
    result?: string;
    readings?: Record<string, unknown> | unknown[];
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
    content_type: string;
    caption?: string;
    url: string;
    vehicle_id?: string;
    fault_id?: string;
    test_id?: string;
}

interface Report {
    id: string;
    status: string;
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    customer_address?: string;
    customer_postcode?: string;
    completed_at?: string;
    vehicles: Vehicle[];
    media: Media[];
}

const SEVERITY_COLOURS: Record<string, string> = {
    LOW: 'bg-slate-100 text-slate-800',
    MEDIUM: 'bg-amber-100 text-amber-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800',
};

const RESULT_COLOURS: Record<string, string> = {
    PASS: 'bg-green-100 text-green-800',
    FAIL: 'bg-red-100 text-red-800',
    BORDERLINE: 'bg-amber-100 text-amber-800',
};

const DRIVABILITY_COLOURS: Record<string, string> = {
    DRIVABLE: 'bg-green-100 text-green-800',
    LIMITED: 'bg-amber-100 text-amber-800',
    NOT_DRIVABLE: 'bg-red-100 text-red-800',
};

function formatDate(iso: string | undefined): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function renderJson(value: string[] | Record<string, unknown> | undefined): React.ReactNode {
    if (!value) return null;
    if (Array.isArray(value)) {
        return (
            <ul className="list-disc list-inside mt-1 space-y-0.5">
                {value.map((item, i) => (
                    <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
                ))}
            </ul>
        );
    }
    if (typeof value === 'object') {
        return (
            <ul className="list-disc list-inside mt-1 space-y-0.5">
                {Object.entries(value).map(([k, v]) => (
                    <li key={k}>
                        <strong>{k}:</strong> {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                    </li>
                ))}
            </ul>
        );
    }
    return String(value);
}

export function ReportViewerPage() {
    const { shareToken } = useParams<{ shareToken: string }>();
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!shareToken) {
            setError('Invalid report link');
            setLoading(false);
            return;
        }
        fetch(`/api/reports/share/${shareToken}`)
            .then((r) => {
                if (!r.ok) throw new Error('Report not found or not yet available');
                return r.json();
            })
            .then(setReport)
            .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load report'))
            .finally(() => setLoading(false));
    }, [shareToken]);

    if (loading) {
        return (
            <>
                <Seo title="Diagnostic Report" description="Loading your diagnostic report" noIndex />
                <Section>
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="mt-4 text-text-secondary">Loading report...</p>
                    </div>
                </Section>
            </>
        );
    }

    if (error || !report) {
        return (
            <>
                <Seo title="Report Not Found" description="The requested report could not be found" noIndex />
                <Section>
                    <div className="mx-auto max-w-xl rounded-2xl border border-border-default bg-surface-alt p-8 text-center">
                        <AlertTriangle className="mx-auto h-16 w-16 text-amber-500" />
                        <h1 className="mt-4 text-2xl font-bold text-text-primary">Report not found</h1>
                        <p className="mt-2 text-text-secondary">{error || 'This report may not exist or has not been completed yet.'}</p>
                    </div>
                </Section>
            </>
        );
    }

    const mediaByVehicle = (vehicleId: string) =>
        report.media.filter((m) => m.vehicle_id === vehicleId);
    const mediaByFault = (faultId: string) =>
        report.media.filter((m) => m.fault_id === faultId);
    const mediaByTest = (testId: string) =>
        report.media.filter((m) => m.test_id === testId);
    const mediaUnassigned = report.media.filter((m) => !m.vehicle_id && !m.fault_id && !m.test_id);
    const testsForFault = (vehicle: Vehicle, faultId: string) =>
        (vehicle.tests || []).filter((t) => t.fault_id === faultId);
    const unlinkedTests = (vehicle: Vehicle) =>
        (vehicle.tests || []).filter((t) => !t.fault_id);

    return (
        <>
            <Seo
                title="Diagnostic Report"
                description={`Diagnostic report for ${report.vehicles[0]?.reg || 'vehicle'} - TriPoint Diagnostics`}
                noIndex
            />
            <Section>
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border-default pb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-text-primary">Diagnostic Report</h1>
                            <p className="mt-1 text-text-secondary">
                                Completed {formatDate(report.completed_at)}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                Completed
                            </span>
                        </div>
                    </div>

                    {/* Customer / site summary */}
                    <div className="mb-8 rounded-xl border border-border-default bg-surface-alt p-6">
                        <h2 className="text-lg font-semibold text-text-primary mb-4">Customer & Site</h2>
                        <div className="grid gap-2 text-sm text-text-secondary">
                            <p><strong className="text-text-primary">Name:</strong> {report.customer_name}</p>
                            {report.customer_postcode && (
                                <p><strong className="text-text-primary">Postcode:</strong> {report.customer_postcode}</p>
                            )}
                            {report.customer_address && (
                                <p><strong className="text-text-primary">Address:</strong> {report.customer_address}</p>
                            )}
                        </div>
                    </div>

                    {/* Vehicles */}
                    {report.vehicles.map((vehicle) => (
                        <div key={vehicle.id} className="mb-10 rounded-xl border border-border-default bg-surface-alt overflow-hidden">
                            <div className="border-b border-border-default bg-surface p-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-primary/10 p-3">
                                        <Car className="h-8 w-8 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl font-semibold text-text-primary">
                                            {vehicle.reg || 'Vehicle'} - {[vehicle.make, vehicle.model].filter(Boolean).join(' ')}
                                        </h2>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {vehicle.reg && (
                                                <span className="rounded bg-muted px-2 py-0.5 text-sm font-medium">
                                                    {vehicle.reg}
                                                </span>
                                            )}
                                            {vehicle.mileage && (
                                                <span className="text-text-secondary text-sm">{vehicle.mileage} miles</span>
                                            )}
                                            {vehicle.drivability_status && (
                                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${DRIVABILITY_COLOURS[vehicle.drivability_status] || 'bg-gray-100 text-gray-800'}`}>
                                                    {vehicle.drivability_status.replace(/_/g, ' ')}
                                                </span>
                                            )}
                                        </div>
                                        {vehicle.notes && (
                                            <p className="mt-2 text-sm text-text-secondary">{vehicle.notes}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-8">
                                {/* Faults */}
                                {vehicle.faults && vehicle.faults.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                                            <Wrench className="h-5 w-5" />
                                            Faults
                                        </h3>
                                        <div className="space-y-4">
                                            {vehicle.faults.map((fault) => (
                                                <div key={fault.id} className="rounded-lg border border-border-default p-4">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <span className="font-medium text-text-primary">{fault.title}</span>
                                                        {fault.severity && (
                                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_COLOURS[fault.severity] || 'bg-gray-100'}`}>
                                                                {fault.severity}
                                                            </span>
                                                        )}
                                                        {fault.status && (
                                                            <span className="text-text-secondary text-sm">{fault.status}</span>
                                                        )}
                                                    </div>
                                                    {fault.impact && <p className="text-sm text-text-secondary mt-1">{fault.impact}</p>}
                                                    {fault.dtcs && (
                                                        <div className="mt-2">
                                                            <span className="text-xs font-medium text-text-secondary uppercase">DTCs</span>
                                                            {renderJson(fault.dtcs)}
                                                        </div>
                                                    )}
                                                    {fault.root_causes && (
                                                        <div className="mt-2">
                                                            <span className="text-xs font-medium text-text-secondary uppercase">Root causes</span>
                                                            {renderJson(fault.root_causes)}
                                                        </div>
                                                    )}

                                                    {/* Tests linked to this fault */}
                                                    {testsForFault(vehicle, fault.id).length > 0 && (
                                                        <div className="mt-4">
                                                            <h4 className="text-sm font-semibold text-text-primary mb-2">Tests</h4>
                                                            <div className="space-y-3">
                                                                {testsForFault(vehicle, fault.id).map((test) => (
                                                                    <div key={test.id} className="rounded border border-border-default bg-surface/30 p-3">
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <span className="font-medium text-sm">{test.test_name}</span>
                                                                            {test.tool_used && <span className="text-text-secondary text-xs">({test.tool_used})</span>}
                                                                            {test.result && (
                                                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${RESULT_COLOURS[test.result] || 'bg-gray-100'}`}>
                                                                                    {test.result}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {test.readings && typeof test.readings === 'object' && (
                                                                            <div className="mt-2 overflow-x-auto">
                                                                                <table className="min-w-full text-xs">
                                                                                    <tbody>
                                                                                        {Array.isArray(test.readings)
                                                                                            ? (test.readings as unknown[]).map((r, i) => (
                                                                                                <tr key={i}><td>{JSON.stringify(r)}</td></tr>
                                                                                              ))
                                                                                            : Object.entries(test.readings as Record<string, unknown>).map(([k, v]) => (
                                                                                                <tr key={k} className="border-t border-border-default">
                                                                                                    <td className="py-1 pr-2 font-medium">{k}</td>
                                                                                                    <td className="py-1">{String(v)}</td>
                                                                                                </tr>
                                                                                              ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        )}
                                                                        {test.notes && <p className="mt-1 text-xs text-text-secondary">{test.notes}</p>}
                                                                        {mediaByTest(test.id).length > 0 && (
                                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                                {mediaByTest(test.id).map((m) => (
                                                                                    m.media_type === 'IMAGE' ? (
                                                                                        <a key={m.id} href={m.url} target="_blank" rel="noreferrer">
                                                                                            <img src={m.url} alt={m.caption || m.filename} className="h-16 w-auto rounded object-cover" />
                                                                                        </a>
                                                                                    ) : (
                                                                                        <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">{m.filename}</a>
                                                                                    )
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Explanation section */}
                                                    {fault.explanation && (
                                                        <div className="mt-4 rounded-lg bg-surface/50 p-3">
                                                            <h4 className="text-sm font-semibold text-text-primary mb-2">Explanation</h4>
                                                            <p className="text-sm text-text-secondary whitespace-pre-wrap">{fault.explanation}</p>
                                                        </div>
                                                    )}

                                                    {/* Solution section */}
                                                    {fault.solution && (
                                                        <div className="mt-4 rounded-lg bg-success/5 border border-success/20 p-3">
                                                            <h4 className="text-sm font-semibold text-text-primary mb-2">Solution</h4>
                                                            <p className="text-sm text-text-secondary whitespace-pre-wrap">{fault.solution}</p>
                                                        </div>
                                                    )}

                                                    {fault.conclusion && (
                                                        <p className="mt-2 text-sm"><strong>Conclusion:</strong> {fault.conclusion}</p>
                                                    )}
                                                    {fault.action_plan && (
                                                        <div className="mt-2">
                                                            <span className="text-xs font-medium text-text-secondary uppercase">Action plan</span>
                                                            {renderJson(fault.action_plan)}
                                                        </div>
                                                    )}
                                                    {fault.parts_required && (
                                                        <div className="mt-2">
                                                            <span className="text-xs font-medium text-text-secondary uppercase">Parts required</span>
                                                            {renderJson(fault.parts_required)}
                                                        </div>
                                                    )}
                                                    {fault.coding_required && (
                                                        <div className="mt-2">
                                                            <span className="text-xs font-medium text-text-secondary uppercase">Coding required</span>
                                                            {renderJson(fault.coding_required)}
                                                        </div>
                                                    )}
                                                    {mediaByFault(fault.id).length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {mediaByFault(fault.id).map((m) => (
                                                                m.media_type === 'IMAGE' ? (
                                                                    <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="block">
                                                                        <img src={m.url} alt={m.caption || m.filename} className="h-20 w-auto rounded object-cover" />
                                                                    </a>
                                                                ) : (
                                                                    <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                                                                        {m.filename}
                                                                    </a>
                                                                )
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Unlinked tests (no fault) */}
                                {unlinkedTests(vehicle).length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Other tests
                                        </h3>
                                        <div className="space-y-4">
                                            {unlinkedTests(vehicle).map((test) => (
                                                <div key={test.id} className="rounded-lg border border-border-default p-4">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-medium text-text-primary">{test.test_name}</span>
                                                        {test.tool_used && <span className="text-text-secondary text-sm">({test.tool_used})</span>}
                                                        {test.result && (
                                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${RESULT_COLOURS[test.result] || 'bg-gray-100'}`}>
                                                                {test.result}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {test.readings && typeof test.readings === 'object' && (
                                                        <div className="mt-2 overflow-x-auto">
                                                            <table className="min-w-full text-sm">
                                                                <tbody>
                                                                    {Array.isArray(test.readings)
                                                                        ? (test.readings as unknown[]).map((r, i) => (
                                                                            <tr key={i}><td>{JSON.stringify(r)}</td></tr>
                                                                          ))
                                                                        : Object.entries(test.readings as Record<string, unknown>).map(([k, v]) => (
                                                                            <tr key={k} className="border-t border-border-default">
                                                                                <td className="py-1 pr-4 font-medium">{k}</td>
                                                                                <td className="py-1">{String(v)}</td>
                                                                            </tr>
                                                                          ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                    {test.notes && <p className="mt-2 text-sm text-text-secondary">{test.notes}</p>}
                                                    {mediaByTest(test.id).length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {mediaByTest(test.id).map((m) => (
                                                                m.media_type === 'IMAGE' ? (
                                                                    <a key={m.id} href={m.url} target="_blank" rel="noreferrer">
                                                                        <img src={m.url} alt={m.caption || m.filename} className="h-20 w-auto rounded object-cover" />
                                                                    </a>
                                                                ) : (
                                                                    <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                                                                        {m.filename}
                                                                    </a>
                                                                )
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Vehicle media gallery */}
                                {mediaByVehicle(vehicle.id).length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-text-primary mb-4">Media</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {mediaByVehicle(vehicle.id).map((m) => (
                                                <div key={m.id} className="rounded-lg overflow-hidden border border-border-default">
                                                    {m.media_type === 'IMAGE' ? (
                                                        <a href={m.url} target="_blank" rel="noreferrer">
                                                            <img src={m.url} alt={m.caption || m.filename} className="w-full h-32 object-cover" />
                                                            {m.caption && <p className="p-2 text-xs text-text-secondary">{m.caption}</p>}
                                                        </a>
                                                    ) : m.media_type === 'VIDEO' ? (
                                                        <video src={m.url} controls className="w-full" />
                                                    ) : m.media_type === 'AUDIO' ? (
                                                        <audio src={m.url} controls className="w-full p-2" />
                                                    ) : (
                                                        <a href={m.url} download={m.filename} className="block p-4 text-sm text-primary underline">
                                                            {m.filename}
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Unassigned media */}
                    {mediaUnassigned.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-text-primary mb-4">Media</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {mediaUnassigned.map((m) => (
                                    <div key={m.id} className="rounded-lg overflow-hidden border border-border-default">
                                        {m.media_type === 'IMAGE' ? (
                                            <a href={m.url} target="_blank" rel="noreferrer">
                                                <img src={m.url} alt={m.caption || m.filename} className="w-full h-32 object-cover" />
                                            </a>
                                        ) : (
                                            <a href={m.url} download={m.filename} className="block p-4 text-sm text-primary underline">
                                                {m.filename}
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations / next steps */}
                    <div className="rounded-xl border border-border-default bg-surface-alt p-6">
                        <h2 className="text-lg font-semibold text-text-primary mb-2">Next steps</h2>
                        <p className="text-text-secondary">
                            If you have any questions about this report or would like to book a follow-up visit, please contact us.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-4 text-sm">
                            <a href={`mailto:${siteConfig.contact.email}`} className="text-primary hover:underline">
                                {siteConfig.contact.email}
                            </a>
                            <a href={`tel:${siteConfig.contact.phoneE164}`} className="text-primary hover:underline">
                                {siteConfig.contact.phoneDisplay}
                            </a>
                        </div>
                    </div>

                    {/* Legal footer */}
                    <div className="mt-8 pt-6 border-t border-border-default text-center text-sm text-text-secondary">
                        <p><strong className="text-text-primary">Tripoint Diagnostics Ltd</strong></p>
                        <p>Company No: 17038307 | 476 Sidcup Road, Eltham, London</p>
                    </div>
                </div>
            </Section>
        </>
    );
}
