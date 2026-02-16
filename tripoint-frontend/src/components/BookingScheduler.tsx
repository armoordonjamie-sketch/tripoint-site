import { useEffect, useMemo, useState } from 'react';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CTAButton } from './CTAButton';

interface Service {
    id: string;
    label: string;
    duration_minutes: number;
    min_notice_hours: number;
    zone_price: Record<string, number>;
}

interface AvailabilityResponse {
    postcode: string;
    zone: string;
    drive_time_minutes: number;
    travel_buffer_minutes: number;
    service_duration_minutes: number;
    booking_duration_minutes: number;
    fixed_price_gbp: number | null;
    deposit_gbp: number | null;
    manual_review_required: boolean;
    slots: string[];
}

interface BookingPayload {
    service_ids: string[];
    slot_start_iso: string;
    full_name: string;
    email: string;
    phone: string;
    postcode: string;
    address_line_1: string;
    town_city: string;
    vehicle_registration: string;
    vehicle_make: string;
    vehicle_model: string;
    approximate_mileage: string;
    symptoms: string;
    safe_location_confirmed: boolean;
    additional_notes: string;
}

const INITIAL_BOOKING: BookingPayload = {
    service_ids: [],
    slot_start_iso: '',
    full_name: '',
    email: '',
    phone: '',
    postcode: '',
    address_line_1: '',
    town_city: '',
    vehicle_registration: '',
    vehicle_make: '',
    vehicle_model: '',
    approximate_mileage: '',
    symptoms: '',
    safe_location_confirmed: false,
    additional_notes: '',
};

