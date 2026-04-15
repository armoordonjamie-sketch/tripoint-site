import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { trackNavClick, trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { FaqAccordion } from '@/components/FaqAccordion';
import { Notice } from '@/components/Notice';
import { CheckCircle2, XCircle, ArrowRight, Phone, MessageCircle, AlertTriangle, Fuel, Gauge, TrendingUp, Shield } from 'lucide-react';
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
        question: 'How much fuel will I save?',
        answer:
            'We don\'t promise fixed mpg gains. Fuel savings depend on your route, driving style, load, and conditions. What the tune does is optimise power delivery so the engine works less hard in everyday driving - smoother cruising, less aggressive gear changes, and less throttle needed to maintain speed. Many high-mileage drivers notice a difference.',
    },
    {
        question: 'Is this the same as the Load & Driveability Tune?',
        answer:
            'Similar process, different calibration focus. The Load & Driveability Tune is optimised for maximum usable torque under payload. The Economy Tune focuses on efficiency - smoother power delivery, lower RPM cruising, and reduced fuel consumption patterns. Some customers choose one or the other; some benefit from a blend of both.',
    },
    {
        question: 'Will my engine be safe?',
        answer:
            'Yes. Every tune starts with a full diagnostic pre-check. We don\'t tune vehicles with existing faults. The economy calibration stays within conservative parameters - we\'re smoothing delivery, not maxing output.',
    },
    {
        question: 'Can it be reversed?',
        answer:
            'Yes. We store your original calibration file. If you ever need to revert, we can restore it.',
    },
    {
        question: 'Do I need to tell my insurer?',
        answer:
            'Yes. Any ECU modification must be declared to your insurer. We provide a handover note with full details for your records.',
    },
    {
        question: 'Which vans do you tune?',
        answer:
            'All common commercial vans: Mercedes Sprinter, Vito, Citan, Ford Transit and Transit Custom, VW Crafter and Transporter, Vauxhall/Opel Vivaro and Movano, Renault Trafic and Master, Peugeot Boxer and Expert, Citroen Relay and Dispatch, Iveco Daily, and more. Send us your reg and we\'ll confirm.',
    },
];

const crossSell = [
    { title: 'Load & Driveability Tune', desc: 'Optimised for stronger pull under load', href: '/services/van-load-driveability-tune' },
    { title: 'Fleet Van Tuning', desc: 'Volume pricing for 3+ vans', href: '/services/fleet-van-tuning' },
    { title: 'Standard Diagnosis', desc: 'Got a fault? We diagnose it first.', href: '/services/diagnostic-callout' },
];

