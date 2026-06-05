import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import {
    AFFILIATE_HISTORY_CHECK_URL,
    PRIORITY_PRICE_GBP,
    VERDICT_PRIORITY_SESSION_ENDPOINT,
} from './config';
import { trackVerdictEvent } from './verdictAnalytics';

export function VerdictThanksPage() {
    const location = useLocation();
    const car = (location.state as { car?: string } | null)?.car?.trim() || '';
    const [priorityLoading, setPriorityLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Affiliate nudge — fire analytics BEFORE navigating, then open in a new tab.
    const handleAffiliateClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        trackVerdictEvent('affiliate_click', { destination: 'history_check' });
        window.open(AFFILIATE_HISTORY_CHECK_URL, '_blank', 'noopener,noreferrer');
    };

    // Secondary upsell to the £7 Priority Verdict (carries the car over; Stripe collects email).
    const startPriority = async () => {
        setError(null);
        setPriorityLoading(true);
        try {
            const res = await fetch(VERDICT_PRIORITY_SESSION_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ car: car || null }),
            });
            if (!res.ok) throw new Error('Could not start checkout. Please try again.');
            const data = (await res.json()) as { checkout_url?: string };
            if (!data.checkout_url) throw new Error('Could not start checkout. Please try again.');
            window.location.href = data.checkout_url;
        } catch (err) {
            setPriorityLoading(false);
            setError(err instanceof Error ? err.message : 'Could not start checkout. Please try again.');
        }
    };

    return (
        <div>
            <Seo
                title="Your verdict's on the way"
                description="Your free used-car verdict request has been received."
                canonical="/should-i-buy-this-car/thanks"
                noIndex
            />

            <Section>
                <div className="mx-auto max-w-xl">
                    <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-success" aria-hidden="true" />
                        <h1 className="mt-4 text-2xl font-bold text-text-primary sm:text-3xl">
                            Your verdict&apos;s on the way
                        </h1>
                        <p className="mt-3 text-text-secondary">
                            {car ? (
                                <>
                                    I&apos;ve got your request for{' '}
                                    <span className="font-medium text-text-primary break-words">{car}</span>. I&apos;ll
                                    go through the known faults, check the MOT history and sanity-check the price,
                                    then email you a clear BUY / CAUTION / AVOID — usually within 24 hours.
                                </>
                            ) : (
                                <>
                                    I&apos;ve got your request. I&apos;ll go through the known faults, check the MOT
                                    history and sanity-check the price, then email you a clear BUY / CAUTION / AVOID
                                    — usually within 24 hours.
                                </>
                            )}
                        </p>
                        <p className="mt-3 text-sm text-text-muted">
                            Got the service history or photos of the engine bay / dashboard? Just reply to the
                            confirmation email and attach them.
                        </p>
                    </div>

                    {/* Affiliate nudge */}
                    <div className="mt-6 rounded-2xl border border-border-default bg-surface-alt p-6">
                        <p className="flex items-start gap-3 text-sm text-text-secondary">
                            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
                            <span>
                                <strong className="text-text-primary">While you wait:</strong> 9 out of 10 problem
                                cars show up in a history check — outstanding finance, write-offs, mileage
                                discrepancies.{' '}
                                <a
                                    href={AFFILIATE_HISTORY_CHECK_URL}
                                    onClick={handleAffiliateClick}
                                    target="_blank"
                                    rel="noopener noreferrer sponsored"
                                    className="font-semibold text-brand underline transition-colors hover:text-brand-light"
                                >
                                    Run a quick history check here →
                                </a>
                            </span>
                        </p>
                    </div>

                    {/* Secondary Priority upsell */}
                    <div className="mt-6 text-center">
                        {error && (
                            <p className="mb-3 text-sm text-danger" role="alert">
                                {error}
                            </p>
                        )}
                        <p className="text-sm text-text-secondary">
                            Viewing sooner? Get the full written report in 3 hours.
                        </p>
                        <button
                            type="button"
                            onClick={startPriority}
                            disabled={priorityLoading}
                            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand underline transition-colors hover:text-brand-light disabled:opacity-50"
                        >
                            {priorityLoading ? 'Starting checkout…' : `Get the £${PRIORITY_PRICE_GBP} Priority Verdict`}
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <CTAButton href="/should-i-buy-this-car" variant="ghost" size="sm">
                            Check another car
                        </CTAButton>
                    </div>
                </div>
            </Section>
        </div>
    );
}
