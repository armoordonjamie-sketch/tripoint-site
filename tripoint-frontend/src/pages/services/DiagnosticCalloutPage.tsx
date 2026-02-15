import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { PhotoGallery } from '@/components/PhotoGallery';
import { Notice } from '@/components/Notice';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { galleryImages } from '@/data/galleryImages';

const diagnosticPhotos = [
    galleryImages[22],  // Leak detection foam on engine
    galleryImages[2],   // Milwaukee impact in engine bay
    galleryImages[47],  // Borescope inspection
    galleryImages[30],  // Sprinter warning lights
    galleryImages[4],   // Damaged wiring loom
    galleryImages[9],   // Vacuum gauge testing
];

export function DiagnosticCalloutPage() {
    return (
        <>
            <Seo
                title="Diagnostic Callout"
                description="Mobile diagnostic callout service - full-system scan, live data, guided tests, and a written fix plan. From £120 across Kent & SE London."
                canonical="/services/diagnostic-callout"
            />

            {/* Hero banner */}
            <section className="relative h-56 sm:h-72 overflow-hidden">
                <img src="/images/diagnostic-callout.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/30" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                    <div className="mx-auto max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Service</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                            Diagnostic Callout
                        </h1>
                    </div>
                </div>
            </section>

            <Section>
                <div className="mx-auto max-w-3xl">
                    <p className="text-lg text-text-secondary">
                        The foundation of everything we do. A thorough on-site diagnostic visit with professional-grade tooling - at your location.
                    </p>

                    {/* Who it's for */}
                    <div className="mt-10">
                        <h2 className="text-2xl font-bold text-text-primary">Who It&apos;s For</h2>
                        <p className="mt-2 text-text-secondary">
                            Any driver or operator with a warning light, fault symptoms, or concern that needs proper investigation  -
                            not just a code read. Ideal for cars, vans, and commercial vehicles across all makes.
                        </p>
                    </div>

                    {/* Symptoms / Use cases */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-text-primary">Common Symptoms</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'Engine management light (EML) or check engine light on',
                                'Limp mode / reduced power',
                                'Unusual noises, vibrations, or performance issues',
                                'Warning lights (ABS, ESP, glow plug, battery)',
                                'Intermittent faults or difficult-to-reproduce problems',
                                'Vehicle not starting or cranking issues',
                            ].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* What's included */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-text-primary">What&apos;s Included</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'Full-system scan (all modules, not just engine)',
                                'Freeze frame and fault code analysis',
                                'Live data checks and sensor plausibility',
                                'Guided tests and actuations where applicable',
                                'Written findings and root cause analysis',
                                'Recommended next steps and quote for follow-on work',
                                'Up to 60 minutes on-site time',
                            ].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Examples from our work */}
                    <div className="mt-10">
                        <h2 className="text-2xl font-bold text-text-primary">Examples From Our Work</h2>
                        <p className="mt-2 text-sm text-text-muted">Real photos from real diagnostic callouts</p>
                        <div className="mt-4">
                            <PhotoGallery images={diagnosticPhotos} columns={3} />
                        </div>
                    </div>

                    {/* What's NOT included */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-text-primary">When Workshop Referral May Be Needed</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'Work requiring ramp or major underbody access',
                                'Heavy drivetrain jobs that can\'t be done safely mobile',
                                'Faults requiring manufacturer-specific online access (documented for referral)',
                            ].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pricing CTA */}
                    <div className="mt-10 rounded-2xl border border-brand/20 bg-brand/5 p-6 text-center">
                        <p className="text-2xl font-bold text-text-primary">
                            From <span className="text-brand-light">£120</span>
                        </p>
                        <p className="mt-1 text-sm text-text-secondary">Zone-based pricing - includes travel and up to 60 mins on-site</p>
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
                        <Notice variant="info">
                            All diagnostic services end with a written outcome - fault codes, checks performed, root cause analysis, and recommended next steps.
                        </Notice>
                    </div>
                </div>
            </Section>
        </>
    );
}
