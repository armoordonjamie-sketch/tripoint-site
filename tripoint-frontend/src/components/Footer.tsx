import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Mail, MapPin, Clock } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { trackEvent } from '@/lib/analytics';

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-border-default bg-surface" role="contentinfo">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div>
                        <Link to="/" className="mb-4 flex items-center gap-2">
                            <img
                                src="/logo-light.png"
                                alt={siteConfig.brandName}
                                className="h-50 w-auto"
                            />
                        </Link>
                        <p className="mb-4 text-sm text-text-secondary">
                            Dealer-level mobile diagnostics and compliant repairs for vans and cars across Kent and South East London.
                        </p>
                        <div className="flex gap-3">
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
                            <a
                                href={siteConfig.social.google}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg bg-surface-alt p-2 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
                                aria-label="Google"
                                onClick={() => trackEvent('click_social', { platform: 'google' })}
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
                            Services
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/services/diagnostic-callout" className="text-sm text-text-secondary transition-colors hover:text-brand-light">
                                    Diagnostic Callout
                                </Link>
                            </li>
                            <li>
                                <Link to="/services/vor-triage" className="text-sm text-text-secondary transition-colors hover:text-brand-light">
                                    VOR / Priority Triage
                                </Link>
                            </li>
                            <li>
                                <Link to="/services/emissions-diagnostics" className="text-sm text-text-secondary transition-colors hover:text-brand-light">
                                    Emissions Diagnostics
                                </Link>
                            </li>
                            <li>
                                <Link to="/services/pre-purchase-health-check" className="text-sm text-text-secondary transition-colors hover:text-brand-light">
                                    Pre-Purchase Health Check
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
                            Contact
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href={`tel:${siteConfig.contact.phoneE164}`}
                                    className="flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-brand-light"
                                    onClick={() => trackEvent('click_phone_footer')}
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
                        </ul>
                    </div>

                    {/* Hours & Legal */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
                            Operating Hours
                        </h3>
                        <ul className="space-y-2 text-sm text-text-secondary">
                            <li className="flex items-start gap-2">
                                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
                                <div>
                                    <p className="font-medium text-text-primary">PM Weeks</p>
                                    <p>3:00 PM – 11:00 PM</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
                                <div>
                                    <p className="font-medium text-text-primary">AM Weeks</p>
                                    <p>6:00 AM – 1:00 PM</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
                                <div>
                                    <p className="font-medium text-text-primary">Saturdays</p>
                                    <p>8:00 AM – 4:00 PM</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
                                <p>Kent & SE London (up to 60 min radius)</p>
                            </li>
                        </ul>

                        <div className="mt-6 space-y-1">
                            <Link to="/legal/privacy-policy" className="block text-xs text-text-muted transition-colors hover:text-text-secondary">
                                Privacy Policy
                            </Link>
                            <Link to="/legal/terms" className="block text-xs text-text-muted transition-colors hover:text-text-secondary">
                                Terms of Service
                            </Link>
                            <Link to="/legal/disclaimer" className="block text-xs text-text-muted transition-colors hover:text-text-secondary">
                                Disclaimer
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-10 border-t border-border-default pt-6 text-center text-xs text-text-muted">
                    <p>
                        &copy; {year} {siteConfig.brandName}. All rights reserved. Independent service - not affiliated with vehicle manufacturers.
                    </p>
                </div>
            </div>
        </footer>
    );
}
