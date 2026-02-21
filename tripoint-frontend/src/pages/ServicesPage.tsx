import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Search, AlertTriangle, Gauge, Wrench, Phone, MessageCircle,
    Truck, MapPin, ArrowRight, Zap, Shield, Droplets, Wind,
    FileSearch, Users, Settings, CheckCircle, Clock, FileText, Headphones,
} from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { ServiceCard } from '@/components/ServiceCard';
import { ZoneCalculator } from '@/components/ZoneCalculator';
import { Notice } from '@/components/Notice';
import { CTAButton } from '@/components/CTAButton';
import { siteConfig } from '@/config/site';
import { trackEvent } from '@/lib/analytics';

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

/* ── Data ─────────────────────────────────────────────── */

const steps = [
    { num: '01', title: 'Get in Touch', desc: 'Call, WhatsApp, or book online with your vehicle details and symptoms.' },
    { num: '02', title: 'Confirm & Deposit', desc: 'We confirm your zone, price, and next available slot. Small deposit secures it.' },
    { num: '03', title: 'On-Site Diagnosis', desc: 'Deep scan, live data, guided tests - all at your location.' },
    { num: '04', title: 'Written Fix Plan', desc: 'Clear findings, root cause, and next steps documented for you.' },
];

const trustPoints = [
    { icon: <Wrench className="h-6 w-6" />, title: 'Dealer-Level Tooling', desc: 'Professional diagnostic equipment for deep system access - not a cheap code reader.' },
    { icon: <Truck className="h-6 w-6" />, title: 'Sprinter Expertise', desc: 'Specialist in Mercedes vans (W906/W907, OM651/OM654) and common failure patterns.' },
    { icon: <MessageCircle className="h-6 w-6" />, title: 'Clear Communication', desc: 'Plain-English findings and documented outcomes - no jargon walls.' },
    { icon: <MapPin className="h-6 w-6" />, title: 'Mobile Convenience', desc: 'We come to you across Kent & SE London. No workshop drop-off needed.' },
];

const decisionGuide = [
    { scenario: 'Warning light on? Engine, ABS, or other fault?', service: 'Diagnostic Callout', href: '/services/diagnostic-callout' },
    { scenario: 'Van off the road? Need a fast back-on-road decision?', service: 'VOR Van Diagnostics', href: '/services/vor-van-diagnostics' },
    { scenario: 'AdBlue countdown? DPF light? NOx or emissions fault?', service: 'Emissions Diagnostics', href: '/services/emissions-diagnostics' },
    { scenario: 'About to buy a used van? Want proof before you pay?', service: 'Pre-Purchase Health Check', href: '/services/pre-purchase-digital-health-check' },
    { scenario: 'Sprinter losing power, limp mode, or derate?', service: 'Sprinter Limp Mode Diagnostic', href: '/services/sprinter-limp-mode' },
    { scenario: 'Fault that comes and goes? Wiring, sensors, or random warnings?', service: 'Intermittent Electrical Diagnostic', href: '/services/intermittent-electrical-faults' },
    { scenario: 'Need Mercedes-specific coding, adaptations, or Xentry access?', service: 'Mercedes Xentry Diagnostics', href: '/services/mercedes-xentry-diagnostics-coding' },
    { scenario: 'Running a fleet? Need a proactive diagnostic sweep?', service: 'Fleet Diagnostic Health Check', href: '/services/fleet-health-check' },
];

const includedInEveryVisit = [
    { icon: <Search className="h-5 w-5" />, title: 'Full-System Scan', desc: 'Every module scanned - not just engine - to catch linked or hidden faults.' },
    { icon: <Gauge className="h-5 w-5" />, title: 'Live Data Analysis', desc: 'Real-time sensor readings: requested vs actual, plausibility checks, trends.' },
    { icon: <FileText className="h-5 w-5" />, title: 'Written Outcome Report', desc: 'Documented findings, evidence, root cause, and a clear fix plan you can act on.' },
    { icon: <Headphones className="h-5 w-5" />, title: 'Plain-English Walkthrough', desc: 'We explain everything before we leave. No jargon, no guessing, no unanswered questions.' },
    { icon: <MapPin className="h-5 w-5" />, title: 'Mobile - At Your Location', desc: 'We come to your home, workplace, or roadside location. No workshop drop-off needed.' },
    { icon: <Clock className="h-5 w-5" />, title: 'Fixed-Price, No Surprises', desc: 'Zone-based pricing confirmed upfront. Parts and follow-on labour quoted separately.' },
];

