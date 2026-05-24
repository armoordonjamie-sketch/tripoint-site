import { StrictMode } from 'react';

import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppRoutes } from './App';
import { ToastProvider } from '@/components/toast-context';
import { RouteTracker } from '@/components/RouteTracker';

// Required for SSR - prevents Helmet from assuming browser
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(HelmetProvider as any).canUseDOM = false;

// @ts-ignore
import { PassThrough } from 'stream';
import { renderToPipeableStream } from 'react-dom/server';

export function render(url: string): Promise<{ appHtml: string; helmet: import('react-helmet-async').HelmetServerState | undefined }> {
    return new Promise((resolve, reject) => {
        const helmetContext: { helmet?: import('react-helmet-async').HelmetServerState } = {};
        let appHtml = '';

        const { pipe } = renderToPipeableStream(
            <StrictMode>
                <HelmetProvider context={helmetContext}>
                    <StaticRouter location={url}>
                        <ToastProvider>
                            <RouteTracker />
                            <AppRoutes />
                        </ToastProvider>
                    </StaticRouter>
                </HelmetProvider>
            </StrictMode>,
            {
                onAllReady() {
                    const stream = new PassThrough();
                    stream.on('data', (chunk: any) => {
                        appHtml += chunk.toString();
                    });
                    stream.on('end', () => {
                        resolve({ appHtml, helmet: helmetContext.helmet });
                    });
                    pipe(stream);
                },
                onError(err) {
                    console.error('SSR Stream Error:', err);
                    reject(err);
                }
            }
        );
    });
}
