import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { VERDICT_PRIORITY_CONFIRM_ENDPOINT } from './config';
import { trackVerdictEvent } from './verdictAnalytics';

export function VerdictPriorityThanksPage() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [car, setCar] = useState<string>('');
    const firedRef = useRef(false);

    useEffect(() => {
        // Reaching this page means Stripe redirected here after a successful payment.
        // Fire the conversion event once (reliable for Google Ads import), then verify
        // server-side so the admin/buyer emails only send on a genuinely paid session.
        if (firedRef.current) return;
        firedRef.current = true;

        if (sessionId) {
            trackVerdictEvent('priority_verdict_purchase', { value: 7, currency: 'GBP' });
        }

        let cancelled = false;
        if (sessionId) {
            fetch(VERDICT_PRIORITY_CONFIRM_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId }),
            })
                .then((r) => (r.ok ? r.json() : null))
                .then((data: { confirmed?: boolean; car?: string } | null) => {
                    if (!cancelled && data?.car) setCar(data.car);
                })
                .catch(() => {
                    /* best-effort: the page still shows confirmation */
                });
        }
        return () => {
            cancelled = true;
        };
    }, [sessionId]);

    return (
        <div>
            <Seo
                title="Priority Verdict confirmed"
                description="Your £7 Priority Verdict purchase is confirmed."
                canonical="/should-i-buy-this-car/priority-thanks"
                noIndex
            />

            <Section>
                <div className="mx-auto max-w-xl">
                    <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-success" aria-hidden="true" />
                        <h1 className="mt-4 text-2xl font-bold text-text-primary sm:text-3xl">
                            Priority Verdict confirmed ⚡
                        </h1>
                        <p className="mt-3 text-text-secondary">
                            Payment received, thank you.{' '}
                            {car ? (
                                <>
                                    Your full written verdict on{' '}
                                    <span className="font-medium text-text-primary break-words">{car}</span> is at the
                                    front of the queue.
                                </>
                            ) : (
                                <>Your full written verdict is at the front of the queue.</>
                            )}{' '}
                            I&apos;ll have the detailed, fault-by-fault report (plus the price I&apos;d negotiate to)
                            back to you <strong className="text-text-primary">within 3 hours</strong>.
                        </p>
                        <p className="mt-3 text-sm text-text-muted">
                            Got the service history or photos of the engine bay / dashboard? Reply to your
                            confirmation email and attach them.
                        </p>
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
