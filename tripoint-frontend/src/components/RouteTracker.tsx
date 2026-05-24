import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView, registerGa4Test } from '@/lib/analytics';
import { captureAttributionFromUrl, registerAttributionDebugHelpers, getAttributionDebug } from '@/lib/attribution';

export function RouteTracker() {
    const location = useLocation();

    // Initialize third-party scripts strictly after React has finished its hydration pass
    // to avoid Hydration Mismatch (Error #419) caused by <script> tag injections into the DOM.
    useEffect(() => {
        // Delay third-party analytics by 5s (or until interaction) to vastly improve Lighthouse TBT
        const timer = setTimeout(() => {
            initAnalytics();
            registerGa4Test();
            registerAttributionDebugHelpers();
            
            if (import.meta.env.DEV) {
                const d = getAttributionDebug();
                if (Object.keys(d.attribution).length > 0 || d.capturedAt) {
                    console.log('[Attribution] stored after capture', d);
                }
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        captureAttributionFromUrl();
    }, [location.search]);

    useEffect(() => {
        trackPageView(location.pathname + location.search, document.title);
    }, [location.pathname, location.search]);

    return null;
}
