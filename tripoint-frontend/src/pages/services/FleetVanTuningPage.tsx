import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { trackBookNowClick, trackPhoneLead, trackWhatsAppLead } from '@/lib/analytics';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { FaqAccordion } from '@/components/FaqAccordion';
import { CheckCircle2, ArrowRight, Phone, MessageCircle, AlertTriangle, FileText, Shield, Wrench } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { ServiceSchema, BreadcrumbSchema, FaqPageSchema } from '@/components/JsonLd';

function useScrollReveal() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in-view'); }),
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
        );
        el.querySelectorAll('.reveal').forEach((child) => observer.observe(child));
        return () => observer.disconnect();
    }, []);
    return ref;
}

const faqs = [
    {
        question: 'How many vans do we need for fleet pricing?',
        answer:
            'Three or more. We offer a 10-15% volume saving on individual tunes, or a fixed site-day rate where we come to your yard and tune multiple vehicles in one visit. Best value for fleets of 5+.',
    },
    {
        question: 'Can you come to our depot?',
        answer:
            'Yes. For fleet tuning, we typically come to your yard, depot, or base for a dedicated tuning day. We bring everything needed and work through the fleet systematically. Less downtime per vehicle, better pricing overall.',
    },
    {
        question: 'Does every van get a diagnostic check first?',
        answer:
            'Yes. Every single vehicle gets a full diagnostic pre-check before any calibration. If a van has existing faults, we flag them and won\'t tune until they\'re resolved. This protects your fleet and your investment.',
    },
    {
        question: 'Can you mix load and economy tunes across the fleet?',
        answer:
            'Absolutely. Different vehicles in your fleet may benefit from different calibrations depending on their route, load, and usage pattern. We\'ll discuss each vehicle and recommend the best fit.',
    },
    {
        question: 'What documentation do we get?',
        answer:
            'Each vehicle gets a written tune report with the calibration applied, power/torque targets, and a handover note for insurance purposes. You also get a fleet summary document with all vehicles listed and their calibration details.',
    },
    {
        question: 'Do drivers need to declare to insurance?',
        answer:
            'Yes. ECU calibration is a modification and must be declared to your insurer for each vehicle. If you have a fleet policy, check with your broker. We provide individual handover notes for each vehicle to simplify this.',
    },
];

const crossSell = [
    { title: 'Load & Driveability Tune', desc: 'More torque and better pull under load', href: '/services/van-load-driveability-tune' },
    { title: 'Economy Tune', desc: 'Smoother cruising and efficiency gains', href: '/services/van-economy-tune' },
    { title: 'Standard Diagnosis', desc: 'Full diagnostic before or after tuning', href: '/services/diagnostic-callout' },
];

