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
    { question: 'Will you force a regen on my DPF?', answer: 'We diagnose first. If soot load and conditions are safe, we can run a forced regen. If not - high soot, oil contamination, or underlying faults - we won\'t. Forcing a regen when it\'s unsafe can cause damage. We check, then decide.' },
    { question: 'Do you offer DPF delete?', answer: 'No - we diagnose and repair DPF faults properly.' },
    { question: 'What if a regen isn\'t safe?', answer: 'We\'ll give you a clear written report: what we found, why regen isn\'t recommended, and what the next step is (workshop, replacement, etc). No guesswork - you get a proper decision.' },
    { question: 'Is this a regen-only service?', answer: 'No. This is a diagnostic decision visit. We assess whether regen is safe and appropriate. If it is, we can do it. If not, we tell you why and what to do next. Diagnose first, regen only if safe.' },
];

const crossSell = [
    { title: 'Emissions Diagnostics', desc: 'AdBlue, DPF, NOx diagnosis and repair', href: '/services/emissions-diagnostics' },
    { title: 'AdBlue Countdown', desc: 'AdBlue and SCR issues', href: '/services/adblue-countdown' },
];

export function DpfRegenerationDecisionPage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo
                title="DPF Warning Light Diagnostic"
                description="DPF warning light? We diagnose first - regen only if safe. Professional mobile diagnostics across Kent & SE London. From £170."
                canonical="/services/dpf-regeneration-decision"
            />
            <ServiceSchema name="DPF Warning Light Diagnostic" description="Diagnose DPF faults first - forced regen only if safe. Soot load, oil level, temperature checks. Written outcome." url="/services/dpf-regeneration-decision" priceFrom={zoneA} />
            <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'DPF Regeneration Decision', url: '/services/dpf-regeneration-decision' }]} />
            <FaqPageSchema items={faqs} />

            <section className="relative h-56 sm:h-72 overflow-hidden">
                <img src="/images/emissions-diagnostics.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/30" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                    <div className="mx-auto max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Diagnose First</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">DPF Warning Light Diagnostic</h1>
                    </div>
                </div>
            </section>

            <Section>
                <div className="mx-auto max-w-3xl">
                    <p className="text-xl text-text-secondary leading-relaxed">
                        DPF light on? Failed regen? Soot load building? We don&apos;t just force a regen and hope. We diagnose first: soot load, oil level, temperatures, underlying faults. If a regen is safe, we do it. If not, we tell you why and what to do next.
                    </p>

                    <div className="mt-10 rounded-2xl border border-brand/20 bg-brand/5 p-6 reveal">
                        <h2 className="text-lg font-bold text-text-primary">Is this the right service for you?</h2>
                        <p className="mt-2 text-text-secondary">
                            Yes, if you have a DPF warning light, failed forced regen, or soot load concerns. This is a <strong>diagnostic decision visit</strong> - we assess whether regen is safe before doing it. We are not a &quot;regen-only&quot; service. For broader emissions (AdBlue, NOx), see our <Link to="/services/emissions-diagnostics" className="text-brand hover:underline">Emissions Diagnostics</Link> hub.
                        </p>
                    </div>

                    <div className="mt-10 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Typical Causes We Find</h2>
                        <ul className="mt-4 space-y-2">
                            {['Excessive soot load (short trips, failed passive regen)', 'DPF pressure sensor faults', 'Exhaust temperature sensor issues', 'Oil contamination (overfilled, wrong spec)', 'Underlying EGR or turbo faults', 'Physical DPF damage or blockage'].map((s) => (
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
                        <CTAButton href="/booking" size="md" onClick={() => trackEvent('click_book_now', { location: 'dpf_regen' })}>Book Now</CTAButton>
                        <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="outline" size="md" external icon={<MessageCircle className="h-4 w-4" />} onClick={() => trackEvent('click_whatsapp', { location: 'dpf_regen' })}>WhatsApp Us</CTAButton>
                    </div>

                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">What We Do</h2>
                        <ul className="mt-4 space-y-2">
                            {['Full scan and DPF fault code analysis', 'Soot load, pressure differential, temperature checks', 'Regen safety gating - we check before forcing', 'Written findings and decision (regen / workshop / next step)', 'Up to 90 mins on-site'].map((s) => (
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
                            <CTAButton href="/booking" size="sm" onClick={() => trackEvent('click_book_now', { location: 'dpf_regen' })}>Book Now</CTAButton>
                        </div>
                    </div>

                    <div className="mt-12 reveal">
                        <h2 className="text-xl font-bold text-text-primary">Related Articles</h2>
                        <div className="mt-4">
                            <Link to="/blog/dpf-warning-light-regen-vs-worse" className="flex items-center justify-between rounded-xl border border-border-default bg-surface-alt p-4 transition-all hover:border-brand/30 hover:bg-brand/5">
                                <span className="font-semibold text-text-primary">DPF Warning Lights: When Regen Helps vs When It Makes Things Worse</span>
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
                        <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">DPF light? Diagnose first, regen only if safe.</h2>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackEvent('click_book_now', { location: 'dpf_regen_footer' })}>Book Now</CTAButton>
                            <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="ghost" size="lg" external icon={<MessageCircle className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackEvent('click_whatsapp', { location: 'dpf_regen' })}>WhatsApp Us</CTAButton>
                            <CTAButton href={`tel:${siteConfig.contact.phoneE164}`} variant="ghost" size="lg" external icon={<Phone className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackEvent('click_phone_header', { location: 'dpf_regen' })}>{siteConfig.contact.phoneDisplay}</CTAButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
