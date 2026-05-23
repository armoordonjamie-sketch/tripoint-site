import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { trackNavClick, trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics';
import { getWhatsAppHref } from '@/lib/whatsappHref';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { PhotoGallery } from '@/components/PhotoGallery';
import { Notice } from '@/components/Notice';
import { FaqAccordion } from '@/components/FaqAccordion';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, ArrowRight, Phone, MessageCircle, AlertTriangle, Zap, Gauge, Cpu, Truck } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { ServiceSchema, BreadcrumbSchema, FaqPageSchema } from '@/components/JsonLd';
import { OptimizedImage } from '@/components/OptimizedImage';
import { ExpandableReportImage } from '@/components/ExpandableReportImage';
import { VatLabel } from '@/components/VatLabel';
import { ServicingHero } from '@/components/servicing/ServicingHero';
import { DiagnosticProofStrip } from '@/components/services/DiagnosticProofStrip';
import { ZonePriceCards } from '@/components/services/ZonePriceCards';
import {
    DiagnosticCoverageAccordion,
    type DiagnosticCategory,
} from '@/components/services/DiagnosticCoverageAccordion';
import { pickDiagPhotos } from '@/data/diagPhotos';

const diagnosticProofItems = pickDiagPhotos([
    'picoscope-multimeter',
    'smoke-leak-test',
    'multimeter-exhaust-pulse',
]);

const diagnosticPhotos = pickDiagPhotos([
    'picoscope-multimeter',
    'smoke-leak-test',
    'intake-manifold-blocked',
    'corroded-connector',
    'egr-pipe-oil',
    'intercooler-crack',
    'multimeter-exhaust-pulse',
    'can-piggyback-device',
    'sensor-sooted',
]);

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

const diagnosticService = siteConfig.pricing.services.find((s) => s.slug === 'diagnostic-callout');
const zoneA = diagnosticService?.zoneA ?? 120;
const zoneB = diagnosticService?.zoneB ?? 135;
const zoneC = diagnosticService?.zoneC ?? 150;

const zonePriceRows = [
    { zone: 'Zone A', driveTime: '0–25 mins', price: zoneA },
    { zone: 'Zone B', driveTime: '25–45 mins', price: zoneB },
    { zone: 'Zone C', driveTime: '45–60 mins', price: zoneC },
];

const symptomLinks = [
    { label: 'Warning light', href: '#warning-lights' },
    { label: 'AdBlue / DPF', href: '#emissions' },
    { label: 'Limp mode', href: '#limp-mode' },
    { label: 'Electrical', href: '#electrical' },
    { label: 'Xentry / coding', href: '#xentry' },
];

/* ---------- What We Diagnose ---------- */
const diagnosticCategories: DiagnosticCategory[] = [
    {
        id: 'warning-lights',
        icon: AlertTriangle,
        title: 'Warning Lights & Fault Codes',
        desc: 'Engine management light, ABS, ESP, glow plug, battery, and any other dashboard warning. We scan every module - not just the engine - to find the root cause, not just clear codes.',
        image: {
            src: '/images/diag_photos/multimeter-in-use.jpg',
            alt: 'Multimeter probing a sensor circuit on a Mercedes engine bay during live testing',
            caption: 'Live circuit testing on the actual sensor — not just a code read.',
        },
    },
    {
        id: 'emissions',
        icon: Gauge,
        title: 'Emissions, AdBlue & DPF',
        desc: 'AdBlue countdown, SCR/NOx sensor faults, DPF soot load and regen issues, EGR problems, and dosing unit failures. Live data testing, not just fault code reads - we identify whether you need a sensor, a regen, or a deeper repair.',
        image: {
            src: '/images/diag_photos/egr-pipe-oil.jpg',
            alt: 'Oil-contaminated EGR pipe pulled from a Mercedes diesel during emissions diagnosis',
            caption: 'Oil-contaminated EGR pipe — found via emissions diagnosis on a Mercedes diesel.',
        },
    },
    {
        id: 'limp-mode',
        icon: Truck,
        title: 'Limp Mode & Derate',
        desc: 'Turbo boost faults, fuel rail pressure issues, injector drift, EGR valve failures, and wiring faults that cause derate. Systematic testing to isolate the root cause - especially on Sprinters (W906/W907/W910).',
        image: {
            src: '/images/diag_photos/intercooler-crack.jpg',
            alt: 'Hairline crack found in a Sprinter intercooler — boost loss and limp mode cause',
            caption: 'Hairline intercooler crack — root cause of boost loss and a limp-mode derate.',
        },
    },
    {
        id: 'electrical',
        icon: Zap,
        title: 'Electrical & Wiring Faults',
        desc: 'Intermittent faults, parasitic battery drain, CAN network communication issues, connector corrosion, and random warning lights. We use oscilloscope and live data capture to replicate and trace faults.',
        image: {
            src: '/images/diag_photos/corroded-connector.jpg',
            alt: 'Corroded multi-pin connector traced as the cause of an intermittent CAN-bus fault',
            caption: 'Corroded multi-pin connector — root cause of an intermittent CAN-bus fault.',
        },
    },
    {
        id: 'xentry',
        icon: Cpu,
        title: 'Mercedes Xentry & OEM Coding',
        desc: 'Dealer-level Xentry access for SCN coding, variant coding, module adaptations, DAS guided tests, and initialisation. Used as part of Standard Diagnosis when OEM-level access is required.',
        image: {
            src: '/images/new-images/xentry-on-mercedes-engine.jpg',
            alt: 'Mercedes Xentry diagnostics connected to engine bay for guided tests and coding',
            caption: 'Dealer-level Xentry on site — guided tests, coding, and module access when OEM-level work is needed.',
        },
    },
];

