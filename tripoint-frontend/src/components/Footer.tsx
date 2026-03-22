import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Mail, MapPin, Clock } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { CATEGORY_META, SERVICES_BY_CATEGORY, SERVICE_CATEGORY_ORDER } from '@/config/servicesCatalog';
import { trackBookNowClick, trackEmailLead, trackEvent, trackPhoneLead, trackWhatsAppLead } from '@/lib/analytics';
import { OptimizedLogo } from '@/components/OptimizedLogo';
import { CTAButton } from '@/components/CTAButton';
import { cn } from '@/lib/utils';

const categoryHeadingClass: Record<string, string> = {
    diagnostics: 'text-sky-400/90',
    servicing: 'text-amber-400/90',
    tuning: 'text-violet-400/90',
};

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="relative border-t border-border-default bg-surface pb-20 lg:pb-0" role="contentinfo">
            {/* CTA strip */}
            <div className="border-b border-border-default bg-surface-alt/70">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-5 sm:flex-row sm:px-6 sm:py-6 lg:px-8">
                    <span className="text-center text-sm font-medium text-text-secondary sm:text-left">Ready to book?</span>
                    <div className="flex w-full max-w-md flex-wrap items-center justify-center gap-3 sm:w-auto sm:max-w-none">
                        <CTAButton href="/booking" size="sm" onClick={() => trackBookNowClick('footer')}>
                            Book online
                        </CTAButton>
                        <a
                            href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg border border-border-default px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-brand/40 hover:bg-brand/5"
                            onClick={() => trackWhatsAppLead('footer')}
                        >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                        </a>
                        <a
                            href={`tel:${siteConfig.contact.phoneE164}`}
                            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-border-default px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-brand/40 hover:bg-brand/5"
                            onClick={() => trackPhoneLead('footer')}
                        >
                            <Phone className="h-4 w-4" />
                            {siteConfig.contact.phoneDisplay}
                        </a>
                    </div>
                </div>
            </div>

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
                            <div className="flex flex-wrap gap-3">
                                {siteConfig.social.facebook && (
                                    <a
                                        href={siteConfig.social.facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-lg bg-surface-alt p-2 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
                                        aria-label="Facebook"
                                        onClick={() => trackEvent('click_social', { platform: 'facebook' })}
                                    >
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                                        </svg>
                                    </a>
                                )}
                                {siteConfig.social.instagram && (
                                    <a
                                        href={siteConfig.social.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-lg bg-surface-alt p-2 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
                                        aria-label="Instagram"
                                        onClick={() => trackEvent('click_social', { platform: 'instagram' })}
                                    >
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                                        </svg>
                                    </a>
                                )}
                                {siteConfig.social.google && (
                                    <a
                                        href={siteConfig.social.google}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-lg bg-surface-alt p-2 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
                                        aria-label="Google Reviews"
                                        onClick={() => trackEvent('click_social', { platform: 'google' })}
                                    >
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Services — grouped by category */}
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
                                        onClick={() => trackPhoneLead('footer')}
                                    >
                                        <Phone className="h-4 w-4 shrink-0" />
                                        {siteConfig.contact.phoneDisplay}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-brand-light"
                                        onClick={() => trackWhatsAppLead('footer')}
                                    >
                                        <MessageCircle className="h-4 w-4 shrink-0" />
                                        WhatsApp
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href={`mailto:${siteConfig.contact.email}`}
                                        className="flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-brand-light"
                                        onClick={() => trackEmailLead('footer')}
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
                            &copy; {year} {siteConfig.brandName}. Independent service -- not affiliated with vehicle manufacturers.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
