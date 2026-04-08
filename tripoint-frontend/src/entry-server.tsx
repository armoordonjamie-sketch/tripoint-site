import { StrictMode } from 'react';
import { renderToReadableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppRoutes } from './App';
import { ToastProvider } from '@/components/toast-context';
import { RouteTracker } from '@/components/RouteTracker';

// Required for SSR - prevents Helmet from assuming browser
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(HelmetProvider as any).canUseDOM = false;

async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
    }
    const total = chunks.reduce((acc, c) => acc + c.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
        out.set(c, offset);
        offset += c.length;
    }
    return new TextDecoder().decode(out);
}

export async function render(url: string) {
    const helmetContext: { helmet?: import('react-helmet-async').HelmetServerState } = {};

    const stream = await renderToReadableStream(
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
        { onError: (err) => console.error('SSR error:', err) }
    );

    const appHtml = await streamToString(stream);
    return { appHtml, helmet: helmetContext.helmet };
}
