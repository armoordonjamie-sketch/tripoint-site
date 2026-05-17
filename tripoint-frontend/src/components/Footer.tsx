import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Mail, MapPin, Clock } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { CATEGORY_META, SERVICES_BY_CATEGORY, SERVICE_CATEGORY_ORDER } from '@/config/servicesCatalog';
import { trackPhoneClick, trackSocialClick, trackWhatsAppClick } from '@/lib/analytics';
import { SocialLinks } from '@/components/SocialLinks';
import { getWhatsAppHref } from '@/lib/whatsappHref';
import { OptimizedLogo } from '@/components/OptimizedLogo';
import { cn } from '@/lib/utils';

const categoryHeadingClass: Record<string, string> = {
    diagnostics: 'text-sky-400/90',
    servicing: 'text-amber-400/90',
    tuning: 'text-violet-400/90',
};

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer
            className="relative border-t border-border-default bg-surface pb-[max(6rem,calc(88px+env(safe-area-inset-bottom,0px)))] lg:pb-0"
            role="contentinfo"
        >
            <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 mesh-gradient opacity-20" aria-hidden />

                <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
                        {/* Brand */}
                        <div className="sm:col-span-2 lg:col-span-1">
                            <Link to="/" className="mb-4 flex items-center gap-2">
                                <OptimizedLogo
                                    name="logo-light"
                                    alt={siteConfig.brandName}
                                    className="h-14 w-auto"
                                />
                            </Link>
                            <p className="mb-4 text-sm text-text-secondary">
                                Dealer-level mobile diagnostics and compliant repairs for vans and cars across Kent and South East London.
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                                <SocialLinks clickLocation="footer" />
                                {siteConfig.social.google && (
                                    <a
                                        href={siteConfig.social.google}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-lg bg-surface-alt p-2 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
                                        aria-label="Google Reviews"
                                        onClick={() => trackSocialClick('google')}
                                    >
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Services - grouped by category */}
                        <div className="sm:col-span-1">
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
                                Services
                            </h3>
                            <Link
                                to="/services"
                                className="mb-4 inline-block text-sm font-medium text-brand transition-colors hover:text-brand-light"
                            >
                                View all services
                            </Link>
                            <div className="space-y-5">
                                {SERVICE_CATEGORY_ORDER.map((catId) => {
                                    const meta = CATEGORY_META[catId];
                                    const items = SERVICES_BY_CATEGORY[catId];
                                    return (
                                        <div key={catId}>
                                            <p
                                                className={cn(
                                                    'mb-2 text-[11px] font-bold uppercase tracking-wider',
                                                    categoryHeadingClass[catId] ?? 'text-text-muted',
                                                )}
                                            >
                                                {meta.label}
                                            </p>
                                            <ul className="space-y-1.5">
                                                {items.map((s) => (
                                                    <li key={s.href}>
                                                        <Link
                                                            to={s.href}
                                                            className="text-sm text-text-secondary transition-colors hover:text-brand-light"
                                                        >
                                                            {s.title}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Company */}
                        <div>
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
                                Company
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/about" className="text-sm text-text-secondary transition-colors hover:text-brand-light">
                                        About
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/pricing" className="text-sm text-text-secondary transition-colors hover:text-brand-light">
                                        Pricing
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/our-work" className="text-sm text-text-secondary transition-colors hover:text-brand-light">
                                        Our Work
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/blog" className="text-sm text-text-secondary transition-colors hover:text-brand-light">
                                        Blog
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/contact" className="text-sm text-text-secondary transition-colors hover:text-brand-light">
                                        Contact
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/faq" className="text-sm text-text-secondary transition-colors hover:text-brand-light">
                                        FAQs
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/process" className="text-sm text-text-secondary transition-colors hover:text-brand-light">
                                        Our Process
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/areas-covered" className="text-sm text-text-secondary transition-colors hover:text-brand-light">
                                        Areas Covered
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
                                Legal
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/legal/privacy-policy" className="text-sm text-text-secondary transition-colors hover:text-brand-light">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/legal/terms" className="text-sm text-text-secondary transition-colors hover:text-brand-light">
                                        Terms of Service
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/legal/disclaimer" className="text-sm text-text-secondary transition-colors hover:text-brand-light">
                                        Disclaimer
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/legal/accessibility" className="text-sm text-text-secondary transition-colors hover:text-brand-light">
                                        Accessibility
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="sm:col-span-2 lg:col-span-1">
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
                                Contact
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <a
                                        href={`tel:${siteConfig.contact.phoneE164}`}
                                        className="flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-brand-light"
                                        onClick={() => trackPhoneClick('footer')}
                                    >
                                        <Phone className="h-4 w-4 shrink-0" />
                                        {siteConfig.contact.phoneDisplay}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href={getWhatsAppHref()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-brand-light"
                                        onClick={() => trackWhatsAppClick('footer')}
                                    >
                                        <MessageCircle className="h-4 w-4 shrink-0" />
                                        WhatsApp
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href={`mailto:${siteConfig.contact.email}`}
                                        className="flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-brand-light"
                                    >
                                        <Mail className="h-4 w-4 shrink-0" />
                                        {siteConfig.contact.email}
                                    </a>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-text-secondary">
                                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
                                    <span>{siteConfig.operatingHours}</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-text-secondary">
                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
                                    <span>Kent & SE London (up to 60 min radius)</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 border-t border-border-default/80 pt-8 text-center text-xs text-text-muted">
                        <p>
                            &copy; {year} {siteConfig.brandName}. Independent service - not affiliated with vehicle manufacturers.
                        </p>
                        <p className="mt-1">
                            Company No. 17038307&nbsp;&nbsp;|&nbsp;&nbsp;VAT No. 515 7327 92
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
