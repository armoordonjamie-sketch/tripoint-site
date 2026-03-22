import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileStickyCTA } from './MobileStickyCTA';
import { LocalBusinessSchema, OrganizationWebsiteSchema } from './JsonLd';

export function Layout() {
    const { pathname } = useLocation();

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="flex min-h-screen flex-col">
            <LocalBusinessSchema />
            <OrganizationWebsiteSchema />
            <Header />
            <main
                className={
                    pathname === '/contact'
                        ? 'min-h-0 w-full pb-8 pt-0 lg:pb-0'
                        : 'min-h-0 flex-1 pb-20 lg:pb-0'
                }
            >
                <Outlet />
            </main>
            <Footer />
            {pathname !== '/contact' && <MobileStickyCTA />}
        </div>
    );
}
