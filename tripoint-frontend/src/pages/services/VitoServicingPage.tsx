import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { trackBookNowClick, trackPhoneLead, trackWhatsAppLead } from '@/lib/analytics';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { FaqAccordion } from '@/components/FaqAccordion';
import { Notice } from '@/components/Notice';
import { CheckCircle2, ArrowRight, Phone, MessageCircle, AlertTriangle, Clock, Shield, Wrench, Gauge } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { ServiceSchema, BreadcrumbSchema, FaqPageSchema } from '@/components/JsonLd';

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
        question: 'Which Vito models do you cover?',
        answer:
            'We cover the W639 (2003-2014) and W447 (2014+) Vito with OM651, OM622, and OM654 engines. Panel van, Tourer, crew van, and Mixto variants. Send us your reg and we\u2019ll confirm.',
    },
    {
        question: 'Is it cheaper than the dealer?',
        answer:
            'Yes, typically 30-40% less than main dealer pricing, using genuine Mercedes parts. Same parts, fitted at your door instead of a workshop.',
    },
    {
        question: 'Can you service a Vito with a 7G-Tronic gearbox?',
        answer:
            'Yes. We service Vitos with both manual and 7G-Tronic automatic transmissions. Transmission fluid changes are available as an add-on if required. We\u2019ll check the service schedule for your specific variant.',
    },
    {
        question: 'How long does a Vito service take?',
        answer:
            'A minor service typically takes 45-75 minutes. A major service takes 75-100 minutes depending on the engine variant and any additional items. We\u2019ll confirm timing when you book.',
    },
    {
        question: 'Do you reset the service light?',
        answer:
            'Yes. We reset the ASSYST service counter via Xentry after every service. The dash will show a fresh service interval - calculated properly, not just cleared.',
    },
    {
        question: 'What if you find something wrong during the service?',
        answer:
            'We tell you immediately and quote for any additional work. Nothing gets done without your say-so. Because we carry dealer-level diagnostic equipment, we often catch things early that would otherwise snowball.',
    },
];

const crossSell = [
    { title: 'Vito Brakes', desc: 'Front and rear brake packages from \u00a3169', href: '/services/vito-brakes' },
    { title: 'Standard Diagnosis', desc: 'Warning light? We\u2019ll diagnose it.', href: '/services/diagnostic-callout' },
    { title: 'Mercedes Van Servicing', desc: 'All models - Sprinter, Vito, Citan', href: '/services/mercedes-van-servicing' },
];

