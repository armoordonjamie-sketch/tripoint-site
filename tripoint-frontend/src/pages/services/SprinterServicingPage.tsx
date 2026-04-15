import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { trackNavClick, trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { FaqAccordion } from '@/components/FaqAccordion';
import { Notice } from '@/components/Notice';
import { CheckCircle2, XCircle, ArrowRight, Phone, MessageCircle, AlertTriangle, Clock, Shield, Wrench, Gauge } from 'lucide-react';
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
        question: 'Which Sprinter models do you cover?',
        answer:
            'We cover the W906 (2006-2018) and W907/W910 (2018+) Sprinter with both OM651 (2.1L) and OM654 (2.0L) engines. Panel van, chassis cab, Luton, dropside, and minibus variants. If you\u2019re not sure about your model, just send us your reg and we\u2019ll confirm.',
    },
    {
        question: 'Do I need to bring the van to you?',
        answer:
            'No. We come to you - home, yard, depot, or workplace. All we need is a flat, safe surface and access to the vehicle. That\u2019s the whole point: no workshop drop-off, no lost working time.',
    },
    {
        question: 'What\u2019s the difference between minor and major service?',
        answer:
            'A minor (A-style) service covers oil and filter change, visual health check, fluid top-ups, and basic inspections. A major (B-style) service adds air filter, cabin filter, fuel filter (where applicable), and more comprehensive checks including battery condition test. We\u2019ll confirm exactly what\u2019s due based on your mileage and service history.',
    },
    {
        question: 'Can you reset the service indicator?',
        answer:
            'Yes. We reset the service counter and ASSYST/FSS system via Xentry after every service. Your dash will show a fresh interval - exactly like leaving a dealer.',
    },
    {
        question: 'What happens if you find a fault during the service?',
        answer:
            'We\u2019ll tell you immediately and quote for any additional work. Nothing gets done without your approval. Because we carry dealer-level diagnostic equipment on every visit, we often catch faults early that a standard garage would miss.',
    },
    {
        question: 'Do you use genuine Mercedes parts?',
        answer:
            'Yes. We use genuine Mercedes parts as standard on every service. Right parts, right spec, none of the dealer markup.',
    },
    {
        question: 'How long does a mobile service take?',
        answer:
            'A minor service typically takes 60-90 minutes. A major service takes 90-120 minutes depending on the engine and any additional items. We\u2019ll confirm timing when you book.',
    },
];

const crossSell = [
    { title: 'Sprinter Brakes', desc: 'Front and rear brake packages from \u00a3149 + VAT', href: '/services/sprinter-brakes' },
    { title: 'Standard Diagnosis', desc: 'Got a warning light? We\u2019ll read it.', href: '/services/diagnostic-callout' },
    { title: 'Mercedes Van Servicing', desc: 'All models - Vito, Citan, Sprinter', href: '/services/mercedes-van-servicing' },
];

