import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { trackNavClick, trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { FaqAccordion } from '@/components/FaqAccordion';
import { Notice } from '@/components/Notice';
import { CheckCircle2, XCircle, ArrowRight, Phone, MessageCircle, AlertTriangle, Shield, Wrench } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { ServiceSchema, BreadcrumbSchema, FaqPageSchema } from '@/components/JsonLd';
import { OptimizedImage } from '@/components/OptimizedImage';
import { VatLabel } from '@/components/VatLabel';
import { ServicingHero } from '@/components/servicing/ServicingHero';
import { ServicingPartsProof } from '@/components/servicing/ServicingPartsProof';
import { ServicingFilterShowcase } from '@/components/servicing/ServicingFilterShowcase';
import { ServicingProcessGallery } from '@/components/servicing/ServicingProcessGallery';

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
        question: 'Is the Citan really a Renault Kangoo?',
        answer:
            'Mechanically, yes. The W415 Citan shares its platform, engines, and most components with the Renault Kangoo II. The W420 (2021+) shares its platform with the Kangoo III. Mercedes badge, Renault running gear - which means parts are generally cheaper than other Mercedes vans, but the service approach needs to account for both brands.',
    },
    {
        question: 'Do you use Mercedes or Renault parts?',
        answer:
            'We use genuine Mercedes parts as standard. In some cases the underlying component is identical between Mercedes and Renault branding, but we always fit the genuine Mercedes item.',
    },
    {
        question: 'Does my Citan have a timing belt or chain?',
        answer:
            'Most Citan diesel engines use a timing chain (K9K and OM608). However, the 1.5L K9K can have a timing belt in some configurations. We\u2019ll check for your specific engine variant and advise on timing component condition during a major service.',
    },
    {
        question: 'How often does a Citan need servicing?',
        answer:
            'Typically every 12,500 miles or 12 months for a minor service, and 25,000 miles or 24 months for a major. However, the service indicator on your dash is the best guide - it adjusts based on your driving pattern.',
    },
    {
        question: 'Can you service my Citan at home?',
        answer:
            'Yes. We come to your home, workplace, or any convenient location. All we need is a flat surface and somewhere to park next to your van.',
    },
    {
        question: 'Do you reset the service light?',
        answer:
            'Yes. We reset the service indicator via diagnostic equipment after every service. On W415 models this requires Renault-compatible diagnostics; on W420 models we use Mercedes Xentry.',
    },
    {
        question: 'Does Xentry work fully on the Citan?',
        answer:
            'Xentry access is more limited on W415 Citan models than on the Sprinter or Vito because the W415 shares its platform with the Renault Kangoo. For W415 service resets we use a multi-brand OEM-level platform that handles the Renault-side reset correctly. The W420 Citan uses standard Mercedes Xentry access.',
    },
];

const crossSell = [
    { title: 'Citan Brakes', desc: 'Brake packages from \u00a3169 + VAT', href: '/services/citan-brakes' },
    { title: 'Standard Diagnosis', desc: 'Warning light? We\u2019ll diagnose it.', href: '/services/diagnostic-callout' },
    { title: 'Mercedes Van Servicing', desc: 'All models - Sprinter, Vito, Citan', href: '/services/mercedes-van-servicing' },
];

