import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { siteConfig } from '@/config/site';

export function TermsPage() {
    const { email, phoneDisplay } = siteConfig.contact;
    const url = siteConfig.url;
    const whatsappUrl = `https://wa.me/${siteConfig.contact.whatsappE164}`;

    return (
        <>
            <Seo
                title="Terms of Service"
                description="TriPoint Diagnostics terms of service - service terms, deposits, cancellations, and limits."
                canonical="/legal/terms"
            />

            <Section>
                <div className="mx-auto max-w-3xl prose-invert">
                    <h1 className="text-4xl font-extrabold text-text-primary">Terms of Service</h1>
                    <p className="mt-2 text-sm text-text-muted">
                        <strong>Tripoint Diagnostics Ltd</strong>
                        <br />
                        Last updated: February 2026
                    </p>

                    <div className="mt-8 space-y-8 text-text-secondary">
                        <section>
                            <h2 className="text-xl font-bold text-text-primary">1. Introduction</h2>
                            <p className="mt-2">
                                These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the services provided by Tripoint Diagnostics Ltd (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), Company No. 17038307, registered at 476 Sidcup Road, Eltham, London.
                            </p>
                            <p className="mt-2">
                                By booking a service or using our website, you agree to these Terms. Please read them carefully before placing a booking.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">2. Service overview</h2>
                            <p className="mt-2">
                                Tripoint Diagnostics provides mobile vehicle diagnostic and selected repair services across Kent and South East London. All services are:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li><strong>Appointment-based</strong> and subject to availability within our published coverage area</li>
                                <li><strong>Mobile-only</strong> - we attend your location; we do not operate from a fixed workshop</li>
                                <li><strong>Diagnostics-first</strong> - every job concludes with documented findings and recommended next steps</li>
                            </ul>
                            <p className="mt-2">
                                Our published service catalogue, pricing, and coverage zones are available on our website at <a href={url} className="text-brand hover:underline">{url}</a>.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">3. Booking and deposits</h2>
                            <h3 className="mt-4 text-lg font-semibold text-text-primary">3.1 How bookings work</h3>
                            <ol className="mt-2 list-decimal list-inside space-y-1">
                                <li>You submit a booking request via our website or by contacting us directly.</li>
                                <li>We confirm availability and provide a quote based on your postcode (zone), service type, and vehicle.</li>
                                <li>A deposit is required to secure your booking slot.</li>
                                <li>Once the deposit is paid, your booking is confirmed and a calendar slot is reserved.</li>
                            </ol>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">3.2 Deposit amounts</h3>
                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-full border border-border-default divide-y divide-border-default">
                                    <thead>
                                        <tr className="bg-surface-elevated">
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-text-primary">Zone</th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-text-primary">Deposit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-default">
                                        <tr><td className="px-4 py-2">Zone A (0–25 min drive)</td><td className="px-4 py-2">£30</td></tr>
                                        <tr><td className="px-4 py-2">Zone B (25–45 min drive)</td><td className="px-4 py-2">£30</td></tr>
                                        <tr><td className="px-4 py-2">Zone C (45–60 min drive)</td><td className="px-4 py-2">£50</td></tr>
                                        <tr><td className="px-4 py-2">VOR / Priority bookings</td><td className="px-4 py-2">£50</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">3.3 Payment methods</h3>
                            <p className="mt-2">
                                We accept card payments processed securely through Stripe. The deposit is deducted from the total service cost. The remaining balance is due on completion of the visit.
                            </p>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">3.4 Invoices</h3>
                            <p className="mt-2">
                                An invoice or receipt will be provided for every completed job, either by email or on request.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">4. Cancellations and rescheduling</h2>
                            <h3 className="mt-4 text-lg font-semibold text-text-primary">4.1 Customer cancellations</h3>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li><strong>24+ hours&apos; notice:</strong> Reschedule free of charge - your deposit carries over to the new date.</li>
                                <li><strong>Less than 24 hours&apos; notice or no-show:</strong> The deposit is retained to cover the reserved time slot and travel planning costs. No further charges apply.</li>
                            </ul>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">4.2 Our cancellations</h3>
                            <p className="mt-2">
                                We reserve the right to cancel or reschedule a booking if:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>Weather or road conditions make travel unsafe</li>
                                <li>The vehicle location is assessed as unsafe to work at (see Section 6)</li>
                                <li>Unforeseen circumstances prevent us from attending</li>
                            </ul>
                            <p className="mt-2">
                                In these cases, we will offer a rescheduled appointment or a full deposit refund at your choice.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">5. Pricing and additional charges</h2>
                            <h3 className="mt-4 text-lg font-semibold text-text-primary">5.1 Published pricing</h3>
                            <p className="mt-2">
                                Our published prices cover the diagnostic visit and the included on-site time for each service tier. Current pricing is displayed at <a href={`${url}/pricing`} className="text-brand hover:underline">{url}/pricing</a>.
                            </p>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">5.2 Follow-on work</h3>
                            <p className="mt-2">
                                If additional labour is needed beyond the included on-site time, it is charged at £85/hour, billed in 15-minute increments. This will be discussed and agreed with you before any additional work begins.
                            </p>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">5.3 Parts</h3>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>Parts are charged separately from diagnostic/labour fees.</li>
                                <li>Expensive components (e.g., NOx sensors, injectors) may require a parts deposit before ordering.</li>
                                <li>We offer three options where applicable: OEM, OEM-equivalent, or customer-supplied.</li>
                                <li><strong>Customer-supplied parts:</strong> We will fit them at your request, but warranty coverage on the part itself is between you and the supplier. We warrant our labour only.</li>
                                <li>Part numbers and supporting evidence (scan data, live readings) will be documented.</li>
                            </ul>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">5.4 Coding and adaptations</h3>
                            <p className="mt-2">
                                Software coding, adaptations, or initialisations required as part of a repair are charged from £45, as detailed in our pricing page.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">6. Service limitations and safety</h2>
                            <h3 className="mt-4 text-lg font-semibold text-text-primary">6.1 Mobile-only boundaries</h3>
                            <p className="mt-2">
                                We operate exclusively as a mobile service. We may decline, rearrange, or terminate a job if:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>The vehicle is on a live road, unsafe roadside, or red route</li>
                                <li>There is no safe, level ground to work on</li>
                                <li>Poor lighting or weather makes working unsafe</li>
                                <li>The repair requires ramp-level access or workshop-level equipment</li>
                                <li>The location poses a risk to the technician or the public</li>
                            </ul>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">6.2 Customer responsibilities</h3>
                            <p className="mt-2">
                                You are responsible for:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>Ensuring the vehicle is in a safe, accessible location (driveway, yard, depot, car park - <strong>not</strong> a live carriageway)</li>
                                <li>Being available or reachable by phone during the appointment</li>
                                <li>Providing accurate vehicle and symptom information at the time of booking</li>
                                <li>Disclosing any known vehicle faults, modifications, or prior work relevant to the diagnosis</li>
                            </ul>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">6.3 Workshop referral</h3>
                            <p className="mt-2">
                                If a fault requires workshop-level equipment, ramp access, or specialist tooling beyond the scope of mobile work, we will provide a documented referral with our findings and recommended next steps. This is included as part of our diagnostic service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">7. Diagnostic outcomes and liability</h2>
                            <h3 className="mt-4 text-lg font-semibold text-text-primary">7.1 Nature of diagnostics</h3>
                            <p className="mt-2">
                                Diagnostic findings are based on the data, symptoms, and conditions available at the time of the visit. Diagnostics identify the most probable cause(s) based on:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>Full-system scans and fault code analysis</li>
                                <li>Freeze-frame and live data interpretation</li>
                                <li>Guided tests and actuations where appropriate</li>
                                <li>Visual and operational checks</li>
                            </ul>
                            <p className="mt-2">
                                Diagnostics do <strong>not</strong> guarantee a specific repair outcome. In complex cases, further investigation, a return visit, or workshop-level diagnosis may be recommended.
                            </p>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">7.2 Written outcomes</h3>
                            <p className="mt-2">
                                Every job concludes with a written outcome - findings, probable cause(s), and recommended next steps - delivered by email or via our diagnostic report system. This is your record and can be shared with other workshops if needed.
                            </p>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">7.3 Limitation of liability</h3>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>Tripoint Diagnostics Ltd carries public liability and professional indemnity insurance.</li>
                                <li>Our total liability for any claim arising from a service is limited to the value of the service fee paid for that visit.</li>
                                <li>We are not liable for:
                                    <ul className="ml-6 mt-1 list-disc space-y-1">
                                        <li>Pre-existing vehicle conditions discovered during diagnosis</li>
                                        <li>Issues that develop after the visit that were not present or detectable at the time</li>
                                        <li>Consequential losses, including but not limited to loss of earnings, vehicle hire costs, or ULEZ charges</li>
                                        <li>Damage caused by customer-supplied parts or prior third-party work</li>
                                        <li>Delays caused by parts availability from third-party suppliers</li>
                                    </ul>
                                </li>
                            </ul>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">7.4 Insurance</h3>
                            <p className="mt-2">
                                We maintain appropriate insurance for our business activities, including:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>Public liability insurance</li>
                                <li>Professional indemnity insurance</li>
                                <li>Tools and equipment cover</li>
                            </ul>
                            <p className="mt-2">
                                Details of our cover can be provided on request.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">8. Emissions compliance</h2>
                            <p className="mt-2">
                                Tripoint Diagnostics takes a strict compliance-first position on all emissions-related work.
                            </p>
                            <p className="mt-2 font-medium">
                                We do not perform, market, or facilitate:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>DPF (Diesel Particulate Filter) removal or physical deletion</li>
                                <li>AdBlue / SCR system bypasses or disabling</li>
                                <li>EGR (Exhaust Gas Recirculation) blanking or defeat</li>
                                <li>Any software modification that disables, circumvents, or defeats emissions controls</li>
                            </ul>
                            <p className="mt-2">
                                DPF removal is almost always illegal for road vehicles in the UK and can result in MOT failure and fines, including higher penalties for light goods vehicles (GOV.UK guidance).
                            </p>
                            <p className="mt-2">
                                All emissions-related work is carried out on a diagnosis-and-compliant-repair basis only. We verify repairs through proper procedures (forced regeneration, adaptation resets, live data confirmation).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">9. Intellectual property</h2>
                            <p className="mt-2">
                                All content on our website - including text, images, design, logos, diagnostic reports, and case studies - is the property of Tripoint Diagnostics Ltd or its licensors and is protected by UK copyright and intellectual property law.
                            </p>
                            <p className="mt-2">
                                You may not reproduce, distribute, or republish our content without prior written permission, except for personal use of diagnostic reports issued to you.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">10. Website use</h2>
                            <h3 className="mt-4 text-lg font-semibold text-text-primary">10.1 Accuracy</h3>
                            <p className="mt-2">
                                We make reasonable efforts to keep website information accurate and up to date, but we do not warrant that all content is error-free. Pricing, availability, and service details may change without notice.
                            </p>
                            <h3 className="mt-4 text-lg font-semibold text-text-primary">10.2 Availability</h3>
                            <p className="mt-2">
                                We do not guarantee uninterrupted access to our website or booking system. We may carry out maintenance or updates that temporarily affect availability.
                            </p>
                            <h3 className="mt-4 text-lg font-semibold text-text-primary">10.3 Third-party links</h3>
                            <p className="mt-2">
                                Our website may contain links to third-party websites. We are not responsible for the content or privacy practices of those sites.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">11. Disputes and complaints</h2>
                            <p className="mt-2">
                                If you are unhappy with any aspect of our service:
                            </p>
                            <ol className="mt-2 list-decimal list-inside space-y-1">
                                <li><strong>Contact us first</strong> at <a href={`mailto:${email}`} className="text-brand hover:underline">{email}</a> or {phoneDisplay}. We aim to resolve all complaints within 14 days.</li>
                                <li>If we cannot resolve the matter directly, you may seek independent advice or use an alternative dispute resolution service.</li>
                            </ol>
                            <p className="mt-2">
                                These Terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">12. Consumer rights</h2>
                            <p className="mt-2">
                                Nothing in these Terms affects your statutory rights as a consumer under the Consumer Rights Act 2015 or other applicable UK legislation. Where our services are provided to consumers, the provisions of the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013 apply where relevant.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">13. Changes to these Terms</h2>
                            <p className="mt-2">
                                We may update these Terms from time to time. The latest version will always be available on our website at <a href={`${url}/legal/terms`} className="text-brand hover:underline">{url}/legal/terms</a>. The &ldquo;Last updated&rdquo; date at the top of this page indicates when the most recent changes were made.
                            </p>
                            <p className="mt-2">
                                Continued use of our services after changes are published constitutes acceptance of the updated Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">14. Contact us</h2>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li><strong>Email:</strong> <a href={`mailto:${email}`} className="text-brand hover:underline">{email}</a></li>
                                <li><strong>Phone:</strong> {phoneDisplay}</li>
                                <li><strong>WhatsApp:</strong> <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">https://wa.me/message/NROKKGS6QK54G1</a></li>
                                <li><strong>Post:</strong> Tripoint Diagnostics Ltd, 476 Sidcup Road, Eltham, London</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </Section>
        </>
    );
}
