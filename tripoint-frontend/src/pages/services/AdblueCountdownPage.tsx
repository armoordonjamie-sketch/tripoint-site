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

const photos = [galleryImages[25], galleryImages[34], galleryImages[13], galleryImages[42], galleryImages[26]];
const emissionsService = siteConfig.pricing.services.find((s) => s.slug === 'emissions-diagnostics');
const zoneA = emissionsService?.zoneA ?? 170;
const zoneB = emissionsService?.zoneB ?? 185;
const zoneC = emissionsService?.zoneC ?? 200;

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
    { question: 'Can you just clear my AdBlue countdown?', answer: 'Clearing codes doesn\'t fix the fault - the countdown will return. We diagnose the underlying cause (NOx sensor, dosing module, quality issues) and carry out the proper repair.' },
    { question: 'Will you fit an AdBlue emulator or delete?', answer: 'No - we diagnose and repair AdBlue systems properly.' },
    { question: 'What causes AdBlue countdown to start?', answer: 'Common causes include NOx sensor faults, SCR catalytic efficiency issues, AdBlue quality/contamination, dosing module faults, tank heater problems, or wiring faults. We use live data and guided tests to identify the real cause.' },
    { question: 'How long does an AdBlue diagnosis take?', answer: 'Our Emissions Fault Decision Visit includes up to 90 minutes on-site. We run full scans, live data checks, and component verification. If parts are needed, we give you a clear written plan and quote.' },
];

const crossSell = [
    { title: 'Emissions Diagnostics', desc: 'AdBlue, DPF, NOx diagnosis and repair', href: '/services/emissions-diagnostics' },
    { title: 'NOx / SCR Diagnostics', desc: 'NOx sensor and SCR efficiency', href: '/services/nox-scr-diagnostics' },
];

export function AdblueCountdownPage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo
                title="AdBlue Countdown Fix"
                description="Professional AdBlue countdown diagnosis - NOx sensor, dosing module, quality issues. Root cause fix across Kent & SE London. From £170."
                canonical="/services/adblue-countdown"
            />
            <ServiceSchema name="AdBlue Countdown Fix" description="Professional AdBlue countdown diagnosis - identify root cause with live data. NOx sensor, dosing module, tank heater, quality." url="/services/adblue-countdown" priceFrom={zoneA} />
            <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'AdBlue Countdown', url: '/services/adblue-countdown' }]} />
            <FaqPageSchema items={faqs} />

            <section className="relative h-56 sm:h-72 overflow-hidden">
                <img src="/images/emissions-diagnostics.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/30" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                    <div className="mx-auto max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Emissions</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">AdBlue Countdown Fix</h1>
                    </div>
                </div>
            </section>

            <Section>
                <div className="mx-auto max-w-3xl">
                    <p className="text-xl text-text-secondary leading-relaxed">
                        AdBlue countdown ticking? &quot;Start Not Possible&quot; looming? We diagnose the root cause: NOx sensor faults, dosing module issues, tank heater problems, or AdBlue quality. Proper diagnosis, proper fix.
                    </p>

                    <div className="mt-10 rounded-2xl border border-brand/20 bg-brand/5 p-6 reveal">
                        <h2 className="text-lg font-bold text-text-primary">Is this the right service for you?</h2>
                        <p className="mt-2 text-text-secondary">
                            Yes, if your van or car has an AdBlue countdown, &quot;Start Not Possible&quot; warning, or AdBlue/SCR-related fault codes. For general emissions (DPF, NOx, SCR), see our <Link to="/services/emissions-diagnostics" className="text-brand hover:underline">Emissions Diagnostics</Link> hub.
                        </p>
                    </div>

                    <div className="mt-10 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Typical Causes We Find</h2>
                        <ul className="mt-4 space-y-2">
                            {['NOx sensor drift or fault', 'SCR catalytic efficiency issues', 'AdBlue dosing module faults', 'Tank heater or level sensor', 'AdBlue quality / contamination', 'Wiring or communication faults'].map((s) => (
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
                        <CTAButton href="/booking" size="md" onClick={() => trackEvent('click_book_now', { location: 'adblue_countdown' })}>Book Now</CTAButton>
                        <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="outline" size="md" external icon={<MessageCircle className="h-4 w-4" />} onClick={() => trackEvent('click_whatsapp', { location: 'adblue_countdown' })}>WhatsApp Us</CTAButton>
                    </div>

                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">What We Do</h2>
                        <ul className="mt-4 space-y-2">
                            {['Full emissions scan and fault code analysis', 'Live data - NOx values, AdBlue quality, dosing', 'Component verification (sensors, heaters, pumps)', 'Written findings and repair plan', 'Up to 90 mins on-site'].map((s) => (
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
                            <CTAButton href="/booking" size="sm" onClick={() => trackEvent('click_book_now', { location: 'adblue_countdown' })}>Book Now</CTAButton>
                        </div>
                    </div>

                    <div className="mt-12 reveal">
                        <h2 className="text-xl font-bold text-text-primary">Related Articles</h2>
                        <div className="mt-4">
                            <Link to="/blog/adblue-countdown-clearing-codes-not-fix" className="flex items-center justify-between rounded-xl border border-border-default bg-surface-alt p-4 transition-all hover:border-brand/30 hover:bg-brand/5">
                                <span className="font-semibold text-text-primary">AdBlue Countdown: Why Clearing Codes Isn&apos;t a Fix</span>
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
                        <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">AdBlue countdown? Fix it properly.</h2>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackEvent('click_book_now', { location: 'adblue_countdown_footer' })}>Book Now</CTAButton>
                            <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="ghost" size="lg" external icon={<MessageCircle className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackEvent('click_whatsapp', { location: 'adblue_countdown' })}>WhatsApp Us</CTAButton>
                            <CTAButton href={`tel:${siteConfig.contact.phoneE164}`} variant="ghost" size="lg" external icon={<Phone className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackEvent('click_phone_header', { location: 'adblue_countdown' })}>{siteConfig.contact.phoneDisplay}</CTAButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
