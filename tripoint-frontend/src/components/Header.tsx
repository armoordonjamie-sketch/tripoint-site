import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, ChevronDown, Phone, MessageCircle } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

const navLinks = [
    {
        label: 'Services',
        href: '/services',
        children: [
            { label: 'All Services', href: '/services' },
            { label: 'Diagnostic Callout', href: '/services/diagnostic-callout' },
            { label: 'VOR Van Diagnostics', href: '/services/vor-van-diagnostics' },
            { label: 'Emissions Diagnostics', href: '/services/emissions-diagnostics' },
            { label: 'Pre-Purchase Digital Health Check', href: '/services/pre-purchase-digital-health-check' },
            { label: 'Sprinter Limp Mode', href: '/services/sprinter-limp-mode' },
            { label: 'AdBlue Countdown', href: '/services/adblue-countdown' },
            { label: 'NOx / SCR Diagnostics', href: '/services/nox-scr-diagnostics' },
            { label: 'DPF Warning Light', href: '/services/dpf-regeneration-decision' },
            { label: 'Mercedes Xentry Diagnostics', href: '/services/mercedes-xentry-diagnostics-coding' },
            { label: 'Intermittent Electrical Faults', href: '/services/intermittent-electrical-faults' },
            { label: 'Fleet Health Check', href: '/services/fleet-health-check' },
        ],
    },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Areas We Cover', href: '/areas' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '/blog' },
    { label: 'FAQs', href: '/faq' },
    { label: 'Our Work', href: '/our-work' },
];

export function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-border-default bg-surface/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3" aria-label="TriPoint Diagnostics Home">
                    <img
                        src="/logo-no-text-light.png"
                        alt={siteConfig.brandName}
                        className="h-14 w-auto"
                    />
                    <span className="hidden text-xl font-bold text-text-primary sm:block">
                        {siteConfig.brandName}
                    </span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
                    {navLinks.map((link) =>
                        link.children ? (
                            <div key={link.label} className="relative">
                                <button
                                    onClick={() => setServicesOpen(!servicesOpen)}
                                    onBlur={() => setTimeout(() => setServicesOpen(false), 200)}
                                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary"
                                    aria-expanded={servicesOpen}
                                    aria-haspopup="true"
                                >
                                    {link.label}
                                    <ChevronDown className={cn('h-4 w-4 transition-transform', servicesOpen && 'rotate-180')} />
                                </button>
                                {servicesOpen && (
                                    <div className="absolute left-0 top-full mt-1 w-64 rounded-xl border border-border-default bg-surface-alt p-2 shadow-xl">
                                        {link.children.map((child) => (
                                            <NavLink
                                                key={child.href}
                                                to={child.href}
                                                end={child.href === link.href}
                                                className={({ isActive }) =>
                                                    cn(
                                                        'block rounded-lg px-3 py-2 text-sm transition-colors',
                                                        isActive ? 'bg-brand/10 text-brand-light' : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary',
                                                    )
                                                }
                                                onClick={() => setServicesOpen(false)}
                                            >
                                                {child.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <NavLink
                                key={link.href}
                                to={link.href}
                                className={({ isActive }) =>
                                    cn(
                                        'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                        isActive ? 'bg-brand/10 text-brand-light' : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary',
                                    )
                                }
                            >
                                {link.label}
                            </NavLink>
                        ),
                    )}
                </nav>

                {/* Desktop CTA */}
                <div className="hidden items-center gap-2 lg:flex">
                    <a
                        href={`tel:${siteConfig.contact.phoneE164}`}
                        className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-alt hover:text-brand"
                        aria-label="Call us"
                        onClick={() => trackEvent('click_phone_header')}
                    >
                        <Phone className="h-5 w-5" />
                    </a>
                    <a
                        href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-alt hover:text-success"
                        aria-label="WhatsApp"
                        onClick={() => trackEvent('click_whatsapp', { location: 'header' })}
                    >
                        <MessageCircle className="h-5 w-5" />
                    </a>
                    <Link
                        to="/booking"
                        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-light"
                        onClick={() => trackEvent('click_book_now')}
                    >
                        Book Now
                    </Link>
                </div>

                {/* Mobile toggle */}
                <button
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
                    className="border-t border-border-default bg-surface px-4 py-4 lg:hidden"
                    aria-label="Mobile navigation"
                >
                    <div className="space-y-1">
                        {navLinks.map((link) =>
                            link.children ? (
                                <div key={link.label}>
                                    <NavLink
                                        to={link.href}
                                        className={({ isActive }) =>
                                            cn(
                                                'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                                isActive ? 'bg-brand/10 text-brand-light' : 'text-text-secondary hover:bg-surface-alt',
                                            )
                                        }
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {link.label}
                                    </NavLink>
                                    <div className="ml-4 space-y-1">
                                        {link.children.map((child) => (
                                            <NavLink
                                                key={child.href}
                                                to={child.href}
                                                className={({ isActive }) =>
                                                    cn(
                                                        'block rounded-lg px-3 py-2 text-sm transition-colors',
                                                        isActive ? 'bg-brand/10 text-brand-light' : 'text-text-muted hover:bg-surface-alt hover:text-text-secondary',
                                                    )
                                                }
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                {child.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <NavLink
                                    key={link.href}
                                    to={link.href}
                                    className={({ isActive }) =>
                                        cn(
                                            'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                            isActive ? 'bg-brand/10 text-brand-light' : 'text-text-secondary hover:bg-surface-alt',
                                        )
                                    }
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {link.label}
                                </NavLink>
                            ),
                        )}
                    </div>
                    <div className="mt-4 flex gap-2 border-t border-border-default pt-4">
                        <a
                            href={`tel:${siteConfig.contact.phoneE164}`}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-alt"
                            onClick={() => trackEvent('click_phone_header')}
                        >
                            <Phone className="h-4 w-4" />
                            Call
                        </a>
                        <a
                            href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-alt"
                            onClick={() => trackEvent('click_whatsapp', { location: 'header' })}
                        >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                        </a>
                        <Link
                            to="/booking"
                            className="flex flex-1 items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-light"
                            onClick={() => {
                                setMobileOpen(false);
                                trackEvent('click_book_now');
                            }}
                        >
                            Book Now
                        </Link>
                    </div>
                </nav>
            )}
        </header>
    );
}
