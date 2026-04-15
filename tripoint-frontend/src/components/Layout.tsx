import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileStickyCTA } from './MobileStickyCTA';
import { ScrollDepthTracker } from './ScrollDepthTracker';
import { LocalBusinessSchema, OrganizationWebsiteSchema } from './JsonLd';

export function Layout() {
    const { pathname } = useLocation();

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

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
                        ? 'min-h-0 flex-1 w-full pb-[max(5.5rem,calc(88px+env(safe-area-inset-bottom,0px)))] pt-0 lg:pb-0'
                        : 'min-h-0 w-full pb-8 pt-0 lg:pb-0'
                }
            >
                <Outlet />
            </main>
            <Footer />
            {showMobileSticky && <MobileStickyCTA />}
        </div>
    );
}
