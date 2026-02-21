import { useEffect, useRef } from 'react';
import { Seo } from '@/components/Seo';
import { trackEvent } from '@/lib/analytics';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { PhotoGallery } from '@/components/PhotoGallery';

import { FaqAccordion } from '@/components/FaqAccordion';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Phone, MessageCircle } from 'lucide-react';
import { galleryImages } from '@/data/galleryImages';
import { siteConfig } from '@/config/site';
import { ServiceSchema, BreadcrumbSchema, FaqPageSchema } from '@/components/JsonLd';

const photos = [galleryImages[30], galleryImages[22], galleryImages[2], galleryImages[47], galleryImages[4]];
const diagnosticService = siteConfig.pricing.services.find((s) => s.slug === 'diagnostic-callout');
const zoneA = diagnosticService?.zoneA ?? 120;
const zoneB = diagnosticService?.zoneB ?? 135;
const zoneC = diagnosticService?.zoneC ?? 150;

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
    { question: 'What causes Sprinter limp mode?', answer: 'Common causes include turbo actuator faults, fuel rail pressure issues, EGR problems, boost leaks, and DPF-related faults. We use live data and guided tests to identify the root cause - not just code clearing.' },
    { question: 'Can you fix limp mode on-site?', answer: 'Often yes - if it\'s a sensor, actuator, or minor fault we can address mobile. If it needs major mechanical work or a ramp, we\'ll give you a clear written plan and workshop referral.' },
    { question: 'Do you work on W906 and W907 Sprinters?', answer: 'Yes. We have specialist experience with Mercedes Sprinter platforms including OM651 and OM654 engines. We use dealer-level diagnostic access where applicable.' },
    { question: 'What if it\'s an emissions fault?', answer: 'If the limp mode is triggered by AdBlue, DPF, or NOx faults, we diagnose and repair those too. See our Emissions Diagnostics service for details.' },
];

const crossSell = [
    { title: 'Emissions Diagnostics', desc: 'AdBlue, DPF, NOx diagnosis and repair', href: '/services/emissions-diagnostics' },
    { title: 'Diagnostic Callout', desc: 'General fault diagnosis', href: '/services/diagnostic-callout' },
];

