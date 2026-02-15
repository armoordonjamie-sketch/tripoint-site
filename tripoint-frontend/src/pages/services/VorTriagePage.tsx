import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { PhotoGallery } from '@/components/PhotoGallery';
import { Notice } from '@/components/Notice';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { galleryImages } from '@/data/galleryImages';

const vorPhotos = [
    galleryImages[0],   // OM651 engine on floor jack
    galleryImages[30],  // Sprinter warning lights
    galleryImages[7],   // Frayed wiring harness
    galleryImages[38],  // Fuse box and relay panel
    galleryImages[29],  // MBUX breakdown alert
    galleryImages[3],   // IC5 control unit
];

export function VorTriagePage() {
    return (
        <>
            <Seo
                title="VOR / Priority Triage"
                description="Vehicle Off Road priority diagnostic service for commercial vehicles. Fast triage and back-on-road decisions. From £160."
                canonical="/services/vor-triage"
            />

            {/* Hero banner */}
            <section className="relative h-56 sm:h-72 overflow-hidden">
                <img src="/images/vor-triage.jpg" alt="" className="h-full w-full object-cover" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/30" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                    <div className="mx-auto max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Service</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                            VOR / Priority Triage
                        </h1>
                    </div>
                </div>
            </section>

            <Section>
                <div className="mx-auto max-w-3xl">
                    <p className="text-lg text-text-secondary">
                        When your van is off the road, every hour costs money. Priority scheduling and a clear &ldquo;back-on-road&rdquo; decision - fast.
                    </p>

                    <div className="mt-10">
                        <h2 className="text-2xl font-bold text-text-primary">Who It&apos;s For</h2>
                        <p className="mt-2 text-text-secondary">
                            Owner-driver couriers, delivery fleets, hire branches, and any commercial operator where a vehicle off the road
                            means lost revenue. If downtime costs you money, this is the service to book.
                        </p>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-text-primary">Common Scenarios</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'Van in limp mode mid-route or at depot',
                                'No-start / won\'t crank scenarios',
                                'AdBlue countdown blocking start',
                                'Electrical fault preventing operation',
                                'Returned hire vehicle with warning lights',
                                'Fleet vehicle needs urgent assessment',
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
                                'Everything in Standard Diagnostic Callout',
                                'Priority scheduling - confirmed as the next available slot',
                                '"Back-on-road" triage decision: fix now / parts needed / workshop referral',
                                'Clear documented outcome with repair timeline',
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
                        <h2 className="text-2xl font-bold text-text-primary">When Workshop Referral May Be Needed</h2>
                        <ul className="mt-4 space-y-2">
                            {[
                                'Major mechanical failure requiring ramp access',
                                'Heavy drivetrain work beyond mobile scope',
                                'Specialist tooling or extended disassembly needed',
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
                        <h2 className="text-2xl font-bold text-text-primary">VOR Jobs We&apos;ve Handled</h2>
                        <p className="mt-2 text-sm text-text-muted">Real photos from priority commercial vehicle callouts</p>
                        <div className="mt-4">
                            <PhotoGallery images={vorPhotos} columns={3} />
                        </div>
                    </div>

                    <div className="mt-10 rounded-2xl border border-brand/20 bg-brand/5 p-6 text-center">
                        <p className="text-2xl font-bold text-text-primary">
                            From <span className="text-brand-light">£160</span>
                        </p>
                        <p className="mt-1 text-sm text-text-secondary">Zone-based pricing - includes priority scheduling and up to 75 mins on-site</p>
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
                            VOR deposits are £50 for all zones. Reschedule free with 24 hours notice.
                        </Notice>
                    </div>
                </div>
            </Section>
        </>
    );
}