const faqs = [
    {
        q: 'Do I need to know what\'s wrong before booking?',
        a: 'No. Just describe the symptom - we\'ll work out what\'s going on. If you\'re unsure which service, start with a Diagnostic Callout or WhatsApp us for quick guidance.',
    },
    {
        q: 'What vehicles do you cover?',
        a: 'We specialise in Mercedes Sprinters (W906/W907), Vitos, and commercial vans, but we also cover most makes and models for general diagnostics. If you\'re not sure, just ask.',
    },
    {
        q: 'How long does a visit take?',
        a: 'Most diagnostic visits take 45–90 minutes depending on the service and fault complexity. Each service page states the included on-site time. Follow-on labour is billed in 15-minute increments if needed.',
    },
    {
        q: 'Do you carry parts?',
        a: 'We carry common consumables and sensors, but most visits are diagnostic-first. If parts are needed, we\'ll quote and can collect or order for a follow-up appointment.',
    },
    {
        q: 'What\'s the difference between Diagnostic Callout and a specialist service?',
        a: 'A Diagnostic Callout is our general fault-finding visit - ideal for warning lights or unknown issues. Specialist services (Sprinter Limp Mode, AdBlue Countdown, DPF, etc.) are focused visits tailored to specific fault patterns with extended on-site time.',
    },
];

/* ── Service categories ──────────────────────────────── */

const getPrice = (slug: string, fallback: number) =>
    siteConfig.pricing.services.find((s) => s.slug === slug)?.zoneA ?? fallback;

const serviceCategories = [
    {
        title: 'Core Diagnostics',
        subtitle: 'General fault-finding, priority triage, and manufacturer-level access.',
        services: [
            {
                title: 'Diagnostic Callout',
                description: 'Full-system scan, live data checks, and guided tests - we identify the root cause and give you a clear written outcome with next steps.',
                icon: <Search className="h-6 w-6" />,
                href: '/services/diagnostic-callout',
                fromPrice: getPrice('diagnostic-callout', 120),
            },
            {
                title: 'VOR Van Diagnostics',
                description: 'Off-road commercially? Same-day priority triage to identify the failure, confirm severity, and create an action plan to get you moving.',
                icon: <AlertTriangle className="h-6 w-6" />,
                href: '/services/vor-van-diagnostics',
                fromPrice: getPrice('vor-triage', 160),
            },
            {
                title: 'Mercedes Xentry Diagnostics & Coding',
                description: 'OEM-level diagnostics, SCN coding, adaptations, and module initialisation via Mercedes Star Diagnosis (Xentry). The access you get at the dealer - at your door.',
                icon: <Settings className="h-6 w-6" />,
                href: '/services/mercedes-xentry-diagnostics-coding',
                fromPrice: getPrice('diagnostic-callout', 120),
            },
        ],
    },
    {
        title: 'Emissions & DPF',
        subtitle: 'AdBlue, DPF, SCR, NOx, and EGR - root-cause diagnosis, not code clearing.',
        services: [
            {
                title: 'Emissions Fault Decision Visit',
                description: 'DPF, AdBlue, SCR, EGR - root cause diagnosis and repair for emissions-related faults. Live data, guided tests, written outcomes.',
                icon: <Gauge className="h-6 w-6" />,
                href: '/services/emissions-diagnostics',
                fromPrice: getPrice('emissions-diagnostics', 170),
            },
            {
                title: 'AdBlue Countdown Fix',
                description: 'AdBlue countdown ticking? We diagnose the real cause - NOx sensors, dosing faults, heater circuits - and stop it returning. No code clearing, no bypasses.',
                icon: <Droplets className="h-6 w-6" />,
                href: '/services/adblue-countdown',
                fromPrice: getPrice('emissions-diagnostics', 170),
            },
            {
                title: 'DPF Warning Light Diagnostic',
                description: 'DPF light on? We check soot load, sensor plausibility, and regen conditions before deciding if forced regen is safe - or if you need a repair path first.',
                icon: <Wind className="h-6 w-6" />,
                href: '/services/dpf-regeneration-decision',
                fromPrice: getPrice('emissions-diagnostics', 170),
            },
            {
                title: 'NOx Sensor & SCR Diagnostics',
                description: 'NOx readings implausible? SCR efficiency faults? We test sensor accuracy, heater circuits, and catalytic performance with live data - not just code reads.',
                icon: <Shield className="h-6 w-6" />,
                href: '/services/nox-scr-diagnostics',
                fromPrice: getPrice('emissions-diagnostics', 170),
            },
        ],
    },
    {
        title: 'Specialist Diagnostics',
        subtitle: 'Focused visits for specific fault patterns that need targeted expertise.',
        services: [
            {
                title: 'Sprinter Limp Mode Diagnostic',
                description: 'Sprinter losing power? We check turbo actuators, boost control, fuel rail pressure, EGR, and wiring to find the derate cause - with live data, not guesswork.',
                icon: <Zap className="h-6 w-6" />,
                href: '/services/sprinter-limp-mode',
                fromPrice: getPrice('diagnostic-callout', 120),
            },
            {
                title: 'Intermittent Electrical Fault Diagnostic',
                description: 'Random warnings, faults that come and go, issues on bumps or in rain? We trace wiring, check connectors, and use live data to catch what others miss.',
                icon: <Zap className="h-6 w-6" />,
                href: '/services/intermittent-electrical-faults',
                fromPrice: getPrice('diagnostic-callout', 120),
            },
        ],
    },
    {
        title: 'Inspections & Fleet',
        subtitle: 'Buying a van or managing a fleet? We give you the diagnostic truth before you commit.',
        services: [
            {
                title: 'Pre-Purchase Digital Health Check',
                description: 'Thinking of buying a used van? We scan every module, check service history flags, emissions readiness, and give you an honest condition report before you commit.',
                icon: <FileSearch className="h-6 w-6" />,
                href: '/services/pre-purchase-digital-health-check',
                fromPrice: getPrice('pre-purchase-digital-health-check', 160),
            },
            {
                title: 'Fleet Diagnostic Health Check',
                description: 'Proactive diagnostic sweep across your fleet: fault status, DPF health, emissions readiness, and condition scoring - with a priority action list per vehicle.',
                icon: <Users className="h-6 w-6" />,
                href: '/services/fleet-health-check',
                fromPrice: getPrice('diagnostic-callout', 120),
            },
        ],
    },
];

