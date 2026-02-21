import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Zap, AlertTriangle, Gauge, Wrench, Shield, Droplets, Wind,
    ArrowRight, Phone, MessageCircle, Search,
    MapPin, Truck, ChevronRight,
    Settings, Users, FileSearch, BookOpen,
} from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { TownChips } from '@/components/TownChips';
import { siteConfig } from '@/config/site';
import { trackEvent } from '@/lib/analytics';
import { galleryImages } from '@/data/galleryImages';
import { blogPosts } from '@/data/blogPosts';

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

const getPrice = (slug: string, fallback: number) =>
    siteConfig.pricing.services.find((s) => s.slug === slug)?.zoneA ?? fallback;

const services = [
    { title: 'Diagnostic Callout', desc: 'Full-system scan, live data, guided tests, and a written fix plan.', icon: <Search className="h-5 w-5" />, href: '/services/diagnostic-callout', price: getPrice('diagnostic-callout', 120) },
    { title: 'VOR Van Diagnostics', desc: 'Same-day priority triage for off-road commercial vehicles.', icon: <AlertTriangle className="h-5 w-5" />, href: '/services/vor-van-diagnostics', price: getPrice('vor-triage', 160) },
    { title: 'Mercedes Xentry Diagnostics', desc: 'OEM-level access, SCN coding, adaptations, and module initialisation.', icon: <Settings className="h-5 w-5" />, href: '/services/mercedes-xentry-diagnostics-coding', price: getPrice('diagnostic-callout', 120) },
    { title: 'Emissions Fault Decision Visit', desc: 'DPF, AdBlue, SCR, EGR - root cause diagnosis with live data.', icon: <Gauge className="h-5 w-5" />, href: '/services/emissions-diagnostics', price: getPrice('emissions-diagnostics', 170) },
    { title: 'AdBlue Countdown Fix', desc: 'NOx sensors, dosing faults, heater circuits - diagnosed properly, not code-cleared.', icon: <Droplets className="h-5 w-5" />, href: '/services/adblue-countdown', price: getPrice('emissions-diagnostics', 170) },
    { title: 'DPF Warning Light Diagnostic', desc: 'Soot load, sensor plausibility, regen safety checks before any forced regen.', icon: <Wind className="h-5 w-5" />, href: '/services/dpf-regeneration-decision', price: getPrice('emissions-diagnostics', 170) },
    { title: 'NOx Sensor & SCR Diagnostics', desc: 'Sensor drift, heater circuits, catalytic performance - tested with live data.', icon: <Shield className="h-5 w-5" />, href: '/services/nox-scr-diagnostics', price: getPrice('emissions-diagnostics', 170) },
    { title: 'Sprinter Limp Mode Diagnostic', desc: 'Turbo, boost, fuel rail, EGR, and wiring - systematic derate diagnosis.', icon: <Zap className="h-5 w-5" />, href: '/services/sprinter-limp-mode', price: getPrice('diagnostic-callout', 120) },
    { title: 'Intermittent Electrical Diagnostic', desc: 'Random faults, wiring issues, and connector failures traced with live data.', icon: <Zap className="h-5 w-5" />, href: '/services/intermittent-electrical-faults', price: getPrice('diagnostic-callout', 120) },
    { title: 'Pre-Purchase Health Check', desc: 'Every module scanned, emissions checked, condition scored before you buy.', icon: <FileSearch className="h-5 w-5" />, href: '/services/pre-purchase-digital-health-check', price: getPrice('pre-purchase-digital-health-check', 160) },
    { title: 'Fleet Health Check', desc: 'Proactive diagnostic sweep - fault status, DPF health, priority action list.', icon: <Users className="h-5 w-5" />, href: '/services/fleet-health-check', price: getPrice('diagnostic-callout', 120) },
];

const steps = [
    { num: '01', title: 'Get in Touch', desc: 'Call, WhatsApp, or book online with your vehicle details and symptoms.' },
    { num: '02', title: 'Confirm & Deposit', desc: 'We confirm your zone, price, and next available slot. Small deposit secures it.' },
    { num: '03', title: 'On-Site Diagnosis', desc: 'Deep scan, live data, guided tests - all at your location.' },
    { num: '04', title: 'Written Fix Plan', desc: 'Clear findings, root cause, and next steps documented for you.' },
];

