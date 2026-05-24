import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { trackNavClick, trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { PhotoGallery } from '@/components/PhotoGallery';
import { FaqAccordion } from '@/components/FaqAccordion';
import { Notice } from '@/components/Notice';
import { CheckCircle2, XCircle, ArrowRight, Phone, MessageCircle, Clock } from 'lucide-react';
import { galleryImages } from '@/data/galleryImages';
import { siteConfig } from '@/config/site';
import { ServiceSchema, BreadcrumbSchema, FaqPageSchema } from '@/components/JsonLd';
import { OptimizedImage } from '@/components/OptimizedImage';
import { VatLabel } from '@/components/VatLabel';

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

const vorService = siteConfig.pricing.services.find((s) => s.slug === 'vor-van-diagnostics');
const zoneA = vorService?.zoneA ?? 160;
const zoneB = vorService?.zoneB ?? 175;
const zoneC = vorService?.zoneC ?? 190;

const faqs = [
    { question: 'How fast can you get to me?', answer: 'VOR gets priority scheduling - we confirm you as the next available slot. For same-day or next-day triage, WhatsApp us first; we can often fit you in faster than the online booking form allows.' },
    { question: 'What if it needs parts?', answer: "We'll tell you straight away. Our triage decision is: fix now / parts needed / workshop referral. If parts are needed, we'll document exactly what's required and give you a timeline. No stringing you along." },
    { question: 'Do you cover fleet vehicles?', answer: 'Yes. We work with owner-driver couriers, SME fleets, hire branches, and depot operators. For fleets, we can discuss documented outcomes, rentable/not-rentable decisions, and preventive scan sweeps.' },
    {
        question: 'What counts as VOR for booking purposes?',
        answer: 'VOR (vehicle off road) is when your van cannot be driven safely or legally. Limp mode, no-start, drivetrain warning, brake faults, AdBlue countdown at zero, or any condition where the vehicle should not be on the road. If you are unsure, send us the symptoms via WhatsApp and we will tell you whether VOR Priority applies or whether Standard Diagnosis is the right fit.'
    },
    {
        question: 'How quickly can you attend a VOR call?',
        answer: 'We prioritise VOR bookings ahead of standard diagnostic visits. Same-day attendance is often possible depending on the time of booking and current diary. We will confirm a slot at the point of booking based on actual availability.'
    },
    {
        question: 'Can you start work on the same VOR visit if the fault is fixable on site?',
        answer: 'Yes, where the fault is within our mobile scope and the parts are available or can be sourced quickly. Sensor replacements, coding, regen procedures, software resets, and many electrical repairs are completed in the same visit. For parts that need ordering or work that needs a workshop, we provide a written outcome and a clear next step.'
    }
];

const crossSell = [
    { title: 'Standard Diagnosis', desc: 'Not urgent? Standard covers all faults.', href: '/services/diagnostic-callout' },
    { title: 'Pre-Purchase Health Check', desc: 'Buying a used vehicle? Check before you commit.', href: '/services/pre-purchase-digital-health-check' },
];

export function VorVanDiagnosticsPage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo
                title="VOR Diagnosis - Priority Commercial Vehicle Diagnostics"
                description="Vehicle Off Road priority diagnostic for vans and commercial vehicles. Fast triage and back-on-road decisions. Fleet, hire, depot. From £160 (ex. VAT)."
                canonical="/services/vor-van-diagnostics"
            />
            <ServiceSchema
                name="VOR Diagnosis"
                description="Vehicle Off Road priority diagnostic for vans and commercial vehicles. Fast triage, back-on-road decisions. Fleet, hire, depot."
                url="/services/vor-van-diagnostics"
                priceFrom={zoneA}
                offerCatalogItems={[
                    { name: 'VOR Diagnosis Zone A (0 to 25 minutes)', price: `${zoneA}.00`, priceCurrency: 'GBP', description: 'Priority triage and diagnostic scan' },
                    { name: 'VOR Diagnosis Zone B (25 to 45 minutes)', price: `${zoneB}.00`, priceCurrency: 'GBP', description: 'Priority triage and diagnostic scan' },
                    { name: 'VOR Diagnosis Zone C (45 to 60 minutes)', price: `${zoneC}.00`, priceCurrency: 'GBP', description: 'Priority triage and diagnostic scan' },
                ]}
            />
            <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'VOR Diagnosis', url: '/services/vor-van-diagnostics' }]} />
            <FaqPageSchema items={faqs} />

            <section className="relative h-56 sm:h-72 overflow-hidden">
                <OptimizedImage src="/images/vor-triage.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/30" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                    <div className="mx-auto max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Priority / Fleet</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">VOR Diagnosis</h1>
                    </div>
                </div>
            </section>

            <Section>
                <div className="mx-auto max-w-3xl">
                    <p className="text-xl text-text-secondary leading-relaxed">
                        Every hour your van is off the road costs you money. We get it. Whether you&apos;re an owner-driver missing deliveries, a hire branch with a vehicle stuck in the yard, or a fleet operator with downtime burning a hole in your budget - you need a fast, clear answer. VOR (Vehicle Off Road) van diagnostics gives you priority scheduling and a documented &ldquo;back-on-road&rdquo; decision: fix now, parts needed, or workshop referral. No waffle - a proper triage so you can plan.
                    </p>

                    <figure className="mt-8 overflow-hidden rounded-2xl border border-border-default reveal">
                        <div className="relative aspect-[16/10] h-56 sm:h-64">
                            <OptimizedImage
                                src="/images/new-images/xentry-on-mercedes-engine.jpg"
                                alt="Mercedes Xentry dealer diagnostics laptop connected for commercial van fault finding"
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        </div>
                        <figcaption className="border-t border-border-default bg-surface-alt px-4 py-3 text-sm text-text-secondary">
                            Dealer-level Xentry on site - the same guided tests and module access we use on Standard Diagnosis, with VOR priority when you&apos;re off the road.
                        </figcaption>
                    </figure>

                    <div className="mt-8 rounded-2xl border border-warning/30 bg-warning/10 p-6 reveal">
                        <div className="flex items-start gap-3">
                            <Clock className="h-6 w-6 shrink-0 text-warning" />
                            <div>
                                <h3 className="font-bold text-text-primary">Why speed matters</h3>
                                <p className="mt-2 text-text-secondary">
                                    A van off the road isn&apos;t just inconvenient - it&apos;s lost revenue, missed jobs, and stressed customers. The sooner you know whether it&apos;s a quick fix, a parts order, or a workshop job, the sooner you can get back to business. That&apos;s what VOR van diagnostics is for.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 rounded-2xl border border-brand/20 bg-brand/5 p-6 reveal">
                        <h2 className="text-lg font-bold text-text-primary">Is this the right service for you?</h2>
                        <p className="mt-2 text-text-secondary">
                            Yes, if your van or commercial vehicle is off the road and you need a fast back-on-road decision. Owner-driver couriers, delivery fleets, hire branches, depot operators - if downtime costs you money, this is the one. If you have a warning light but the vehicle is still drivable, our <Link to="/services/diagnostic-callout" className="text-brand hover:underline">Standard Diagnosis</Link> may be enough. AdBlue, DPF, and emissions faults are all covered under Standard Diagnosis.
                        </p>
                    </div>

                    <div className="mt-10 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Who It&apos;s For</h2>
                        <p className="mt-2 text-text-secondary">
                            Owner-driver couriers, delivery fleets, hire branches, depot operators, and any commercial operator where a van off the road means lost revenue. We specialise in Mercedes Sprinter, Vito, and other commercial van platforms. If downtime costs you money, this is the service to book.
                        </p>
                    </div>

                    <div className="mt-10 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Fleet &amp; Hire Scenarios</h2>
                        <p className="mt-2 text-text-secondary">
                            Hire branches need rentable/not-rentable decisions. Depot operators need documented outcomes for insurance or warranty. Fleet managers need repair timelines. We deliver clear, documented triage - so you can plan, not guess.
                        </p>
                    </div>

                    <div className="mt-8 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Common Scenarios</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'Van in limp mode mid-route or at depot',
                                "No-start / won't crank scenarios",
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

                    <div className="mt-8 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">What&apos;s Included</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'Everything in Standard Diagnosis',
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
                </div>
            </Section>

            {/* ── Written report reference ── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <Notice variant="info">
                        <Link to="/sample-diagnostic-report" className="font-semibold text-brand hover:underline">See what your written outcome looks like</Link> - Every VOR visit ends with a written report. Here is an example from a real visit.
                    </Notice>
                </div>
            </Section>

            <Section>
                <div className="mx-auto max-w-3xl">
                    <div className="mt-10 flex flex-wrap gap-3 reveal">
                        <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} size="md" external icon={<MessageCircle className="h-4 w-4" />} onClick={() => trackWhatsAppClick('vor_van_mid')}>WhatsApp for Fast Response</CTAButton>
                        <CTAButton href="/booking" variant="outline" size="md" onClick={() => trackNavClick('/booking', 'Book Online', 'vor_van_mid')}>Book Online</CTAButton>
                    </div>

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

                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">VOR Jobs We&apos;ve Handled</h2>
                        <p className="mt-2 text-sm text-text-muted">Real photos from priority commercial vehicle callouts</p>
                        <div className="mt-4"><PhotoGallery images={vorPhotos} columns={3} /></div>
                    </div>

                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">How It Works</h2>
                        <div className="mt-6 space-y-6">
                            {[
                                { step: '01', title: 'Contact us - fast', desc: "WhatsApp or call. Tell us your postcode, vehicle, and what's wrong. We confirm priority slot and price." },
                                { step: '02', title: 'We arrive - next available', desc: "You're in the queue as the next slot. We come to your depot, yard, or wherever the vehicle is." },
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

                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Pricing</h2>
                        <div className="mt-4 overflow-x-auto rounded-xl border border-border-default">
                            <table className="min-w-full">
                                <thead><tr className="border-b border-border-default bg-surface-alt"><th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Zone</th><th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Drive time</th><th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Price</th></tr></thead>
                                <tbody>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Zone A</td><td className="px-4 py-3 text-text-secondary">0-25 mins</td><td className="px-4 py-3 text-right font-semibold text-brand-light">£{zoneA}<VatLabel /></td></tr>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Zone B</td><td className="px-4 py-3 text-text-secondary">25-45 mins</td><td className="px-4 py-3 text-right font-semibold text-brand-light">£{zoneB}<VatLabel /></td></tr>
                                    <tr><td className="px-4 py-3 text-text-secondary">Zone C</td><td className="px-4 py-3 text-text-secondary">45-60 mins</td><td className="px-4 py-3 text-right font-semibold text-brand-light">£{zoneC}<VatLabel /></td></tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-2 text-sm text-text-muted">Includes priority scheduling and up to 75 mins on-site. Reschedule free with 24 hours notice.</p>
                    </div>

                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Frequently Asked Questions</h2>
                        <div className="mt-6"><FaqAccordion items={faqs} /></div>
                    </div>

                    {/* ─── Real example ─── */}
                    <div className="mt-12 reveal">
                        <h2 className="text-xl font-bold text-text-primary">A real example from a VOR callout</h2>
                        <div className="mt-4 rounded-xl border border-border-default bg-surface p-5">
                            <p className="text-sm text-text-secondary leading-relaxed">
                                2020 Mercedes Sprinter W907 OM651, 142,000 miles. Multi-drop courier stuck at depot with a 'no start' condition and engine management light. Arrived on-site within 2 hours. Xentry scan revealed a hard fault for the crankshaft position sensor (no RPM signal during cranking). Sensor replaced from van stock, fault cleared, and vehicle returned to the road within 45 minutes of arrival. Written findings report issued to the fleet manager for their maintenance records.
                            </p>
                        </div>
                        <p className="mt-4 text-sm text-text-secondary">
                            Every VOR diagnosis ends with a clear documented outcome. <Link to="/sample-diagnostic-report" className="font-semibold text-brand hover:underline">See an example of our documentation standard.</Link>
                        </p>
                    </div>

                    {/* Related reading and coverage */}
                    <div className="mt-10 reveal">
                        <h2 className="text-xl font-bold text-text-primary">Related reading and coverage</h2>
                        <ul className="mt-4 space-y-3">
                            {[
                                { label: 'Sprinter limp mode: what a proper diagnostic looks like', href: '/blog/sprinter-limp-mode-proper-diagnostic' },
                                { label: 'AdBlue countdown: why clearing codes is not a fix', href: '/blog/adblue-countdown-clearing-codes-not-fix' },
                                { label: 'Coverage: Kent and South East London service area', href: '/areas-covered' },
                            ].map((item) => (
                                <li key={item.href}>
                                    <Link
                                        to={item.href}
                                        className="inline-flex items-center gap-2 text-sm text-brand hover:underline"
                                        onClick={() => trackNavClick(item.href, item.label, 'vor_van_fault_guides')}
                                    >
                                        <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-12 rounded-2xl border border-brand/20 bg-brand/5 p-6 text-center reveal">
                        <p className="text-2xl font-bold text-text-primary">From <span className="text-brand-light">£{zoneA}<VatLabel /></span></p>
                        <p className="mt-1 text-sm text-text-secondary">Zone-based pricing - includes priority scheduling and up to 75 mins on-site</p>
                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                            <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} size="sm" external icon={<MessageCircle className="h-4 w-4" />} onClick={() => trackWhatsAppClick('vor_van')}>WhatsApp for Fast Response</CTAButton>
                            <CTAButton href="/pricing" variant="outline" size="sm" icon={<ArrowRight className="h-4 w-4" />}>Full Pricing</CTAButton>
                            <CTAButton href="/booking" variant="outline" size="sm" onClick={() => trackNavClick('/booking', 'Book Online', 'vor_van')}>Book Online</CTAButton>
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

            {/* ── Coverage ── */}
            <Section className="bg-surface-alt/30 border-t border-border-default pt-12 pb-12">
                <div className="mx-auto max-w-5xl reveal text-center">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-brand mb-4">We cover</h2>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-3 md:gap-x-6">
                        {[
                            { name: 'Greenwich', to: '/areas-covered/greenwich' },
                            { name: 'Bexley', to: '/areas-covered/bexley' },
                            { name: 'Orpington', to: '/areas-covered/orpington' },
                            { name: 'Maidstone', to: '/areas-covered/maidstone' },
                            { name: 'Tonbridge', to: '/areas-covered/tonbridge' },
                            { name: 'Gillingham and Medway', to: '/areas-covered/medway' },
                        ].map((area, i) => (
                            <div key={area.name} className="flex items-center gap-x-4 md:gap-x-6">
                                <Link to={area.to} className="text-base font-medium text-text-primary hover:text-brand transition-colors">
                                    {area.name}
                                </Link>
                                {i < 5 && <span className="hidden md:inline-block text-border-default select-none">&bull;</span>}
                            </div>
                        ))}
                    </div>
                    <p className="mt-6 text-sm text-text-muted">
                        Mobile across Kent and South East London. <Link to="/pricing" className="text-brand hover:underline">Check your zone on the pricing page.</Link>
                    </p>
                </div>
            </Section>

            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <OptimizedImage src="/images/cta-bg.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 to-brand/80" />
                </div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
                    <div className="text-center reveal">
                        <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">Van off the road?</h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">WhatsApp us for the fastest response - we&apos;ll get you a priority slot.</p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="secondary" size="lg" external icon={<MessageCircle className="h-5 w-5" />} onClick={() => trackWhatsAppClick('vor_van_footer')}>WhatsApp Us</CTAButton>
                            <CTAButton href="/booking" variant="ghost" size="lg" className="text-white hover:text-white hover:bg-white/10" onClick={() => trackNavClick('/booking', 'Book Online', 'vor_van_footer')}>Book Online</CTAButton>
                            <CTAButton href={`tel:${siteConfig.contact.phoneE164}`} variant="ghost" size="lg" external icon={<Phone className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackPhoneClick('vor_van')}>{siteConfig.contact.phoneDisplay}</CTAButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
