import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { siteConfig } from '@/config/site';
import { Phone, MessageCircle, Mail, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

const contactSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email required'),
    phone: z.string().min(10, 'Valid phone number required'),
    postcode: z.string().min(3, 'Postcode is required'),
    message: z.string().min(10, 'Please include a message'),
    safeLocation: z.boolean().refine((v) => v, {
        message: 'Please confirm the vehicle is in a safe working location',
    }),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: { safeLocation: false },
    });

    const onSubmit = (data: ContactFormData) => {
        // TODO: Wire to email API (SendGrid, Resend, Zapier/Make webhook, etc.)
        console.log('Contact form:', data);
        const existing = JSON.parse(localStorage.getItem('tripoint_contacts') ?? '[]') as unknown[];
        existing.push({ ...data, timestamp: new Date().toISOString() });
        localStorage.setItem('tripoint_contacts', JSON.stringify(existing));
        trackEvent('submit_contact_form');
        setSubmitted(true);
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
                        Have a question or ready to book? Reach out via phone, WhatsApp, or the form below.
                    </p>
                </div>

                <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-3">
                    {/* Quick actions */}
                    <div className="space-y-4 lg:col-span-1">
                        <a
                            href={`tel:${siteConfig.contact.phoneE164}`}
                            className="flex items-center gap-4 rounded-2xl border border-border-default bg-surface-alt p-5 transition-all hover:border-brand/50 hover:shadow-lg hover:shadow-brand/10"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div onClick={() => trackEvent('click_phone_header', { location: 'contact_page' })}>
                                <p className="font-semibold text-text-primary">Call Us</p>
                                <p className="text-sm text-text-secondary">{siteConfig.contact.phoneDisplay}</p>
                            </div>
                        </a>

                        <a
                            href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 rounded-2xl border border-border-default bg-surface-alt p-5 transition-all hover:border-success/50 hover:shadow-lg hover:shadow-success/10"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
                                <MessageCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-semibold text-text-primary">WhatsApp</p>
                                <p className="text-sm text-text-secondary">Quick response</p>
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
                                        <input id="phone" {...register('phone')} className={inputClass} placeholder="07XXX XXXXXX" />
                                        {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="postcode" className={labelClass}>Postcode *</label>
                                        <input id="postcode" {...register('postcode')} className={inputClass} placeholder="e.g. TN9 1PP" />
                                        {errors.postcode && <p className={errorClass}>{errors.postcode.message}</p>}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label htmlFor="message" className={labelClass}>Message *</label>
                                    <textarea
                                        id="message"
                                        {...register('message')}
                                        rows={5}
                                        className={inputClass}
                                        placeholder="Tell us about your vehicle, symptoms, and what you need help with…"
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
