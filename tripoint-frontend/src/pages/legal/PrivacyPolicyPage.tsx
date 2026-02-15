import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';

export function PrivacyPolicyPage() {
    return (
        <>
            <Seo
                title="Privacy Policy"
                description="TriPoint Diagnostics privacy policy - how we collect, use, and protect your data."
                canonical="/legal/privacy-policy"
            />

            <Section>
                <div className="mx-auto max-w-3xl prose-invert">
                    <h1 className="text-4xl font-extrabold text-text-primary">Privacy Policy</h1>
                    <p className="mt-2 text-sm text-text-muted">Last updated: [DATE]</p>

                    <div className="mt-8 space-y-6 text-text-secondary">
                        <div>
                            <h2 className="text-xl font-bold text-text-primary">1. Who We Are</h2>
                            <p className="mt-2">
                                TriPoint Diagnostics (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is an independent mobile vehicle diagnostics
                                and repair service operating across Kent and South East London. We are not affiliated with any vehicle manufacturer.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-text-primary">2. What Data We Collect</h2>
                            <p className="mt-2">We may collect the following information through our website forms:</p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>Name, email address, phone number, postcode</li>
                                <li>Vehicle details (make, model, registration, mileage)</li>
                                <li>Symptom descriptions and booking preferences</li>
                                <li>Contact form messages</li>
                            </ul>
                            <p className="mt-2">
                                We also use localStorage in your browser to temporarily store form submissions for convenience.
                                This data remains on your device only.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-text-primary">3. Analytics</h2>
                            <p className="mt-2">
                                We may use privacy-friendly analytics (such as Plausible Analytics) to understand how visitors use our site.
                                These tools do not use cookies or collect personal data. No data is shared with third parties for advertising purposes.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-text-primary">4. How We Use Your Data</h2>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>To confirm and manage diagnostic bookings</li>
                                <li>To communicate about your appointment</li>
                                <li>To provide quotes and follow-up information</li>
                                <li>To improve our services</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-text-primary">5. Data Sharing</h2>
                            <p className="mt-2">
                                We do not sell or share your personal data with third parties for marketing. We may share data with
                                service providers who assist us in operating our business (e.g., scheduling, invoicing) under appropriate
                                data protection agreements.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-text-primary">6. Data Retention</h2>
                            <p className="mt-2">
                                We retain booking and contact data for as long as necessary to provide our services and comply with legal obligations.
                                You may request deletion of your data at any time by contacting us.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-text-primary">7. Your Rights</h2>
                            <p className="mt-2">
                                Under UK GDPR, you have the right to access, correct, or delete your personal data.
                                Contact us at [EMAIL] to exercise these rights.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-text-primary">8. Contact</h2>
                            <p className="mt-2">
                                For privacy-related queries, contact us at: [EMAIL ADDRESS]
                            </p>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}
