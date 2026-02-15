import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';

export function DisclaimerPage() {
    return (
        <>
            <Seo
                title="Disclaimer"
                description="TriPoint Diagnostics disclaimer - independent service, mobile-only boundaries, emissions compliance, and safety requirements."
                canonical="/legal/disclaimer"
            />

            <Section>
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-4xl font-extrabold text-text-primary">Disclaimer</h1>
                    <p className="mt-2 text-sm text-text-muted">Last updated: [DATE]</p>

                    <div className="mt-8 space-y-6 text-text-secondary">
                        <div>
                            <h2 className="text-xl font-bold text-text-primary">Independent Service</h2>
                            <p className="mt-2">
                                TriPoint Diagnostics is an independent mobile vehicle diagnostics and repair service.
                                We are <strong>not affiliated with, endorsed by, or connected to any vehicle manufacturer</strong>,
                                including but not limited to Mercedes-Benz, Volkswagen, Ford, or any other brand.
                            </p>
                            <p className="mt-2">
                                References to vehicle makes and models (e.g., Mercedes Sprinter, OM651) are for descriptive purposes
                                only and do not imply any manufacturer relationship.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-text-primary">Mobile-Only Boundaries</h2>
                            <p className="mt-2">
                                We operate exclusively as a mobile service. We may decline or rearrange jobs if:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>The vehicle is on a live road, unsafe roadside, or red route</li>
                                <li>There is no safe space to jack or support the vehicle</li>
                                <li>Poor lighting or ground conditions make working unsafe</li>
                                <li>The repair requires ramp-level access or workshop equipment</li>
                            </ul>
                            <p className="mt-2">
                                Safety is non-negotiable. The customer is responsible for ensuring the vehicle is in a safe,
                                accessible working location.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-text-primary">Emissions Compliance</h2>
                            <p className="mt-2">
                                TriPoint Diagnostics takes a compliance-first stance on all emissions-related work.
                                We <strong>do not perform, advertise, or facilitate</strong>:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>DPF removal or physical deletion</li>
                                <li>AdBlue/SCR system bypasses</li>
                                <li>EGR blanking or defeat</li>
                                <li>Any software modification that disables emissions controls</li>
                            </ul>
                            <p className="mt-2">
                                DPF removal is almost always illegal for road vehicles in the UK and can result in MOT failure
                                and fines. We diagnose and repair emissions systems through proper procedures only.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-text-primary">Diagnostic Outcomes</h2>
                            <p className="mt-2">
                                Diagnostic findings are based on the data, symptoms, and conditions available at the time of the visit.
                                While we strive for accuracy, diagnostics identify the most likely cause(s) - they do not guarantee
                                a specific repair outcome. Further investigation or additional work may be needed in some cases.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-text-primary">Website Content</h2>
                            <p className="mt-2">
                                The information on this website is provided for general informational purposes. While we make every effort
                                to keep content accurate and up to date, we make no warranties about the completeness, reliability,
                                or accuracy of the information.
                            </p>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}
