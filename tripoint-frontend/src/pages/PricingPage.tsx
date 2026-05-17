import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { PricingTable } from '@/components/PricingTable';
import { CTAButton } from '@/components/CTAButton';
import { Notice } from '@/components/Notice';
import { ExpandableReportImage } from '@/components/ExpandableReportImage';
import { trackNavClick } from '@/lib/analytics';
import { ZoneCalculator } from '@/components/ZoneCalculator';
import { VatLabel } from '@/components/VatLabel';
import { ZoneLegend } from '@/components/pricing/ZoneLegend';
import { PricingMobileCards } from '@/components/pricing/PricingMobileCards';
import { PricingExtras } from '@/components/pricing/PricingExtras';
import { PricingDetailsAccordion } from '@/components/pricing/PricingDetailsAccordion';

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
                    <h1 className="text-3xl font-extrabold text-text-primary sm:text-5xl">Pricing</h1>
                    <p className="mx-auto mt-3 max-w-2xl text-base text-text-secondary sm:mt-4 sm:text-lg">
                        Check your zone, then pick a service. Fixed prices — travel included, no hidden fees.
                    </p>
                    <ol className="mx-auto mt-4 flex max-w-md flex-col gap-2 text-left text-sm text-text-secondary sm:mt-5 lg:hidden">
                        <li className="flex gap-2">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand-light">
                                1
                            </span>
                            Enter your postcode below
                        </li>
                        <li className="flex gap-2">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand-light">
                                2
                            </span>
                            Compare prices for zones A, B, or C
                        </li>
                        <li className="flex gap-2">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand-light">
                                3
                            </span>
                            Book online — we confirm your final price
                        </li>
                    </ol>
                </div>

                <div className="mx-auto mt-6 max-w-xl lg:mt-8">
                    <ZoneCalculator />
                </div>

                <ZoneLegend />

                <div className="mx-auto mt-8 max-w-4xl lg:mt-12">
                    <h2 className="mb-4 hidden text-2xl font-bold text-text-primary lg:block">Service prices</h2>
                    <PricingMobileCards />
                    <PricingTable />
                    <div className="mt-8 lg:mt-12">
                        <PricingExtras />
                    </div>
                </div>

                <div className="mx-auto mt-6 max-w-xl lg:hidden">
                    <CTAButton
                        href="/booking"
                        size="lg"
                        className="w-full"
                        onClick={() => trackNavClick('/booking', 'Book online', 'pricing_mobile_after_prices')}
                    >
                        Book online
                    </CTAButton>
                </div>

                <PricingDetailsAccordion />

                <div className="mx-auto mt-12 hidden max-w-3xl space-y-8 lg:block">
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">What&apos;s Included</h2>
                        <ul className="mt-4 space-y-2 text-text-secondary">
                            <li>• Travel within your zone</li>
                            <li>• Full diagnostic scan across all modules</li>
                            <li>• Live data checks and guided tests</li>
                            <li>• Written outcome with findings and next steps</li>
                            <li>• On-site time as per service (typically 60-90 mins)</li>
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
                            A deposit secures your slot. Zone A/B: £30<VatLabel />. Zone C and VOR: £50<VatLabel />.
                            Reschedule free with 24 hours notice - your deposit carries over. Late cancellation or no-show
                            retains the deposit. We&apos;ll confirm your zone and final price when you book.
                        </p>
                    </div>
                    <Notice variant="info">
                        <strong>VOR Priority Dispatch:</strong> Limited slots available. WhatsApp us for the fastest
                        response if your vehicle is off the road.
                    </Notice>
                    <p className="text-center text-xs text-text-muted">
                        Company No. 17038307&nbsp;&nbsp;|&nbsp;&nbsp;VAT No. 515 7327 92
                    </p>
                </div>

                <div className="mx-auto mt-10 max-w-3xl lg:mt-12">
                    <div className="flex flex-col gap-6 overflow-hidden rounded-2xl border border-border-default bg-surface-alt p-6 sm:flex-row sm:items-center sm:p-8">
                        <div className="shrink-0 overflow-hidden rounded-lg border border-border-default sm:w-52">
                            <ExpandableReportImage
                                src="/images/sample-report/08_recommendation_bullets.png"
                                alt="Recommendation bullets excerpt from a written diagnostic report"
                                className="overflow-hidden rounded-lg"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-xl font-bold text-text-primary">Why pay for diagnosis?</h3>
                            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                                The real cost is often guessing wrong: the wrong part, the wrong repair, or repeating
                                the same visit. A proper diagnostic fee buys a written outcome and a clearer path before
                                you spend more.
                            </p>
                            <div className="mt-4">
                                <CTAButton
                                    href="/sample-diagnostic-report"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        trackNavClick('/sample-diagnostic-report', 'See a real diagnostic report', 'pricing')
                                    }
                                >
                                    See a real diagnostic report
                                </CTAButton>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 text-center lg:mt-12">
                    <CTAButton href="/booking" size="lg" onClick={() => trackNavClick('/booking', 'Book Now', 'pricing')}>
                        Book Your Diagnostic
                    </CTAButton>
                </div>
            </Section>
        </>
    );
}