export function VanEconomyTunePage() {
    const scrollRef = useScrollReveal();

    return (
        <div ref={scrollRef}>
            <Seo
                title="Van Economy Tune"
                description="Van economy tuning for smoother cruising and potential fuel savings. Diagnostic pre-check included. All van makes. From \u00a3199 (ex. VAT)."
                canonical="/services/van-economy-tune"
            />
            <ServiceSchema name="Van Economy Tune" description="Van economy tuning - smoother power delivery, lower RPM cruising, potential fuel savings. All van makes." url="/services/van-economy-tune" priceFrom={199} />
            <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Van Economy Tune', url: '/services/van-economy-tune' }]} />
            <FaqPageSchema items={faqs} />

            {/* \u2500\u2500\u2500 HERO \u2500\u2500\u2500 */}
            <section className="relative h-72 sm:h-96 overflow-hidden">
                <img
                    src="/images/services/van-sprinter-w907-front.png"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-surface/85 to-surface" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.18),transparent_70%)]" />
                <div className="absolute bottom-0 left-0 right-0 z-10 p-6 sm:p-10">
                    <div className="mx-auto max-w-5xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-2">Commercial Van Tuning</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl lg:text-6xl">Economy Tune</h1>
                        <p className="mt-3 max-w-xl text-lg text-text-secondary">Smoother cruising &bull; Lower running costs &bull; All van makes</p>
                    </div>
                </div>
            </section>

            {/* \u2500\u2500\u2500 SECTION 1: How an economy tune works \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center reveal">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">What an economy tune actually does</h2>
                            <p className="mt-4 text-text-secondary leading-relaxed">
                                An economy tune recalibrates your van&apos;s ECU to optimise efficiency rather than outright power. The focus is on making the engine work smarter - not harder.
                            </p>
                            <p className="mt-3 text-text-secondary leading-relaxed">
                                We adjust injection timing, boost pressure curves, and fuelling maps to deliver smoother power at lower RPMs. The result: the engine doesn&apos;t need as much throttle to maintain cruising speeds, gear changes are smoother, and the turbo builds boost more progressively.
                            </p>
                            <p className="mt-3 text-text-secondary leading-relaxed">
                                This isn&apos;t about making your van faster. It&apos;s about making every mile cheaper and every drive more relaxed.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <CTAButton href="/booking" size="md" onClick={() => trackNavClick('/booking', 'Book Online', 'economy_tune_top')}>Book Online</CTAButton>
                                <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="outline" size="md" external icon={<MessageCircle className="h-4 w-4" />} onClick={() => trackWhatsAppClick('economy_tune')}>WhatsApp Us</CTAButton>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                            <h3 className="text-lg font-bold text-text-primary mb-4">What the tune changes</h3>
                            <div className="space-y-4">
                                {[
                                    { icon: <Fuel className="h-5 w-5 text-emerald-400" />, label: 'Injection timing', detail: 'Optimised for cleaner, more complete combustion at cruising speeds' },
                                    { icon: <Gauge className="h-5 w-5 text-emerald-400" />, label: 'Boost pressure curves', detail: 'More progressive turbo response - less sudden, less laggy' },
                                    { icon: <TrendingUp className="h-5 w-5 text-emerald-400" />, label: 'Fuelling maps', detail: 'Leaner at steady state, richer only when needed under load' },
                                    { icon: <Shield className="h-5 w-5 text-emerald-400" />, label: 'Throttle mapping', detail: 'Smoother pedal response - less aggressive, more linear' },
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

            {/* \u2500\u2500\u2500 SECTION 2: Real-world impact \u2500\u2500\u2500 */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">Real-world impact</h2>
                    <p className="mt-2 text-text-secondary text-center max-w-2xl mx-auto">We don&apos;t promise specific MPG figures - anyone who does is guessing. What we can tell you is what changes and why.</p>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {([
                            { stat: '2-4 MPG', label: 'Typical improvement range', detail: 'Varies by route, load, and driving style. High-mileage motorway drivers see the biggest difference.' },
                            {
                                stat: (
                                    <span className="inline-flex flex-wrap items-baseline justify-center gap-x-0">
                                        £800–£2,000
                                        <VatLabel />
                                    </span>
                                ),
                                label: 'Potential annual saving',
                                detail: 'Based on 30,000-50,000 miles/year at average diesel prices. Not guaranteed - illustrative only.',
                            },
                            { stat: '1-3 fills', label: 'Payback period', detail: 'At £199 + VAT, most drivers recover the cost within the first few tanks if efficiency improves.' },
                        ] satisfies { stat: ReactNode; label: string; detail: string }[]).map((item) => (
                            <div key={item.label} className="rounded-2xl border border-border-default bg-surface p-6 text-center">
                                <p className="text-3xl font-extrabold text-emerald-400">{item.stat}</p>
                                <p className="mt-2 font-semibold text-text-primary text-sm">{item.label}</p>
                                <p className="mt-1 text-xs text-text-muted">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                    <h3 className="mt-8 text-lg font-semibold text-text-primary">See what drivers see</h3>
                    <figure className="mt-4 overflow-hidden rounded-xl border border-border-default max-w-2xl mx-auto mb-6">
                        <div className="relative aspect-[16/10] min-h-[200px] sm:min-h-[260px]">
                            <OptimizedImage
                                src="/images/new-images/mercedes-sprinter-driving-pov.jpg"
                                alt="Driver's view from a Mercedes Sprinter cab on the road"
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        </div>
                        <figcaption className="border-t border-border-default bg-surface-alt px-3 py-2 text-xs text-text-secondary text-center">
                            The Sprinter cab - smoother cruising starts here.
                        </figcaption>
                    </figure>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <figure className="overflow-hidden rounded-xl border border-border-default">
                            <div className="relative aspect-[16/10] h-44 sm:h-52">
                                <OptimizedImage
                                    src="/images/new-images/mpg-62-on-merc.jpg"
                                    alt="Mercedes van dash showing live fuel consumption readout"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            </div>
                            <figcaption className="border-t border-border-default bg-surface-alt px-3 py-2 text-xs text-text-secondary">
                                Real-world mpg on the trip computer - many drivers see smoother cruising after an economy map.
                            </figcaption>
                        </figure>
                        <figure className="overflow-hidden rounded-xl border border-border-default">
                            <div className="relative aspect-[16/10] h-44 sm:h-52">
                                <OptimizedImage
                                    src="/images/new-images/fuel-price-on-pump.jpg"
                                    alt="Fuel pump display showing price per litre at diesel pump"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            </div>
                            <figcaption className="border-t border-border-default bg-surface-alt px-3 py-2 text-xs text-text-secondary">
                                When diesel moves, every tenth of a mpg matters - the tune is about making the engine work smarter at the pump.
                            </figcaption>
                        </figure>
                    </div>
                    <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
                            <p className="text-sm text-text-secondary"><strong>Honest disclaimer:</strong> Fuel savings are never guaranteed. They depend on your driving style, route, load, weather, and tyre condition. What we guarantee is that the calibration will be done properly, your engine will be healthier for it, and the drive will be noticeably smoother.</p>
                        </div>
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 SECTION 3: Best suited for / Not suited for \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start reveal">
                        <div>
                            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-400" /> Best suited for</h2>
                            <ul className="mt-4 space-y-3">
                                {[
                                    { who: 'Motorway and A-road drivers', why: 'Most of your miles are at steady speed - this is where economy gains are biggest' },
                                    { who: 'High-mileage couriers', why: '30,000+ miles/year means even small MPG improvements add up fast' },
                                    { who: 'Light-load or empty-run vans', why: 'Delivery vans, couriers, and service vehicles that aren\u2019t carrying heavy payloads' },
                                    { who: 'Long-distance drivers', why: 'Motorway cruising at lower RPM = the economy tune\u2019s sweet spot' },
                                    { who: 'Owner-drivers watching costs', why: 'If fuel is your biggest expense after finance, every MPG matters' },
                                ].map((item) => (
                                    <li key={item.who} className="text-sm text-text-secondary">
                                        <span className="font-semibold text-text-primary">{item.who}:</span> {item.why}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2"><XCircle className="h-5 w-5 text-red-400" /> Not the best fit for</h2>
                            <ul className="mt-4 space-y-3">
                                {[
                                    { who: 'Heavily loaded vans', why: 'If you\u2019re running near max payload most of the time, the Load & Driveability Tune is a better fit' },
                                    { who: 'Short urban runs only', why: 'Stop-start city driving sees less benefit - the gains come at steady speeds' },
                                    { who: 'Modified exhausts or DPF deletes', why: 'We don\u2019t tune vehicles with emission-control modifications' },
                                    { who: 'Vans with existing engine faults', why: 'We won\u2019t tune until underlying issues are resolved first' },
                                ].map((item) => (
                                    <li key={item.who} className="text-sm text-text-secondary">
                                        <span className="font-semibold text-text-primary">{item.who}:</span> {item.why}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 rounded-lg border border-brand/20 bg-brand/5 px-4 py-3">
                                <p className="text-sm text-text-secondary">Heavily loaded? Consider the <Link to="/services/van-load-driveability-tune" className="text-brand font-semibold hover:underline">Load & Driveability Tune</Link> instead.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* \u2500\u2500\u2500 SECTION 4: What happens on the day \u2500\u2500\u2500 */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl reveal">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">What happens on the day</h2>
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { step: '01', title: 'Diagnostic pre-check', desc: 'Full fault code scan and engine health assessment. If there are existing issues, we stop here and advise.' },
                            { step: '02', title: 'Original file backup', desc: 'We read and store your current ECU calibration. This is your safety net - always reversible.' },
                            { step: '03', title: 'Economy calibration', desc: 'Custom economy map written to your ECU. injection timing, boost curves, and fuelling maps optimised.' },
                            { step: '04', title: 'Road test & handover', desc: 'Short road test to verify smooth operation. Written report and insurance handover note provided.' },
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
                        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Economy tune pricing</h2>
                        <p className="mt-2 text-text-secondary">Fixed-price, all-inclusive. Diagnostic pre-check, calibration, road test, and handover note included.</p>
                        <div className="mt-6 overflow-x-auto rounded-xl border border-border-default">
                            <table className="min-w-full">
                                <thead><tr className="border-b border-border-default bg-surface-alt"><th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Package</th><th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Zone A</th><th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Zone B</th><th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Zone C</th></tr></thead>
                                <tbody>
                                    <tr className="border-b border-border-default"><td className="px-4 py-3 text-text-secondary">Van Economy Tune</td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;199<VatLabel /></td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;214<VatLabel /></td><td className="px-4 py-3 text-right font-semibold text-brand-light">&pound;229<VatLabel /></td></tr>
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
                                <span className="text-sm font-semibold text-emerald-400">{item.value}</span>
                            </div>
                        ))}
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

            {/* \u2500\u2500\u2500 Insurance notice \u2500\u2500\u2500 */}
            <Section>
                <div className="mx-auto max-w-5xl reveal">
                    <Notice variant="warning">ECU calibration is a modification and must be declared to your vehicle insurer. We provide a written handover note with full details of the work performed for your records.</Notice>
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
                <div className="absolute inset-0"><div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 to-emerald-900/85" /></div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
                    <div className="text-center reveal">
                        <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl">Make every mile cheaper</h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Economy tune from &pound;199<VatLabel /> - smoother driving, potential fuel savings, fully reversible.</p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackNavClick('/booking', 'Book Online', 'economy_tune_footer')}>Book Online</CTAButton>
                            <CTAButton href={`https://wa.me/${siteConfig.contact.whatsappE164}`} variant="ghost" size="lg" external icon={<MessageCircle className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackWhatsAppClick('economy_tune')}>WhatsApp Us</CTAButton>
                            <CTAButton href={`tel:${siteConfig.contact.phoneE164}`} variant="ghost" size="lg" external icon={<Phone className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackPhoneClick('economy_tune')}>{siteConfig.contact.phoneDisplay}</CTAButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
