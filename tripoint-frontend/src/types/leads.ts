/** Mirror python-scripts/lead_constants.py */

export const QUALIFICATION_STATUS_OPTIONS = ['pending', 'qualified', 'disqualified', 'won'] as const;
export type QualificationStatus = (typeof QUALIFICATION_STATUS_OPTIONS)[number];

export const DISQUALIFY_REASON_OPTIONS = [
    'wrong_vehicle_make',
    'wrong_service',
    'wrong_area',
    'price_shopping',
    'spam',
    'no_response',
    'other',
] as const;
export type DisqualifyReason = (typeof DISQUALIFY_REASON_OPTIONS)[number];

export const VEHICLE_MAKE_OPTIONS = ['Mercedes', 'Other', 'Unknown'] as const;
export type VehicleMake = (typeof VEHICLE_MAKE_OPTIONS)[number];

export const ADJUSTMENT_TYPES = ['RETRACTION', 'RESTATEMENT'] as const;
export type AdjustmentType = (typeof ADJUSTMENT_TYPES)[number];

/** All Leads sheet columns (base + Google Ads ops). */
export interface LeadRow {
    journey_id: string;
    event_id: string;
    occurred_at: string;
    event_name: string;
    lead_channel: string;
    click_location: string;
    nav_label: string;
    nav_target: string;
    contact_method: string;
    lead_type: string;
    form_name: string;
    service_interest: string;
    payment_completed: string;
    page: string;
    title: string;
    page_type: string;
    service_category: string;
    service_name: string;
    area_slug: string;
    booking_step: string;
    zone_result: string;
    content_type: string;
    content_id: string;
    lead_value: string;
    gclid: string;
    gbraid: string;
    wbraid: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_content: string;
    utm_term: string;
    qualification_status: string;
    disqualify_reason: string;
    vehicle_make: string;
    vehicle_model: string;
    notes: string;
    google_ads_export_status: string;
    google_ads_export_type: string;
    google_ads_conversion_name: string;
    google_ads_conversion_value: string;
    google_ads_currency: string;
    google_ads_exported_at: string;
    google_ads_export_batch_id: string;
    google_ads_adjustment_type: string;
    google_ads_adjustment_value: string;
    google_ads_last_error: string;
    google_ads_eligible: string;
    google_ads_identifier_type: string;
    google_ads_identifier_value: string;
    /** Set to `exclude` to skip offline export tab for this row (manual override). */
    google_ads_export_override?: string;
    /** GA4 web client_id (Measurement Protocol) */
    ga_client_id: string;
    /** GA4 session id from web stream cookie */
    ga_session_id: string;
    /** Set when lead becomes qualified (offline conversion time); absent until column exists / set */
    qualified_at?: string;
    /** Set when lead becomes won */
    won_at?: string;
}

/** Computed fields returned by API */
export interface LeadEnrichment {
    has_click_id: boolean;
    identifier_type: string;
    identifier_value: string;
    ads_exportable: boolean;
    needs_adjustment: boolean;
    export_reason: string;
    ineligible_reason: string;
    computed_conversion_name: string;
    computed_conversion_value: number;
    computed_currency: string;
}

export type LeadWithMeta = LeadRow & LeadEnrichment;

export interface LeadsListResponse {
    leads: LeadWithMeta[];
    total: number;
    page: number;
    per_page: number;
    sheet_url: string | null;
}

export interface LeadFilters {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
    date_from?: string;
    date_to?: string;
    qualification_status?: string;
    disqualify_reason?: string;
    vehicle_make?: string;
    lead_channel?: string;
    event_name?: string;
    service_interest?: string;
    service_category?: string;
    has_gclid?: boolean;
    has_any_click_id?: boolean;
    exported_to_google_ads?: 'yes' | 'no' | '';
    page_type?: string;
    search?: string;
    /** Resolved click id: gclid | wbraid | gbraid | none */
    identifier_type?: string;
    /** Filter by computed ads_exportable (qualified/won + click id + conversion name) */
    google_ads_eligible?: boolean;
}

export interface GoogleAdsExportRecord {
    id: string;
    created_at: string;
    export_type: string;
    row_count: number;
    target: string | null;
    sheet_tab_written: string | null;
    status: string;
    error_message: string | null;
}

export function isAdsEligible(lead: LeadWithMeta): boolean {
    return lead.ads_exportable === true;
}
