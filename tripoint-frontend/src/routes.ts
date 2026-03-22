/**
 * Single source of truth for indexable routes.
 * Used by: SSG prerender, sitemap generation, SEO config.
 */

export interface RouteEntry {
    path: string;
    title: string;
    description: string;
    canonicalPath: string;
    priority: number;
    changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
    indexable: boolean;
}

export const routeManifest: RouteEntry[] = [
    // Core
    {
        path: '/',
        title: 'Mobile Vehicle Diagnostics & Repairs | Kent & SE London',
        description:
            'Dealer-level mobile diagnostics and compliant repairs for vans and cars across Kent and South East London. Mercedes specialist. Compliance-first, no guesswork.',
        canonicalPath: '/',
        priority: 1.0,
        changefreq: 'daily',
        indexable: true,
    },
    {
        path: '/services',
        title: 'Services',
        description:
            'Mercedes diagnostics, fault finding, DPF regeneration, AdBlue/SCR diagnostics, ECU coding. Mobile service across Kent and South East London.',
        canonicalPath: '/services',
        priority: 0.9,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/areas-covered',
        title: 'Areas Covered',
        description:
            'Mobile vehicle diagnostics across Tonbridge, Sevenoaks, Bromley, Bexley, Greenwich, Lewisham, Dartford, Orpington, Sidcup, Eltham, Tunbridge Wells, Maidstone, Gravesend.',
        canonicalPath: '/areas-covered',
        priority: 0.9,
        changefreq: 'weekly',
        indexable: true,
    },
    // Services
    {
        path: '/services/mercedes-xentry-diagnostics-coding',
        title: 'Mercedes XENTRY Diagnostics & Coding',
        description:
            'Dealer-level Mercedes diagnostics and coding with STAR/XENTRY. Mobile fault finding, adaptations, and variant coding across Kent and SE London.',
        canonicalPath: '/services/diagnostic-callout',
        priority: 0.3,
        changefreq: 'monthly',
        indexable: false,
    },
    {
        path: '/services/mobile-fault-finding',
        title: 'Mobile Fault Finding',
        description:
            'Professional mobile fault finding for Mercedes and commercial vehicles. Dealer-level diagnostics at your location across Kent and South East London.',
        canonicalPath: '/services/diagnostic-callout',
        priority: 0.3,
        changefreq: 'monthly',
        indexable: false,
    },
    {
        path: '/services/dpf-regeneration-and-diagnostics',
        title: 'DPF Regeneration & Diagnostics',
        description:
            'DPF diagnostics and forced regeneration. Compliance-first approach. We diagnose before regen to avoid masking deeper faults.',
        canonicalPath: '/services/diagnostic-callout',
        priority: 0.3,
        changefreq: 'monthly',
        indexable: false,
    },
    {
        path: '/services/adblue-scr-diagnostics',
        title: 'AdBlue & SCR Diagnostics',
        description:
            'AdBlue and SCR system diagnostics. NOx sensor faults, dosing issues, countdown resolution. Compliance-first diagnostics.',
        canonicalPath: '/services/diagnostic-callout',
        priority: 0.3,
        changefreq: 'monthly',
        indexable: false,
    },
    {
        path: '/services/ecu-coding-and-variant-coding',
        title: 'ECU Coding & Variant Coding',
        description:
            'Mercedes ECU coding, adaptations, and variant coding. STAR/XENTRY dealer-level coding mobile across Kent and South East London.',
        canonicalPath: '/services/diagnostic-callout',
        priority: 0.3,
        changefreq: 'monthly',
        indexable: false,
    },
    {
        path: '/services/diagnostic-callout',
        title: 'Standard Diagnosis - Mobile Mercedes Diagnostics',
        description:
            'Mobile diagnostic service for Mercedes cars and vans. Full-system scan with dealer tools (Xentry), live data, guided tests, and a written fix plan. From £120.',
        canonicalPath: '/services/diagnostic-callout',
        priority: 0.9,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/services/vor-van-diagnostics',
        title: 'VOR Diagnosis - Priority Commercial Vehicle Diagnostics',
        description:
            'Vehicle Off Road priority diagnostic for vans and commercial vehicles. Fast triage and back-on-road decisions. From £160.',
        canonicalPath: '/services/vor-van-diagnostics',
        priority: 0.9,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/services/emissions-diagnostics',
        title: 'Emissions Diagnostics',
        description:
            'AdBlue, SCR, DPF, NOx emissions fault decision visits. Compliance-first diagnostics before any repair.',
        canonicalPath: '/services/diagnostic-callout',
        priority: 0.3,
        changefreq: 'monthly',
        indexable: false,
    },
    {
        path: '/services/pre-purchase-digital-health-check',
        title: 'Pre-Purchase Digital Health Check',
        description:
            'Pre-purchase diagnostic health check for used Mercedes and commercial vehicles. Know before you buy.',
        canonicalPath: '/services/pre-purchase-digital-health-check',
        priority: 0.8,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/services/sprinter-limp-mode',
        title: 'Sprinter Limp Mode',
        description:
            'Sprinter limp mode triage and diagnostics. Proper fault finding before any repair. W906 and W907 specialist.',
        canonicalPath: '/services/diagnostic-callout',
        priority: 0.3,
        changefreq: 'monthly',
        indexable: false,
    },
    {
        path: '/services/adblue-countdown',
        title: 'AdBlue Countdown',
        description:
            'AdBlue countdown diagnostic. Proper diagnosis before code clearing. SCR system fault finding.',
        canonicalPath: '/services/diagnostic-callout',
        priority: 0.3,
        changefreq: 'monthly',
        indexable: false,
    },
    {
        path: '/services/nox-scr-diagnostics',
        title: 'NOx & SCR Diagnostics',
        description:
            'NOx sensor and SCR system diagnostics. Emissions compliance fault finding.',
        canonicalPath: '/services/diagnostic-callout',
        priority: 0.3,
        changefreq: 'monthly',
        indexable: false,
    },
    {
        path: '/services/dpf-regeneration-decision',
        title: 'DPF Regeneration Decision',
        description:
            'DPF diagnostic decision visit. We check before regen. Compliance-first approach.',
        canonicalPath: '/services/diagnostic-callout',
        priority: 0.3,
        changefreq: 'monthly',
        indexable: false,
    },
    {
        path: '/services/intermittent-electrical-faults',
        title: 'Intermittent Electrical Faults',
        description:
            'Intermittent electrical fault diagnostics. Wiring, connectors, CAN faults. Mobile diagnostics.',
        canonicalPath: '/services/diagnostic-callout',
        priority: 0.3,
        changefreq: 'monthly',
        indexable: false,
    },
    {
        path: '/services/fleet-health-check',
        title: 'Fleet Health Check',
        description:
            'Fleet vehicle health checks. Mercedes and commercial vehicle diagnostics for fleet operators.',
        canonicalPath: '/services/diagnostic-callout',
        priority: 0.3,
        changefreq: 'monthly',
        indexable: false,
    },
    // Mercedes Van Servicing
    {
        path: '/services/mercedes-van-servicing',
        title: 'Mercedes Van Servicing',
        description:
            'Mobile Mercedes van servicing for Sprinter, Vito, and Citan. Minor and major service packages at your location across Kent and SE London.',
        canonicalPath: '/services/mercedes-van-servicing',
        priority: 0.8,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/services/sprinter-servicing',
        title: 'Sprinter Servicing',
        description:
            'Mobile Sprinter servicing for W906 and W907. Oil service, major service, and brake packages at your door.',
        canonicalPath: '/services/sprinter-servicing',
        priority: 0.8,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/services/vito-servicing',
        title: 'Vito Servicing',
        description:
            'Mobile Vito W447 servicing. Minor and major service packages at your home, yard, or workplace.',
        canonicalPath: '/services/vito-servicing',
        priority: 0.8,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/services/citan-servicing',
        title: 'Citan Servicing',
        description:
            'Mobile Citan servicing for W415 and W420. Planned maintenance at your location across Kent and SE London.',
        canonicalPath: '/services/citan-servicing',
        priority: 0.8,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/services/sprinter-brakes',
        title: 'Sprinter Brakes',
        description:
            'Mobile Sprinter brake service. Front and rear pads, discs, and packaged brake jobs for W906 and W907.',
        canonicalPath: '/services/sprinter-brakes',
        priority: 0.8,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/services/vito-brakes',
        title: 'Vito Brakes',
        description:
            'Mobile Vito W447 brake service. Front and rear pads, discs, and fixed-price brake packages.',
        canonicalPath: '/services/vito-brakes',
        priority: 0.8,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/services/citan-brakes',
        title: 'Citan Brakes',
        description:
            'Mobile Citan brake service. Front and rear brake packages for W415 and W420 at your location.',
        canonicalPath: '/services/citan-brakes',
        priority: 0.8,
        changefreq: 'weekly',
        indexable: true,
    },
    // Commercial Van Tuning
    {
        path: '/services/van-load-driveability-tune',
        title: 'Van Load & Driveability Tune',
        description:
            'Mobile van tuning for better loaded performance. Stronger torque, easier overtakes, smoother hill pull. All van makes.',
        canonicalPath: '/services/van-load-driveability-tune',
        priority: 0.8,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/services/van-economy-tune',
        title: 'Van Economy Tune',
        description:
            'Van economy tuning for smoother cruising and potential fuel savings. High-mileage and route-heavy vans. All makes.',
        canonicalPath: '/services/van-economy-tune',
        priority: 0.8,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/services/fleet-van-tuning',
        title: 'Fleet Van Tuning',
        description:
            'Fleet van tuning packages. Consistent drivability across your fleet with volume pricing and site-day rates.',
        canonicalPath: '/services/fleet-van-tuning',
        priority: 0.8,
        changefreq: 'weekly',
        indexable: true,
    },
    // Areas covered
    ...['tonbridge', 'sevenoaks', 'bromley', 'bexley', 'greenwich', 'lewisham', 'dartford', 'orpington', 'sidcup', 'eltham', 'tunbridge-wells', 'maidstone', 'gravesend'].map(
        (slug) => ({
            path: `/areas-covered/${slug}`,
            title: `Mobile Vehicle Diagnostics in ${slug
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ')}`,
            description: `Mobile Mercedes diagnostics and fault finding in ${slug
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ')}. Dealer-level STAR/XENTRY at your location.`,
            canonicalPath: `/areas-covered/${slug}`,
            priority: 0.7,
            changefreq: 'monthly' as const,
            indexable: true,
        })
    ),
    // Other pages
    {
        path: '/pricing',
        title: 'Pricing',
        description:
            'Transparent pricing for mobile diagnostics. Zone-based callout fees. No hidden costs.',
        canonicalPath: '/pricing',
        priority: 0.9,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/about',
        title: 'About',
        description:
            'TriPoint Diagnostics. Mobile vehicle diagnostics specialist. Mercedes and commercial vehicles across Kent and South East London.',
        canonicalPath: '/about',
        priority: 0.7,
        changefreq: 'monthly',
        indexable: true,
    },
    {
        path: '/faq',
        title: 'FAQ',
        description:
            'Frequently asked questions about mobile diagnostics, Mercedes specialist services, and our coverage area.',
        canonicalPath: '/faq',
        priority: 0.7,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/booking',
        title: 'Booking',
        description:
            'Book a mobile diagnostic callout. Choose your service and location. TriPoint Diagnostics.',
        canonicalPath: '/booking',
        priority: 0.9,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/contact',
        title: 'Contact',
        description:
            'Contact TriPoint Diagnostics. Call, WhatsApp, or use our contact form. Mobile diagnostics across Kent and SE London.',
        canonicalPath: '/contact',
        priority: 0.8,
        changefreq: 'monthly',
        indexable: true,
    },
    {
        path: '/process',
        title: 'Our Process',
        description:
            'How TriPoint Diagnostics works. From booking to diagnosis. Clear, compliance-first approach.',
        canonicalPath: '/process',
        priority: 0.8,
        changefreq: 'monthly',
        indexable: true,
    },
    {
        path: '/our-work',
        title: 'Our Work',
        description:
            'Photo gallery of diagnostic work. Real jobs, real results. Mercedes and commercial vehicle diagnostics.',
        canonicalPath: '/our-work',
        priority: 0.7,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/blog',
        title: 'Blog',
        description:
            'Technical insights on Mercedes OM654 turbo failures, Sprinter limp mode, AdBlue, DPF. Diagnostic tips and practical guidance.',
        canonicalPath: '/blog',
        priority: 0.6,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/blog/sprinter-limp-mode-proper-diagnostic',
        title: 'Sprinter Limp Mode: What a Proper Diagnostic Looks Like',
        description:
            'Common triggers for Sprinter limp mode, why code-clearing does not work, and what a proper diagnostic session involves.',
        canonicalPath: '/blog/sprinter-limp-mode-proper-diagnostic',
        priority: 0.5,
        changefreq: 'monthly',
        indexable: true,
    },
    {
        path: '/blog/adblue-countdown-clearing-codes-not-fix',
        title: 'AdBlue Countdown: Why Clearing Codes Is Not a Fix',
        description:
            'What triggers the AdBlue countdown, why it returns after clearing, and what a proper decision visit actually does.',
        canonicalPath: '/blog/adblue-countdown-clearing-codes-not-fix',
        priority: 0.5,
        changefreq: 'monthly',
        indexable: true,
    },
    {
        path: '/blog/dpf-warning-light-regen-vs-worse',
        title: 'DPF Warning Lights: When Regen Helps vs When It Makes Things Worse',
        description:
            'Forced regen vs passive, when regen is safe, when it masks a deeper fault, and why we diagnose first.',
        canonicalPath: '/blog/dpf-warning-light-regen-vs-worse',
        priority: 0.5,
        changefreq: 'monthly',
        indexable: true,
    },
    {
        path: '/blog/om654-turbo-failure-sprinter-vito',
        title: 'Why OM654 Turbochargers Are Failing in Mercedes Sprinter and Vito',
        description:
            'Real workshop-level technical breakdown of OM654 turbo failures in W907 Sprinter and W447 Vito. Root causes, symptoms, repair costs, and prevention.',
        canonicalPath: '/blog/om654-turbo-failure-sprinter-vito',
        priority: 0.5,
        changefreq: 'monthly',
        indexable: true,
    },
    // Legal
    {
        path: '/legal/privacy-policy',
        title: 'Privacy Policy',
        description: 'TriPoint Diagnostics privacy policy. GDPR compliant.',
        canonicalPath: '/legal/privacy-policy',
        priority: 0.3,
        changefreq: 'yearly',
        indexable: true,
    },
    {
        path: '/legal/terms',
        title: 'Terms of Service',
        description: 'TriPoint Diagnostics terms of service.',
        canonicalPath: '/legal/terms',
        priority: 0.3,
        changefreq: 'yearly',
        indexable: true,
    },
    {
        path: '/legal/disclaimer',
        title: 'Disclaimer',
        description: 'TriPoint Diagnostics disclaimers and emissions compliance.',
        canonicalPath: '/legal/disclaimer',
        priority: 0.3,
        changefreq: 'yearly',
        indexable: true,
    },
    {
        path: '/legal/accessibility',
        title: 'Accessibility',
        description: 'TriPoint Diagnostics accessibility statement.',
        canonicalPath: '/legal/accessibility',
        priority: 0.3,
        changefreq: 'yearly',
        indexable: true,
    },
];

export function getSeoForPath(pathname: string): RouteEntry | undefined {
    const normalized = pathname.replace(/\/$/, '') || '/';
    return routeManifest.find((r) => {
        const rPath = r.path.replace(/\/$/, '') || '/';
        return rPath === normalized;
    });
}
