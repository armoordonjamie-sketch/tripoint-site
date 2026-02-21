import { useEffect, useRef } from 'react';
import { Seo } from '@/components/Seo';
import { trackEvent } from '@/lib/analytics';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { PhotoGallery } from '@/components/PhotoGallery';
import { Notice } from '@/components/Notice';
import { FaqAccordion } from '@/components/FaqAccordion';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, Phone, MessageCircle } from 'lucide-react';
import { galleryImages } from '@/data/galleryImages';
import { siteConfig } from '@/config/site';
import { ServiceSchema, BreadcrumbSchema, FaqPageSchema } from '@/components/JsonLd';

const diagnosticPhotos = [
    galleryImages[22],
    galleryImages[2],
    galleryImages[47],
    galleryImages[30],
    galleryImages[4],
    galleryImages[9],
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

const diagnosticService = siteConfig.pricing.services.find((s) => s.slug === 'diagnostic-callout');
const zoneA = diagnosticService?.zoneA ?? 120;
const zoneB = diagnosticService?.zoneB ?? 135;
const zoneC = diagnosticService?.zoneC ?? 150;

const faqs = [
    {
        question: 'What if you can\'t find the fault?',
        answer:
            'We\'ll tell you honestly. If a fault is intermittent or needs specialist equipment we don\'t carry mobile, we\'ll document what we\'ve checked and refer you to an appropriate workshop with our findings. You still get a written outcome - no dead ends.',
    },
    {
        question: 'Do I need to be there?',
        answer:
            'Ideally yes - we like to discuss symptoms with you and may need the keys for guided tests. If you can\'t be there, we can work with someone you authorise (e.g. at a depot). Just let us know when booking.',
    },
    {
        question: 'What happens if parts are needed?',
        answer:
            'We\'ll quote you for the parts and labour before any work begins. You can choose OEM, OEM-equivalent, or supply your own. We never fit anything without your approval. Follow-on labour after the included 60 minutes is £85/hour in 15-minute increments.',
    },
    {
        question: 'How long does it take?',
        answer:
            'The diagnostic visit itself is up to 60 minutes on-site. We\'ll give you a time window when we confirm the booking. If we need longer to investigate, we\'ll discuss it with you - no surprises.',
    },
];

const crossSell = [
    { title: 'Emissions Diagnostics', desc: 'AdBlue, DPF, NOx, EGR faults', href: '/services/emissions-diagnostics' },
    { title: 'VOR Van Diagnostics', desc: 'Van off the road? Need a fast decision?', href: '/services/vor-van-diagnostics' },
];

export function DiagnosticCalloutPage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo
                title="Diagnostic Callout"
                description="Mobile diagnostic callout service - full-system scan, live data, guided tests, and a written fix plan. From £120 across Kent & SE London."
                canonical="/services/diagnostic-callout"
            />
            <ServiceSchema name="Diagnostic Callout" description="Mobile diagnostic callout - full-system scan, live data, guided tests, written fix plan. Kent & SE London." url="/services/diagnostic-callout" priceFrom={zoneA} />
            <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Diagnostic Callout', url: '/services/diagnostic-callout' }]} />
            <FaqPageSchema items={faqs} />

            {/* Hero banner */}
            <section className="relative h-56 sm:h-72 overflow-hidden">
                <img src="/images/diagnostic-callout.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/30" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                    <div className="mx-auto max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Service</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                            Diagnostic Callout
                        </h1>
                    </div>
                </div>
            </section>

            <Section>
                <div className="mx-auto max-w-3xl">
                    {/* Warm intro */}
                    <p className="text-xl text-text-secondary leading-relaxed">
                        Dashboard lit up like a Christmas tree? Engine light on, limp mode, or something just doesn&apos;t feel right? We&apos;ve been there. A diagnostic callout is the foundation of everything we do - a thorough on-site visit with professional-grade tooling, at your location. No guesswork, no &ldquo;we&apos;ll have a look and see&rdquo; - we identify the root cause and give you a clear written outcome with next steps.
                    </p>

                    {/* Is this the right service? */}
                    <div className="mt-10 rounded-2xl border border-brand/20 bg-brand/5 p-6 reveal">
                        <h2 className="text-lg font-bold text-text-primary">Is this the right service for you?</h2>
                        <p className="mt-2 text-text-secondary">
                            Yes, if you have a warning light, fault symptoms, or a concern that needs proper investigation - not just a code read. Ideal for cars, vans, and commercial vehicles across all makes. If your van is off the road and you need a fast back-on-road decision, check out our <a href="/services/vor-van-diagnostics" className="text-brand hover:underline">VOR Van Diagnostics</a>. For AdBlue, DPF, or emissions faults, see our <a href="/services/emissions-diagnostics" className="text-brand hover:underline">Emissions Diagnostics</a>.
                        </p>
                    </div>

                    {/* Who it's for */}
                    <div className="mt-10 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Who It&apos;s For</h2>
                        <p className="mt-2 text-text-secondary">
                            Any driver or operator with a warning light, fault symptoms, or concern that needs proper investigation - not just a code read. Ideal for cars, vans, and commercial vehicles across all makes.
                        </p>
                    </div>

                    {/* Common Symptoms */}
                    <div className="mt-8 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Common Symptoms</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'Engine management light (EML) or check engine light on',
                                'Limp mode / reduced power',
                                'Unusual noises, vibrations, or performance issues',
                                'Warning lights (ABS, ESP, glow plug, battery)',
                                'Intermittent faults or difficult-to-reproduce problems',
                                'Vehicle not starting or cranking issues',
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
                                'Full-system scan (all modules, not just engine)',
                                'Freeze frame and fault code analysis',
                                'Live data checks and sensor plausibility',
                                'Guided tests and actuations where applicable',
                                'Written findings and root cause analysis',
                                'Recommended next steps and quote for follow-on work',
                                'Up to 60 minutes on-site time',
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
                        <CTAButton href="/booking" size="md" onClick={() => trackEvent('click_book_now', { location: 'diagnostic_callout_mid' })}>
                            Book Now
                        </CTAButton>
                        <CTAButton
                            href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                            variant="outline"
                            size="md"
                            external
                            icon={<MessageCircle className="h-4 w-4" />}
                            onClick={() => trackEvent('click_whatsapp', { location: 'diagnostic_callout' })}
                        >
                            WhatsApp Us
                        </CTAButton>
                    </div>

                    {/* Examples from our work */}
                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Examples From Our Work</h2>
                        <p className="mt-2 text-sm text-text-muted">Real photos from real diagnostic callouts</p>
                        <div className="mt-4">
                            <PhotoGallery images={diagnosticPhotos} columns={3} />
                        </div>
                    </div>

                    {/* When Workshop Referral May Be Needed */}
                    <div className="mt-10 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">When Workshop Referral May Be Needed</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'Work requiring ramp or major underbody access',
                                'Heavy drivetrain jobs that can\'t be done safely mobile',
                                'Faults requiring manufacturer-specific online access (documented for referral)',
                            ].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* How It Works */}
                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">How It Works</h2>
                        <div className="mt-6 space-y-6">
                            {[
                                { step: '01', title: 'Book or get in touch', desc: 'Tell us your postcode, vehicle, and symptoms. We confirm your zone and price.' },
                                { step: '02', title: 'We come to you', desc: 'On the day, we arrive at your location with full diagnostic kit. Deep scan, live data, guided tests.' },
                                { step: '03', title: 'Written fix plan', desc: 'You get a clear outcome: fault codes, root cause, recommended next steps. No jargon, no guesswork.' },
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
                        <p className="mt-2 text-sm text-text-muted">Includes travel and up to 60 mins on-site. Deposit £30 (Zone A/B) or £50 (Zone C).</p>
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
                        <p className="mt-1 text-sm text-text-secondary">Zone-based pricing - includes travel and up to 60 mins on-site</p>
                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                            <CTAButton href="/pricing" variant="outline" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
                                Full Pricing
                            </CTAButton>
                            <CTAButton href="/booking" size="sm" onClick={() => trackEvent('click_book_now', { location: 'diagnostic_callout' })}>
                                Book Now
                            </CTAButton>
                        </div>
                    </div>

                    <div className="mt-8 reveal">
                        <Notice variant="info">
                            All diagnostic services end with a written outcome - fault codes, checks performed, root cause analysis, and recommended next steps.
                        </Notice>
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
                            Need a proper diagnosis?
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                            Book a diagnostic callout and get a clear answer - at your door.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackEvent('click_book_now', { location: 'diagnostic_callout_footer' })}>
                                Book Now
                            </CTAButton>
                            <CTAButton
                                href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                                variant="ghost"
                                size="lg"
                                external
                                icon={<MessageCircle className="h-5 w-5" />}
                                className="text-white hover:text-white hover:bg-white/10"
                                onClick={() => trackEvent('click_whatsapp', { location: 'diagnostic_callout' })}
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
                                onClick={() => trackEvent('click_phone_header', { location: 'diagnostic_callout' })}
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
