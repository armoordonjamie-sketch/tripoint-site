import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './App';
import { ToastProvider } from '@/components/toast-context';
import { RouteTracker } from '@/components/RouteTracker';
import { initAnalytics, registerGa4Test } from '@/lib/analytics';
import { captureAttributionFromUrl, getAttributionDebug, registerAttributionDebugHelpers } from '@/lib/attribution';
import './index.css';

const root = document.getElementById('root')!;
const app = (
    <StrictMode>
        <HelmetProvider>
            <BrowserRouter>
                <ToastProvider>
                    <RouteTracker />
                    <AppRoutes />
                </ToastProvider>
            </BrowserRouter>
        </HelmetProvider>
    </StrictMode>
);

// In dev, no pre-rendered HTML - use createRoot. In production, hydrate.
if (import.meta.env.DEV) {
    createRoot(root).render(app);
} else {
    hydrateRoot(root, app);
}

// Delay analytics initialization until after hydration completes to prevent
// 3rd party scripts (like Google Ads) from injecting <script> tags into the DOM
// while React is hydrating, which causes React Error #418/419 hydration mismatches.
setTimeout(() => {
    initAnalytics();
    registerGa4Test();
    captureAttributionFromUrl();
    registerAttributionDebugHelpers();
    
    if (import.meta.env.DEV) {
        const d = getAttributionDebug();
        if (Object.keys(d.attribution).length > 0 || d.capturedAt) {
            console.log('[Attribution] stored after capture', d);
        }
    }
}, 0);