const trustPoints = [
    { icon: <Wrench className="h-6 w-6" />, title: 'Dealer-Level Tooling', desc: 'Professional diagnostic equipment - not a cheap code reader.' },
    { icon: <Truck className="h-6 w-6" />, title: 'Sprinter Expertise', desc: 'Specialist in W906/W907 and OM651/OM654 failure patterns.' },
    { icon: <MessageCircle className="h-6 w-6" />, title: 'Clear Communication', desc: 'Plain-English findings and documented outcomes.' },
    { icon: <MapPin className="h-6 w-6" />, title: 'Mobile Convenience', desc: 'Kent & SE London. No workshop drop-off needed.' },
];

/* Curated gallery preview */
const galleryPreview = [
    galleryImages[0],
    galleryImages[22],
    galleryImages[47],
    galleryImages[40],
];

/* Blog teaser - latest 3 posts */
const latestPosts = blogPosts.slice(0, 3);

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
            <section className="relative min-h-[85vh] flex items-center overflow-hidden">
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
                    <div className="absolute inset-0 bg-gradient-to-b from-surface/40 via-surface/70 to-surface" />
                </div>

                <div className="absolute inset-0 mesh-gradient opacity-50" aria-hidden="true" />

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
                            proper process, no guesswork.
                        </p>

                        <div className="reveal mt-8 flex flex-wrap gap-8" style={{ transitionDelay: '0.2s' }}>
                            {[
                                { value: '11', label: 'Services' },
                                { value: '60min', label: 'Coverage radius' },
                                { value: '£120+', label: 'Diagnostics from' },
                            ].map((s) => (
                                <div key={s.label}>
                                    <p className="text-2xl font-bold text-brand-light">{s.value}</p>
                                    <p className="text-xs text-text-muted uppercase tracking-wider">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="reveal mt-10 flex flex-wrap items-center gap-4" style={{ transitionDelay: '0.3s' }}>
                            <CTAButton href="/booking" size="lg" onClick={() => trackEvent('click_book_now', { location: 'homepage' })}>
                                Book a Diagnostic
                            </CTAButton>
                            <CTAButton
                                href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                                variant="outline"
                                size="lg"
                                external
                                icon={<MessageCircle className="h-5 w-5" />}
                                onClick={() => trackEvent('click_whatsapp', { location: 'homepage' })}
                            >
                                WhatsApp Us
                            </CTAButton>
                            <CTAButton href="/services" variant="ghost" size="lg">
                                Our Services <ChevronRight className="ml-1 h-4 w-4" />
                            </CTAButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── ALL SERVICES ─────────────────────────────── */}
            <Section>
                <div className="text-center reveal">
                    <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">What We Offer</p>
                    <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">Our Services</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
                        11 specialist diagnostic services - all mobile, all fixed-price, all ending with a written outcome.
                    </p>
                </div>
                <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map((s, i) => (
                        <Link
                            key={s.title}
                            to={s.href}
                            className="reveal group flex items-start gap-4 rounded-xl border border-border-default bg-surface-alt p-4 transition-all duration-200 hover:border-brand/30 hover:bg-brand/5 hover:-translate-y-0.5"
                            style={{ transitionDelay: `${i * 0.03}s` }}
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand/20 to-brand/5 text-brand transition-transform group-hover:scale-110">
                                {s.icon}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-baseline gap-2">
                                    <h3 className="font-semibold text-text-primary group-hover:text-brand-light transition-colors text-sm">{s.title}</h3>
                                    <span className="text-xs font-medium text-brand/70 shrink-0">from £{s.price}</span>
                                </div>
                                <p className="mt-0.5 text-xs text-text-muted leading-relaxed line-clamp-2">{s.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="mt-8 text-center reveal">
                    <CTAButton href="/services" variant="outline" icon={<ArrowRight className="h-4 w-4" />}>
                        View All Services & Pricing
                    </CTAButton>
                </div>
            </Section>

            {/* ── SPRINTER SPECIALIST BANNER ──────────────────── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img src="/images/sprinter-specialist.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/85 to-surface/40" />
                </div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
                    <div className="max-w-xl reveal">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">Specialist Knowledge</p>
                        <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
                            Mercedes Sprinter Expert
                        </h2>
                        <p className="mt-4 text-text-secondary">
                            Special strength in W906/W907 platforms and OM651/OM654 engines. We know the common failures,
                            diagnostic pathways, and proper fix routes - including SCR, DPF, injector, and turbo-related issues.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                            {['W906', 'W907', 'OM651', 'OM654', 'SCR/AdBlue', 'DPF', 'Injectors'].map((tag) => (
                                <span key={tag} className="rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-medium text-brand-light">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div className="mt-6">
                            <CTAButton href="/services/sprinter-limp-mode" icon={<ArrowRight className="h-4 w-4" />}>
                                Sprinter Diagnostics
                            </CTAButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ────────────────────────────────── */}
            <Section className="relative overflow-hidden">
                <div className="absolute inset-0 mesh-gradient opacity-25" aria-hidden="true" />
                <div className="relative">
                    <div className="text-center reveal">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">Process</p>
                        <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">How It Works</h2>
                        <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
                            Simple, transparent process from first contact to fix plan.
                        </p>
                    </div>
                    <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map((step, i) => (
                            <div key={step.title} className="reveal relative text-center" style={{ transitionDelay: `${i * 0.1}s` }}>
                                {i < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-5 left-[60%] w-[calc(100%-20%)] h-px bg-gradient-to-r from-brand/30 to-transparent" aria-hidden="true" />
                                )}
                                <div className="step-number mx-auto mb-4">{step.num}</div>
                                <h3 className="mb-2 text-lg font-semibold text-text-primary">{step.title}</h3>
                                <p className="text-sm text-text-secondary">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 text-center reveal">
                        <CTAButton href="/process" variant="outline" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
                            See Our Full Process
                        </CTAButton>
                    </div>
                </div>
            </Section>

            {/* ── WHY TRIPOINT ──────────────────────────────── */}
            <Section className="bg-surface-alt/30">
                <div className="text-center reveal">
                    <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">Why Us</p>
                    <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">Why Choose TriPoint?</h2>
                </div>
                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {trustPoints.map((t, i) => (
                        <div
                            key={t.title}
                            className="reveal glass rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/5 shine"
                            style={{ transitionDelay: `${i * 0.08}s` }}
                        >
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand/20 to-brand/5 text-brand">
                                {t.icon}
                            </div>
                            <h3 className="mb-1 font-semibold text-text-primary">{t.title}</h3>
                            <p className="text-sm text-text-secondary">{t.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-8 text-center reveal">
                    <CTAButton href="/about" variant="outline" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
                        About TriPoint
                    </CTAButton>
                </div>
            </Section>

            {/* ── COVERAGE ─────────────────────────────────── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img src="/images/coverage-map.jpg" alt="" className="h-full w-full object-cover opacity-90" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/85 to-surface/60" />
                </div>
                <Section className="relative">
                    <div className="text-center reveal">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">Coverage</p>
                        <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">Areas We Cover</h2>
                        <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
                            Mobile diagnostics across Kent and South East London - up to 60 minutes from our bases.
                        </p>
                    </div>
                    <div className="mt-8 flex justify-center reveal" style={{ transitionDelay: '0.1s' }}>
                        <TownChips />
                    </div>
                    <div className="mt-6 text-center reveal" style={{ transitionDelay: '0.2s' }}>
                        <CTAButton href="/areas" variant="outline" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
                            View Full Coverage Map
                        </CTAButton>
                    </div>
                </Section>
            </section>

            {/* ── OUR WORK TEASER ──────────────────────────── */}
            <Section>
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-end reveal">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Our Work</p>
                        <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">Real Jobs, Real Photos</h2>
                        <p className="mt-2 max-w-lg text-text-secondary">
                            Every image is from an actual TriPoint diagnostic or repair session. No stock photos.
                        </p>
                    </div>
                    <CTAButton href="/our-work" variant="outline" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
                        View All Photos
                    </CTAButton>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {galleryPreview.map((img, i) => (
                        <Link
                            key={img.src}
                            to="/our-work"
                            className="reveal group relative aspect-[4/3] overflow-hidden rounded-xl"
                            style={{ transitionDelay: `${i * 0.08}s` }}
                        >
                            <img
                                src={img.src}
                                alt={img.alt}
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <p className="absolute bottom-0 left-0 right-0 p-3 text-xs text-white/90 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                {img.alt}
                            </p>
                        </Link>
                    ))}
                </div>
            </Section>

            {/* ── BLOG TEASER ──────────────────────────────── */}
            <Section className="bg-surface-alt/30">
                <div className="text-center reveal">
                    <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">Blog</p>
                    <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">Latest Articles</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
                        Practical guides on common van faults, emissions issues, and what proper diagnostics looks like.
                    </p>
                </div>
                <div className="mx-auto mt-10 max-w-4xl grid gap-4 sm:grid-cols-3">
                    {latestPosts.map((post, i) => (
                        <Link
                            key={post.slug}
                            to={`/blog/${post.slug}`}
                            className="reveal group rounded-xl border border-border-default bg-surface-alt p-5 transition-all hover:border-brand/30 hover:bg-brand/5 hover:-translate-y-0.5"
                            style={{ transitionDelay: `${i * 0.08}s` }}
                        >
                            <span className="text-xs font-medium text-brand uppercase tracking-wider">{post.category}</span>
                            <h3 className="mt-2 font-semibold text-text-primary text-sm leading-snug group-hover:text-brand-light transition-colors line-clamp-2">
                                {post.title}
                            </h3>
                            <p className="mt-2 text-xs text-text-muted leading-relaxed line-clamp-2">{post.description}</p>
                            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand group-hover:gap-2 transition-all">
                                Read article <ArrowRight className="h-3 w-3" />
                            </span>
                        </Link>
                    ))}
                </div>
                <div className="mt-8 text-center reveal">
                    <CTAButton href="/blog" variant="outline" size="sm" icon={<BookOpen className="h-4 w-4" />}>
                        View All Articles
                    </CTAButton>
                </div>
            </Section>

            {/* ── PRICING TEASER ──────────────────────────────── */}
            <Section>
                <div className="mx-auto max-w-3xl">
                    <div className="reveal rounded-2xl border border-border-default bg-surface-alt p-8 text-center">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">Pricing</p>
                        <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">Transparent, Zone-Based Pricing</h2>
                        <p className="mx-auto mt-3 max-w-xl text-text-secondary text-sm">
                            Fixed prices confirmed upfront. No hidden fees. Deposit secures your slot. Parts and follow-on labour quoted separately.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-6">
                            {siteConfig.pricing.services.slice(0, 3).map((s) => (
                                <div key={s.slug} className="text-center">
                                    <p className="text-xl font-bold text-brand-light">£{s.zoneA}</p>
                                    <p className="text-xs text-text-muted mt-1">{s.name.split('(')[0].trim()}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6">
                            <CTAButton href="/pricing" variant="outline" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
                                View Full Pricing
                            </CTAButton>
                        </div>
                    </div>
                </div>
            </Section>

            {/* ── FAQ TEASER ─────────────────────────────────── */}
            <Section className="bg-surface-alt/30">
                <div className="mx-auto max-w-3xl text-center reveal">
                    <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">FAQ</p>
                    <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">Got Questions?</h2>
                    <p className="mt-3 text-text-secondary">
                        We&apos;ve answered 50+ common questions about our services, process, emissions repairs, coverage, and more.
                    </p>
                    <div className="mt-6">
                        <CTAButton href="/faq" variant="outline" icon={<ArrowRight className="h-4 w-4" />}>
                            View All FAQs
                        </CTAButton>
                    </div>
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
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackEvent('click_book_now', { location: 'homepage' })}>
                                Book a Diagnostic
                            </CTAButton>
                            <CTAButton
                                href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                                variant="ghost"
                                size="lg"
                                external
                                icon={<MessageCircle className="h-5 w-5" />}
                                className="text-white hover:text-white hover:bg-white/10"
                                onClick={() => trackEvent('click_whatsapp', { location: 'homepage' })}
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
                                onClick={() => trackEvent('click_phone_header', { location: 'homepage' })}
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
