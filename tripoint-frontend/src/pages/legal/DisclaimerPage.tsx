import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { siteConfig } from '@/config/site';

export function DisclaimerPage() {
    const { email, phoneDisplay } = siteConfig.contact;
    const url = siteConfig.url;
    const whatsappUrl = `https://wa.me/${siteConfig.contact.whatsappE164}`;

    return (
        <>
            <Seo
                title="Disclaimer"
                description="TriPoint Diagnostics disclaimer - independent service, mobile-only boundaries, emissions compliance, and safety requirements."
                canonical="/legal/disclaimer"
            />

            <Section>
                <div className="mx-auto max-w-3xl prose-invert">
                    <h1 className="text-4xl font-extrabold text-text-primary">Disclaimer</h1>
                    <p className="mt-2 text-sm text-text-muted">
                        <strong>Tripoint Diagnostics Ltd</strong>
                        <br />
                        Last updated: February 2026
                    </p>

                    <div className="mt-8 space-y-8 text-text-secondary">
                        <section>
                            <h2 className="text-xl font-bold text-text-primary">1. Independent service</h2>
                            <p className="mt-2">
                                Tripoint Diagnostics Ltd (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is an independent mobile vehicle diagnostics and repair service. We are <strong>not affiliated with, endorsed by, authorised by, or connected to any vehicle manufacturer</strong>, including but not limited to Mercedes-Benz, Daimler Truck, Volkswagen Group, Ford, Stellantis, or any other brand.
                            </p>
                            <p className="mt-2">
                                References to vehicle makes, models, platforms, and engine codes (e.g., Mercedes Sprinter, Vito, OM651, OM654, W906, W907) are used for <strong>descriptive purposes only</strong> to indicate the types of vehicles we work on. These names are trademarks of their respective owners.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">2. Diagnostic outcomes</h2>
                            <h3 className="mt-4 text-lg font-semibold text-text-primary">2.1 Nature of diagnostic findings</h3>
                            <p className="mt-2">
                                Diagnostic findings represent our professional assessment based on the data, symptoms, live readings, and conditions available <strong>at the time of the visit</strong>. They are based on:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>Electronic control unit (ECU) fault code scans across all vehicle systems</li>
                                <li>Freeze-frame data and stored event analysis</li>
                                <li>Live data monitoring and sensor plausibility checks</li>
                                <li>Guided tests and component actuations where appropriate</li>
                                <li>Visual and operational inspection</li>
                            </ul>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">2.2 Not a guarantee</h3>
                            <p className="mt-2">
                                Diagnostics identify the <strong>most probable cause(s)</strong> of a reported symptom or fault. They do not constitute:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>A guarantee that a specific repair will resolve the issue</li>
                                <li>A guarantee that no further faults exist beyond those identified</li>
                                <li>A complete mechanical or structural inspection of the vehicle</li>
                                <li>An MOT assessment or roadworthiness certificate</li>
                                <li>A vehicle valuation or purchase recommendation (even for pre-purchase health checks)</li>
                            </ul>
                            <p className="mt-2">
                                In complex or intermittent fault scenarios, further investigation, specialist testing, or a return visit may be recommended as part of our findings.
                            </p>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">2.3 Pre-purchase health checks</h3>
                            <p className="mt-2">
                                Our Pre-Purchase Digital Health Check provides a diagnostic snapshot at the time of inspection. It is <strong>not</strong> a substitute for:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>A full mechanical inspection by a qualified inspector</li>
                                <li>An HPI/provenance check</li>
                                <li>An MOT history review</li>
                                <li>An independent structural assessment</li>
                            </ul>
                            <p className="mt-2">
                                The check covers electronic system health, live data, and visible fault conditions. We do not inspect bodywork, structural integrity, tyres, brakes (beyond electronic data), or fluid condition unless specifically agreed.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">3. Emissions compliance</h2>
                            <h3 className="mt-4 text-lg font-semibold text-text-primary">3.1 Our position</h3>
                            <p className="mt-2">
                                Tripoint Diagnostics takes a strict, compliance-first stance on all emissions-related work. We <strong>do not perform, advertise, recommend, or facilitate</strong>:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>DPF (Diesel Particulate Filter) removal, gutting, or physical deletion</li>
                                <li>AdBlue / SCR (Selective Catalytic Reduction) system bypasses, emulators, or disabling</li>
                                <li>EGR (Exhaust Gas Recirculation) blanking, blocking, or software defeat</li>
                                <li>Catalytic converter removal or bypass</li>
                                <li>Any software modification, remap, or tuning file that disables, circumvents, or defeats emissions controls</li>
                                <li>Installation, supply, or recommendation of defeat devices of any kind</li>
                            </ul>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">3.2 Legal context</h3>
                            <p className="mt-2">
                                DPF removal is <strong>almost always illegal</strong> for road-registered vehicles in the UK. Under the Road Vehicles (Construction and Use) Regulations 1986 (as amended), it is an offence to use a vehicle on the road that has been modified to not meet the emissions standards it was designed to comply with. Consequences include:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>MOT failure</li>
                                <li>Fixed penalty notices</li>
                                <li>Higher fines for light goods vehicles (vans)</li>
                                <li>Potential insurance policy invalidation</li>
                            </ul>
                            <p className="mt-2 text-sm italic">
                                (Source: GOV.UK guidance on vehicle emissions and exhaust systems)
                            </p>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">3.3 ULEZ and Clean Air Zones</h3>
                            <p className="mt-2">
                                London&apos;s Ultra Low Emission Zone (ULEZ) operates 24/7 (except Christmas Day). Non-compliant vehicles under 3.5 tonnes are charged £12.50 per day. Other UK cities operate or are implementing Clean Air Zones with similar restrictions.
                            </p>
                            <p className="mt-2">
                                Our approach is to <strong>diagnose and repair</strong> emissions systems through proper procedures - not to bypass them. This protects you legally, keeps your vehicle compliant, and preserves its resale value.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">4. Mobile service limitations</h2>
                            <h3 className="mt-4 text-lg font-semibold text-text-primary">4.1 Location requirements</h3>
                            <p className="mt-2">
                                We operate as a mobile-only service. Work is carried out at the customer&apos;s location (driveway, depot, car park, yard, or similar). We reserve the right to decline or terminate a visit if the working environment is:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>On a live carriageway, hard shoulder, or red route</li>
                                <li>On unstable, sloped, or uneven ground that is unsafe for jacking or supporting</li>
                                <li>In an area with poor lighting, flooding, or severe weather</li>
                                <li>In a restricted area where parking or working is not permitted</li>
                                <li>Otherwise unsafe for the technician, the customer, or the public</li>
                            </ul>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">4.2 Scope of mobile work</h3>
                            <p className="mt-2">
                                Some repairs are beyond the safe or practical scope of mobile work, including but not limited to:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>Jobs requiring vehicle lift/ramp access</li>
                                <li>Transmission removal or internal engine work</li>
                                <li>Work requiring specialist alignment, calibration, or programming equipment only available in a workshop</li>
                                <li>Body, suspension, or structural repairs</li>
                            </ul>
                            <p className="mt-2">
                                Where we identify such a requirement, we will document our findings and refer you to an appropriate workshop with our diagnostic data and recommendations.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">5. Parts and components</h2>
                            <h3 className="mt-4 text-lg font-semibold text-text-primary">5.1 Options</h3>
                            <p className="mt-2">
                                Where parts replacement is recommended, we offer (where available):
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li><strong>OEM (Original Equipment Manufacturer)</strong> parts</li>
                                <li><strong>OEM-equivalent</strong> parts from reputable aftermarket suppliers</li>
                                <li><strong>Customer-supplied</strong> parts at your request</li>
                            </ul>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">5.2 Customer-supplied parts</h3>
                            <p className="mt-2">
                                If you supply your own parts, we will fit them at your request. However:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>We do not warrant the quality, suitability, or compatibility of customer-supplied parts</li>
                                <li>Warranty on the part is between you and your supplier</li>
                                <li>We warrant our <strong>labour only</strong> when fitting customer-supplied parts</li>
                                <li>If a customer-supplied part is found to be faulty, incorrect, or damaged, additional labour charges may apply</li>
                            </ul>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">5.3 Part warranty</h3>
                            <p className="mt-2">
                                Parts we source and fit are covered by the manufacturer&apos;s or supplier&apos;s warranty. Labour warranty for our fitting work is 30 days or 1,000 miles (whichever comes first), unless otherwise stated.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">6. Website content</h2>
                            <h3 className="mt-4 text-lg font-semibold text-text-primary">6.1 General information</h3>
                            <p className="mt-2">
                                The information on our website (<a href={url} className="text-brand hover:underline">{url}</a>) is provided for general informational purposes. While we make reasonable efforts to keep content accurate and current, we make no warranties or representations about the completeness, reliability, accuracy, or suitability of the information for any particular purpose.
                            </p>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">6.2 Pricing</h3>
                            <p className="mt-2">
                                Prices shown on our website are indicative and based on our published zone pricing structure. The final price for your job may vary depending on:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>Your actual zone (determined by postcode/drive-time calculation)</li>
                                <li>The service tier booked</li>
                                <li>Any additional work agreed during the visit</li>
                                <li>Parts costs (charged separately)</li>
                            </ul>
                            <p className="mt-2">
                                A confirmed quote is provided before any work begins.
                            </p>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">6.3 Blog and educational content</h3>
                            <p className="mt-2">
                                Blog posts, symptom guides, and educational content are published for informational purposes. They do not constitute professional mechanical advice for your specific vehicle or situation. Always have your vehicle assessed by a qualified technician before acting on general information.
                            </p>

                            <h3 className="mt-4 text-lg font-semibold text-text-primary">6.4 Third-party links</h3>
                            <p className="mt-2">
                                Our website may contain links to external websites. We are not responsible for the content, accuracy, or privacy practices of third-party sites. Inclusion of a link does not imply endorsement.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">7. Limitation of liability</h2>
                            <p className="mt-2">
                                To the fullest extent permitted by law:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>Our total liability for any claim arising from the provision of our services is limited to the value of the service fee paid for the relevant visit.</li>
                                <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of earnings, business interruption, vehicle hire costs, ULEZ/Clean Air Zone charges, insurance premium changes, or any other financial loss.</li>
                                <li>We are not liable for pre-existing vehicle conditions, undisclosed modifications, or faults that were not present, detectable, or symptomatic at the time of our visit.</li>
                                <li>Nothing in this disclaimer excludes or limits our liability for death or personal injury caused by our negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be excluded by law.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">8. Regulatory and access landscape</h2>
                            <h3 className="mt-4 text-lg font-semibold text-text-primary">8.1 Block exemption</h3>
                            <p className="mt-2">
                                The UK Motor Vehicle Block Exemption Order permits independent operators to access vehicle technical information for repair and maintenance purposes. The current exemption runs until 31 May 2029 (Legislation.gov.uk).
                            </p>
                            <h3 className="mt-4 text-lg font-semibold text-text-primary">8.2 SERMI / security-related access</h3>
                            <p className="mt-2">
                                The UK Security-Related Repair and Maintenance Information (SERMI) scheme is anticipated to go live on 1 April 2026. This scheme governs access to security-related vehicle data and functions. Our procedures and authorisations will be updated in line with regulatory requirements as they come into force.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">9. Force majeure</h2>
                            <p className="mt-2">
                                We are not liable for any failure or delay in performing our obligations where such failure or delay results from circumstances beyond our reasonable control, including but not limited to severe weather, road closures, public health emergencies, utility failures, or supplier disruptions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">10. Governing law</h2>
                            <p className="mt-2">
                                This Disclaimer is governed by the laws of England and Wales. Any disputes arising from or in connection with this Disclaimer will be subject to the exclusive jurisdiction of the courts of England and Wales.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary">11. Contact us</h2>
                            <p className="mt-2">
                                For any questions about this Disclaimer:
                            </p>
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
