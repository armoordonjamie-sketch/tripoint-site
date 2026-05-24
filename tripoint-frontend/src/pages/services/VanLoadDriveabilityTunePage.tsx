import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { trackNavClick, trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { FaqAccordion } from '@/components/FaqAccordion';
import { CheckCircle2, XCircle, ArrowRight, Phone, MessageCircle, AlertTriangle, TrendingUp, Gauge, Shield, Zap } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { ServiceSchema, BreadcrumbSchema, FaqPageSchema } from '@/components/JsonLd';
import { OptimizedImage } from '@/components/OptimizedImage';
import { VatLabel } from '@/components/VatLabel';

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
        question: 'Is this a "stage 1 remap"?',
        answer:
            'Technically, yes - it\'s a Stage 1 ECU calibration. But we don\'t sell it that way because the goal isn\'t bragging rights. The tune is specifically optimised for real-world work-van use: better pull under load, smoother driving, less gear hunting. It\'s about making your van work better, not go faster.',
    },
    {
        question: 'Will it affect my fuel economy?',
        answer:
            'It depends on how you drive. Because the engine produces more torque at lower RPM, you use less throttle in everyday driving. Many customers report modest fuel savings, but we never guarantee specific mpg figures. It depends on your route, load, and driving style.',
    },
    {
        question: 'Is it safe for my engine?',
        answer:
            'Every tune starts with a full diagnostic health check. We won\'t tune a vehicle with existing faults, excessive wear, or issues that need addressing first. The calibration stays within safe parameters for your engine and drivetrain. We\'re mechanics first, tuners second.',
    },
    {
        question: 'What about my insurance?',
        answer:
            'You must inform your insurer of any modification, including ECU calibration. Most specialist van insurers are fine with a conservative Stage 1 tune, but it\'s your responsibility to check and declare. We provide a handover note with details of the work for your records.',
    },
    {
        question: 'Can it be reversed?',
        answer:
            'Yes. We keep your original calibration file. If you ever need to revert - for a dealer visit, warranty claim, or sale - we can restore the original map.',
    },
    {
        question: 'Which vans do you tune?',
        answer:
            'All common commercial vans: Mercedes Sprinter, Vito, Citan, Ford Transit and Transit Custom, VW Crafter and Transporter, Vauxhall/Opel Vivaro and Movano, Renault Trafic and Master, Peugeot Boxer and Expert, Citroen Relay and Dispatch, Iveco Daily, and more.',
    },
];

const crossSell = [
    { title: 'Economy Tune', desc: 'Optimised for smoother cruising and efficiency', href: '/services/van-economy-tune' },
    { title: 'Fleet Van Tuning', desc: 'Volume pricing for 3+ vans', href: '/services/fleet-van-tuning' },
    { title: 'Standard Diagnosis', desc: 'Got a fault? We diagnose it first.', href: '/services/diagnostic-callout' },
];

