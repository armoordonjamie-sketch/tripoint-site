import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { siteConfig } from '@/config/site';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Mail, CheckCircle2, Calendar } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

const contactSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email required'),
    phone: z.string().min(10, 'Valid phone number required'),
    postcode: z.string().min(3, 'Postcode is required'),
    vehicleReg: z.string().optional(),
    message: z.string().min(10, 'Please include a message'),
    safeLocation: z.boolean().refine((v) => v, {
        message: 'Please confirm the vehicle is in a safe working location',
    }),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: { safeLocation: false },
    });

    const onSubmit = async (data: ContactFormData) => {
        setSubmitError(null);
        try {
            const response = await fetch('/api/contact/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    postcode: data.postcode,
                    vehicle_registration: data.vehicleReg || null,
                    message: data.message,
                    safe_location_confirmed: data.safeLocation,
                }),
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                const detail = err.detail;
                const message = typeof detail === 'string'
                    ? detail
                    : Array.isArray(detail) && detail[0]?.msg
                        ? detail[0].msg
                        : 'Failed to send message. Please try again.';
                throw new Error(message);
            }
            trackEvent('submit_contact_form');
            setSubmitted(true);
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
        }
    };

    const inputClass =
        'w-full rounded-lg border border-border-default bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand';
    const labelClass = 'block text-sm font-medium text-text-primary mb-1.5';
    const errorClass = 'mt-1 text-xs text-danger';

    return (
        <>
            <Seo
                title="Contact"
                description="Get in touch with TriPoint Diagnostics. Call, WhatsApp, or send us a message."
                canonical="/contact"
            />

            <Section>
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                        Get in Touch
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
                        Have a question or ready to book? Reach out via phone, WhatsApp, or the form below or <Link to="/booking" className="text-brand hover:underline">book a slot online</Link>.
                    </p>
                    <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-brand/20 bg-brand/5 p-4 text-left">
                        <p className="text-sm font-semibold text-text-primary">For faster diagnosis, include:</p>
                        <ul className="mt-2 list-inside list-disc text-sm text-text-secondary">
                            <li>Postcode (for zone/price)</li>
                            <li>Registration, make/model, mileage</li>
                            <li>Symptoms or fault description</li>
                            <li>Drivable? (yes/no)</li>
                            <li>Parking situation (driveway, depot, roadside)</li>
                        </ul>
                    </div>
                </div>

                <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-3">
                    {/* Quick actions */}
                    <div className="space-y-4 lg:col-span-1">
                        <a
                            href={`tel:${siteConfig.contact.phoneE164}`}
                            className="flex items-center gap-4 rounded-2xl border border-border-default bg-surface-alt p-5 transition-all hover:border-brand/50 hover:shadow-lg hover:shadow-brand/10"
                            onClick={() => trackEvent('click_phone_header', { location: 'contact_page' })}
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-semibold text-text-primary">Call Us</p>
                                <p className="text-sm text-text-secondary">{siteConfig.contact.phoneDisplay}</p>
                            </div>
                        </a>

                        <a
                            href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 rounded-2xl border border-border-default bg-surface-alt p-5 transition-all hover:border-success/50 hover:shadow-lg hover:shadow-success/10"
                            onClick={() => trackEvent('click_whatsapp', { location: 'contact_page' })}
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
                                <MessageCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-semibold text-text-primary">WhatsApp <span className="text-xs font-normal text-success">(recommended)</span></p>
                                <p className="text-sm text-text-secondary">Fastest response - send postcode, reg, symptoms</p>
                            </div>
                        </a>

                        <a
                            href={`mailto:${siteConfig.contact.email}`}
                            className="flex items-center gap-4 rounded-2xl border border-border-default bg-surface-alt p-5 transition-all hover:border-brand/50 hover:shadow-lg hover:shadow-brand/10"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-semibold text-text-primary">Email</p>
                                <p className="text-sm text-text-secondary">{siteConfig.contact.email}</p>
                            </div>
                        </a>

                        <Link
                            to="/booking"
                            onClick={() => trackEvent('click_book_now', { location: 'contact_page' })}
                            className="flex items-center gap-4 rounded-2xl border-2 border-brand bg-brand/10 p-5 transition-all hover:border-brand hover:bg-brand hover:shadow-lg hover:shadow-brand/20"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-semibold text-text-primary">Book Now</p>
                                <p className="text-sm text-text-secondary">Pick a slot online</p>
                            </div>
                        </Link>
                    </div>

                    {/* Contact form */}
                    <div className="lg:col-span-2">
                        {submitted ? (
                            <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
                                <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
                                <h3 className="mt-4 text-xl font-bold text-text-primary">Message Sent!</h3>
                                <p className="mt-2 text-text-secondary">
                                    We&apos;ll get back to you as soon as possible. Usually within a few hours during operating hours.
                                </p>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="rounded-2xl border border-border-default bg-surface-alt p-6 sm:p-8"
                            >
                                <h3 className="mb-6 text-xl font-bold text-text-primary">Send a Message</h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="name" className={labelClass}>Name *</label>
                                        <input id="name" {...register('name')} className={inputClass} placeholder="Your name" />
                                        {errors.name && <p className={errorClass}>{errors.name.message}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="email" className={labelClass}>Email *</label>
                                        <input id="email" type="email" {...register('email')} className={inputClass} placeholder="you@email.com" />
                                        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className={labelClass}>Phone *</label>
                                        <input id="phone" {...register('phone')} className={inputClass} placeholder="07123 456789" />
                                        {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="postcode" className={labelClass}>Postcode *</label>
                                        <input id="postcode" {...register('postcode')} className={inputClass} placeholder="e.g. BR1 1AA" />
                                        {errors.postcode && <p className={errorClass}>{errors.postcode.message}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="vehicleReg" className={labelClass}>Vehicle reg (optional)</label>
                                        <input id="vehicleReg" {...register('vehicleReg')} className={inputClass} placeholder="e.g. AB12 CDE" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label htmlFor="message" className={labelClass}>Message *</label>
                                    <textarea
                                        id="message"
                                        {...register('message')}
                                        rows={5}
                                        className={inputClass}
                                        placeholder="Postcode, reg, make/model, mileage, symptoms, drivable (y/n), parking situation…"
                                    />
                                    {errors.message && <p className={errorClass}>{errors.message.message}</p>}
                                </div>
                                <div className="mt-4 flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="safeLocation"
                                        {...register('safeLocation')}
                                        className="mt-0.5 h-4 w-4 rounded border-border-default text-brand focus:ring-brand"
                                    />
                                    <label htmlFor="safeLocation" className="text-sm text-text-secondary">
                                        Vehicle is parked in a safe working location (driveway, depot, yard - not a live road)
                                    </label>
                                </div>
                                {errors.safeLocation && <p className={errorClass}>{errors.safeLocation.message}</p>}

                                {submitError && (
                                    <p className="mt-4 text-sm text-danger">{submitError}</p>
                                )}

                                <div className="mt-6">
                                    <CTAButton type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                                        {isSubmitting ? 'Sending…' : 'Send Message'}
                                    </CTAButton>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </Section>
        </>
    );
}
