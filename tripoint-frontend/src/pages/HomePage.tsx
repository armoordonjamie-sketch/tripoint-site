import { useEffect, useRef, useState } from 'react';
import {
    Zap, AlertTriangle, Gauge, Wrench, BatteryWarning, CircuitBoard,
    ArrowRight, Phone, MessageCircle, ClipboardCheck, Search,
    FileText, CheckCircle2, Shield, MapPin, Truck, ChevronRight,
} from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { ServiceCard } from '@/components/ServiceCard';
import { TownChips } from '@/components/TownChips';
import { PricingTable } from '@/components/PricingTable';
import { Notice } from '@/components/Notice';
import { siteConfig } from '@/config/site';
import { galleryImages } from '@/data/galleryImages';

/* ── Intersection Observer for scroll-reveal ─────────── */
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

/* ── Static data ─────────────────────────────────────── */
const problems = [
    { icon: <Zap className="h-6 w-6" />, title: 'Limp Mode', desc: 'Engine power restricted - need fast, accurate diagnosis.' },
    { icon: <AlertTriangle className="h-6 w-6" />, title: 'AdBlue Countdown', desc: '"Start Not Possible" warning approaching? Compliance-first fix.' },
    { icon: <Gauge className="h-6 w-6" />, title: 'DPF Issues', desc: 'Failed regen, soot load, or DPF warning lights diagnosed properly.' },
    { icon: <BatteryWarning className="h-6 w-6" />, title: 'Warning Lights', desc: 'Engine, ABS, ESP, or glow plug warnings investigated with live data.' },
    { icon: <Wrench className="h-6 w-6" />, title: 'No-Start / Cranking', desc: 'Won\'t start or intermittent cranking - electrical + fuel path checks.' },
    { icon: <CircuitBoard className="h-6 w-6" />, title: 'Electrical Faults', desc: 'Intermittent issues, CAN bus faults, and module communication errors.' },
];

const steps = [
    { icon: <Phone className="h-6 w-6" />, num: '01', title: 'Get in Touch', desc: 'Call, WhatsApp, or book online with your vehicle details and symptoms.' },
    { icon: <ClipboardCheck className="h-6 w-6" />, num: '02', title: 'Confirm & Deposit', desc: 'We confirm your zone, price, and next available slot. Small deposit secures it.' },
    { icon: <Search className="h-6 w-6" />, num: '03', title: 'On-Site Diagnosis', desc: 'Deep scan, live data, guided tests - all at your location.' },
    { icon: <FileText className="h-6 w-6" />, num: '04', title: 'Written Fix Plan', desc: 'Clear findings, root cause, and next steps documented for you.' },
];

const trustPoints = [
    { icon: <Wrench className="h-6 w-6" />, title: 'Dealer-Level Tooling', desc: 'Professional diagnostic equipment for deep system access - not a cheap code reader.' },
    { icon: <Truck className="h-6 w-6" />, title: 'Sprinter Expertise', desc: 'Specialist in Mercedes vans (W906/W907, OM651/OM654) and common failure patterns.' },
    { icon: <MessageCircle className="h-6 w-6" />, title: 'Clear Communication', desc: 'Plain-English findings and documented outcomes - no jargon walls.' },
    { icon: <MapPin className="h-6 w-6" />, title: 'Mobile Convenience', desc: 'We come to you across Kent & SE London. No workshop drop-off needed.' },
];


const faqTeasers = [
    { q: 'Do you work on cars as well as vans?', a: 'Yes - our diagnostic services cover both vans and cars. Our special strength is Mercedes commercial vehicles, but we work across makes.' },
    { q: 'Do you do AdBlue/DPF/EGR deletes?', a: 'No. We diagnose and repair emissions systems; we do not disable, remove, or defeat them. Compliance-first, always.' },
    { q: 'What areas do you cover?', a: 'Up to 60 minutes drive time from our bases in Tonbridge (TN9) and Eltham (SE9).' },
];

