import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { OptimizedImage } from '@/components/OptimizedImage';
import { PhotoGallery } from '@/components/PhotoGallery';
import type { GalleryImage } from '@/data/galleryImages';
import {
    FORM_SECTION_ID,
    PRIORITY_PRICE_GBP,
    VERDICT_SUBMIT_ENDPOINT,
    VERDICT_PRIORITY_SESSION_ENDPOINT,
    VERDICT_THANKS_PATH,
} from './config';
import { trackVerdictEvent } from './verdictAnalytics';

// ── Shared field classes (match the site's form styling — see ContactPage) ──
const inputClass =
    'w-full rounded-lg border border-border-default bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand';
const labelClass = 'block text-sm font-medium text-text-primary mb-1.5';
const errorClass = 'mt-1 text-xs text-danger';

// ── Validation ──────────────────────────────────────────────────────────────
const verdictSchema = z.object({
    car: z.string().min(3, 'Please paste the listing link, or type the reg and asking price.'),
    email: z.string().email('Enter a valid email so I can send your verdict.'),
    note: z.string().max(2000).optional(),
});
type VerdictForm = z.infer<typeof verdictSchema>;

// ── Static content ──────────────────────────────────────────────────────────
const howItWorks = [
    {
        n: 1,
        title: 'Paste the listing.',
        body: 'A link from AutoTrader, eBay, Facebook Marketplace — or just the reg plate and the asking price.',
    },
    {
        n: 2,
        title: 'A real mechanic reviews it.',
        body: "Known faults at that mileage, true running costs, fair-price check, and a read of the car's MOT history.",
    },
    {
        n: 3,
        title: 'Get your verdict.',
        body: 'A clear BUY / CAUTION / AVOID by email, usually within 24 hours — with exactly what to check and what I’d pay.',
    },
];

const whatYouGet: { emoji: string; lead: string; rest: string }[] = [
    { emoji: '💷', lead: 'Is the price fair?', rest: 'What this car really sells for — and what I’d offer.' },
    {
        emoji: '🔧',
        lead: 'What goes wrong with this exact model at this mileage,',
        rest: 'what to listen and look for, and what the fix costs.',
    },
    {
        emoji: '📋',
        lead: "What you'll be paying for next.",
        rest: 'Repairs and services coming in the next 1–2 years.',
    },
    {
        emoji: '🛠',
        lead: 'MOT history red flags.',
        rest: "What the car's MOT record quietly tells you that the seller won't.",
    },
    {
        emoji: '✅',
        lead: 'Your before-you-buy checklist.',
        rest: 'The specific things to check before you hand over a penny.',
    },
];

// Generic used-car imagery (royalty-free, Pexels licence). See ./README.md for sources.
const base = '/images/should-i-buy-this-car';
const galleryPhotos: GalleryImage[] = [
    {
        src: `${base}/viewing.jpg`,
        alt: 'A couple looking closely at a used car in a showroom before buying',
        category: ['buying'],
        orientation: 'landscape',
    },
    {
        src: `${base}/mileage.jpg`,
        alt: 'A Mercedes instrument cluster showing the odometer mileage on a used car',
        category: ['buying'],
        orientation: 'landscape',
    },
    {
        src: `${base}/keys.jpg`,
        alt: 'A hand holding out the keys to a used car',
        category: ['buying'],
        orientation: 'landscape',
    },
];

const faqs = [
    {
        q: 'Is it really free?',
        a: 'Yes. The standard verdict is free. The optional £7 Priority Verdict is faster and more detailed.',
    },
    { q: 'How long does it take?', a: 'Usually within 24 hours; 3 hours for Priority.' },
    { q: 'What do you need from me?', a: 'A listing link, or the reg plate and asking price.' },
    {
        q: 'Are you actually impartial?',
        a: "Yes. No dealer or marketplace pays me. If the car's a bad buy, I'll say so.",
    },
    {
        q: 'What cars can you check?',
        a: 'Any used car for sale in the UK — private or dealer, petrol, diesel, hybrid or electric.',
    },
];

