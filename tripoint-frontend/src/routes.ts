/**
 * Single source of truth for indexable routes.
 * Used by: SSG prerender, sitemap generation, SEO config.
 */

import { siteConfig } from './config/site';

const priceZoneA = (slug: string, fallback: number) =>
    siteConfig.pricing.services.find((s) => s.slug === slug)?.zoneA ?? fallback;

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
        title: 'Areas Covered | Mobile Diagnostics Kent and SE London',
        description:
            'Mobile vehicle diagnostics across Kent and South East London from our Tonbridge and Eltham bases. Area pages for Greenwich, Bexley, Orpington, Maidstone, Tonbridge, and Gillingham and Medway.',
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
        description: `Mobile diagnostic service for Mercedes cars and vans. Full-system scan with dealer tools (Xentry), live data, guided tests, and a written fix plan. From £${priceZoneA('diagnostic-callout', 120)} (ex. VAT, Zone A).`,
        canonicalPath: '/services/diagnostic-callout',
        priority: 0.9,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/services/vor-van-diagnostics',
        title: 'VOR Diagnosis - Priority Commercial Vehicle Diagnostics',
        description: `Vehicle Off Road priority diagnostic for vans and commercial vehicles. Fast triage and back-on-road decisions. From £${priceZoneA('vor-van-diagnostics', 160)} (ex. VAT, Zone A).`,
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
    // Van Remapping (hub + model landing pages)
    {
        path: '/services/van-remapping',
        title: 'Van Remapping - Mobile Stage 1 ECU Remap, Kent & SE London',
        description:
            'Mobile van remapping across Kent and South East London. Stage 1 ECU remap for power and driveability or economy, all common vans. Diagnostic pre-check, reversible, no deletes.',
        canonicalPath: '/services/van-remapping',
        priority: 0.8,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/services/transit-custom-remap',
        title: 'Ford Transit Custom Remap - Mobile, Kent & SE London',
        description:
            'Mobile Ford Transit Custom remap (Stage 1): more usable power and driveability, or better economy. Diagnostic pre-check, fully reversible, insurance note.',
        canonicalPath: '/services/transit-custom-remap',
        priority: 0.7,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/services/vw-transporter-remap',
        title: 'VW Transporter Remap (T5 / T6) - Mobile, Kent & SE London',
        description:
            'Mobile VW Transporter remap (Stage 1) for T5, T6 and T6.1 2.0 TDI: more usable power and driveability, or better economy. Reversible, insurance note.',
        canonicalPath: '/services/vw-transporter-remap',
        priority: 0.7,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/services/vw-caddy-remap',
        title: 'VW Caddy Remap - Mobile Stage 1, Kent & SE London',
        description:
            'Mobile VW Caddy remap (Stage 1) for the 2.0 TDI: unlock usable power and driveability, or better economy. Diagnostic pre-check, reversible, insurance note.',
        canonicalPath: '/services/vw-caddy-remap',
        priority: 0.7,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/services/ford-transit-remap',
        title: 'Ford Transit Remap - Mobile Stage 1, Kent & SE London',
        description:
            'Mobile Ford Transit remap (Stage 1) for the 2.0 EcoBlue and 2.2/2.4 TDCi: more usable power and driveability, or better economy. Reversible, insurance note.',
        canonicalPath: '/services/ford-transit-remap',
        priority: 0.7,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/services/vauxhall-vivaro-remap',
        title: 'Vauxhall Vivaro Remap - Mobile Stage 1, Kent & SE London',
        description:
            'Mobile Vauxhall Vivaro remap (Stage 1): more usable power and driveability, or better economy. Diagnostic pre-check, reversible, insurance note.',
        canonicalPath: '/services/vauxhall-vivaro-remap',
        priority: 0.7,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/services/mercedes-sprinter-remap',
        title: 'Mercedes Sprinter Remap - Mobile Stage 1, Kent & SE London',
        description:
            'Mobile Mercedes Sprinter remap (Stage 1) for OM651 and OM654 (W906/W907): more usable power and driveability, or better economy. Diagnostic-first, reversible.',
        canonicalPath: '/services/mercedes-sprinter-remap',
        priority: 0.7,
        changefreq: 'weekly',
        indexable: true,
    },
    {
        path: '/services/mercedes-vito-remap',
        title: 'Mercedes Vito Remap - Mobile Stage 1, Kent & SE London',
        description:
            'Mobile Mercedes Vito remap (Stage 1) for OM651 and OM654 (W447): more usable power and driveability, or better economy. Diagnostic-first, reversible.',
        canonicalPath: '/services/mercedes-vito-remap',
        priority: 0.7,
        changefreq: 'weekly',
        indexable: true,
    },
    // Areas covered (6 surviving pages + new Medway page)
    {
        path: '/areas-covered/greenwich',
        title: 'Mobile Vehicle Diagnostics in Greenwich | TriPoint Diagnostics',
        description:
            'Mobile Mercedes diagnostics in SE10, SE7, SE3 and SE18. We cover the Greenwich borough from our Eltham base. Dealer-level STAR/XENTRY at your location.',
        canonicalPath: '/areas-covered/greenwich',
        priority: 0.7,
        changefreq: 'monthly' as const,
        indexable: true,
    },
    {
        path: '/areas-covered/bexley',
        title: 'Mobile Vehicle Diagnostics in Bexley | DA Postcode Coverage',
        description:
            'Mobile Mercedes diagnostics across DA1 to DA17. Bexley, Sidcup, Welling, Erith, and Crayford covered from our Eltham base. Zone A and B pricing.',
        canonicalPath: '/areas-covered/bexley',
        priority: 0.7,
        changefreq: 'monthly' as const,
        indexable: true,
    },
    {
        path: '/areas-covered/orpington',
        title: 'Mobile Vehicle Diagnostics in Orpington | BR5 BR6 BR7 BR8',
        description:
            'Mobile Mercedes diagnostics in Orpington, Chislehurst, Swanley and Hextable. BR5 to BR8 covered from our Eltham base. Xentry coding for independent garages.',
        canonicalPath: '/areas-covered/orpington',
        priority: 0.7,
        changefreq: 'monthly' as const,
        indexable: true,
    },
    {
        path: '/areas-covered/maidstone',
        title: 'Mobile Vehicle Diagnostics in Maidstone | ME14 ME15 ME16 ME17',
        description:
            'Mobile Mercedes diagnostics in Maidstone and surrounding villages. ME14 to ME17 covered from our Tonbridge base. Servicing, NOx diagnostics, and fault finding.',
        canonicalPath: '/areas-covered/maidstone',
        priority: 0.7,
        changefreq: 'monthly' as const,
        indexable: true,
    },
    {
        path: '/areas-covered/tonbridge',
        title: 'Mobile Vehicle Diagnostics in Tonbridge | Home Base Zone A',
        description:
            'TriPoint Diagnostics is based in Tonbridge. Zone A covers Tonbridge, Hildenborough, Hadlow and Paddock Wood. Same-day availability. Dealer-level Mercedes diagnostics.',
        canonicalPath: '/areas-covered/tonbridge',
        priority: 0.7,
        changefreq: 'monthly' as const,
        indexable: true,
    },
    {
        path: '/areas-covered/medway',
        title: 'Mobile Vehicle Diagnostics in Gillingham and Medway | TriPoint Diagnostics',
        description:
            'Mobile Mercedes diagnostics in Chatham, Gillingham and Rainham. ME5, ME7 and ME8 covered from our Tonbridge base. Van servicing, Xentry coding, and fault finding.',
        canonicalPath: '/areas-covered/medway',
        priority: 0.7,
        changefreq: 'monthly' as const,
        indexable: true,
    },
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
        path: '/sample-diagnostic-report',
        title: 'Sample Diagnostic Report | What You Get After a Proper Vehicle Diagnosis',
        description:
            'See what a real written diagnostic report looks like from TriPoint Diagnostics. Plain-English findings, evidence from live data and guided tests, and clear next steps.',
        canonicalPath: '/sample-diagnostic-report',
        priority: 0.7,
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
    {
        path: '/blog/sprinter-p0299-turbo-underboost',
        title: 'Sprinter P0299 Turbo Underboost: Causes and Diagnosis | TriPoint Diagnostics',
        description:
            'P0299 on a Mercedes Sprinter W906 or W907 means the turbo is producing less boost than requested. Here is what causes it and what a proper diagnostic session looks at.',
        canonicalPath: '/blog/sprinter-p0299-turbo-underboost',
        priority: 0.5,
        changefreq: 'monthly',
        indexable: true,
    },
    {
        path: '/blog/sprinter-p0234-turbo-overboost',
        title: 'Sprinter P0234 Turbo Overboost: Causes and Diagnosis | TriPoint Diagnostics',
        description:
            'P0234 on a Mercedes Sprinter means the turbo is producing more boost than requested. Here is what causes it on the W906 and W907 and what the diagnostic process looks like.',
        canonicalPath: '/blog/sprinter-p0234-turbo-overboost',
        priority: 0.5,
        changefreq: 'monthly',
        indexable: true,
    },
    {
        path: '/blog/mercedes-p2002-dpf-fault',
        title: 'Mercedes P2002 DPF Fault: What It Means and What to Do | TriPoint Diagnostics',
        description:
            'P2002 on a Mercedes diesel means the DPF is not reducing particulate matter as expected. Here is what triggers it, what the diagnostic process covers, and when regen helps versus when it does not.',
        canonicalPath: '/blog/mercedes-p2002-dpf-fault',
        priority: 0.5,
        changefreq: 'monthly',
        indexable: true,
    },
    {
        path: '/blog/sprinter-p0401-egr-fault',
        title: 'Sprinter P0401 EGR Fault: Causes and Diagnosis | TriPoint Diagnostics',
        description:
            'P0401 on a Mercedes Sprinter means insufficient EGR flow. Here is what causes it on the OM651 and OM654 and what a proper diagnostic session looks at before any parts are replaced.',
        canonicalPath: '/blog/sprinter-p0401-egr-fault',
        priority: 0.5,
        changefreq: 'monthly',
        indexable: true,
    },
    {
        path: '/blog/mercedes-p0420-catalyst-fault',
        title: 'Mercedes P0420 Catalyst Fault: Causes and Diagnosis | TriPoint Diagnostics',
        description:
            'P0420 on a Mercedes diesel means catalyst efficiency is below threshold. Here is what the code means, what causes it, and what a diagnostic session looks at before condemning the cat.',
        canonicalPath: '/blog/mercedes-p0420-catalyst-fault',
        priority: 0.5,
        changefreq: 'monthly',
        indexable: true,
    },
    {
        path: '/blog/sprinter-p2463-dpf-soot-accumulation',
        title: 'Sprinter P2463 DPF Soot Accumulation: Diagnosis and Regens | TriPoint Diagnostics',
        description:
            'P2463 on a Mercedes Sprinter means the DPF has accumulated soot beyond the threshold. Here is what causes it, when a forced regen helps, and when it does not.',
        canonicalPath: '/blog/sprinter-p2463-dpf-soot-accumulation',
        priority: 0.5,
        changefreq: 'monthly',
        indexable: true,
    },
    {
        path: '/blog/vito-adblue-fault',
        title: 'Vito AdBlue Fault: Causes and Diagnosis | TriPoint Diagnostics',
        description:
            'AdBlue warning on a Mercedes Vito W639 or W447? Here is what causes it, why clearing the code does not fix it, and what a proper diagnostic session covers.',
        canonicalPath: '/blog/vito-adblue-fault',
        priority: 0.5,
        changefreq: 'monthly',
        indexable: true,
    },
    {
        path: '/blog/mercedes-eml-on',
        title: 'Mercedes Engine Management Light On: Causes and Diagnosis | TriPoint Diagnostics',
        description:
            'Engine management light on a Mercedes van or car? Here is what it can mean, why the light alone does not tell you what is wrong, and what a proper diagnostic session involves.',
        canonicalPath: '/blog/mercedes-eml-on',
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
