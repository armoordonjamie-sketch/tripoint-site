import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { trackEvent } from '@/lib/analytics';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { PhotoGallery } from '@/components/PhotoGallery';

import { FaqAccordion } from '@/components/FaqAccordion';
import { CheckCircle2, ArrowRight, Phone, MessageCircle } from 'lucide-react';
import { galleryImages } from '@/data/galleryImages';
import { siteConfig } from '@/config/site';
import { ServiceSchema, BreadcrumbSchema, FaqPageSchema } from '@/components/JsonLd';

const emissionsPhotos = [
    galleryImages[25],
    galleryImages[34],
    galleryImages[13],
    galleryImages[42],
    galleryImages[26],
    galleryImages[43],
];

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

const emissionsService = siteConfig.pricing.services.find((s) => s.slug === 'emissions-diagnostics');
const zoneA = emissionsService?.zoneA ?? 170;
const zoneB = emissionsService?.zoneB ?? 185;
const zoneC = emissionsService?.zoneC ?? 200;

const faqs = [
    {
        question: 'Can you clear my AdBlue countdown?',
        answer:
            'We diagnose the root cause - NOx sensor faults, AdBlue quality issues, SCR efficiency problems - and carry out compliant repairs. Simply "clearing" a countdown without fixing the underlying issue would be irresponsible. The countdown exists for a reason. We fix it properly.',
    },
    {
        question: 'What\'s a forced regen?',
        answer:
            'A forced regeneration burns off soot in the DPF by raising exhaust temperatures. We can do it where it\'s safe - but we always run safety checks first (soot load, oil level, temperature). If a regen isn\'t safe to do mobile, we\'ll tell you and recommend the next step.',
    },
    {
        question: 'Will you fit a DPF delete?',
        answer:
            'No - we diagnose and repair emissions systems through proper manufacturer procedures.',
    },
    {
        question: 'How much does a NOx sensor cost?',
        answer:
            'NOx sensors vary by vehicle - some are £200–400, others can be £600+. We\'ll identify the faulty component, give you a quote for parts and labour, and you can choose OEM, OEM-equivalent, or source your own. We never fit anything without your approval.',
    },
];

const crossSell = [
    { title: 'Diagnostic Callout', desc: 'General fault diagnosis - not emissions-specific', href: '/services/diagnostic-callout' },
];

