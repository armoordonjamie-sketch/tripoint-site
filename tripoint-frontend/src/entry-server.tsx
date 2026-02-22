import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppRoutes } from './App';

// Required for SSR - prevents Helmet from assuming browser
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(HelmetProvider as any).canUseDOM = false;

export function render(url: string) {
    const helmetContext: { helmet?: import('react-helmet-async').HelmetServerState } = {};

    const appHtml = renderToString(
        <HelmetProvider context={helmetContext}>
            <StaticRouter location={url}>
                <AppRoutes />
            </StaticRouter>
        </HelmetProvider>
    );

    return { appHtml, helmet: helmetContext.helmet };
}
