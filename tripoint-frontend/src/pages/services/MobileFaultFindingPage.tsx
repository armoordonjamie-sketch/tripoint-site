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
import { OptimizedImage } from '@/components/OptimizedImage';

const photos = [galleryImages[22], galleryImages[2], galleryImages[47], galleryImages[30], galleryImages[4]];
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
    {
        question: 'What vehicles do you diagnose?',
        answer:
            'We specialise in Mercedes Sprinter, Vito, Citan, and other Mercedes Truck and Van platforms. We also work on Mercedes cars where Xentry applies. We use dealer-level STAR/XENTRY diagnostics.',
    },
    {
        question: 'Do you come to me?',
        answer:
            'Yes. We are a mobile service. We come to your home, workplace, or depot. No workshop drop-off. We cover Kent and South East London. Check our areas covered for your location.',
    },
    {
        question: 'What if the fault is intermittent?',
        answer:
            'We document what we have checked and use live data where possible. Intermittent faults can need multiple visits or longer monitoring. We will give you an honest assessment and next steps.',
    },
    {
        question: 'How long does a fault finding visit take?',
        answer:
            'Our standard diagnostic callout includes up to 60 minutes on-site. If we need longer, we will discuss it with you. Follow-on labour is billed in 15-minute increments.',
    },
];

const crossSell = [
    { title: 'Mercedes XENTRY Diagnostics', desc: 'Dealer-level Mercedes diagnostics and coding', href: '/services/mercedes-xentry-diagnostics-coding' },
    { title: 'Diagnostic Callout', desc: 'General fault diagnosis', href: '/services/diagnostic-callout' },
    { title: 'Intermittent Electrical', desc: 'Wiring and electrical faults', href: '/services/intermittent-electrical-faults' },
];

export function MobileFaultFindingPage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo
                title="Mobile Fault Finding"
                description="Professional mobile fault finding for Mercedes and commercial vehicles. Dealer-level diagnostics at your location across Kent and South East London. From £120."
                canonical="/services/mobile-fault-finding"
            />
            <ServiceSchema name="Mobile Fault Finding" description="Professional mobile fault finding for Mercedes and commercial vehicles. Dealer-level diagnostics at your location." url="/services/mobile-fault-finding" priceFrom={zoneA} />
            <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Mobile Fault Finding', url: '/services/mobile-fault-finding' }]} />
            <FaqPageSchema items={faqs} />

            <section className="relative h-56 sm:h-72 overflow-hidden">
                <OptimizedImage src="/images/diagnostic-callout.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/30" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                    <div className="mx-auto max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Mobile Service</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">Mobile Fault Finding</h1>
                    </div>
                </div>
            </section>

            <Section>
                <div className="mx-auto max-w-3xl">
                    <p className="text-xl text-text-secondary leading-relaxed">
                        Professional mobile fault finding for Mercedes and commercial vehicles. We bring dealer-level STAR/XENTRY diagnostics to your location across Kent and South East London. No workshop drop-off. Compliance-first approach.
                    </p>

                    <div className="mt-10 rounded-2xl border border-brand/20 bg-brand/5 p-6 reveal">
                        <h2 className="text-lg font-bold text-text-primary">What&apos;s Included</h2>
                        <ul className="mt-4 space-y-2">
                            {['Full-system scan and fault code analysis', 'Live data and guided component tests', 'Written findings and fix plan', 'Up to 60 minutes on-site', 'Mobile service at your location'].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-10 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Why Choose TriPoint Diagnostics</h2>
                        <p className="mt-2 text-text-secondary">
                            Dealer-level tooling, compliance-first diagnostics, mobile convenience, and clear communication. We serve {siteConfig.coverageTowns.slice(0, 5).join(', ')} and the wider Kent and South East London area. See our <Link to="/areas-covered" className="text-brand hover:underline">areas covered</Link>.
                        </p>
                    </div>

                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Examples From Our Work</h2>
                        <div className="mt-4"><PhotoGallery images={photos} columns={3} /></div>
                    </div>

                    <div className="mt-10 flex flex-wrap gap-3 reveal">
                        <CTAButton href="/booking" size="md" onClick={() => trackEvent('click_book_now', { location: 'mobile_fault_finding' })}>Book Now</CTAButton>
                        <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="outline" size="md" external icon={<MessageCircle className="h-4 w-4" />} onClick={() => trackEvent('click_whatsapp', { location: 'mobile_fault_finding' })}>WhatsApp Us</CTAButton>
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
                            <CTAButton href="/booking" size="sm" onClick={() => trackEvent('click_book_now', { location: 'mobile_fault_finding' })}>Book Now</CTAButton>
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
                    <OptimizedImage src="/images/cta-bg.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 to-brand/80" />
                </div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
                    <div className="text-center reveal">
                        <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">Mobile fault finding at your location.</h2>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackEvent('click_book_now', { location: 'mobile_fault_finding_footer' })}>Book Now</CTAButton>
                            <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="ghost" size="lg" external icon={<MessageCircle className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackEvent('click_whatsapp', { location: 'mobile_fault_finding' })}>WhatsApp Us</CTAButton>
                            <CTAButton href={`tel:${siteConfig.contact.phoneE164}`} variant="ghost" size="lg" external icon={<Phone className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10">{siteConfig.contact.phoneDisplay}</CTAButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
