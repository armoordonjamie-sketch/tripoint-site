import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { trackNavClick, trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { FaqAccordion } from '@/components/FaqAccordion';
import { Notice } from '@/components/Notice';
import { CheckCircle2, ArrowRight, Phone, MessageCircle, AlertTriangle, Clock, Shield, Wrench, Gauge, Truck } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { ServiceSchema, BreadcrumbSchema, FaqPageSchema } from '@/components/JsonLd';
import { OptimizedImage } from '@/components/OptimizedImage';

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
        question: 'Which Mercedes vans do you service?',
        answer:
            'We cover the Sprinter (W906, W907/W910), Vito (W639, W447), and Citan (W415, W420/T-Class). All engine variants, including OM651, OM654, OM622, OM608, and K9K. Panel van, chassis cab, crew van, Tourer, and Mixto.',
    },
    {
        question: 'Is this for my Citan too?',
        answer:
            'Yes, if you own or operate a Mercedes Vito (W447), Sprinter (W906/W907/W910), or Citan (W415/W420) and want planned servicing at your location. For model-specific pricing and technical detail, see our Sprinter, Vito, or Citan pages.',
    },
    {
        question: 'Why a specialist instead of a main dealer?',
        answer:
            'Same Xentry diagnostic access, genuine Mercedes parts, same service quality - but at your location instead of a workshop, and at 30-40% less than dealer pricing. We come to you, so there’s no lost working day.',
    },
    {
        question: 'What\u2019s included in the price?',
        answer:
            'Genuine Mercedes parts, labour, travel to your location, service indicator reset via Xentry, and a written condition report. No hidden extras.',
    },
    {
        question: 'Do you service petrol Mercedes vans?',
        answer:
            'Yes. While most Mercedes vans are diesel, we also cover the petrol Citan (ER30 1.3T) and Vito petrol variants. Just send us your reg and we\u2019ll confirm.',
    },
    {
        question: 'Can you do brake work at the same time?',
        answer:
            'Yes. We offer combined service + brake packages. If brakes are due, we\u2019ll quote it alongside your service so you only need one visit. See our Sprinter Brakes, Vito Brakes, or Citan Brakes pages for specific pricing.',
    },
];

const vanModels = [
    {
        name: 'Sprinter',
        generations: 'W906 \u00b7 W907/W910',
        engines: 'OM651 \u00b7 OM654 \u00b7 OM642',
        desc: 'The workhorse. Heavy diesel engines with ASSYST service system, DPF, and AdBlue. Needs correct oil spec (MB 229.51/229.52) and Xentry reset.',
        href: '/services/sprinter-servicing',
        brakeHref: '/services/sprinter-brakes',
    },
    {
        name: 'Vito',
        generations: 'W639 \u00b7 W447',
        engines: 'OM651 \u00b7 OM622 \u00b7 OM654',
        desc: 'The versatile mid-sizer. Popular with tradespeople, taxi firms, and courier companies. Watch for injector seal issues on OM651.',
        href: '/services/vito-servicing',
        brakeHref: '/services/vito-brakes',
    },
    {
        name: 'Citan',
        generations: 'W415 \u00b7 W420',
        engines: 'K9K \u00b7 OM608 \u00b7 ER30',
        desc: 'The compact. Built on the Renault Kangoo platform. Needs someone who understands both Mercedes and Renault diagnostics.',
        href: '/services/citan-servicing',
        brakeHref: '/services/citan-brakes',
    },
];

