import { useEffect, useMemo, useState, useRef } from 'react';
import { Loader2, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Calendar, Search, MapPin, Car, Wrench, User, CreditCard } from 'lucide-react';
import { CTAButton } from './CTAButton';
import { trackEvent } from '@/lib/analytics';

/* ---------- types ---------- */
interface Service {
    id: string;
    label: string;
    duration_minutes: number;
    min_notice_hours: number;
    zone_price: Record<string, number>;
}

interface SlotItem { iso: string; available: boolean; }

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
    slots: SlotItem[];
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

/* ---------- service helpers ---------- */
const SERVICE_HELPERS: Record<string, string> = {
    'diagnostic-callout':
        'Full-system scan with dealer tools (Xentry), live data validation, guided tests. Written fix plan - no guesswork.',
    'vor-priority-triage':
        'Commercial downtime focus. Dealer-level triage for off-road vehicles - documented rentable/not-rentable decision.',
    'vor-van-diagnostics':
        'Same-day priority triage for off-road commercial vans. Fast back-on-road decision with documented outcome.',
    'emissions-fault-decision':
        'AdBlue, SCR, DPF, NOx. Root cause diagnosis with live data and guided tests. Written outcome and next steps.',
    'adblue-countdown':
        'NOx sensors, dosing faults, heater circuits - diagnosed properly with live data, not just code-cleared.',
    'dpf-regeneration-decision':
        'Soot load, sensor plausibility, and regen safety checks before any forced regen. Clear go/no-go outcome.',
    'nox-scr-diagnostics':
        'Sensor drift, heater circuits, catalytic performance - tested with live data and documented findings.',
    'sprinter-limp-mode':
        'Turbo, boost, fuel rail, EGR, and wiring - systematic derate diagnosis for Mercedes Sprinters.',
    'intermittent-electrical-faults':
        'Random faults, wiring issues, and connector failures traced with live data and wiggle tests.',
    'mercedes-xentry-diagnostics':
        'OEM-level Xentry access for SCN coding, adaptations, DAS guided tests, and module initialisation.',
    'pre-purchase-health-check':
        'Dealer-grade digital health check before you buy. Full scan, live data, documented findings.',
    'fleet-health-check':
        'Proactive diagnostic sweep across your fleet - fault status, DPF health, and priority action list.',
};

const DEFAULT_SERVICE = 'diagnostic-callout';

function getServiceHelper(id: string): string {
    return SERVICE_HELPERS[id] ?? id.replace(/-/g, ' ');
}

