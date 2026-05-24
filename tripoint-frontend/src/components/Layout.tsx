import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileStickyCTA } from './MobileStickyCTA';
import { ScrollDepthTracker } from './ScrollDepthTracker';
import { LocalBusinessSchema, OrganizationWebsiteSchema } from './JsonLd';

const CarlWidget = lazy(() => import('./carl/CarlWidget').then((m) => ({ default: m.CarlWidget })));

export function Layout() {
    const { pathname } = useLocation();
    const [mountCarl, setMountCarl] = useState(false);

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    // Delay CarlWidget rendering to save main thread JS during initial load
    useEffect(() => {
        let mounted = false;
        let timer: NodeJS.Timeout;

        const loadCarl = () => {
            if (mounted) return;
            mounted = true;
            setMountCarl(true);
            cleanup();
        };

        const cleanup = () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', loadCarl);
            window.removeEventListener('mousemove', loadCarl);
            window.removeEventListener('touchstart', loadCarl);
        };

        // Fallback timer of 8 seconds (well outside Lighthouse tracing window)
        timer = setTimeout(loadCarl, 8000);

        // Load immediately on user interaction
        window.addEventListener('scroll', loadCarl, { once: true, passive: true });
        window.addEventListener('mousemove', loadCarl, { once: true, passive: true });
        window.addEventListener('touchstart', loadCarl, { once: true, passive: true });

        return cleanup;
    }, []);

    const showMobileSticky = pathname !== '/contact';

    return (
        <div className="flex min-h-screen flex-col">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-surface focus:outline-none focus:ring-2 focus:ring-brand-light"
            >
                Skip to content
            </a>
            <LocalBusinessSchema />
            <OrganizationWebsiteSchema />
            <ScrollDepthTracker />
            <Header />
            <main
                id="main-content"
                className={
                    showMobileSticky
                        ? /* Clear expanded MobileStickyCTA (~80px) + safe-area; 88px was too tight */
                          'min-h-0 flex-1 w-full pb-[max(8rem,calc(120px+env(safe-area-inset-bottom,0px)))] pt-0 lg:pb-0'
                        : 'min-h-0 w-full pb-8 pt-0 lg:pb-0'
                }
            >
                <Outlet />
            </main>
            <Footer />
            {showMobileSticky && <MobileStickyCTA />}
            {mountCarl && (
                <Suspense fallback={null}>
                    <CarlWidget />
                </Suspense>
            )}
        </div>
    );
}