/* ---------- FAQ ---------- */
const faqs = [
    {
        question: 'What if you can\'t find the fault?',
        answer:
            'We\'ll tell you honestly. If a fault is intermittent or needs specialist equipment we don\'t carry mobile, we\'ll document what we\'ve checked and refer you to an appropriate workshop with our findings. You still get a written outcome - no dead ends.',
    },
    {
        question: 'Do I need to be there?',
        answer:
            'Ideally yes - we like to discuss symptoms with you and may need the keys for guided tests. If you can\'t be there, we can work with someone you authorise (e.g. at a depot). Just let us know when booking.',
    },
    {
        question: 'What happens if parts are needed?',
        answer:
            'We\'ll quote you for the parts and labour before any work begins. We use genuine Mercedes parts. Follow-on labour after the included 60 minutes is £85/hour + VAT in 15-minute increments.',
    },
    {
        question: 'How long does it take?',
        answer:
            'The diagnostic visit is up to 60 minutes on-site. If we need additional time to investigate a complex fault, we\'ll discuss it with you first. Extra diagnostic time is billed at £85/hour + VAT in 15-minute blocks.',
    },
    {
        question: 'Do you diagnose cars as well as vans?',
        answer:
            'Yes. Standard Diagnosis covers Mercedes cars and vans, plus other makes. Our specialist focus is Mercedes commercial vehicles, but the diagnostic process and tooling works across the range.',
    },
    {
        question: 'What\'s the difference between Standard Diagnosis and VOR Diagnosis?',
        answer:
            'Standard Diagnosis is our core service for any vehicle with a fault or warning light - 24-hour notice, thorough investigation, written fix plan. VOR Diagnosis is for commercial vehicles that are off the road and need a fast back-on-road decision, with zero minimum notice and priority dispatch.',
    },
    {
        question: 'Can you do AdBlue / DPF / emissions diagnostics?',
        answer:
            'Yes - emissions, AdBlue, DPF, SCR, NOx, and EGR faults are all covered under Standard Diagnosis. We test with live data, not just fault code reads, so you get a proper root cause and clear next steps.',
    },
    {
        question: 'What about fleet vehicles?',
        answer:
            'Absolutely. We work with fleet operators, hire companies, and depot managers regularly. If you have multiple vehicles, we can arrange bulk diagnostic visits. Get in touch via WhatsApp or call to discuss.',
    },
];

const crossSell = [
    { title: 'VOR Diagnosis', desc: 'Van off the road? Need a fast decision?', href: '/services/vor-van-diagnostics' },
    { title: 'Pre-Purchase Health Check', desc: 'Buying a used vehicle? Check before you commit.', href: '/services/pre-purchase-digital-health-check' },
];

