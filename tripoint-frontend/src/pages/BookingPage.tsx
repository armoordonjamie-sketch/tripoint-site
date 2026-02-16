import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { Notice } from '@/components/Notice';
import { siteConfig } from '@/config/site';
import { Calendar, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

/* ── Calendly embed ─────────────────────────────────── */
function CalendlyEmbed() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://assets.calendly.com/assets/external/widget.js';
        script.async = true;
        script.onload = () => setLoading(false);
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div className="rounded-2xl border border-border-default bg-surface-alt p-4">
            {loading && (
                <div className="flex h-[600px] items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand" />
                        <p className="mt-3 text-sm text-text-muted">Loading scheduling widget…</p>
                    </div>
                </div>
            )}
            <div
                ref={containerRef}
                className="calendly-inline-widget"
                data-url={siteConfig.contact.calendlyUrl}
                style={{ minWidth: '320px', height: loading ? '0' : '630px' }}
                aria-label="Calendly scheduling widget"
            />
        </div>
    );
}

/* ── Booking form schema ────────────────────────────── */
const bookingSchema = z.object({
    fullName: z.string().min(2, 'Full name is required'),
    mobile: z.string().min(10, 'Valid mobile number required'),
    email: z.string().email('Valid email required'),
    postcode: z.string().min(3, 'Postcode is required'),
    vehicleMake: z.string().min(1, 'Vehicle make is required'),
    vehicleModel: z.string().min(1, 'Vehicle model is required'),
    registration: z.string().min(2, 'Registration is required'),
    mileage: z.string().min(1, 'Approximate mileage required'),
    symptoms: z.string().min(10, 'Please describe the symptoms'),
    drivable: z.boolean(),
    urgency: z.boolean(),
    preferredContact: z.enum(['phone', 'whatsapp', 'email']),
    preferredTime: z.string().min(1, 'Preferred time window is required'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

function BookingForm() {
    const [submitted, setSubmitted] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<BookingFormData>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            drivable: true,
            urgency: false,
            preferredContact: 'phone',
        },
    });

    const onSubmit = (data: BookingFormData) => {
        // TODO: Wire to backend webhook (Zapier/Make/email API)
        console.log('Booking request:', data);
        const existing = JSON.parse(localStorage.getItem('tripoint_bookings') ?? '[]') as unknown[];
        existing.push({ ...data, timestamp: new Date().toISOString() });
        localStorage.setItem('tripoint_bookings', JSON.stringify(existing));
        trackEvent('submit_booking_request', { urgency: String(data.urgency), vehicle: `${data.vehicleMake} ${data.vehicleModel}` });
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
                <h3 className="mt-4 text-xl font-bold text-text-primary">Request Received!</h3>
                <p className="mt-2 text-text-secondary">
                    We&apos;ll review your details and get back to you with zone, price, and next available slot.
                    Usually within a few hours.
                </p>
            </div>
        );
    }

    const inputClass =
        'w-full rounded-lg border border-border-default bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand';
    const labelClass = 'block text-sm font-medium text-text-primary mb-1.5';
    const errorClass = 'mt-1 text-xs text-danger';

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl border border-border-default bg-surface-alt p-6 sm:p-8"
        >
            <h3 className="mb-6 text-xl font-bold text-text-primary">Booking Request Form</h3>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="fullName" className={labelClass}>Full Name *</label>
                    <input id="fullName" {...register('fullName')} className={inputClass} placeholder="Your full name" />
                    {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
                </div>
                <div>
                    <label htmlFor="mobile" className={labelClass}>Mobile *</label>
                    <input id="mobile" {...register('mobile')} className={inputClass} placeholder="07XXX XXXXXX" />
                    {errors.mobile && <p className={errorClass}>{errors.mobile.message}</p>}
                </div>
                <div>
                    <label htmlFor="email" className={labelClass}>Email *</label>
                    <input id="email" type="email" {...register('email')} className={inputClass} placeholder="you@email.com" />
                    {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                </div>
                <div>
                    <label htmlFor="postcode" className={labelClass}>Postcode *</label>
                    <input id="postcode" {...register('postcode')} className={inputClass} placeholder="e.g. SE9 4HA" />
                    {errors.postcode && <p className={errorClass}>{errors.postcode.message}</p>}
                </div>
                <div>
                    <label htmlFor="vehicleMake" className={labelClass}>Vehicle Make *</label>
                    <input id="vehicleMake" {...register('vehicleMake')} className={inputClass} placeholder="e.g. Mercedes-Benz" />
                    {errors.vehicleMake && <p className={errorClass}>{errors.vehicleMake.message}</p>}
                </div>
                <div>
                    <label htmlFor="vehicleModel" className={labelClass}>Vehicle Model *</label>
                    <input id="vehicleModel" {...register('vehicleModel')} className={inputClass} placeholder="e.g. Sprinter 316 CDI" />
                    {errors.vehicleModel && <p className={errorClass}>{errors.vehicleModel.message}</p>}
                </div>
                <div>
                    <label htmlFor="registration" className={labelClass}>Registration *</label>
                    <input id="registration" {...register('registration')} className={inputClass} placeholder="e.g. AB12 CDE" />
                    {errors.registration && <p className={errorClass}>{errors.registration.message}</p>}
                </div>
                <div>
                    <label htmlFor="mileage" className={labelClass}>Approx. Mileage *</label>
                    <input id="mileage" {...register('mileage')} className={inputClass} placeholder="e.g. 85,000" />
                    {errors.mileage && <p className={errorClass}>{errors.mileage.message}</p>}
                </div>
            </div>

            <div className="mt-4">
                <label htmlFor="symptoms" className={labelClass}>Symptoms / Warning Lights *</label>
                <textarea
                    id="symptoms"
                    {...register('symptoms')}
                    rows={4}
                    className={inputClass}
                    placeholder="Describe the issue, warning lights, when it started, and any other relevant details…"
                />
                {errors.symptoms && <p className={errorClass}>{errors.symptoms.message}</p>}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="drivable"
                        {...register('drivable')}
                        className="h-4 w-4 rounded border-border-default text-brand focus:ring-brand"
                    />
                    <label htmlFor="drivable" className="text-sm text-text-primary">Vehicle is drivable</label>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="urgency"
                        {...register('urgency')}
                        className="h-4 w-4 rounded border-border-default text-brand focus:ring-brand"
                    />
                    <label htmlFor="urgency" className="text-sm text-text-primary">VOR / Urgent</label>
                </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="preferredContact" className={labelClass}>Preferred Contact Method</label>
                    <select id="preferredContact" {...register('preferredContact')} className={inputClass}>
                        <option value="phone">Phone call</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="email">Email</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="preferredTime" className={labelClass}>Preferred Time Window *</label>
                    <input id="preferredTime" {...register('preferredTime')} className={inputClass} placeholder="e.g. Weekday afternoons" />
                    {errors.preferredTime && <p className={errorClass}>{errors.preferredTime.message}</p>}
                </div>
            </div>

            <div className="mt-6">
                <CTAButton type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting ? 'Submitting…' : 'Submit Booking Request'}
                </CTAButton>
            </div>
        </form>
    );
}

