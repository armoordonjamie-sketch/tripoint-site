export const siteConfig = {
    brandName: 'TriPoint Diagnostics',
    tagline: 'Mobile Vehicle Diagnostics & Repairs - Kent & SE London',
    description:
        'Dealer-level mobile diagnostics and compliant repairs for vans and cars across Kent and South East London. Compliance-first, no guesswork.',
    url: 'https://tripointdiagnostics.co.uk',

    contact: {
        phoneDisplay: '020 8058 6095',
        phoneE164: '+442080586095',
        whatsappE164: 'message/NROKKGS6QK54G1',
        email: 'contact@tripointdiagnostics.co.uk',
        calendlyUrl: 'https://calendly.com/tripoint-diagnostics',
    },

    social: {
        facebook: 'https://facebook.com/REPLACE_ME',
        instagram: 'https://instagram.com/REPLACE_ME',
        google: 'https://g.page/REPLACE_ME',
    },

    baseLocations: {
        weekA: {
            label: 'Week A (Tonbridge)',
            postcode: 'TN9 1PP',
            hours: 'Mon - Sat: 6:00 AM – 10:00 PM',
            note: 'Rotating Base',
        },
        weekB: {
            label: 'Week B (Eltham)',
            postcode: 'SE9 4HA',
            hours: 'Mon - Sat: 6:00 AM – 10:00 PM',
            note: 'Rotating Base',
        },
    },

    coverageTowns: [
        'Bromley',
        'Bexley',
        'Greenwich',
        'Lewisham',
        'Dartford',
        'Orpington',
        'Sidcup',
        'Eltham',
        'Sevenoaks',
        'Tonbridge',
        'Tunbridge Wells',
        'Maidstone',
        'Gravesend',
    ],

    zones: [
        { zone: 'A', driveTime: '0–25 mins', note: 'Core area' },
        { zone: 'B', driveTime: '25–45 mins', note: 'Standard coverage' },
        { zone: 'C', driveTime: '45–60 mins', note: 'Edge of radius' },
        { zone: 'Out of area', driveTime: '60+ mins', note: 'Quote only' },
    ],

    pricing: {
        services: [
            {
                name: 'Diagnostic Callout (Standard)',
                slug: 'diagnostic-callout',
                zoneA: 120,
                zoneB: 135,
                zoneC: 150,
                included: 'Up to 60 mins on-site time',
            },
            {
                name: 'VOR / Priority Triage (Commercial)',
                slug: 'vor-triage',
                zoneA: 160,
                zoneB: 175,
                zoneC: 190,
                included: 'Up to 75 mins on-site time',
            },
            {
                name: 'Emissions Fault Decision Visit (AdBlue/SCR/DPF/NOx)',
                slug: 'emissions-diagnostics',
                zoneA: 170,
                zoneB: 185,
                zoneC: 200,
                included: 'Up to 90 mins on-site time',
            },
            {
                name: 'Pre-Purchase Digital Health Check',
                slug: 'pre-purchase-health-check',
                zoneA: 160,
                zoneB: 175,
                zoneC: 190,
                included: 'Up to 75 mins on-site time',
            },
        ],
        addOns: [
            { name: 'Follow-on labour (after included on-site time)', price: '£85/hour, billed in 15-min increments' },
            { name: 'Coding / adaptations / initialisation', price: 'from £45' },
            { name: 'Priority dispatch upgrade (when available)', price: '+£50 (Zone A/B) / +£70 (Zone C)' },
            { name: 'Early-bird / evening time band', price: '+£20 (starts before 8 AM or after 7 PM)' },
            { name: 'Late call (9 PM start)', price: '+£40 (diagnostics-only)' },
            { name: 'Parts collection run', price: 'from £20' },
        ],
        deposits: [
            { zone: 'Zone A / B', amount: '£30' },
            { zone: 'Zone C / VOR', amount: '£50' },
        ],
    },

    defaultSeo: {
        titleTemplate: '%s | TriPoint Diagnostics',
        defaultTitle: 'TriPoint Diagnostics - Mobile Vehicle Diagnostics & Repairs | Kent & SE London',
        description:
            'Dealer-level mobile diagnostics and compliant repairs for vans and cars across Kent and South East London. Compliance-first, no guesswork.',
        canonical: 'https://tripointdiagnostics.co.uk',
        openGraph: {
            type: 'website',
            locale: 'en_GB',
            siteName: 'TriPoint Diagnostics',
        },
    },
} as const;

export type SiteConfig = typeof siteConfig;
