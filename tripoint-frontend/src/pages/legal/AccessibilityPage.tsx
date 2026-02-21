import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';

export function AccessibilityPage() {
    return (
        <>
            <Seo
                title="Accessibility Statement"
                description="TriPoint Diagnostics accessibility statement - our commitment to making our website usable for everyone."
                canonical="/legal/accessibility"
            />

            <Section>
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                        Accessibility Statement
                    </h1>
                    <p className="mt-4 text-text-secondary">
                        We aim to make our website accessible to as many people as possible. This includes people with disabilities, people using assistive technologies, and people with temporary limitations such as a broken arm.
                    </p>

                    <div className="mt-10 space-y-6 text-text-secondary">
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary">What we do</h2>
                            <p className="mt-2">
                                We use semantic HTML, clear headings, and sufficient colour contrast. Our site is responsive and can be used with keyboard navigation. We avoid auto-playing media and provide text alternatives where appropriate.
                            </p>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary">Feedback</h2>
                            <p className="mt-2">
                                If you have difficulty using any part of our website, please contact us. We will do our best to help and to improve our site. You can reach us by phone, WhatsApp, or email - see our Contact page.
                            </p>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary">Standards</h2>
                            <p className="mt-2">
                                We aim to follow the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA where practicable. We are a small business and our website is maintained alongside our core diagnostic services. We welcome feedback on how we can improve.
                            </p>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}
