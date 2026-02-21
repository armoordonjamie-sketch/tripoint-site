import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { CheckCircle2 } from 'lucide-react';

export function PaymentSuccessPage() {
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
