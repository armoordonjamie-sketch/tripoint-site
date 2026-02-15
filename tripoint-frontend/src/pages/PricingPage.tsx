import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { PricingTable } from '@/components/PricingTable';
import { CTAButton } from '@/components/CTAButton';
import { Notice } from '@/components/Notice';
import { siteConfig } from '@/config/site';

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
                        Drive time is calculated from the active base that week using Google/Apple Maps at time of booking.
                    </p>
                </div>

                {/* Pricing table */}
                <div className="mx-auto mt-12 max-w-4xl">
                    <PricingTable />
                </div>

                {/* Safety boundary */}
                <div className="mx-auto mt-12 max-w-3xl space-y-4">
                    <Notice variant="info">
                        <strong>Mobile-only service:</strong> We may decline unsafe roadside jobs. Repairs only where safe and feasible.
                        Vehicle must be in a safe, accessible working location.
                    </Notice>
                    <Notice variant="compliance">
                        <strong>Compliance-first:</strong> We do not perform emissions deletes, DPF removal, or defeat device installation.
                        AdBlue/SCR/DPF/EGR = diagnosis and compliant repair only.
                    </Notice>
                </div>

                {/* CTA */}
                <div className="mt-12 text-center">
                    <CTAButton href="/booking" size="lg">
                        Book Your Diagnostic
                    </CTAButton>
                </div>
            </Section>
        </>
    );
}