export function BookingScheduler() {
    const [services, setServices] = useState<Service[]>([]);
    const [booking, setBooking] = useState<BookingPayload>(INITIAL_BOOKING);
    const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loadingServices, setLoadingServices] = useState(false);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadServices = async () => {
            setLoadingServices(true);
            try {
                const response = await fetch('/api/booking/services');
                if (!response.ok) {
                    throw new Error('Could not load services');
                }
                const json = await response.json();
                setServices(json);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load services');
            } finally {
                setLoadingServices(false);
            }
        };
        void loadServices();
    }, []);

    const groupedSlots = useMemo(() => {
        if (!availability) return [] as [string, string[]][];
        const byDate: Record<string, string[]> = {};
        for (const slot of availability.slots.slice(0, 60)) {
            const d = new Date(slot);
            const key = d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
            byDate[key] = byDate[key] ?? [];
            byDate[key].push(slot);
        }
        return Object.entries(byDate);
    }, [availability]);

    const refreshAvailability = async () => {
        setError('');
        setStatus('');
        setAvailability(null);
        setSelectedSlot('');

        if (!booking.postcode || booking.service_ids.length === 0) {
            setError('Please enter postcode and select at least one service.');
            return;
        }

        setLoadingAvailability(true);
        try {
            const params = new URLSearchParams({
                postcode: booking.postcode,
                service_ids: booking.service_ids.join(','),
            });
            const response = await fetch(`/api/booking/availability?${params.toString()}`);
            const json = await response.json();
            if (!response.ok) throw new Error(json.detail || 'Failed to fetch availability');
            setAvailability(json);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Availability lookup failed');
        } finally {
            setLoadingAvailability(false);
        }
    };

    const submitBooking = async () => {
        setError('');
        setStatus('');
        if (!selectedSlot) {
            setError('Please choose an available slot first.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch('/api/booking/reserve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...booking, slot_start_iso: selectedSlot }),
            });
            const json = await response.json();
            if (!response.ok) throw new Error(json.detail || 'Booking failed');
            setStatus(json.message || 'Booking submitted');
            setBooking(INITIAL_BOOKING);
            setAvailability(null);
            setSelectedSlot('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not create booking');
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        'w-full rounded-lg border border-border-default bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand';

    return (
        <div className="space-y-6 rounded-2xl border border-border-default bg-surface-alt p-6 sm:p-8">
            <div>
                <h3 className="text-xl font-bold text-text-primary">Custom Scheduler</h3>
                <p className="mt-2 text-sm text-text-secondary">
                    Live availability from Google Calendar, 30-min slots, travel-buffer aware.
                </p>
            </div>

            {loadingServices && <p className="text-sm text-text-muted">Loading services…</p>}

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">Select services *</label>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {services.map((service) => {
                            const selected = booking.service_ids.includes(service.id);
                            return (
                                <label key={service.id} className={`rounded-lg border p-3 text-sm ${selected ? 'border-brand bg-brand/5' : 'border-border-default'}`}>
                                    <input
                                        type="checkbox"
                                        className="mr-2"
                                        checked={selected}
                                        onChange={(event) => {
                                            const next = event.target.checked
                                                ? [...booking.service_ids, service.id]
                                                : booking.service_ids.filter((id) => id !== service.id);
                                            setBooking((prev) => ({ ...prev, service_ids: next }));
                                        }}
                                    />
                                    <span className="font-medium">{service.label}</span>
                                    <span className="mt-1 block text-xs text-text-secondary">{service.duration_minutes} mins</span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">Postcode *</label>
                    <input className={inputClass} value={booking.postcode} onChange={(e) => setBooking((prev) => ({ ...prev, postcode: e.target.value.toUpperCase() }))} placeholder="e.g. ME19 4HT" />
                </div>

                <div className="flex items-end">
                    <CTAButton type="button" onClick={refreshAvailability} disabled={loadingAvailability} className="w-full">
                        {loadingAvailability ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...</> : 'Check Availability'}
                    </CTAButton>
                </div>
            </div>

            {availability && (
                <div className="rounded-xl border border-border-default bg-surface p-4">
                    <p className="text-sm text-text-secondary">
                        Zone: <strong>{availability.zone}</strong> • Drive time: <strong>{availability.drive_time_minutes} mins</strong> • Fixed price: <strong>{availability.fixed_price_gbp ? `£${availability.fixed_price_gbp}` : 'Quote required'}</strong> • Deposit: <strong>{availability.deposit_gbp ? `£${availability.deposit_gbp}` : 'TBC'}</strong>
                    </p>
                    {availability.manual_review_required ? (
                        <p className="mt-3 text-sm text-warning">This postcode is over 60 minutes away. Please submit details and we&apos;ll review manually.</p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {groupedSlots.length === 0 && <p className="text-sm text-text-muted">No slots found in next 30 days.</p>}
                            {groupedSlots.map(([day, slots]) => (
                                <div key={day}>
                                    <p className="mb-2 text-sm font-semibold text-text-primary">{day}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {slots.map((slotIso) => {
                                            const isSelected = selectedSlot === slotIso;
                                            return (
                                                <button
                                                    key={slotIso}
                                                    type="button"
                                                    className={`rounded-md border px-3 py-1.5 text-sm ${isSelected ? 'border-brand bg-brand text-white' : 'border-border-default bg-surface text-text-primary'}`}
                                                    onClick={() => setSelectedSlot(slotIso)}
                                                >
                                                    {new Date(slotIso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                <input className={inputClass} placeholder="Full name *" value={booking.full_name} onChange={(e) => setBooking((p) => ({ ...p, full_name: e.target.value }))} />
                <input className={inputClass} placeholder="Email *" type="email" value={booking.email} onChange={(e) => setBooking((p) => ({ ...p, email: e.target.value }))} />
                <input className={inputClass} placeholder="Phone *" value={booking.phone} onChange={(e) => setBooking((p) => ({ ...p, phone: e.target.value }))} />
                <input className={inputClass} placeholder="Address line 1 *" value={booking.address_line_1} onChange={(e) => setBooking((p) => ({ ...p, address_line_1: e.target.value }))} />
                <input className={inputClass} placeholder="Town / City *" value={booking.town_city} onChange={(e) => setBooking((p) => ({ ...p, town_city: e.target.value }))} />
                <input className={inputClass} placeholder="Vehicle registration *" value={booking.vehicle_registration} onChange={(e) => setBooking((p) => ({ ...p, vehicle_registration: e.target.value.toUpperCase() }))} />
                <input className={inputClass} placeholder="Vehicle make *" value={booking.vehicle_make} onChange={(e) => setBooking((p) => ({ ...p, vehicle_make: e.target.value }))} />
                <input className={inputClass} placeholder="Vehicle model *" value={booking.vehicle_model} onChange={(e) => setBooking((p) => ({ ...p, vehicle_model: e.target.value }))} />
                <input className={inputClass} placeholder="Approx. mileage *" value={booking.approximate_mileage} onChange={(e) => setBooking((p) => ({ ...p, approximate_mileage: e.target.value }))} />
                <textarea className={`${inputClass} sm:col-span-2`} placeholder="Symptoms / warning lights *" value={booking.symptoms} onChange={(e) => setBooking((p) => ({ ...p, symptoms: e.target.value }))} rows={4} />
                <textarea className={`${inputClass} sm:col-span-2`} placeholder="Additional notes" value={booking.additional_notes} onChange={(e) => setBooking((p) => ({ ...p, additional_notes: e.target.value }))} rows={3} />
            </div>

            <label className="flex items-start gap-3 text-sm text-text-secondary">
                <input
                    type="checkbox"
                    className="mt-1"
                    checked={booking.safe_location_confirmed}
                    onChange={(e) => setBooking((p) => ({ ...p, safe_location_confirmed: e.target.checked }))}
                />
                Vehicle is parked in a safe working location (driveway, depot, yard - not a live road).
            </label>

            {error && (
                <div className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {status && (
                <div className="flex items-start gap-2 rounded-lg border border-success/20 bg-success/5 p-3 text-sm text-success">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{status}</p>
                </div>
            )}

            <CTAButton type="button" onClick={submitBooking} disabled={submitting || !availability || availability.manual_review_required} className="w-full sm:w-auto">
                {submitting ? 'Submitting booking…' : 'Confirm Booking'}
            </CTAButton>
        </div>
    );
}
