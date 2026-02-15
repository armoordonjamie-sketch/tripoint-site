import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { PhotoGallery } from '@/components/PhotoGallery';
import { Notice } from '@/components/Notice';
import { Wrench, Truck, Shield, MapPin, Users, FileText } from 'lucide-react';
import { galleryImages } from '@/data/galleryImages';

/* Curated images showing tools, diagnostics, and engine work for About page */
const aboutPhotos = [
    galleryImages[47],  // Borescope inspection
    galleryImages[40],  // Clamp multimeter
    galleryImages[41],  // Multimeter and oscilloscope
    galleryImages[48],  // Owon oscilloscope
    galleryImages[2],   // Milwaukee impact in engine bay
    galleryImages[45],  // DeWalt work light on engine bay
    galleryImages[24],  // Stanley borescope on screen
    galleryImages[29],  // MBUX breakdown alert screen
];

export function AboutPage() {
    return (
        <>
            <Seo
                title="About"
                description="About TriPoint Diagnostics - independent, compliance-first mobile diagnostics for vans and cars across Kent & SE London."
                canonical="/about"
            />

            <Section>
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                        About TriPoint Diagnostics
                    </h1>
                    <p className="mt-4 text-lg text-text-secondary">
                        Dealer-level diagnostic thinking in a mobile format. Independent, compliance-first, and focused on getting you a proper answer.
                    </p>

                    <div className="mt-10 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-text-primary">Why Mobile?</h2>
                            <p className="mt-3 text-text-secondary">
                                Your vehicle already has the problem - dragging it to a workshop just to find out what&apos;s wrong adds cost and time you don&apos;t need to spend.
                                We bring professional diagnostic equipment to your driveway, depot, or yard. No drop-off, no waiting, no taxi home.
                            </p>
                            <p className="mt-3 text-text-secondary">
                                For commercial operators, every hour your van is in a workshop is an hour it&apos;s not earning. Our mobile setup means we can often
                                diagnose and triage while you continue working - or at least give you a clear answer the same day.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-text-primary">What Sets Us Apart</h2>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                {[
                                    { icon: <Wrench className="h-5 w-5" />, title: 'Dealer-Level Tooling', desc: 'Professional diagnostic equipment with deep system access - not a generic code reader from Amazon.' },
                                    { icon: <Truck className="h-5 w-5" />, title: 'Sprinter Expertise', desc: 'Special strength in Mercedes Sprinter (W906/W907) and OM651/OM654 engines. We know the common failures and the proper fix paths.' },
                                    { icon: <Shield className="h-5 w-5" />, title: 'Compliance-First', desc: 'We diagnose and repair emissions systems; we don\'t delete them. Your MOT, your ULEZ, your compliance - protected.' },
                                    { icon: <FileText className="h-5 w-5" />, title: 'Written Outcomes', desc: 'Every job ends with a written report: what we found, what we tested, and what to do next. No verbal "it\'s probably the…" guesses.' },
                                    { icon: <MapPin className="h-5 w-5" />, title: 'Mobile Convenience', desc: 'We come to you across Kent and SE London. Driveway, depot, yard - wherever the vehicle is, as long as it\'s safe to work.' },
                                    { icon: <Users className="h-5 w-5" />, title: 'Clear Communication', desc: 'Plain English findings. We explain what\'s wrong, why it happened, and what the options are - without jargon walls.' },
                                ].map((item) => (
                                    <div key={item.title} className="rounded-xl border border-border-default bg-surface-alt p-4">
                                        <div className="mb-2 flex items-center gap-2 text-brand">
                                            {item.icon}
                                            <h3 className="font-semibold text-text-primary">{item.title}</h3>
                                        </div>
                                        <p className="text-sm text-text-secondary">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── EQUIPMENT & WORK GALLERY ───────────────── */}
                        <div>
                            <h2 className="text-2xl font-bold text-text-primary">Our Equipment & Setup</h2>
                            <p className="mt-3 text-text-secondary">
                                Professional-grade diagnostic tools - oscilloscopes, borescopes, multimeters, and dealer-level scan equipment.
                                Here&apos;s what we actually bring to every job:
                            </p>
                            <div className="mt-6">
                                <PhotoGallery images={aboutPhotos} columns={4} />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-text-primary">Our Approach</h2>
                            <p className="mt-3 text-text-secondary">
                                We&apos;re not trying to be the cheapest mobile mechanic. We&apos;re building a diagnostics-first service where the value is in the
                                <em> answer</em>, not just the visit. Every job follows a consistent diagnostic process:
                            </p>
                            <ol className="mt-4 list-inside list-decimal space-y-2 text-text-secondary">
                                <li>Verify the complaint and perform a quick visual/safety check</li>
                                <li>Full-system scan across all modules (not just the engine)</li>
                                <li>Live data checks and sensor plausibility validation</li>
                                <li>Guided tests and actuations where applicable</li>
                                <li>Root cause determination and clear next-step recommendation</li>
                                <li>Written outcome delivered - always</li>
                            </ol>
                        </div>

                        <Notice variant="compliance">
                            <strong>Independent service:</strong> TriPoint Diagnostics is not affiliated with any vehicle manufacturer.
                            We operate as an independent mobile diagnostics and repair service.
                        </Notice>

                        <div className="text-center">
                            <CTAButton href="/booking" size="lg">
                                Book a Diagnostic
                            </CTAButton>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}
