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

const photos = [galleryImages[30], galleryImages[22], galleryImages[2], galleryImages[47]];
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
        question: 'What is ECU coding?',
        answer:
            'ECU coding configures vehicle control units. This includes adaptations (settings), SCN coding (software calibration), and variant coding. We use Mercedes STAR/XENTRY for dealer-level access.',
    },
    {
        question: 'What is variant coding?',
        answer:
            'Variant coding configures a control unit for the correct vehicle specification. For example, when fitting a replacement module, it must be coded to match the vehicle. We use Xentry for this.',
    },
    {
        question: 'Do you code after parts replacement?',
        answer:
            'Yes. When you fit a replacement ECU, module, or sensor that requires coding, we can carry out the coding mobile. We also do adaptations and initialisation where applicable.',
    },
    {
        question: 'Where do you offer ECU coding?',
        answer:
            'We are mobile across Kent and South East London. We cover Tonbridge, Sevenoaks, Bromley, Bexley, Greenwich, and the wider area. See our areas covered for your location.',
    },
];

const crossSell = [
    { title: 'Mercedes XENTRY Diagnostics', desc: 'Dealer-level Mercedes diagnostics and coding', href: '/services/mercedes-xentry-diagnostics-coding' },
    { title: 'Diagnostic Callout', desc: 'General fault diagnosis', href: '/services/diagnostic-callout' },
];

export function EcuCodingPage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo
                title="ECU Coding & Variant Coding"
                description="Mercedes ECU coding, adaptations, and variant coding. STAR/XENTRY dealer-level coding mobile across Kent and South East London. From £120."
                canonical="/services/ecu-coding-and-variant-coding"
            />
            <ServiceSchema name="ECU Coding & Variant Coding" description="Mercedes ECU coding, adaptations, variant coding. STAR/XENTRY dealer-level. Mobile." url="/services/ecu-coding-and-variant-coding" priceFrom={zoneA} />
            <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'ECU Coding & Variant Coding', url: '/services/ecu-coding-and-variant-coding' }]} />
            <FaqPageSchema items={faqs} />

            <section className="relative h-56 sm:h-72 overflow-hidden">
                <OptimizedImage src="/images/diagnostic-callout.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/30" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                    <div className="mx-auto max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Mercedes Specialist</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">ECU Coding & Variant Coding</h1>
                    </div>
                </div>
            </section>

            <Section>
                <div className="mx-auto max-w-3xl">
                    <p className="text-xl text-text-secondary leading-relaxed">
                        Mercedes ECU coding, adaptations, and variant coding. STAR/XENTRY dealer-level coding mobile across Kent and South East London. We code replacement modules, run adaptations, and carry out initialisation where applicable. See our <Link to="/areas-covered" className="text-brand hover:underline">areas covered</Link>.
                    </p>

                    <div className="mt-10 rounded-2xl border border-brand/20 bg-brand/5 p-6 reveal">
                        <h2 className="text-lg font-bold text-text-primary">What&apos;s Included</h2>
                        <ul className="mt-4 space-y-2">
                            {['SCN coding and adaptations', 'Variant coding for replacement modules', 'Module initialisation where applicable', 'Diagnostic callout pricing (coding add-on from £45)', 'Up to 60 minutes on-site', 'Written confirmation'].map((s) => (
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
                        <CTAButton href="/booking" size="md" onClick={() => trackEvent('click_book_now', { location: 'ecu_coding' })}>Book Now</CTAButton>
                        <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="outline" size="md" external icon={<MessageCircle className="h-4 w-4" />} onClick={() => trackEvent('click_whatsapp', { location: 'ecu_coding' })}>WhatsApp Us</CTAButton>
                    </div>

                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Pricing</h2>
                        <p className="mt-2 text-text-secondary">Coding uses our standard Diagnostic Callout pricing. Coding and adaptations may incur add-on charges from £45.</p>
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
                            <CTAButton href="/booking" size="sm" onClick={() => trackEvent('click_book_now', { location: 'ecu_coding' })}>Book Now</CTAButton>
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
                        <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">Mercedes ECU coding, mobile.</h2>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackEvent('click_book_now', { location: 'ecu_coding_footer' })}>Book Now</CTAButton>
                            <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="ghost" size="lg" external icon={<MessageCircle className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackEvent('click_whatsapp', { location: 'ecu_coding' })}>WhatsApp Us</CTAButton>
                            <CTAButton href={`tel:${siteConfig.contact.phoneE164}`} variant="ghost" size="lg" external icon={<Phone className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10">{siteConfig.contact.phoneDisplay}</CTAButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
