import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { BookingScheduler } from '@/components/BookingScheduler';
import { Phone, MessageCircle } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics';
import { getWhatsAppHref } from '@/lib/whatsappHref';

function AlternateBookingContact({ className }: { className?: string }) {
    return (
        <div className={className}>
            <p className="mb-1 text-sm font-medium text-text-primary md:mb-3">Prefer to book by phone?</p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-sm">
                <a
                    href={`tel:${siteConfig.contact.phoneE164}`}
                    className="inline-flex items-center gap-2 text-brand hover:text-brand-light transition-colors"
                    onClick={() => trackPhoneClick('booking')}
                >
                    <Phone className="h-4 w-4 shrink-0" />
                    {siteConfig.contact.phoneDisplay}
                </a>
                <a
                    href={getWhatsAppHref()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-success hover:text-success/80 transition-colors"
                    onClick={() => trackWhatsAppClick('booking')}
                >
                    <MessageCircle className="h-4 w-4 shrink-0" />
                    WhatsApp
                </a>
            </div>
        </div>
    );
}

export function BookingPage() {
    return (
        <>
            <Seo
                title="Book Online"
                description="Book a diagnostic, servicing, or health check online with TriPoint Diagnostics. Pick your service, check live availability, and confirm your fixed price. Kent & SE London."
                canonical="/booking"
            />

            <Section>
                {/* Hero */}
                <div className="mb-6 text-center sm:mb-10">
                    <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                        Book Online
                    </h1>
                </div>

                {/* Compact phone/WhatsApp — visible without scrolling past the scheduler (mobile) */}
                <div className="mx-auto mb-4 max-w-3xl md:mb-6 md:hidden">
                    <div className="rounded-xl border border-border-default bg-surface-alt px-4 py-2.5 text-center sm:py-3">
                        <AlternateBookingContact />
                    </div>
                </div>

                <div className="mx-auto max-w-3xl">
                    <BookingScheduler />
                </div>

                {/* Prefer to call? — desktop only (mobile uses compact block above hero flow) */}
                <div className="mx-auto mt-10 hidden max-w-md rounded-xl border border-border-default bg-surface-alt p-5 text-center md:block">
                    <AlternateBookingContact />
                </div>
            </Section>
        </>
    );
}