export function MercedesVanServicingPage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo
                title="Mercedes Van Servicing"
                description="Mobile Mercedes van servicing for Sprinter, Vito, and Citan. Minor from \u00a3175, major from \u00a3295. Genuine parts, Xentry service reset. Kent and SE London."
                canonical="/services/mercedes-van-servicing"
            />
            <ServiceSchema name="Mercedes Van Servicing" description="Mobile Mercedes van servicing - Sprinter, Vito, and Citan. Minor and major packages at your location." url="/services/mercedes-van-servicing" priceFrom={175} />
            <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Mercedes Van Servicing', url: '/services/mercedes-van-servicing' }]} />
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(var(--color-brand-rgb),0.2),transparent_55%)]" />
                <div className="absolute bottom-0 left-0 right-0 z-10 p-6 sm:p-10">
                    <div className="mx-auto max-w-5xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Servicing &amp; Brakes</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl lg:text-6xl">Mercedes Van Servicing</h1>
                        <p className="mt-3 max-w-xl text-lg text-text-secondary">Sprinter &bull; Vito &bull; Citan &bull; All models &bull; At your door</p>
                    </div>
                </div>
            </section>

            {/* \u2500\u2500\u2500 SECTION 1: Overview \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl reveal">
                    <div className="max-w-3xl">
                        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Dealer-level servicing without the dealer</h2>
                        <p className="mt-4 text-text-secondary leading-relaxed">
                            We bring proper Mercedes van servicing to your door. Same diagnostic equipment (Star Diagnosis / Xentry), genuine Mercedes parts, same service quality - but at your location, on your schedule, and at 30-40% less than main dealer pricing.
                        </p>
                        <p className="mt-3 text-text-secondary leading-relaxed">
                            Whether you run a single Sprinter or a fleet of mixed Mercedes vans, we service them all with model-specific knowledge, the correct oil specs, and proper service system resets. No shortcuts, no generic tools.
                        </p>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <CTAButton href="/booking" size="md" onClick={() => trackNavClick('/booking', 'Book a Service', 'merc_servicing_top')}>Book a Service</CTAButton>
                        <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="outline" size="md" external icon={<MessageCircle className="h-4 w-4" />} onClick={() => trackWhatsAppClick('merc_servicing')}>WhatsApp Us</CTAButton>
                        <CTAButton href="/pricing" variant="outline" size="md" icon={<ArrowRight className="h-4 w-4" />}>Full Pricing</CTAButton>
                    </div>
                    <h3 className="mt-10 text-lg font-semibold text-text-primary">What you&apos;ll see after a service</h3>
                    <p className="mt-1 text-sm text-text-secondary">Your dash will show a fresh interval and correct oil level - here&apos;s what that looks like.</p>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <figure className="overflow-hidden rounded-2xl border border-border-default">
                            <div className="relative aspect-[16/10] min-h-[220px] sm:min-h-[280px]">
                                <OptimizedImage
                                    src="/images/new-images/assyst-reset-on-dash.jpg"
                                    alt="Mercedes van dashboard showing ASSYST service interval remaining"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            </div>
                            <figcaption className="border-t border-border-default bg-surface-alt px-4 py-3 text-sm text-text-secondary">
                                ASSYST / FSS on the dash - we reset with Xentry so your next interval matches how you actually drive.
                            </figcaption>
                        </figure>
                        <figure className="overflow-hidden rounded-2xl border border-border-default">
                            <div className="relative aspect-[16/10] min-h-[220px] sm:min-h-[280px]">
                                <OptimizedImage
                                    src="/images/new-images/mercedes-oil-level-on-dash.jpg"
                                    alt="Mercedes instrument cluster showing electronic engine oil level readout"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            </div>
                            <figcaption className="border-t border-border-default bg-surface-alt px-4 py-3 text-sm text-text-secondary">
                                Electronic oil level - verified after every service with the correct MB oil spec.
                            </figcaption>
                        </figure>
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 SECTION 2: Model cards \u2500\u2500\u2500 */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">Choose your model</h2>
                    <p className="mt-2 text-text-secondary text-center">Each model has its own service page with specific technical detail and pricing.</p>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {vanModels.map((van) => (
                            <div key={van.name} className="rounded-2xl border border-border-default bg-surface p-6 flex flex-col">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                                        <Truck className="h-5 w-5 text-brand" />
                                    </div>
                                    <h3 className="text-xl font-bold text-text-primary">{van.name}</h3>
                                </div>
                                <p className="text-xs text-brand font-semibold">{van.generations}</p>
                                <p className="text-xs text-text-muted mb-3">{van.engines}</p>
                                <p className="text-sm text-text-secondary flex-1">{van.desc}</p>
                                <div className="mt-4 flex flex-col gap-2">
                                    <Link to={van.href} className="flex items-center justify-between rounded-lg border border-brand/20 bg-brand/5 px-3 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand/10">
                                        <span>{van.name} Servicing</span><ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link to={van.brakeHref} className="flex items-center justify-between rounded-lg border border-border-default px-3 py-2 text-sm text-text-secondary transition-colors hover:border-brand/20 hover:bg-brand/5">
                                        <span>{van.name} Brakes</span><ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 SECTION 3: Dealer vs Us comparison \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">Dealer vs TriPoint</h2>
                    <p className="mt-2 text-text-secondary text-center max-w-2xl mx-auto">Same service quality, different experience.</p>
                    <div className="mt-8 overflow-x-auto rounded-xl border border-border-default">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-border-default bg-surface-alt">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary"></th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-text-muted">Main Dealer</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-brand">TriPoint</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { feature: 'Location', dealer: 'Drop-off at workshop', us: 'At your door' },
                                    { feature: 'Diagnostic equipment', dealer: 'Xentry', us: 'Xentry' },
                                    { feature: 'Parts spec', dealer: 'Genuine Mercedes', us: 'Genuine Mercedes' },
                                    { feature: 'Service reset', dealer: 'Full ASSYST/FSS reset', us: 'Full ASSYST/FSS reset' },
                                    { feature: 'Minor service price', dealer: '~\u00a3280-350', us: 'from \u00a3175' },
                                    { feature: 'Major service price', dealer: '~\u00a3450-550', us: 'from \u00a3295' },
                                    { feature: 'Vehicle downtime', dealer: 'Full day drop-off', us: '60-90 mins at your location' },
                                    { feature: 'Diagnostic scan included', dealer: 'Usually extra', us: 'Included with every service' },
                                    { feature: 'Written report', dealer: 'Sometimes', us: 'Always' },
                                ].map((row) => (
                                    <tr key={row.feature} className="border-b border-border-default">
                                        <td className="px-4 py-3 text-sm font-semibold text-text-primary">{row.feature}</td>
                                        <td className="px-4 py-3 text-center text-sm text-text-muted">{row.dealer}</td>
                                        <td className="px-4 py-3 text-center text-sm text-text-secondary font-semibold">{row.us}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 SECTION 4: What every service includes \u2500\u2500\u2500 */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">What every Mercedes van service includes</h2>
                    <p className="mt-2 text-text-secondary text-center max-w-2xl mx-auto">Regardless of model, every service comes with these as standard.</p>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                            { icon: <Wrench className="h-5 w-5 text-brand" />, title: 'Genuine Mercedes Parts', desc: 'Genuine parts on every service. Correct oil spec, correct filters, correct torque settings.' },
                            { icon: <Shield className="h-5 w-5 text-brand" />, title: 'Xentry Service Reset', desc: 'Full ASSYST/FSS reset with calculated next-service date, not a generic counter clear.' },
                            { icon: <Gauge className="h-5 w-5 text-brand" />, title: 'Diagnostic Scan', desc: 'Complete fault code scan included with every service. We catch things early.' },
                            { icon: <Clock className="h-5 w-5 text-brand" />, title: 'At Your Door', desc: 'We come to your home, yard, depot, or customer site. No workshop drop-off.' },
                            { icon: <CheckCircle2 className="h-5 w-5 text-brand" />, title: 'Written Report', desc: 'Every service comes with a written condition report and any recommendations.' },
                            { icon: <AlertTriangle className="h-5 w-5 text-brand" />, title: 'Honest Assessment', desc: 'If something needs attention, we tell you. If it doesn\u2019t, we don\u2019t upsell.' },
                        ].map((item) => (
                            <div key={item.title} className="rounded-xl border border-border-default bg-surface p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">{item.icon}</div>
                                    <h3 className="font-semibold text-text-primary text-sm">{item.title}</h3>
                                </div>
                                <p className="text-sm text-text-secondary">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 SECTION 5: Service intervals explained \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start reveal">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Understanding Mercedes service intervals</h2>
                            <p className="mt-4 text-text-secondary leading-relaxed">
                                Mercedes vans don&apos;t use fixed service intervals like most cars. They use the ASSYST (Active Service SYSTem) or FSS (Flexible Service System) to calculate when your next service is due based on engine load, temperature, mileage, and driving pattern.
                            </p>
                            <p className="mt-3 text-text-secondary leading-relaxed">
                                The system alternates between <strong>Service A</strong> (minor) and <strong>Service B</strong> (major). Typical intervals are around 15,000 miles for an A-service and 30,000 miles for a B-service, but the actual trigger depends on how hard the van works.
                            </p>
                            <p className="mt-3 text-text-secondary leading-relaxed">
                                High-mileage vans doing motorway miles may stretch further. Vans doing short urban runs may trigger earlier. The system knows - and so do we.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="rounded-xl border border-border-default p-4">
                                <h3 className="font-bold text-text-primary flex items-center gap-2"><span className="text-brand text-lg">A</span>Minor Service</h3>
                                <p className="mt-1 text-sm text-text-secondary">Oil and filter change, visual health check, fluid levels, brake measurement, service reset. Typically every ~15,000 miles or 12 months.</p>
                                <p className="mt-2 text-lg font-bold text-brand-light">from &pound;175</p>
                            </div>
                            <div className="rounded-xl border border-border-default p-4">
                                <h3 className="font-bold text-text-primary flex items-center gap-2"><span className="text-brand text-lg">B</span>Major Service</h3>
                                <p className="mt-1 text-sm text-text-secondary">Everything in minor, plus air filter, cabin filter, fuel filter, battery test, comprehensive inspection. Typically every ~30,000 miles or 24 months.</p>
                                <p className="mt-2 text-lg font-bold text-brand-light">from &pound;295</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 SECTION 6: How it works \u2500\u2500\u2500 */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">How it works</h2>
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', icon: <MessageCircle className="h-6 w-6 text-brand" />, title: 'Send us your reg', desc: 'We identify your model, engine, and what\u2019s due. Fixed price confirmed before you commit.' },
                            { step: '02', icon: <Wrench className="h-6 w-6 text-brand" />, title: 'We come to you', desc: 'Model-specific parts pre-ordered. Service done at your location - driveway, yard, depot.' },
                            { step: '03', icon: <CheckCircle2 className="h-6 w-6 text-brand" />, title: 'Drive away serviced', desc: 'Service system properly reset, written report, and any recommendations. Done.' },
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

            {/* \u2500\u2500\u2500 Pricing summary \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="reveal">
                        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">All-model pricing</h2>
                        <p className="mt-2 text-text-secondary">Fixed pricing by zone. Includes parts, labour, and travel.</p>
                        <div className="mt-6 overflow-x-auto rounded-xl border border-border-default">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-border-default bg-surface-alt">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Package</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Zone A</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Zone B</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Zone C</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Minor Service (all models)</td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;175</td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;190</td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;205</td></tr>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Major Service (all models)</td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;295</td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;310</td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;325</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-3 text-sm text-text-muted">V6 Sprinter (OM642) models may attract a supplement due to increased oil capacity.</p>
                    </div>
                    <div className="mt-6 rounded-2xl border border-brand/20 bg-brand/5 p-6 text-center reveal">
                        <p className="text-xl font-bold text-text-primary">Mercedes van service from <span className="text-brand-light">&pound;175</span></p>
                        <p className="mt-1 text-sm text-text-secondary">Fixed price - at your location - with Xentry service reset</p>
                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                            <CTAButton href="/booking" size="sm" onClick={() => trackNavClick('/booking', 'Book Now', 'merc_servicing_pricing')}>Book Now</CTAButton>
                            <CTAButton href="/pricing" variant="outline" size="sm" icon={<ArrowRight className="h-4 w-4" />}>Full Pricing</CTAButton>
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

            {/* \u2500\u2500\u2500 Notice \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl reveal">
                    <Notice variant="info">We carry Mercedes STAR/XENTRY diagnostic equipment on every visit. If we find a fault during your service, we can diagnose it there and then - no second visit needed.</Notice>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 FOOTER CTA \u2500\u2500\u2500 */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0"><div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 to-brand/85" /></div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
                    <div className="text-center reveal">
                        <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl">Your Mercedes van, serviced at your door</h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Sprinter, Vito, or Citan - fixed-price servicing with Xentry service reset.</p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackNavClick('/booking', 'Book Online', 'merc_servicing_footer')}>Book Online</CTAButton>
                            <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="ghost" size="lg" external icon={<MessageCircle className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackWhatsAppClick('merc_servicing')}>WhatsApp Us</CTAButton>
                            <CTAButton href={`tel:${siteConfig.contact.phoneE164}`} variant="ghost" size="lg" external icon={<Phone className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackPhoneClick('merc_servicing')}>{siteConfig.contact.phoneDisplay}</CTAButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
