import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { trackNavClick, trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { FaqAccordion } from '@/components/FaqAccordion';
import { Notice } from '@/components/Notice';
import { CheckCircle2, XCircle, ArrowRight, Phone, MessageCircle } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { ServiceSchema, BreadcrumbSchema, FaqPageSchema } from '@/components/JsonLd';
import { OptimizedImage } from '@/components/OptimizedImage';
import { VatLabel } from '@/components/VatLabel';

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

const faqs = [
    {
        question: 'How do I know if my Citan needs brakes?',
        answer: 'Common signs: squealing or grinding sounds, a brake wear warning on the dash, a pulsating pedal, or the van pulling to one side under braking. If in doubt, we can measure everything during a visit.',
    },
    {
        question: 'Are Citan brakes expensive?',
        answer: 'The Citan is one of the most affordable Mercedes vans to maintain. Brake parts are generally cheaper than Vito or Sprinter, and the job is quicker. Our front pads-only package starts at just £169 + VAT.',
    },
    {
        question: 'Do you use genuine Mercedes parts?',
        answer: 'Yes. We use genuine Mercedes parts as standard. You get the right parts, fitted properly, with none of the dealer markup.',
    },
    {
        question: 'Do you cover the newer W420 Citan?',
        answer: 'Yes. We cover both the W415 (2012-2021) and W420 (2021+) Citan for brake work. Parts are pre-ordered specific to your model before we arrive.',
    },
    {
        question: 'How long does a Citan brake job take?',
        answer: 'Front pads only: around 30 minutes. Front pads and discs: 45-60 minutes. All done at your location.',
    },
];

const crossSell = [
    { title: 'Citan Servicing', desc: 'Full service packages for Citan', href: '/services/citan-servicing' },
    { title: 'Mercedes Van Servicing', desc: 'All Mercedes van service and brake packages', href: '/services/mercedes-van-servicing' },
    { title: 'Standard Diagnosis', desc: 'Got a fault or warning light? We diagnose it.', href: '/services/diagnostic-callout' },
];

export function CitanBrakesPage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo title="Mobile Mercedes Citan Brakes" description="Mobile Citan brake service. Front pads from £169 (ex. VAT), front pads and discs from £319 (ex. VAT). Fixed-price brake packages for W415 and W420 at your location." canonical="/services/citan-brakes" />
            <ServiceSchema
                name="Citan Brakes"
                description="Mobile Mercedes Citan brake service - front and rear pads and discs fitted at your location."
                url="/services/citan-brakes"
                priceFrom={169}
                offerCatalogItems={[
                    { name: 'Front Pads Only Zone A (0 to 25 minutes)', price: '169.00', priceCurrency: 'GBP', description: 'Mobile front pad replacement at your location' },
                    { name: 'Front Pads Only Zone B (25 to 45 minutes)', price: '184.00', priceCurrency: 'GBP', description: 'Mobile front pad replacement at your location' },
                    { name: 'Front Pads Only Zone C (45 to 60 minutes)', price: '199.00', priceCurrency: 'GBP', description: 'Mobile front pad replacement at your location' },
                ]}
            />
            <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Mercedes Van Servicing', url: '/services/mercedes-van-servicing' }, { name: 'Citan Brakes', url: '/services/citan-brakes' }]} />
            <FaqPageSchema items={faqs} />

            {/* ─── HERO ─── */}
            <section className="relative h-72 sm:h-96 overflow-hidden">
                <img
                    src="/images/services/van-citan-w420-front.png"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/25" />
                <div className="absolute bottom-0 left-0 right-0 z-10 p-6 sm:p-10">
                    <div className="mx-auto max-w-5xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Mercedes Citan Specialist</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl lg:text-6xl">Citan Brakes</h1>
                        <p className="mt-3 max-w-xl text-lg text-text-secondary">W415 &bull; W420 &bull; Front &amp; Rear Packages</p>
                    </div>
                </div>
            </section>

            {/* ─── LEAD PARAGRAPH ─── */}
            <Section>
                <div className="mx-auto max-w-3xl reveal">
                    <p className="text-base leading-relaxed text-text-secondary lg:text-xl">
                        The Mercedes Citan is built on the Renault Kangoo platform, which means brake parts are shared with the Renault range and are generally cheaper than Sprinter or Vito equivalents. Common fault patterns include early pad wear on the inner surface due to slider pin corrosion, and rear disc surface corrosion on vans used for short urban runs. Both the W415 and W420 are covered across Kent and South East London, with parts pre-ordered for your specific model before we arrive and a written report confirming all work completed.
                    </p>
                </div>
            </Section>

            {/* ─── SECTION 1: Intro - image left, text right ─── */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center reveal">
                        <div className="overflow-hidden rounded-2xl">
                            <div className="relative aspect-[16/10] min-h-[220px] sm:min-h-[280px]">
                                <OptimizedImage
                                    src="/images/new-images/citan-brakes.jpg"
                                    alt="Mercedes Citan front brake disc and caliper during pad replacement"
                                    className="absolute inset-0 h-full w-full object-cover rounded-2xl transition-transform duration-500 hover:scale-105"
                                />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Small van, big workload</h2>
                            <p className="mt-4 text-text-secondary leading-relaxed">
                                Your Citan&apos;s brakes work harder than you think. Tight deliveries, stop-start traffic, fully loaded - when they start making noise or the light comes on, get them sorted fast.
                            </p>
                            <p className="mt-3 text-text-secondary leading-relaxed">
                                Genuine Mercedes parts, proper fitment, no workshop trip - real Citan work, not generic stock photos. The Citan is one of the most affordable Mercedes vans to maintain - our fixed-price packages keep it that way.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <CTAButton href="/booking" size="md" onClick={() => trackNavClick('/booking', 'Book Online', 'citan_brakes_top')}>Book Online</CTAButton>
                                <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="outline" size="md" external icon={<MessageCircle className="h-4 w-4" />} onClick={() => trackWhatsAppClick('citan_brakes')}>WhatsApp Us</CTAButton>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* ─── SECTION 2: "We Measure" - text left, image right ─── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center reveal">
                        <div className="order-2 md:order-1">
                            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">We measure, not guess</h2>
                            <p className="mt-4 text-text-secondary leading-relaxed">
                                Every Citan brake job starts with a proper measurement. We check disc thickness with vernier calipers against Mercedes minimum specs - not just a visual glance.
                            </p>
                            <p className="mt-3 text-text-secondary leading-relaxed">
                                If your discs are fine, we&apos;ll say so. If they need replacing, you&apos;ll see the numbers. No upselling.
                            </p>
                            <ul className="mt-6 space-y-2">
                                {[
                                    'Disc thickness measured against Mercedes spec',
                                    'Pad wear assessed on all corners',
                                    'Caliper slider pins checked and lubricated',
                                    'Brake fluid level inspected',
                                ].map((s) => (
                                    <li key={s} className="flex items-start gap-2 text-text-secondary text-sm">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                                        <span>{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="order-1 md:order-2 overflow-hidden rounded-2xl">
                            <figure>
                                <div className="relative aspect-[16/10] min-h-[220px] sm:min-h-[280px]">
                                    <OptimizedImage
                                        src="/images/new-images/sprinter-brakes-02.jpg"
                                        alt="Digital vernier caliper measuring brake disc thickness - same process for Citan"
                                        className="absolute inset-0 h-full w-full object-cover rounded-2xl transition-transform duration-500 hover:scale-105"
                                    />
                                </div>
                                <figcaption className="mt-2 text-xs text-text-muted">Disc thickness measured to Mercedes spec - same process for all our van brake work.</figcaption>
                            </figure>
                        </div>
                    </div>
                </div>
            </Section>

            {/* ─── SECTION 3: What's Included ─── */}
            <Section>
                <div className="mx-auto max-w-3xl reveal">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">What&apos;s included in every brake job</h2>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            'Genuine Mercedes brake pads and/or discs',
                            'Old component removal and disposal',
                            'Caliper slider check and lubrication',
                            'Brake fluid level check',
                            'Road test to confirm proper operation',
                            'Written report confirming work completed',
                        ].map((s) => (
                            <div key={s} className="flex items-start gap-3 text-text-secondary">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                                <span>{s}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ─── SECTION 4: How It Works ─── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">How it works</h2>
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="step-number mx-auto flex h-12 w-12 items-center justify-center text-lg font-bold">01</div>
                            <h3 className="mt-4 font-semibold text-text-primary">Tell us your symptoms</h3>
                            <p className="mt-2 text-sm text-text-secondary">Describe it and we&apos;ll recommend the right package with a fixed price.</p>
                        </div>
                        <div className="text-center">
                            <div className="step-number mx-auto flex h-12 w-12 items-center justify-center text-lg font-bold">02</div>
                            <h3 className="mt-4 font-semibold text-text-primary">We come to you</h3>
                            <p className="mt-2 text-sm text-text-secondary">Parts pre-ordered for your exact Citan. Job done at your location.</p>
                        </div>
                        <div className="text-center">
                            <div className="step-number mx-auto flex h-12 w-12 items-center justify-center text-lg font-bold">03</div>
                            <h3 className="mt-4 font-semibold text-text-primary">Road tested and confirmed</h3>
                            <p className="mt-2 text-sm text-text-secondary">Brakes tested, written report in hand. Done.</p>
                        </div>
                    </div>
                    <div className="mt-10 overflow-hidden rounded-2xl max-w-2xl mx-auto">
                        <figure>
                            <div className="relative aspect-[16/10] min-h-[200px] sm:min-h-[260px]">
                                <OptimizedImage
                                    src="/images/new-images/sprinter-brakes-04.jpg"
                                    alt="Completed front brake assembly with new pads and discs - same quality for Citan"
                                    className="absolute inset-0 h-full w-full object-cover rounded-2xl"
                                />
                            </div>
                            <figcaption className="mt-2 text-xs text-text-muted text-center">New pads and discs fitted, ready for road test - same process across Mercedes vans.</figcaption>
                        </figure>
                    </div>
                </div>
            </Section>

            {/* ─── SECTION 5: Pricing ─── */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="reveal">
                        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Citan brake pricing</h2>
                        <p className="mt-2 text-text-secondary">Fixed-price packages - no hidden extras, no hourly rates. The Citan is one of the cheapest Mercedes vans to brake.</p>
                        <div className="mt-6 overflow-x-auto rounded-xl border border-border-default">
                            <table className="min-w-full">
                                <thead><tr className="border-b border-border-default bg-surface-alt"><th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Package</th><th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Price</th></tr></thead>
                                <tbody>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Front Pads Only</td><td className="px-4 py-3 text-right font-semibold text-brand-light">from £169<VatLabel /></td></tr>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Front Pads + Discs</td><td className="px-4 py-3 text-right font-semibold text-brand-light">from £319<VatLabel /></td></tr>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Rear Pads Only</td><td className="px-4 py-3 text-right font-semibold text-brand-light">from £189<VatLabel /></td></tr>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Rear Pads + Discs</td><td className="px-4 py-3 text-right font-semibold text-brand-light">from £419<VatLabel /></td></tr>
                                    <tr><td className="px-4 py-3 text-text-secondary">Rear Pads + Discs + Shoes</td><td className="px-4 py-3 text-right font-semibold text-brand-light">from £469<VatLabel /></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Optional extras */}
                    <div className="mt-8 rounded-2xl border border-border-default bg-surface-alt p-6 reveal">
                        <h3 className="font-bold text-text-primary">Optional add-ons</h3>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-text-secondary">
                            <div className="flex justify-between"><span>Brake wear sensor replacement</span><span className="font-semibold text-brand-light">£15-35<VatLabel /></span></div>
                            <div className="flex justify-between"><span>Seized slider clean-up</span><span className="font-semibold text-brand-light">£20-40<VatLabel /></span></div>
                            <div className="flex justify-between"><span>Brake fluid service</span><span className="font-semibold text-brand-light">£75-110<VatLabel /></span></div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* ─── Workshop referral ─── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-xl font-bold text-text-primary">When workshop referral may be needed</h2>
                    <ul className="mt-4 space-y-2">
                        {[
                            'Heavily corroded rear assemblies',
                            'Brake caliper rebuild or replacement',
                            'ABS module faults',
                        ].map((s) => (
                            <li key={s} className="flex items-start gap-2 text-text-secondary text-sm">
                                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
                                <span>{s}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </Section>

            {/* ─── Common symptoms ─── */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6 sm:p-8 reveal">
                        <h2 className="text-xl font-bold text-text-primary">Common brake symptoms</h2>
                        <p className="mt-2 text-sm text-text-secondary">Not sure if your Citan needs brakes? Look out for:</p>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                                'Squealing or grinding noise when braking',
                                'Brake wear indicator light',
                                'Pulsating brake pedal',
                                'Vehicle pulling under braking',
                                'Increased stopping distance',
                            ].map((s) => (
                                <div key={s} className="flex items-start gap-2 text-text-secondary text-sm">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                                    <span>{s}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            {/* ─── FAQ ─── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-3xl reveal">
                    <h2 className="text-2xl font-bold text-text-primary text-center">Frequently asked questions</h2>
                    <div className="mt-8"><FaqAccordion items={faqs} /></div>
                </div>
            </Section>

            {/* ─── Diagnostic notice ─── */}
            <Section>
                <div className="mx-auto max-w-5xl reveal">
                    <Notice variant="info">We carry diagnostic equipment on every visit. Brake-related fault codes can be checked at the same time - no separate appointment needed.</Notice>
                </div>
            </Section>

            {/* ─── Real example ─── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-3xl reveal">
                    <h2 className="text-xl font-bold text-text-primary">A real example from a Citan brake job</h2>
                    <div className="mt-4 rounded-xl border border-border-default bg-surface p-5">
                        <p className="text-sm text-text-secondary leading-relaxed">
                            2019 Mercedes Citan W415 K9K 1.5 dCi, 51,000 miles. Brake wear warning on the dash. Front nearside pad found significantly more worn than offside, consistent with a seized slider pin on the nearside caliper. Front pads replaced on both sides, slider pins stripped, cleaned, and lubricated. Front discs measured within specification. Written report issued. Job completed in 40 minutes at the owner's business address.
                        </p>
                    </div>
                    <p className="mt-4 text-sm text-text-secondary">
                        Every Citan brake job ends with a written report. <Link to="/sample-diagnostic-report" className="font-semibold text-brand hover:underline">See an example of our documentation standard.</Link>
                    </p>
                </div>
            </Section>

            {/* ─── Internal links ─── */}
            <Section>
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-xl font-bold text-text-primary">Related reading and coverage</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Link to="/blog/sprinter-limp-mode-proper-diagnostic" className="flex items-center gap-2 rounded-xl border border-border-default bg-surface-alt p-4 text-sm text-brand hover:border-brand/30 hover:bg-brand/5 transition-all">
                            <ArrowRight className="h-4 w-4 shrink-0" />
                            Sprinter limp mode: what a proper diagnostic looks like
                        </Link>
                        <Link to="/areas-covered" className="flex items-center gap-2 rounded-xl border border-border-default bg-surface-alt p-4 text-sm text-brand hover:border-brand/30 hover:bg-brand/5 transition-all">
                            <ArrowRight className="h-4 w-4 shrink-0" />
                            Coverage: Kent and South East London service area
                        </Link>
                    </div>
                </div>
            </Section>

            {/* ─── Related services ─── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-xl font-bold text-text-primary">Related services</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        {crossSell.map((s) => (
                            <Link key={s.href} to={s.href} className="flex items-center justify-between rounded-xl border border-border-default bg-surface-alt p-4 transition-all hover:border-brand/30 hover:bg-brand/5">
                                <div><h3 className="font-semibold text-text-primary">{s.title}</h3><p className="text-sm text-text-secondary">{s.desc}</p></div>
                                <ArrowRight className="h-5 w-5 shrink-0 text-brand" />
                            </Link>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ── Coverage ── */}
            <Section className="bg-surface-alt/30 border-t border-border-default pt-12 pb-12">
                <div className="mx-auto max-w-5xl reveal text-center">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-brand mb-4">We cover</h2>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-3 md:gap-x-6">
                        {[
                            { name: 'Greenwich', to: '/areas-covered/greenwich' },
                            { name: 'Bexley', to: '/areas-covered/bexley' },
                            { name: 'Orpington', to: '/areas-covered/orpington' },
                            { name: 'Maidstone', to: '/areas-covered/maidstone' },
                            { name: 'Tonbridge', to: '/areas-covered/tonbridge' },
                            { name: 'Gillingham and Medway', to: '/areas-covered/medway' },
                        ].map((area, i) => (
                            <div key={area.name} className="flex items-center gap-x-4 md:gap-x-6">
                                <Link to={area.to} className="text-base font-medium text-text-primary hover:text-brand transition-colors">
                                    {area.name}
                                </Link>
                                {i < 5 && <span className="hidden md:inline-block text-border-default select-none">&bull;</span>}
                            </div>
                        ))}
                    </div>
                    <p className="mt-6 text-sm text-text-muted">
                        Mobile across Kent and South East London. <Link to="/pricing" className="text-brand hover:underline">Check your zone on the pricing page.</Link>
                    </p>
                </div>
            </Section>

            {/* ─── FOOTER CTA ─── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <OptimizedImage src="/images/new-images/sprinter-brakes-05.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 to-brand/80" />
                </div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
                    <div className="text-center reveal">
                        <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl">Citan brakes need sorting?</h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Fixed-price brake service at your door.</p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackNavClick('/booking', 'Book Online', 'citan_brakes_footer')}>Book Online</CTAButton>
                            <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="ghost" size="lg" external icon={<MessageCircle className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackWhatsAppClick('citan_brakes')}>WhatsApp Us</CTAButton>
                            <CTAButton href={`tel:${siteConfig.contact.phoneE164}`} variant="ghost" size="lg" external icon={<Phone className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackPhoneClick('citan_brakes')}>{siteConfig.contact.phoneDisplay}</CTAButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