/* ---------- step indicator ---------- */
const STEPS = [
    { num: 1, label: 'Service & Location', icon: Wrench },
    { num: 2, label: 'Choose Slot', icon: Calendar },
    { num: 3, label: 'Your Details', icon: User },
] as const;

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
    return (
        <div className="flex items-center justify-center gap-0 mb-8">
            {STEPS.map((s, i) => {
                const done = current > s.num;
                const active = current === s.num;
                const Icon = s.icon;
                return (
                    <div key={s.num} className="flex items-center">
                        {i > 0 && (
                            <div className={`hidden sm:block w-12 h-0.5 mx-1 transition-all duration-500 ${done ? 'bg-brand' : 'bg-border-default'}`} />
                        )}
                        <div className="flex items-center gap-2">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${done
                                ? 'bg-brand text-white scale-90'
                                : active
                                    ? 'bg-brand text-white ring-4 ring-brand/20 scale-105'
                                    : 'bg-surface-elevated text-text-muted border border-border-default'
                                }`}>
                                {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                            </div>
                            <span className={`hidden sm:inline text-sm font-medium transition-colors duration-300 ${active ? 'text-text-primary' : done ? 'text-brand' : 'text-text-muted'}`}>
                                {s.label}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ---------- slot calendar ---------- */
function SlotCalendar({
    dateKeys, dateAvailability, selectedDateKey, onSelectDate,
}: {
    dateKeys: string[];
    dateAvailability: Record<string, { hasAvailable: boolean; hasTaken: boolean }>;
    selectedDateKey: string;
    onSelectDate: (dateKey: string) => void;
}) {
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    if (dateKeys.length === 0) return null;

    const firstDate = new Date(dateKeys[0]);
    const firstDow = (firstDate.getDay() + 6) % 7;
    const cells = [...Array(firstDow).fill(null), ...dateKeys];

    return (
        <div className="min-w-[280px]">
            <p className="mb-3 text-center text-sm font-semibold text-text-primary">
                {(() => {
                    const last = new Date(dateKeys[dateKeys.length - 1]);
                    return firstDate.getMonth() !== last.getMonth()
                        ? `${firstDate.toLocaleDateString('en-GB', { month: 'short' })} – ${last.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`
                        : firstDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
                })()}
            </p>
            <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map((d) => (
                    <div key={d} className="text-xs font-medium text-text-muted">{d}</div>
                ))}
                {cells.map((dateKey, i) => {
                    if (!dateKey) return <div key={`pad-${i}`} />;
                    const info = dateAvailability[dateKey];
                    const isSelected = dateKey === selectedDateKey;
                    const hasAvailable = info?.hasAvailable ?? false;
                    const hasTaken = info?.hasTaken ?? false;
                    return (
                        <button
                            key={dateKey} type="button"
                            onClick={() => onSelectDate(dateKey)}
                            className={`aspect-square rounded text-sm font-medium transition-all duration-200 ${hasAvailable ? 'bg-success/20 text-success hover:bg-success/40'
                                : hasTaken ? 'bg-surface-elevated text-text-muted hover:bg-surface'
                                    : 'bg-surface text-text-muted'
                                } ${isSelected ? 'ring-2 ring-brand ring-offset-2' : ''}`}
                            title={hasAvailable ? 'Has available slots' : 'All slots taken'}
                        >
                            {new Date(dateKey).getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ---------- animated step wrapper ---------- */
function StepPanel({ active, direction, children }: { active: boolean; direction: 'forward' | 'back'; children: React.ReactNode }) {
    const [mounted, setMounted] = useState(active);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (active) {
            setMounted(true);
            // Small delay to trigger CSS transition
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setVisible(true));
            });
        } else {
            setVisible(false);
            const timer = setTimeout(() => setMounted(false), 400);
            return () => clearTimeout(timer);
        }
    }, [active]);

    if (!mounted) return null;

    const enterFrom = direction === 'forward' ? 'translate-x-8' : '-translate-x-8';

    return (
        <div
            className={`transition-all duration-400 ease-out ${visible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${enterFrom} translate-y-2`
                }`}
        >
            {children}
        </div>
    );
}

/* ---------- main component ---------- */
const INITIAL_BOOKING: BookingPayload = {
    service_ids: [DEFAULT_SERVICE],
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

interface BookingSchedulerProps {
    zoneCalcPostcode?: string | null;
}

export function BookingScheduler({ zoneCalcPostcode }: BookingSchedulerProps) {
    const [services, setServices] = useState<Service[]>([]);
    const [booking, setBooking] = useState<BookingPayload>(INITIAL_BOOKING);
    const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loadingServices, setLoadingServices] = useState(false);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);
    const [prevStep, setPrevStep] = useState<1 | 2 | 3>(1);

    // Derive step from state
    const currentStep: 1 | 2 | 3 = availability && !availability.manual_review_required
        ? (selectedSlot ? 3 : 2)
        : 1;

    const direction: 'forward' | 'back' = currentStep >= prevStep ? 'forward' : 'back';

    useEffect(() => {
        if (currentStep !== prevStep) {
            setPrevStep(currentStep);
        }
    }, [currentStep, prevStep]);

    /* load services */
    useEffect(() => {
        const loadServices = async () => {
            setLoadingServices(true);
            try {
                const response = await fetch('/api/booking/services');
                if (!response.ok) throw new Error('Could not load services');
                setServices(await response.json());
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load services');
            } finally {
                setLoadingServices(false);
            }
        };
        void loadServices();
    }, []);

    /* sync postcode from zone calculator */
    useEffect(() => {
        if (zoneCalcPostcode) {
            setBooking((prev) => ({ ...prev, postcode: zoneCalcPostcode }));
        }
    }, [zoneCalcPostcode]);

    /* fetch availability */
    const fetchAvailability = async (postcode: string, serviceIds: string[]) => {
        if (!postcode || serviceIds.length === 0) return;
        setError('');
        setStatus('');
        setAvailability(null);
        setSelectedSlot('');
        setLoadingAvailability(true);
        try {
            const params = new URLSearchParams({ postcode, service_ids: serviceIds.join(',') });
            const response = await fetch(`/api/booking/availability?${params.toString()}`);
            const json = await response.json();
            if (!response.ok) throw new Error(json.detail || 'Failed to fetch availability');
            setAvailability(json);
            setSelectedDateIndex(0);
            trackEvent('zone_check');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Availability lookup failed');
        } finally {
            setLoadingAvailability(false);
        }
    };

    /* close calendar on outside click */
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
                setCalendarOpen(false);
            }
        };
        if (calendarOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [calendarOpen]);

    /* group slots by date */
    const { groupedSlots, dateKeys, dateAvailability } = useMemo(() => {
        if (!availability) {
            return {
                groupedSlots: [] as { dateKey: string; label: string; slots: SlotItem[] }[],
                dateKeys: [] as string[],
                dateAvailability: {} as Record<string, { hasAvailable: boolean; hasTaken: boolean }>,
            };
        }
        const byDateKey: Record<string, { label: string; slots: SlotItem[] }> = {};
        for (const slot of availability.slots) {
            const d = new Date(slot.iso);
            const dateKey = d.toISOString().slice(0, 10);
            const label = d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
            if (!byDateKey[dateKey]) {
                if (Object.keys(byDateKey).length >= 30) break;
                byDateKey[dateKey] = { label, slots: [] };
            }
            byDateKey[dateKey].slots.push(slot);
        }
        const dKeys = Object.keys(byDateKey);
        const grouped = dKeys.map((dk) => ({ dateKey: dk, label: byDateKey[dk].label, slots: byDateKey[dk].slots }));
        const dateAvail: Record<string, { hasAvailable: boolean; hasTaken: boolean }> = {};
        for (const { dateKey, slots } of grouped) {
            dateAvail[dateKey] = { hasAvailable: slots.some((s) => s.available), hasTaken: slots.some((s) => !s.available) };
        }
        return { groupedSlots: grouped, dateKeys: dKeys, dateAvailability: dateAvail };
    }, [availability]);

    /* check availability */
    const refreshAvailability = async () => {
        if (!booking.postcode) { setError('Please enter your postcode.'); return; }
        if (booking.service_ids.length === 0) { setError('Please select a service.'); return; }
        await fetchAvailability(booking.postcode, booking.service_ids);
    };

    /* go back to step 1 */
    const goBackToStep1 = () => {
        setAvailability(null);
        setSelectedSlot('');
    };

    /* go back to step 2 */
    const goBackToStep2 = () => {
        setSelectedSlot('');
    };

    /* submit booking */
    const submitBooking = async () => {
        setError('');
        setStatus('');
        if (!selectedSlot && !availability?.manual_review_required) { setError('Please choose an available slot first.'); return; }

        // Validate required fields
        const missing: string[] = [];
        if (!booking.full_name.trim() || booking.full_name.trim().length < 2) missing.push('Full name');
        if (!booking.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email)) missing.push('Valid email address');
        if (!booking.phone.trim() || booking.phone.trim().length < 7) missing.push('Phone number');
        if (!booking.address_line_1.trim() || booking.address_line_1.trim().length < 2) missing.push('Address line 1');
        if (!booking.town_city.trim() || booking.town_city.trim().length < 2) missing.push('Town / City');
        if (!booking.vehicle_registration.trim() || booking.vehicle_registration.trim().length < 2) missing.push('Vehicle registration');
        if (!booking.vehicle_make.trim()) missing.push('Vehicle make');
        if (!booking.vehicle_model.trim()) missing.push('Vehicle model');
        if (!booking.approximate_mileage.trim()) missing.push('Approximate mileage');
        if (!booking.symptoms.trim() || booking.symptoms.trim().length < 2) missing.push('Symptoms / fault description');

        if (missing.length > 0) {
            setError(`Please fill in: ${missing.join(', ')}`);
            return;
        }

        if (!booking.safe_location_confirmed) {
            setError('Please confirm the vehicle is in a safe working location.');
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
            trackEvent('confirm_booking');
            if (json.status === 'pending_deposit' && json.payment_url) {
                window.location.href = json.payment_url;
                return;
            }
            if (json.status === 'pending_manual_review') {
                setStatus(json.message || 'We\'ll contact you with a quote.');
                setBooking(INITIAL_BOOKING);
                setAvailability(null);
                setSelectedSlot('');
                return;
            }
            setStatus(json.message || 'Booking submitted! Check your email for confirmation.');
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
        'w-full rounded-lg border border-border-default bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors duration-200';
    const labelClass = 'block text-sm font-medium text-text-secondary mb-1.5';
    const selectedService = services.find((s) => booking.service_ids.includes(s.id));

    return (
        <div className="space-y-0">
            <StepIndicator current={currentStep} />

            {/* Zone summary bar - persistent once fetched */}
            {availability && (
                <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
                    {[
                        { label: 'Zone', value: availability.zone, accent: true },
                        { label: 'Drive time', value: `${Math.round(availability.drive_time_minutes)} min` },
                        { label: 'Fixed price', value: availability.fixed_price_gbp ? `£${availability.fixed_price_gbp}` : 'Quote', accent: true },
                        { label: 'Deposit', value: availability.deposit_gbp ? `£${availability.deposit_gbp}` : 'TBC' },
                    ].map((item) => (
                        <div key={item.label} className="rounded-xl border border-brand/15 bg-brand/5 px-4 py-3 text-center">
                            <p className="text-[11px] uppercase tracking-wider text-text-muted mb-0.5">{item.label}</p>
                            <p className={`text-lg font-bold ${item.accent ? 'text-brand-light' : 'text-text-primary'}`}>{item.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* ===== STEP 1: Service & Location ===== */}
            <StepPanel active={currentStep === 1} direction={direction}>
                <div className="rounded-2xl border border-border-default bg-surface-alt p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                            <Wrench className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary">Service & Location</h3>
                            <p className="text-xs text-text-muted">Choose your service and enter your postcode</p>
                        </div>
                    </div>

                    {loadingServices && <p className="text-sm text-text-muted">Loading services…</p>}

                    <div className="grid gap-5 sm:grid-cols-2">
                        {/* Service dropdown */}
                        <div className="sm:col-span-2">
                            <label htmlFor="service-select" className={labelClass}>Service *</label>
                            <select
                                id="service-select"
                                value={booking.service_ids[0] || ''}
                                onChange={(e) => {
                                    setBooking((prev) => ({ ...prev, service_ids: [e.target.value] }));
                                    setAvailability(null);
                                    setSelectedSlot('');
                                }}
                                className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-no-repeat pr-10`}
                            >
                                {services.map((s) => (
                                    <option key={s.id} value={s.id}>{s.label} - {s.duration_minutes} mins</option>
                                ))}
                            </select>

                            {selectedService && (
                                <p className="mt-2 text-xs text-text-muted leading-relaxed">
                                    {getServiceHelper(selectedService.id)}
                                </p>
                            )}
                            <p className="mt-1.5 text-xs text-text-muted">
                                Not sure which service? <a href="/services" className="text-brand hover:text-brand-light underline">View all services</a> or <a href="https://wa.me/message/NROKKGS6QK54G1" target="_blank" rel="noopener noreferrer" className="text-brand hover:text-brand-light underline">message us on WhatsApp</a>.
                            </p>
                        </div>

                        {/* Postcode */}
                        <div>
                            <label htmlFor="booking-postcode" className={labelClass}>
                                <MapPin className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                                Postcode *
                            </label>
                            <input
                                id="booking-postcode"
                                className={inputClass}
                                value={booking.postcode}
                                onChange={(e) => {
                                    setBooking((prev) => ({ ...prev, postcode: e.target.value.toUpperCase() }));
                                    setAvailability(null);
                                    setSelectedSlot('');
                                }}
                                placeholder="e.g. ME19 4HT"
                            />
                        </div>

                        {/* Check Availability */}
                        <div className="flex items-end">
                            <CTAButton
                                type="button"
                                onClick={refreshAvailability}
                                disabled={loadingAvailability}
                                className="w-full"
                                icon={loadingAvailability ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            >
                                {loadingAvailability ? 'Checking…' : 'Check Availability'}
                            </CTAButton>
                        </div>
                    </div>

                    {availability?.manual_review_required && (
                        <p className="mt-4 text-sm text-warning">
                            This postcode is over 60 minutes away. Fill in your details below and we'll review manually.
                        </p>
                    )}
                </div>
            </StepPanel>

            {/* ===== STEP 2: Choose a Slot ===== */}
            <StepPanel active={currentStep === 2} direction={direction}>
                <div className="rounded-2xl border border-border-default bg-surface-alt p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-text-primary">Choose a Slot</h3>
                                <p className="text-xs text-text-muted">Mon–Sat, 6 AM – 10 PM • 30-min starts</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={goBackToStep1}
                            className="flex items-center gap-1 text-xs text-text-muted hover:text-brand transition-colors"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                            Change service
                        </button>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 mb-4 text-xs text-text-muted">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-sm bg-success/60" aria-hidden />
                            Available
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-sm bg-surface-elevated border border-border-default" aria-hidden />
                            Taken
                        </span>
                    </div>

                    {groupedSlots.length === 0 ? (
                        <p className="text-sm text-text-muted">No slots found in the next 30 days.</p>
                    ) : (
                        <>
                            {/* Date navigator */}
                            <div className="flex items-center justify-between rounded-xl border border-border-default bg-surface p-3 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setSelectedDateIndex((i) => Math.max(0, i - 1))}
                                    disabled={selectedDateIndex === 0}
                                    className="rounded-lg p-2 text-text-secondary transition-all hover:bg-surface-alt hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                                    aria-label="Previous day"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <div className="relative" ref={calendarRef}>
                                    <button
                                        type="button"
                                        onClick={() => setCalendarOpen((o) => !o)}
                                        className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-text-primary transition-all hover:bg-surface-alt"
                                    >
                                        <Calendar className="h-4 w-4 text-brand" />
                                        {groupedSlots[selectedDateIndex]?.label}
                                    </button>
                                    {calendarOpen && (
                                        <div className="absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 rounded-xl border border-border-default bg-surface-alt p-4 shadow-xl">
                                            <SlotCalendar
                                                dateKeys={dateKeys}
                                                dateAvailability={dateAvailability}
                                                selectedDateKey={dateKeys[selectedDateIndex]}
                                                onSelectDate={(dateKey) => {
                                                    const idx = dateKeys.indexOf(dateKey);
                                                    if (idx >= 0) setSelectedDateIndex(idx);
                                                    setCalendarOpen(false);
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedDateIndex((i) => Math.min(groupedSlots.length - 1, i + 1))}
                                    disabled={selectedDateIndex >= groupedSlots.length - 1}
                                    className="rounded-lg p-2 text-text-secondary transition-all hover:bg-surface-alt hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                                    aria-label="Next day"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Time grid */}
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
                                {groupedSlots[selectedDateIndex]?.slots.map((slot) => {
                                    const isSelected = selectedSlot === slot.iso;
                                    const isAvailable = slot.available;
                                    const timeStr = new Date(slot.iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
                                    return (
                                        <button
                                            key={slot.iso}
                                            type="button"
                                            disabled={!isAvailable}
                                            className={`rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 ${!isAvailable
                                                ? 'border border-border-default bg-surface-alt text-text-muted/50 cursor-not-allowed line-through'
                                                : isSelected
                                                    ? 'border-2 border-brand bg-brand text-white shadow-lg shadow-brand/25 scale-105'
                                                    : 'border border-success/30 bg-success/5 text-text-primary hover:border-brand hover:bg-brand/10 hover:scale-105'
                                                }`}
                                            onClick={() => isAvailable && setSelectedSlot(slot.iso)}
                                            title={!isAvailable ? 'Taken' : `Available - ${timeStr}`}
                                        >
                                            {timeStr}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </StepPanel>

            {/* ===== STEP 3: Your Details ===== */}
            <StepPanel active={currentStep === 3 || !!availability?.manual_review_required} direction={direction}>
                <div className="rounded-2xl border border-border-default bg-surface-alt p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-text-primary">Your Details</h3>
                                <p className="text-xs text-text-muted">Confirmation and report sent to this email</p>
                            </div>
                        </div>
                        {!availability?.manual_review_required && (
                            <button
                                type="button"
                                onClick={goBackToStep2}
                                className="flex items-center gap-1 text-xs text-text-muted hover:text-brand transition-colors"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                Change slot
                            </button>
                        )}
                    </div>

                    {/* Selected slot reminder */}
                    {selectedSlot && (
                        <div className="mb-6 flex items-center gap-3 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3">
                            <CheckCircle2 className="h-5 w-5 text-brand shrink-0" />
                            <div className="text-sm">
                                <span className="font-semibold text-text-primary">
                                    {new Date(selectedSlot).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long' })}
                                </span>
                                <span className="text-text-muted"> at </span>
                                <span className="font-semibold text-brand-light">
                                    {new Date(selectedSlot).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </span>
                                <span className="text-text-muted"> • {selectedService?.label}</span>
                            </div>
                        </div>
                    )}

                    {/* Contact */}
                    <fieldset className="mb-6">
                        <legend className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                            <User className="h-4 w-4 text-brand" /> Contact
                        </legend>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label htmlFor="b-name" className={labelClass}>Full name *</label>
                                <input id="b-name" className={inputClass} value={booking.full_name} onChange={(e) => setBooking((p) => ({ ...p, full_name: e.target.value }))} />
                            </div>
                            <div>
                                <label htmlFor="b-email" className={labelClass}>Email *</label>
                                <input id="b-email" type="email" className={inputClass} value={booking.email} onChange={(e) => setBooking((p) => ({ ...p, email: e.target.value }))} />
                            </div>
                            <div>
                                <label htmlFor="b-phone" className={labelClass}>Phone *</label>
                                <input id="b-phone" className={inputClass} value={booking.phone} onChange={(e) => setBooking((p) => ({ ...p, phone: e.target.value }))} />
                            </div>
                        </div>
                    </fieldset>

                    {/* Location */}
                    <fieldset className="mb-6">
                        <legend className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-brand" /> Location
                        </legend>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="b-addr" className={labelClass}>Address line 1 *</label>
                                <input id="b-addr" className={inputClass} value={booking.address_line_1} onChange={(e) => setBooking((p) => ({ ...p, address_line_1: e.target.value }))} />
                            </div>
                            <div>
                                <label htmlFor="b-town" className={labelClass}>Town / City *</label>
                                <input id="b-town" className={inputClass} value={booking.town_city} onChange={(e) => setBooking((p) => ({ ...p, town_city: e.target.value }))} />
                            </div>
                        </div>
                    </fieldset>

                    {/* Vehicle */}
                    <fieldset className="mb-6">
                        <legend className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                            <Car className="h-4 w-4 text-brand" /> Vehicle
                        </legend>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label htmlFor="b-reg" className={labelClass}>Registration *</label>
                                <input id="b-reg" className={inputClass} value={booking.vehicle_registration} onChange={(e) => setBooking((p) => ({ ...p, vehicle_registration: e.target.value.toUpperCase() }))} placeholder="e.g. AB12 CDE" />
                            </div>
                            <div>
                                <label htmlFor="b-make" className={labelClass}>Make *</label>
                                <input id="b-make" className={inputClass} value={booking.vehicle_make} onChange={(e) => setBooking((p) => ({ ...p, vehicle_make: e.target.value }))} placeholder="e.g. Mercedes" />
                            </div>
                            <div>
                                <label htmlFor="b-model" className={labelClass}>Model *</label>
                                <input id="b-model" className={inputClass} value={booking.vehicle_model} onChange={(e) => setBooking((p) => ({ ...p, vehicle_model: e.target.value }))} placeholder="e.g. Sprinter 314" />
                            </div>
                            <div>
                                <label htmlFor="b-miles" className={labelClass}>Approx. mileage *</label>
                                <input id="b-miles" className={inputClass} value={booking.approximate_mileage} onChange={(e) => setBooking((p) => ({ ...p, approximate_mileage: e.target.value }))} placeholder="e.g. 85,000" />
                            </div>
                        </div>
                    </fieldset>

                    {/* Fault */}
                    <fieldset className="mb-6">
                        <legend className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-brand" /> Fault Description
                        </legend>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="b-symptoms" className={labelClass}>Symptoms / warning lights *</label>
                                <textarea id="b-symptoms" className={inputClass} value={booking.symptoms} onChange={(e) => setBooking((p) => ({ ...p, symptoms: e.target.value }))} rows={3} placeholder="Describe the issue, when it started, and any warning lights" />
                            </div>
                            <div>
                                <label htmlFor="b-notes" className={labelClass}>Additional notes</label>
                                <textarea id="b-notes" className={inputClass} value={booking.additional_notes} onChange={(e) => setBooking((p) => ({ ...p, additional_notes: e.target.value }))} rows={2} placeholder="Parking instructions, previous repair history, etc." />
                            </div>
                        </div>
                    </fieldset>

                    {/* Safe location */}
                    <label className="flex items-start gap-3 rounded-xl border border-border-default bg-surface p-4 cursor-pointer transition-all hover:border-brand/30 text-sm text-text-secondary mb-6">
                        <input
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 rounded border-border-default text-brand focus:ring-brand"
                            checked={booking.safe_location_confirmed}
                            onChange={(e) => setBooking((p) => ({ ...p, safe_location_confirmed: e.target.checked }))}
                        />
                        <span>
                            I confirm the vehicle is in a <strong className="text-text-primary">safe working location</strong> (driveway, depot, yard - not a live road).
                        </span>
                    </label>

                    {/* Booking summary */}
                    {availability && selectedSlot && (
                        <div className="mb-6 rounded-xl border border-border-default bg-surface p-5">
                            <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-brand" /> Booking Summary
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                <div>
                                    <p className="text-text-muted text-xs">Service</p>
                                    <p className="font-medium text-text-primary">{selectedService?.label}</p>
                                </div>
                                <div>
                                    <p className="text-text-muted text-xs">Date & Time</p>
                                    <p className="font-medium text-text-primary">
                                        {new Date(selectedSlot).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })} • {new Date(selectedSlot).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-text-muted text-xs">Fixed Price</p>
                                    <p className="font-bold text-brand-light text-lg">{availability.fixed_price_gbp ? `£${availability.fixed_price_gbp}` : 'Quote'}</p>
                                </div>
                                <div>
                                    <p className="text-text-muted text-xs">Deposit Due</p>
                                    <p className="font-bold text-text-primary text-lg">{availability.deposit_gbp ? `£${availability.deposit_gbp}` : 'TBC'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <CTAButton
                        type="button"
                        onClick={submitBooking}
                        disabled={submitting || (!availability?.manual_review_required && !selectedSlot)}
                        className="w-full"
                    >
                        {submitting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</>
                        ) : availability?.deposit_gbp ? (
                            `Confirm & Pay £${availability.deposit_gbp} Deposit`
                        ) : (
                            'Confirm Booking'
                        )}
                    </CTAButton>
                </div>
            </StepPanel>

            {/* ---- Notices ---- */}
            {error && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger animate-in fade-in">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {status && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-success/20 bg-success/5 p-4 text-sm text-success animate-in fade-in">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                        <p className="font-semibold">Booking Submitted!</p>
                        <p className="mt-1 text-text-secondary">{status}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
