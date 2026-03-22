import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { trackBookNowClick, trackPhoneLead, trackWhatsAppLead } from '@/lib/analytics';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { FaqAccordion } from '@/components/FaqAccordion';
import { Notice } from '@/components/Notice';
import { CheckCircle2, XCircle, ArrowRight, Phone, MessageCircle, AlertTriangle } from 'lucide-react';
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
        question: 'How long does a Vito brake job take?',
        answer: 'Front pads only: around 30-45 minutes. Front pads and discs: 45-60 minutes. Rear brakes may take longer depending on condition. All done at your location.',
    },
    {
        question: 'Do you use genuine Mercedes parts?',
        answer: 'Yes. We use genuine Mercedes parts as standard. You get the right parts, fitted properly, with none of the dealer markup.',
    },
    {
        question: 'What about the electronic parking brake?',
        answer: 'Some W447 Vito models have an electronic parking brake. We carry the diagnostic tools needed to retract the caliper electronically before fitting rear pads. This is included in the job - no extra charge.',
    },
    {
        question: 'Can rear brakes be done mobile?',
        answer: 'Yes, in most cases. We apply strict condition qualifiers - if the rear assembly is heavily corroded, we\'ll assess honestly and may add a small surcharge for extra time. No surprises.',
    },
];

const crossSell = [
    { title: 'Vito Servicing', desc: 'Full service packages for Vito W447', href: '/services/vito-servicing' },
    { title: 'Mercedes Van Servicing', desc: 'All Mercedes van service and brake packages', href: '/services/mercedes-van-servicing' },
    { title: 'Standard Diagnosis', desc: 'Got a fault or warning light? We diagnose it.', href: '/services/diagnostic-callout' },
];

