import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppRoutes } from './App';
import { ToastProvider } from '@/components/toast-context';
import { RouteTracker } from '@/components/RouteTracker';

// Required for SSR - prevents Helmet from assuming browser
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(HelmetProvider as any).canUseDOM = false;

export async function render(url: string) {
    const helmetContext: { helmet?: import('react-helmet-async').HelmetServerState } = {};

    const appHtml = renderToString(
        <StrictMode>
            <HelmetProvider context={helmetContext}>
                <StaticRouter location={url}>
                    <ToastProvider>
                        <RouteTracker />
                        <AppRoutes />
                    </ToastProvider>
                </StaticRouter>
            </HelmetProvider>
        </StrictMode>
    );

    return { appHtml, helmet: helmetContext.helmet };
}
