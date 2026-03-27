import { useCallback } from 'react';
import type { LeadFilters as LeadFiltersState } from '@/types/leads';

interface LeadFiltersProps {
    filters: LeadFiltersState;
    onChange: (next: LeadFiltersState) => void;
    sticky?: boolean;
}

export function LeadFilters({ filters, onChange, sticky }: LeadFiltersProps) {
    const set = useCallback(
        (patch: Partial<LeadFiltersState>) => {
            onChange({ ...filters, ...patch, page: 1 });
        },
        [filters, onChange]
    );

    const clear = () => {
        onChange({
            page: 1,
            per_page: filters.per_page ?? 50,
            sort_by: filters.sort_by ?? 'occurred_at',
            sort_dir: filters.sort_dir ?? 'desc',
        });
    };

    return (
        <div
            className={`space-y-3 rounded-xl border border-border-default bg-surface-alt p-4 ${
                sticky ? 'sticky top-0 z-20 shadow-md' : ''
            }`}
        >
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-text-muted">Quick:</span>
                <button
                    type="button"
                    onClick={() => set({ qualification_status: '', search: '', exported_to_google_ads: '' })}
                    className="rounded-full border border-border-default bg-surface px-2 py-0.5 text-xs text-text-secondary hover:bg-surface-alt"
                >
                    Clear filters
                </button>
                <button
                    type="button"
                    onClick={() =>
                        set({
                            qualification_status: '',
                            exported_to_google_ads: 'no',
                            search: '',
                        })
                    }
                    className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-200 hover:bg-amber-500/20"
                >
                    Unqualified / pending review
                </button>
                <button
                    type="button"
                    onClick={() =>
                        set({
                            has_any_click_id: true,
                            exported_to_google_ads: 'no',
                            qualification_status: 'qualified',
                            search: '',
                        })
                    }
                    className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-xs text-success hover:bg-success/20"
                >
                    Ads eligible (qualified, not exported)
                </button>
                <button
                    type="button"
                    onClick={() => set({ has_gclid: true, search: '' })}
                    className="rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-xs text-brand hover:bg-brand/20"
                >
                    Has GCLID
                </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                <label className="flex flex-col gap-1 text-xs">
                    <span className="text-text-muted">Search</span>
                    <input
                        type="search"
                        value={filters.search ?? ''}
                        onChange={(e) => set({ search: e.target.value })}
                        placeholder="Notes, page, IDs…"
                        className="rounded-lg border border-border-default bg-surface px-2 py-1.5 text-sm text-text-primary"
                    />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                    <span className="text-text-muted">From (date)</span>
                    <input
                        type="date"
                        value={filters.date_from?.slice(0, 10) ?? ''}
                        onChange={(e) => set({ date_from: e.target.value ? `${e.target.value}T00:00:00` : undefined })}
                        className="rounded-lg border border-border-default bg-surface px-2 py-1.5 text-sm text-text-primary"
                    />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                    <span className="text-text-muted">To (date)</span>
                    <input
                        type="date"
                        value={filters.date_to?.slice(0, 10) ?? ''}
                        onChange={(e) => set({ date_to: e.target.value ? `${e.target.value}T23:59:59` : undefined })}
                        className="rounded-lg border border-border-default bg-surface px-2 py-1.5 text-sm text-text-primary"
                    />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                    <span className="text-text-muted">Qualification</span>
                    <select
                        value={filters.qualification_status ?? ''}
                        onChange={(e) => set({ qualification_status: e.target.value || undefined })}
                        className="rounded-lg border border-border-default bg-surface px-2 py-1.5 text-sm text-text-primary"
                    >
                        <option value="">Any</option>
                        <option value="pending">pending</option>
                        <option value="qualified">qualified</option>
                        <option value="disqualified">disqualified</option>
                        <option value="won">won</option>
                    </select>
                </label>
                <label className="flex flex-col gap-1 text-xs">
                    <span className="text-text-muted">Disqualify reason</span>
                    <select
                        value={filters.disqualify_reason ?? ''}
                        onChange={(e) => set({ disqualify_reason: e.target.value || undefined })}
                        className="rounded-lg border border-border-default bg-surface px-2 py-1.5 text-sm text-text-primary"
                    >
                        <option value="">Any</option>
                        <option value="wrong_vehicle_make">wrong_vehicle_make</option>
                        <option value="wrong_service">wrong_service</option>
                        <option value="wrong_area">wrong_area</option>
                        <option value="price_shopping">price_shopping</option>
                        <option value="spam">spam</option>
                        <option value="no_response">no_response</option>
                        <option value="other">other</option>
                    </select>
                </label>
                <label className="flex flex-col gap-1 text-xs">
                    <span className="text-text-muted">Vehicle make</span>
                    <select
                        value={filters.vehicle_make ?? ''}
                        onChange={(e) => set({ vehicle_make: e.target.value || undefined })}
                        className="rounded-lg border border-border-default bg-surface px-2 py-1.5 text-sm text-text-primary"
                    >
                        <option value="">Any</option>
                        <option value="Mercedes">Mercedes</option>
                        <option value="Other">Other</option>
                        <option value="Unknown">Unknown</option>
                    </select>
                </label>
                <label className="flex flex-col gap-1 text-xs">
                    <span className="text-text-muted">Lead channel</span>
                    <input
                        type="text"
                        value={filters.lead_channel ?? ''}
                        onChange={(e) => set({ lead_channel: e.target.value || undefined })}
                        className="rounded-lg border border-border-default bg-surface px-2 py-1.5 text-sm text-text-primary"
                    />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                    <span className="text-text-muted">Event name</span>
                    <input
                        type="text"
                        value={filters.event_name ?? ''}
                        onChange={(e) => set({ event_name: e.target.value || undefined })}
                        placeholder="e.g. whatsapp_click"
                        className="rounded-lg border border-border-default bg-surface px-2 py-1.5 text-sm text-text-primary"
                    />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                    <span className="text-text-muted">Service interest</span>
                    <input
                        type="text"
                        value={filters.service_interest ?? ''}
                        onChange={(e) => set({ service_interest: e.target.value || undefined })}
                        className="rounded-lg border border-border-default bg-surface px-2 py-1.5 text-sm text-text-primary"
                    />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                    <span className="text-text-muted">Service category</span>
                    <input
                        type="text"
                        value={filters.service_category ?? ''}
                        onChange={(e) => set({ service_category: e.target.value || undefined })}
                        className="rounded-lg border border-border-default bg-surface px-2 py-1.5 text-sm text-text-primary"
                    />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                    <span className="text-text-muted">Page type</span>
                    <input
                        type="text"
                        value={filters.page_type ?? ''}
                        onChange={(e) => set({ page_type: e.target.value || undefined })}
                        className="rounded-lg border border-border-default bg-surface px-2 py-1.5 text-sm text-text-primary"
                    />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                    <span className="text-text-muted">Has GCLID</span>
                    <select
                        value={
                            filters.has_gclid === true ? 'yes' : filters.has_gclid === false ? 'no' : ''
                        }
                        onChange={(e) => {
                            const v = e.target.value;
                            set({
                                has_gclid: v === 'yes' ? true : v === 'no' ? false : undefined,
                            });
                        }}
                        className="rounded-lg border border-border-default bg-surface px-2 py-1.5 text-sm text-text-primary"
                    >
                        <option value="">Any</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </label>
                <label className="flex flex-col gap-1 text-xs">
                    <span className="text-text-muted">Any click ID</span>
                    <select
                        value={
                            filters.has_any_click_id === true
                                ? 'yes'
                                : filters.has_any_click_id === false
                                  ? 'no'
                                  : ''
                        }
                        onChange={(e) => {
                            const v = e.target.value;
                            set({
                                has_any_click_id: v === 'yes' ? true : v === 'no' ? false : undefined,
                            });
                        }}
                        className="rounded-lg border border-border-default bg-surface px-2 py-1.5 text-sm text-text-primary"
                    >
                        <option value="">Any</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </label>
                <label className="flex flex-col gap-1 text-xs">
                    <span className="text-text-muted">Exported to Google Ads</span>
                    <select
                        value={filters.exported_to_google_ads ?? ''}
                        onChange={(e) =>
                            set({
                                exported_to_google_ads:
                                    e.target.value === 'yes' || e.target.value === 'no'
                                        ? e.target.value
                                        : '',
                            })
                        }
                        className="rounded-lg border border-border-default bg-surface px-2 py-1.5 text-sm text-text-primary"
                    >
                        <option value="">Any</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </label>
            </div>
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={clear}
                    className="text-xs text-text-muted underline hover:text-text-primary"
                >
                    Reset date & quick filters
                </button>
            </div>
        </div>
    );
}