export function SprinterLimpModePage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo
                title="Sprinter Limp Mode Diagnostic"
                description="Professional Sprinter limp mode diagnosis - turbo, rail pressure, EGR. Dealer-level mobile diagnostics across Kent & SE London. From £120."
                canonical="/services/sprinter-limp-mode"
            />
            <ServiceSchema name="Sprinter Limp Mode Diagnostic" description="Professional Sprinter limp mode diagnosis - identify root cause with live data and guided tests. Turbo actuator, fuel rail, EGR, boost leaks." url="/services/sprinter-limp-mode" priceFrom={zoneA} />
            <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Sprinter Limp Mode', url: '/services/sprinter-limp-mode' }]} />
            <FaqPageSchema items={faqs} />

            <section className="relative h-56 sm:h-72 overflow-hidden">
                <img src="/images/diagnostic-callout.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/30" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                    <div className="mx-auto max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Mercedes Specialist</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">Sprinter Limp Mode Diagnostic</h1>
                    </div>
                </div>
            </section>

            <Section>
                <div className="mx-auto max-w-3xl">
                    <p className="text-xl text-text-secondary leading-relaxed">
                        Reduced power? Speed limiter kicked in? Dashboard lit up? Sprinter limp mode is a protective response - the ECU has detected a fault and restricted performance. We identify the root cause with live data and guided tests, not just code clearing. Fix, don&apos;t mask.
                    </p>

                    <div className="mt-10 rounded-2xl border border-brand/20 bg-brand/5 p-6 reveal">
                        <h2 className="text-lg font-bold text-text-primary">Is this the right service for you?</h2>
                        <p className="mt-2 text-text-secondary">
                            Yes, if your Mercedes Sprinter (W906, W907, Vito W447) has gone into limp mode - reduced power, speed restriction, or warning lights. We diagnose the cause and provide a written fix plan. If the van is off the road and you need a fast decision, see our <Link to="/services/vor-van-diagnostics" className="text-brand hover:underline">VOR Van Diagnostics</Link>.
                        </p>
                    </div>

                    <div className="mt-10 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Typical Causes We Find</h2>
                        <ul className="mt-4 space-y-2">
                            {['Turbo actuator or boost control faults', 'Fuel rail pressure sensor or pump issues', 'EGR valve or cooler faults', 'Boost leaks or charge air path', 'DPF or emissions-related derating', 'Electrical or sensor faults'].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Examples From Our Work</h2>
                        <div className="mt-4"><PhotoGallery images={photos} columns={3} /></div>
                    </div>

                    <div className="mt-10 flex flex-wrap gap-3 reveal">
                        <CTAButton href="/booking" size="md" onClick={() => trackEvent('click_book_now', { location: 'sprinter_limp' })}>Book Now</CTAButton>
                        <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="outline" size="md" external icon={<MessageCircle className="h-4 w-4" />} onClick={() => trackEvent('click_whatsapp', { location: 'sprinter_limp' })}>WhatsApp Us</CTAButton>
                    </div>

                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">What We Do</h2>
                        <ul className="mt-4 space-y-2">
                            {['Full scan and fault code analysis', 'Live data - boost, rail pressure, EGR', 'Guided tests and actuations', 'Written findings and fix plan', 'Up to 60 mins on-site'].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Pricing</h2>
                        <div className="mt-4 overflow-x-auto rounded-xl border border-border-default">
                            <table className="min-w-full">
                                <thead><tr className="border-b border-border-default bg-surface-alt"><th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Zone</th><th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Drive time</th><th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Price</th></tr></thead>
                                <tbody>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Zone A</td><td className="px-4 py-3 text-text-secondary">0–25 mins</td><td className="px-4 py-3 text-right font-semibold text-brand-light">£{zoneA}</td></tr>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Zone B</td><td className="px-4 py-3 text-text-secondary">25–45 mins</td><td className="px-4 py-3 text-right font-semibold text-brand-light">£{zoneB}</td></tr>
                                    <tr><td className="px-4 py-3 text-text-secondary">Zone C</td><td className="px-4 py-3 text-text-secondary">45–60 mins</td><td className="px-4 py-3 text-right font-semibold text-brand-light">£{zoneC}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">FAQs</h2>
                        <div className="mt-6"><FaqAccordion items={faqs} /></div>
                    </div>

                    <div className="mt-12 rounded-2xl border border-brand/20 bg-brand/5 p-6 text-center reveal">
                        <p className="text-2xl font-bold text-text-primary">From <span className="text-brand-light">£{zoneA}</span></p>
                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                            <CTAButton href="/pricing" variant="outline" size="sm" icon={<ArrowRight className="h-4 w-4" />}>Full Pricing</CTAButton>
                            <CTAButton href="/booking" size="sm" onClick={() => trackEvent('click_book_now', { location: 'sprinter_limp' })}>Book Now</CTAButton>
                        </div>
                    </div>

                    <div className="mt-12 reveal">
                        <h2 className="text-xl font-bold text-text-primary">Related Articles</h2>
                        <div className="mt-4">
                            <Link to="/blog/sprinter-limp-mode-proper-diagnostic" className="flex items-center justify-between rounded-xl border border-border-default bg-surface-alt p-4 transition-all hover:border-brand/30 hover:bg-brand/5">
                                <span className="font-semibold text-text-primary">Sprinter Limp Mode: What a Proper Diagnostic Looks Like</span>
                                <ArrowRight className="h-5 w-5 text-brand" />
                            </Link>
                        </div>
                    </div>

                    <div className="mt-12 reveal">
                        <h2 className="text-xl font-bold text-text-primary">Related Services</h2>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            {crossSell.map((s) => (
                                <Link key={s.href} to={s.href} className="flex items-center justify-between rounded-xl border border-border-default bg-surface-alt p-4 transition-all hover:border-brand/30 hover:bg-brand/5">
                                    <div><h3 className="font-semibold text-text-primary">{s.title}</h3><p className="text-sm text-text-secondary">{s.desc}</p></div>
                                    <ArrowRight className="h-5 w-5 text-brand" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img src="/images/cta-bg.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 to-brand/80" />
                </div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
                    <div className="text-center reveal">
                        <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">Need a proper diagnosis?</h2>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackEvent('click_book_now', { location: 'sprinter_limp_footer' })}>Book Now</CTAButton>
                            <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="ghost" size="lg" external icon={<MessageCircle className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackEvent('click_whatsapp', { location: 'sprinter_limp' })}>WhatsApp Us</CTAButton>
                            <CTAButton href={`tel:${siteConfig.contact.phoneE164}`} variant="ghost" size="lg" external icon={<Phone className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackEvent('click_phone_header', { location: 'sprinter_limp' })}>{siteConfig.contact.phoneDisplay}</CTAButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
