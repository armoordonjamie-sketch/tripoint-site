import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { AlertTriangle } from 'lucide-react';

export function NotFoundPage() {
    return (
        <>
            <Seo title="Page Not Found" noIndex />

            <Section>
                <div className="mx-auto max-w-lg text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-warning/10">
                        <AlertTriangle className="h-10 w-10 text-warning" />
                    </div>
                    <h1 className="text-6xl font-extrabold text-text-primary">404</h1>
                    <p className="mt-4 text-xl text-text-secondary">Page not found</p>
                    <p className="mt-2 text-text-muted">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <CTAButton href="/">Back to Home</CTAButton>
                        <CTAButton href="/contact" variant="outline">
                            Contact Us
                        </CTAButton>
                    </div>
                </div>
            </Section>
        </>
    );
}
