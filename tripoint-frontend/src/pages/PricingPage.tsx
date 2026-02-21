import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { PricingTable } from '@/components/PricingTable';
import { CTAButton } from '@/components/CTAButton';
import { Notice } from '@/components/Notice';
import { siteConfig } from '@/config/site';
import { trackEvent } from '@/lib/analytics';
import { ZoneCalculator } from '@/components/ZoneCalculator';

export function PricingPage() {
    return (
        <>
            <Seo
                title="Pricing"
                description="Transparent zone-based pricing for mobile vehicle diagnostics. No hidden fees. Deposit secures your slot."
                canonical="/pricing"
            />

            <Section>
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                        Pricing
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
                        Zone-based pricing with no hidden fees. All services include travel within your zone and a written diagnostic outcome.
                    </p>
                </div>

                <div className="mx-auto mt-8 max-w-xl">
                    <ZoneCalculator />
                </div>

                {/* Zone explanation */}
                <div className="mx-auto mt-12 max-w-3xl">
                    <h2 className="mb-4 text-2xl font-bold text-text-primary">Travel Zones</h2>
                    <div className="overflow-x-auto rounded-xl border border-border-default">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border-default bg-surface-alt">
                                    <th className="px-4 py-3 text-sm font-semibold text-text-primary sm:px-6">Zone</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-text-primary">Drive Time</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-text-primary">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {siteConfig.zones.map((z, i) => (
                                    <tr key={z.zone} className={i < siteConfig.zones.length - 1 ? 'border-b border-border-default' : ''}>
                                        <td className="px-4 py-3 text-sm font-bold text-brand-light sm:px-6">{z.zone}</td>
                                        <td className="px-4 py-3 text-sm text-text-primary">{z.driveTime}</td>
                                        <td className="px-4 py-3 text-sm text-text-secondary">{z.note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-3 text-sm text-text-muted">
                        Drive time is calculated from our nearest base using Google/Apple Maps at time of booking.
                    </p>
                </div>

                {/* Pricing table */}
                <div className="mx-auto mt-12 max-w-4xl">
                    <PricingTable />
                </div>

                {/* What's included / not included */}
                <div className="mx-auto mt-12 max-w-3xl space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">What&apos;s Included</h2>
                        <ul className="mt-4 space-y-2 text-text-secondary">
                            <li>• Travel within your zone</li>
                            <li>• Full diagnostic scan across all modules</li>
                            <li>• Live data checks and guided tests</li>
                            <li>• Written outcome with findings and next steps</li>
                            <li>• On-site time as per service (typically 60–90 mins)</li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">What&apos;s Not Included</h2>
                        <ul className="mt-4 space-y-2 text-text-secondary">
                            <li>• Major mechanical repairs requiring ramp access</li>
                            <li>• Unsafe roadside work</li>
                            <li>• Parts (quoted separately when needed)</li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">How Booking &amp; Deposit Works</h2>
                        <p className="mt-4 text-text-secondary">
                            A deposit secures your slot. Zone A/B: £30. Zone C and VOR: £50. Reschedule free with 24 hours notice - your deposit carries over. Late cancellation or no-show retains the deposit. We&apos;ll confirm your zone and final price when you book.
                        </p>
                    </div>
                    <Notice variant="info">
                        <strong>VOR Priority Dispatch:</strong> Limited slots available. WhatsApp us for the fastest response if your vehicle is off the road.
                    </Notice>
                </div>

                {/* CTA */}
                <div className="mt-12 text-center">
                    <CTAButton href="/booking" size="lg" onClick={() => trackEvent('click_book_now', { location: 'pricing' })}>
                        Book Your Diagnostic
                    </CTAButton>
                </div>
            </Section>
        </>
    );
}
