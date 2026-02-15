import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { PhotoGallery } from '@/components/PhotoGallery';
import { Notice } from '@/components/Notice';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { galleryImages } from '@/data/galleryImages';

const emissionsPhotos = [
    galleryImages[25],  // Fouled EGR pipe on Sprinter
    galleryImages[34],  // Carbon-clogged MAP sensor
    galleryImages[13],  // Sooty exhaust tailpipe
    galleryImages[42],  // Garrett turbocharger soot
    galleryImages[26],  // NOx sensor probe
    galleryImages[43],  // Intake manifold with carbon
];

export function EmissionsDiagnosticsPage() {
    return (
        <>
            <Seo
                title="Emissions Fault Decision Visit"
                description="Compliance-first diagnosis for AdBlue, SCR, DPF, and NOx faults. No deletes or defeat devices - proper diagnosis and repair only. From £170."
                canonical="/services/emissions-diagnostics"
            />

            {/* Hero banner */}
            <section className="relative h-56 sm:h-72 overflow-hidden">
                <img src="/images/emissions-diagnostics.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/30" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                    <div className="mx-auto max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Service</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                            Emissions Fault Decision Visit
                        </h1>
                    </div>
                </div>
            </section>

            <Section>
                <div className="mx-auto max-w-3xl">
                    <p className="text-lg text-text-secondary">
                        AdBlue / SCR / DPF / NOx - compliance-first diagnosis and repair. We fix emissions systems properly; we don&apos;t disable them.
                    </p>

                    <div className="mt-6">
                        <Notice variant="compliance">
                            <strong>We diagnose and repair emissions systems; we do not disable them.</strong> No DPF removals, no AdBlue bypasses,
                            no EGR blanking, no defeat devices. Every emissions job follows compliant manufacturer procedures.
                        </Notice>
                    </div>

                    <div className="mt-10">
                        <h2 className="text-2xl font-bold text-text-primary">Who It&apos;s For</h2>
                        <p className="mt-2 text-text-secondary">
                            Any vehicle owner or fleet operator dealing with emissions-related warnings, countdowns, or faults  -
                            especially those operating in ULEZ or using AdBlue/SCR-equipped vehicles. If you need a proper answer
                            (not a delete), this is the visit to book.
                        </p>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-text-primary">Common Symptoms</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'AdBlue countdown or "Start Not Possible" warning',
                                'DPF warning light or failed forced regen',
                                'SCR efficiency faults or NOx sensor errors',
                                'EGR-related performance issues',
                                'Excessive soot load / DPF pressure differential warnings',
                                'MIL (malfunction indicator lamp) for emissions components',
                                'ULEZ compliance concerns',
                            ].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-text-primary">What&apos;s Included</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'Full emissions system scan and fault code analysis',
                                'Live data validation: temperatures, pressures, NOx values, AdBlue quality/level',
                                'Regen safety gating - we check before forcing a regen',
                                'Component-level verification steps (sensors, heaters, injectors, pumps)',
                                'Compliance-first written plan with root cause and recommended repair',
                                'Up to 90 minutes on-site time',
                            ].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-text-primary">What&apos;s NOT Included</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'DPF removal or physical deletion',
                                'AdBlue system bypass or defeat devices',
                                'EGR blanking or defeat',
                                'Any software calibration that disables emissions controls',
                                'Work that would cause MOT failure or legal non-compliance',
                            ].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Examples from our work */}
                    <div className="mt-10">
                        <h2 className="text-2xl font-bold text-text-primary">Emissions Faults We&apos;ve Found</h2>
                        <p className="mt-2 text-sm text-text-muted">Real examples of EGR, DPF, and exhaust system faults from our jobs</p>
                        <div className="mt-4">
                            <PhotoGallery images={emissionsPhotos} columns={3} />
                        </div>
                    </div>

                    <div className="mt-10 rounded-2xl border border-brand/20 bg-brand/5 p-6 text-center">
                        <p className="text-2xl font-bold text-text-primary">
                            From <span className="text-brand-light">£170</span>
                        </p>
                        <p className="mt-1 text-sm text-text-secondary">Zone-based pricing - includes travel and up to 90 mins on-site</p>
                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                            <CTAButton href="/pricing" variant="outline" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
                                Full Pricing
                            </CTAButton>
                            <CTAButton href="/booking" size="sm">
                                Book Now
                            </CTAButton>
                        </div>
                    </div>

                    <div className="mt-8">
                        <Notice variant="warning">
                            UK law is clear: DPF removal is almost always illegal for road vehicles and can result in MOT failure and fines.
                            ULEZ non-compliance costs £12.50/day for vans. We help you fix it properly.
                        </Notice>
                    </div>
                </div>
            </Section>
        </>
    );
}
