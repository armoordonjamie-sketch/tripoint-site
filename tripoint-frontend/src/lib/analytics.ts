import { init, track } from '@plausible-analytics/tracker';

// Define the environment variable for the domain, or fallback to the production domain.
const DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN || 'tripointdiagnostics.co.uk';

// Initialize tracking
// We'll export a setup function to be called in App.tsx
export const initAnalytics = () => {
    if (typeof window !== 'undefined') {
        init({
            domain: DOMAIN,
            autoCapturePageviews: true,
        });
    }
};

// Typed wrapper for custom events
// Define known event names for type safety
export type AnalyticsEvent =
    | 'click_book_now'
    | 'click_phone_header'
    | 'click_phone_footer'
    | 'click_email_footer'
    | 'click_social'
    | 'submit_contact_form'
    | 'submit_booking_request'
    | 'view_service'
    | 'view_booking_form'
    | 'zone_check';

export const trackEvent = (eventName: AnalyticsEvent, props?: Record<string, string | number | boolean>) => {
    if (typeof window !== 'undefined') {
        // Convert all props to strings as Plausible expects Record<string, string>
        const stringProps: Record<string, string> | undefined = props
            ? Object.entries(props).reduce((acc, [key, value]) => {
                acc[key] = String(value);
                return acc;
            }, {} as Record<string, string>)
            : undefined;

        track(eventName, { props: stringProps });
    }
};
