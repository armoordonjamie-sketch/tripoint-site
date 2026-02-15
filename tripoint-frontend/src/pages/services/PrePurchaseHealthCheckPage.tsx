import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { PhotoGallery } from '@/components/PhotoGallery';
import { Notice } from '@/components/Notice';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { galleryImages } from '@/data/galleryImages';

const prePurchasePhotos = [
    galleryImages[29],  // MBUX dashboard scan
    galleryImages[1],   // Open engine bay with tools
    galleryImages[30],  // Warning light cluster 
    galleryImages[10],  // Brake caliper inspection
    galleryImages[47],  // Borescope inspection
    galleryImages[24],  // Stanley borescope screen
];

export function PrePurchaseHealthCheckPage() {
    return (
        <>
            <Seo
                title="Pre-Purchase Digital Health Check"
                description="Professional pre-purchase vehicle inspection with deep scan and buyer risk summary. Know what you're buying before you commit. From £160."
                canonical="/services/pre-purchase-health-check"
            />

            {/* Hero banner */}
            <section className="relative h-56 sm:h-72 overflow-hidden">
                <img src="/images/pre-purchase.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/30" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                    <div className="mx-auto max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Service</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                            Pre-Purchase Digital Health Check
                        </h1>
                    </div>
                </div>
            </section>

            <Section>
                <div className="mx-auto max-w-3xl">
                    <p className="text-lg text-text-secondary">
                        Know exactly what you&apos;re buying. A deep diagnostic scan with buyer risk summary - before you hand over any money.
                    </p>

                    <div className="mt-10">
                        <h2 className="text-2xl font-bold text-text-primary">Who It&apos;s For</h2>
                        <p className="mt-2 text-text-secondary">
                            Anyone buying a used vehicle - especially modern diesels, vans, or vehicles with complex electronics.
                            If the seller says &ldquo;it&apos;s fine&rdquo; but you want proof, we&apos;ll give you the data.
                        </p>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-text-primary">When to Book</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'Before buying a used van or car from a dealer or private seller',
                                'When a vehicle has been sitting / low mileage and you suspect hidden issues',
                                'If the seller\'s history is patchy or missing',
                                'For fleet acquisitions where you need documented condition',
                                'When you want confidence before committing to a purchase',
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
                                'Full-system diagnostic scan (all modules)',
                                'Key health indicators: DPF soot load, AdBlue quality, battery state, oil condition data',
                                'Fault code history and freeze frame analysis',
                                'Sensor plausibility and live data spot checks',
                                'Buyer risk summary: what you should know and what to negotiate on',
                                'Written report suitable for sharing with seller or insurer',
                                'Up to 75 minutes on-site time',
                            ].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-text-primary">What This Isn&apos;t</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'Not a full mechanical inspection (we focus on the digital side)',
                                'Not a warranty or guarantee on the vehicle',
                                'Not a substitute for HPI check or service history verification',
                            ].map((s) => (
                                <li key={s} className="flex items-start gap-2 text-text-secondary">
                                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Examples from our work */}
                    <div className="mt-10">
                        <h2 className="text-2xl font-bold text-text-primary">What We Check</h2>
                        <p className="mt-2 text-sm text-text-muted">Real inspection photos from pre-purchase health checks</p>
                        <div className="mt-4">
                            <PhotoGallery images={prePurchasePhotos} columns={3} />
                        </div>
                    </div>

                    <div className="mt-10 rounded-2xl border border-brand/20 bg-brand/5 p-6 text-center">
                        <p className="text-2xl font-bold text-text-primary">
                            From <span className="text-brand-light">£160</span>
                        </p>
                        <p className="mt-1 text-sm text-text-secondary">Zone-based pricing - includes travel and up to 75 mins on-site</p>
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
                            Tip: Book the health check at the seller&apos;s location before you agree to purchase. It&apos;s much easier to negotiate (or walk away) with data in hand.
                        </Notice>
                    </div>
                </div>
            </Section>
        </>
    );
}
