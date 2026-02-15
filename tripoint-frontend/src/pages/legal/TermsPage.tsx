import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';

export function TermsPage() {
    return (
        <>
            <Seo
                title="Terms of Service"
                description="TriPoint Diagnostics terms of service - service terms, deposits, cancellations, and limits."
                canonical="/legal/terms"
            />

            <Section>
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-4xl font-extrabold text-text-primary">Terms of Service</h1>
                    <p className="mt-2 text-sm text-text-muted">Last updated: [DATE]</p>

                    <div className="mt-8 space-y-6 text-text-secondary">
                        <div>
                            <h2 className="text-xl font-bold text-text-primary">1. Service Overview</h2>
                            <p className="mt-2">
                                TriPoint Diagnostics provides mobile vehicle diagnostic and selected repair services. All services are
                                appointment-based and subject to availability within our coverage area.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-text-primary">2. Deposits &amp; Payment</h2>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>A deposit is required to secure your booking: £30 for Zone A/B, £50 for Zone C or VOR bookings.</li>
                                <li>The remaining balance is due on completion of the visit.</li>
                                <li>Payment methods accepted: [SPECIFY METHODS]</li>
                                <li>An invoice/receipt will be provided for every job.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-text-primary">3. Cancellations &amp; Rescheduling</h2>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>Reschedule free with at least 24 hours notice - your deposit carries over.</li>
                                <li>Late cancellation (less than 24 hours) or no-show: the deposit is retained to cover reserved time and travel planning.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-text-primary">4. Service Limitations</h2>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>We are mobile-only and will only work where it is safe and practical.</li>
                                <li>We may decline or rearrange jobs at unsafe locations (live roads, red routes, poor lighting/ground conditions).</li>
                                <li>Repairs requiring ramp access or workshop-level equipment will be referred to an appropriate workshop.</li>
                                <li>Diagnostics provide findings and recommendations - they are not a guarantee of repair outcome.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-text-primary">5. Parts</h2>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>Parts are charged separately from diagnostic fees.</li>
                                <li>Expensive parts (e.g., NOx sensors) may require a parts deposit upfront.</li>
                                <li>Options: OEM, OEM-equivalent, or customer-supplied (with warranty terms discussed before ordering).</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-text-primary">6. Liability</h2>
                            <p className="mt-2">
                                TriPoint Diagnostics carries public liability and professional indemnity insurance.
                                Our liability is limited to the value of the service provided. We are not liable for pre-existing conditions
                                discovered during diagnosis or for issues that develop after the visit.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-text-primary">7. Emissions Compliance</h2>
                            <p className="mt-2">
                                We do not perform emissions deletes, DPF removal, EGR blanking, or any defeat device installation.
                                All emissions-related work is carried out on a diagnosis-and-compliant-repair basis only.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-text-primary">8. Changes to Terms</h2>
                            <p className="mt-2">
                                We may update these terms from time to time. The latest version will always be available on this page.
                            </p>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}
