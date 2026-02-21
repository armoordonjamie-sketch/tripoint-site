import { Link } from 'react-router-dom';
import { Phone, MessageCircle } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { trackEvent } from '@/lib/analytics';

export function MobileStickyCTA() {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex gap-2 border-t border-border-default bg-surface/95 p-3 backdrop-blur-md lg:hidden">
            <a
                href={`tel:${siteConfig.contact.phoneE164}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-light"
                onClick={() => trackEvent('click_phone_header', { location: 'sticky_cta' })}
            >
                <Phone className="h-5 w-5" />
                Call
            </a>
            <a
                href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-success bg-success/10 py-3 text-sm font-semibold text-success transition-colors hover:bg-success/20"
                onClick={() => trackEvent('click_whatsapp', { location: 'sticky_cta' })}
            >
                <MessageCircle className="h-5 w-5" />
                WhatsApp
            </a>
            <Link
                to="/booking"
                className="flex flex-1 items-center justify-center rounded-lg bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-light"
                onClick={() => trackEvent('click_book_now', { location: 'sticky_cta' })}
            >
                Book Now
            </Link>
        </div>
    );
}