export function VitoBrakesPage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo title="Vito Brakes" description="Mobile Vito W447 brake service. Front pads from £169, front pads and discs from £319. Fixed-price brake packages at your location." canonical="/services/vito-brakes" />
            <ServiceSchema name="Vito Brakes" description="Mobile Mercedes Vito W447 brake service - front and rear pads and discs fitted at your location." url="/services/vito-brakes" priceFrom={169} />
            <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Mercedes Van Servicing', url: '/services/mercedes-van-servicing' }, { name: 'Vito Brakes', url: '/services/vito-brakes' }]} />
            <FaqPageSchema items={faqs} />

            {/* ─── HERO ─── */}
            <section className="relative h-72 sm:h-96 overflow-hidden">
                <img
                    src="/images/services/van-vito-w447-front.png"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/25" />
                <div className="absolute bottom-0 left-0 right-0 z-10 p-6 sm:p-10">
                    <div className="mx-auto max-w-5xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Mercedes Vito Specialist</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl lg:text-6xl">Vito Brakes</h1>
                        <p className="mt-3 max-w-xl text-lg text-text-secondary">W447 &bull; Front &amp; Rear Packages &bull; Electronic Parking Brake Support</p>
                    </div>
                </div>
            </section>

            {/* ─── SECTION 1: Intro - image left, text right ─── */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center reveal">
                        <div className="overflow-hidden rounded-2xl">
                            <OptimizedImage
                                src="/images/new-images/sprinter-brakes-01.jpg"
                                alt="Worn brake pad next to new pad comparison on Mercedes Vito"
                                className="h-full w-full object-cover rounded-2xl transition-transform duration-500 hover:scale-105"
                            />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Your Vito&apos;s brakes take a beating</h2>
                            <p className="mt-4 text-text-secondary leading-relaxed">
                                Heavy loads, stop-start traffic, tight turns - Vitos work hard and their brakes show it. When they start making noise or the warning light comes on, don&apos;t ignore it.
                            </p>
                            <p className="mt-3 text-text-secondary leading-relaxed">
                                Genuine Mercedes parts, proper fitment, no workshop queue. Fixed-price packages so you know exactly what you&apos;re paying before we start.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <CTAButton href="/booking" size="md" onClick={() => trackBookNowClick('vito_brakes_top')}>Book Online</CTAButton>
                                <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="outline" size="md" external icon={<MessageCircle className="h-4 w-4" />} onClick={() => trackWhatsAppLead('vito_brakes')}>WhatsApp Us</CTAButton>
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
                                Every Vito brake job starts with a proper measurement. We use digital vernier calipers to check disc thickness against Mercedes minimum specifications - not just a visual glance.
                            </p>
                            <p className="mt-3 text-text-secondary leading-relaxed">
                                If your discs still have life in them, we&apos;ll tell you. If they need replacing, you&apos;ll see the numbers. No upselling, no guesswork.
                            </p>
                            <ul className="mt-6 space-y-2">
                                {[
                                    'Disc thickness measured against Mercedes spec',
                                    'Pad wear assessed on all corners',
                                    'Caliper slider pins checked and lubricated',
                                    'Electronic parking brake retracted where applicable',
                                ].map((s) => (
                                    <li key={s} className="flex items-start gap-2 text-text-secondary text-sm">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                                        <span>{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="order-1 md:order-2 overflow-hidden rounded-2xl">
                            <OptimizedImage
                                src="/images/new-images/sprinter-brakes-02.jpg"
                                alt="Digital vernier caliper measuring brake disc thickness on Mercedes Vito"
                                className="h-full w-full object-cover rounded-2xl transition-transform duration-500 hover:scale-105"
                            />
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
                            'Electronic parking brake retraction (where applicable)',
                            'Brake fluid level check',
                            'Road test and written confirmation',
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
                            <p className="mt-2 text-sm text-text-secondary">Describe what you&apos;re hearing or feeling. We recommend the right package and confirm a fixed price.</p>
                        </div>
                        <div className="text-center">
                            <div className="step-number mx-auto flex h-12 w-12 items-center justify-center text-lg font-bold">02</div>
                            <h3 className="mt-4 font-semibold text-text-primary">We come to you</h3>
                            <p className="mt-2 text-sm text-text-secondary">Parts pre-ordered for your exact Vito. Brake job done at your location - driveway, depot, car park.</p>
                        </div>
                        <div className="text-center">
                            <div className="step-number mx-auto flex h-12 w-12 items-center justify-center text-lg font-bold">03</div>
                            <h3 className="mt-4 font-semibold text-text-primary">Road tested and confirmed</h3>
                            <p className="mt-2 text-sm text-text-secondary">Brakes tested, everything confirmed, written report in hand. Done.</p>
                        </div>
                    </div>
                    <div className="mt-10 overflow-hidden rounded-2xl max-w-2xl mx-auto">
                        <OptimizedImage
                            src="/images/new-images/sprinter-brakes-04.jpg"
                            alt="Completed front brake assembly with new pads and discs on Mercedes Vito"
                            className="w-full object-cover rounded-2xl"
                        />
                        <p className="mt-2 text-xs text-text-muted text-center">New pads and discs fitted, ready for road test</p>
                    </div>
                </div>
            </Section>

            {/* ─── SECTION 5: Pricing ─── */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="reveal">
                        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Vito brake pricing</h2>
                        <p className="mt-2 text-text-secondary">Fixed-price packages - no hidden extras, no hourly rates.</p>
                        <div className="mt-6 overflow-x-auto rounded-xl border border-border-default">
                            <table className="min-w-full">
                                <thead><tr className="border-b border-border-default bg-surface-alt"><th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Package</th><th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Price</th></tr></thead>
                                <tbody>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Front Pads Only</td><td className="px-4 py-3 text-right font-semibold text-brand-light">from £169</td></tr>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Front Pads + Discs</td><td className="px-4 py-3 text-right font-semibold text-brand-light">from £319</td></tr>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Rear Pads Only</td><td className="px-4 py-3 text-right font-semibold text-brand-light">from £169</td></tr>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Rear Pads + Discs</td><td className="px-4 py-3 text-right font-semibold text-brand-light">from £319</td></tr>
                                    <tr><td className="px-4 py-3 text-text-secondary">Rear Pads + Discs + Shoes</td><td className="px-4 py-3 text-right font-semibold text-brand-light">from £399</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Optional extras */}
                    <div className="mt-8 rounded-2xl border border-border-default bg-surface-alt p-6 reveal">
                        <h3 className="font-bold text-text-primary">Optional add-ons</h3>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-text-secondary">
                            <div className="flex justify-between"><span>Brake wear sensor replacement</span><span className="font-semibold text-brand-light">£15-35</span></div>
                            <div className="flex justify-between"><span>Seized slider clean-up</span><span className="font-semibold text-brand-light">£20-40</span></div>
                            <div className="flex justify-between"><span>Brake fluid service</span><span className="font-semibold text-brand-light">£75-110</span></div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* ─── Rear brake warning - with corrosion photo ─── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center reveal">
                        <div className="overflow-hidden rounded-2xl">
                            <OptimizedImage
                                src="/images/new-images/sprinter-brakes-03.jpg"
                                alt="Corroded brake caliper slider pin removed from Mercedes van"
                                className="w-full object-cover rounded-2xl"
                            />
                            <p className="mt-2 text-xs text-text-muted text-center">Corroded slider pin - common on W447 Vitos exposed to road salt</p>
                        </div>
                        <div>
                            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-6">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
                                    <div>
                                        <h3 className="font-bold text-text-primary">Rear brake note</h3>
                                        <p className="mt-1 text-sm text-text-secondary">
                                            Rear brake assemblies can corrode on W447 Vitos, especially those exposed to road salt. We assess condition before starting and will quote any additional time honestly. No hidden costs.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-lg font-bold text-text-primary">When workshop referral may be needed</h3>
                                <ul className="mt-3 space-y-2">
                                    {[
                                        'Heavily corroded rear assemblies beyond mobile repair',
                                        'Brake caliper rebuild or replacement',
                                        'ABS hydraulic unit faults',
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
                </div>
            </Section>

            {/* ─── Common symptoms ─── */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6 sm:p-8 reveal">
                        <h2 className="text-xl font-bold text-text-primary">Common brake symptoms</h2>
                        <p className="mt-2 text-sm text-text-secondary">Not sure if your Vito needs brakes? Look out for:</p>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                                'Squealing or grinding when braking',
                                'Brake wear warning on the dash',
                                'Pulsating brake pedal',
                                'Pulling to one side',
                                'Soft or spongy pedal feel',
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
                    <Notice variant="info">We carry diagnostic equipment on every visit. Brake-related fault codes or ABS issues can be diagnosed at the same time - no second visit needed.</Notice>
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

            {/* ─── FOOTER CTA ─── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <OptimizedImage src="/images/new-images/sprinter-brakes-05.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 to-brand/80" />
                </div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
                    <div className="text-center reveal">
                        <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl">Vito brakes need attention?</h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Get a fixed-price brake quote - fitted at your door.</p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackBookNowClick('vito_brakes_footer')}>Book Online</CTAButton>
                            <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="ghost" size="lg" external icon={<MessageCircle className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackWhatsAppLead('vito_brakes')}>WhatsApp Us</CTAButton>
                            <CTAButton href={`tel:${siteConfig.contact.phoneE164}`} variant="ghost" size="lg" external icon={<Phone className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackPhoneLead('vito_brakes')}>{siteConfig.contact.phoneDisplay}</CTAButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
