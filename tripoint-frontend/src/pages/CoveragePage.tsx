import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { TownChips } from '@/components/TownChips';
import { CTAButton } from '@/components/CTAButton';
import { Notice } from '@/components/Notice';
import { siteConfig } from '@/config/site';
import { MapPin, Clock, Navigation } from 'lucide-react';

export function CoveragePage() {
    return (
        <>
            <Seo
                title="Coverage Area"
                description="Mobile diagnostic coverage across Kent & SE London. Zone-based pricing by drive time from our rotating weekly base."
                canonical="/coverage"
            />

            <Section>
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                        Service Area &amp; Coverage
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
                        We cover up to 60 minutes drive time from our bases in Tonbridge and Eltham. Your zone determines your pricing.
                    </p>
                </div>

                {/* Service Bases */}
                <div className="mx-auto mt-12 max-w-3xl">
                    <h2 className="mb-6 text-2xl font-bold text-text-primary">Our Operating Bases</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {siteConfig.baseLocations.map((loc) => (
                            <div key={loc.label} className="rounded-2xl border border-border-default bg-surface-alt p-5">
                                <div className="mb-3 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-brand" />
                                    <h3 className="font-semibold text-text-primary">{loc.label}</h3>
                                </div>
                                <div className="space-y-2 text-sm text-text-secondary">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono">{loc.postcode}</span>
                                    </div>
                                    <p className="text-xs text-text-muted">Coverage calculated from here</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-text-secondary">
                        <Clock className="h-4 w-4 text-brand" />
                        <span className="font-medium">Operating Hours:</span>
                        <span>{siteConfig.operatingHours}</span>
                    </div>
                </div>

                {/* Zones */}
                <div className="mx-auto mt-12 max-w-3xl">
                    <h2 className="mb-6 text-2xl font-bold text-text-primary">Travel Zones</h2>
                    <p className="mb-4 text-text-secondary">
                        Zones are calculated by one-way drive time from our nearest base, using Google or Apple Maps at the time of booking.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {siteConfig.zones.map((z) => (
                            <div
                                key={z.zone}
                                className="rounded-2xl border border-border-default bg-surface-alt p-5 text-center"
                            >
                                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                                    <Navigation className="h-5 w-5 text-brand" />
                                </div>
                                <p className="text-lg font-bold text-brand-light">Zone {z.zone}</p>
                                <p className="text-sm text-text-secondary">{z.driveTime}</p>
                                <p className="mt-1 text-xs text-text-muted">{z.note}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Towns */}
                <div className="mx-auto mt-12 max-w-3xl">
                    <h2 className="mb-6 text-2xl font-bold text-text-primary">Towns We Commonly Cover</h2>
                    <TownChips />
                    <p className="mt-4 text-sm text-text-muted">
                        This is not an exhaustive list. If you&apos;re within 60 minutes drive of Tonbridge or Eltham, we can likely reach you.
                    </p>
                </div>

                {/* Map placeholder */}
                <div className="mx-auto mt-12 max-w-3xl">
                    <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-border-default bg-surface-alt">
                        <div className="text-center">
                            <MapPin className="mx-auto h-10 w-10 text-text-muted" />
                            <p className="mt-2 text-sm text-text-muted">
                                Interactive map coming soon
                            </p>
                            <p className="text-xs text-text-muted">
                                For now, enter your postcode when booking and we&apos;ll confirm your zone.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Out of area */}
                <div className="mx-auto mt-8 max-w-3xl">
                    <Notice variant="info">
                        <strong>Outside the 60-minute radius?</strong> Get in touch anyway - we may be able to offer a quote
                        depending on the job and scheduling. Out-of-area bookings are assessed individually.
                    </Notice>
                </div>

                <div className="mt-10 text-center">
                    <CTAButton href="/booking" size="lg">
                        Check Your Zone &amp; Book
                    </CTAButton>
                </div>
            </Section>
        </>
    );
}