export function SprinterServicingPage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo
                title="Sprinter Servicing"
                description="Mobile Mercedes Sprinter servicing. Minor from \u00a3175 (ex. VAT), major from \u00a3295 (ex. VAT). Genuine parts, Xentry service reset, and full inspection at your door. W906 and W907/W910."
                canonical="/services/sprinter-servicing"
            />
            <ServiceSchema name="Sprinter Servicing" description="Mobile Mercedes Sprinter servicing - minor and major service packages for W906 and W907/W910 at your location across Kent and SE London." url="/services/sprinter-servicing" priceFrom={175} />
            <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Mercedes Van Servicing', url: '/services/mercedes-van-servicing' }, { name: 'Sprinter Servicing', url: '/services/sprinter-servicing' }]} />
            <FaqPageSchema items={faqs} />

            {/* \u2500\u2500\u2500 HERO \u2500\u2500\u2500 */}
            <section className="relative h-72 sm:h-96 overflow-hidden">
                <img
                    src="/images/services/van-sprinter-w907-front.png"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-surface/40" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(var(--color-brand-rgb),0.18),transparent_65%)]" />
                <div className="absolute bottom-0 left-0 right-0 z-10 p-6 sm:p-10">
                    <div className="mx-auto max-w-5xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Mercedes Sprinter Specialist</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl lg:text-6xl">Sprinter Servicing</h1>
                        <p className="mt-3 max-w-xl text-lg text-text-secondary">W906 &bull; W907/W910 &bull; OM651 &bull; OM654 &bull; Fitted at your door</p>
                    </div>
                </div>
            </section>

            {/* \u2500\u2500\u2500 SECTION 1: Why Sprinters need a specialist \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center reveal">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Why your Sprinter needs a specialist</h2>
                            <p className="mt-4 text-text-secondary leading-relaxed">
                                The Mercedes Sprinter isn&apos;t a van you take to any garage. The OM651 and OM654 diesel engines have specific oil specs (MB 229.51 / 229.52), DPF regeneration cycles, and an ASSYST service system that needs proper resetting via Star Diagnosis or Xentry.
                            </p>
                            <p className="mt-3 text-text-secondary leading-relaxed">
                                Most independent garages can do an oil change - but they can&apos;t reset the service system properly, can&apos;t read Mercedes-specific fault codes, and won&apos;t know that a W906 OM651 needs exactly 7.5L of 5W-30 Low-SAPS oil.
                            </p>
                            <p className="mt-3 text-text-secondary leading-relaxed">
                                We bring dealer-level tooling and Mercedes-specific expertise to your door. Same quality, no dealer markup, no workshop queue.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6">
                            <h3 className="text-lg font-bold text-text-primary mb-4">Why generic garages get it wrong</h3>
                            <ul className="space-y-3">
                                {[
                                    { good: false, text: 'Wrong oil spec - causes DPF issues and premature wear' },
                                    { good: false, text: 'Service light reset with generic tool - ASSYST still counts down' },
                                    { good: false, text: 'No fault code scan - underlying issues missed' },
                                    { good: false, text: 'No AdBlue quality check on Euro 6 models' },
                                ].map((item) => (
                                    <li key={item.text} className="flex items-start gap-2 text-sm text-text-secondary">
                                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                                        <span>{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                            <hr className="my-4 border-border-default" />
                            <h3 className="text-lg font-bold text-text-primary mb-4">What we do differently</h3>
                            <ul className="space-y-3">
                                {[
                                    { good: true, text: 'Correct MB-approved oil specification every time' },
                                    { good: true, text: 'Full ASSYST/FSS reset via Xentry - next service date and mileage set' },
                                    { good: true, text: 'Complete diagnostic scan included with every service' },
                                    { good: true, text: 'AdBlue quality and level checked on all Euro 6 models' },
                                ].map((item) => (
                                    <li key={item.text} className="flex items-start gap-2 text-sm text-text-secondary">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                                        <span>{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 SECTION 2: What\u2019s included \u2500\u2500\u2500 */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">What&apos;s included</h2>
                    <p className="mt-2 text-text-secondary text-center max-w-2xl mx-auto">Every Sprinter service includes the following as standard. No hidden extras.</p>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-border-default bg-surface p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                                    <Wrench className="h-5 w-5 text-brand" />
                                </div>
                                <h3 className="text-lg font-bold text-text-primary">Minor Service (A-Style)</h3>
                            </div>
                            <ul className="space-y-2">
                                {[
                                    'Genuine Mercedes engine oil (MB 229.51/229.52)',
                                    'Oil filter replacement',
                                    'Visual vehicle health check (32 points)',
                                    'Brake pad & disc thickness measurement',
                                    'All fluid levels checked and topped up',
                                    'Tyre condition, pressure, and tread check',
                                    'Drive belt and tensioner inspection',
                                    'Service indicator reset via Xentry',
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
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                                    <Shield className="h-5 w-5 text-brand" />
                                </div>
                                <h3 className="text-lg font-bold text-text-primary">Major Service (B-Style)</h3>
                            </div>
                            <ul className="space-y-2">
                                {[
                                    'Everything in the minor service, plus:',
                                    'Air filter replacement',
                                    'Cabin / pollen filter replacement',
                                    'Fuel filter replacement (where applicable)',
                                    'More comprehensive multi-point inspection',
                                    'Battery condition and cranking test',
                                    'Glow plug circuit check (diesel)',
                                    'DPF soot level reading via diagnostics',
                                    'Detailed written report with photos',
                                ].map((s) => (
                                    <li key={s} className="flex items-start gap-2 text-sm text-text-secondary">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                                        <span>{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch reveal">
                        <figure className="overflow-hidden rounded-2xl border border-border-default">
                            <div className="relative aspect-[16/10] min-h-[220px] sm:min-h-[280px]">
                                <OptimizedImage
                                    src="/images/new-images/mercedes-oil-level-on-dash.jpg"
                                    alt="Mercedes instrument cluster showing electronic engine oil level check"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            </div>
                            <figcaption className="border-t border-border-default bg-surface-alt px-4 py-3 text-sm text-text-secondary">
                                Electronic oil level check on the dash - we verify correct fill and spec on every service.
                            </figcaption>
                        </figure>
                        <div className="rounded-2xl border border-border-default bg-surface-alt p-6 flex flex-col justify-center">
                            <p className="text-text-secondary leading-relaxed">
                                Every minor and major service includes fluid level checks with the correct MB oil specification. On models with an electronic oil level readout, we confirm the level after the oil change so you leave with a clean bill of health - not a guess.
                            </p>
                        </div>
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 SECTION 3: Models covered \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start reveal">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Models we cover</h2>
                            <p className="mt-4 text-text-secondary leading-relaxed">
                                We service both major Sprinter generations. Parts are pre-ordered for your exact model, engine code, and year - nothing generic, nothing guessed.
                            </p>
                            <div className="mt-6 space-y-4">
                                <div className="rounded-xl border border-border-default p-4">
                                    <h3 className="font-bold text-text-primary">W906 Sprinter (2006-2018)</h3>
                                    <p className="mt-1 text-sm text-text-secondary">OM651 2.1L CDI &bull; OM642 3.0L V6 CDI &bull; Panel van, chassis cab, Luton, dropside</p>
                                </div>
                                <div className="rounded-xl border border-border-default p-4">
                                    <h3 className="font-bold text-text-primary">W907/W910 Sprinter (2018+)</h3>
                                    <p className="mt-1 text-sm text-text-secondary">OM654 2.0L CDI &bull; OM651 2.1L CDI &bull; 9G-TRONIC auto &bull; FWD, RWD, AWD variants</p>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-text-muted">Not sure which you have? Send us your reg - we&apos;ll confirm your model, engine, and what&apos;s due.</p>
                        </div>
                        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
                                <div>
                                    <h3 className="font-bold text-text-primary">Sprinter-specific considerations</h3>
                                    <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                                        <li><strong>OM651 sump plug:</strong> Requires a specific torque setting and replacement washer. Over-tightening cracks the cast sump - an expensive mistake.</li>
                                        <li><strong>W907 oil filter housing:</strong> The oil filter on the new Sprinter is top-mounted and requires a specific cap wrench (not the W906 tool).</li>
                                        <li><strong>DPF regeneration:</strong> After an oil change, we check DPF soot levels and can force a regeneration if needed via diagnostic equipment.</li>
                                        <li><strong>ASSYST vs FSS:</strong> W906 uses ASSYST, W907 uses FSS - both require Xentry to properly reset with calculated next-service dates.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 SECTION 4: How it works \u2500\u2500\u2500 */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">How it works</h2>
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', icon: <MessageCircle className="h-6 w-6 text-brand" />, title: 'Send us your reg', desc: 'We confirm your Sprinter model, engine code, and what\'s due. You get a fixed price before committing - no surprises.' },
                            { step: '02', icon: <Wrench className="h-6 w-6 text-brand" />, title: 'We come to you', desc: 'Parts and oil pre-ordered for your exact model. Service done at your location - driveway, yard, depot, or car park.' },
                            { step: '03', icon: <CheckCircle2 className="h-6 w-6 text-brand" />, title: 'Drive away serviced', desc: 'Service completed, ASSYST/FSS reset via Xentry, written report with findings and recommendations. Done.' },
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

            {/* \u2500\u2500\u2500 SECTION 5: Pricing \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="reveal">
                        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Sprinter servicing pricing</h2>
                        <p className="mt-2 text-text-secondary">Fixed-price packages - genuine Mercedes parts, labour, and travel to your location.</p>
                        <div className="mt-6 overflow-x-auto rounded-xl border border-border-default">
                            <table className="min-w-full">
                                <thead><tr className="border-b border-border-default bg-surface-alt"><th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Package</th><th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Zone A</th><th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Zone B</th><th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Zone C</th></tr></thead>
                                <tbody>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Minor Service (A-Style)</td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;175<VatLabel /></td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;190<VatLabel /></td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;205<VatLabel /></td></tr>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Major Service (B-Style)</td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;295<VatLabel /></td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;310<VatLabel /></td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;325<VatLabel /></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Optional extras */}
                    <div className="mt-8 rounded-2xl border border-border-default bg-surface-alt p-6 reveal">
                        <h3 className="font-bold text-text-primary">Optional add-ons</h3>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-text-secondary">
                            <div className="flex justify-between"><span>AdBlue top-up (Euro 6)</span><span className="font-semibold text-brand-light">from &pound;25<VatLabel /></span></div>
                            <div className="flex justify-between"><span>Brake check with measurement</span><span className="font-semibold text-brand-light">included</span></div>
                            <div className="flex justify-between"><span>Diagnostic fault scan</span><span className="font-semibold text-brand-light">included</span></div>
                            <div className="flex justify-between"><span>Battery condition test</span><span className="font-semibold text-brand-light">included (major)</span></div>
                            <div className="flex justify-between"><span>Forced DPF regeneration</span><span className="font-semibold text-brand-light">from &pound;45<VatLabel /></span></div>
                            <div className="flex justify-between"><span>9G-TRONIC transmission fluid service</span><span className="font-semibold text-brand-light">from &pound;120<VatLabel /></span></div>

                        </div>
                    </div>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 reveal">
                        <figure className="overflow-hidden rounded-xl border border-border-default">
                            <div className="relative aspect-[16/10] h-44 sm:h-52">
                                <OptimizedImage
                                    src="/images/new-images/transmission-service-on-9g-merc.jpg"
                                    alt="Mercedes 9G-TRONIC automatic transmission during fluid service"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            </div>
                            <figcaption className="border-t border-border-default bg-surface-alt px-3 py-2 text-xs text-text-secondary">
                                9G-TRONIC fluid service - correct spec and fill level, booked as an add-on.
                            </figcaption>
                        </figure>
                        <figure className="overflow-hidden rounded-xl border border-border-default">
                            <div className="relative aspect-[16/10] h-44 sm:h-52">
                                <OptimizedImage
                                    src="/images/new-images/using-torque-wrench-on-transmission.jpg"
                                    alt="Torque wrench set to manufacturer specification on transmission drain plug"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            </div>
                            <figcaption className="border-t border-border-default bg-surface-alt px-3 py-2 text-xs text-text-secondary">
                                Drain and fill plugs torqued to Mercedes specification - no rounded bolts, no leaks.
                            </figcaption>
                        </figure>
                    </div>
                    <p className="mt-3 text-sm text-text-muted">Prices based on standard Sprinter engines (OM651, OM654). V6 OM642 models may attract a supplement due to increased oil capacity. We&apos;ll confirm before booking.</p>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 SECTION 6: Common service indicators (the ASSYST section) \u2500\u2500\u2500 */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center reveal">
                        <div className="order-2 md:order-1">
                            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">The ASSYST service system explained</h2>
                            <p className="mt-4 text-text-secondary leading-relaxed">
                                Mercedes Sprinters don&apos;t use fixed service intervals. The ASSYST (Active Service SYSTem) calculates when your next service is due based on driving style, engine load, temperature, and mileage.
                            </p>
                            <p className="mt-3 text-text-secondary leading-relaxed">
                                When the dash shows <strong>&ldquo;Service A&rdquo;</strong> or <strong>&ldquo;Service B&rdquo;</strong>, that&apos;s the ASSYST system telling you what&apos;s due. After the service, it needs to be reset properly via Xentry - not with a generic OBD tool that just clears the warning.
                            </p>
                            <p className="mt-3 text-text-secondary leading-relaxed">
                                A proper Xentry reset recalculates the next service date and mileage based on your actual driving data. A generic reset just clears the counter - meaning your next service alert may come too early or too late.
                            </p>
                        </div>
                        <div className="order-1 md:order-2 space-y-4">
                            <figure className="overflow-hidden rounded-2xl border border-border-default">
                                <div className="relative aspect-[16/10] min-h-[200px] sm:min-h-[260px]">
                                    <OptimizedImage
                                        src="/images/new-images/assyst-reset-on-dash.jpg"
                                        alt="Mercedes Sprinter dash showing ASSYST remaining time and distance until next service"
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                </div>
                                <figcaption className="border-t border-border-default bg-surface-alt px-4 py-3 text-sm text-text-secondary">
                                    ASSYST on the dash - next service date and distance recalculated after a proper Xentry reset.
                                </figcaption>
                            </figure>
                            <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6">
                                <h3 className="text-lg font-bold text-text-primary mb-4">When is your Sprinter due?</h3>
                                <div className="space-y-3">
                                    {[
                                        { icon: <Clock className="h-4 w-4 text-brand" />, label: 'Service A (Minor)', detail: 'Every ~15,000 miles or 12 months' },
                                        { icon: <Clock className="h-4 w-4 text-brand" />, label: 'Service B (Major)', detail: 'Every ~30,000 miles or 24 months' },
                                        { icon: <Gauge className="h-4 w-4 text-brand" />, label: 'High-mileage vans', detail: 'ASSYST may trigger earlier based on driving conditions' },
                                        { icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />, label: 'Dash warning', detail: '"Service A in X days" - don\'t ignore this' },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-start gap-3">
                                            <div className="mt-0.5">{item.icon}</div>
                                            <div>
                                                <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                                                <p className="text-sm text-text-secondary">{item.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 When workshop referral needed \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start reveal">
                        <div>
                            <h2 className="text-xl font-bold text-text-primary">What we can do mobile</h2>
                            <ul className="mt-4 space-y-2">
                                {[
                                    'Full minor and major servicing',
                                    'Brake pad and disc replacement',
                                    'Diagnostic fault reading and coding',
                                    'Battery replacement',
                                    'Glow plug replacement',
                                    'AdBlue refill and quality check',
                                    'DPF forced regeneration',
                                    'Thermostat replacement (most models)',
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
                                    'Timing chain or belt work requiring specialist jigs',
                                    'Anything needing full ramp access or engine drop',
                                    'Turbocharger replacement or intercooler work',
                                    'Heavily corroded rear brake assemblies',
                                    'Clutch replacement or dual-mass flywheel',
                                    'Injector removal requiring specialist extraction tools',
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

            {/* \u2500\u2500\u2500 FAQ \u2500\u2500\u2500 */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-3xl reveal">
                    <h2 className="text-2xl font-bold text-text-primary text-center">Frequently asked questions</h2>
                    <div className="mt-8"><FaqAccordion items={faqs} /></div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 Diagnostic notice \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl reveal">
                    <Notice variant="info">We carry Mercedes STAR/XENTRY diagnostic equipment on every visit. If we spot a fault during your service, we can diagnose it there and then - no second visit needed.</Notice>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 Related services \u2500\u2500\u2500 */}
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

            {/* \u2500\u2500\u2500 FOOTER CTA \u2500\u2500\u2500 */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 to-brand/85" />
                </div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
                    <div className="text-center reveal">
                        <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl">Keep your Sprinter on the road</h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Mobile servicing from &pound;175<VatLabel /> - fully equipped for your exact model.</p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackNavClick('/booking', 'Book Online', 'sprinter_servicing_footer')}>Book Online</CTAButton>
                            <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="ghost" size="lg" external icon={<MessageCircle className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackWhatsAppClick('sprinter_servicing')}>WhatsApp Us</CTAButton>
                            <CTAButton href={`tel:${siteConfig.contact.phoneE164}`} variant="ghost" size="lg" external icon={<Phone className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackPhoneClick('sprinter_servicing')}>{siteConfig.contact.phoneDisplay}</CTAButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
