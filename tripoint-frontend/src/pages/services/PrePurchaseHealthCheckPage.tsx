import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { trackEvent } from '@/lib/analytics';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { PhotoGallery } from '@/components/PhotoGallery';
import { Notice } from '@/components/Notice';
import { FaqAccordion } from '@/components/FaqAccordion';
import { CheckCircle2, XCircle, ArrowRight, Phone, MessageCircle } from 'lucide-react';
import { galleryImages } from '@/data/galleryImages';
import { siteConfig } from '@/config/site';
import { ServiceSchema, BreadcrumbSchema, FaqPageSchema } from '@/components/JsonLd';

const prePurchasePhotos = [
    galleryImages[29],
    galleryImages[1],
    galleryImages[30],
    galleryImages[10],
    galleryImages[47],
    galleryImages[24],
];

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

const prePurchaseService = siteConfig.pricing.services.find((s) => s.slug === 'pre-purchase-digital-health-check');
const zoneA = prePurchaseService?.zoneA ?? 160;
const zoneB = prePurchaseService?.zoneB ?? 175;
const zoneC = prePurchaseService?.zoneC ?? 190;

const faqs = [
    {
        question: 'Can you come to a dealer?',
        answer:
            'Yes - we can meet you at the dealer. Book the health check for the dealer\'s address or postcode. We\'ll scan the vehicle before you sign. Some dealers are fine with it; others may require prior arrangement. Just let us know when booking.',
    },
    {
        question: 'What if the seller won\'t let you inspect?',
        answer:
            'That\'s a red flag. A legitimate seller with nothing to hide should have no problem with a diagnostic scan. If they refuse, we\'d recommend walking away - or at least getting an HPI check and service history verification elsewhere.',
    },
    {
        question: 'Is this a full mechanical inspection?',
        answer:
            'No. We focus on the digital health: fault codes, live data, DPF soot load, AdBlue quality, battery state. We don\'t inspect bodywork, structural integrity, tyres, brakes (beyond electronic data), or fluid condition unless specifically agreed. For a full mechanical inspection, you\'d need a specialist inspector.',
    },
    {
        question: 'Can I share the report with my insurer?',
        answer:
            'Yes. The report is a clear, documented summary of findings. You can share it with insurers, the seller, or other workshops. It\'s your record of what we found.',
    },
];

const hiddenIssues = [
    { title: 'Cleared fault codes', desc: 'Sellers can hide problems by clearing codes before you view. We check stored history and freeze frame data.' },
    { title: 'DPF problems', desc: 'High soot load or failed regens can mean expensive repairs. We check DPF status and AdBlue quality.' },
    { title: 'AdBlue issues masked', desc: 'Some dealers top up AdBlue or reset countdowns without fixing the root cause. We dig deeper.' },
    { title: 'Battery and electrical', desc: 'Weak batteries or parasitic draw can cause intermittent faults. We check battery state and key electrical parameters.' },
];

const sampleFindings = [
    'DPF at 85% soot load - regen recommended before purchase',
    'Stored fault codes for NOx sensor - cleared before sale',
    'AdBlue quality below spec - SCR system may need attention',
    'Battery state of health 45% - likely replacement soon',
];

const crossSell = [
    { title: 'Diagnostic Callout', desc: 'Got a fault after you\'ve bought? We diagnose it.', href: '/services/diagnostic-callout' },
];

