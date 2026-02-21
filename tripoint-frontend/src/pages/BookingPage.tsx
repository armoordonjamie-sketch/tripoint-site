import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { BookingScheduler } from '@/components/BookingScheduler';
import { Phone, MessageCircle, Clock, Shield } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function BookingPage() {
    return (
        <>
            <Seo
                title="Book a Diagnostic"
                description="Book your mobile diagnostic appointment with TriPoint Diagnostics. Pick your service, check live availability, and confirm your fixed price online."
                canonical="/booking"
            />

            <Section>
                {/* Hero */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                        Book Your Diagnostic
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
                        Select your service, enter your postcode, choose a slot - done. Fixed pricing, no surprises.
                    </p>

                    {/* Trust badges */}
                    <div className="mx-auto mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-text-muted">
                        <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-brand" />
                            Mon–Sat, 6 AM – 10 PM
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Shield className="h-4 w-4 text-brand" />
                            Fixed zone-based pricing
                        </span>
                    </div>
                </div>

                {/* Booking scheduler */}
                <div className="mx-auto max-w-3xl">
                    <BookingScheduler />
                </div>

                {/* Prefer to call? */}
                <div className="mx-auto mt-10 max-w-md rounded-xl border border-border-default bg-surface-alt p-5 text-center">
                    <p className="text-sm font-medium text-text-primary mb-3">Prefer to book by phone?</p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <a
                            href={`tel:${siteConfig.contact.phoneE164}`}
                            className="inline-flex items-center gap-2 text-brand hover:text-brand-light transition-colors"
                        >
                            <Phone className="h-4 w-4" />
                            {siteConfig.contact.phoneDisplay}
                        </a>
                        <a
                            href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-success hover:text-success/80 transition-colors"
                        >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                        </a>
                    </div>
                </div>
            </Section>
        </>
    );
}
