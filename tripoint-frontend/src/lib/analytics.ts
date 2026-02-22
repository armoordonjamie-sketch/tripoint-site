declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

// Typed wrapper for custom events (Google Ads conversion goals)
export type AnalyticsEvent =
    | 'click_book_now'
    | 'click_whatsapp'
    | 'click_phone_header'
    | 'click_phone_footer'
    | 'click_email_footer'
    | 'click_social'
    | 'click_contact'
    | 'submit_contact_form'
    | 'submit_booking_request'
    | 'confirm_booking'
    | 'view_service'
    | 'view_booking_form'
    | 'zone_check';

export const trackEvent = (eventName: AnalyticsEvent, props?: Record<string, string | number | boolean>) => {
    if (typeof window !== 'undefined' && window.gtag) {
        const eventParams: Record<string, string> = props
            ? Object.entries(props).reduce((acc, [key, value]) => {
                acc[key] = String(value);
                return acc;
            }, {} as Record<string, string>)
            : {};

        window.gtag('event', eventName, eventParams);
    }
};
