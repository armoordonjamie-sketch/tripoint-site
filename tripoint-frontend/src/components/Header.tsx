import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronRight, Phone, MessageCircle } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { CATEGORY_META, SERVICES_BY_CATEGORY, SERVICE_CATEGORY_ORDER } from '@/config/servicesCatalog';
import { cn } from '@/lib/utils';
import { trackNavClick, trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics';
import { OptimizedLogo } from '@/components/OptimizedLogo';

const secondaryNav = [
    { label: 'Areas Covered', href: '/areas-covered' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
] as const;

function navLinkClass(active: boolean) {
    return cn(
        'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active ? 'bg-brand/10 text-brand-light' : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary',
    );
}

export function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);

    useEffect(() => {
        if (!servicesOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setServicesOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [servicesOpen]);

    const closeServices = () => setServicesOpen(false);
    const closeMobile = () => setMobileOpen(false);

    return (
        <header className="sticky top-0 z-50 border-b border-border-default bg-surface/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                <Link to="/" className="flex items-center gap-3" aria-label="TriPoint Diagnostics Home">
                    <OptimizedLogo name="logo-no-text-light" alt={siteConfig.brandName} className="h-14 w-auto" />
                    <span className="hidden text-xl font-bold text-text-primary sm:block">{siteConfig.brandName}</span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
                    <div className="relative" onMouseLeave={() => setServicesOpen(false)}>
                        <button
                            type="button"
                            onClick={() => setServicesOpen((v) => !v)}
                            onMouseEnter={() => setServicesOpen(true)}
                            className={cn(
                                'flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                servicesOpen
                                    ? 'bg-surface-alt text-text-primary'
                                    : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary',
                            )}
                            aria-expanded={servicesOpen}
                            aria-haspopup="true"
                        >
                            Services
                            <ChevronDown className={cn('h-4 w-4 transition-transform', servicesOpen && 'rotate-180')} />
                        </button>

                        {servicesOpen && (
                            <div
                                className="absolute left-0 top-full z-50 w-[min(calc(100vw-2rem),56rem)] pt-2"
                                role="menu"
                                aria-label="Services menu"
                            >
                                <div className="overflow-hidden rounded-xl border border-border-default bg-surface-alt shadow-xl">
                                    <div className="grid grid-cols-1 divide-y divide-border-default sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                                        {SERVICE_CATEGORY_ORDER.map((catId) => {
                                            const meta = CATEGORY_META[catId];
                                            const CatIcon = meta.Icon;
                                            const items = SERVICES_BY_CATEGORY[catId];
                                            return (
                                                <div
                                                    key={catId}
                                                    className={cn('min-w-0 border-t-4 bg-surface-alt/95 p-3', meta.navColumn)}
                                                >
                                                    <div className="mb-2 flex items-center gap-2 border-b border-border-default/60 pb-2">
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated text-brand-light">
                                                            <CatIcon className="h-4 w-4" />
                                                        </span>
                                                        <div>
                                                            <p className="text-xs font-bold uppercase tracking-wide text-text-primary">{meta.label}</p>
                                                            <p className="text-[11px] text-text-muted">{meta.desc}</p>
                                                        </div>
                                                    </div>
                                                    <ul className="space-y-0.5" role="none">
                                                        {items.map((item) => (
                                                            <li key={item.href} role="none">
                                                                <NavLink
                                                                    to={item.href}
                                                                    role="menuitem"
                                                                    className={({ isActive }) =>
                                                                        cn(
                                                                            'block rounded-lg px-2 py-1.5 text-left text-sm leading-snug transition-colors',
                                                                            isActive
                                                                                ? 'bg-brand/10 text-brand-light'
                                                                                : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary',
                                                                        )
                                                                    }
                                                                    onClick={() => {
                                                                        trackNavClick(item.href, item.title, 'header_services');
                                                                        closeServices();
                                                                    }}
                                                                >
                                                                    {item.title}
                                                                </NavLink>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="border-t border-border-default bg-surface/80 px-3 py-2">
                                        <NavLink
                                            to="/services"
                                            className="flex items-center justify-center gap-1 text-sm font-semibold text-brand-light transition-colors hover:text-brand"
                                            onClick={() => {
                                                trackNavClick('/services', 'View all services', 'header_services');
                                                closeServices();
                                            }}
                                        >
                                            View all services
                                            <ChevronRight className="h-4 w-4" />
                                        </NavLink>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {secondaryNav.map((link) => (
                        <NavLink
                            key={link.href}
                            to={link.href}
                            className={({ isActive }) => navLinkClass(isActive)}
                            onClick={() => trackNavClick(link.href, link.label, 'header')}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Desktop CTA */}
                <div className="hidden items-center gap-2 lg:flex">
                    <a
                        href={`tel:${siteConfig.contact.phoneE164}`}
                        className="flex items-center gap-2 rounded-lg px-2 py-2 text-text-secondary transition-colors hover:bg-surface-alt hover:text-brand"
                        aria-label={`Call ${siteConfig.contact.phoneDisplay}`}
                        onClick={() => trackPhoneClick('header')}
                    >
                        <Phone className="h-5 w-5 shrink-0" />
                        <span className="hidden text-sm font-medium xl:inline">{siteConfig.contact.phoneDisplay}</span>
                    </a>
                    <a
                        href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-alt hover:text-success"
                        aria-label="WhatsApp"
                        onClick={() => trackWhatsAppClick('header')}
                    >
                        <MessageCircle className="h-5 w-5" />
                    </a>
                    <Link
                        to="/booking"
                        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-light"
                        onClick={() => trackNavClick('/booking', 'Book Now', 'header')}
                    >
                        Book Now
                    </Link>
                </div>

                <button
                    type="button"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-alt lg:hidden"
                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile nav */}
            {mobileOpen && (
                <nav
                    className="max-h-[min(85vh,calc(100dvh-4rem))] overflow-y-auto border-t border-border-default bg-surface px-4 py-4 lg:hidden"
                    aria-label="Mobile navigation"
                >
                    <div className="space-y-1">
                        <details className="group rounded-lg border border-border-default bg-surface-alt/50">
                            <summary className="cursor-pointer list-none px-3 py-2 text-sm font-semibold text-text-primary [&::-webkit-details-marker]:hidden">
                                <span className="flex items-center justify-between">
                                    Services
                                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
                                </span>
                            </summary>
                            <div className="border-t border-border-default px-2 pb-2 pt-1">
                                {SERVICE_CATEGORY_ORDER.map((catId) => {
                                    const meta = CATEGORY_META[catId];
                                    const CatIcon = meta.Icon;
                                    const items = SERVICES_BY_CATEGORY[catId];
                                    return (
                                        <details key={catId} className="group/cat mt-1 rounded-md bg-surface/80 first:mt-0">
                                            <summary className="cursor-pointer list-none px-2 py-2 text-xs font-bold uppercase tracking-wide text-text-secondary [&::-webkit-details-marker]:hidden">
                                                <span className="flex items-center gap-2">
                                                    <CatIcon className="h-3.5 w-3.5 text-brand" />
                                                    {meta.label}
                                                    <ChevronDown className="ml-auto h-3.5 w-3.5 transition-transform group-open/cat:rotate-180" />
                                                </span>
                                            </summary>
                                            <ul className="space-y-0.5 border-t border-border-default/60 px-1 py-1.5">
                                                {items.map((item) => (
                                                    <li key={item.href}>
                                                        <NavLink
                                                            to={item.href}
                                                            className={({ isActive }) =>
                                                                cn(
                                                                    'block rounded-md px-2 py-1.5 text-sm',
                                                                    isActive
                                                                        ? 'bg-brand/10 text-brand-light'
                                                                        : 'text-text-muted hover:bg-surface-elevated hover:text-text-secondary',
                                                                )
                                                            }
                                                            onClick={() => {
                                                                trackNavClick(item.href, item.title, 'header_services_mobile');
                                                                closeMobile();
                                                            }}
                                                        >
                                                            {item.title}
                                                        </NavLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        </details>
                                    );
                                })}
                                <NavLink
                                    to="/services"
                                    className="mt-2 flex items-center justify-center gap-1 rounded-lg border border-brand/30 bg-brand/5 px-3 py-2 text-sm font-semibold text-brand-light"
                                    onClick={() => {
                                        trackNavClick('/services', 'View all services', 'header_services_mobile');
                                        closeMobile();
                                    }}
                                >
                                    View all services
                                    <ChevronRight className="h-4 w-4" />
                                </NavLink>
                            </div>
                        </details>

                        {secondaryNav.map((link) => (
                            <NavLink
                                key={link.href}
                                to={link.href}
                                className={({ isActive }) => cn('block', navLinkClass(isActive))}
                                onClick={() => {
                                    trackNavClick(link.href, link.label, 'header_mobile');
                                    closeMobile();
                                }}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>
                </nav>
            )}
        </header>
    );
}
