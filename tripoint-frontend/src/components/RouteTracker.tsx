import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView, registerGa4Test } from '@/lib/analytics';
import { captureAttributionFromUrl, registerAttributionDebugHelpers, getAttributionDebug } from '@/lib/attribution';

export function RouteTracker() {
    const location = useLocation();

    // Initialize third-party scripts strictly after React has finished its hydration pass
    // to avoid Hydration Mismatch (Error #419) caused by <script> tag injections into the DOM.
    useEffect(() => {
        initAnalytics();
        registerGa4Test();
        registerAttributionDebugHelpers();
        
        if (import.meta.env.DEV) {
            const d = getAttributionDebug();
            if (Object.keys(d.attribution).length > 0 || d.capturedAt) {
                console.log('[Attribution] stored after capture', d);
            }
        }
    }, []);

    useEffect(() => {
        captureAttributionFromUrl();
    }, [location.search]);

    useEffect(() => {
        trackPageView(location.pathname + location.search, document.title);
    }, [location.pathname, location.search]);

    return null;
}
