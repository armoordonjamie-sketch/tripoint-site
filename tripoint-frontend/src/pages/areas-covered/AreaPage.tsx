import { useParams, Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { FaqAccordion } from '@/components/FaqAccordion';
import { getSeoForPath } from '@/routes';
import { getAreaData } from '@/data/areas';
import { siteConfig } from '@/config/site';
import { CheckCircle2, MessageCircle, Phone, MapPin } from 'lucide-react';
import { trackNavClick, trackPhoneClick, trackWhatsAppClick, trackSelectContent } from '@/lib/analytics';

function formatSlug(slug: string): string {
    return slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

const WHY_CHOOSE = [
    { title: 'Dealer-level tooling', desc: 'STAR/XENTRY diagnostics at your location. No workshop drop-off.' },
    { title: 'Compliance-first', desc: 'We diagnose before any repair or regen. No guesswork, no masking faults.' },
    { title: 'Mobile convenience', desc: 'We come to you at home or work. Save time and hassle.' },
    { title: 'Clear communication', desc: 'Written report and next steps. You know what we found and what to do.' },
];

const TOP_SERVICES = [
    { name: 'Standard Diagnosis', href: '/services/diagnostic-callout' },
    { name: 'VOR Diagnosis', href: '/services/vor-van-diagnostics' },
    { name: 'Pre-Purchase Health Check', href: '/services/pre-purchase-digital-health-check' },
    { name: 'Mercedes Van Servicing', href: '/services/mercedes-van-servicing' },
];

export function AreaPage() {
    const { slug } = useParams<{ slug: string }>();
    const town = slug ? formatSlug(slug) : '';
    const path = `/areas-covered/${slug || ''}`;
    const seo = getSeoForPath(path);
    const areaData = slug ? getAreaData(slug) : undefined;

    return (
        <>
            <Seo
                title={seo?.title ?? `Mobile Vehicle Diagnostics in ${town}`}
                description={seo?.description}
                canonical={seo?.canonicalPath ?? path}
            />
            <section className="relative py-16 md:py-24">
                <div className="absolute inset-0 mesh-gradient opacity-30" aria-hidden="true" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">Mobile Mercedes Specialist</p>
                    <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                        Mobile Vehicle Diagnostics in {town} | Mercedes Specialist
                    </h1>
                    <p className="mt-6 max-w-3xl text-lg text-text-secondary">
                        {areaData?.intro ??
                            `TriPoint Diagnostics brings dealer-level Mercedes diagnostics and fault finding to ${town} and the surrounding area. We are a mobile service, so we come to you.`}
                    </p>

                    {/* Availability and pricing note */}
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                        <span className="inline-flex items-center gap-1.5 text-text-secondary">
                            <MapPin className="h-4 w-4 text-brand shrink-0" />
                            Available Mon to Sat. Often same-day in core zones.
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-medium text-brand-light">
                            Diagnostics from £120–£150 by zone (A/B/C) — confirmed when you book with your postcode.
                        </span>
                    </div>

                    {/* Above-the-fold CTAs */}
                    <div className="mt-8 flex flex-wrap gap-3">
                        <CTAButton
                            href={`tel:${siteConfig.contact.phoneE164}`}
                            external
                            icon={<Phone className="h-4 w-4" />}
                            onClick={() => trackPhoneClick(`area_${town.toLowerCase()}`)}
                        >
                            Call {siteConfig.contact.phoneDisplay}
                        </CTAButton>
                        <CTAButton
                            href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                            variant="outline"
                            external
                            icon={<MessageCircle className="h-4 w-4" />}
                            onClick={() => trackWhatsAppClick(`area_${town.toLowerCase()}`)}
                        >
                            WhatsApp Us
                        </CTAButton>
                        <CTAButton
                            href="/booking"
                            variant="outline"
                            onClick={() => trackNavClick('/booking', 'Book Now', `area_${town.toLowerCase()}`)}
                        >
                            Book Online
                        </CTAButton>
                    </div>
                </div>
            </section>

            <Section>
                <h2 className="text-2xl font-bold text-text-primary">What&apos;s Included</h2>
                <ul className="mt-4 space-y-2">
                    {(areaData?.included ?? [
                        'Dealer-level STAR/XENTRY diagnostics at your location',
                        'Fault finding and guided tests',
                        'Coding and adaptations',
                        'DPF and AdBlue diagnostics',
                        'Up to 60 minutes on-site (standard callout)',
                        'Clear written report',
                    ]).map((item) => (
                        <li key={item} className="flex items-start gap-2 text-text-secondary">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </Section>

            <Section className="bg-surface-alt/30">
                <h2 className="text-2xl font-bold text-text-primary">Why Choose TriPoint Diagnostics</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {WHY_CHOOSE.map((item) => (
                        <div
                            key={item.title}
                            className="rounded-xl border border-border-default bg-surface-alt p-5"
                        >
                            <h3 className="font-semibold text-text-primary">{item.title}</h3>
                            <p className="mt-2 text-sm text-text-secondary">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </Section>

            <Section>
                <h2 className="text-2xl font-bold text-text-primary">Popular Services in {town}</h2>
                <p className="mt-2 text-text-secondary">
                    We offer a range of mobile diagnostic services across {town} and the surrounding area.
                </p>
                <ul className="mt-4 space-y-2">
                    {TOP_SERVICES.map((s) => (
                        <li key={s.href}>
                            <Link
                                to={s.href}
                                className="text-brand-light hover:text-brand font-medium transition-colors"
                            >
                                {s.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </Section>

            {(areaData?.faqs?.length ?? 0) > 0 && (
                <Section className="bg-surface-alt/30">
                    <h2 className="text-2xl font-bold text-text-primary">FAQs for {town}</h2>
                    <div className="mt-6">
                        <FaqAccordion items={areaData!.faqs} />
                    </div>
                </Section>
            )}

            {areaData?.nearbyAreas && areaData.nearbyAreas.length > 0 && (
                <Section>
                    <h2 className="text-xl font-bold text-text-primary">We Also Cover</h2>
                    <p className="mt-2 text-text-secondary">
                        TriPoint Diagnostics serves the wider Kent and South East London area.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {areaData.nearbyAreas.map((s) => (
                            <Link
                                key={s}
                                to={`/areas-covered/${s}`}
                                onClick={() => trackSelectContent('area_link', s)}
                                className="rounded-lg border border-border-default bg-surface-alt px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-brand/30 hover:bg-brand/5 hover:text-brand"
                            >
                                {formatSlug(s)}
                            </Link>
                        ))}
                    </div>
                </Section>
            )}

            <Section>
                <div className="rounded-2xl border border-brand/20 bg-brand/5 p-8 text-center">
                    <h2 className="text-2xl font-bold text-text-primary">Book a Diagnostic in {town}</h2>
                    <p className="mt-2 text-text-secondary">
                        Enter your postcode, pick a service, and we will confirm your zone and price.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                        <CTAButton
                            href="tel:+442080586095"
                            icon={<Phone className="h-5 w-5" />}
                            onClick={() => trackPhoneClick('area_body')}
                        >
                            Call 020 8058 6095
                        </CTAButton>
                        <CTAButton
                            href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                            variant="outline"
                            external
                            icon={<MessageCircle className="h-5 w-5" />}
                            onClick={() => trackWhatsAppClick('area_body')}
                        >
                            WhatsApp Us
                        </CTAButton>
                        <CTAButton href="/booking" onClick={() => trackNavClick('/booking', 'Book a Callout', 'area_body')}>
                            Book a Callout
                        </CTAButton>
                    </div>
                </div>
            </Section>
        </>
    );
}