export function DiagnosticCalloutPage() {
    const scrollRef = useScrollReveal();
    const [searchParams] = useSearchParams();
    const fromMerged = searchParams.get('from') === 'merged';
    const [dismissMerged, setDismissMerged] = useState(false);

    return (
        <div ref={scrollRef}>
            <Seo
                title="Standard Diagnosis - Mobile Mercedes Diagnostics"
                description="Mobile diagnostic service for Mercedes cars and vans. Full-system scan with dealer tools (Xentry), live data, guided tests, and a written fix plan. From £120 (ex. VAT) - Kent & SE London."
                canonical="/services/diagnostic-callout"
            />
            <ServiceSchema name="Standard Diagnosis" description="Mobile diagnostic service - full-system scan with Mercedes dealer tools, live data validation, guided tests, written fix plan. Kent & SE London." url="/services/diagnostic-callout" priceFrom={zoneA} />
            <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Standard Diagnosis', url: '/services/diagnostic-callout' }]} />
            <FaqPageSchema items={faqs} />

            <ServicingHero
                heroSrc="/images/gallery/work-31.jpg"
                eyebrow="Diagnostics"
                title="Standard Diagnosis"
                subtitle="Warning lights · Limp mode · AdBlue & DPF · Mercedes cars & vans"
                priceFrom={zoneA}
                bookLabel="Book diagnosis"
                analyticsPrefix="standard_diagnosis"
                pricingHref="/pricing"
                ctaVariant="book-only"
                objectPosition="center 35%"
                mobileObjectPosition="center 42%"
            />
            <Section>
                <div className="mx-auto max-w-3xl">
                    {fromMerged && !dismissMerged && (
                        <div className="relative mb-8">
                            <Notice variant="info">
                                <p className="pr-6">
                                    You followed a link to a specialist topic - we now cover these under{' '}
                                    <strong>Standard Diagnosis</strong> (same visit depth). Mention your symptom when you book or when we arrive.
                                </p>
                            </Notice>
                            <button
                                type="button"
                                className="absolute right-3 top-3 rounded px-2 py-0.5 text-lg leading-none text-text-muted hover:bg-surface-alt hover:text-text-primary"
                                aria-label="Dismiss notice"
                                onClick={() => setDismissMerged(true)}
                            >
                                ×
                            </button>
                        </div>
                    )}
                    {/* Warm intro */}
                    <p className="text-base leading-relaxed text-text-secondary lg:text-xl">
                        Dashboard lit up? We come to you with Mercedes dealer-level tooling, find the root cause, and leave you with a clear written fix plan — not guesswork.
                    </p>

                    <DiagnosticProofStrip items={diagnosticProofItems} />

                    <div className="mt-5 lg:hidden">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Common faults we fix</p>
                        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {symptomLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="shrink-0 rounded-full border border-border-default bg-surface-alt px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-brand/40 hover:text-brand-light"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="mt-8 reveal lg:mt-10">
                        <h2 className="text-xl font-bold text-text-primary lg:text-2xl">How it works</h2>
                        <div className="mt-4 grid grid-cols-2 gap-3 lg:hidden">
                            {[
                                { step: '01', title: 'Get in touch', desc: 'Postcode, vehicle & symptoms — fixed price confirmed.' },
                                { step: '02', title: 'Book a slot', desc: 'We arrive with full diagnostic kit.' },
                                { step: '03', title: 'On-site diagnosis', desc: 'Full scan & live data (up to 60 mins).' },
                                { step: '04', title: 'Written fix plan', desc: 'Root cause & next steps — plain English.' },
                            ].map((s) => (
                                <div key={s.step} className="rounded-xl border border-border-default bg-surface-alt/60 p-3">
                                    <span className="text-xs font-bold text-brand-light">{s.step}</span>
                                    <h3 className="mt-1 text-sm font-semibold text-text-primary">{s.title}</h3>
                                    <p className="mt-0.5 text-xs leading-snug text-text-secondary">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 hidden space-y-6 lg:block">
                            {[
                                { step: '01', title: 'Get in touch', desc: 'Tell us your postcode, vehicle, and symptoms. We confirm your zone and fixed price.' },
                                { step: '02', title: 'Confirm your slot', desc: 'Pick a date and time that works for you. We arrive at your location with full diagnostic kit.' },
                                { step: '03', title: 'On-site diagnosis', desc: 'Deep scan across all modules, live data checks, guided tests, sensor plausibility, and actuations.' },
                                { step: '04', title: 'Written fix plan', desc: 'You get a clear outcome: fault codes, root cause, and recommended next steps. Plain English, no jargon.' },
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

                    <div className="mt-10 reveal lg:mt-12">
                        <h2 className="text-xl font-bold text-text-primary lg:text-2xl">Real faults we&apos;ve found</h2>
                        <p className="mt-2 text-sm text-text-muted">Photos from real Mercedes diagnostic visits — tap any image to see the fault.</p>
                        <div className="mt-4">
                            <PhotoGallery images={diagnosticPhotos} columns={3} />
                        </div>
                    </div>

                    {/* What We Diagnose - structured grid */}
                    <div className="mt-12 reveal" id="what-we-diagnose">
                        <h2 className="text-xl font-bold text-text-primary lg:text-2xl">What we diagnose</h2>
                        <p className="mt-2 text-sm text-text-secondary lg:text-base">
                            One service, one price — all fault types below.
                        </p>
                        <div className="mt-4 lg:hidden">
                            <DiagnosticCoverageAccordion categories={diagnosticCategories} />
                        </div>
                        <div className="mt-6 hidden space-y-4 lg:block">
                            {diagnosticCategories.map((cat) => {
                                const Icon = cat.icon;
                                return (
                                    <div key={cat.id} id={cat.id} className="rounded-xl border border-border-default bg-surface-alt p-5 transition-all hover:border-brand/20">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-text-primary">{cat.title}</h3>
                                                <p className="mt-1 text-sm text-text-secondary leading-relaxed">{cat.desc}</p>
                                                {cat.image ? (
                                                    <figure className="mt-4 overflow-hidden rounded-lg border border-border-default">
                                                        <div className="relative aspect-[16/10] min-h-[200px] sm:min-h-[260px]">
                                                            <OptimizedImage
                                                                src={cat.image.src}
                                                                alt={cat.image.alt}
                                                                className="absolute inset-0 h-full w-full object-cover"
                                                            />
                                                        </div>
                                                        <figcaption className="border-t border-border-default bg-surface-alt px-4 py-3 text-sm text-text-secondary">
                                                            {cat.image.caption}
                                                        </figcaption>
                                                    </figure>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* What's Included */}
                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">What&apos;s Included</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'Full-system scan (all modules, not just engine)',
                                'Freeze frame and fault code analysis',
                                'Live data checks and sensor plausibility',
                                'Guided tests and actuations where applicable',
                                'Mercedes Xentry dealer-level access when needed',
                                'Written findings and root cause analysis',
                                'Recommended next steps and quote for follow-on work',
                                'Up to 60 minutes on-site time',
                            ].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">What Your Written Outcome Looks Like</h2>
                        <p className="mt-2 text-text-secondary">
                            Every Standard Diagnosis ends with a documented written outcome. Below is a glimpse from one real visit.
                            See the full walkthrough for how plain English, ruled-out causes, live data, and next steps fit together.
                        </p>
                        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                            {[
                                { src: '/images/sample-report/01_plain_english_summary.png', alt: 'Plain-English summary from a diagnostic report' },
                                { src: '/images/sample-report/02_dpf_checks_table.png', alt: 'DPF and related checks table from a diagnostic report' },
                                { src: '/images/sample-report/03_scr_live_data_section.png', alt: 'SCR live data section from a diagnostic report' },
                                { src: '/images/sample-report/06_technical_diagnosis_box.png', alt: 'Technical diagnosis summary from a written report' },
                            ].map((img, i) => (
                                <div
                                    key={img.src}
                                    className={cn(
                                        'overflow-hidden rounded-lg border border-border-default bg-surface-alt',
                                        i >= 2 && 'hidden sm:block',
                                    )}
                                >
                                    <ExpandableReportImage src={img.src} alt={img.alt} className="overflow-hidden rounded-lg" />
                                </div>
                            ))}
                        </div>
                        <div className="mt-6">
                            <CTAButton
                                href="/sample-diagnostic-report"
                                variant="outline"
                                icon={<ArrowRight className="h-4 w-4" />}
                                onClick={() => trackNavClick('/sample-diagnostic-report', 'See the Full Report Example', 'standard_diagnosis')}
                            >
                                See the Full Report Example
                            </CTAButton>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="mt-10 reveal lg:mt-12">
                        <h2 className="text-xl font-bold text-text-primary lg:text-2xl">Pricing</h2>
                        <ZonePriceCards
                            rows={zonePriceRows}
                            footnote="Includes travel and up to 60 mins on-site. Extra time £85/hr + VAT in 15-min blocks."
                        />
                        <div className="mt-4 hidden overflow-x-auto rounded-xl border border-border-default lg:block">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-border-default bg-surface-alt">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Zone</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Drive time</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Zone A</td><td className="px-4 py-3 text-text-secondary">0-25 mins</td><td className="px-4 py-3 text-right font-semibold text-brand-light">£{zoneA}<VatLabel /></td></tr>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Zone B</td><td className="px-4 py-3 text-text-secondary">25-45 mins</td><td className="px-4 py-3 text-right font-semibold text-brand-light">£{zoneB}<VatLabel /></td></tr>
                                    <tr><td className="px-4 py-3 text-text-secondary">Zone C</td><td className="px-4 py-3 text-text-secondary">45-60 mins</td><td className="px-4 py-3 text-right font-semibold text-brand-light">£{zoneC}<VatLabel /></td></tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-2 hidden text-sm text-text-muted lg:block">Includes travel and up to 60 mins on-site. If additional diagnostic time is needed, it&apos;s billed at £85/hour + VAT in 15-minute blocks.</p>
                    </div>

                    {/* Fleet */}
                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Fleet & Commercial Customers</h2>
                        <p className="mt-2 text-text-secondary">
                            We work with fleet operators, hire companies, and depot managers across Kent and South East London. If you have multiple vehicles needing diagnostic attention, we can arrange bulk visits with priority scheduling. Common fleet scenarios include proactive health checks, fault sweeps, and DPF/AdBlue status reviews across your fleet.
                        </p>
                        <p className="mt-4 text-sm">
                            <a
                                href={getWhatsAppHref()}
                                className="inline-flex items-center gap-1.5 font-medium text-brand-light hover:underline"
                                onClick={() => trackWhatsAppClick('standard_diagnosis_fleet')}
                            >
                                <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
                                Discuss fleet requirements on WhatsApp
                            </a>
                        </p>
                    </div>

                    {/* When Workshop Referral May Be Needed */}
                    <div className="mt-10 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">When Workshop Referral May Be Needed</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'Work requiring ramp or major underbody access',
                                'Heavy drivetrain jobs that can\'t be done safely mobile',
                                'Faults requiring manufacturer-specific online access (documented for referral)',
                            ].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* FAQ */}
                    <div className="mt-12 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">Frequently Asked Questions</h2>
                        <div className="mt-6">
                            <FaqAccordion items={faqs} />
                        </div>
                    </div>

                    {/* Related fault guides */}
                    <div className="mt-10 reveal">
                        <h2 className="text-xl font-bold text-text-primary">Related fault guides</h2>
                        <ul className="mt-4 space-y-3">
                            {[
                                { label: 'Sprinter limp mode: what a proper diagnostic looks like', href: '/blog/sprinter-limp-mode-proper-diagnostic' },
                                { label: 'AdBlue countdown: why clearing codes is not a fix', href: '/blog/adblue-countdown-clearing-codes-not-fix' },
                                { label: 'DPF warning lights: when regen helps vs when it makes things worse', href: '/blog/dpf-warning-light-regen-vs-worse' },
                            ].map((item) => (
                                <li key={item.href}>
                                    <Link
                                        to={item.href}
                                        className="inline-flex items-center gap-2 text-sm text-brand hover:underline"
                                        onClick={() => trackNavClick(item.href, item.label, 'diagnostic_callout_fault_guides')}
                                    >
                                        <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-8 reveal">
                        <Notice variant="info">
                            All diagnostic services end with a written outcome - fault codes, checks performed, root cause analysis, and recommended next steps.
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
                    <OptimizedImage src="/images/cta-bg.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 to-brand/80" />
                </div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
                    <div className="text-center reveal">
                        <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                            Need a proper diagnosis?
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                            Book a Standard Diagnosis and get a clear answer - at your door.
                        </p>
                        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
                            <CTAButton
                                href="/booking"
                                variant="secondary"
                                size="lg"
                                className="w-full max-w-xs sm:w-auto"
                                onClick={() => trackNavClick('/booking', 'Book Online', 'standard_diagnosis_footer')}
                            >
                                Book Now
                            </CTAButton>
                            <p className="text-center text-sm text-white/85 sm:hidden">
                                <a
                                    href={getWhatsAppHref()}
                                    className="font-medium text-white hover:underline"
                                    onClick={() => trackWhatsAppClick('standard_diagnosis')}
                                >
                                    WhatsApp
                                </a>
                                <span className="text-white/60"> · </span>
                                <a
                                    href={`tel:${siteConfig.contact.phoneE164}`}
                                    className="font-medium text-white hover:underline"
                                    onClick={() => trackPhoneClick('standard_diagnosis')}
                                >
                                    {siteConfig.contact.phoneDisplay}
                                </a>
                            </p>
                            <CTAButton
                                href={getWhatsAppHref()}
                                variant="ghost"
                                size="lg"
                                external
                                icon={<MessageCircle className="h-5 w-5" />}
                                className="hidden text-white hover:bg-white/10 hover:text-white sm:inline-flex"
                                onClick={() => trackWhatsAppClick('standard_diagnosis')}
                            >
                                WhatsApp Us
                            </CTAButton>
                            <CTAButton
                                href={`tel:${siteConfig.contact.phoneE164}`}
                                variant="ghost"
                                size="lg"
                                external
                                icon={<Phone className="h-5 w-5" />}
                                className="hidden text-white hover:bg-white/10 hover:text-white sm:inline-flex"
                                onClick={() => trackPhoneClick('standard_diagnosis')}
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
