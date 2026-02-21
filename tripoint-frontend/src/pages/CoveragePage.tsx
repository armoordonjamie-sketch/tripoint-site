import { useEffect, useRef } from 'react';
import {
    MapPin, Clock, Navigation, Phone, MessageCircle,
    Car, CheckCircle2,
} from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { TownChips } from '@/components/TownChips';
import { ZoneCalculator } from '@/components/ZoneCalculator';
import { CoverageMap } from '@/components/CoverageMap';
import { CTAButton } from '@/components/CTAButton';
import { Notice } from '@/components/Notice';
import { FaqAccordion } from '@/components/FaqAccordion';
import { siteConfig } from '@/config/site';
import { trackEvent } from '@/lib/analytics';

/* ── Intersection Observer for scroll-reveal ─────────── */
function useScrollReveal() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in-view'); }),
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
        );
        el.querySelectorAll('.reveal').forEach((child) => observer.observe(child));
        return () => observer.disconnect();
    }, []);
    return ref;
}

const coverageFaqs = [
    {
        question: 'How do you decide which base serves me?',
        answer:
            'We use whichever base is nearest to you at the time of your booking. Your confirmation will always show the active base and your zone.',
    },
    {
        question: 'Can I get a quote if I\'m outside the 60-minute radius?',
        answer:
            'Yes. Out-of-area jobs are assessed individually. Get in touch with your postcode and we\'ll let you know if we can offer a custom quote. It depends on the job, scheduling, and distance.',
    },
    {
        question: 'How accurate is the zone calculator?',
        answer:
            'We use live routing (Google/Apple Maps) at the time of booking to confirm your zone. The calculator gives a good indication, but your final zone and price are confirmed when we process your booking.',
    },
    {
        question: 'Do you cover my postcode?',
        answer:
            'If you\'re within 60 minutes drive of our Tonbridge or Eltham base, we can reach you. Use the zone checker above, or enter your postcode when booking and we\'ll confirm immediately.',
    },
];

