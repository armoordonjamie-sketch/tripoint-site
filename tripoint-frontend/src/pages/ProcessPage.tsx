import { useEffect, useRef } from 'react';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { Notice } from '@/components/Notice';
import { siteConfig } from '@/config/site';
import { trackEvent } from '@/lib/analytics';
import { CheckCircle2, XCircle, ClipboardCheck, Search, FileText, Phone, MessageCircle } from 'lucide-react';

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

const steps = [
    {
        num: '01',
        icon: ClipboardCheck,
        title: 'Book + Symptom Details',
        desc: 'Get in touch via phone, WhatsApp, or our booking form. Send us: postcode, registration, make/model/mileage, symptoms and warning lights, whether the vehicle is drivable, and where it\'s parked. We\'ll confirm your zone, price, and next available slot. A small deposit secures your booking.',
    },
    {
        num: '02',
        icon: Search,
        title: 'On-Site Diagnostic Workflow',
        desc: 'We arrive at your location with professional diagnostic equipment. We scan all modules, check live data, run guided tests where applicable, and verify root cause. No guesswork - we follow a structured process to identify the fault.',
    },
    {
        num: '03',
        icon: FileText,
        title: 'Report + Repair Options',
        desc: 'Every visit ends with a written outcome: what we found, what we tested, and what to do next. If the fix is mobile-feasible and conditions are safe, we can proceed. If it needs a workshop (ramp, major mechanical, unsafe roadside), we refer you with our findings.',
    },
];

const included = [
    'Full scan of all vehicle modules',
    'Live data snapshot and fault code analysis',
    'Guided tests and actuations where applicable',
    'Written diagnostic report with root cause',
    'Recommended next steps and quote for follow-on work',
];

const notIncluded = [
    'Major mechanical work requiring a ramp or workshop',
    'Unsafe roadside work (live road, red route, poor conditions)',
    'Work we cannot verify properly on-site',
];

export function ProcessPage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo
                title="Our Process"
                description="How TriPoint Diagnostics works: book with symptom details, on-site diagnostic workflow, and a written report with repair options. Mobile diagnostics across Kent & SE London."
                canonical="/process"
            />

            <Section>
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                        How We Work
                    </h1>
                    <p className="mt-4 text-lg text-text-secondary">
                        A clear, transparent process from first contact to fix plan. No surprises, no dead ends.
                    </p>

                    {/* 3-step workflow */}
                    <div className="mt-12 space-y-10">
                        {steps.map((step) => (
                            <div key={step.num} className="reveal flex gap-6">
                                <div className="step-number shrink-0">{step.num}</div>
                                <div>
                                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                                        <step.icon className="h-5 w-5 text-brand" />
                                        {step.title}
                                    </h2>
                                    <p className="mt-2 text-text-secondary">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* What's included */}
                    <div className="mt-16 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">What&apos;s Included in Every Visit</h2>
                        <ul className="mt-4 space-y-2">
                            {included.map((item) => (
                                <li key={item} className="flex items-start gap-2 text-text-secondary">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* What's NOT included */}
                    <div className="mt-10 reveal">
                        <h2 className="text-2xl font-bold text-text-primary">What&apos;s Not Included</h2>
                        <p className="mt-2 text-text-secondary">
                            We&apos;re mobile-only and work within clear boundaries. We won&apos;t undertake:
                        </p>
                        <ul className="mt-4 space-y-2">
                            {notIncluded.map((item) => (
                                <li key={item} className="flex items-start gap-2 text-text-secondary">
                                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* How deposits work */}
                    <div className="mt-10 rounded-2xl border border-brand/20 bg-brand/5 p-6 reveal">
                        <h2 className="text-lg font-bold text-text-primary">How Booking & Deposits Work</h2>
                        <p className="mt-2 text-text-secondary">
                            A deposit secures your slot: £30 for Zone A/B, £50 for Zone C or VOR bookings. Rescheduling is free with 24 hours notice (deposit carries over). Late cancellation or no-show means the deposit is retained. Payment for the visit is due on completion.
                        </p>
                    </div>

                    <div className="mt-10 reveal">
                        <Notice variant="info">
                            All diagnostic services end with a written outcome - fault codes, checks performed, root cause analysis, and recommended next steps. No verbal &ldquo;it&apos;s probably the…&rdquo; guesses.
                        </Notice>
                    </div>

                    <div className="mt-12 flex flex-wrap gap-4 reveal">
                        <CTAButton href="/booking" size="lg" onClick={() => trackEvent('click_book_now', { location: 'process' })}>
                            Book a Diagnostic
                        </CTAButton>
                        <CTAButton
                            href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                            variant="outline"
                            size="lg"
                            external
                            icon={<MessageCircle className="h-5 w-5" />}
                            onClick={() => trackEvent('click_whatsapp', { location: 'process' })}
                        >
                            WhatsApp Us
                        </CTAButton>
                        <CTAButton
                            href={`tel:${siteConfig.contact.phoneE164}`}
                            variant="outline"
                            size="lg"
                            external
                            icon={<Phone className="h-5 w-5" />}
                            onClick={() => trackEvent('click_phone_header', { location: 'process' })}
                        >
                            {siteConfig.contact.phoneDisplay}
                        </CTAButton>
                    </div>
                </div>
            </Section>
        </div>
    );
}