export function EmissionsDiagnosticsPage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo
                title="Emissions Fault Decision Visit"
                description="Professional diagnosis for AdBlue, SCR, DPF, and NOx faults. Root cause identification with live data and guided tests. From £170."
                canonical="/services/emissions-diagnostics"
            />
            <ServiceSchema name="Emissions Fault Decision Visit" description="Professional diagnosis for AdBlue, SCR, DPF, NOx faults. Root cause identification, live data, guided tests." url="/services/emissions-diagnostics" priceFrom={zoneA} />
            <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Emissions Diagnostics', url: '/services/emissions-diagnostics' }]} />
            <FaqPageSchema items={faqs} />

            {/* Hero banner */}
            <section className="relative h-56 sm:h-72 overflow-hidden">
                <img src="/images/emissions-diagnostics.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/30" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                    <div className="mx-auto max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Service</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                            Emissions Fault Decision Visit
                        </h1>
                    </div>
                </div>
            </section>

            <Section>
                <div className="mx-auto max-w-3xl">
                    {/* Warm intro */}
                    <p className="text-xl text-text-secondary leading-relaxed">
                        AdBlue countdown ticking? DPF light won&apos;t clear? NOx sensor throwing a wobbly? Emissions systems on modern diesels are complex - and getting the diagnosis right matters. We use live data, guided tests, and proper manufacturer procedures to identify the root cause and get it fixed.
                    </p>

                    {/* Is this the right service? */}
                    <div className="mt-10 rounded-2xl border border-brand/20 bg-brand/5 p-6 reveal">
                        <h2 className="text-lg font-bold text-text-primary">Is this the right service for you?</h2>
                        <p className="mt-2 text-text-secondary">
                            Yes, if you have AdBlue, DPF, SCR, EGR, or NOx-related warnings. If your van is off the road and you need a fast triage, our <Link to="/services/vor-van-diagnostics" className="text-brand hover:underline">VOR Van Diagnostics</Link> may be better. For general fault diagnosis, see our <Link to="/services/diagnostic-callout" className="text-brand hover:underline">Diagnostic Callout</Link>.
                        </p>
                    </div>

                    {/* Who it's for */}
                    <div className="mt-10 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Who It&apos;s For</h2>
                        <p className="mt-2 text-text-secondary">
                            Any vehicle owner or fleet operator dealing with emissions-related warnings, countdowns, or faults. Especially relevant for AdBlue/SCR-equipped vehicles and those operating in ULEZ zones.
                        </p>
                    </div>

                    {/* Common Symptoms */}
                    <div className="mt-8 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Common Symptoms</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'AdBlue countdown or "Start Not Possible" warning',
                                'DPF warning light or failed forced regen',
                                'SCR efficiency faults or NOx sensor errors',
                                'EGR-related performance issues',
                                'Excessive soot load / DPF pressure differential warnings',
                                'MIL (malfunction indicator lamp) for emissions components',
                                'ULEZ compliance concerns',
                            ].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* What's included */}
                    <div className="mt-8 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">What&apos;s Included</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'Full emissions system scan and fault code analysis',
                                'Live data validation: temperatures, pressures, NOx values, AdBlue quality/level',
                                'Regen safety gating - we check before forcing a regen',
                                'Component-level verification steps (sensors, heaters, injectors, pumps)',
                                'Written plan with root cause and recommended repair',
                                'Up to 90 minutes on-site time',
                            ].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Mid-page CTA */}
                    <div className="mt-10 flex flex-wrap gap-3 reveal">
                        <CTAButton href="/booking" size="md" onClick={() => trackEvent('click_book_now', { location: 'emissions_diagnostics_mid' })}>
                            Book Now
                        </CTAButton>
                        <CTAButton
                            href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                            variant="outline"
                            size="md"
                            external
                            icon={<MessageCircle className="h-4 w-4" />}
                            onClick={() => trackEvent('click_whatsapp', { location: 'emissions_diagnostics' })}
                        >
                            WhatsApp Us
                        </CTAButton>
                    </div>

                    {/* Emissions Faults We've Found */}
                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Emissions Faults We&apos;ve Found</h2>
                        <p className="mt-2 text-sm text-text-muted">Real examples of EGR, DPF, and exhaust system faults from our jobs</p>
                        <div className="mt-4">
                            <PhotoGallery images={emissionsPhotos} columns={3} />
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">How It Works</h2>
                        <div className="mt-6 space-y-6">
                            {[
                                { step: '01', title: 'Book and confirm', desc: 'Tell us your postcode, vehicle, and symptoms. We confirm zone and price.' },
                                { step: '02', title: 'On-site emissions diagnosis', desc: 'Full scan, live data, regen safety checks. We verify before forcing a regen.' },
                                { step: '03', title: 'Written repair plan', desc: 'Clear outcome with root cause and recommended repair path.' },
                            ].map((s) => (
                                <div key={s.step} className="flex gap-4">
                                    <div className="step-number flex h-10 w-10 shrink-0 items-center justify-center text-sm font-bold">{s.step}</div>
                                    <div>
                                        <h3 className="font-semibold text-text-primary">{s.title}</h3>
                                        <p className="mt-1 text-sm text-text-secondary">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Inline pricing */}
                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Pricing</h2>
                        <div className="mt-4 overflow-x-auto rounded-xl border border-border-default">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-border-default bg-surface-alt">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Zone</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Drive time</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Zone A</td><td className="px-4 py-3 text-text-secondary">0–25 mins</td><td className="px-4 py-3 text-right font-semibold text-brand-light">£{zoneA}</td></tr>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Zone B</td><td className="px-4 py-3 text-text-secondary">25–45 mins</td><td className="px-4 py-3 text-right font-semibold text-brand-light">£{zoneB}</td></tr>
                                    <tr><td className="px-4 py-3 text-text-secondary">Zone C</td><td className="px-4 py-3 text-text-secondary">45–60 mins</td><td className="px-4 py-3 text-right font-semibold text-brand-light">£{zoneC}</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-2 text-sm text-text-muted">Includes travel and up to 90 mins on-site. Deposit £30 (Zone A/B) or £50 (Zone C).</p>
                    </div>

                    {/* FAQ */}
                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Frequently Asked Questions</h2>
                        <div className="mt-6">
                            <FaqAccordion items={faqs} />
                        </div>
                    </div>

                    {/* Pricing CTA */}
                    <div className="mt-12 rounded-2xl border border-brand/20 bg-brand/5 p-6 text-center reveal">
                        <p className="text-2xl font-bold text-text-primary">
                            From <span className="text-brand-light">£{zoneA}</span>
                        </p>
                        <p className="mt-1 text-sm text-text-secondary">Zone-based pricing - includes travel and up to 90 mins on-site</p>
                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                            <CTAButton href="/pricing" variant="outline" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
                                Full Pricing
                            </CTAButton>
                            <CTAButton href="/booking" size="sm" onClick={() => trackEvent('click_book_now', { location: 'emissions_diagnostics' })}>
                                Book Now
                            </CTAButton>
                        </div>
                    </div>

                    {/* Related articles */}
                    <div className="mt-12 reveal">
                        <h2 className="text-xl font-bold text-text-primary">Related Articles</h2>
                        <div className="mt-4 space-y-3">
                            <Link to="/blog/adblue-countdown-clearing-codes-not-fix" className="flex items-center justify-between rounded-xl border border-border-default bg-surface-alt p-4 transition-all hover:border-brand/30 hover:bg-brand/5">
                                <span className="font-semibold text-text-primary">AdBlue Countdown: Why Clearing Codes Isn&apos;t a Fix</span>
                                <ArrowRight className="h-5 w-5 shrink-0 text-brand" />
                            </Link>
                            <Link to="/blog/dpf-warning-light-regen-vs-worse" className="flex items-center justify-between rounded-xl border border-border-default bg-surface-alt p-4 transition-all hover:border-brand/30 hover:bg-brand/5">
                                <span className="font-semibold text-text-primary">DPF Warning Lights: When Regen Helps vs When It Makes Things Worse</span>
                                <ArrowRight className="h-5 w-5 shrink-0 text-brand" />
                            </Link>
                        </div>
                    </div>

                    {/* Cross-sell */}
                    <div className="mt-12 reveal">
                        <h2 className="text-xl font-bold text-text-primary">Related Services</h2>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            {crossSell.map((s) => (
                                <Link
                                    key={s.href}
                                    to={s.href}
                                    className="flex items-center justify-between rounded-xl border border-border-default bg-surface-alt p-4 transition-all hover:border-brand/30 hover:bg-brand/5"
                                >
                                    <div>
                                        <h3 className="font-semibold text-text-primary">{s.title}</h3>
                                        <p className="text-sm text-text-secondary">{s.desc}</p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-brand" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            {/* Footer CTA banner */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img src="/images/cta-bg.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 to-brand/80" />
                </div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
                    <div className="text-center reveal">
                        <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                            Emissions fault? Get it fixed properly.
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                            Proper diagnosis and repair at your door.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackEvent('click_book_now', { location: 'emissions_diagnostics_footer' })}>
                                Book Now
                            </CTAButton>
                            <CTAButton
                                href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                                variant="ghost"
                                size="lg"
                                external
                                icon={<MessageCircle className="h-5 w-5" />}
                                className="text-white hover:text-white hover:bg-white/10"
                                onClick={() => trackEvent('click_whatsapp', { location: 'emissions_diagnostics' })}
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
                                onClick={() => trackEvent('click_phone_header', { location: 'emissions_diagnostics' })}
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