export function BookingPage() {
    return (
        <>
            <Seo
                title="Book a Diagnostic"
                description="Book your mobile diagnostic appointment with TriPoint Diagnostics. Calendly scheduling or booking request form."
                canonical="/booking"
            />

            <Section>
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                        Book a Diagnostic
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
                        Choose a slot through our scheduling calendar below, or submit a booking request and we&apos;ll confirm your zone and price.
                    </p>
                </div>

                {/* How booking works */}
                <div className="mx-auto mt-12 max-w-3xl">
                    <h2 className="mb-4 text-2xl font-bold text-text-primary">How Booking Works</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-border-default bg-surface-alt p-4">
                            <div className="mb-2 flex items-center gap-2 text-brand">
                                <Clock className="h-5 w-5" />
                                <h3 className="font-semibold text-text-primary">Operating Hours</h3>
                            </div>
                            <p className="text-sm text-text-secondary">
                                <strong>Mon - Sat:</strong> 6:00 AM – 10:00 PM<br />
                                We cover up to 60 minutes drive from our bases in Tonbridge (TN9) and Eltham (SE9).
                            </p>
                        </div>
                        <div className="rounded-xl border border-border-default bg-surface-alt p-4">
                            <div className="mb-2 flex items-center gap-2 text-brand">
                                <Clock className="h-5 w-5" />
                                <h3 className="font-semibold text-text-primary">What Happens Next</h3>
                            </div>
                            <p className="text-sm text-text-secondary">
                                We confirm your zone (A/B/C), price, and next available slot.
                                A small deposit secures the booking (£30 A/B, £50 C/VOR).
                                Reschedule free with 24h notice.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Calendly */}
                <div className="mx-auto mt-12 max-w-3xl">
                    <h2 className="mb-4 text-2xl font-bold text-text-primary">Schedule Online</h2>
                    <CalendlyEmbed />
                </div>

                {/* Fallback form */}
                <div className="mx-auto mt-12 max-w-3xl">
                    <h2 className="mb-4 text-2xl font-bold text-text-primary">
                        Or Submit a Booking Request
                    </h2>
                    <p className="mb-6 text-sm text-text-secondary">
                        Prefer to send your details and let us come back with availability? Fill in the form below.
                    </p>
                    <BookingForm />
                </div>

                <div className="mx-auto mt-8 max-w-3xl">
                    <Notice variant="info">
                        <strong>Safety note:</strong> Please confirm the vehicle is in a safe, accessible working location (driveway, depot, yard).
                        We may need to decline or rearrange jobs at unsafe roadside locations.
                    </Notice>
                </div>
            </Section>
        </>
    );
}
