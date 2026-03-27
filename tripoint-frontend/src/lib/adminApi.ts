import type { LeadFilters, LeadWithMeta, LeadsListResponse, GoogleAdsExportRecord } from '@/types/leads';

const API_BASE = '/api';

export async function adminFetch(path: string, options: RequestInit = {}): Promise<Response> {
    return fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
}

export async function adminFetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await adminFetch(path, options);
    const data = (await res.json().catch(() => ({}))) as T & { detail?: string };
    if (!res.ok) {
        throw new Error((data as { detail?: string }).detail || res.statusText || 'Request failed');
    }
    return data as T;
}

export async function fetchLeads(filters: LeadFilters): Promise<LeadsListResponse> {
    const params = new URLSearchParams();
    if (filters.page != null) params.set('page', String(filters.page));
    if (filters.per_page != null) params.set('per_page', String(filters.per_page));
    if (filters.sort_by) params.set('sort_by', filters.sort_by);
    if (filters.sort_dir) params.set('sort_dir', filters.sort_dir);
    if (filters.date_from) params.set('date_from', filters.date_from);
    if (filters.date_to) params.set('date_to', filters.date_to);
    if (filters.qualification_status) params.set('qualification_status', filters.qualification_status);
    if (filters.disqualify_reason) params.set('disqualify_reason', filters.disqualify_reason);
    if (filters.vehicle_make) params.set('vehicle_make', filters.vehicle_make);
    if (filters.lead_channel) params.set('lead_channel', filters.lead_channel);
    if (filters.event_name) params.set('event_name', filters.event_name);
    if (filters.service_interest) params.set('service_interest', filters.service_interest);
    if (filters.service_category) params.set('service_category', filters.service_category);
    if (filters.has_gclid === true) params.set('has_gclid', 'true');
    if (filters.has_gclid === false) params.set('has_gclid', 'false');
    if (filters.has_any_click_id === true) params.set('has_any_click_id', 'true');
    if (filters.has_any_click_id === false) params.set('has_any_click_id', 'false');
    if (filters.exported_to_google_ads === 'yes' || filters.exported_to_google_ads === 'no') {
        params.set('exported_to_google_ads', filters.exported_to_google_ads);
    }
    if (filters.page_type) params.set('page_type', filters.page_type);
    if (filters.search) params.set('search', filters.search);
    if (filters.identifier_type) params.set('identifier_type', filters.identifier_type);
    if (filters.google_ads_eligible === true) params.set('google_ads_eligible', 'true');
    if (filters.google_ads_eligible === false) params.set('google_ads_eligible', 'false');
    const q = params.toString();
    return adminFetchJson<LeadsListResponse>(`/admin/leads${q ? `?${q}` : ''}`);
}

export async function fetchLead(eventId: string): Promise<{ lead: LeadWithMeta }> {
    return adminFetchJson<{ lead: LeadWithMeta }>(`/admin/leads/${encodeURIComponent(eventId)}`);
}

export async function fetchJourney(journeyId: string): Promise<{ journey_id: string; events: LeadWithMeta[] }> {
    return adminFetchJson<{ journey_id: string; events: LeadWithMeta[] }>(
        `/admin/leads/journey/${encodeURIComponent(journeyId)}`
    );
}

export interface LeadPatchPayload {
    qualification_status?: string;
    disqualify_reason?: string;
    vehicle_make?: string;
    vehicle_model?: string;
    notes?: string;
    lead_value?: number | null;
    google_ads_conversion_value?: number | string | null;
    google_ads_conversion_name?: string;
}

export interface Ga4QualificationSync {
    event: string | null;
    measurement_protocol_sent: boolean | null;
    skipped_reason: string | null;
    error: string | null;
    ga4_sync_attempted?: boolean;
    ga4_sync_sent?: boolean;
    ga4_sync_skipped_reason?: string | null;
    ga4_sync_validation_messages?: string[];
    /** How ga_session_id was handled for MP (e.g. included vs skipped for Realtime). */
    ga4_sync_session_id_policy?: string | null;
}

export async function updateLead(
    eventId: string,
    payload: LeadPatchPayload
): Promise<{ ok: boolean; lead: LeadWithMeta; ga4_qualification_sync?: Ga4QualificationSync }> {
    return adminFetchJson<{ ok: boolean; lead: LeadWithMeta; ga4_qualification_sync?: Ga4QualificationSync }>(
        `/admin/leads/${encodeURIComponent(eventId)}`,
        {
            method: 'PATCH',
            body: JSON.stringify(payload),
        }
    );
}

export interface BulkUpdatePayload {
    event_ids: string[];
    updates?: Record<string, string | number | boolean>;
    mark_exported?: boolean;
    mark_not_exported?: boolean;
    queue_qualified_export?: boolean;
    queue_adjustment_export?: 'RETRACTION' | 'RESTATEMENT';
}

export async function bulkUpdateLeads(payload: BulkUpdatePayload): Promise<{
    ok: boolean;
    updated: number;
    missing_event_ids: string[];
    ga4_qualification_sync?: {
        summary: {
            qualification_transitions: number;
            measurement_protocol_succeeded: number;
            measurement_protocol_failed: number;
            skipped_ga4_not_configured: number;
            skipped_no_qualification_transition: number;
        };
        events: Array<{
            event_id: string;
            event: string;
            measurement_protocol_sent: boolean;
            skipped_reason: string | null;
            ga4_sync_attempted?: boolean;
            ga4_sync_sent?: boolean;
            ga4_sync_skipped_reason?: string | null;
            ga4_sync_validation_messages?: string[];
            ga4_sync_session_id_policy?: string | null;
        }>;
    };
}> {
    return adminFetchJson(`/admin/leads/bulk-update`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function syncSheetValidations(): Promise<{ ok: boolean }> {
    return adminFetchJson(`/admin/leads/sync-sheet-validations`, { method: 'POST' });
}

export async function exportQualified(body: {
    event_ids?: string[];
    only_not_exported?: boolean;
    write_to_sheet?: boolean;
}): Promise<{ export_id: string; batch_id: string; row_count: number; target: string; download_path: string }> {
    return adminFetchJson(`/admin/leads/google-ads/export-qualified`, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

export async function exportAdjustments(body: {
    event_ids?: string[];
    write_to_sheet?: boolean;
}): Promise<{ export_id: string; batch_id: string; row_count: number; target: string; download_path: string }> {
    return adminFetchJson(`/admin/leads/google-ads/export-adjustments`, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

export async function fetchGoogleAdsExports(): Promise<{ exports: GoogleAdsExportRecord[] }> {
    return adminFetchJson(`/admin/leads/google-ads/exports`);
}

export function getExportDownloadUrl(exportId: string): string {
    return `${API_BASE}/admin/leads/google-ads/exports/${encodeURIComponent(exportId)}`;
}
