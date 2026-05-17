import { MessageCircle, Phone } from 'lucide-react';
import { CTAButton } from '@/components/CTAButton';
import { siteConfig } from '@/config/site';
import { trackNavClick, trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics';
import { getWhatsAppHref } from '@/lib/whatsappHref';
import { cn } from '@/lib/utils';

interface ServiceCtaStripProps {
    bookLabel?: string;
    analyticsPrefix: string;
    className?: string;
    /** sm+ layout: inline row. Default stacks on mobile */
    layout?: 'stack' | 'row';
}

export function ServiceCtaStrip({
    bookLabel = 'Book online',
    analyticsPrefix,
    className,
    layout = 'stack',
}: ServiceCtaStripProps) {
    return (
        <div
            className={cn(
                layout === 'row'
                    ? 'flex flex-wrap gap-3'
                    : 'flex flex-col gap-2 sm:flex-row sm:flex-wrap',
                className,
            )}
        >
            <CTAButton
                href="/booking"
                size="lg"
                className={cn(layout === 'stack' && 'w-full sm:w-auto')}
                onClick={() => trackNavClick('/booking', bookLabel, `${analyticsPrefix}_cta`)}
            >
                {bookLabel}
            </CTAButton>
            <CTAButton
                href={getWhatsAppHref()}
                variant="outline"
                size={layout === 'stack' ? 'md' : 'md'}
                external
                icon={<MessageCircle className="h-4 w-4 shrink-0" />}
                className={cn(layout === 'stack' && 'w-full sm:w-auto')}
                onClick={() => trackWhatsAppClick(analyticsPrefix)}
            >
                WhatsApp
            </CTAButton>
            <CTAButton
                href={`tel:${siteConfig.contact.phoneE164}`}
                variant="secondary"
                size={layout === 'stack' ? 'md' : 'md'}
                external
                icon={<Phone className="h-4 w-4 shrink-0" />}
                className={cn(layout === 'stack' && 'w-full sm:hidden')}
                onClick={() => trackPhoneClick(analyticsPrefix)}
            >
                Call
            </CTAButton>
        </div>
    );
}
