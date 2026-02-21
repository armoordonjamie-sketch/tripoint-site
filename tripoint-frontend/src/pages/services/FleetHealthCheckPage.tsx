import { useEffect, useRef } from 'react';
import { Seo } from '@/components/Seo';
import { trackEvent } from '@/lib/analytics';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { Notice } from '@/components/Notice';
import { FaqAccordion } from '@/components/FaqAccordion';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Phone, MessageCircle } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { ServiceSchema, BreadcrumbSchema, FaqPageSchema } from '@/components/JsonLd';

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
    { question: 'How many vehicles can you cover?', answer: 'We typically work with small fleets of 3–15 vehicles, hire companies, and depot operators. Larger fleets - we can discuss by arrangement. Each vehicle gets a full scan and written report.' },
    { question: 'Do you offer retainer or monthly packages?', answer: 'Yes, by arrangement. We can discuss regular health checks, priority dispatch, or block booking. Contact us to discuss your fleet needs.' },
    { question: 'What\'s included in a fleet health check?', answer: 'Full diagnostic scan, fault code analysis, live data snapshot, and written report per vehicle. We flag issues before they become breakdowns.' },
];

const crossSell = [
    { title: 'Diagnostic Callout', desc: 'Single vehicle diagnosis', href: '/services/diagnostic-callout' },
    { title: 'VOR Van Diagnostics', desc: 'Off-road vehicle fast response', href: '/services/vor-van-diagnostics' },
];

export function FleetHealthCheckPage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo
                title="Fleet Diagnostic Health Check"
                description="Fleet diagnostic health checks - by arrangement. Small fleets (3–15 vehicles), hire companies, depot operators. Kent & SE London. Contact to discuss."
                canonical="/services/fleet-health-check"
            />
            <ServiceSchema name="Fleet Diagnostic Health Check" description="Fleet diagnostic health checks - by arrangement. Small fleets, hire companies, depot operators. Full scan and report per vehicle." url="/services/fleet-health-check" priceFrom={zoneA} />
            <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Fleet Health Check', url: '/services/fleet-health-check' }]} />
            <FaqPageSchema items={faqs} />

            <section className="relative h-56 sm:h-72 overflow-hidden">
                <img src="/images/diagnostic-callout.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/30" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                    <div className="mx-auto max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">By Arrangement</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">Fleet Diagnostic Health Check</h1>
                    </div>
                </div>
            </section>

            <Section>
                <div className="mx-auto max-w-3xl">
                    <p className="text-xl text-text-secondary leading-relaxed">
                        Small fleet? Hire company? Depot operator? We offer fleet diagnostic health checks by arrangement. Full scan and written report per vehicle - flag issues before they become breakdowns. Retainer or monthly packages available. Contact us to discuss your needs.
                    </p>

                    <div className="mt-10 reveal">
                        <Notice variant="info">
                            <strong>By arrangement.</strong> Fleet health checks are tailored to your fleet size and schedule. Contact us to discuss retainer, block booking, or one-off fleet visits.
                        </Notice>
                    </div>

                    <div className="mt-10 rounded-2xl border border-brand/20 bg-brand/5 p-6 reveal">
                        <h2 className="text-lg font-bold text-text-primary">Who It&apos;s For</h2>
                        <p className="mt-2 text-text-secondary">
                            Small fleets (3–15 vehicles), hire companies, depot operators, and businesses that want proactive diagnostics rather than reactive breakdown response. We come to your depot or location.
                        </p>
                    </div>

                    <div className="mt-10 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">What&apos;s Included</h2>
                        <ul className="mt-4 space-y-2">
                            {['Full diagnostic scan per vehicle', 'Fault code analysis and live data snapshot', 'Written report per vehicle', 'Flag issues before breakdown', 'By arrangement - retainer or block booking available'].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-10 flex flex-wrap gap-3 reveal">
                        <CTAButton href="/contact" size="md" onClick={() => trackEvent('click_contact', { location: 'fleet_health' })}>Contact Us</CTAButton>
                        <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="outline" size="md" external icon={<MessageCircle className="h-4 w-4" />} onClick={() => trackEvent('click_whatsapp', { location: 'fleet_health' })}>WhatsApp Us</CTAButton>
                    </div>

                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Pricing</h2>
                        <p className="mt-2 text-text-secondary">Pricing is based on our standard Diagnostic Callout zones, with volume discounts by arrangement. Contact us for a quote.</p>
                        <div className="mt-4 overflow-x-auto rounded-xl border border-border-default">
                            <table className="min-w-full">
                                <thead><tr className="border-b border-border-default bg-surface-alt"><th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Zone</th><th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Drive time</th><th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Per vehicle (guide)</th></tr></thead>
                                <tbody>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Zone A</td><td className="px-4 py-3 text-text-secondary">0–25 mins</td><td className="px-4 py-3 text-right font-semibold text-brand-light">£{zoneA}+</td></tr>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Zone B</td><td className="px-4 py-3 text-text-secondary">25–45 mins</td><td className="px-4 py-3 text-right font-semibold text-brand-light">£{zoneB}+</td></tr>
                                    <tr><td className="px-4 py-3 text-text-secondary">Zone C</td><td className="px-4 py-3 text-text-secondary">45–60 mins</td><td className="px-4 py-3 text-right font-semibold text-brand-light">£{zoneC}+</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-2 text-sm text-text-muted">Volume discounts by arrangement. Contact us to discuss.</p>
                    </div>

                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">FAQs</h2>
                        <div className="mt-6"><FaqAccordion items={faqs} /></div>
                    </div>

                    <div className="mt-12 rounded-2xl border border-brand/20 bg-brand/5 p-6 text-center reveal">
                        <p className="text-2xl font-bold text-text-primary">Fleet health checks by arrangement</p>
                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                            <CTAButton href="/contact" variant="outline" size="sm" icon={<ArrowRight className="h-4 w-4" />}>Contact Us</CTAButton>
                            <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} size="sm" external icon={<MessageCircle className="h-4 w-4" />} onClick={() => trackEvent('click_whatsapp', { location: 'fleet_health' })}>WhatsApp Us</CTAButton>
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
                        <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">Fleet health checks by arrangement.</h2>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/contact" variant="secondary" size="lg" onClick={() => trackEvent('click_contact', { location: 'fleet_health_footer' })}>Contact Us</CTAButton>
                            <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="ghost" size="lg" external icon={<MessageCircle className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackEvent('click_whatsapp', { location: 'fleet_health' })}>WhatsApp Us</CTAButton>
                            <CTAButton href={`tel:${siteConfig.contact.phoneE164}`} variant="ghost" size="lg" external icon={<Phone className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackEvent('click_phone_header', { location: 'fleet_health' })}>{siteConfig.contact.phoneDisplay}</CTAButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
