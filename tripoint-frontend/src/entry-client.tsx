import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './App';
import { ToastProvider } from '@/components/toast-context';
import { RouteTracker } from '@/components/RouteTracker';
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
