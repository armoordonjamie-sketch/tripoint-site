import { siteConfig } from '@/config/site';
import { decorateUrl } from '@/lib/attribution';

/** WhatsApp deep link with stored attribution query params appended when present. */
export function getWhatsAppHref(): string {
    return decorateUrl(`https://wa.me/${siteConfig.contact.whatsappE164}`);
}