export function CitanServicingPage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo
                title="Citan Servicing"
                description="Mobile Mercedes Citan servicing. Minor from \u00a3175 (ex. VAT), major from \u00a3295 (ex. VAT). Genuine parts, service reset, full inspection at your door. W415 and W420."
                canonical="/services/citan-servicing"
            />
            <ServiceSchema
                name="Citan Servicing"
                description="Mobile Mercedes Citan servicing - minor and major service packages for W415 and W420 at your location across Kent and SE London."
                url="/services/citan-servicing"
                priceFrom={175}
                offerCatalogItems={[
                    { name: 'Minor Service Zone A (0 to 25 minutes)', price: '175.00', priceCurrency: 'GBP', description: 'Includes travel and minor service at your location' },
                    { name: 'Minor Service Zone B (25 to 45 minutes)', price: '190.00', priceCurrency: 'GBP', description: 'Includes travel and minor service at your location' },
                    { name: 'Minor Service Zone C (45 to 60 minutes)', price: '205.00', priceCurrency: 'GBP', description: 'Includes travel and minor service at your location' },
                    { name: 'Major Service Zone A (0 to 25 minutes)', price: '295.00', priceCurrency: 'GBP', description: 'Includes travel and major service at your location' },
                    { name: 'Major Service Zone B (25 to 45 minutes)', price: '310.00', priceCurrency: 'GBP', description: 'Includes travel and major service at your location' },
                    { name: 'Major Service Zone C (45 to 60 minutes)', price: '325.00', priceCurrency: 'GBP', description: 'Includes travel and major service at your location' },
                ]}
            />
            <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Mercedes Van Servicing', url: '/services/mercedes-van-servicing' }, { name: 'Citan Servicing', url: '/services/citan-servicing' }]} />
            <FaqPageSchema items={faqs} />

            {/* \u2500\u2500\u2500 HERO \u2500\u2500\u2500 */}
            <ServicingHero
                heroSrc="/images/servicing-work/hero-citan.jpg"
                eyebrow="Mercedes Citan Specialist"
                title="Citan Servicing"
                subtitle="W415 • W420 • K9K • OM608 • Renault-platform expertise"
                priceFrom={175}
                bookLabel="Book Citan Service"
                analyticsPrefix="citan_servicing"
                objectPosition="center 45%"
                mobileObjectPosition="center 55%"
            />

            {/* ─── LEAD PARAGRAPH ─── */}
            <Section>
                <div className="mx-auto max-w-3xl reveal">
                    <p className="text-base leading-relaxed text-text-secondary lg:text-xl">
                        The Mercedes Citan is built on the Renault Kangoo platform, which means it needs someone who understands both brands. W415 models use the Renault 1.5 dCi K9K engine, while the newer W420 uses the Mercedes OM608. Xentry access is more limited on W415 models than on the Sprinter or Vito, so we use a multi-brand OEM-level diagnostic platform for those service resets. Both generations are covered across Kent and South East London, with genuine Mercedes parts and a written findings report after every visit.
                    </p>
                </div>
            </Section>

            {/* ─── SECTION 1: Small van, big responsibilities ─── */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center reveal">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Small van, big responsibilities</h2>
                            <p className="mt-4 text-text-secondary leading-relaxed">
                                The Mercedes Citan is the smallest van in the Mercedes-Benz range - but it&apos;s far from simple. Built on the Renault Kangoo platform, it combines Mercedes branding with Renault engineering, which means it needs someone who understands <em>both</em> brands.
                            </p>
                            <p className="mt-3 text-text-secondary leading-relaxed">
                                Most Mercedes dealers charge full Mercedes pricing for what is essentially Renault-platform work. Most independent garages don&apos;t have the Mercedes diagnostic access needed for proper service resets and fault reading. We bridge that gap - correct knowledge of both platforms, at a sensible price.
                            </p>
                            <p className="mt-3 text-text-secondary leading-relaxed">
                                Whether you&apos;re running a W415 with the K9K diesel or a newer W420 with the OM608, we bring the right parts and tooling to your door.
                            </p>
                            <div className="mt-6 hidden flex-wrap gap-3 sm:flex">
                                <CTAButton href="/booking" size="md" onClick={() => trackNavClick('/booking', 'Book Online', 'citan_servicing_top')}>Book Online</CTAButton>
                                <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="outline" size="md" external icon={<MessageCircle className="h-4 w-4" />} onClick={() => trackWhatsAppClick('citan_servicing')}>WhatsApp Us</CTAButton>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6">
                            <h3 className="text-lg font-bold text-text-primary mb-4">The dual-platform advantage</h3>
                            <p className="text-sm text-text-secondary mb-4">
                                Because the Citan shares its platform with the Renault Kangoo, parts availability is excellent and pricing is typically lower than other Mercedes vans. You get Mercedes build quality with Renault parts economy.
                            </p>
                            <div className="space-y-3">
                                {[
                                    'Genuine Mercedes parts as standard',
                                    'Both Mercedes Xentry and Renault-compatible diagnostics',
                                    'Service intervals aligned to actual manufacturer spec',
                                    'No dealer-rate labour charges',
                                ].map((item) => (
                                    <div key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            <ServicingPartsProof
                body="Citan servicing uses genuine Mercedes parts with the correct oil and filter specification for your K9K, OM608, or ER30 engine. Because the Citan shares its platform with Renault, you need someone who understands both brands, we fit OEM Mercedes items and reset the service indicator with the right diagnostic tool for your generation."
            />

            {/* ─── SECTION 2: What’s included ─── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">What&apos;s included</h2>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-border-default bg-surface p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10"><Wrench className="h-5 w-5 text-brand" /></div>
                                <h3 className="text-lg font-bold text-text-primary">Minor Service</h3>
                            </div>
                            <ul className="space-y-2">
                                {[
                                    'Engine oil and filter (correct spec for K9K/OM608)',
                                    'Visual vehicle health check',
                                    'Brake pad & disc measurement',
                                    'All fluid levels checked and topped up',
                                    'Tyre condition and pressure check',
                                    'Drive belt inspection',
                                    'Service indicator reset',
                                    'Written condition report',
                                ].map((s) => (
                                    <li key={s} className="flex items-start gap-2 text-sm text-text-secondary">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                                        <span>{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-2xl border border-border-default bg-surface p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10"><Shield className="h-5 w-5 text-brand" /></div>
                                <h3 className="text-lg font-bold text-text-primary">Major Service</h3>
                            </div>
                            <ul className="space-y-2">
                                {[
                                    'Everything in the minor service, plus:',
                                    'Air filter replacement',
                                    'Cabin / pollen filter replacement',
                                    'Fuel filter replacement',
                                    'Comprehensive multi-point inspection',
                                    'Battery condition test',
                                    'Glow plug check (diesel)',
                                    'Timing belt / chain visual inspection',
                                    'Detailed written report',
                                ].map((s) => (
                                    <li key={s} className="flex items-start gap-2 text-sm text-text-secondary">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                                        <span>{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <ServicingFilterShowcase />
                </div>
            </Section>

            {/* Service indicator & oil */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">Service indicator &amp; oil level</h2>
                    <p className="mt-2 text-text-secondary text-center max-w-2xl mx-auto">
                        W415 models need a Renault-compatible reset; W420 uses Mercedes Xentry. Either way, your dash shows the correct next interval. We verify oil level on the electronic readout after every oil change.
                    </p>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 reveal">
                        <figure className="overflow-hidden rounded-2xl border border-border-default">
                            <div className="relative aspect-[16/10] min-h-[220px] sm:min-h-[280px]">
                                <OptimizedImage
                                    src="/images/new-images/assyst-reset-on-dash.jpg"
                                    alt="Mercedes Citan dash showing remaining service distance and time"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            </div>
                            <figcaption className="border-t border-border-default bg-surface-alt px-4 py-3 text-sm text-text-secondary">
                                Service due display - reset properly after your visit, not just cleared.
                            </figcaption>
                        </figure>
                        <figure className="overflow-hidden rounded-2xl border border-border-default">
                            <div className="relative aspect-[16/10] min-h-[220px] sm:min-h-[280px]">
                                <OptimizedImage
                                    src="/images/new-images/mercedes-oil-level-on-dash.jpg"
                                    alt="Mercedes instrument cluster showing electronic engine oil level"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            </div>
                            <figcaption className="border-t border-border-default bg-surface-alt px-4 py-3 text-sm text-text-secondary">
                                Oil level check on the dash - confirms correct fill after service.
                            </figcaption>
                        </figure>
                    </div>
                </div>
            </Section>

            <ServicingProcessGallery />

            {/* ─── SECTION 3: Citan-specific quirks ─── */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start reveal">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Citan-specific things to know</h2>
                            <p className="mt-4 text-text-secondary leading-relaxed">
                                The Citan has its own set of quirks that most garages overlook. Because we know the platform, we can advise properly.
                            </p>
                            <ul className="mt-4 space-y-4">
                                {[
                                    { issue: 'Timing belt vs chain', detail: 'The K9K 1.5 diesel can run either a belt or chain depending on the specific variant. A belt needs replacing at around 90,000 miles - a chain should last much longer but still needs inspecting. We check during every major service.' },
                                    { issue: 'Turbo actuator / wastegate', detail: 'The small turbo on K9K engines can suffer from sticking wastegate actuators. This shows as intermittent limp mode or reduced power. We can test this via diagnostics during any service visit.' },
                                    { issue: 'Fuel filter location', detail: 'On W415 models the fuel filter is tucked under the bonnet in a tight space. Some garages skip it. We don’t, it’s included in every major service, with genuine Mercedes housings.' },
                                    { issue: 'Service indicator access', detail: 'W415 Citans use a Renault-style service reset that requires specific diagnostic access. W420 models use Mercedes Xentry. We have both.' },
                                ].map((item) => (
                                    <li key={item.issue} className="text-sm text-text-secondary">
                                        <span className="font-semibold text-text-primary">{item.issue}:</span> {item.detail}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
                                    <div>
                                        <h3 className="font-bold text-text-primary">Timing belt warning</h3>
                                        <p className="mt-2 text-sm text-text-secondary">
                                            If your Citan has a timing belt (certain K9K variants), it needs replacing at approximately 90,000 miles or 6 years, whichever comes first. A snapped timing belt will destroy the engine. We can check your belt condition and advise during a service visit.
                                        </p>
                                        <p className="mt-2 text-sm text-text-secondary">
                                            Timing belt replacement is workshop work (not a mobile job), but we can diagnose the condition and refer you if needed.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <figure className="overflow-hidden rounded-xl border border-border-default">
                                    <div className="relative aspect-[4/3] h-36 sm:h-40">
                                        <OptimizedImage src="/images/servicing-work/fuel-filter-old-vs-new.jpg" alt="Old and new Mercedes fuel filters side by side" className="absolute inset-0 h-full w-full object-cover" />
                                    </div>
                                    <figcaption className="border-t border-border-default bg-surface-alt px-3 py-2 text-xs text-text-secondary">Fuel filter replaced on every major, not skipped in a tight bay.</figcaption>
                                </figure>
                                <figure className="overflow-hidden rounded-xl border border-border-default">
                                    <div className="relative aspect-[4/3] h-36 sm:h-40">
                                        <OptimizedImage src="/images/servicing-work/genuine-mb-filter-box.jpg" alt="Genuine Mercedes filter box" className="absolute inset-0 h-full w-full object-cover" />
                                    </div>
                                    <figcaption className="border-t border-border-default bg-surface-alt px-3 py-2 text-xs text-text-secondary">Genuine Mercedes filter housings as standard.</figcaption>
                                </figure>
                            </div>
                            <div className="rounded-xl border border-border-default p-4">
                                <h3 className="font-bold text-text-primary">Models covered</h3>
                                <div className="mt-3 space-y-2">
                                    <div>
                                        <p className="text-sm font-semibold text-text-primary">W415 Citan (2012-2021)</p>
                                        <p className="text-xs text-text-secondary">K9K 1.5 dCi &bull; Panel van, Traveliner, Tourer</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-text-primary">W420 Citan / T-Class (2021+)</p>
                                        <p className="text-xs text-text-secondary">OM608 1.5 CDI &bull; ER30 1.3T petrol &bull; Panel van, Tourer</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* ─── SECTION 4: How it works ─── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">How it works</h2>
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', icon: <MessageCircle className="h-6 w-6 text-brand" />, title: 'Send us your reg', desc: 'We confirm your Citan model, engine, and what’s due. Fixed price confirmed upfront - no guesswork.' },
                            { step: '02', icon: <Wrench className="h-6 w-6 text-brand" />, title: 'We come to you', desc: 'Correct parts pre-ordered for your exact variant. Service done at your location - home, yard, or workplace.' },
                            { step: '03', icon: <CheckCircle2 className="h-6 w-6 text-brand" />, title: 'Drive away serviced', desc: 'Service light reset, written report with findings. Quick, professional, and you didn’t lose a working day.' },
                        ].map((s) => (
                            <div key={s.step} className="text-center">
                                <div className="step-number mx-auto flex h-12 w-12 items-center justify-center text-lg font-bold">{s.step}</div>
                                <div className="mt-4 flex justify-center">{s.icon}</div>
                                <h3 className="mt-3 font-semibold text-text-primary">{s.title}</h3>
                                <p className="mt-2 text-sm text-text-secondary">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ─── SECTION 5: Pricing ─── */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="reveal">
                        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Citan servicing pricing</h2>
                        <p className="mt-2 text-text-secondary">Fixed-price packages - genuine Mercedes parts, labour, and travel.</p>
                        <div className="mt-6 overflow-x-auto rounded-xl border border-border-default">
                            <table className="min-w-full">
                                <thead><tr className="border-b border-border-default bg-surface-alt"><th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Package</th><th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Zone A</th><th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Zone B</th><th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Zone C</th></tr></thead>
                                <tbody>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Minor Service</td><td className="px-4 py-3 text-right font-semibold text-brand-light">£175<VatLabel /></td><td className="px-4 py-3 text-right font-semibold text-brand-light">£190<VatLabel /></td><td className="px-4 py-3 text-right font-semibold text-brand-light">£205<VatLabel /></td></tr>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Major Service</td><td className="px-4 py-3 text-right font-semibold text-brand-light">£295<VatLabel /></td><td className="px-4 py-3 text-right font-semibold text-brand-light">£310<VatLabel /></td><td className="px-4 py-3 text-right font-semibold text-brand-light">£325<VatLabel /></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-8 rounded-2xl border border-border-default bg-surface-alt p-6 reveal">
                        <h3 className="font-bold text-text-primary">Optional add-ons</h3>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-text-secondary">
                            <div className="flex justify-between"><span>Brake check with measurement</span><span className="font-semibold text-brand-light">included</span></div>
                            <div className="flex justify-between"><span>Diagnostic fault scan</span><span className="font-semibold text-brand-light">included</span></div>
                            <div className="flex justify-between"><span>Timing belt condition check</span><span className="font-semibold text-brand-light">included (major)</span></div>
                            <div className="flex justify-between"><span>Forced DPF regeneration</span><span className="font-semibold text-brand-light">from £45<VatLabel /></span></div>

                        </div>
                    </div>
                </div>
            </Section>

            {/* ─── What we can / can’t do mobile ─── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start reveal">
                        <div>
                            <h2 className="text-xl font-bold text-text-primary">What we can do mobile</h2>
                            <ul className="mt-4 space-y-2">
                                {[
                                    'Full minor and major servicing',
                                    'Brake pad and disc replacement',
                                    'Diagnostic fault reading',
                                    'Battery replacement',
                                    'Glow plug replacement',
                                    'DPF forced regeneration',
                                    'Service light reset (both W415 and W420)',
                                ].map((s) => (
                                    <li key={s} className="flex items-start gap-2 text-text-secondary text-sm">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                                        <span>{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-text-primary">When workshop referral may be needed</h2>
                            <ul className="mt-4 space-y-2">
                                {[
                                    'Timing belt replacement (requires engine support)',
                                    'Clutch replacement or dual-mass flywheel',
                                    'Turbo replacement',
                                    'Major suspension work requiring ramp access',
                                    'Injector removal on high-mileage engines',
                                ].map((s) => (
                                    <li key={s} className="flex items-start gap-2 text-text-secondary text-sm">
                                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
                                        <span>{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </Section>

            {/* ─── FAQ ─── */}
            <Section>
                <div className="mx-auto max-w-3xl reveal">
                    <h2 className="text-2xl font-bold text-text-primary text-center">Frequently asked questions</h2>
                    <div className="mt-8"><FaqAccordion items={faqs} /></div>
                </div>
            </Section>

            {/* ─── Diagnostic notice ─── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <Notice variant="info">We carry both Mercedes and Renault-compatible diagnostic equipment. If we spot a fault during your Citan service, we can diagnose it there and then - no second visit needed.</Notice>
                </div>
            </Section>

            {/* ─── Real example ─── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-3xl reveal">
                    <h2 className="text-xl font-bold text-text-primary">A real example from a Citan service visit</h2>
                    <div className="mt-4 rounded-xl border border-border-default bg-surface p-5">
                        <p className="text-sm text-text-secondary leading-relaxed">
                            2018 Mercedes Citan W415 K9K 1.5 dCi, 67,000 miles, due minor service. Service indicator reset using Renault-compatible OEM diagnostics, correct oil and filter fitted, fuel filter checked and found serviceable. Timing belt variant confirmed as chain on this build date. Written findings report issued same day.
                        </p>
                    </div>
                    <p className="mt-4 text-sm text-text-secondary">
                        Every Citan service ends with a written findings report. <Link to="/sample-diagnostic-report" className="font-semibold text-brand hover:underline">See an example of our documentation standard.</Link>
                    </p>
                </div>
            </Section>

            {/* ─── Internal links ─── */}
            <Section>
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-xl font-bold text-text-primary">Related reading and coverage</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Link to="/blog/dpf-warning-light-regen-vs-worse" className="flex items-center gap-2 rounded-xl border border-border-default bg-surface-alt p-4 text-sm text-brand hover:border-brand/30 hover:bg-brand/5 transition-all">
                            <ArrowRight className="h-4 w-4 shrink-0" />
                            DPF warning lights: when regen helps vs when it makes things worse
                        </Link>
                        <Link to="/areas-covered" className="flex items-center gap-2 rounded-xl border border-border-default bg-surface-alt p-4 text-sm text-brand hover:border-brand/30 hover:bg-brand/5 transition-all">
                            <ArrowRight className="h-4 w-4 shrink-0" />
                            Coverage: Kent and South East London service area
                        </Link>
                    </div>
                </div>
            </Section>

            {/* ─── Related services ─── */}
            <Section>
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

            {/* \u2500\u2500\u2500 FOOTER CTA \u2500\u2500\u2500 */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0"><div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 to-brand/85" /></div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
                    <div className="text-center reveal">
                        <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl">Citan service - done at your door</h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Fixed-price servicing from &pound;175<VatLabel /> - no workshop trip, no hassle.</p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackNavClick('/booking', 'Book Online', 'citan_servicing_footer')}>Book Online</CTAButton>
                            <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="ghost" size="lg" external icon={<MessageCircle className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackWhatsAppClick('citan_servicing')}>WhatsApp Us</CTAButton>
                            <CTAButton href={`tel:${siteConfig.contact.phoneE164}`} variant="ghost" size="lg" external icon={<Phone className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackPhoneClick('citan_servicing')}>{siteConfig.contact.phoneDisplay}</CTAButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