export function ShouldIBuyThisCarPage() {
    const navigate = useNavigate();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [priorityLoading, setPriorityLoading] = useState(false);
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<VerdictForm>({ resolver: zodResolver(verdictSchema) });

    const scrollToForm = () => {
        document.getElementById(FORM_SECTION_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const onSubmit = async (data: VerdictForm) => {
        setSubmitError(null);
        try {
            const res = await fetch(VERDICT_SUBMIT_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ car: data.car, email: data.email, note: data.note || null }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                const detail = (err as { detail?: unknown }).detail;
                const msg =
                    typeof detail === 'string'
                        ? detail
                        : Array.isArray(detail) && (detail[0] as { msg?: string })?.msg
                          ? (detail[0] as { msg: string }).msg
                          : 'Something went wrong. Please try again.';
                throw new Error(msg);
            }
            // Analytics: primary conversion event fires on a confirmed submit.
            trackVerdictEvent('verdict_request_submit', { method: 'free' });
            navigate(VERDICT_THANKS_PATH, { state: { car: data.car } });
        } catch (e) {
            setSubmitError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
        }
    };

    // £7 Priority Verdict — carries over the car/email already typed (Stripe collects
    // the email too if it's blank). Redirects to Stripe Checkout (server-created session).
    const startPriority = async () => {
        setSubmitError(null);
        setPriorityLoading(true);
        try {
            const { car, email, note } = getValues();
            const res = await fetch(VERDICT_PRIORITY_SESSION_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ car: car || null, email: email || null, note: note || null }),
            });
            if (!res.ok) throw new Error('Could not start checkout. Please try again.');
            const data = (await res.json()) as { checkout_url?: string };
            if (!data.checkout_url) throw new Error('Could not start checkout. Please try again.');
            window.location.href = data.checkout_url;
        } catch (e) {
            setPriorityLoading(false);
            setSubmitError(e instanceof Error ? e.message : 'Could not start checkout. Please try again.');
        }
    };

    return (
        <div>
            <Seo
                title="Should I Buy This Car? Get a Mechanic's Honest Verdict — Free"
                description="Paste any used-car listing and a mechanic with 10 years in the trade tells you what'll go wrong, what it'll really cost to run, and whether the price is fair. Free verdict in 24h."
                canonical="/should-i-buy-this-car"
            />

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <Section className="relative overflow-hidden bg-surface">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand/10 to-transparent" aria-hidden="true" />
                <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
                    <div className="text-center lg:text-left">
                        <h1 className="text-4xl font-extrabold leading-tight text-text-primary sm:text-5xl">
                            Before you buy that used car — let a mechanic look first.
                        </h1>
                        <p className="mt-5 text-lg text-text-secondary">
                            Paste the listing. A mechanic with 10 years in the trade tells you the known faults for
                            that exact model and mileage, what it&apos;ll really cost you over the next two years, and
                            whether the price is fair. You get a straight <strong className="text-text-primary">BUY</strong>,{' '}
                            <strong className="text-text-primary">CAUTION</strong> or{' '}
                            <strong className="text-text-primary">AVOID</strong> — not a sales pitch.
                        </p>
                        <div className="mt-8">
                            <CTAButton onClick={scrollToForm} size="lg" className="w-full sm:w-auto">
                                Get my free verdict →
                            </CTAButton>
                        </div>
                        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-text-muted lg:justify-start">
                            <ShieldCheck className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                            Built by a mechanic with 10 years in the trade. No dealer is paying me to say yes.
                        </p>
                    </div>
                    <div>
                        <div className="overflow-hidden rounded-2xl border border-border-default shadow-xl shadow-brand/5">
                            <OptimizedImage
                                src="/images/should-i-buy-this-car/forecourt.jpg"
                                alt="A row of used cars lined up for sale on a dealer forecourt"
                                priority
                                className="aspect-[4/3] w-full object-cover"
                            />
                        </div>
                        <p className="mt-3 text-center text-xs text-text-muted">
                            Private sale or dealer forecourt — I check them all the same way.
                        </p>
                    </div>
                </div>
            </Section>

            {/* ── CREDIBILITY STRIP ────────────────────────────────────────── */}
            <div className="border-y border-border-default bg-surface-alt">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-x-3 gap-y-1 px-4 py-4 text-center text-sm font-medium text-text-secondary sm:flex-row">
                    <span>10+ years on the tools</span>
                    <span className="hidden text-text-muted sm:inline" aria-hidden="true">·</span>
                    <span>No affiliation to any dealer or marketplace</span>
                    <span className="hidden text-text-muted sm:inline" aria-hidden="true">·</span>
                    <span>Honest verdicts only</span>
                </div>
            </div>

            {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
            <Section>
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">How it works</h2>
                </div>
                <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
                    {howItWorks.map((step) => (
                        <div
                            key={step.n}
                            className="rounded-2xl border border-border-default bg-surface-alt p-6"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-base font-bold text-white">
                                {step.n}
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-text-primary">{step.title}</h3>
                            <p className="mt-2 text-sm text-text-secondary">{step.body}</p>
                        </div>
                    ))}
                </div>
            </Section>

            {/* ── WHAT YOU GET ─────────────────────────────────────────────── */}
            <Section className="border-t border-border-default bg-surface-alt/40">
                <div className="mx-auto max-w-3xl">
                    <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">What you get</h2>
                    <ul className="mt-8 space-y-5">
                        {whatYouGet.map((item) => (
                            <li key={item.lead} className="flex items-start gap-4">
                                <span className="text-2xl leading-none" aria-hidden="true">
                                    {item.emoji}
                                </span>
                                <p className="text-base text-text-secondary">
                                    <strong className="font-semibold text-text-primary">{item.lead}</strong>{' '}
                                    {item.rest}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </Section>

            {/* ── GALLERY (any used car, any seller) ───────────────────────── */}
            <Section className="border-t border-border-default">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand">
                        Any used car, any seller
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-text-primary sm:text-3xl">
                        Whatever you&apos;re looking at, I&apos;ll check it
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-sm text-text-secondary">
                        AutoTrader, eBay or Facebook Marketplace. Private or dealer. Petrol, diesel, hybrid or
                        electric — if it&apos;s for sale in the UK, you get a straight verdict.
                    </p>
                </div>
                <div className="mx-auto mt-8 max-w-5xl">
                    <PhotoGallery images={galleryPhotos} columns={3} />
                </div>
            </Section>

            {/* ── WHY TRUST THIS ───────────────────────────────────────────── */}
            <Section>
                <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
                    <div className="rounded-2xl border border-border-default bg-surface-alt p-8">
                        <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">Why trust this</h2>
                        <p className="mt-4 text-base leading-relaxed text-text-secondary">
                            History-check sites sell you data. Listing sites rate the price and want you to buy
                            through them. Neither tells you the thing that actually costs you money: what breaks on
                            this specific car, and what it&apos;ll cost to fix. I&apos;m a mechanic with 10 years in
                            the trade. No dealer pays me. If a car&apos;s a dog, I&apos;ll tell you to walk away.
                        </p>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-border-default">
                        <OptimizedImage
                            src="/images/should-i-buy-this-car/dealer-chat.jpg"
                            alt="A car salesman with a clipboard talking to a couple beside a car in a dealership"
                            className="aspect-[4/3] w-full object-cover"
                        />
                    </div>
                </div>
            </Section>

            {/* ── FORM ─────────────────────────────────────────────────────── */}
            <Section id={FORM_SECTION_ID} className="border-t border-border-default bg-surface-alt/40 scroll-mt-24">
                <div className="mx-auto max-w-xl">
                    <h2 className="text-center text-2xl font-bold text-text-primary sm:text-3xl">
                        Get your free verdict
                    </h2>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                        className="mt-8 rounded-2xl border border-border-default bg-surface p-6 sm:p-8"
                    >
                        <div>
                            <label htmlFor="car" className={labelClass}>
                                The car: paste the listing link, or type the reg + asking price{' '}
                                <span className="text-danger">*</span>
                            </label>
                            <input
                                id="car"
                                {...register('car')}
                                className={inputClass}
                                placeholder={'autotrader.co.uk/... or "AB12 CDE, £6,500"'}
                                aria-invalid={errors.car ? 'true' : 'false'}
                            />
                            {errors.car && <p className={errorClass}>{errors.car.message}</p>}
                        </div>

                        <div className="mt-4">
                            <label htmlFor="email" className={labelClass}>
                                Your email <span className="text-danger">*</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                {...register('email')}
                                className={inputClass}
                                placeholder="you@email.com"
                                aria-invalid={errors.email ? 'true' : 'false'}
                            />
                            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                        </div>

                        <div className="mt-4">
                            <label htmlFor="note" className={labelClass}>
                                Anything worrying you?{' '}
                                <span className="font-normal text-text-muted">(optional)</span>
                            </label>
                            <textarea
                                id="note"
                                rows={3}
                                {...register('note')}
                                className={inputClass}
                                placeholder={'e.g. "high mileage", "feels too cheap", "first diesel"'}
                            />
                            {errors.note && <p className={errorClass}>{errors.note.message}</p>}
                        </div>

                        {submitError && (
                            <p className="mt-4 text-sm text-danger" role="alert">
                                {submitError}
                            </p>
                        )}

                        <div className="mt-6">
                            <CTAButton type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting ? 'Sending…' : 'Send me my verdict'}
                            </CTAButton>
                        </div>

                        <p className="mt-3 text-center text-xs text-text-muted">
                            Free. No account. I&apos;ll only email you your verdict. Usually back within 24 hours.
                        </p>
                        <p className="mt-3 text-center text-xs text-text-muted">
                            By submitting you agree to our{' '}
                            <Link
                                to="/legal/privacy-policy"
                                className="text-brand underline transition-colors hover:text-brand-light"
                            >
                                privacy policy
                            </Link>
                            .
                        </p>
                    </form>

                    {/* ── PRIORITY VERDICT ─────────────────────────────────── */}
                    <div className="mt-6 rounded-2xl border border-brand/40 bg-brand/5 p-6 sm:p-8">
                        <h3 className="flex items-center gap-2 text-xl font-bold text-text-primary">
                            <Clock className="h-5 w-5 text-brand" aria-hidden="true" />
                            Need it today?
                        </h3>
                        <p className="mt-3 text-sm text-text-secondary">
                            The free verdict comes back within 24 hours. If you&apos;re viewing sooner — or want
                            the full written report with a detailed fault-by-fault breakdown and a price I&apos;d
                            negotiate to — get the Priority Verdict for £{PRIORITY_PRICE_GBP}, back within 3 hours.
                        </p>
                        <div className="mt-5">
                            <CTAButton
                                onClick={startPriority}
                                disabled={priorityLoading}
                                variant="outline"
                                className="w-full sm:w-auto"
                            >
                                {priorityLoading ? 'Starting checkout…' : `Get the £${PRIORITY_PRICE_GBP} Priority Verdict →`}
                            </CTAButton>
                        </div>
                    </div>
                </div>
            </Section>

            {/* ── FAQ ──────────────────────────────────────────────────────── */}
            <Section>
                <div className="mx-auto max-w-3xl">
                    <h2 className="text-center text-2xl font-bold text-text-primary sm:text-3xl">
                        Questions
                    </h2>
                    <div className="mt-8 space-y-3">
                        {faqs.map((faq) => (
                            <details
                                key={faq.q}
                                className="group rounded-xl border border-border-default bg-surface-alt p-5 [&_summary]:cursor-pointer"
                            >
                                <summary className="flex items-center justify-between gap-4 text-base font-semibold text-text-primary marker:content-['']">
                                    {faq.q}
                                    <ArrowRight className="h-4 w-4 shrink-0 text-brand transition-transform group-open:rotate-90" aria-hidden="true" />
                                </summary>
                                <p className="mt-3 text-sm text-text-secondary">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ── FOOTER MICROCOPY (above the site footer) ─────────────────── */}
            <Section className="border-t border-border-default">
                <p className="mx-auto max-w-2xl text-center text-sm text-text-muted">
                    Built by a mechanic with 10 years in the trade who&apos;s tired of watching people overpay
                    for bad cars. Not affiliated with any dealer, marketplace or finance company.
                </p>
            </Section>
        </div>
    );
}
