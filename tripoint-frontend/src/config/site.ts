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
    },

    social: {
        facebook: '',
        instagram: '',
        google: 'https://share.google/VzrAGFshBV7ITb7s2',
    },

    baseLocations: [
        {
            label: 'Tonbridge Base',
            postcode: 'TN9 1PP',
            address: 'Use for distance checks',
        },
        {
            label: 'Eltham Base',
            postcode: 'SE9 4HA',
            address: 'Use for distance checks',
        },
    ],
    operatingHours: 'Mon to Sat: 6 AM to 10 PM',

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
                name: 'Standard Diagnosis',
                slug: 'diagnostic-callout',
                zoneA: 120,
                zoneB: 135,
                zoneC: 150,
                included: 'Up to 60 mins on-site time',
            },
            {
                name: 'VOR Diagnosis (Commercial)',
                slug: 'vor-van-diagnostics',
                zoneA: 160,
                zoneB: 175,
                zoneC: 190,
                included: 'Up to 75 mins on-site time',
            },
            {
                name: 'Pre-Purchase Digital Health Check',
                slug: 'pre-purchase-digital-health-check',
                zoneA: 160,
                zoneB: 175,
                zoneC: 190,
                included: 'Up to 75 mins on-site time',
            },
            // Mercedes Van Servicing
            {
                name: 'Mercedes Van Minor Service',
                slug: 'mercedes-van-minor-service',
                zoneA: 175,
                zoneB: 190,
                zoneC: 205,
                included: 'Full minor service at your location',
            },
            {
                name: 'Mercedes Van Major Service',
                slug: 'mercedes-van-major-service',
                zoneA: 295,
                zoneB: 310,
                zoneC: 325,
                included: 'Full major service at your location',
            },
            // Mercedes Van Brakes (per-model)
            {
                name: 'Sprinter Brakes',
                slug: 'sprinter-brakes',
                zoneA: 149,
                zoneB: 164,
                zoneC: 179,
                included: 'Mobile brake service — front pads from £149',
            },
            {
                name: 'Vito Brakes',
                slug: 'vito-brakes',
                zoneA: 169,
                zoneB: 184,
                zoneC: 199,
                included: 'Mobile brake service — front pads from £169',
            },
            {
                name: 'Citan Brakes',
                slug: 'citan-brakes',
                zoneA: 169,
                zoneB: 184,
                zoneC: 199,
                included: 'Mobile brake service — front pads from £169',
            },
            // Commercial Van Tuning
            {
                name: 'Van Load & Driveability Tune',
                slug: 'van-load-driveability-tune',
                zoneA: 199,
                zoneB: 214,
                zoneC: 229,
                included: 'Diagnostic pre-check + Stage 1 calibration',
            },
            {
                name: 'Van Economy Tune',
                slug: 'van-economy-tune',
                zoneA: 199,
                zoneB: 214,
                zoneC: 229,
                included: 'Diagnostic pre-check + economy calibration',
            },
            {
                name: 'Fleet Van Tuning',
                slug: 'fleet-van-tuning',
                zoneA: 199,
                zoneB: 214,
                zoneC: 229,
                included: 'Fleet-day tuning with diagnostic pre-check',
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