/* Curated selection of 6 diverse photos for the homepage gallery teaser */
const galleryPreview = [
    galleryImages[0],   // Mercedes engine on floor jack
    galleryImages[22],  // Engine bay with leak detection foam
    galleryImages[47],  // Borescope inspecting engine bay
    galleryImages[40],  // Clamp multimeter on Mercedes sill
    galleryImages[25],  // Fouled EGR pipe on white Sprinter
    galleryImages[42],  // Garrett turbocharger removed
];

export function HomePage() {
    const scrollRef = useScrollReveal();

    /* ── Rotating hero images ─────────────────────── */
    const heroImages = [
        { src: '/images/gallery/work-48.jpg', position: 'center 70%' },
        { src: '/images/gallery/work-03.jpg', position: 'center 60%' },
        { src: '/images/gallery/work-46.jpg', position: 'center 80%' },
    ];
    const [heroIdx, setHeroIdx] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setHeroIdx((prev) => (prev + 1) % heroImages.length);
        }, 7000);
        return () => clearInterval(timer);
    }, [heroImages.length]);

    return (
        <div ref={scrollRef}>
            <Seo canonical="/" />

            {/* ── HERO ──────────────────────────────────────── */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                {/* Rotating background images */}
                <div className="absolute inset-0">
                    {heroImages.map((img, i) => (
                        <img
                            key={img.src}
                            src={img.src}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out"
                            style={{
                                objectPosition: img.position,
                                opacity: i === heroIdx ? 1 : 0,
                            }}
                            aria-hidden="true"
                        />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-b from-surface/30 via-surface/60 to-surface" />
                </div>

                {/* Animated mesh overlay */}
                <div className="absolute inset-0 mesh-gradient opacity-60" aria-hidden="true" />

                {/* Dot grid pattern */}
                <div className="absolute inset-0 dot-grid opacity-30" aria-hidden="true" />

                {/* Floating accent orbs */}
                <div className="pointer-events-none absolute top-20 left-[15%] h-72 w-72 rounded-full bg-brand/8 blur-[100px] animate-float" aria-hidden="true" />
                <div className="pointer-events-none absolute bottom-20 right-[10%] h-96 w-96 rounded-full bg-brand-dark/10 blur-[120px] animate-float" style={{ animationDelay: '3s' }} aria-hidden="true" />

                <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <h1 className="reveal text-5xl font-extrabold leading-[1.1] tracking-tight text-text-primary sm:text-6xl md:text-7xl">
                            Mobile Vehicle{' '}
                            <span className="text-gradient">Diagnostics</span>{' '}
                            <br className="hidden sm:block" />
                            & Repairs
                        </h1>

                        <p className="reveal mt-6 max-w-xl text-lg text-text-secondary md:text-xl" style={{ transitionDelay: '0.1s' }}>
                            Dealer-level diagnostic depth delivered to your driveway. Written fix plans,
                            compliance-first approach, no guesswork.
                        </p>

                        {/* Stats row */}
                        <div className="reveal mt-8 flex flex-wrap gap-8" style={{ transitionDelay: '0.2s' }}>
                            {[
                                { value: '60min', label: 'Coverage radius' },
                                { value: '£80+', label: 'Diagnostics from' },
                                { value: '100%', label: 'Written outcomes' },
                            ].map((s) => (
                                <div key={s.label}>
                                    <p className="text-2xl font-bold text-brand-light">{s.value}</p>
                                    <p className="text-xs text-text-muted uppercase tracking-wider">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* CTAs */}
                        <div className="reveal mt-10 flex flex-wrap items-center gap-4" style={{ transitionDelay: '0.3s' }}>
                            <CTAButton href="/booking" size="lg">
                                Book a Diagnostic
                            </CTAButton>
                            <CTAButton
                                href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                                variant="outline"
                                size="lg"
                                external
                                icon={<MessageCircle className="h-5 w-5" />}
                            >
                                WhatsApp Us
                            </CTAButton>
                            <CTAButton href="/pricing" variant="ghost" size="lg">
                                View Pricing <ChevronRight className="ml-1 h-4 w-4" />
                            </CTAButton>
                        </div>
                    </div>


                </div>
            </section>

            {/* ── WHAT WE SOLVE ──────────────────────────────── */}
            <Section className="relative">
                <div className="absolute inset-0 dot-grid opacity-20" aria-hidden="true" />
                <div className="relative">
                    <div className="text-center reveal">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">Common Issues</p>
                        <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
                            What We Solve
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
                            From urgent warning lights to complex emissions systems - we bring the right tools and knowledge to your door.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {problems.map((p, i) => (
                            <div
                                key={p.title}
                                className="reveal glass rounded-2xl p-6 transition-all duration-300 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5 hover:-translate-y-1 shine"
                                style={{ transitionDelay: `${i * 0.08}s` }}
                            >
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand/20 to-brand/5 text-brand">
                                    {p.icon}
                                </div>
                                <h3 className="mb-1 text-lg font-semibold text-text-primary">{p.title}</h3>
                                <p className="text-sm text-text-secondary">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ── SERVICES with images ───────────────────────── */}
            <Section className="bg-surface-alt/30">
                <div className="text-center reveal">
                    <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">What We Offer</p>
                    <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">Our Services</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
                        Fixed-price diagnostic services with written outcomes. No surprises.
                    </p>
                </div>
                <div className="mt-12 grid gap-6 sm:grid-cols-2">
                    <ServiceCard
                        title="Diagnostic Callout"
                        description="Full-system scan, live data checks, guided tests, and a written fix plan. The foundation of everything we do."
                        icon={<Search className="h-6 w-6" />}
                        href="/services/diagnostic-callout"
                        fromPrice={80}
                    />
                    <ServiceCard
                        title="VOR / Priority Triage"
                        description="Priority scheduling for commercial vehicles. Get a 'back-on-road' decision fast when downtime costs money."
                        icon={<Truck className="h-6 w-6" />}
                        href="/services/vor-triage"
                        fromPrice={120}
                    />
                    <ServiceCard
                        title="Emissions Diagnostics"
                        description="AdBlue, SCR, DPF, NOx - compliant diagnosis and repair. No deletes, no shortcuts, just proper procedure."
                        icon={<Shield className="h-6 w-6" />}
                        href="/services/emissions-diagnostics"
                        fromPrice={120}
                    />
                    <ServiceCard
                        title="Pre-Purchase Health Check"
                        description="Deep scan and buyer risk summary before you commit. Know what you're buying."
                        icon={<CheckCircle2 className="h-6 w-6" />}
                        href="/services/pre-purchase-health-check"
                        fromPrice={90}
                    />
                </div>
            </Section>

            {/* ── SPRINTER SPECIALIST BANNER ──────────────────── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img src="/images/sprinter-specialist.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-surface/40" />
                </div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-24">
                    <div className="max-w-xl reveal">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">Specialist Knowledge</p>
                        <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
                            Mercedes Sprinter Expert
                        </h2>
                        <p className="mt-4 text-text-secondary">
                            Special strength in W906/W907 platforms and OM651/OM654 engines. We know the common failures,
                            the diagnostic pathways, and the proper fix routes - including SCR, DPF, injector, and
                            turbo-related issues.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-2">
                            {['W906', 'W907', 'OM651', 'OM654', 'SCR/AdBlue', 'DPF', 'Injectors'].map((tag) => (
                                <span key={tag} className="rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-medium text-brand-light">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div className="mt-8">
                            <CTAButton href="/services/diagnostic-callout" icon={<ArrowRight className="h-4 w-4" />}>
                                Learn More
                            </CTAButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ────────────────────────────────── */}
            <Section className="relative overflow-hidden">
                <div className="absolute inset-0 mesh-gradient opacity-30" aria-hidden="true" />
                <div className="relative">
                    <div className="text-center reveal">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">Process</p>
                        <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">How It Works</h2>
                        <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
                            Simple, transparent process from first contact to fix plan.
                        </p>
                    </div>
                    <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map((step, i) => (
                            <div key={step.title} className="reveal relative text-center" style={{ transitionDelay: `${i * 0.1}s` }}>
                                {/* Connector line (desktop) */}
                                {i < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-5 left-[60%] w-[calc(100%-20%)] h-px bg-gradient-to-r from-brand/30 to-transparent" aria-hidden="true" />
                                )}
                                <div className="step-number mx-auto mb-4">
                                    {step.num}
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-text-primary">{step.title}</h3>
                                <p className="text-sm text-text-secondary">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ── COVERAGE with image ─────────────────────────── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img src="/images/coverage-map.jpg" alt="" className="h-full w-full object-cover opacity-90" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-surface/60" />
                </div>
                <Section className="relative">
                    <div className="text-center reveal">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">Coverage</p>
                        <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
                            Areas We Cover
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
                            Mobile diagnostics across Kent and South East London - up to 60 minutes from our bases.
                        </p>
                    </div>
                    <div className="mt-8 flex justify-center reveal" style={{ transitionDelay: '0.15s' }}>
                        <TownChips />
                    </div>
                    <div className="mt-6 text-center reveal" style={{ transitionDelay: '0.25s' }}>
                        <CTAButton href="/coverage" variant="outline" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
                            View Full Coverage Map
                        </CTAButton>
                    </div>
                </Section>
            </section>

            {/* ── WHY TRIPOINT (Trust cards) ──────────────────── */}
            <Section className="bg-surface-alt/30">
                <div className="text-center reveal">
                    <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">Why Us</p>
                    <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
                        Why Choose TriPoint?
                    </h2>
                </div>
                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {trustPoints.map((t, i) => (
                        <div
                            key={t.title}
                            className="reveal glass rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/5 shine"
                            style={{ transitionDelay: `${i * 0.1}s` }}
                        >
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 text-brand">
                                {t.icon}
                            </div>
                            <h3 className="mb-2 font-semibold text-text-primary">{t.title}</h3>
                            <p className="text-sm text-text-secondary">{t.desc}</p>
                        </div>
                    ))}
                </div>
            </Section>

            {/* ── OUR WORK GALLERY PREVIEW ─────────────────── */}
            <section className="relative overflow-hidden">
                {/* Subtle background accent */}
                <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand/5 blur-[120px]" aria-hidden="true" />

                <Section className="relative">
                    {/* Header row */}
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-end reveal">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Our Work</p>
                            <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
                                Real Jobs, Real Photos
                            </h2>
                            <p className="mt-2 max-w-lg text-text-secondary">
                                Every image is from an actual TriPoint diagnostic or repair session. No stock photos, no AI.
                            </p>
                        </div>
                        <CTAButton href="/our-work" variant="outline" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
                            View All Photos
                        </CTAButton>
                    </div>

                    {/* Bento-style image grid */}
                    <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-2">
                        {/* Featured large image — spans left 7 columns and both rows */}
                        <div className="reveal group relative overflow-hidden rounded-2xl md:col-span-7 md:row-span-2" style={{ transitionDelay: '0.1s' }}>
                            <img
                                src={galleryPreview[0].src}
                                alt={galleryPreview[0].alt}
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                style={{ minHeight: '400px' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <p className="absolute bottom-0 left-0 right-0 p-5 text-sm text-white/90 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                {galleryPreview[0].alt}
                            </p>
                            {/* Glassmorphism badge */}
                            <div className="absolute top-4 left-4 glass rounded-xl px-4 py-2 text-xs font-semibold text-brand-light backdrop-blur-md">
                                50+ Real Photos
                            </div>
                        </div>

                        {/* Right side — 4 smaller images in 2x2 grid */}
                        {galleryPreview.slice(1, 5).map((img, i) => (
                            <div
                                key={img.src}
                                className="reveal group relative overflow-hidden rounded-2xl md:col-span-5"
                                style={{ transitionDelay: `${0.15 + i * 0.08}s` }}
                            >
                                <img
                                    src={img.src}
                                    alt={img.alt}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    style={{ minHeight: '190px', maxHeight: '240px' }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <p className="absolute bottom-0 left-0 right-0 p-3 text-xs text-white/90 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                    {img.alt}
                                </p>
                            </div>
                        ))}

                        {/* 6th image — full width strip with CTA overlay */}
                        {galleryPreview[5] && (
                            <div className="reveal group relative overflow-hidden rounded-2xl md:col-span-12" style={{ transitionDelay: '0.5s' }}>
                                <img
                                    src={galleryPreview[5].src}
                                    alt={galleryPreview[5].alt}
                                    loading="lazy"
                                    className="h-48 w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-surface/80 via-surface/40 to-transparent" />
                                <div className="absolute inset-0 flex items-center px-8">
                                    <div>
                                        <p className="text-lg font-bold text-text-primary sm:text-xl">See the full gallery</p>
                                        <p className="mt-1 text-sm text-text-secondary">Engine bays, emissions faults, electrical diagnostics, and more.</p>
                                        <CTAButton href="/our-work" variant="primary" size="sm" className="mt-3" icon={<ArrowRight className="h-4 w-4" />}>
                                            Browse All Work
                                        </CTAButton>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Section>
            </section>

            {/* ── PRICING TEASER ──────────────────────────────── */}
            <Section>
                <div className="text-center reveal">
                    <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">Pricing</p>
                    <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
                        Transparent Pricing
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
                        Zone-based pricing with no hidden fees. Deposit secures your slot.
                    </p>
                </div>
                <div className="mt-10 reveal" style={{ transitionDelay: '0.15s' }}>
                    <PricingTable compact />
                </div>
            </Section>

            {/* ── FAQ TEASER ─────────────────────────────────── */}
            <Section className="bg-surface-alt/30">
                <div className="text-center reveal">
                    <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">FAQ</p>
                    <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
                        Frequently Asked Questions
                    </h2>
                </div>
                <div className="mx-auto mt-10 max-w-3xl space-y-4">
                    {faqTeasers.map((faq, i) => (
                        <div
                            key={faq.q}
                            className="reveal glass rounded-xl p-5 transition-all hover:border-brand/20"
                            style={{ transitionDelay: `${i * 0.1}s` }}
                        >
                            <h3 className="mb-2 font-semibold text-text-primary">{faq.q}</h3>
                            <p className="text-sm text-text-secondary">{faq.a}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-6 text-center reveal">
                    <CTAButton href="/faq" variant="outline" size="sm">
                        View All FAQs
                    </CTAButton>
                </div>
            </Section>

            {/* ── COMPLIANCE NOTICE ──────────────────────────── */}
            <Section className="py-8 md:py-12">
                <div className="mx-auto max-w-3xl reveal">
                    <Notice variant="compliance">
                        <strong>Compliance-first:</strong> TriPoint Diagnostics does not perform emissions deletes, DPF removal, or defeat device installation.
                        We diagnose and repair emissions systems through proper manufacturer procedures. Independent service - not affiliated with vehicle manufacturers.
                    </Notice>
                </div>
            </Section>

            {/* ── FOOTER CTA BANNER ──────────────────────────── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img src="/images/cta-bg.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 to-brand/80" />
                </div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
                    <div className="text-center reveal">
                        <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                            Need help today?
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                            Book a diagnostic and get a proper answer - at your door.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg">
                                Book a Diagnostic
                            </CTAButton>
                            <CTAButton
                                href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                                variant="ghost"
                                size="lg"
                                external
                                icon={<MessageCircle className="h-5 w-5" />}
                                className="text-white hover:text-white hover:bg-white/10"
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
