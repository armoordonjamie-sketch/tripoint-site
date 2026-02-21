import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { trackEvent } from '@/lib/analytics';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { PhotoGallery } from '@/components/PhotoGallery';
import { Notice } from '@/components/Notice';
import { FaqAccordion } from '@/components/FaqAccordion';
import { CheckCircle2, XCircle, ArrowRight, Phone, MessageCircle, Clock } from 'lucide-react';
import { galleryImages } from '@/data/galleryImages';
import { siteConfig } from '@/config/site';

const vorPhotos = [
    galleryImages[0],
    galleryImages[30],
    galleryImages[7],
    galleryImages[38],
    galleryImages[29],
    galleryImages[3],
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

const vorService = siteConfig.pricing.services.find((s) => s.slug === 'vor-triage');
const zoneA = vorService?.zoneA ?? 160;
const zoneB = vorService?.zoneB ?? 175;
const zoneC = vorService?.zoneC ?? 190;

const faqs = [
    {
        question: 'How fast can you get to me?',
        answer:
            'VOR gets priority scheduling - we confirm you as the next available slot. For same-day or next-day triage, WhatsApp us first; we can often fit you in faster than the online booking form allows.',
    },
    {
        question: 'What if it needs parts?',
        answer:
            'We\'ll tell you straight away. Our triage decision is: fix now / parts needed / workshop referral. If parts are needed, we\'ll document exactly what\'s required and give you a timeline. No stringing you along.',
    },
    {
        question: 'Do you cover fleet vehicles?',
        answer:
            'Yes. We work with owner-driver couriers, SME fleets, hire branches, and depot operators. For fleets, we can discuss documented outcomes, rentable/not-rentable decisions, and preventive scan sweeps.',
    },
    {
        question: 'What\'s the deposit?',
        answer:
            'VOR deposits are £50 for all zones (Zone A, B, and C). Reschedule free with 24 hours notice - your deposit carries over. Late cancellation or no-show retains the deposit.',
    },
];

const crossSell = [
    { title: 'Diagnostic Callout', desc: 'Standard diagnostic - no urgency', href: '/services/diagnostic-callout' },
    { title: 'Emissions Diagnostics', desc: 'AdBlue, DPF, NOx diagnosis and repair', href: '/services/emissions-diagnostics' },
];

export function VorTriagePage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo
                title="VOR / Priority Triage"
                description="Vehicle Off Road priority diagnostic service for commercial vehicles. Fast triage and back-on-road decisions. From £160."
                canonical="/services/vor-triage"
            />

            {/* Hero banner */}
            <section className="relative h-56 sm:h-72 overflow-hidden">
                <img src="/images/vor-triage.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/30" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                    <div className="mx-auto max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Service</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                            VOR / Priority Triage
                        </h1>
                    </div>
                </div>
            </section>

            <Section>
                <div className="mx-auto max-w-3xl">
                    {/* Urgency-first intro */}
                    <p className="text-xl text-text-secondary leading-relaxed">
                        Every hour your van is off the road costs you money. We get it. Whether you&apos;re an owner-driver missing deliveries, a hire branch with a vehicle stuck in the yard, or a fleet operator with downtime burning a hole in your budget - you need a fast, clear answer. VOR (Vehicle Off Road) triage gives you priority scheduling and a documented &ldquo;back-on-road&rdquo; decision: fix now, parts needed, or workshop referral. No waffle, no &ldquo;we&apos;ll have to see&rdquo; - a proper triage so you can plan.
                    </p>

                    {/* Cost of downtime callout */}
                    <div className="mt-8 rounded-2xl border border-warning/30 bg-warning/10 p-6 reveal">
                        <div className="flex items-start gap-3">
                            <Clock className="h-6 w-6 shrink-0 text-warning" />
                            <div>
                                <h3 className="font-bold text-text-primary">Why speed matters</h3>
                                <p className="mt-2 text-text-secondary">
                                    A van off the road isn&apos;t just inconvenient - it&apos;s lost revenue, missed jobs, and stressed customers. The sooner you know whether it&apos;s a quick fix, a parts order, or a workshop job, the sooner you can get back to business. That&apos;s what VOR triage is for.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Is this the right service? */}
                    <div className="mt-10 rounded-2xl border border-brand/20 bg-brand/5 p-6 reveal">
                        <h2 className="text-lg font-bold text-text-primary">Is this the right service for you?</h2>
                        <p className="mt-2 text-text-secondary">
                            Yes, if your vehicle is off the road and you need a fast back-on-road decision. Owner-driver couriers, delivery fleets, hire branches, depot operators - if downtime costs you money, this is the one. If you have a warning light but the vehicle is still drivable, our standard <Link to="/services/diagnostic-callout" className="text-brand hover:underline">Diagnostic Callout</Link> may be enough. For AdBlue or emissions faults, see <Link to="/services/emissions-diagnostics" className="text-brand hover:underline">Emissions Diagnostics</Link>.
                        </p>
                    </div>

                    {/* Who it's for */}
                    <div className="mt-10 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Who It&apos;s For</h2>
                        <p className="mt-2 text-text-secondary">
                            Owner-driver couriers, delivery fleets, hire branches, and any commercial operator where a vehicle off the road means lost revenue. If downtime costs you money, this is the service to book.
                        </p>
                    </div>

                    {/* Common Scenarios */}
                    <div className="mt-8 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Common Scenarios</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'Van in limp mode mid-route or at depot',
                                'No-start / won\'t crank scenarios',
                                'AdBlue countdown blocking start',
                                'Electrical fault preventing operation',
                                'Returned hire vehicle with warning lights',
                                'Fleet vehicle needs urgent assessment',
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
                                'Everything in Standard Diagnostic Callout',
                                'Priority scheduling - confirmed as the next available slot',
                                '"Back-on-road" triage decision: fix now / parts needed / workshop referral',
                                'Clear documented outcome with repair timeline',
                                'Up to 75 minutes on-site time',
                            ].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Mid-page CTA - WhatsApp emphasis */}
                    <div className="mt-10 flex flex-wrap gap-3 reveal">
                        <CTAButton
                            href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                            size="md"
                            external
                            icon={<MessageCircle className="h-4 w-4" />}
                            onClick={() => trackEvent('click_whatsapp', { location: 'vor_triage_mid' })}
                        >
                            WhatsApp for Fast Response
                        </CTAButton>
                        <CTAButton href="/booking" variant="outline" size="md" onClick={() => trackEvent('click_book_now', { location: 'vor_triage_mid' })}>
                            Book Online
                        </CTAButton>
                    </div>

                    {/* When Workshop Referral May Be Needed */}
                    <div className="mt-10 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">When Workshop Referral May Be Needed</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'Major mechanical failure requiring ramp access',
                                'Heavy drivetrain work beyond mobile scope',
                                'Specialist tooling or extended disassembly needed',
                            ].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* VOR Jobs We've Handled */}
                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">VOR Jobs We&apos;ve Handled</h2>
                        <p className="mt-2 text-sm text-text-muted">Real photos from priority commercial vehicle callouts</p>
                        <div className="mt-4">
                            <PhotoGallery images={vorPhotos} columns={3} />
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">How It Works</h2>
                        <div className="mt-6 space-y-6">
                            {[
                                { step: '01', title: 'Contact us - fast', desc: 'WhatsApp or call. Tell us your postcode, vehicle, and what\'s wrong. We confirm priority slot and price.' },
                                { step: '02', title: 'We arrive - next available', desc: 'You\'re in the queue as the next slot. We come to your depot, yard, or wherever the vehicle is.' },
                                { step: '03', title: 'Back-on-road decision', desc: 'Fix now / parts needed / workshop referral. Clear documented outcome so you can plan.' },
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
                        <p className="mt-2 text-sm text-text-muted">Includes priority scheduling and up to 75 mins on-site. Deposit £50 for all zones. Reschedule free with 24 hours notice.</p>
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
                        <p className="mt-1 text-sm text-text-secondary">Zone-based pricing - includes priority scheduling and up to 75 mins on-site</p>
                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                            <CTAButton
                                href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                                size="sm"
                                external
                                icon={<MessageCircle className="h-4 w-4" />}
                                onClick={() => trackEvent('click_whatsapp', { location: 'vor_triage' })}
                            >
                                WhatsApp for Fast Response
                            </CTAButton>
                            <CTAButton href="/pricing" variant="outline" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
                                Full Pricing
                            </CTAButton>
                            <CTAButton href="/booking" variant="outline" size="sm" onClick={() => trackEvent('click_book_now', { location: 'vor_triage' })}>
                                Book Online
                            </CTAButton>
                        </div>
                    </div>

                    <div className="mt-8 reveal">
                        <Notice variant="info">
                            VOR deposits are £50 for all zones. Reschedule free with 24 hours notice.
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
                            Van off the road?
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                            WhatsApp us for the fastest response - we&apos;ll get you a priority slot.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton
                                href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                                variant="secondary"
                                size="lg"
                                external
                                icon={<MessageCircle className="h-5 w-5" />}
                                onClick={() => trackEvent('click_whatsapp', { location: 'vor_triage_footer' })}
                            >
                                WhatsApp Us
                            </CTAButton>
                            <CTAButton href="/booking" variant="ghost" size="lg" className="text-white hover:text-white hover:bg-white/10" onClick={() => trackEvent('click_book_now', { location: 'vor_triage_footer' })}>
                                Book Online
                            </CTAButton>
                            <CTAButton
                                href={`tel:${siteConfig.contact.phoneE164}`}
                                variant="ghost"
                                size="lg"
                                external
                                icon={<Phone className="h-5 w-5" />}
                                className="text-white hover:text-white hover:bg-white/10"
                                onClick={() => trackEvent('click_phone_header', { location: 'vor_triage' })}
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