export function VanLoadDriveabilityTunePage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo
                title="Van Load & Driveability Tune"
                description="Van load tuning for better torque under payload, smoother throttle response, and reduced turbo lag. Diagnostic pre-check included. All van makes. From \u00a3199 (ex. VAT)."
                canonical="/services/van-load-driveability-tune"
            />
            <ServiceSchema
                name="Van Load &amp; Driveability Tune"
                description="Van load &amp; driveability tuning - more torque under load, better throttle response, reduced turbo lag. All van makes."
                url="/services/van-load-driveability-tune"
                priceFrom={199}
                offerCatalogItems={[
                    { name: 'Load and Driveability Tune Zone A (0 to 25 minutes)', price: '199.00', priceCurrency: 'GBP', description: 'Diagnostic pre-check, calibration, road test, and handover note included' },
                    { name: 'Load and Driveability Tune Zone B (25 to 45 minutes)', price: '214.00', priceCurrency: 'GBP', description: 'Diagnostic pre-check, calibration, road test, and handover note included' },
                    { name: 'Load and Driveability Tune Zone C (45 to 60 minutes)', price: '229.00', priceCurrency: 'GBP', description: 'Diagnostic pre-check, calibration, road test, and handover note included' },
                ]}
            />
            <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Van Load & Driveability Tune', url: '/services/van-load-driveability-tune' }]} />
            <FaqPageSchema items={faqs} />

            {/* ─── HERO ─── */}
            <section className="relative h-72 sm:h-96 overflow-hidden">
                <img
                    src="/images/services/van-sprinter-w907-front.png"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-orange-950/90 via-surface/85 to-surface" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.18),transparent_70%)]" />
                <div className="absolute bottom-0 left-0 right-0 z-10 p-6 sm:p-10">
                    <div className="mx-auto max-w-5xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-orange-400 mb-2">Commercial Van Tuning</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl lg:text-6xl">Load &amp; Driveability Tune</h1>
                        <p className="mt-3 max-w-xl text-lg text-text-secondary">More torque &bull; Better response &bull; Built for heavy work</p>
                    </div>
                </div>
            </section>

            {/* ─── LEAD PARAGRAPH ─── */}
            <Section>
                <div className="mx-auto max-w-3xl reveal">
                    <p className="text-base leading-relaxed text-text-secondary lg:text-xl">
                        Commercial van ECU maps are factory-set for a compromise between an empty van and a fully loaded one, which means real-world trade and delivery use leaves significant torque on the table. Common symptoms include turbo lag from standstill, gear hunting on inclines under load, and a flat, unresponsive throttle when pulling away at junctions. A Load and Driveability Tune recalibrates the ECU specifically for work use: more usable torque from 1,500 to 2,500 RPM, faster boost onset, and a sharper throttle map. Every tune starts with a diagnostic pre-check and ends with a written calibration confirmation and insurance handover note.
                    </p>
                </div>
            </Section>

            {/* ─── SECTION 1: Why loaded vans need different tuning ─── */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center reveal">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Why your loaded van feels sluggish</h2>
                            <p className="mt-4 text-text-secondary leading-relaxed">
                                Factory ECU maps are designed for a compromise - they need to work for an empty van and a fully loaded one. The result is conservative tuning that leaves your engine feeling flat, especially under payload.
                            </p>
                            <p className="mt-3 text-text-secondary leading-relaxed">
                                Turbo lag off the line. Gear hunting on hills. Hesitant throttle response when you need to pull away at a roundabout. If you&apos;re carrying tools, materials, or a full load every day, the stock calibration is holding you back.
                            </p>
                            <p className="mt-3 text-text-secondary leading-relaxed">
                                A Load &amp; Driveability Tune recalibrates your ECU to deliver more usable torque lower in the rev range, sharper throttle response, and smoother power delivery under load - making your van feel like it did when it was empty.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <CTAButton href="/booking" size="md" onClick={() => trackNavClick('/booking', 'Book Online', 'load_tune_top')}>Book Online</CTAButton>
                                <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="outline" size="md" external icon={<MessageCircle className="h-4 w-4" />} onClick={() => trackWhatsAppClick('load_tune')}>WhatsApp Us</CTAButton>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6">
                            <h3 className="text-lg font-bold text-text-primary mb-4">What the tune changes</h3>
                            <div className="space-y-4">
                                {[
                                    { icon: <TrendingUp className="h-5 w-5 text-orange-400" />, label: 'Low-end torque', detail: 'More pulling power from 1,500-2,500 RPM - where you need it most under load' },
                                    { icon: <Gauge className="h-5 w-5 text-orange-400" />, label: 'Boost onset', detail: 'Turbo builds pressure faster off idle - less lag, more responsive pulls' },
                                    { icon: <Zap className="h-5 w-5 text-orange-400" />, label: 'Throttle mapping', detail: 'Sharper pedal response without being aggressive - more connected feel' },
                                    { icon: <Shield className="h-5 w-5 text-orange-400" />, label: 'Torque limiters', detail: 'Safely recalculated to handle increased output within drivetrain limits' },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-start gap-3">
                                        <div className="mt-0.5">{item.icon}</div>
                                        <div>
                                            <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                                            <p className="text-sm text-text-secondary">{item.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* ─── SECTION 2: Before vs After comparison ─── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">Before vs after</h2>
                    <p className="mt-2 text-text-secondary text-center max-w-2xl mx-auto">How the driving experience changes with a load tune.</p>
                    <figure className="mt-8 overflow-hidden rounded-xl border border-border-default max-w-3xl mx-auto">
                        <div className="relative aspect-[16/10] min-h-[220px] sm:min-h-[280px]">
                            <OptimizedImage
                                src="/images/new-images/mercedes-sprinter-driving-pov.jpg"
                                alt="Driver's view from a Mercedes Sprinter cab"
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        </div>
                        <figcaption className="border-t border-border-default bg-surface-alt px-3 py-2 text-xs text-text-secondary text-center">
                            The view from your cab. The table below shows what changes when you add a load tune.
                        </figcaption>
                    </figure>
                    <div className="mt-8 overflow-x-auto rounded-xl border border-border-default">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-border-default bg-surface-alt">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Characteristic</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-text-muted">Stock</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-orange-400">After tune</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { feature: 'Pulling away from roundabouts', stock: 'Hesitant, needs high revs', tuned: 'Confident, pulls cleanly' },
                                    { feature: 'Hill climbing under load', stock: 'Downshifts frequently', tuned: 'Holds gear, smoother climb' },
                                    { feature: 'Motorway merging', stock: 'Flat acceleration', tuned: 'Noticeably stronger pull' },
                                    { feature: 'Turbo lag from standstill', stock: 'Noticeable delay', tuned: 'Significantly reduced' },
                                    { feature: 'Throttle feel', stock: 'Numb, disconnected', tuned: 'Linear, responsive' },
                                    { feature: 'Gear hunting (auto)', stock: 'Frequent on inclines', tuned: 'Reduced - more torque in each gear' },
                                ].map((row) => (
                                    <tr key={row.feature} className="border-b border-border-default">
                                        <td className="px-4 py-3 text-sm font-semibold text-text-primary">{row.feature}</td>
                                        <td className="px-4 py-3 text-center text-sm text-text-muted">{row.stock}</td>
                                        <td className="px-4 py-3 text-center text-sm text-text-secondary font-semibold">{row.tuned}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Section>

            {/* ─── SECTION 3: Best suited for ─── */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start reveal">
                        <div>
                            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-orange-400" /> Best suited for</h2>
                            <ul className="mt-4 space-y-3">
                                {[
                                    { who: 'Builders and scaffolders', why: 'Heavy payloads every day - the van needs to pull, not just cruise' },
                                    { who: 'Tool-heavy trades', why: 'Fully loaded with tools and materials. Need confident acceleration.' },
                                    { who: 'Logistics and parcel delivery', why: 'Frequent starts, stops, and short pulls with weight on board' },
                                    { who: 'Tipper and dropside operators', why: 'Carrying aggregate, soil, or heavy materials. Every bit of torque counts.' },
                                    { who: 'Towing or trailer work', why: 'If your van tows regularly, a load tune makes a significant difference' },
                                ].map((item) => (
                                    <li key={item.who} className="text-sm text-text-secondary">
                                        <span className="font-semibold text-text-primary">{item.who}:</span> {item.why}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2"><XCircle className="h-5 w-5 text-red-400" /> When it&apos;s not the right choice</h2>
                            <ul className="mt-4 space-y-3">
                                {[
                                    { who: 'Primarily empty runs', why: 'If your van is mostly unladen, an Economy Tune will serve you better' },
                                    { who: 'Vans with existing faults', why: 'We won\u2019t tune until underlying issues are resolved' },
                                    { who: 'Modified emissions systems', why: 'DPF deletes, EGR blanks, or modified exhausts - we don\u2019t tune these' },
                                    { who: 'Looking for max power', why: 'This isn\u2019t a performance remap. It\u2019s a driveability calibration for work use.' },
                                ].map((item) => (
                                    <li key={item.who} className="text-sm text-text-secondary">
                                        <span className="font-semibold text-text-primary">{item.who}:</span> {item.why}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 rounded-lg border border-brand/20 bg-brand/5 px-4 py-3">
                                <p className="text-sm text-text-secondary">Mostly running empty? Consider the <Link to="/services/van-economy-tune" className="text-brand font-semibold hover:underline">Economy Tune</Link> instead.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* ─── Real example ─── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-3xl reveal">
                    <h2 className="text-xl font-bold text-text-primary">A real example from a load tune visit</h2>
                    <div className="mt-4 rounded-xl border border-border-default bg-surface p-5">
                        <p className="text-sm text-text-secondary leading-relaxed">
                            2018 Mercedes Sprinter W907 OM651, 67,000 miles. Scaffolding operator reported the van feeling flat under full load on A-road gradients, frequently dropping a gear on inclines. Diagnostic pre-check clear. Load and Driveability calibration applied. Road-tested with weight on board. Driver reported significantly improved pull from 1,800 RPM and no gear hunting on the same routes. Written calibration confirmation and insurance handover note issued.
                        </p>
                    </div>
                    <p className="mt-4 text-sm text-text-secondary">
                        Every tune ends with a written calibration confirmation. <Link to="/sample-diagnostic-report" className="font-semibold text-brand hover:underline">See an example of our documentation standard.</Link>
                    </p>
                </div>
            </Section>

            {/* ─── Internal links ─── */}
            <Section>
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-xl font-bold text-text-primary">Related reading and coverage</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Link to="/blog/sprinter-limp-mode-proper-diagnostic" className="flex items-center gap-2 rounded-xl border border-border-default bg-surface-alt p-4 text-sm text-brand hover:border-brand/30 hover:bg-brand/5 transition-all">
                            <ArrowRight className="h-4 w-4 shrink-0" />
                            Sprinter limp mode: what a proper diagnostic looks like
                        </Link>
                        <Link to="/areas-covered" className="flex items-center gap-2 rounded-xl border border-border-default bg-surface-alt p-4 text-sm text-brand hover:border-brand/30 hover:bg-brand/5 transition-all">
                            <ArrowRight className="h-4 w-4 shrink-0" />
                            Coverage: Kent and South East London service area
                        </Link>
                    </div>
                </div>
            </Section>

            {/* ─── SECTION 4: What happens on the day ─── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">What happens on the day</h2>
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { step: '01', title: 'Diagnostic pre-check', desc: 'Full fault scan, engine health assessment. Existing faults? We stop and advise before tuning.' },
                            { step: '02', title: 'Original file backup', desc: 'Your current ECU calibration is read and stored. Always reversible, always safe.' },
                            { step: '03', title: 'Load calibration', desc: 'Custom map written - low-end torque, boost onset, throttle mapping, and torque limits recalibrated.' },
                            { step: '04', title: 'Road test & handover', desc: 'Loaded road test to verify driveability. Written tune report and insurance handover note.' },
                        ].map((s) => (
                            <div key={s.step} className="text-center">
                                <div className="step-number mx-auto flex h-12 w-12 items-center justify-center text-lg font-bold">{s.step}</div>
                                <h3 className="mt-4 font-semibold text-text-primary">{s.title}</h3>
                                <p className="mt-2 text-sm text-text-secondary">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 SECTION 5: Pricing \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="reveal">
                        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Load tune pricing</h2>
                        <p className="mt-2 text-text-secondary">Fixed-price, all-inclusive. Diagnostic pre-check, calibration, road test, and handover note included.</p>
                        <div className="mt-6 overflow-x-auto rounded-xl border border-border-default">
                            <table className="min-w-full">
                                <thead><tr className="border-b border-border-default bg-surface-alt"><th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Package</th><th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Zone A</th><th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Zone B</th><th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Zone C</th></tr></thead>
                                <tbody>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Load &amp; Driveability Tune</td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;199<VatLabel /></td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;214<VatLabel /></td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;229<VatLabel /></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 reveal">
                        {[
                            { label: 'Diagnostic pre-check', value: 'Included' },
                            { label: 'Original file backup', value: 'Included' },
                            { label: 'Road test & handover note', value: 'Included' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between rounded-lg border border-border-default bg-surface-alt px-4 py-3">
                                <span className="text-sm text-text-secondary">{item.label}</span>
                                <span className="text-sm font-semibold text-orange-400">{item.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Safety + warranty section */}
                    <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6 reveal">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
                            <div>
                                <h3 className="font-bold text-text-primary">Safety and warranty considerations</h3>
                                <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                                    <li><strong>Insurance:</strong> ECU calibration is a modification and must be declared to your insurer. We provide a written handover note for this purpose.</li>
                                    <li><strong>Warranty:</strong> An ECU tune may affect your manufacturer warranty. Most Sprinters and vans we tune are out of warranty, but check with your dealer if unsure.</li>
                                    <li><strong>Reversibility:</strong> Your original calibration is always backed up. We can restore it for dealer visits, warranty claims, or resale.</li>
                                    <li><strong>Pre-check:</strong> We never tune a vehicle with existing faults. If the diagnostic pre-check finds issues, we advise on those first.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 Vans we tune \u2500\u2500\u2500 */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-2xl font-bold text-text-primary text-center">Vans we tune</h2>
                    <p className="mt-2 text-text-secondary text-center">All common commercial diesel vans. Send us your reg to confirm.</p>
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {[
                            'Mercedes Sprinter', 'Mercedes Vito', 'Mercedes Citan',
                            'Ford Transit', 'Ford Transit Custom',
                            'VW Crafter', 'VW Transporter',
                            'Vauxhall Vivaro', 'Vauxhall Movano',
                            'Renault Trafic', 'Renault Master',
                            'Iveco Daily',
                        ].map((van) => (
                            <div key={van} className="rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-text-secondary text-center">{van}</div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 FAQ \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-3xl reveal">
                    <h2 className="text-2xl font-bold text-text-primary text-center">Frequently asked questions</h2>
                    <div className="mt-8"><FaqAccordion items={faqs} /></div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 Related services \u2500\u2500\u2500 */}
            <Section className="bg-surface-alt/50">
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
                <div className="absolute inset-0"><div className="absolute inset-0 bg-gradient-to-r from-orange-950/95 to-orange-900/85" /></div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
                    <div className="text-center reveal">
                        <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl">Make your loaded van drive like an empty one</h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Load &amp; Driveability Tune from &pound;199<VatLabel /> - more torque, better response, fully reversible.</p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackNavClick('/booking', 'Book Online', 'load_tune_footer')}>Book Online</CTAButton>
                            <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="ghost" size="lg" external icon={<MessageCircle className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackWhatsAppClick('load_tune')}>WhatsApp Us</CTAButton>
                            <CTAButton href={`tel:${siteConfig.contact.phoneE164}`} variant="ghost" size="lg" external icon={<Phone className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackPhoneClick('load_tune')}>{siteConfig.contact.phoneDisplay}</CTAButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
