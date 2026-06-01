import { useEffect, useMemo, useState, useRef } from 'react';
import { Loader2, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Calendar, Search, MapPin, Car, Wrench, User, CreditCard, Shield, Cog, TrendingUp } from 'lucide-react';
import { CTAButton } from './CTAButton';
import { VatLabel, vatSuffix } from './VatLabel';
import {
    trackBookingConfirmation,
    trackBookingFunnelEvent,
    trackSelectContent,
    fireGoogleAdsContactConversion,
} from '@/lib/analytics';
import { normalizeAndHashEmail, normalizeAndHashPhone } from '@/lib/hashUserData';
import { getSessionJourneyId, getEventId, getGa4WebIds } from '@/lib/leadTracking';
import { getAttribution } from '@/lib/attribution';

/* ---------- types ---------- */
interface Service {
    id: string;
    label: string;
    duration_minutes: number;
    min_notice_hours: number;
    zone_price: Record<string, number>;
}

interface SlotItem { iso: string; available: boolean; }

interface PriceBreakdown {
    description: string;
    amount_gbp: number;
    is_addon: boolean;
}

interface PriceResponse {
    zone: string;
    price_breakdown: PriceBreakdown[];
    total_gbp: number;
    deposit_gbp: number;
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
    price_breakdown: PriceBreakdown[] | null;
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

/** Outward code only (privacy-friendly) for analytics. */
function ukPostcodeOutward(pc: string): string {
    const t = pc.trim().toUpperCase();
    const parts = t.split(/\s+/).filter(Boolean);
    return parts[0] || 'unknown';
}

const SERVICE_CATEGORIES = [
    { id: 'diagnostics', label: 'Diagnostics', icon: Search, desc: 'Warning lights, fault finding, pre-purchase checks' },
    { id: 'servicing', label: 'Servicing', icon: Cog, desc: 'Full-service at your location, dealer-level' },
    { id: 'brakes', label: 'Brakes', icon: Shield, desc: 'Mobile brake service for Sprinter, Vito & Citan' },
    { id: 'tuning', label: 'Remapping', icon: TrendingUp, desc: 'Stage 1 remap - power, economy, fleet pricing' },
];

const BRAKE_PRICING: Record<string, any> = {
    sprinter: { label: 'Sprinter', options: { front: { pads: 120, 'pads-discs': 220 }, rear: { pads: 120, 'pads-discs': 220, 'pads-discs-shoes': 280 }, both: { pads: 240, 'pads-discs': 440, 'pads-discs-shoes': 500 } } },
    vito: { label: 'Vito', options: { front: { pads: 110, 'pads-discs': 210 }, rear: { pads: 110, 'pads-discs': 210, 'pads-discs-shoes': 270 }, both: { pads: 220, 'pads-discs': 420, 'pads-discs-shoes': 480 } } },
    citan: { label: 'Citan', options: { front: { pads: 100, 'pads-discs': 190 }, rear: { pads: 100, 'pads-discs': 190, 'pads-discs-shoes': 240 }, both: { pads: 200, 'pads-discs': 380, 'pads-discs-shoes': 430 } } },
};

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
        <div className="min-w-0 w-full max-w-[min(100vw-2rem,320px)]">
            <p className="mb-3 text-center text-sm font-semibold text-text-primary">
                {(() => {
                    const last = new Date(dateKeys[dateKeys.length - 1]);
                    return firstDate.getMonth() !== last.getMonth()
                        ? `${firstDate.toLocaleDateString('en-GB', { month: 'short' })} - ${last.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`
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

/* ---------- animated substep wrapper ---------- */
function SubStepPanel({ active, direction, children }: { active: boolean; direction: 'forward' | 'back'; children: React.ReactNode }) {
    const [mounted, setMounted] = useState(active);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (active) {
            setMounted(true);
            requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
        } else {
            setVisible(false);
            const timer = setTimeout(() => setMounted(false), 300);
            return () => clearTimeout(timer);
        }
    }, [active]);

    if (!mounted) return null;
    const enterFrom = direction === 'forward' ? 'translate-x-8' : '-translate-x-8';
    return (
        <div className={`transition-all duration-300 ease-out ${visible ? 'opacity-100 translate-x-0' : `opacity-0 ${enterFrom}`}`}>
            {children}
        </div>
    );
}

type BookingSubStep = 'category' | 'service' | 'brake-config' | 'postcode';

function BookingFunnelProgress({
    availability,
    selectedSlot,
    currentStep,
    subStep,
    selectedCategory,
}: {
    availability: AvailabilityResponse | null;
    selectedSlot: string;
    currentStep: 1 | 2 | 3;
    subStep: BookingSubStep;
    selectedCategory: string | null;
}) {
    const manual = availability?.manual_review_required ?? false;
    const displayStep: 1 | 2 | 3 = !availability ? 1 : manual ? 3 : selectedSlot ? 3 : 2;

    const mainSteps: { num: 1 | 2 | 3; label: string }[] = [
        { num: 1, label: 'Service' },
        { num: 2, label: 'Slot' },
        { num: 3, label: 'Details' },
    ];

    const brakesPath = selectedCategory === 'brakes';
    const subOrder: BookingSubStep[] = brakesPath
        ? ['category', 'service', 'brake-config', 'postcode']
        : ['category', 'service', 'postcode'];
    const subLabels: Record<BookingSubStep, string> = {
        category: 'Category',
        service: brakesPath ? 'Model' : 'Service',
        'brake-config': 'Configure',
        postcode: 'Location',
    };
    const subIndex = subOrder.indexOf(subStep);

    const mainPillClass = (num: 1 | 2 | 3) => {
        const skipped = num === 2 && manual && displayStep === 3;
        const done =
            (num === 1 && !!availability) ||
            (num === 2 && !manual && !!selectedSlot && !!availability) ||
            skipped;
        const current = displayStep === num && !skipped;
        if (skipped) {
            return 'border-border-default bg-surface text-text-muted line-through decoration-text-muted/60';
        }
        if (current) {
            return 'border-brand bg-brand/10 text-brand-light ring-1 ring-brand/30';
        }
        if (done) {
            return 'border-success/30 bg-success/5 text-text-primary';
        }
        return 'border-border-default bg-surface text-text-muted';
    };

    const subPillClass = (idx: number) => {
        if (idx < subIndex) {
            return 'border-success/25 bg-success/5 text-text-secondary';
        }
        if (idx === subIndex) {
            return 'border-brand bg-brand/10 text-brand-light ring-1 ring-brand/25';
        }
        return 'border-border-default bg-surface-alt text-text-muted';
    };

    return (
        <div
            className="mb-3 rounded-xl border border-border-default bg-surface p-2 sm:mb-4 sm:p-4"
            role="navigation"
            aria-label="Booking progress"
        >
            <ol className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3">
                {mainSteps.map((s, i) => (
                    <li key={s.num} className="flex items-center gap-1.5 sm:gap-3">
                        <span
                            className={`inline-flex min-h-[1.75rem] items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold sm:min-h-[2rem] sm:px-3 sm:py-1 sm:text-sm ${mainPillClass(s.num)}`}
                            aria-current={displayStep === s.num && !(s.num === 2 && manual && displayStep === 3) ? 'step' : undefined}
                        >
                            <span className="text-text-muted mr-1 font-bold tabular-nums">{s.num}</span>
                            {s.label}
                        </span>
                        {i < mainSteps.length - 1 && (
                            <span className="hidden text-text-muted sm:inline" aria-hidden>
                                →
                            </span>
                        )}
                    </li>
                ))}
            </ol>
            {currentStep === 1 && (
                <ol className="mt-2 flex flex-wrap items-center justify-center gap-1 border-t border-border-default pt-2 sm:mt-3 sm:gap-1.5 sm:pt-3" aria-label="Service and location steps">
                    {subOrder.map((id, idx) => (
                        <li key={id} className="flex items-center gap-1.5">
                            <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium sm:text-xs ${subPillClass(idx)}`}>
                                {subLabels[id]}
                            </span>
                            {idx < subOrder.length - 1 && <span className="text-text-muted/50" aria-hidden>/</span>}
                        </li>
                    ))}
                </ol>
            )}
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
    
    // Sub-step state
    const [subStep, setSubStep] = useState<'category' | 'service' | 'brake-config' | 'postcode'>('category');
    const [subStepDirection, setSubStepDirection] = useState<'forward' | 'back'>('forward');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [brakePosition, setBrakePosition] = useState<'front' | 'rear' | 'both'>('front');
    const [brakeType, setBrakeType] = useState<string>('not-sure');
    const [servicingModel, setServicingModel] = useState<string>('Sprinter');
    const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string>('');
    const [priceInfo, setPriceInfo] = useState<PriceResponse | null>(null);
    const [, setLoadingPrice] = useState(false);
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [servicesLoadError, setServicesLoadError] = useState('');
    const [servicesFetchKey, setServicesFetchKey] = useState(0);
    const [loadingServices, setLoadingServices] = useState(false);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);
    const [prevStep, setPrevStep] = useState<1 | 2 | 3>(1);
    const availabilityConversionTracked = useRef(false);
    const slotConversionForIso = useRef<string | null>(null);
    const lastBookingStepKey = useRef<string>('');
    const lastAbandonStepRef = useRef('scheduler_mount');
    const bookingSubmittedRef = useRef(false);

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

    useEffect(() => {
        trackBookingFunnelEvent('booking_start', { booking_step: 'scheduler_mount' });
    }, []);

    useEffect(() => {
        const lead =
            priceInfo?.total_gbp ??
            availability?.fixed_price_gbp ??
            undefined;
        const stepKey = `${currentStep}|${subStep}|${selectedCategory ?? ''}|${booking.service_ids.join(',')}`;
        if (lastBookingStepKey.current === stepKey) return;
        lastBookingStepKey.current = stepKey;
        lastAbandonStepRef.current = `step${currentStep}_${subStep}`;
        trackBookingFunnelEvent('booking_step_view', {
            booking_step: `step${currentStep}_${subStep}`,
            service_interest: booking.service_ids[0],
            lead_value: lead,
        });
    }, [
        currentStep,
        subStep,
        selectedCategory,
        booking.service_ids,
        availability?.fixed_price_gbp,
        priceInfo?.total_gbp,
    ]);

    useEffect(() => {
        const onBeforeUnload = () => {
            if (bookingSubmittedRef.current) return;
            const hasProgress =
                availability !== null ||
                booking.service_ids.length > 0 ||
                booking.postcode.trim().length > 0 ||
                booking.full_name.trim().length > 0 ||
                currentStep > 1;
            if (!hasProgress) return;
            trackBookingFunnelEvent('booking_abandoned', { booking_step: lastAbandonStepRef.current });
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [availability, booking.service_ids, booking.postcode, booking.full_name, currentStep]);

    /* load services */
    useEffect(() => {
        let cancelled = false;
        const loadServices = async () => {
            setLoadingServices(true);
            setServicesLoadError('');
            try {
                const response = await fetch('/api/booking/services');
                if (!response.ok) throw new Error('Could not load services');
                const data: Service[] = await response.json();
                if (!cancelled) setServices(data);
            } catch (err) {
                if (!cancelled) {
                    setServicesLoadError(err instanceof Error ? err.message : 'Failed to load services');
                }
            } finally {
                if (!cancelled) setLoadingServices(false);
            }
        };
        void loadServices();
        return () => {
            cancelled = true;
        };
    }, [servicesFetchKey]);

    /* sync postcode from zone calculator */
    useEffect(() => {
        if (zoneCalcPostcode) {
            setBooking((prev) => ({ ...prev, postcode: zoneCalcPostcode }));
        }
    }, [zoneCalcPostcode]);

    /* booking funnel: availability loaded (step 1 → 2) */
    useEffect(() => {
        if (!availability) {
            availabilityConversionTracked.current = false;
            return;
        }
        if (availabilityConversionTracked.current) return;
        const hasPath =
            (availability.slots && availability.slots.length > 0) || availability.manual_review_required;
        if (!hasPath) return;
        availabilityConversionTracked.current = true;
    }, [availability]);

    /* fetch availability */
    const fetchAvailability = async (postcode: string, serviceIds: string[]) => {
        if (!postcode || serviceIds.length === 0) return;
        setError('');
        setStatus('');
        setAvailability(null);
        setSelectedSlot('');
        setPriceInfo(null);
        setLoadingAvailability(true);
        try {
            const params = new URLSearchParams({ postcode, service_ids: serviceIds.join(',') });
            const response = await fetch(`/api/booking/availability?${params.toString()}`);
            const json = await response.json();
            if (!response.ok) throw new Error(json.detail || 'Failed to fetch availability');

            const outward = ukPostcodeOutward(postcode);
            trackBookingFunnelEvent('booking_check_availability', {
                booking_step: `postcode_${outward}`,
                service_interest: serviceIds[0],
            });

            const slots = json.slots || [];
            const anyAvail = slots.some((s: SlotItem) => s.available);
            if (!json.manual_review_required && slots.length > 0 && !anyAvail) {
                trackBookingFunnelEvent('booking_no_availability', {
                    booking_step: 'slots_all_taken',
                    service_interest: serviceIds[0],
                    error_detail: outward,
                });
            }
            if (!json.manual_review_required && slots.length === 0) {
                trackBookingFunnelEvent('booking_no_availability', {
                    booking_step: 'no_slots_returned',
                    service_interest: serviceIds[0],
                });
            }

            setAvailability(json);
            setSelectedDateIndex(0);
        } catch (err) {
            trackBookingFunnelEvent('booking_form_error', {
                booking_step: 'availability_fetch',
                error_detail: err instanceof Error ? err.message : 'unknown',
            });
            setError(err instanceof Error ? err.message : 'Availability lookup failed');
        } finally {
            setLoadingAvailability(false);
        }
    };

    /* fetch per-slot itemised price */
    const fetchSlotPrice = async (slotIso: string) => {
        if (!booking.postcode || booking.service_ids.length === 0) return;
        setLoadingPrice(true);
        try {
            const params = new URLSearchParams({
                postcode: booking.postcode,
                service_ids: booking.service_ids.join(','),
                slot_iso: slotIso,
            });
            const response = await fetch(`/api/booking/price?${params.toString()}`);
            if (!response.ok) return; // silent fail - fall back to availability estimate
            const json: PriceResponse = await response.json();
            setPriceInfo(json);
        } catch {
            // silent - UI falls back to availability.fixed_price_gbp
        } finally {
            setLoadingPrice(false);
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
        setPriceInfo(null);
        slotConversionForIso.current = null;
    };

    /* go back to step 2 */
    const goBackToStep2 = () => {
        setSelectedSlot('');
        setPriceInfo(null);
        slotConversionForIso.current = null;
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
        const symptomsRequired = selectedCategory === 'diagnostics' || selectedCategory === 'tuning';
        if (symptomsRequired && (!booking.symptoms.trim() || booking.symptoms.trim().length < 2)) {
            missing.push(selectedCategory === 'tuning' ? 'Remap goals' : 'Symptoms / fault description');
        }

        if (missing.length > 0) {
            trackBookingFunnelEvent('booking_form_error', {
                booking_step: 'submit_validation',
                error_detail: missing.slice(0, 6).join(';'),
            });
            setError(`Please fill in: ${missing.join(', ')}`);
            return;
        }

        if (!booking.safe_location_confirmed) {
            trackBookingFunnelEvent('booking_form_error', { booking_step: 'safe_location_not_confirmed' });
            setError('Please confirm the vehicle is in a safe working location.');
            return;
        }

        setSubmitting(true);
        try {
            const ga = getGa4WebIds();
            const response = await fetch('/api/booking/reserve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...booking,
                    slot_start_iso: selectedSlot,
                    attribution: getAttribution(),
                    ga_client_id: ga.ga_client_id ?? undefined,
                    ga_session_id: ga.ga_session_id ?? undefined,
                }),
            });
            const json = await response.json();
            if (!response.ok) throw new Error(json.detail || 'Booking failed');
            const primaryService = booking.service_ids[0] ?? 'general';
            const leadVal = priceInfo?.total_gbp ?? availability?.fixed_price_gbp ?? undefined;
            const journeyId = getSessionJourneyId();
            const bookingEventId = getEventId();

            const [hashedEmail, hashedPhone] = await Promise.all([
                normalizeAndHashEmail(booking.email),
                normalizeAndHashPhone(booking.phone),
            ]);

            fireGoogleAdsContactConversion({
                valueGbp: leadVal ?? 0,
                transactionId: journeyId,
                hashedEmailHex: hashedEmail,
                hashedPhoneHex: hashedPhone,
            });

            trackBookingFunnelEvent('booking_reserve_submit', {
                booking_step: 'submit',
                service_interest: primaryService,
                lead_value: leadVal,
            });
            trackBookingConfirmation(primaryService, {
                serviceInterest: primaryService,
                leadValue: leadVal,
                valueGbp: leadVal,
                orderId: journeyId,
                eventId: bookingEventId,
                hashedEmail,
                hashedPhone,
                vehicleMake: booking.vehicle_make.trim() || undefined,
                vehicleModel: booking.vehicle_model.trim() || undefined,
            });
            bookingSubmittedRef.current = true;
            if (json.status === 'pending_deposit' && json.payment_url) {
                try {
                    const gaPay = getGa4WebIds();
                    sessionStorage.setItem(
                        'tripoint_payment_context',
                        JSON.stringify({
                            service_interest: booking.service_ids.join(','),
                            lead_value_gbp: leadVal ?? null,
                            journey_id: journeyId,
                            hashed_email: hashedEmail,
                            hashed_phone: hashedPhone,
                            booking_id: json.booking_id ?? null,
                            ga_client_id: gaPay.ga_client_id ?? null,
                            ga_session_id: gaPay.ga_session_id ?? null,
                            vehicle_make: booking.vehicle_make.trim() || null,
                            vehicle_model: booking.vehicle_model.trim() || null,
                        }),
                    );
                } catch {
                    /* ignore */
                }
                window.location.href = json.payment_url;
                return;
            }
            if (json.status === 'pending_manual_review') {
                setStatus(json.message || 'We\'ll contact you with a quote.');
                setBooking(INITIAL_BOOKING);
                setAvailability(null);
                setSelectedSlot('');
                setPriceInfo(null);
                setSubStep('category');
                setSelectedCategory(null);
                return;
            }
            setStatus(json.message || 'Booking submitted! Check your email for confirmation.');
            setBooking(INITIAL_BOOKING);
            setAvailability(null);
            setSelectedSlot('');
            setPriceInfo(null);
            setSubStep('category');
            setSelectedCategory(null);
        } catch (err) {
            trackBookingFunnelEvent('booking_form_error', {
                booking_step: 'reserve_failed',
                error_detail: err instanceof Error ? err.message : 'unknown',
            });
            setError(err instanceof Error ? err.message : 'Could not create booking');
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        'w-full rounded-lg border border-border-default bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors duration-200';
    const labelClass = 'block text-sm font-medium text-text-secondary mb-1.5';
    const selectedService = services.find((s) => booking.service_ids.includes(s.id));
    // const effectiveDeposit = priceInfo?.deposit_gbp ?? availability?.deposit_gbp;

    return (
        <div className="min-w-0 max-w-full space-y-0">
            <BookingFunnelProgress
                availability={availability}
                selectedSlot={selectedSlot}
                currentStep={currentStep}
                subStep={subStep}
                selectedCategory={selectedCategory}
            />

            {/* Zone summary bar - persistent once fetched */}
            {availability && (
                <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    {[
                        { label: 'Zone', value: availability.zone, accent: true },
                        { label: 'Drive time', value: `${Math.round(availability.drive_time_minutes)} min` },
                        { label: 'Base price from', value: availability.fixed_price_gbp ? `£${availability.fixed_price_gbp}${vatSuffix}` : 'Quote', accent: true },
                    ].map((item) => (
                        <div key={item.label} className="rounded-xl border border-brand/15 bg-brand/5 px-2 py-2 text-center sm:px-4 sm:py-3">
                            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5 sm:text-[11px]">{item.label}</p>
                            <p className={`text-sm font-bold tabular-nums sm:text-lg ${item.accent ? 'text-brand-light' : 'text-text-primary'}`}>{item.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* ===== STEP 1: Service & Location (Sub-steps) ===== */}
            <StepPanel active={currentStep === 1} direction={direction}>
                <div className="relative overflow-hidden rounded-2xl border border-border-default bg-surface-alt p-4 sm:p-6 lg:p-8">
                    {/* Header */}
                    <div className="mb-4 flex items-center gap-3 sm:mb-6">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                            <Wrench className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary">Service & Location</h3>
                            <p className="text-xs text-text-muted">
                                {subStep === 'category' ? 'Select a service category' : 'Choose your specific service'}
                            </p>
                        </div>
                    </div>

                    {loadingServices && (
                        <div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading services...
                        </div>
                    )}

                    {servicesLoadError && !loadingServices && (
                        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <p>{servicesLoadError}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setServicesFetchKey((k) => k + 1)}
                                className="self-start rounded-lg border border-danger/30 bg-surface px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:border-danger/50 hover:bg-danger/10"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* SubStep 1A: Category */}
                    <SubStepPanel active={subStep === 'category'} direction={subStepDirection}>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {SERVICE_CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedCategory(cat.id);
                                            setSubStepDirection('forward');
                                            // Reset nested selections
                                            setBooking((p) => ({ ...p, service_ids: [] }));
                                            setSubStep('service');
                                            trackSelectContent('service_category', cat.id);
                                            trackBookingFunnelEvent('booking_service_select', {
                                                booking_step: 'category_pick',
                                                service_interest: cat.id,
                                            });
                                        }}
                                        className="flex text-left items-start gap-4 rounded-xl border border-border-default bg-surface p-4 transition-all hover:border-brand/40 hover:bg-brand/5 hover:shadow-md group"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-text-primary group-hover:text-brand-light transition-colors">{cat.label}</h4>
                                            <p className="mt-1 text-xs text-text-muted leading-relaxed">{cat.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </SubStepPanel>

                    {/* SubStep 1B: Choose specific service */}
                    <SubStepPanel active={subStep === 'service'} direction={subStepDirection}>
                        <button
                            type="button"
                            onClick={() => { setSubStepDirection('back'); setSubStep('category'); }}
                            className="flex items-center gap-1 text-xs font-semibold text-text-muted mb-4 hover:text-brand transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" /> Back to Categories
                        </button>
                        
                        <div className="grid gap-3">
                            {services
                                .filter((s) => {
                                    if (selectedCategory === 'diagnostics') return s.id.includes('diagnostic') || s.id.includes('health-check') || s.id.includes('adblue') || s.id.includes('limp') || s.id.includes('nox') || s.id.includes('dpf') || s.id.includes('electrical');
                                    if (selectedCategory === 'servicing') return s.id.includes('service');
                                    if (selectedCategory === 'brakes') return s.id.includes('brakes');
                                    if (selectedCategory === 'tuning') return s.id.includes('tune') || s.id.includes('tuning');
                                    return false;
                                })
                                .map((service) => {
                                    const isSelected = booking.service_ids.includes(service.id);
                                    
                                    // Custom handling for Servicing includes
                                    const isServicing = selectedCategory === 'servicing';
                                    const includes = isServicing ? (service.label.toLowerCase().includes('minor') ? ['Oil & Filter', 'Fluid top-ups', 'Health Check'] : ['All minor items', 'Air, Fuel & Cabin Filters', 'Full Inspection']) : null;
                                    
                                    // Brakes handling
                                    if (selectedCategory === 'brakes') return null; // handled separately below

                                    return (
                                        <label
                                            key={service.id}
                                            className={`relative flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition-all ${
                                                isSelected
                                                    ? 'border-brand bg-brand/5 shadow-sm ring-1 ring-brand'
                                                    : 'border-border-default bg-surface hover:border-brand/40 hover:bg-surface-alt'
                                            }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-5 items-center mt-0.5">
                                                    <input
                                                        type="radio"
                                                        name="service_selection"
                                                        value={service.id}
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            const id = e.target.value;
                                                            setBooking((p) => ({ ...p, service_ids: [id] }));
                                                            trackSelectContent('service', id);
                                                            trackBookingFunnelEvent('booking_service_select', {
                                                                booking_step: 'service_pick',
                                                                service_interest: id,
                                                            });
                                                        }}
                                                        className="h-4 w-4 border-border-default text-brand focus:ring-brand bg-surface"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className={`font-semibold ${isSelected ? 'text-brand-light' : 'text-text-primary'}`}>
                                                            {service.label}
                                                        </span>
                                                        <span className="text-sm font-bold text-text-primary">
                                                            from £{Object.values(service.zone_price)[0] ?? 120}
                                                            <VatLabel />
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-text-muted leading-relaxed">
                                                        {getServiceHelper(service.id)}
                                                    </p>
                                                    <div className="mt-2.5 flex items-center gap-3 text-[11px] font-medium text-text-secondary">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3.5 w-3.5 opacity-70" /> {service.duration_minutes} mins
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Servicing checklist */}
                                            {isServicing && includes && (
                                                <div className="ml-9 mt-3 rounded-lg bg-surface pl-3 pr-4 py-3 text-xs border border-border-default">
                                                    <ul className="space-y-1.5 text-text-secondary">
                                                        {includes.map((inc, i) => (
                                                            <li key={i} className="flex items-center gap-2">
                                                                <CheckCircle2 className="h-3.5 w-3.5 text-brand shrink-0" />
                                                                {inc}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </label>
                                    );
                                })}

                            {/* Custom Brake Selector logic */}
                            {selectedCategory === 'brakes' && (
                                <div className="space-y-3">
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {['sprinter', 'vito', 'citan'].map((model) => (
                                            <button
                                                key={model}
                                                type="button"
                                                onClick={() => {
                                                    const s = services.find(x => x.id.includes(model) && x.id.includes('brakes'));
                                                    if (s) {
                                                        setBooking((p) => ({ ...p, service_ids: [s.id] }));
                                                        setServicingModel(model);
                                                        setSubStepDirection('forward');
                                                        setSubStep('brake-config');
                                                        trackSelectContent('service', s.id);
                                                        trackBookingFunnelEvent('booking_service_select', {
                                                            booking_step: 'brake_model_pick',
                                                            service_interest: s.id,
                                                        });
                                                    }
                                                }}
                                                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border-default bg-surface p-4 transition-all hover:border-brand/40 hover:bg-brand/5 group"
                                            >
                                                <Car className="h-6 w-6 text-text-muted group-hover:text-brand transition-colors" />
                                                <span className="font-semibold text-text-primary group-hover:text-brand-light">{BRAKE_PRICING[model].label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-center text-xs text-text-muted mt-2">Select your van model to configure brakes</p>
                                </div>
                            )}
                        </div>

                        {/* Next step button (except for brakes which auto-advances to brake-config) */}
                        {selectedCategory !== 'brakes' && booking.service_ids.length > 0 && (
                            <div className="mt-6 flex justify-end">
                                <CTAButton onClick={() => { setSubStepDirection('forward'); setSubStep('postcode'); }} icon={<ChevronRight className="h-4 w-4" />}>
                                    Next: Location
                                </CTAButton>
                            </div>
                        )}
                    </SubStepPanel>

                    {/* SubStep 1C: Brake Configurator */}
                    <SubStepPanel active={subStep === 'brake-config'} direction={subStepDirection}>
                        <button
                            type="button"
                            onClick={() => { setSubStepDirection('back'); setSubStep('service'); }}
                            className="flex items-center gap-1 text-xs font-semibold text-text-muted mb-4 hover:text-brand transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" /> Back to Models
                        </button>
                        
                        <div className="rounded-xl border border-border-default bg-surface p-5">
                            <h4 className="font-semibold text-text-primary mb-4">Configure {BRAKE_PRICING[servicingModel]?.label} Brakes</h4>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className={labelClass}>Which axle?</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'front', label: 'Front' },
                                            { id: 'rear', label: 'Rear' },
                                            { id: 'both', label: 'Both' }
                                        ].map(pos => (
                                            <button
                                                key={pos.id}
                                                type="button"
                                                onClick={() => setBrakePosition(pos.id as any)}
                                                className={`rounded-lg border px-1 py-2 text-xs font-medium transition-colors sm:px-2 sm:text-sm ${brakePosition === pos.id ? 'border-brand bg-brand/10 text-brand-light' : 'border-border-default bg-surface-alt text-text-muted hover:border-text-muted'}`}
                                            >
                                                {pos.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>What needs replacing?</label>
                                    <div className="flex flex-col gap-2">
                                        {[
                                            { id: 'pads', label: 'Pads only' },
                                            { id: 'pads-discs', label: 'Pads & Discs' },
                                            { id: 'pads-discs-shoes', label: 'Pads, Discs & Park Brake Shoes', hide: brakePosition === 'front' },
                                            { id: 'not-sure', label: 'Not sure (Get Quote)' }
                                        ].filter(t => !t.hide).map(type => (
                                            <label key={type.id} className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${brakeType === type.id ? 'border-brand bg-brand/5' : 'border-border-default hover:border-text-muted'}`}>
                                                <input
                                                    type="radio"
                                                    name="brake_type"
                                                    checked={brakeType === type.id}
                                                    onChange={() => setBrakeType(type.id)}
                                                    className="h-4 w-4 text-brand focus:ring-brand border-border-default bg-surface"
                                                />
                                                <div className="flex flex-1 justify-between items-center text-sm">
                                                    <span className={brakeType === type.id ? 'font-medium text-text-primary' : 'text-text-secondary'}>{type.label}</span>
                                                    {type.id !== 'not-sure' && (
                                                        <span className="font-bold text-text-primary">
                                                            £{BRAKE_PRICING[servicingModel]?.options[brakePosition][type.id]}
                                                            <VatLabel />
                                                        </span>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                <CTAButton onClick={() => { 
                                    const opts = brakeType !== 'not-sure' ? ` - ${brakePosition} ${brakeType}` : ' - Unsure quote needed';
                                    setBooking(p => ({ ...p, additional_notes: (p.additional_notes + ` [Brake Config: ${servicingModel}${opts}]`).trim() }));
                                    setSubStepDirection('forward'); 
                                    setSubStep('postcode'); 
                                }} icon={<ChevronRight className="h-4 w-4" />}>
                                    Next: Location
                                </CTAButton>
                            </div>
                        </div>
                    </SubStepPanel>

                    {/* SubStep 1D: Postcode & Check */}
                    <SubStepPanel active={subStep === 'postcode'} direction={subStepDirection}>
                        <button
                            type="button"
                            onClick={() => { setSubStepDirection('back'); setSubStep(selectedCategory === 'brakes' ? 'brake-config' : 'service'); }}
                            className="flex items-center gap-1 text-xs font-semibold text-text-muted mb-4 hover:text-brand transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" /> Back to {selectedCategory === 'brakes' ? 'Brakes' : 'Services'}
                        </button>

                        {/* Selected summary */}
                        <div className="mb-6 rounded-xl border border-border-default bg-surface p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Selected Service</p>
                                <p className="font-semibold text-text-primary">
                                    {selectedService?.label}
                                </p>
                                {selectedCategory === 'brakes' && brakeType !== 'not-sure' && (
                                    <p className="text-xs text-text-secondary mt-0.5">
                                        {servicingModel} • {brakePosition} • {brakeType.replace(/-/g, ' ')}
                                    </p>
                                )}
                            </div>
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-brand/10 text-brand">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="booking-postcode" className={labelClass}>
                                <MapPin className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                                Please enter your postcode to check availability
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
                        <div className="mt-5 flex items-end">
                            <CTAButton
                                type="button"
                                onClick={refreshAvailability}
                                disabled={loadingAvailability || booking.postcode.length < 5}
                                className="w-full"
                                icon={loadingAvailability ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            >
                                {loadingAvailability ? 'Checking…' : 'Check Availability & Proceed'}
                            </CTAButton>
                        </div>
                        
                        {availability?.manual_review_required && (
                            <p className="mt-4 text-sm text-warning text-center">
                                This postcode is outside our standard area. Proceed below and we'll review manually.
                            </p>
                        )}
                    </SubStepPanel>
                </div>
            </StepPanel>

            {/* ===== STEP 2: Choose a Slot ===== */}
            <StepPanel active={currentStep === 2} direction={direction}>
                <div className="rounded-2xl border border-border-default bg-surface-alt p-4 sm:p-6 lg:p-8">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-text-primary">Choose a Slot</h3>
                                <p className="text-xs text-text-muted">Mon-Sat, 6 AM - 10 PM • 30-min starts</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={goBackToStep1}
                            className="flex shrink-0 items-center gap-1 self-start text-xs text-text-muted transition-colors hover:text-brand sm:self-auto"
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
                                <div className="relative min-w-0 max-w-[min(100%,12rem)] flex-1 sm:max-w-none sm:flex-none" ref={calendarRef}>
                                    <button
                                        type="button"
                                        onClick={() => setCalendarOpen((o) => !o)}
                                        className="flex w-full min-w-0 items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-text-primary transition-all hover:bg-surface-alt sm:w-auto sm:px-4"
                                    >
                                        <Calendar className="h-4 w-4 shrink-0 text-brand" />
                                        <span className="truncate">{groupedSlots[selectedDateIndex]?.label}</span>
                                    </button>
                                    {calendarOpen && (
                                        <div className="absolute left-1/2 top-full z-10 mt-2 w-max max-w-[min(100vw-1rem,340px)] -translate-x-1/2 rounded-xl border border-border-default bg-surface-alt p-3 shadow-xl sm:p-4">
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
                            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                                {groupedSlots[selectedDateIndex]?.slots.map((slot) => {
                                    const isSelected = selectedSlot === slot.iso;
                                    const isAvailable = slot.available;
                                    const timeStr = new Date(slot.iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
                                    return (
                                        <button
                                            key={slot.iso}
                                            type="button"
                                            disabled={!isAvailable}
                                            className={`rounded-lg px-1.5 py-2 text-xs font-medium transition-all duration-200 sm:px-2 sm:text-sm ${!isAvailable
                                                ? 'border border-border-default bg-surface-alt text-text-muted/50 cursor-not-allowed line-through'
                                                : isSelected
                                                    ? 'border-2 border-brand bg-brand text-white shadow-lg shadow-brand/25 scale-105'
                                                    : 'border border-success/30 bg-success/5 text-text-primary hover:border-brand hover:bg-brand/10 hover:scale-105'
                                                }`}
                                            onClick={() => {
                                                if (!isAvailable) return;
                                                setSelectedSlot(slot.iso);
                                                void fetchSlotPrice(slot.iso);
                                                if (slotConversionForIso.current !== slot.iso) {
                                                    slotConversionForIso.current = slot.iso;
                                                }
                                                const lv = priceInfo?.total_gbp ?? availability?.fixed_price_gbp ?? undefined;
                                                trackBookingFunnelEvent('booking_slot_select', {
                                                    booking_step: 'time_slot',
                                                    service_interest: booking.service_ids[0],
                                                    lead_value: lv,
                                                });
                                            }}
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
                <div className="rounded-2xl border border-border-default bg-surface-alt p-4 sm:p-6 lg:p-8">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
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
                                className="flex shrink-0 items-center gap-1 self-start text-xs text-text-muted transition-colors hover:text-brand sm:self-auto"
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

                    {/* Service Specific Details */}
                    {(() => {
                        const forms = {
                            diagnostics: {
                                title: 'Fault Description',
                                icon: <AlertCircle className="h-4 w-4 text-brand" />,
                                label: 'Symptoms / warning lights *',
                                placeholder: 'Describe the issue, when it started, and any warning lights...'
                            },
                            tuning: {
                                title: 'Remap Goals',
                                icon: <TrendingUp className="h-4 w-4 text-brand" />,
                                label: 'What are you looking to achieve? *',
                                placeholder: 'e.g. Better fuel economy, more pulling power for loaded work...'
                            },
                            servicing: {
                                title: 'Service Requirements',
                                icon: <Wrench className="h-4 w-4 text-brand" />,
                                label: 'Any specific concerns? (Optional)',
                                placeholder: 'e.g. Squeaking belt, slow starting, overdue oil change...'
                            },
                            brakes: {
                                title: 'Brake Condition',
                                icon: <Shield className="h-4 w-4 text-brand" />,
                                label: 'Are you experiencing specific issues? (Optional)',
                                placeholder: 'e.g. Squealing, grinding noise, soft pedal, warning light...'
                            }
                        } as const;
                        
                        const form = (selectedCategory && forms[selectedCategory as keyof typeof forms]) || forms.diagnostics;

                        return (
                            <fieldset className="mb-6">
                                <legend className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                                    {form.icon} {form.title}
                                </legend>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="b-symptoms" className={labelClass}>
                                            {form.label}
                                        </label>
                                        <textarea id="b-symptoms" className={inputClass} value={booking.symptoms} onChange={(e) => setBooking((p) => ({ ...p, symptoms: e.target.value }))} rows={3} placeholder={form.placeholder} />
                                    </div>
                                    <div>
                                        <label htmlFor="b-notes" className={labelClass}>Additional notes (Optional)</label>
                                        <textarea id="b-notes" className={inputClass} value={booking.additional_notes} onChange={(e) => setBooking((p) => ({ ...p, additional_notes: e.target.value }))} rows={2} placeholder="Parking instructions, previous repair history, etc." />
                                    </div>
                                </div>
                            </fieldset>
                        );
                    })()}

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
                                    <p className="font-bold text-brand-light text-lg">{availability.fixed_price_gbp ? `£${availability.fixed_price_gbp}${vatSuffix}` : 'Quote'}</p>
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
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting&hellip;</>
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
