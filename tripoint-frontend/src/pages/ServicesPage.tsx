import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Shield, Clock, MapPin } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { ServicePicker } from '@/components/ServicePicker';
import { CTAButton } from '@/components/CTAButton';
import { siteConfig } from '@/config/site';
import { trackNavClick, trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics';

export function ServicesPage() {
    return (
        <div className="min-h-0">
            <Seo
                title="Services"
                description="Pick diagnostics, servicing, or tuning. Mobile fixed-price visits across Kent & SE London - then book online or view full details on each service page."
                canonical="/services"
            />

            <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                <ServicePicker
                    title="Our Services"
                    subtitle="Dealer-level mobile work at your door. Pick a category, compare prices, then view details or book."
                    badges={[
                        { icon: Shield, label: 'Fixed zone pricing' },
                        { icon: MapPin, label: 'Kent & SE London' },
                        { icon: Clock, label: 'Mon-Sat 6-22' },
                    ]}
                />
                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-text-muted">
                    <Link to="/booking" className="font-medium text-brand hover:text-brand-light transition-colors">
                        Book online
                    </Link>
                    <span className="text-border-default">·</span>
                    <Link to="/pricing" className="hover:text-text-secondary transition-colors">
                        Zone pricing
                    </Link>
                    <span className="text-border-default">·</span>
                    <Link to="/faq" className="hover:text-text-secondary transition-colors">
                        FAQ
                    </Link>
                </div>
            </div>

            <div className="border-t border-border-default bg-surface-alt/50">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                    <span className="text-sm font-medium text-text-secondary">Ready to book?</span>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <CTAButton href="/booking" size="sm" onClick={() => trackNavClick('/booking', 'Book online', 'service_card')}>
                            Book online
                        </CTAButton>
                        <a
                            href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-border-default px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:border-brand/40 hover:bg-brand/5"
                            onClick={() => trackWhatsAppClick('service_card')}
                        >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                        </a>
                        <a
                            href={`tel:${siteConfig.contact.phoneE164}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-border-default px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:border-brand/40 hover:bg-brand/5"
                            onClick={() => trackPhoneClick('service_card')}
                        >
                            <Phone className="h-4 w-4" />
                            {siteConfig.contact.phoneDisplay}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