export function CoveragePage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo
                title="Areas We Cover"
                description="Mobile diagnostic coverage across Kent & SE London. Zone-based pricing by drive time from our bases. Check your zone and book."
                canonical="/areas"
            />

            {/* ── HERO ──────────────────────────────────────── */}
            <section className="relative py-16 md:py-24">
                <div className="absolute inset-0 mesh-gradient opacity-30" aria-hidden="true" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center reveal">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">Service Area</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl md:text-6xl">
                            Where We Cover
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
                            Up to 60 minutes drive from our bases in Tonbridge and Eltham. Your zone determines your price – and we come to you. No workshop drop-off, no hassle.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-8 reveal" style={{ transitionDelay: '0.1s' }}>
                            {[
                                { value: '60min', label: 'Max drive time' },
                                { value: '2', label: 'Operating bases' },
                                { value: '13+', label: 'Towns covered' },
                                { value: 'A–C', label: 'Zone pricing' },
                            ].map((s) => (
                                <div key={s.label}>
                                    <p className="text-2xl font-bold text-brand-light">{s.value}</p>
                                    <p className="text-xs text-text-muted uppercase tracking-wider">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── ZONE CALCULATOR ─────────────────────────────── */}
            <Section>
                <div className="mx-auto max-w-2xl reveal">
                    <ZoneCalculator />
                    <p className="mt-4 text-center text-sm text-text-muted">
                        Your zone is confirmed when you book. Enter your postcode above for an instant estimate.
                    </p>
                </div>
            </Section>

            {/* ── MAP ────────────────────────────────────────── */}
            <Section className="bg-surface-alt/30">
                <div className="text-center reveal">
                    <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">Coverage Map</h2>
                    <p className="mt-2 text-text-secondary">
                        Kent and South East London – from Gravesend to Greenwich, Sevenoaks to Sidcup.
                    </p>
                </div>
                <div className="mx-auto mt-8 max-w-5xl reveal" style={{ transitionDelay: '0.1s' }}>
                    <CoverageMap />
                </div>
            </Section>

            {/* ── OPERATING BASES ─────────────────────────────── */}
            <Section>
                <div className="text-center reveal">
                    <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">Our Operating Bases</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
                        We operate from two bases across Kent and South East London. Your booking confirmation shows which base serves you and your zone.
                    </p>
                </div>
                <div className="mx-auto mt-10 max-w-4xl">
                    <div className="grid gap-6 sm:grid-cols-2 reveal" style={{ transitionDelay: '0.05s' }}>
                        {siteConfig.baseLocations.map((loc) => (
                            <div key={loc.label} className="rounded-2xl border border-border-default bg-surface-alt p-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-brand" />
                                    <h3 className="font-semibold text-text-primary">{loc.label}</h3>
                                </div>
                                <p className="text-sm text-text-muted">Coverage calculated from here</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-text-secondary reveal">
                        <Clock className="h-4 w-4 text-brand" />
                        <span className="font-medium">Operating hours:</span>
                        <span>{siteConfig.operatingHours}</span>
                    </div>
                </div>
            </Section>

            {/* ── TRAVEL ZONES ───────────────────────────────── */}
            <Section className="bg-surface-alt/30">
                <div className="text-center reveal">
                    <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">Travel Zones</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
                        Zones are based on one-way drive time from our nearest base, calculated using Google or Apple Maps at the time of booking.
                    </p>
                </div>
                <div className="mx-auto mt-10 max-w-4xl">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 reveal" style={{ transitionDelay: '0.05s' }}>
                        {siteConfig.zones.map((z) => (
                            <div
                                key={z.zone}
                                className="rounded-2xl border border-border-default bg-surface-alt p-5 text-center"
                            >
                                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                                    <Navigation className="h-5 w-5 text-brand" />
                                </div>
                                <p className="text-lg font-bold text-brand-light">Zone {z.zone}</p>
                                <p className="text-sm text-text-secondary">{z.driveTime}</p>
                                <p className="mt-1 text-xs text-text-muted">{z.note}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ── TOWNS WE COVER ─────────────────────────────── */}
            <Section>
                <div className="text-center reveal">
                    <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">Towns We Commonly Cover</h2>
                    <p className="mt-2 text-text-secondary">
                        This isn’t an exhaustive list. If you’re within 60 minutes of Tonbridge or Eltham, we can likely reach you.
                    </p>
                </div>
                <div className="mt-8 reveal" style={{ transitionDelay: '0.1s' }}>
                    <TownChips />
                </div>
            </Section>

            {/* ── HOW WE CALCULATE ───────────────────────────── */}
            <Section className="bg-surface-alt/30">
                <div className="mx-auto max-w-2xl reveal">
                    <h2 className="text-xl font-bold text-text-primary">How we calculate your zone</h2>
                    <div className="mt-4 space-y-3 text-sm text-text-secondary">
                        <div className="flex items-start gap-3 rounded-xl border border-border-default bg-surface-alt p-4">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                            <p>We measure <strong>one-way drive time</strong> from our active base to your postcode at the time of booking.</p>
                        </div>
                        <div className="flex items-start gap-3 rounded-xl border border-border-default bg-surface-alt p-4">
                            <Car className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                            <p>We use <strong>live routing</strong> (Google/Apple Maps) – not straight-line distance – so traffic and roads are factored in.</p>
                        </div>
                        <div className="flex items-start gap-3 rounded-xl border border-border-default bg-surface-alt p-4">
                            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                            <p>Your <strong>confirmation email</strong> will show your zone and the base used. No surprises.</p>
                        </div>
                    </div>
                </div>
            </Section>

            {/* ── FAQ ────────────────────────────────────────── */}
            <Section>
                <div className="text-center reveal">
                    <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">Coverage FAQs</h2>
                </div>
                <div className="mx-auto mt-8 max-w-2xl reveal" style={{ transitionDelay: '0.1s' }}>
                    <FaqAccordion items={coverageFaqs} />
                </div>
            </Section>

            {/* ── OUT OF AREA ────────────────────────────────── */}
            <Section>
                <div className="mx-auto max-w-2xl reveal">
                    <Notice variant="info">
                        <strong>Outside the 60-minute radius?</strong> Get in touch anyway – we may be able to offer a quote depending on the job and scheduling. Out-of-area bookings are assessed individually.
                    </Notice>
                </div>

                <div className="mt-10 flex flex-wrap justify-center gap-4 reveal">
                    <CTAButton href="/booking" size="lg" onClick={() => trackEvent('click_book_now', { location: 'coverage' })}>
                        Check Your Zone &amp; Book
                    </CTAButton>
                    <CTAButton
                        href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                        variant="outline"
                        size="lg"
                        external
                        icon={<MessageCircle className="h-5 w-5" />}
                        onClick={() => trackEvent('click_whatsapp', { location: 'coverage' })}
                    >
                        WhatsApp Us
                    </CTAButton>
                </div>
            </Section>

            {/* ── FOOTER CTA BANNER ─────────────────────────── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img src="/images/cta-bg.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 to-brand/80" />
                </div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
                    <div className="text-center reveal">
                        <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                            Ready to book?
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                            Enter your postcode, pick a service, and we’ll confirm your zone and price. Or WhatsApp us for a quick quote.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackEvent('click_book_now', { location: 'coverage_footer' })}>
                                Book Now
                            </CTAButton>
                            <CTAButton
                                href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                                variant="ghost"
                                size="lg"
                                external
                                icon={<MessageCircle className="h-5 w-5" />}
                                className="text-white hover:text-white hover:bg-white/10"
                                onClick={() => trackEvent('click_whatsapp', { location: 'coverage_footer' })}
                            >
                                WhatsApp Us
                            </CTAButton>
                            <CTAButton
                                href={`tel:${siteConfig.contact.phoneE164}`}
                                variant="ghost"
                                size="lg"
                                external
                                icon={<Phone className="h-5 w-5" />}
                                className="text-white hover:text-white hover:bg-white/10"
                                onClick={() => trackEvent('click_phone_header', { location: 'coverage_footer' })}
                            >
                                {siteConfig.contact.phoneDisplay}
                            </CTAButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