/* ── Component ───────────────────────────────────────── */

export function ServicesPage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo
                title="Services"
                description="Mobile vehicle diagnostic services across Kent & SE London. 11 specialist services from general diagnostics to emissions, Sprinter limp mode, fleet health checks, and more."
                canonical="/services"
            />

            {/* ── HERO ──────────────────────────────────────── */}
            <section className="relative py-16 md:py-24">
                <div className="absolute inset-0 mesh-gradient opacity-30" aria-hidden="true" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center reveal">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">What We Offer</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl md:text-6xl">
                            Our Services
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
                            Fixed-price mobile diagnostics with written outcomes. Every visit ends with a clear fix plan - no guesswork, no surprises. We come to you.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-8 reveal" style={{ transitionDelay: '0.1s' }}>
                            {[
                                { value: '11', label: 'Specialist services' },
                                { value: '60min', label: 'Coverage radius' },
                                { value: '£120+', label: 'Diagnostics from' },
                                { value: '100%', label: 'Written outcomes' },
                            ].map((s) => (
                                <div key={s.label}>
                                    <p className="text-2xl font-bold text-brand-light">{s.value}</p>
                                    <p className="text-xs text-text-muted uppercase tracking-wider">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── NOT SURE WHICH SERVICE? ───────────────────── */}
            <Section className="relative">
                <div className="absolute inset-0 dot-grid opacity-20" aria-hidden="true" />
                <div className="relative">
                    <div className="text-center reveal">
                        <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
                            Not sure which service you need?
                        </h2>
                        <p className="mt-2 text-text-secondary max-w-xl mx-auto">
                            Start here - describe your situation and we'll point you to the right visit.
                        </p>
                    </div>
                    <div className="mt-8 grid gap-3 sm:grid-cols-2 reveal" style={{ transitionDelay: '0.1s' }}>
                        {decisionGuide.map((item) => (
                            <Link
                                key={item.href}
                                to={item.href}
                                className="group flex items-center justify-between gap-4 rounded-xl border border-border-default bg-surface-alt p-4 transition-all hover:border-brand/30 hover:bg-brand/5"
                            >
                                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{item.scenario}</span>
                                <span className="flex items-center gap-1 text-sm font-semibold text-brand whitespace-nowrap group-hover:gap-2 transition-all shrink-0">
                                    {item.service}
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ── SERVICE CATEGORIES ─────────────────────────── */}
            {serviceCategories.map((cat, catIdx) => (
                <Section key={cat.title} className={catIdx % 2 === 1 ? 'relative bg-surface-alt/30' : ''}>
                    {catIdx % 2 === 1 && (
                        <div className="absolute inset-0 dot-grid opacity-10" aria-hidden="true" />
                    )}
                    <div className="relative">
                        <div className="text-center reveal">
                            <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">{cat.title}</p>
                            <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">{cat.title}</h2>
                            <p className="mt-2 text-text-secondary max-w-xl mx-auto">{cat.subtitle}</p>
                        </div>
                        {catIdx === 0 && (
                            <div className="mx-auto mt-6 max-w-2xl reveal">
                                <Notice variant="info">
                                    All services include travel to your location, a full diagnostic scan, and a written outcome report. Parts and follow-on labour are quoted separately.
                                </Notice>
                            </div>
                        )}
                        <div className={`mt-10 grid gap-6 ${cat.services.length <= 2 ? 'sm:grid-cols-2 max-w-3xl mx-auto' : cat.services.length === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-2'}`}>
                            {cat.services.map((s, i) => (
                                <div key={s.title} className="reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
                                    <ServiceCard
                                        title={s.title}
                                        description={s.description}
                                        icon={s.icon}
                                        href={s.href}
                                        fromPrice={s.fromPrice}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>
            ))}

            {/* ── WHAT'S INCLUDED IN EVERY VISIT ─────────────── */}
            <Section className="relative overflow-hidden">
                <div className="absolute inset-0 mesh-gradient opacity-20" aria-hidden="true" />
                <div className="relative">
                    <div className="text-center reveal">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">Every Visit</p>
                        <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">What's Included - Every Time</h2>
                        <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
                            Regardless of which service you book, every TriPoint visit includes these as standard.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {includedInEveryVisit.map((item, i) => (
                            <div
                                key={item.title}
                                className="reveal glass rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/5"
                                style={{ transitionDelay: `${i * 0.05}s` }}
                            >
                                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand/20 to-brand/5 text-brand">
                                    {item.icon}
                                </div>
                                <h3 className="mb-1 font-semibold text-text-primary">{item.title}</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ── HOW IT WORKS ─────────────────────────────── */}
            <Section className="relative overflow-hidden bg-surface-alt/30">
                <div className="absolute inset-0 mesh-gradient opacity-20" aria-hidden="true" />
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
                                {i < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-5 left-[60%] w-[calc(100%-20%)] h-px bg-gradient-to-r from-brand/30 to-transparent" aria-hidden="true" />
                                )}
                                <div className="step-number mx-auto mb-4">{step.num}</div>
                                <h3 className="mb-2 text-lg font-semibold text-text-primary">{step.title}</h3>
                                <p className="text-sm text-text-secondary">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ── ZONE CALCULATOR ───────────────────────────── */}
            <Section>
                <div className="mx-auto max-w-xl reveal">
                    <ZoneCalculator />
                </div>
            </Section>

            {/* ── TRUST SIGNALS ─────────────────────────────── */}
            <Section>
                <div className="text-center reveal">
                    <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">Why Us</p>
                    <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">Why Choose TriPoint?</h2>
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

            {/* ── FAQ ───────────────────────────────────────── */}
            <Section className="relative bg-surface-alt/30">
                <div className="absolute inset-0 dot-grid opacity-10" aria-hidden="true" />
                <div className="relative">
                    <div className="text-center reveal">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">Common Questions</p>
                        <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">FAQ</h2>
                    </div>
                    <div className="mx-auto mt-10 max-w-3xl space-y-4">
                        {faqs.map((faq, i) => (
                            <details
                                key={i}
                                className="reveal group rounded-2xl border border-border-default bg-surface-alt transition-all open:border-brand/20 open:bg-brand/5"
                                style={{ transitionDelay: `${i * 0.05}s` }}
                            >
                                <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 font-semibold text-text-primary select-none [&::-webkit-details-marker]:hidden list-none">
                                    <span className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-brand shrink-0" />
                                        {faq.q}
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-text-muted transition-transform group-open:rotate-90 shrink-0" />
                                </summary>
                                <div className="px-5 pb-5 pl-13 text-sm text-text-secondary leading-relaxed">
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ── FOOTER CTA BANNER ─────────────────────────── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img src="/images/cta-bg.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 to-brand/80" />
                </div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
                    <div className="text-center reveal">
                        <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                            Ready to book?
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                            Get a proper diagnosis at your door. Book online or reach out on WhatsApp for a quick chat.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackEvent('click_book_now', { location: 'services' })}>
                                Book a Diagnostic
                            </CTAButton>
                            <CTAButton
                                href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                                variant="ghost"
                                size="lg"
                                external
                                icon={<MessageCircle className="h-5 w-5" />}
                                className="text-white hover:text-white hover:bg-white/10"
                                onClick={() => trackEvent('click_whatsapp', { location: 'services' })}
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
                                onClick={() => trackEvent('click_phone_header', { location: 'services' })}
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
