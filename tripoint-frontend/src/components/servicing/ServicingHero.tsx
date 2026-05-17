import { ArrowRight, MessageCircle, Phone } from 'lucide-react';
import { CTAButton } from '@/components/CTAButton';
import { VatLabel } from '@/components/VatLabel';
import { siteConfig } from '@/config/site';
import { trackNavClick, trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics';
import { getWhatsAppHref } from '@/lib/whatsappHref';

export interface ServicingHeroProps {
    heroSrc: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    priceFrom: number;
    bookLabel?: string;
    analyticsPrefix: string;
    objectPosition?: string;
    mobileObjectPosition?: string;
    pricingHref?: string;
    /** Single book button + text links — fewer competing CTAs on mobile */
    ctaVariant?: 'full' | 'book-only';
}

function HeroCtas({
    bookLabel,
    analyticsPrefix,
    pricingHref,
    ctaVariant,
}: Pick<ServicingHeroProps, 'bookLabel' | 'analyticsPrefix' | 'pricingHref' | 'ctaVariant'>) {
    if (ctaVariant === 'book-only') {
        return (
            <>
                <CTAButton
                    href="/booking"
                    size="lg"
                    className="mt-2.5 w-full sm:mt-3 sm:w-auto sm:min-w-[11rem]"
                    onClick={() => trackNavClick('/booking', bookLabel!, `${analyticsPrefix}_hero`)}
                >
                    {bookLabel}
                </CTAButton>
                <p className="mt-2.5 text-center text-xs text-text-muted sm:text-left">
                    <a
                        href={getWhatsAppHref()}
                        className="font-medium text-brand-light hover:underline"
                        onClick={() => trackWhatsAppClick(analyticsPrefix)}
                    >
                        WhatsApp
                    </a>
                    <span className="text-text-muted"> · </span>
                    <a
                        href={`tel:${siteConfig.contact.phoneE164}`}
                        className="font-medium text-text-secondary hover:text-brand-light hover:underline"
                        onClick={() => trackPhoneClick(analyticsPrefix)}
                    >
                        {siteConfig.contact.phoneDisplay}
                    </a>
                    {pricingHref ? (
                        <>
                            <span className="text-text-muted"> · </span>
                            <a
                                href={pricingHref}
                                className="font-medium text-text-secondary hover:text-brand-light hover:underline"
                                onClick={() =>
                                    trackNavClick(pricingHref, 'Zone pricing', `${analyticsPrefix}_hero_pricing`)
                                }
                            >
                                Zone pricing
                            </a>
                        </>
                    ) : null}
                </p>
            </>
        );
    }

    return (
        <div className="mt-2.5 flex flex-col gap-2 sm:mt-3 sm:flex-row sm:flex-wrap">
            <CTAButton
                href="/booking"
                size="lg"
                className="w-full sm:w-auto sm:min-w-[11rem]"
                onClick={() => trackNavClick('/booking', bookLabel!, `${analyticsPrefix}_hero`)}
            >
                {bookLabel}
            </CTAButton>
            <div className="grid grid-cols-2 gap-2 sm:contents">
                <CTAButton
                    href={getWhatsAppHref()}
                    variant="outline"
                    size="md"
                    external
                    icon={<MessageCircle className="h-4 w-4 shrink-0" />}
                    className="w-full sm:w-auto"
                    onClick={() => trackWhatsAppClick(analyticsPrefix)}
                >
                    WhatsApp
                </CTAButton>
                {pricingHref ? (
                    <CTAButton
                        href={pricingHref}
                        variant="outline"
                        size="md"
                        icon={<ArrowRight className="h-4 w-4 shrink-0" />}
                        className="w-full sm:hidden"
                        onClick={() => trackNavClick(pricingHref, 'Full Pricing', `${analyticsPrefix}_hero_pricing`)}
                    >
                        Pricing
                    </CTAButton>
                ) : (
                    <CTAButton
                        href={`tel:${siteConfig.contact.phoneE164}`}
                        variant="secondary"
                        size="md"
                        external
                        icon={<Phone className="h-4 w-4 shrink-0" />}
                        className="w-full sm:hidden"
                        onClick={() => trackPhoneClick(analyticsPrefix)}
                    >
                        Call
                    </CTAButton>
                )}
            </div>
            <CTAButton
                href={`tel:${siteConfig.contact.phoneE164}`}
                variant="secondary"
                size="lg"
                external
                icon={<Phone className="h-5 w-5 shrink-0" />}
                className="hidden w-full sm:flex sm:w-auto"
                onClick={() => trackPhoneClick(analyticsPrefix)}
            >
                {siteConfig.contact.phoneDisplay}
            </CTAButton>
            {pricingHref ? (
                <CTAButton
                    href={pricingHref}
                    variant="outline"
                    size="lg"
                    icon={<ArrowRight className="h-5 w-5 shrink-0" />}
                    className="hidden w-full sm:flex sm:w-auto"
                    onClick={() => trackNavClick(pricingHref, 'Full Pricing', `${analyticsPrefix}_hero_pricing`)}
                >
                    Full Pricing
                </CTAButton>
            ) : null}
        </div>
    );
}

export function ServicingHero({
    heroSrc,
    eyebrow,
    title,
    subtitle,
    priceFrom,
    bookLabel = 'Book a Service',
    analyticsPrefix,
    objectPosition = 'center 40%',
    mobileObjectPosition = 'center 55%',
    pricingHref,
    ctaVariant = 'full',
}: ServicingHeroProps) {
    return (
        <section className="relative overflow-hidden bg-surface sm:min-h-[26rem] sm:bg-transparent lg:min-h-[28rem]">
            <div className="relative h-[38vw] min-h-[168px] max-h-[220px] overflow-hidden sm:hidden" aria-hidden="true">
                <img
                    src={heroSrc}
                    alt=""
                    fetchPriority="high"
                    loading="eager"
                    decoding="async"
                    className="absolute left-1/2 top-1/2 h-[150%] w-[150%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover"
                    style={{ objectPosition: mobileObjectPosition }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface" />
            </div>

            <div className="absolute inset-0 hidden overflow-hidden sm:block" aria-hidden="true">
                <img
                    src={heroSrc}
                    alt=""
                    fetchPriority="high"
                    loading="eager"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface from-25% via-surface/70 to-surface/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-surface/50 via-surface/20 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(var(--color-brand-rgb),0.15),transparent_60%)]" />
            </div>

            <div className="relative z-10 sm:absolute sm:inset-0 sm:flex sm:flex-col sm:justify-end">
                <div className="mx-auto w-full max-w-5xl px-4 pb-4 pt-3 sm:px-6 sm:pb-8 sm:pt-10 lg:px-8">
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand sm:text-sm">{eyebrow}</p>
                    <h1 className="mt-1 text-[clamp(1.65rem,6.5vw,2.5rem)] font-extrabold leading-[1.08] text-text-primary sm:mt-2 sm:text-5xl lg:text-6xl">
                        {title}
                    </h1>
                    <p className="mt-1.5 max-w-xl text-sm leading-snug text-text-secondary sm:mt-3 sm:text-lg">{subtitle}</p>

                    <div className="mt-3 rounded-xl border border-border-default/80 bg-surface/95 p-3 shadow-lg backdrop-blur-sm sm:mt-5 sm:max-w-xl sm:bg-surface/90 sm:p-4">
                        <p className="text-sm font-semibold text-text-primary">
                            From <span className="text-brand-light">&pound;{priceFrom}<VatLabel /></span>
                            <span className="font-normal text-text-muted"> · Fixed price · We come to you</span>
                        </p>
                        <HeroCtas
                            bookLabel={bookLabel}
                            analyticsPrefix={analyticsPrefix}
                            pricingHref={pricingHref}
                            ctaVariant={ctaVariant}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