export function PrePurchaseHealthCheckPage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo
                title="Pre-Purchase Digital Health Check"
                description="Professional pre-purchase vehicle inspection with deep scan and buyer risk summary. Know what you're buying before you commit. From £160."
                canonical="/services/pre-purchase-digital-health-check"
            />
            <ServiceSchema name="Pre-Purchase Digital Health Check" description="Professional pre-purchase vehicle inspection - deep scan, buyer risk summary. Know before you buy." url="/services/pre-purchase-digital-health-check" priceFrom={zoneA} />
            <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Pre-Purchase Digital Health Check', url: '/services/pre-purchase-digital-health-check' }]} />
            <FaqPageSchema items={faqs} />

            {/* Hero banner */}
            <section className="relative h-56 sm:h-72 overflow-hidden">
                <img src="/images/pre-purchase.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/30" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                    <div className="mx-auto max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Service</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                            Pre-Purchase Digital Health Check
                        </h1>
                    </div>
                </div>
            </section>

            <Section>
                <div className="mx-auto max-w-3xl">
                    {/* Buyer confidence intro */}
                    <p className="text-xl text-text-secondary leading-relaxed">
                        About to buy a used van? Don&apos;t hand over a penny until you know what you&apos;re getting. The seller says &ldquo;it&apos;s fine&rdquo; - but do you have proof? A pre-purchase health check gives you the data: a deep diagnostic scan with a buyer risk summary. Fault codes, DPF soot load, AdBlue quality, battery state - we dig into the digital side so you can negotiate with confidence, or walk away with your wallet intact.
                    </p>

                    {/* What could go wrong */}
                    <div className="mt-10 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">What Could Go Wrong</h2>
                        <p className="mt-2 text-text-secondary">
                            Buyers often miss these hidden issues. We check for them.
                        </p>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            {hiddenIssues.map((item) => (
                                <div key={item.title} className="rounded-xl border border-border-default bg-surface-alt p-4">
                                    <h3 className="font-semibold text-text-primary">{item.title}</h3>
                                    <p className="mt-1 text-sm text-text-secondary">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sample findings callout */}
                    <div className="mt-8 rounded-2xl border border-brand/20 bg-brand/5 p-6 reveal">
                        <h3 className="font-bold text-text-primary">Examples of what we&apos;ve caught for other buyers</h3>
                        <ul className="mt-4 space-y-2">
                            {sampleFindings.map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Is this the right service? */}
                    <div className="mt-10 rounded-2xl border border-brand/20 bg-brand/5 p-6 reveal">
                        <h2 className="text-lg font-bold text-text-primary">Is this the right service for you?</h2>
                        <p className="mt-2 text-text-secondary">
                            Yes, if you&apos;re buying a used vehicle - especially modern diesels, vans, or vehicles with complex electronics - and you want proof before you commit. Book at the seller&apos;s location before you agree to purchase. If you already own the vehicle and have a fault, see our <Link to="/services/diagnostic-callout" className="text-brand hover:underline">Diagnostic Callout</Link>.
                        </p>
                    </div>

                    {/* Who it's for */}
                    <div className="mt-10 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Who It&apos;s For</h2>
                        <p className="mt-2 text-text-secondary">
                            Anyone buying a used vehicle - especially modern diesels, vans, or vehicles with complex electronics. If the seller says &ldquo;it&apos;s fine&rdquo; but you want proof, we&apos;ll give you the data.
                        </p>
                    </div>

                    {/* When to Book */}
                    <div className="mt-8 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">When to Book</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'Before buying a used van or car from a dealer or private seller',
                                'When a vehicle has been sitting / low mileage and you suspect hidden issues',
                                'If the seller\'s history is patchy or missing',
                                'For fleet acquisitions where you need documented condition',
                                'When you want confidence before committing to a purchase',
                            ].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* What's included */}
                    <div className="mt-8 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">What&apos;s Included</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'Full-system diagnostic scan (all modules)',
                                'Key health indicators: DPF soot load, AdBlue quality, battery state, oil condition data',
                                'Fault code history and freeze frame analysis',
                                'Sensor plausibility and live data spot checks',
                                'Buyer risk summary: what you should know and what to negotiate on',
                                'Written report suitable for sharing with seller or insurer',
                                'Up to 75 minutes on-site time',
                            ].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Mid-page CTA */}
                    <div className="mt-10 flex flex-wrap gap-3 reveal">
                        <CTAButton href="/booking" size="md" onClick={() => trackEvent('click_book_now', { location: 'pre_purchase_health_check_mid' })}>
                            Book Now
                        </CTAButton>
                        <CTAButton
                            href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                            variant="outline"
                            size="md"
                            external
                            icon={<MessageCircle className="h-4 w-4" />}
                            onClick={() => trackEvent('click_whatsapp', { location: 'pre_purchase_health_check' })}
                        >
                            WhatsApp Us
                        </CTAButton>
                    </div>

                    {/* What This Isn't */}
                    <div className="mt-10 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">What This Isn&apos;t</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'Not a full mechanical inspection (we focus on the digital side)',
                                'Not a warranty or guarantee on the vehicle',
                                'Not a substitute for HPI check or service history verification',
                            ].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* What We Check - gallery */}
                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">What We Check</h2>
                        <p className="mt-2 text-sm text-text-muted">Real inspection photos from pre-purchase health checks</p>
                        <div className="mt-4">
                            <PhotoGallery images={prePurchasePhotos} columns={3} />
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">How It Works</h2>
                        <div className="mt-6 space-y-6">
                            {[
                                { step: '01', title: 'Book at the seller\'s location', desc: 'Book the health check for the address where the vehicle is. We come to you - and the seller.' },
                                { step: '02', title: 'We scan everything', desc: 'Full-system scan, live data, DPF soot load, AdBlue quality, battery state. We don\'t inspect bodywork or tyres - we focus on the digital health.' },
                                { step: '03', title: 'You get the data', desc: 'Written report with buyer risk summary. Negotiate with confidence, or walk away. You\'re in control.' },
                            ].map((s) => (
                                <div key={s.step} className="flex gap-4">
                                    <div className="step-number flex h-10 w-10 shrink-0 items-center justify-center text-sm font-bold">{s.step}</div>
                                    <div>
                                        <h3 className="font-semibold text-text-primary">{s.title}</h3>
                                        <p className="mt-1 text-sm text-text-secondary">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Inline pricing */}
                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Pricing</h2>
                        <div className="mt-4 overflow-x-auto rounded-xl border border-border-default">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-border-default bg-surface-alt">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Zone</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Drive time</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Zone A</td><td className="px-4 py-3 text-text-secondary">0–25 mins</td><td className="px-4 py-3 text-right font-semibold text-brand-light">£{zoneA}</td></tr>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Zone B</td><td className="px-4 py-3 text-text-secondary">25–45 mins</td><td className="px-4 py-3 text-right font-semibold text-brand-light">£{zoneB}</td></tr>
                                    <tr><td className="px-4 py-3 text-text-secondary">Zone C</td><td className="px-4 py-3 text-text-secondary">45–60 mins</td><td className="px-4 py-3 text-right font-semibold text-brand-light">£{zoneC}</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-2 text-sm text-text-muted">Includes travel and up to 75 mins on-site. Deposit £30 (Zone A/B) or £50 (Zone C).</p>
                    </div>

                    {/* FAQ */}
                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Frequently Asked Questions</h2>
                        <div className="mt-6">
                            <FaqAccordion items={faqs} />
                        </div>
                    </div>

                    {/* Pricing CTA */}
                    <div className="mt-12 rounded-2xl border border-brand/20 bg-brand/5 p-6 text-center reveal">
                        <p className="text-2xl font-bold text-text-primary">
                            From <span className="text-brand-light">£{zoneA}</span>
                        </p>
                        <p className="mt-1 text-sm text-text-secondary">Zone-based pricing - includes travel and up to 75 mins on-site</p>
                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                            <CTAButton href="/pricing" variant="outline" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
                                Full Pricing
                            </CTAButton>
                            <CTAButton href="/booking" size="sm" onClick={() => trackEvent('click_book_now', { location: 'pre_purchase_health_check' })}>
                                Book Now
                            </CTAButton>
                        </div>
                    </div>

                    <div className="mt-8 reveal">
                        <Notice variant="info">
                            Tip: Book the health check at the seller&apos;s location before you agree to purchase. It&apos;s much easier to negotiate (or walk away) with data in hand.
                        </Notice>
                    </div>

                    {/* Cross-sell */}
                    <div className="mt-12 reveal">
                        <h2 className="text-xl font-bold text-text-primary">Related Services</h2>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            {crossSell.map((s) => (
                                <Link
                                    key={s.href}
                                    to={s.href}
                                    className="flex items-center justify-between rounded-xl border border-border-default bg-surface-alt p-4 transition-all hover:border-brand/30 hover:bg-brand/5"
                                >
                                    <div>
                                        <h3 className="font-semibold text-text-primary">{s.title}</h3>
                                        <p className="text-sm text-text-secondary">{s.desc}</p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-brand" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            {/* Footer CTA banner */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img src="/images/cta-bg.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 to-brand/80" />
                </div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
                    <div className="text-center reveal">
                        <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                            Buying a used van?
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                            Get the data before you commit. Book a pre-purchase health check at the seller&apos;s location.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackEvent('click_book_now', { location: 'pre_purchase_health_check_footer' })}>
                                Book Now
                            </CTAButton>
                            <CTAButton
                                href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                                variant="ghost"
                                size="lg"
                                external
                                icon={<MessageCircle className="h-5 w-5" />}
                                className="text-white hover:text-white hover:bg-white/10"
                                onClick={() => trackEvent('click_whatsapp', { location: 'pre_purchase_health_check' })}
                            >
                                WhatsApp Us
                            </CTAButton>
                            <CTAButton
                                href={`tel:${siteConfig.contact.phoneE164}`}
                                variant="ghost"
                                size="lg"
                                external
                                icon={<Phone className="h-5 w-5" />}
                                className="text-white hover:text-white hover:bg-white/10"
                                onClick={() => trackEvent('click_phone_header', { location: 'pre_purchase_health_check' })}
                            >
                                {siteConfig.contact.phoneDisplay}
                            </CTAButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
