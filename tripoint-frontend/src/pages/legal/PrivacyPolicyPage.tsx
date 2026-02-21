import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { siteConfig } from '@/config/site';

export function PrivacyPolicyPage() {
    const { email, phoneDisplay } = siteConfig.contact;
    const url = siteConfig.url;

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
                    <p className="mt-2 text-sm text-text-muted">
                        <strong>Tripoint Diagnostics Ltd</strong>
                        <br />
                        Last updated: February 2026
                    </p>

                    <div className="mt-8 space-y-8 text-text-secondary">
                        <section>
                            <h2 className="text-xl font-bold text-text-primary">1. Who we are</h2>
                            <p className="mt-2">
                                Tripoint Diagnostics Ltd (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is an independent mobile vehicle
                                diagnostics and repair service operating across Kent and South East London.
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li><strong>Company name:</strong> Tripoint Diagnostics Ltd</li>
                                <li><strong>Company number:</strong> 17038307</li>
                                <li><strong>Registered address:</strong> 476 Sidcup Road, Eltham, London</li>
                                <li><strong>Email:</strong> <a href={`mailto:${email}`} className="text-brand hover:underline">{email}</a></li>
                                <li><strong>Phone:</strong> {phoneDisplay}</li>
                                <li><strong>Website:</strong> <a href={url} className="text-brand hover:underline">{url}</a></li>
                            </ul>
                            <p className="mt-2">
                                We are the data controller for the personal data we collect through our website, booking system, and service
                                delivery. We are not affiliated with any vehicle manufacturer.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">2. What data we collect</h2>
                            <h3 className="mt-4 text-lg font-semibold text-text-primary">Information you provide directly</h3>
                            <p className="mt-2">
                                When you use our website, book a service, or contact us, we may collect:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li><strong>Contact details:</strong> Full name, email address, phone number, postal address, postcode</li>
                                <li><strong>Vehicle details:</strong> Registration number, make, model, approximate mileage, VIN (where relevant to diagnostics)</li>
                                <li><strong>Booking details:</strong> Service type, preferred date/time, symptom descriptions, additional notes, safe-location confirmation</li>
                                <li><strong>Payment details:</strong> We do not store card numbers. Payments are processed securely by Stripe. We retain transaction references and payment status for invoicing.</li>
                                <li><strong>Contact form messages:</strong> Name, email, phone, postcode, message content</li>
                                <li><strong>Diagnostic report data:</strong> Vehicle fault findings, test results, media (photos/videos) uploaded as part of a diagnostic report</li>
                            </ul>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">Information collected automatically</h3>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li><strong>Browser localStorage:</strong> We temporarily store form progress in your browser&apos;s local storage for convenience. This data remains on your device only and is not transmitted to us unless you submit a form.</li>
                                <li><strong>Analytics:</strong> We use privacy-friendly analytics (Plausible Analytics or similar) that do not use cookies, do not collect personal data, and do not track individuals across sites. No data is shared with third parties for advertising.</li>
                                <li><strong>Server logs:</strong> Our web server may record IP addresses, request timestamps, and user-agent strings for security and operational purposes. These logs are retained for a limited period and are not used for marketing.</li>
                            </ul>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">Information from third parties</h3>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li><strong>Stripe:</strong> When you make a payment, Stripe may provide us with transaction confirmation, payment status, and a customer reference. We do not receive your full card number.</li>
                                <li><strong>Google Calendar:</strong> If you book an appointment, we create a calendar event using Google Calendar API. This contains booking details (name, service, time, postcode) but no sensitive financial data.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">3. How we use your data</h2>
                            <p className="mt-2">
                                We process your personal data for the following purposes:
                            </p>
                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-full border border-border-default divide-y divide-border-default">
                                    <thead>
                                        <tr className="bg-surface-elevated">
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-text-primary">Purpose</th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-text-primary">Lawful basis (UK GDPR)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        <tr><td className="px-4 py-2">Confirm and manage your diagnostic booking</td><td className="px-4 py-2">Performance of a contract</td></tr>
                                        <tr><td className="px-4 py-2">Communicate about your appointment (confirmations, reminders, on-the-way notifications)</td><td className="px-4 py-2">Performance of a contract</td></tr>
                                        <tr><td className="px-4 py-2">Process payments and issue invoices/receipts</td><td className="px-4 py-2">Performance of a contract / Legal obligation</td></tr>
                                        <tr><td className="px-4 py-2">Produce and share diagnostic reports with you</td><td className="px-4 py-2">Performance of a contract</td></tr>
                                        <tr><td className="px-4 py-2">Respond to your contact form enquiries</td><td className="px-4 py-2">Legitimate interest</td></tr>
                                        <tr><td className="px-4 py-2">Improve our services and website</td><td className="px-4 py-2">Legitimate interest</td></tr>
                                        <tr><td className="px-4 py-2">Comply with legal, tax, and regulatory obligations</td><td className="px-4 py-2">Legal obligation</td></tr>
                                        <tr><td className="px-4 py-2">Protect against fraud and maintain security</td><td className="px-4 py-2">Legitimate interest</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-2">
                                We do not use your data for automated decision-making or profiling.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">4. Data sharing</h2>
                            <p className="mt-2">
                                We do not sell, rent, or trade your personal data to third parties for marketing purposes.
                            </p>
                            <p className="mt-2">
                                We may share data with the following categories of service providers who assist in operating our business, under appropriate data protection agreements:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li><strong>Payment processing:</strong> Stripe (PCI-DSS compliant) for handling card payments</li>
                                <li><strong>Email delivery:</strong> Zoho Mail for sending booking confirmations, invoices, and service communications</li>
                                <li><strong>Calendar scheduling:</strong> Google Calendar API for managing appointments</li>
                                <li><strong>Hosting:</strong> Our website and API are hosted on infrastructure providers who process data on our behalf</li>
                            </ul>
                            <p className="mt-2">
                                We may also disclose your data if required by law, regulation, or legal process.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">5. Data retention</h2>
                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-full border border-border-default divide-y divide-border-default">
                                    <thead>
                                        <tr className="bg-surface-elevated">
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-text-primary">Data type</th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-text-primary">Retention period</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        <tr><td className="px-4 py-2">Booking and payment records</td><td className="px-4 py-2">6 years from the date of the transaction (HMRC requirement)</td></tr>
                                        <tr><td className="px-4 py-2">Contact form messages</td><td className="px-4 py-2">12 months, or until the enquiry is resolved</td></tr>
                                        <tr><td className="px-4 py-2">Diagnostic reports and media</td><td className="px-4 py-2">Retained until you request deletion, or 6 years from completion (whichever is shorter)</td></tr>
                                        <tr><td className="px-4 py-2">Analytics data</td><td className="px-4 py-2">Aggregated and anonymised; no personal data retained</td></tr>
                                        <tr><td className="px-4 py-2">Server logs</td><td className="px-4 py-2">90 days</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-2">
                                You may request earlier deletion of your data at any time (see Section 7).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">6. Data security</h2>
                            <p className="mt-2">
                                We take reasonable technical and organisational measures to protect your data:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>All data transmitted between your browser and our website is encrypted using TLS (HTTPS).</li>
                                <li>Payment card data is handled entirely by Stripe and never touches our servers.</li>
                                <li>Admin access to booking data is protected by authenticated sessions.</li>
                                <li>Media uploads (photos, documents) from diagnostic reports are stored securely and are only accessible via unique, unguessable share links.</li>
                                <li>We limit access to personal data to authorised personnel only.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">7. Your rights</h2>
                            <p className="mt-2">
                                Under the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018, you have the right to:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li><strong>Access</strong> your personal data (Subject Access Request)</li>
                                <li><strong>Rectify</strong> inaccurate or incomplete data</li>
                                <li><strong>Erase</strong> your data (&ldquo;right to be forgotten&rdquo;), subject to legal retention requirements</li>
                                <li><strong>Restrict</strong> processing in certain circumstances</li>
                                <li><strong>Data portability</strong> - receive your data in a structured, machine-readable format</li>
                                <li><strong>Object</strong> to processing based on legitimate interest</li>
                                <li><strong>Withdraw consent</strong> where processing is based on consent</li>
                            </ul>
                            <p className="mt-2">
                                To exercise any of these rights, contact us at <a href={`mailto:${email}`} className="text-brand hover:underline font-medium">{email}</a>. We will respond within one calendar month.
                            </p>
                            <p className="mt-2">
                                If you are not satisfied with our response, you have the right to lodge a complaint with the <strong>Information Commissioner&apos;s Office (ICO)</strong>:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>Website: <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">https://ico.org.uk</a></li>
                                <li>Helpline: 0303 123 1113</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">8. Cookies</h2>
                            <p className="mt-2">
                                Our website does not use cookies for tracking or advertising. We use privacy-friendly analytics that operate without cookies. Your browser&apos;s localStorage may be used to save form progress locally on your device - this is not a cookie and is not transmitted to any server unless you submit the form.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">9. Children&apos;s data</h2>
                            <p className="mt-2">
                                Our services are not directed at children under 18. We do not knowingly collect personal data from children. If you believe we have inadvertently collected such data, please contact us and we will delete it promptly.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">10. International transfers</h2>
                            <p className="mt-2">
                                Your data is primarily processed within the United Kingdom. Where data is processed by third-party providers outside the UK (e.g., Stripe, Google), we ensure appropriate safeguards are in place, such as Standard Contractual Clauses or adequacy decisions recognised by the UK Government.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">11. Changes to this policy</h2>
                            <p className="mt-2">
                                We may update this Privacy Policy from time to time. The latest version will always be available on our website at <a href={`${url}/legal/privacy-policy`} className="text-brand hover:underline">{url}/legal/privacy-policy</a>. Material changes will be highlighted with an updated &ldquo;Last updated&rdquo; date.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">12. Contact us</h2>
                            <p className="mt-2">
                                For any privacy-related queries or to exercise your data rights:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li><strong>Email:</strong> <a href={`mailto:${email}`} className="text-brand hover:underline">{email}</a></li>
                                <li><strong>Phone:</strong> {phoneDisplay}</li>
                                <li><strong>Post:</strong> Tripoint Diagnostics Ltd, 476 Sidcup Road, Eltham, London</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </Section>
        </>
    );
}
