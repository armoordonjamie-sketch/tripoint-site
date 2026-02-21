import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { siteConfig } from '@/config/site';
import { Loader2, AlertCircle, CheckCircle2, CreditCard } from 'lucide-react';

interface PaymentDetails {
    booking_id: string;
    status: string;
    full_name: string;
    service_name: string;
    booking_date: string;
    booking_time_window: string;
    vehicle_reg: string;
    vehicle_make_model: string;
    deposit_gbp: number;
    balance_gbp: number;
    total_gbp: number | null;
}

export function PaymentPage() {
    const { token } = useParams<{ token: string }>();
    const [details, setDetails] = useState<PaymentDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        setError(null);
        fetch(`/api/payments/${token}/details`)
            .then((r) => {
                if (!r.ok) throw new Error('Booking not found or link expired');
                return r.json();
            })
            .then(setDetails)
            .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
            .finally(() => setLoading(false));
    }, [token]);

    const handlePayDeposit = async () => {
        if (!token) return;
        setPaying(true);
        setError(null);
        try {
            const res = await fetch('/api/payments/deposit-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.detail || 'Failed to create payment');
            if (json.checkout_url) {
                window.location.href = json.checkout_url;
                return;
            }
            throw new Error('No checkout URL received');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Payment failed');
        } finally {
            setPaying(false);
        }
    };

    const handlePayBalance = async () => {
        if (!token) return;
        setPaying(true);
        setError(null);
        try {
            const res = await fetch('/api/payments/balance-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.detail || 'Failed to create payment');
            if (json.checkout_url) {
                window.location.href = json.checkout_url;
                return;
            }
            throw new Error('No checkout URL received');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Payment failed');
        } finally {
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <Section>
                <div className="flex items-center justify-center gap-2 py-12 text-text-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading…</span>
                </div>
            </Section>
        );
    }

    if (error && !details) {
        return (
            <>
                <Seo title="Payment" description="Payment for your TriPoint Diagnostics booking" noIndex />
                <Section>
                    <div className="mx-auto max-w-xl rounded-xl border border-danger/20 bg-danger/5 p-6 text-center">
                        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-danger" />
                        <h2 className="text-lg font-semibold text-text-primary">Booking not found</h2>
                        <p className="mt-2 text-sm text-text-secondary">{error}</p>
                        <p className="mt-4 text-sm text-text-secondary">
                            If you need help, contact us at{' '}
                            <a href={`mailto:${siteConfig.contact.email}`} className="text-brand hover:underline">
                                {siteConfig.contact.email}
                            </a>
                        </p>
                        <Link to="/" className="mt-6 inline-block text-brand hover:underline">
                            ← Back to home
                        </Link>
                    </div>
                </Section>
            </>
        );
    }

    if (!details) return null;

    const isPendingDeposit = details.status === 'PENDING_DEPOSIT';
    const isDepositPaid = details.status === 'DEPOSIT_PAID';
    const isCompletedUnpaid = details.status === 'COMPLETED_UNPAID';
    const isCompletedPaid = details.status === 'COMPLETED_PAID';

    return (
        <>
            <Seo
                title="Payment"
                description={`Payment for your ${details.service_name} booking with TriPoint Diagnostics`}
                noIndex
            />
            <Section>
                <div className="mx-auto max-w-xl rounded-2xl border border-border-default bg-surface-alt p-6 sm:p-8">
                    <h1 className="text-2xl font-bold text-text-primary">Payment</h1>
                    <p className="mt-2 text-text-secondary">Booking: {details.booking_id}</p>

                    <div className="mt-6 rounded-xl border border-border-default bg-surface p-4">
                        <p className="font-medium text-text-primary">{details.full_name}</p>
                        <p className="mt-1 text-sm text-text-secondary">
                            {details.service_name} • {details.booking_date} • {details.booking_time_window}
                        </p>
                        {details.vehicle_reg && (
                            <p className="mt-1 text-sm text-text-muted">
                                {details.vehicle_make_model} ({details.vehicle_reg})
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {isPendingDeposit && details.deposit_gbp > 0 && (
                        <div className="mt-6">
                            <p className="text-sm text-text-secondary">
                                Pay your deposit of £{details.deposit_gbp} to confirm your booking.
                            </p>
                            <CTAButton
                                type="button"
                                onClick={handlePayDeposit}
                                disabled={paying}
                                className="mt-4 w-full"
                            >
                                {paying ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Redirecting…
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Pay Deposit (£{details.deposit_gbp})
                                    </>
                                )}
                            </CTAButton>
                        </div>
                    )}

                    {isDepositPaid && (
                        <div className="mt-6 flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 p-4 text-success">
                            <CheckCircle2 className="h-5 w-5 shrink-0" />
                            <span>Deposit received. Your booking is confirmed.</span>
                        </div>
                    )}

                    {(isDepositPaid || isCompletedUnpaid) && details.balance_gbp > 0 && (
                        <div className="mt-6">
                            <p className="text-sm text-text-secondary">
                                Remaining balance: £{details.balance_gbp}
                            </p>
                            <CTAButton
                                type="button"
                                onClick={handlePayBalance}
                                disabled={paying}
                                className="mt-4 w-full"
                            >
                                {paying ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Redirecting…
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Pay Balance (£{details.balance_gbp})
                                    </>
                                )}
                            </CTAButton>
                        </div>
                    )}

                    {isCompletedPaid && (
                        <div className="mt-6 flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 p-4 text-success">
                            <CheckCircle2 className="h-5 w-5 shrink-0" />
                            <span>Fully paid. Thank you.</span>
                        </div>
                    )}

                    <p className="mt-6 text-center text-sm text-text-muted">
                        <Link to="/" className="text-brand hover:underline">
                            ← Back to home
                        </Link>
                    </p>
                </div>
            </Section>
        </>
    );
}