export function FleetVanTuningPage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo
                title="Fleet Van Tuning"
                description="Fleet van tuning packages. Consistent drivability across your fleet with volume pricing and site-day rates. All van makes. From \u00a3199 per vehicle."
                canonical="/services/fleet-van-tuning"
            />
            <ServiceSchema name="Fleet Van Tuning" description="Fleet van tuning - volume pricing, site-day rates, diagnostic pre-check included. All van makes." url="/services/fleet-van-tuning" priceFrom={199} />
            <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Fleet Van Tuning', url: '/services/fleet-van-tuning' }]} />
            <FaqPageSchema items={faqs} />

            {/* \u2500\u2500\u2500 HERO \u2500\u2500\u2500 */}
            <section className="relative h-72 sm:h-96 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-surface to-surface" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.12),transparent_70%)]" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                    <div className="mx-auto max-w-5xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-2">Fleet Operators</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl lg:text-6xl">Fleet Van Tuning</h1>
                        <p className="mt-3 max-w-xl text-lg text-text-secondary">3+ vehicles &bull; Volume pricing &bull; Depot visits &bull; All makes</p>
                    </div>
                </div>
            </section>

            {/* \u2500\u2500\u2500 SECTION 1: Why fleet operators tune \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center reveal">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Why fleet operators tune their vans</h2>
                            <p className="mt-4 text-text-secondary leading-relaxed">
                                When you&apos;re running 3, 10, or 50 vans, small improvements per vehicle add up to significant fleet-wide gains. A tuned van uses less throttle input to achieve the same performance - which can reduce fuel consumption, improve driver satisfaction, and reduce wear on drivetrain components.
                            </p>
                            <p className="mt-3 text-text-secondary leading-relaxed">
                                We offer dedicated tuning days at your depot. We bring everything needed, work through your fleet systematically, and hand you a complete documentation pack for every vehicle - including individual tune reports and insurance handover notes.
                            </p>
                            <p className="mt-3 text-text-secondary leading-relaxed">
                                Volume pricing makes it commercially sensible. The ROI on fuel savings alone can pay back the investment within weeks on high-mileage fleets.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <CTAButton href="/booking" size="md" onClick={() => trackBookNowClick('fleet_tune_top')}>Get a Fleet Quote</CTAButton>
                                <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="outline" size="md" external icon={<MessageCircle className="h-4 w-4" />} onClick={() => trackWhatsAppLead('fleet_tune')}>WhatsApp Us</CTAButton>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { stat: '10-15%', label: 'Volume saving', detail: 'vs individual tune pricing' },
                                { stat: '30-45 min', label: 'Per vehicle', detail: 'after initial setup' },
                                { stat: '100%', label: 'Pre-checked', detail: 'every van scanned first' },
                                { stat: 'Full docs', label: 'Per vehicle', detail: 'tune report + insurance note' },
                            ].map((item) => (
                                <div key={item.label + item.detail} className="rounded-xl border border-border-default bg-surface p-4 text-center">
                                    <p className="text-2xl font-extrabold text-blue-400">{item.stat}</p>
                                    <p className="mt-1 text-sm font-semibold text-text-primary">{item.label}</p>
                                    <p className="text-xs text-text-muted">{item.detail}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 SECTION 2: How a tuning day works \u2500\u2500\u2500 */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">How a fleet tuning day works</h2>
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-5 gap-4">
                        {[
                            { step: '01', title: 'Pre-planning', desc: 'We get your vehicle list, confirm reg numbers, and plan the day. Parts requirements identified in advance.' },
                            { step: '02', title: 'Arrive at depot', desc: 'We\u2019re set up at your yard with all equipment. Vehicles brought to us one at a time.' },
                            { step: '03', title: 'Diagnostic scan', desc: 'Each van gets a full fault code scan. Any issues flagged before tuning begins.' },
                            { step: '04', title: 'Calibration', desc: 'Economy or Load tune applied per vehicle. Original files backed up.' },
                            { step: '05', title: 'Handover', desc: 'Road test, individual tune reports, insurance notes, and fleet summary document.' },
                        ].map((s) => (
                            <div key={s.step} className="text-center">
                                <div className="step-number mx-auto flex h-10 w-10 items-center justify-center text-sm font-bold">{s.step}</div>
                                <h3 className="mt-3 font-semibold text-text-primary text-sm">{s.title}</h3>
                                <p className="mt-1 text-xs text-text-secondary">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 SECTION 3: What each van gets \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start reveal">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">What each van gets</h2>
                            <p className="mt-4 text-text-secondary leading-relaxed">
                                Every vehicle in your fleet receives the same individual attention as a single-vehicle booking. No shortcuts.
                            </p>
                            <ul className="mt-4 space-y-2">
                                {[
                                    'Full diagnostic pre-check with fault code scan',
                                    'Engine health assessment before tuning',
                                    'Original ECU file backed up and stored',
                                    'Economy or Load calibration (your choice per vehicle)',
                                    'Short road test to verify driveability',
                                    'Individual written tune report',
                                    'Insurance handover note per vehicle',
                                ].map((s) => (
                                    <li key={s} className="flex items-start gap-2 text-sm text-text-secondary">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                                        <span>{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2"><FileText className="h-6 w-6 text-blue-400" /> Fleet documentation</h2>
                            <p className="mt-4 text-text-secondary leading-relaxed">
                                In addition to individual vehicle reports, you receive:
                            </p>
                            <div className="mt-4 space-y-3">
                                {[
                                    { icon: <FileText className="h-5 w-5 text-blue-400" />, title: 'Fleet summary document', detail: 'All vehicles listed with registration, engine, calibration type, and date.' },
                                    { icon: <Shield className="h-5 w-5 text-blue-400" />, title: 'Insurance handover pack', detail: 'Individual notes for each vehicle, ready to send to your broker or insurer.' },
                                    { icon: <Wrench className="h-5 w-5 text-blue-400" />, title: 'Fault report', detail: 'Any vehicles with pre-existing faults that need attention before tuning.' },
                                ].map((item) => (
                                    <div key={item.title} className="flex items-start gap-3 rounded-lg border border-border-default p-3">
                                        <div className="mt-0.5">{item.icon}</div>
                                        <div>
                                            <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                                            <p className="text-xs text-text-secondary">{item.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 SECTION 4: Load vs Economy comparison \u2500\u2500\u2500 */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">Load vs Economy - which tune for which vehicle?</h2>
                    <p className="mt-2 text-text-secondary text-center max-w-2xl mx-auto">You can mix calibration types across your fleet. We&apos;ll recommend the best fit for each vehicle based on its role.</p>
                    <div className="mt-8 overflow-x-auto rounded-xl border border-border-default">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-border-default bg-surface-alt">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary"></th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-orange-400">Load Tune</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-emerald-400">Economy Tune</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { aspect: 'Primary goal', load: 'More torque under payload', economy: 'Lower fuel consumption' },
                                    { aspect: 'Best for', load: 'Builders, scaffolders, heavy trades', economy: 'Couriers, multi-drop, motorway miles' },
                                    { aspect: 'Low-end torque', load: 'Significantly increased', economy: 'Modestly improved' },
                                    { aspect: 'Fuel efficiency', load: 'Modest improvement', economy: 'Primary focus' },
                                    { aspect: 'Throttle response', load: 'Sharper, more direct', economy: 'Smoother, more linear' },
                                    { aspect: 'Turbo lag', load: 'Significantly reduced', economy: 'Progressively smoothed' },
                                ].map((row) => (
                                    <tr key={row.aspect} className="border-b border-border-default">
                                        <td className="px-4 py-3 text-sm font-semibold text-text-primary">{row.aspect}</td>
                                        <td className="px-4 py-3 text-center text-sm text-text-secondary">{row.load}</td>
                                        <td className="px-4 py-3 text-center text-sm text-text-secondary">{row.economy}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 SECTION 5: Pricing \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="reveal">
                        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Fleet pricing</h2>
                        <p className="mt-2 text-text-secondary">Volume rates for 3+ vehicles. We come to your depot for a dedicated tuning day.</p>
                        <div className="mt-6 overflow-x-auto rounded-xl border border-border-default">
                            <table className="min-w-full">
                                <thead><tr className="border-b border-border-default bg-surface-alt"><th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Option</th><th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Pricing</th></tr></thead>
                                <tbody>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Per vehicle (3-4 vans)</td><td className="px-4 py-3 text-right font-semibold text-brand-light">from &pound;179/van</td></tr>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Per vehicle (5-10 vans)</td><td className="px-4 py-3 text-right font-semibold text-brand-light">from &pound;169/van</td></tr>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Per vehicle (10+ vans)</td><td className="px-4 py-3 text-right font-semibold text-brand-light">contact for rate</td></tr>
                                    <tr><td className="px-4 py-3 text-text-secondary">Site-day rate (depot visit)</td><td className="px-4 py-3 text-right font-semibold text-brand-light">from &pound;799/day</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4 reveal">
                        {[
                            { label: 'Diagnostic pre-check', value: 'Per van' },
                            { label: 'Original file backup', value: 'Per van' },
                            { label: 'Tune reports', value: 'Per van' },
                            { label: 'Fleet summary', value: 'Included' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between rounded-lg border border-border-default bg-surface-alt px-4 py-3">
                                <span className="text-sm text-text-secondary">{item.label}</span>
                                <span className="text-sm font-semibold text-blue-400">{item.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 rounded-2xl border border-brand/20 bg-brand/5 p-6 text-center reveal">
                        <p className="text-xl font-bold text-text-primary">Fleet tuning from <span className="text-brand-light">&pound;169/van</span></p>
                        <p className="mt-1 text-sm text-text-secondary">Volume pricing - we come to your depot - full documentation included</p>
                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                            <CTAButton href="/booking" size="sm" onClick={() => trackBookNowClick('fleet_tune_pricing')}>Get a Fleet Quote</CTAButton>
                            <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="outline" size="sm" external icon={<MessageCircle className="h-4 w-4" />} onClick={() => trackWhatsAppLead('fleet_tune')}>WhatsApp Us</CTAButton>
                        </div>
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 Insurance notice \u2500\u2500\u2500 */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
                            <div>
                                <h3 className="font-bold text-text-primary">Fleet insurance considerations</h3>
                                <p className="mt-2 text-sm text-text-secondary">
                                    ECU calibration is a modification and must be declared on your fleet insurance policy. If you have a fleet policy managed by a broker, we recommend informing them before the tuning day. We provide individual handover notes for each vehicle to make this straightforward.
                                </p>
                                <p className="mt-2 text-sm text-text-secondary">
                                    Most specialist fleet insurers are familiar with conservative Stage 1 calibrations. The handover notes include all technical details they need.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 Vans we tune \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-2xl font-bold text-text-primary text-center">Mixed fleets welcome</h2>
                    <p className="mt-2 text-text-secondary text-center">We tune all common commercial diesel vans. Your fleet doesn&apos;t need to be single-make.</p>
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {[
                            'Mercedes Sprinter', 'Mercedes Vito', 'Mercedes Citan',
                            'Ford Transit', 'Ford Transit Custom',
                            'VW Crafter', 'VW Transporter',
                            'Vauxhall Vivaro', 'Vauxhall Movano',
                            'Renault Trafic', 'Renault Master',
                            'Iveco Daily',
                        ].map((van) => (
                            <div key={van} className="rounded-lg border border-border-default bg-surface-alt px-3 py-2 text-sm text-text-secondary text-center">{van}</div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 FAQ \u2500\u2500\u2500 */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-3xl reveal">
                    <h2 className="text-2xl font-bold text-text-primary text-center">Frequently asked questions</h2>
                    <div className="mt-8"><FaqAccordion items={faqs} /></div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 Related services \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-xl font-bold text-text-primary">Related services</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        {crossSell.map((s) => (
                            <Link key={s.href} to={s.href} className="flex items-center justify-between rounded-xl border border-border-default bg-surface-alt p-4 transition-all hover:border-brand/30 hover:bg-brand/5">
                                <div><h3 className="font-semibold text-text-primary">{s.title}</h3><p className="text-sm text-text-secondary">{s.desc}</p></div>
                                <ArrowRight className="h-5 w-5 shrink-0 text-brand" />
                            </Link>
                        ))}
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 FOOTER CTA \u2500\u2500\u2500 */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0"><div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 to-blue-900/85" /></div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
                    <div className="text-center reveal">
                        <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl">Tune your entire fleet in one day</h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Volume pricing, depot visits, per-vehicle reports. Let&apos;s talk.</p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackBookNowClick('fleet_tune_footer')}>Get a Fleet Quote</CTAButton>
                            <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="ghost" size="lg" external icon={<MessageCircle className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackWhatsAppLead('fleet_tune')}>WhatsApp Us</CTAButton>
                            <CTAButton href={`tel:${siteConfig.contact.phoneE164}`} variant="ghost" size="lg" external icon={<Phone className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackPhoneLead('fleet_tune')}>{siteConfig.contact.phoneDisplay}</CTAButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
