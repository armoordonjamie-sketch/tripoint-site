import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileStickyCTA } from './MobileStickyCTA';
import { LocalBusinessSchema } from './JsonLd';

export function Layout() {
    const { pathname } = useLocation();

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="flex min-h-screen flex-col">
            <LocalBusinessSchema />
            <Header />
            <main className="flex-1 pb-20 lg:pb-0">
                <Outlet />
            </main>
            <Footer />
            <MobileStickyCTA />
        </div>
    );
}