export function VitoServicingPage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo
                title="Vito Servicing"
                description="Mobile Mercedes Vito servicing. Minor from \u00a3175, major from \u00a3295. Genuine parts, Xentry service reset, full inspection at your door. W639 and W447."
                canonical="/services/vito-servicing"
            />
            <ServiceSchema name="Vito Servicing" description="Mobile Mercedes Vito servicing - minor and major service packages for W639 and W447 at your location across Kent and SE London." url="/services/vito-servicing" priceFrom={175} />
            <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Mercedes Van Servicing', url: '/services/mercedes-van-servicing' }, { name: 'Vito Servicing', url: '/services/vito-servicing' }]} />
            <FaqPageSchema items={faqs} />

            {/* \u2500\u2500\u2500 HERO \u2500\u2500\u2500 */}
            <section className="relative h-72 sm:h-96 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-surface to-surface" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(var(--color-brand-rgb),0.12),transparent_70%)]" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                    <div className="mx-auto max-w-5xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Mercedes Vito Specialist</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl lg:text-6xl">Vito Servicing</h1>
                        <p className="mt-3 max-w-xl text-lg text-text-secondary">W639 &bull; W447 &bull; OM651 &bull; OM622 &bull; OM654 &bull; Fitted at your door</p>
                    </div>
                </div>
            </section>

            {/* \u2500\u2500\u2500 SECTION 1: The Vito workhorse \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center reveal">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">The Vito is everywhere - and it needs looking after</h2>
                            <p className="mt-4 text-text-secondary leading-relaxed">
                                The Mercedes Vito is the go-to mid-size van for tradespeople, taxi firms, courier companies, and anyone who needs something bigger than a car but more nimble than a Sprinter. It works hard, covers serious miles, and deserves proper maintenance.
                            </p>
                            <p className="mt-3 text-text-secondary leading-relaxed">
                                Whether you&apos;re running a W639 with the older OM651 engine or a newer W447 with the compact OM622 or OM654, we bring the correct parts, the right oil spec, and dealer-level diagnostic equipment to your door.
                            </p>
                            <p className="mt-3 text-text-secondary leading-relaxed">
                                No workshop drop-off. No lost working day. Fixed-price servicing you can budget for.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <CTAButton href="/booking" size="md" onClick={() => trackBookNowClick('vito_servicing_top')}>Book Online</CTAButton>
                                <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="outline" size="md" external icon={<MessageCircle className="h-4 w-4" />} onClick={() => trackWhatsAppLead('vito_servicing')}>WhatsApp Us</CTAButton>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="rounded-xl border border-border-default p-4 flex items-start gap-3">
                                <Wrench className="h-5 w-5 shrink-0 text-brand mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-text-primary">Tradespeople</h3>
                                    <p className="text-sm text-text-secondary">Plumbers, electricians, builders - your Vito is your mobile office. We service it at your yard or customer site.</p>
                                </div>
                            </div>
                            <div className="rounded-xl border border-border-default p-4 flex items-start gap-3">
                                <Clock className="h-5 w-5 shrink-0 text-brand mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-text-primary">Taxi / Private Hire</h3>
                                    <p className="text-sm text-text-secondary">Vito Tourer owners - we service around your schedule. Early mornings, evenings, or weekends available.</p>
                                </div>
                            </div>
                            <div className="rounded-xl border border-border-default p-4 flex items-start gap-3">
                                <Gauge className="h-5 w-5 shrink-0 text-brand mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-text-primary">Courier / Delivery</h3>
                                    <p className="text-sm text-text-secondary">High-mileage Vitos need frequent attention. ASSYST may trigger earlier - we keep you on top of it.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 SECTION 2: What\u2019s included \u2500\u2500\u2500 */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">What&apos;s included</h2>
                    <p className="mt-2 text-text-secondary text-center max-w-2xl mx-auto">Every Vito service includes the following as standard.</p>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-border-default bg-surface p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10"><Wrench className="h-5 w-5 text-brand" /></div>
                                <h3 className="text-lg font-bold text-text-primary">Minor Service (A-Style)</h3>
                            </div>
                            <ul className="space-y-2">
                                {[
                                    'Genuine Mercedes engine oil (MB 229.51)',
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
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10"><Shield className="h-5 w-5 text-brand" /></div>
                                <h3 className="text-lg font-bold text-text-primary">Major Service (B-Style)</h3>
                            </div>
                            <ul className="space-y-2">
                                {[
                                    'Everything in the minor service, plus:',
                                    'Air filter replacement',
                                    'Cabin / pollen filter replacement',
                                    'Fuel filter replacement',
                                    'Comprehensive multi-point inspection',
                                    'Battery condition and cranking test',
                                    'Glow plug circuit check',
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
                </div>
            </Section>

            {/* \u2500\u2500\u2500 SECTION 3: Common Vito issues we catch \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center reveal">
                        <div className="order-2 md:order-1">
                            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Common Vito issues we catch during servicing</h2>
                            <p className="mt-4 text-text-secondary leading-relaxed">
                                Because we run a full diagnostic scan alongside every service, we regularly catch developing faults before they become expensive problems. Here are the most common Vito-specific issues we find:
                            </p>
                            <ul className="mt-4 space-y-3">
                                {[
                                    { issue: 'Injector seal failure (black death)', detail: 'Carbon build-up around injectors on OM651 - caught early, it\u2019s a seal replacement. Left late, it\u2019s injector removal and carbon cleanup.' },
                                    { issue: 'Turbo actuator sticking', detail: 'Common on W447 OM651 engines. Shows as reduced power or limp mode. We can test actuator movement via diagnostics.' },
                                    { issue: 'Glow plug failure', detail: 'Hard starting in cold weather. We test each glow plug circuit during a major service and flag any failures.' },
                                    { issue: 'DPF soot loading', detail: 'Vitos doing short runs build up DPF soot quickly. We read soot levels and can force a regeneration if needed.' },
                                ].map((item) => (
                                    <li key={item.issue} className="text-sm text-text-secondary">
                                        <span className="font-semibold text-text-primary">{item.issue}:</span> {item.detail}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="order-1 md:order-2 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
                                <div>
                                    <h3 className="font-bold text-text-primary">A note on dual-clutch transmissions</h3>
                                    <p className="mt-2 text-sm text-text-secondary">
                                        Some W447 Vitos are fitted with the 7G-DCT dual-clutch transmission. This gearbox has specific fluid requirements and a service interval that&apos;s separate from the engine service. If you&apos;re unsure whether your Vito has a DCT or the standard 7G-TRONIC torque converter, send us your reg and we&apos;ll confirm.
                                    </p>
                                    <p className="mt-2 text-sm text-text-secondary">
                                        We can perform transmission fluid changes alongside regular servicing - just ask when booking.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 SECTION 4: Models covered \u2500\u2500\u2500 */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">Models we cover</h2>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="rounded-xl border border-border-default bg-surface p-5">
                            <h3 className="font-bold text-text-primary text-lg">W639 Vito (2003-2014)</h3>
                            <p className="mt-2 text-sm text-text-secondary">OM651 2.1L CDI &bull; OM646 2.1L CDI &bull; Panel van, crew van, Mixto, and Traveliner</p>
                            <p className="mt-2 text-xs text-text-muted">Note: Older W639 models may have different oil specifications. We confirm before ordering parts.</p>
                        </div>
                        <div className="rounded-xl border border-border-default bg-surface p-5">
                            <h3 className="font-bold text-text-primary text-lg">W447 Vito (2014+)</h3>
                            <p className="mt-2 text-sm text-text-secondary">OM651 2.1L CDI &bull; OM622 1.6L CDI &bull; OM654 2.0L CDI &bull; 7G-TRONIC / 7G-DCT / Manual</p>
                            <p className="mt-2 text-xs text-text-muted">Includes Vito Panel, Vito Tourer, and Vito Sport variants.</p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-text-muted text-center">Not sure which you have? Send us your reg - we&apos;ll confirm your model, engine, and what&apos;s due.</p>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 SECTION 5: How it works \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">How it works</h2>
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', icon: <MessageCircle className="h-6 w-6 text-brand" />, title: 'Send us your reg', desc: 'We confirm your Vito model, engine, and what\u2019s due. Fixed price confirmed upfront.' },
                            { step: '02', icon: <Wrench className="h-6 w-6 text-brand" />, title: 'We come to you', desc: 'Parts and oil pre-ordered for your exact variant. Done at your location - driveway, yard, or depot.' },
                            { step: '03', icon: <CheckCircle2 className="h-6 w-6 text-brand" />, title: 'Drive away serviced', desc: 'ASSYST reset via Xentry, written report with findings. You carry on with your day.' },
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

            {/* \u2500\u2500\u2500 SECTION 6: Pricing \u2500\u2500\u2500 */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl">
                    <div className="reveal">
                        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Vito servicing pricing</h2>
                        <p className="mt-2 text-text-secondary">Fixed-price packages - genuine Mercedes parts, labour, and travel to your location.</p>
                        <div className="mt-6 overflow-x-auto rounded-xl border border-border-default">
                            <table className="min-w-full">
                                <thead><tr className="border-b border-border-default bg-surface-alt"><th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Package</th><th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Zone A</th><th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Zone B</th><th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Zone C</th></tr></thead>
                                <tbody>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Minor Service (A-Style)</td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;175</td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;190</td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;205</td></tr>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Major Service (B-Style)</td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;295</td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;310</td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;325</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-8 rounded-2xl border border-border-default bg-surface p-6 reveal">
                        <h3 className="font-bold text-text-primary">Optional add-ons</h3>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-text-secondary">
                            <div className="flex justify-between"><span>AdBlue top-up (Euro 6)</span><span className="font-semibold text-brand-light">from &pound;25</span></div>
                            <div className="flex justify-between"><span>Transmission fluid change</span><span className="font-semibold text-brand-light">from &pound;120</span></div>
                            <div className="flex justify-between"><span>Brake check with measurement</span><span className="font-semibold text-brand-light">included</span></div>
                            <div className="flex justify-between"><span>Diagnostic fault scan</span><span className="font-semibold text-brand-light">included</span></div>
                            <div className="flex justify-between"><span>Forced DPF regeneration</span><span className="font-semibold text-brand-light">from &pound;45</span></div>

                        </div>
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 FAQ \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-3xl reveal">
                    <h2 className="text-2xl font-bold text-text-primary text-center">Frequently asked questions</h2>
                    <div className="mt-8"><FaqAccordion items={faqs} /></div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 Diagnostic notice \u2500\u2500\u2500 */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <Notice variant="info">We carry Mercedes STAR/XENTRY diagnostic equipment on every visit. If we find a fault during your Vito service, we can diagnose it there and then - no second visit needed.</Notice>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 Related services \u2500\u2500\u2500 */}
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
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 to-brand/85" />
                </div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
                    <div className="text-center reveal">
                        <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl">Keep your Vito earning</h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Mobile servicing from &pound;175 - at your door, around your schedule.</p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackBookNowClick('vito_servicing_footer')}>Book Online</CTAButton>
                            <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="ghost" size="lg" external icon={<MessageCircle className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackWhatsAppLead('vito_servicing')}>WhatsApp Us</CTAButton>
                            <CTAButton href={`tel:${siteConfig.contact.phoneE164}`} variant="ghost" size="lg" external icon={<Phone className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackPhoneLead('vito_servicing')}>{siteConfig.contact.phoneDisplay}</CTAButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
