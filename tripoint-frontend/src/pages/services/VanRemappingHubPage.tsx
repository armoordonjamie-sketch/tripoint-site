import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { FaqAccordion } from '@/components/FaqAccordion';
import { ServiceSchema, BreadcrumbSchema, FaqPageSchema } from '@/components/JsonLd';
import { VatLabel } from '@/components/VatLabel';
import { siteConfig } from '@/config/site';
import { trackNavClick, trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics';
import { ArrowRight, Phone, MessageCircle, Gauge, TrendingUp, Users } from 'lucide-react';
import { remapModelList, REMAP_PRICE_FROM } from '@/data/remapModels';

const faqs = [
    { question: 'What is a van remap?', answer: 'A remap (ECU calibration) re-writes your van’s engine map for either more usable power and driveability or better economy. We do Stage 1 calibrations only, kept within safe limits, with emissions equipment intact.' },
    { question: 'Will a remap pass the MOT?', answer: 'Yes. A compliant remap that keeps the DPF, EGR and AdBlue/SCR intact passes the MOT like a standard van. We never do deletes - removing emissions equipment is illegal for road use and an MOT failure.' },
    { question: 'Is it reversible, and do I need to tell my insurer?', answer: 'We back up your original calibration file, so it is fully reversible. A remap is a modification - you must declare it to your insurer. We provide a written handover note for your records.' },
    { question: 'How much does a van remap cost?', answer: `Mobile Stage 1 remaps start from £${REMAP_PRICE_FROM} + VAT (Zone A), including a diagnostic pre-check, road test and handover note. Fleets of 3+ vans get volume pricing.` },
    { question: 'Which vans do you remap?', answer: 'All common commercial diesel vans: Mercedes Sprinter, Vito and Citan, Ford Transit and Transit Custom, VW Transporter, Crafter and Caddy, Vauxhall Vivaro and Movano, Renault Trafic and Master, and more. Send your reg to confirm.' },
];

const tuneTypes = [
    { title: 'Power & Driveability Remap', desc: 'More usable torque, sharper throttle, cleaner loaded pull. Best for trade, towing and stop-start work.', href: '/services/van-load-driveability-tune', Icon: TrendingUp, tint: 'text-orange-400', hover: 'hover:border-orange-500/40 hover:bg-orange-500/5' },
    { title: 'Economy Remap', desc: 'Smoother low-RPM cruising and potential fuel savings. Best for high-mileage motorway and courier vans.', href: '/services/van-economy-tune', Icon: Gauge, tint: 'text-emerald-400', hover: 'hover:border-emerald-500/40 hover:bg-emerald-500/5' },
    { title: 'Fleet Remapping', desc: 'Consistent power and driveability across your fleet, depot visits and volume pricing for 3+ vans.', href: '/services/fleet-van-tuning', Icon: Users, tint: 'text-blue-400', hover: 'hover:border-blue-500/40 hover:bg-blue-500/5' },
];

export function VanRemappingHubPage() {
    const wa = `https://wa.me/${siteConfig.contact.whatsappE164}`;

    return (
        <div>
            <Seo
                title="Van Remapping - Mobile Stage 1 ECU Remap, Kent & SE London"
                description="Mobile van remapping across Kent & SE London. Stage 1 ECU remap for power & driveability or economy, all common vans. Diagnostic pre-check, reversible, no deletes. From £199 + VAT."
                canonical="/services/van-remapping"
            />
            <ServiceSchema
                name="Van Remapping (Stage 1 ECU)"
                description="Mobile Stage 1 van remapping for power & driveability or economy. All common commercial vans. Diagnostic pre-check, reversible, emissions equipment intact."
                url="/services/van-remapping"
                priceFrom={REMAP_PRICE_FROM}
            />
            <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Van Remapping', url: '/services/van-remapping' }]} />
            <FaqPageSchema items={faqs} />

            {/* ─── HERO ─── */}
            <section className="relative h-64 sm:h-80 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-950/95 via-surface/90 to-surface" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.18),transparent_70%)]" />
                <div className="absolute bottom-0 left-0 right-0 z-10 p-6 sm:p-10">
                    <div className="mx-auto max-w-5xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-orange-400 mb-2">Commercial Van Remapping</p>
                        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl lg:text-6xl">Van Remapping</h1>
                        <p className="mt-3 max-w-xl text-lg text-text-secondary">Stage 1 ECU remap &bull; Power &amp; driveability or economy &bull; Mobile, all makes</p>
                    </div>
                </div>
            </section>

            {/* ─── INTRO ─── */}
            <Section>
                <div className="mx-auto max-w-3xl">
                    <p className="text-base leading-relaxed text-text-secondary lg:text-xl">
                        A van remap re-calibrates your ECU for how you actually use the van - stronger, smoother power and driveability for loaded and trade work, or better economy for high-mileage runs. We tune mobile across Kent and South East London, always after a full diagnostic pre-check, with your original file backed up and fully reversible. No DPF, EGR or AdBlue deletes - everything stays road-legal.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <CTAButton href="/booking" size="md" onClick={() => trackNavClick('/booking', 'Book Online', 'remap_hub_top')}>Book Online</CTAButton>
                        <CTAButton href={wa} variant="outline" size="md" external icon={<MessageCircle className="h-4 w-4" />} onClick={() => trackWhatsAppClick('remap_hub')}>WhatsApp Your Reg</CTAButton>
                    </div>
                </div>
            </Section>

            {/* ─── By tune type ─── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">Choose your remap</h2>
                    <p className="mt-2 text-text-secondary text-center max-w-2xl mx-auto">Same careful process, from &pound;{REMAP_PRICE_FROM}<VatLabel /> - the difference is what the calibration is tuned for.</p>
                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                        {tuneTypes.map((t) => (
                            <Link key={t.href} to={t.href} className={`rounded-xl border border-border-default bg-surface p-6 transition-all ${t.hover}`}>
                                <div className="flex items-center gap-2"><t.Icon className={`h-5 w-5 ${t.tint}`} /><h3 className="font-bold text-text-primary">{t.title}</h3></div>
                                <p className="mt-2 text-sm text-text-secondary">{t.desc}</p>
                                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">Learn more <ArrowRight className="h-4 w-4" /></span>
                            </Link>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ─── Software-unlocked power ─── */}
            <Section>
                <div className="mx-auto max-w-3xl">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Often, the power is already there - locked in software</h2>
                    <p className="mt-4 text-text-secondary leading-relaxed">
                        Manufacturers frequently sell the same engine at several power outputs, with the difference set in the ECU software rather than the hardware. A Stage 1 remap safely brings that built-in headroom into usable, everyday torque - within the engine and gearbox&apos;s limits, with emissions equipment left intact and the original file fully reversible. We never chase unsafe numbers or quote guaranteed figures.
                    </p>
                </div>
            </Section>

            {/* ─── By van ─── */}
            <Section className="bg-surface-alt/50">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">Remaps by van</h2>
                    <p className="mt-2 text-text-secondary text-center">Model-specific guides for the UK&apos;s most-tuned vans.</p>
                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                        {remapModelList.map((o) => (
                            <Link key={o.slug} to={`/services/${o.slug}`} className="flex items-center justify-between rounded-xl border border-border-default bg-surface p-4 transition-all hover:border-brand/30 hover:bg-brand/5">
                                <div><h3 className="font-semibold text-text-primary">{o.fullName}</h3><p className="text-sm text-text-secondary">Stage 1 remap</p></div>
                                <ArrowRight className="h-5 w-5 shrink-0 text-brand" />
                            </Link>
                        ))}
                    </div>
                    <p className="mt-4 text-sm text-text-secondary text-center">Mercedes Sprinter, Vito, Citan and other makes covered too - send your reg and we&apos;ll confirm.</p>
                </div>
            </Section>

            {/* ─── FAQ ─── */}
            <Section>
                <div className="mx-auto max-w-3xl">
                    <h2 className="text-2xl font-bold text-text-primary text-center">Van remapping FAQs</h2>
                    <div className="mt-8"><FaqAccordion items={faqs} /></div>
                </div>
            </Section>

            {/* ── Coverage ── */}
            <Section className="bg-surface-alt/30 border-t border-border-default pt-12 pb-12">
                <div className="mx-auto max-w-5xl text-center">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-brand mb-4">We cover</h2>
                    <p className="text-text-secondary">Mobile across Kent and South East London - Greenwich, Bexley, Orpington, Maidstone, Tonbridge, Gillingham and Medway. <Link to="/pricing" className="text-brand hover:underline">Check your zone.</Link></p>
                </div>
            </Section>

            {/* ─── FOOTER CTA ─── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0"><div className="absolute inset-0 bg-gradient-to-r from-orange-950/95 to-orange-900/85" /></div>
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl">Mobile van remapping, at your door</h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Stage 1 from &pound;{REMAP_PRICE_FROM}<VatLabel /> - power &amp; driveability or economy, fully reversible, no deletes.</p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton href="/booking" variant="secondary" size="lg" onClick={() => trackNavClick('/booking', 'Book Online', 'remap_hub_footer')}>Book Online</CTAButton>
                            <CTAButton href={wa} variant="ghost" size="lg" external icon={<MessageCircle className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackWhatsAppClick('remap_hub')}>WhatsApp Us</CTAButton>
                            <CTAButton href={`tel:${siteConfig.contact.phoneE164}`} variant="ghost" size="lg" external icon={<Phone className="h-5 w-5" />} className="text-white hover:text-white hover:bg-white/10" onClick={() => trackPhoneClick('remap_hub')}>{siteConfig.contact.phoneDisplay}</CTAButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
