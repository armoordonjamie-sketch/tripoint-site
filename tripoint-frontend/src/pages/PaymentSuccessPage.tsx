import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { CheckCircle2 } from 'lucide-react';
import {
    fireGoogleAdsContactConversion,
    trackPaymentSuccess,
} from '@/lib/analytics';
import { getEventId } from '@/lib/leadTracking';

const PAYMENT_CTX_KEY = 'tripoint_payment_context';

interface PaymentContextStored {
    service_interest?: string;
    lead_value_gbp?: number | null;
    journey_id?: string | null;
    hashed_email?: string | null;
    hashed_phone?: string | null;
    booking_id?: string | null;
    ga_client_id?: string | null;
    ga_session_id?: string | null;
    vehicle_make?: string | null;
    vehicle_model?: string | null;
}

export function PaymentSuccessPage() {
    const { token } = useParams<{ token: string }>();

    useEffect(() => {
        let cancelled = false;

        async function run() {
            let serviceInterest = 'general';
            let valueGbp: number | undefined;
            let journeyId = '';
            let hashedEmail = '';
            let hashedPhone = '';
            let vehicleMake = '';
            let vehicleModel = '';
            const paymentEventId = getEventId();

            try {
                const raw = sessionStorage.getItem(PAYMENT_CTX_KEY);
                if (raw) {
                    const p = JSON.parse(raw) as PaymentContextStored;
                    if (p.service_interest) serviceInterest = p.service_interest;
                    if (p.lead_value_gbp != null && p.lead_value_gbp !== undefined) {
                        valueGbp = p.lead_value_gbp ?? undefined;
                    }
                    if (p.journey_id) journeyId = p.journey_id;
                    if (p.hashed_email) hashedEmail = p.hashed_email;
                    if (p.hashed_phone) hashedPhone = p.hashed_phone;
                    if (p.vehicle_make) vehicleMake = p.vehicle_make;
                    if (p.vehicle_model) vehicleModel = p.vehicle_model;
                }
            } catch {
                /* ignore */
            }

            if (token) {
                try {
                    const r = await fetch(`/api/payments/${encodeURIComponent(token)}/details`);
                    if (r.ok) {
                        const d = (await r.json()) as {
                            total_gbp?: number | null;
                            service_ids?: string[];
                            booking_id?: string;
                            vehicle_make?: string;
                            vehicle_model?: string;
                        };
                        if (!cancelled) {
                            if (d.service_ids?.length) {
                                serviceInterest = d.service_ids.join(',');
                            }
                            if (d.total_gbp != null) valueGbp = d.total_gbp;
                            if (!journeyId && d.booking_id) journeyId = d.booking_id;
                            if (!vehicleMake && d.vehicle_make) vehicleMake = d.vehicle_make;
                            if (!vehicleModel && d.vehicle_model) vehicleModel = d.vehicle_model;
                        }
                    }
                } catch {
                    /* ignore */
                }
            }

            if (!cancelled) {
                const orderId = journeyId || paymentEventId;
                if (hashedEmail && hashedPhone) {
                    fireGoogleAdsContactConversion({
                        valueGbp: valueGbp ?? 0,
                        transactionId: orderId,
                        hashedEmailHex: hashedEmail,
                        hashedPhoneHex: hashedPhone,
                    });
                }
                trackPaymentSuccess(serviceInterest, {
                    serviceInterest,
                    valueGbp,
                    leadValue: valueGbp,
                    orderId,
                    eventId: paymentEventId,
                    ...(hashedEmail ? { hashedEmail } : {}),
                    ...(hashedPhone ? { hashedPhone } : {}),
                    ...(vehicleMake ? { vehicleMake } : {}),
                    ...(vehicleModel ? { vehicleModel } : {}),
                });
            }

            try {
                sessionStorage.removeItem(PAYMENT_CTX_KEY);
            } catch {
                /* ignore */
            }
        }

        void run();
        return () => {
            cancelled = true;
        };
    }, [token]);

    return (
        <>
            <Seo
                title="Payment Received"
                description="Your payment has been received. Your booking is confirmed."
                noIndex
            />
            <Section>
                <div className="mx-auto max-w-xl rounded-2xl border border-border-default bg-surface-alt p-6 sm:p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 text-success mb-6">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary">Payment received</h1>
                    <p className="mt-4 text-text-secondary">
                        Thank you. You will receive an email confirming your payment with invoice.
                    </p>
                    <Link to="/">
                        <CTAButton className="mt-8">Back to home</CTAButton>
                    </Link>
                </div>
            </Section>
        </>
    );
}
