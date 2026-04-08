import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics';
import { captureAttributionFromUrl } from '@/lib/attribution';

export function RouteTracker() {
    const location = useLocation();

    useEffect(() => {
        captureAttributionFromUrl();
    }, [location.search]);

    useEffect(() => {
        trackPageView(location.pathname + location.search, document.title);
    }, [location.pathname, location.search]);

    return null;
}
