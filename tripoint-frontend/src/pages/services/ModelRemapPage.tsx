import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { FaqAccordion } from '@/components/FaqAccordion';
import { ServiceSchema, BreadcrumbSchema, FaqPageSchema } from '@/components/JsonLd';
import { VatLabel } from '@/components/VatLabel';
import { siteConfig } from '@/config/site';
import { trackNavClick, trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics';
import { ArrowRight, Phone, MessageCircle, Gauge, TrendingUp, ShieldCheck, RotateCcw, CheckCircle2 } from 'lucide-react';
import { remapModels, remapModelList, REMAP_PRICE_FROM } from '@/data/remapModels';

const steps = [
    { step: '01', title: 'Diagnostic pre-check', desc: 'Full fault scan and engine health check. Existing faults? We stop and advise before tuning.' },
    { step: '02', title: 'Original file backup', desc: 'Your current ECU calibration is read and stored. Always reversible, always safe.' },
    { step: '03', title: 'Custom Stage 1 map', desc: 'Power and driveability, or economy - calibrated for how you use the van, within safe limits.' },
    { step: '04', title: 'Road test & handover', desc: 'Road test to verify, then a written confirmation and insurance handover note.' },
];

export function ModelRemapPage({ slug }: { slug: string }) {
    const m = remapModels[slug];
    if (!m) return null;

    const others = remapModelList.filter((x) => x.slug !== m.slug);
    const wa = `https://wa.me/${siteConfig.contact.whatsappE164}`;

    return (
        <div>
            <Seo title={m.seoTitle} description={m.seoDescription} canonical={`/services/${m.slug}`} />
            <ServiceSchema
                name={`${m.fullName} Remap (Stage 1 ECU)`}
                description={m.seoDescription}
                url={`/services/${m.slug}`}
                priceFrom={REMAP_PRICE_FROM}
            />
            <BreadcrumbSchema
                items={[
                    { name: 'Home', url: '/' },
                    { name: 'Services', url: '/services' },
                    { name: 'Van Remapping', url: '/services/van-remapping' },
                    { name: `${m.fullName} Remap`, url: `/services/${m.slug}` },
                ]}
            />
            <FaqPageSchema items={m.faqs} />

            {/* ─── HERO ─── */}
            <section className="relative h-64 sm:h-80 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-950/95 via-surface/90 to-surface" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.18),transparent_70%)]" />
                <div className="absolute bottom-0 left-0 right-0 z-10 p-6 sm:p-10">
                    <div className="mx-auto max-w-5xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-orange-400 mb-2">Commercial Van Remapping</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl lg:text-6xl">{m.fullName} Remap</h1>
                        <p className="mt-3 max-w-xl text-lg text-text-secondary">{m.heroSub}</p>
                    </div>
                </div>
            </section>

            {/* ─── INTRO + CTA ─── */}
            <Section>
                <div className="mx-auto max-w-3xl">
                    <p className="text-base leading-relaxed text-text-secondary lg:text-xl">{m.intro}</p>
                    <p className="mt-3 text-sm text-text-muted">{m.engines}</p>
                    <div className="mt-6 rounded-2xl border border-border-default bg-surface-alt p-5">
                        <p className="text-sm text-text-secondary">
                            <span className="font-semibold text-text-primary">From &pound;{REMAP_PRICE_FROM}<VatLabel /></span> · Stage 1 · Diagnostic pre-check included · Mobile across Kent &amp; SE London
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <CTAButton href="/booking" size="md" onClick={() => trackNavClick('/booking', 'Book Online', `${m.slug}_top`)}>Book Online</CTAButton>
                            <CTAButton href={wa} variant="outline" size="md" external icon={<MessageCircle className="h-4 w-4" />} onClick={() => trackWhatsAppClick(m.slug)}>WhatsApp Your Reg</CTAButton>
                        </div>
                    </div>
                </div>
            </Section>

            {/* ─── Economy vs Power ─── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">Two ways to map your {m.model}</h2>
                    <p className="mt-2 text-text-secondary text-center max-w-2xl mx-auto">Same careful process and price - the difference is what the calibration is tuned for.</p>
                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <Link to="/services/van-load-driveability-tune" className="rounded-xl border border-border-default bg-surface p-6 transition-all hover:border-orange-500/40 hover:bg-orange-500/5">
                            <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-orange-400" /><h3 className="font-bold text-text-primary">Power &amp; Driveability</h3></div>
                            <p className="mt-2 text-sm text-text-secondary">More usable torque, sharper throttle, cleaner loaded pull. Best for trade, towing and stop-start work.</p>
                            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">Learn more <ArrowRight className="h-4 w-4" /></span>
                        </Link>
                        <Link to="/services/van-economy-tune" className="rounded-xl border border-border-default bg-surface p-6 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/5">
                            <div className="flex items-center gap-2"><Gauge className="h-5 w-5 text-emerald-400" /><h3 className="font-bold text-text-primary">Economy</h3></div>
                            <p className="mt-2 text-sm text-text-secondary">Smoother low-RPM cruising and potential fuel savings. Best for high-mileage motorway and courier vans.</p>
                            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">Learn more <ArrowRight className="h-4 w-4" /></span>
                        </Link>
                    </div>
                </div>
            </Section>

            {/* ─── Software-unlocked power ─── */}
            <Section>
                <div className="mx-auto max-w-3xl">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Often, the power is already there - locked in software</h2>
                    <p className="mt-4 text-text-secondary leading-relaxed">
                        Manufacturers frequently sell the same engine at several power outputs, with the difference set in the ECU software rather than the hardware. A Stage 1 remap safely brings that built-in headroom into usable, everyday torque - within the engine and gearbox&apos;s limits, with emissions equipment left intact and the original file fully reversible.
                    </p>
                    <p className="mt-3 text-text-secondary leading-relaxed">
                        We never chase unsafe numbers or remove DPF, EGR or AdBlue, and we never quote a guaranteed figure - every van and engine is different. What you get is a stronger, smoother {m.model} that pulls cleanly when loaded.
                    </p>
                </div>
            </Section>

            {/* ─── What you can expect ─── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-3xl">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">What you can expect</h2>
                    <ul className="mt-6 space-y-3">
                        {m.gains.map((g) => (
                            <li key={g} className="flex items-start gap-3 text-text-secondary">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-orange-400" />
                                <span>{g}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-5 text-sm text-text-muted">Honest note: we never promise specific BHP or MPG figures - results depend on your exact engine, load and driving. What we guarantee is a properly done calibration on a healthy engine.</p>
                </div>
            </Section>

            {/* ─── How it works ─── */}
            <Section>
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">How it works</h2>
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-6">
                        {steps.map((s) => (
                            <div key={s.step} className="text-center">
                                <div className="step-number mx-auto flex h-12 w-12 items-center justify-center text-lg font-bold">{s.step}</div>
                                <h3 className="mt-4 font-semibold text-text-primary">{s.title}</h3>
                                <p className="mt-2 text-sm text-text-secondary">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ─── Compliance / safety ─── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-3xl grid gap-4 sm:grid-cols-3">
                    {[
                        { icon: <ShieldCheck className="h-5 w-5 text-orange-400" />, label: 'No deletes', detail: 'DPF, EGR and AdBlue stay intact - road-legal, MOT-safe.' },
                        { icon: <RotateCcw className="h-5 w-5 text-orange-400" />, label: 'Fully reversible', detail: 'Original file backed up - we can restore it any time.' },
                        { icon: <CheckCircle2 className="h-5 w-5 text-orange-400" />, label: 'Insurance note', detail: 'Written handover note to declare the work to your insurer.' },
                    ].map((c) => (
                        <div key={c.label} className="rounded-xl border border-border-default bg-surface p-4">
                            <div className="flex items-center gap-2">{c.icon}<p className="font-semibold text-text-primary">{c.label}</p></div>
                            <p className="mt-2 text-sm text-text-secondary">{c.detail}</p>
                        </div>
                    ))}
                </div>
            </Section>

            {/* ─── FAQ ─── */}
            <Section>
                <div className="mx-auto max-w-3xl">
                    <h2 className="text-2xl font-bold text-text-primary text-center">{m.model} remap FAQs</h2>
                    <div className="mt-8"><FaqAccordion items={m.faqs} /></div>
                </div>
            </Section>

            {/* ─── Other vans ─── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-xl font-bold text-text-primary">Other vans we remap</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        {others.map((o) => (
                            <Link key={o.slug} to={`/services/${o.slug}`} className="flex items-center justify-between rounded-xl border border-border-default bg-surface p-4 transition-all hover:border-brand/30 hover:bg-brand/5">
                                <div><h3 className="font-semibold text-text-primary">{o.fullName}</h3><p className="text-sm text-text-secondary">Stage 1 remap</p></div>
                                <ArrowRight className="h-5 w-5 shrink-0 text-brand" />
                            </Link>
                        ))}
                    </div>
                    <p className="mt-4 text-sm text-text-secondary">Different van? We remap all common commercial vans - <Link to="/services/van-remapping" className="text-brand font-semibold hover:underline">see all van remapping</Link> or send your reg.</p>
                </div>
            </Section>

            {/* ── Coverage ── */}
            <Section className="bg-surface-alt/30 border-t border-border-default pt-12 pb-12">
                <div className="mx-auto max-w-5xl text-center">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-brand mb-4">We cover</h2>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-3 md:gap-x-6">
                        {[
                            { name: 'Greenwich', to: '/areas-covered/greenwich' },
                            { name: 'Bexley', to: '/areas-covered/bexley' },
                            { name: 'Orpington', to: '/areas-covered/orpington' },
                            { name: 'Maidstone', to: '/areas-covered/maidstone' },
                            { name: 'Tonbridge', to: '/areas-covered/tonbridge' },
                            { name: 'Gillingham and Medway', to: '/areas-covered/medway' },
                        ].map((area, i) => (
                            <div key={area.name} className="flex items-center gap-x-4 md:gap-x-6">
                                <Link to={area.to} className="text-base font-medium text-text-primary hover:text-brand transition-colors">{area.name}</Link>
                                {i < 5 && <span className="hidden md:inline-block text-border-default select-none">&bull;</span>}
                            </div>
                        ))}
                    </div>
                    <p className="mt-6 text-sm text-text-muted">Mobile across Kent and South East London. <Link to="/pricing" className="text-brand hover:underline">Check your zone on the pricing page.</Link></p>
                </div>
            </Section>

            {/* ─── FOOTER CTA ─── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0"><div className="absolute inset-0 bg-gradient-to-r from-orange-950/95 to-orange-900/85" /></div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl">Mobile {m.fullName} remap, at your door</h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Stage 1 from &pound;{REMAP_PRICE_FROM}<VatLabel /> - power &amp; driveability or economy, fully reversible.</p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackNavClick('/booking', 'Book Online', `${m.slug}_footer`)}>Book Online</CTAButton>
                            <CTAButton href={wa} variant="ghost" size="lg" external icon={<MessageCircle className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackWhatsAppClick(m.slug)}>WhatsApp Us</CTAButton>
                            <CTAButton href={`tel:${siteConfig.contact.phoneE164}`} variant="ghost" size="lg" external icon={<Phone className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackPhoneClick(m.slug)}>{siteConfig.contact.phoneDisplay}</CTAButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
