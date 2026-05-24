import { useParams, Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { FaqAccordion } from '@/components/FaqAccordion';
import { FaqPageSchema, BreadcrumbSchema } from '@/components/JsonLd';
import { getSeoForPath } from '@/routes';
import { getAreaData } from '@/data/areas';
import { siteConfig } from '@/config/site';
import { CheckCircle2, MessageCircle, Phone, MapPin, Wrench, FileText } from 'lucide-react';
import { trackNavClick, trackPhoneClick, trackWhatsAppClick, trackSelectContent } from '@/lib/analytics';
import { getWhatsAppHref } from '@/lib/whatsappHref';
import { VatLabel } from '@/components/VatLabel';

function formatSlug(slug: string): string {
    return slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

export function AreaPage() {
    const { slug } = useParams<{ slug: string }>();
    const town = slug ? (getAreaData(slug)?.name ?? formatSlug(slug)) : '';
    const path = `/areas-covered/${slug || ''}`;
    const seo = getSeoForPath(path);
    const areaData = slug ? getAreaData(slug) : undefined;

    const breadcrumbItems = [
        { name: 'Home', url: siteConfig.url },
        { name: 'Areas Covered', url: `${siteConfig.url}/areas-covered` },
        { name: town, url: `${siteConfig.url}${path}` },
    ];

    return (
        <>
            {/* Breadcrumb schema */}
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* FAQPage schema - only when FAQs are present */}
            {(areaData?.faqs?.length ?? 0) > 0 && (
                <FaqPageSchema items={areaData!.faqs} />
            )}

            <Seo
                title={seo?.title ?? `Mobile Vehicle Diagnostics in ${town} | TriPoint Diagnostics`}
                description={seo?.description}
                canonical={seo?.canonicalPath ?? path}
            />

            {/* ── HERO ─────────────────────────────────────── */}
            <section className="relative py-16 md:py-24">
                <div className="absolute inset-0 mesh-gradient opacity-30" aria-hidden="true" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb nav */}
                    <nav aria-label="Breadcrumb" className="mb-6">
                        <ol className="flex flex-wrap items-center gap-1 text-xs text-text-muted">
                            <li><Link to="/" className="hover:text-brand transition-colors">Home</Link></li>
                            <li aria-hidden="true" className="select-none">/</li>
                            <li><Link to="/areas-covered" className="hover:text-brand transition-colors">Areas Covered</Link></li>
                            <li aria-hidden="true" className="select-none">/</li>
                            <li className="text-text-secondary font-medium" aria-current="page">{town}</li>
                        </ol>
                    </nav>

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
                        <span className="inline-flex flex-wrap items-baseline gap-x-0 font-medium text-brand-light">
                            Diagnostics from £120 to £150<VatLabel /> by zone (A/B/C), confirmed when you book with your postcode.
                        </span>
                    </div>

                    {/* Above-the-fold CTAs */}
                    <div className="mt-8 flex flex-wrap gap-3">
                        <CTAButton
                            href={`tel:${siteConfig.contact.phoneE164}`}
                            external
                            icon={<Phone className="h-4 w-4" />}
                            onClick={() => trackPhoneClick(`area_${slug}`)}
                        >
                            Call {siteConfig.contact.phoneDisplay}
                        </CTAButton>
                        <CTAButton
                            href={getWhatsAppHref()}
                            variant="outline"
                            external
                            icon={<MessageCircle className="h-4 w-4" />}
                            onClick={() => trackWhatsAppClick(`area_${slug}`)}
                        >
                            WhatsApp Us
                        </CTAButton>
                        <CTAButton
                            href="/booking"
                            variant="outline"
                            onClick={() => trackNavClick('/booking', 'Book Now', `area_${slug}`)}
                        >
                            Book Online
                        </CTAButton>
                    </div>
                </div>
            </section>

            {/* ── SERVICES IN THIS AREA ─────────────────────── */}
            {(areaData?.localServices?.length ?? 0) > 0 && (
                <Section>
                    <h2 className="text-2xl font-bold text-text-primary">Services in {town}</h2>
                    <ul className="mt-4 space-y-2">
                        {areaData!.localServices!.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-text-secondary">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {/* ── REAL JOB DETAIL ─────────────────────────── */}
            {(areaData?.realJobDetail?.length ?? 0) > 0 && (
                <Section className="bg-surface-alt/30">
                    <h2 className="text-2xl font-bold text-text-primary">Jobs We Have Completed in {town}</h2>
                    <p className="mt-2 text-text-secondary">
                        Examples from real callouts in this area. Customer details are not included.
                    </p>
                    <div className="mt-6 space-y-4">
                        {areaData!.realJobDetail!.map((job) => (
                            <div
                                key={job.summary}
                                className="rounded-xl border border-border-default bg-surface-alt p-5"
                            >
                                <div className="flex items-start gap-3">
                                    <Wrench className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                                    <div>
                                        <p className="font-semibold text-text-primary text-sm">{job.summary}</p>
                                        <p className="mt-2 text-sm text-text-secondary">{job.detail}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* ── GARAGE NOTE (Orpington only) ─────────────── */}
            {areaData?.garageNote && (
                <Section>
                    <div className="rounded-xl border border-brand/20 bg-brand/5 p-5">
                        <div className="flex items-start gap-3">
                            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                            <p className="text-sm text-text-secondary">{areaData.garageNote}</p>
                        </div>
                    </div>
                </Section>
            )}

            {/* ── FAQs ─────────────────────────────────────── */}
            {(areaData?.faqs?.length ?? 0) > 0 && (
                <Section className="bg-surface-alt/30">
                    <h2 className="text-2xl font-bold text-text-primary">FAQs for {town}</h2>
                    <div className="mt-6">
                        <FaqAccordion items={areaData!.faqs} />
                    </div>
                </Section>
            )}

            {/* ── CROSS LINKS ──────────────────────────────── */}
            {(areaData?.crossLinks?.length ?? 0) > 0 && (
                <Section>
                    <h2 className="text-xl font-bold text-text-primary">Related Services</h2>
                    <ul className="mt-4 space-y-2">
                        {areaData!.crossLinks!.map((s) => (
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
            )}

            {/* ── WE ALSO COVER ─────────────────────────────── */}
            {areaData?.nearbyAreas && areaData.nearbyAreas.length > 0 && (
                <Section className="bg-surface-alt/30">
                    <h2 className="text-xl font-bold text-text-primary">We Also Cover</h2>
                    <p className="mt-2 text-text-secondary">
                        TriPoint Diagnostics serves the wider Kent and South East London area.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {areaData.nearbyAreas.map((s) => {
                            const nearbyData = getAreaData(s);
                            const label = nearbyData?.name ?? formatSlug(s);
                            return (
                                <Link
                                    key={s}
                                    to={`/areas-covered/${s}`}
                                    onClick={() => trackSelectContent('area_link', s)}
                                    className="rounded-lg border border-border-default bg-surface-alt px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-brand/30 hover:bg-brand/5 hover:text-brand"
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </div>
                </Section>
            )}

            {/* ── BOOKING CTA ───────────────────────────────── */}
            <Section>
                <div className="rounded-2xl border border-brand/20 bg-brand/5 p-8 text-center">
                    <h2 className="text-2xl font-bold text-text-primary">Book a Diagnostic in {town}</h2>
                    <p className="mt-2 text-text-secondary">
                        Enter your postcode, pick a service, and we will confirm your zone and price.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                        <CTAButton
                            href={`tel:${siteConfig.contact.phoneE164}`}
                            icon={<Phone className="h-5 w-5" />}
                            onClick={() => trackPhoneClick('area_body')}
                        >
                            Call {siteConfig.contact.phoneDisplay}
                        </CTAButton>
                        <CTAButton
                            href={getWhatsAppHref()}
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
