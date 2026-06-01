/**
 * Brand/model van remap landing pages (data-driven).
 * Rendered by src/pages/services/ModelRemapPage.tsx.
 * Add a new model here + a route in App.tsx + an entry in routes.ts to publish it.
 */

export interface RemapModelFaq {
    question: string;
    answer: string;
}

export interface RemapModel {
    slug: string; // e.g. 'transit-custom-remap'
    brand: string; // 'Ford'
    model: string; // 'Transit Custom'
    fullName: string; // 'Ford Transit Custom'
    seoTitle: string;
    seoDescription: string;
    heroSub: string;
    /** Short engine/coverage note shown under the intro. Verify before quoting specifics. */
    engines: string;
    intro: string;
    gains: string[];
    faqs: RemapModelFaq[];
}

export const REMAP_PRICE_FROM = 199;

export const remapModels: Record<string, RemapModel> = {
    'transit-custom-remap': {
        slug: 'transit-custom-remap',
        brand: 'Ford',
        model: 'Transit Custom',
        fullName: 'Ford Transit Custom',
        seoTitle: 'Ford Transit Custom Remap - Mobile, Kent & SE London',
        seoDescription:
            'Mobile Ford Transit Custom remap (Stage 1): more usable power and driveability, or better economy. Diagnostic pre-check, fully reversible, insurance note. From £199 + VAT.',
        heroSub: '2.0 EcoBlue & 2.2 TDCi · Stage 1 · Mobile - we come to you',
        engines:
            'Covers the common 2.0 EcoBlue (and earlier 2.2 TDCi) Transit Custom across the trim range. Send your reg to confirm your exact engine.',
        intro:
            "The Ford Transit Custom is one of the UK's most-tuned vans, and for good reason. A properly written Stage 1 remap sharpens throttle response, adds usable mid-range torque for loaded and towing work, and can smooth out economy on motorway runs. We tune it mobile, at your home, yard or depot, after a full diagnostic pre-check, and back up your original file so it is fully reversible.",
        gains: [
            'Stronger low-end pull for loaded and stop-start trade work',
            'Sharper throttle response and less turbo lag off the line',
            'Smoother motorway cruising and potential economy gains',
            'Less gear hunting on inclines (automatic)',
            'Calibrated within safe engine and gearbox limits',
        ],
        faqs: [
            { question: 'Is this a Stage 1 remap?', answer: 'Yes. It is a Stage 1 ECU calibration tuned for real-world van use - usable power and driveability, or economy. We stay within safe limits and never chase extreme dyno numbers.' },
            { question: 'Will it still pass the MOT?', answer: 'Yes. We keep the DPF, EGR and emissions equipment intact - we do not do deletes. A compliant remap passes the MOT like a standard van.' },
            { question: 'Power or economy - which should I choose?', answer: 'Loaded, towing or stop-start work suits a power and driveability map. Mostly motorway/high-mileage suits an economy map. Tell us how you use the van and we will advise.' },
            { question: 'Is it reversible and do I tell my insurer?', answer: 'We back up your original file so it is fully reversible. A remap is a modification, so you must declare it to your insurer - we provide a written handover note for your records.' },
        ],
    },
    'vw-transporter-remap': {
        slug: 'vw-transporter-remap',
        brand: 'VW',
        model: 'Transporter',
        fullName: 'VW Transporter',
        seoTitle: 'VW Transporter Remap (T5 / T6) - Mobile, Kent & SE London',
        seoDescription:
            'Mobile VW Transporter remap (Stage 1) for T5, T6 and T6.1 2.0 TDI: more usable power and driveability, or better economy. Reversible, insurance note. From £199 + VAT.',
        heroSub: '2.0 TDI · T5 / T6 / T6.1 · Stage 1 · Mobile',
        engines:
            'Covers the 2.0 TDI Transporter across T5, T6 and T6.1 trims. Send your reg to confirm your exact engine and power output.',
        intro:
            'VW sells the 2.0 TDI Transporter in several power outputs that share much of the same hardware, with the difference set largely in the ECU software. A Stage 1 remap safely brings that built-in headroom into usable torque - cleaner pull-away, stronger mid-range for loaded and camper use, and smoother cruising. We tune it mobile after a full diagnostic pre-check, with your original file backed up and fully reversible.',
        gains: [
            'Unlocks usable torque the engine already had headroom for',
            'Stronger pull for loaded, camper and towing use',
            'Sharper throttle and reduced turbo lag',
            'Smoother DSG shifts and less gear hunting',
            'Tuned within safe engine and gearbox limits',
        ],
        faqs: [
            { question: 'Why does a remap add so much on the 2.0 TDI?', answer: 'Because VW separates several trim power levels mostly in software on shared hardware. A Stage 1 remap brings that built-in headroom into usable, everyday torque - safely, and without touching emissions equipment.' },
            { question: 'Will it pass the MOT?', answer: 'Yes. We keep the DPF, EGR and AdBlue/SCR intact - no deletes. A compliant remap passes the MOT like a standard van.' },
            { question: 'Do you cover T5, T6 and T6.1?', answer: 'Yes, the 2.0 TDI across those generations. Send your reg and we will confirm coverage for your exact model.' },
            { question: 'Is it reversible and do I tell my insurer?', answer: 'Your original file is backed up and fully reversible. Declare the remap to your insurer - we provide a written handover note for your records.' },
        ],
    },
    'vw-caddy-remap': {
        slug: 'vw-caddy-remap',
        brand: 'VW',
        model: 'Caddy',
        fullName: 'VW Caddy',
        seoTitle: 'VW Caddy Remap - Mobile Stage 1, Kent & SE London',
        seoDescription:
            'Mobile VW Caddy remap (Stage 1) for the 2.0 TDI: unlock usable power and driveability, or better economy. Diagnostic pre-check, reversible, insurance note. From £199 + VAT.',
        heroSub: '2.0 TDI · Stage 1 · Mobile - we come to you',
        engines:
            'Covers the 2.0 TDI Caddy across the trim range. Send your reg to confirm your exact engine and power output.',
        intro:
            "The VW Caddy's 2.0 TDI is sold at several factory power levels that share much of the same hardware - the difference is largely in the ECU software. A Stage 1 remap brings that built-in headroom into usable, everyday torque, so a loaded Caddy pulls cleanly instead of feeling flat. We tune it mobile after a diagnostic pre-check, with the original file backed up and fully reversible.",
        gains: [
            'Unlocks usable power held back in the factory software',
            'Cleaner pull-away and stronger mid-range when loaded',
            'Sharper throttle response, less hesitation',
            'Smoother cruising and potential economy gains',
            'Calibrated within safe engine limits',
        ],
        faqs: [
            { question: 'How much power does a Caddy remap add?', answer: 'It varies by engine and exact variant, and we never quote a guaranteed figure. What you get is a noticeably stronger, smoother van - the 2.0 TDI usually has real headroom held back in software.' },
            { question: 'Will it pass the MOT?', answer: 'Yes. We keep the DPF, EGR and emissions equipment intact - no deletes. A compliant remap passes the MOT like a standard van.' },
            { question: 'Is it safe for the engine?', answer: 'Every tune starts with a diagnostic pre-check - we will not tune a van with existing faults. The calibration stays within safe parameters. We are mechanics first, tuners second.' },
            { question: 'Is it reversible and do I tell my insurer?', answer: 'Your original file is backed up and fully reversible. Declare the remap to your insurer - we provide a written handover note for your records.' },
        ],
    },
    'ford-transit-remap': {
        slug: 'ford-transit-remap',
        brand: 'Ford',
        model: 'Transit',
        fullName: 'Ford Transit',
        seoTitle: 'Ford Transit Remap - Mobile Stage 1, Kent & SE London',
        seoDescription:
            'Mobile Ford Transit remap (Stage 1) for the 2.0 EcoBlue and 2.2/2.4 TDCi: more usable power and driveability, or better economy. Reversible, insurance note. From £199 + VAT.',
        heroSub: '2.0 EcoBlue & 2.2/2.4 TDCi · Stage 1 · Mobile',
        engines:
            'For the full-size Ford Transit - 2.0 EcoBlue and earlier 2.2/2.4 TDCi. Driving the smaller Transit Custom? See our Transit Custom remap. Send your reg to confirm.',
        intro:
            'The full-size Ford Transit earns its keep hauling heavy loads, and the factory map is a broad compromise. A Stage 1 remap adds usable mid-range torque for loaded and towing work, sharpens throttle response, and can smooth out economy on long runs. We tune it mobile after a full diagnostic pre-check, with your original file backed up and fully reversible.',
        gains: [
            'Stronger low- and mid-range pull for heavy loads',
            'Easier towing and motorway merging',
            'Sharper throttle response, less turbo lag',
            'Smoother cruising and potential economy gains',
            'Calibrated within safe engine and gearbox limits',
        ],
        faqs: [
            { question: 'Is this for the big Transit or the Transit Custom?', answer: 'This page is for the full-size Ford Transit. For the smaller, more common Transit Custom, see our Transit Custom remap - same process, model-specific map.' },
            { question: 'Will it pass the MOT?', answer: 'Yes. We keep the DPF, EGR and emissions equipment intact - no deletes. A compliant remap passes the MOT like a standard van.' },
            { question: 'Power or economy - which should I choose?', answer: 'Heavy loads and towing suit a power and driveability map; high-mileage motorway work suits an economy map. Tell us how you use it and we will advise.' },
            { question: 'Is it reversible and do I tell my insurer?', answer: 'Your original file is backed up and fully reversible. Declare the remap to your insurer - we provide a written handover note for your records.' },
        ],
    },
    'vauxhall-vivaro-remap': {
        slug: 'vauxhall-vivaro-remap',
        brand: 'Vauxhall',
        model: 'Vivaro',
        fullName: 'Vauxhall Vivaro',
        seoTitle: 'Vauxhall Vivaro Remap - Mobile Stage 1, Kent & SE London',
        seoDescription:
            'Mobile Vauxhall Vivaro remap (Stage 1): more usable power and driveability, or better economy. Diagnostic pre-check, fully reversible, insurance note. From £199 + VAT.',
        heroSub: '1.6 CDTi & 1.5/2.0 diesel · Stage 1 · Mobile',
        engines:
            'Covers the Vivaro across generations - the Renault-platform 1.6 CDTi and the current 1.5/2.0 diesel (shared with the Renault Trafic). Send your reg to confirm.',
        intro:
            'The Vauxhall Vivaro is a trade-van staple, and the stock map leaves usable torque on the table. A Stage 1 remap gives cleaner pull-away, stronger mid-range for loaded work, and the option of an economy focus for high-mileage drivers. We tune it mobile after a diagnostic pre-check, original file backed up and fully reversible.',
        gains: [
            'Cleaner pull-away and stronger mid-range when loaded',
            'Sharper throttle response, less hesitation',
            'Smoother cruising and potential economy gains',
            'Reduced gear hunting on inclines',
            'Tuned within safe engine limits',
        ],
        faqs: [
            { question: 'Which Vivaro engines do you remap?', answer: 'The Renault-era 1.6 CDTi and the current 1.5/2.0 diesel. Send your reg and we will confirm coverage for your exact model and engine.' },
            { question: 'Will it pass the MOT?', answer: 'Yes. We keep the DPF, EGR and emissions equipment intact - no deletes. A compliant remap passes the MOT like a standard van.' },
            { question: 'Power or economy - which should I choose?', answer: 'Loaded, stop-start trade work suits a power and driveability map; high-mileage runs suit an economy map. Tell us how you use the van and we will advise.' },
            { question: 'Is it reversible and do I tell my insurer?', answer: 'Your original file is backed up and fully reversible. Declare the remap to your insurer - we provide a written handover note for your records.' },
        ],
    },
    'mercedes-sprinter-remap': {
        slug: 'mercedes-sprinter-remap',
        brand: 'Mercedes',
        model: 'Sprinter',
        fullName: 'Mercedes Sprinter',
        seoTitle: 'Mercedes Sprinter Remap - Mobile Stage 1, Kent & SE London',
        seoDescription:
            'Mobile Mercedes Sprinter remap (Stage 1) for OM651 and OM654 (W906/W907): more usable power and driveability, or better economy. Diagnostic-first, reversible. From £199 + VAT.',
        heroSub: 'OM651 & OM654 · W906 / W907 · Stage 1 · Mobile',
        engines:
            'Covers the Sprinter W906 and W907 - OM651 and OM654 diesel. Mercedes vans are our core specialism. Send your reg to confirm your exact engine.',
        intro:
            "The Mercedes Sprinter is the UK's workhorse van, and it is our core specialism. A Stage 1 remap adds usable torque for loaded and towing work, sharpens throttle response, and can smooth motorway economy - all calibrated after a full dealer-level diagnostic pre-check, with your original file backed up and fully reversible. We are Mercedes van specialists first, tuners second.",
        gains: [
            'Stronger loaded and towing pull',
            'Sharper throttle and reduced turbo lag',
            'Smoother motorway cruising and potential economy gains',
            'Diagnostic-first: we tune only a healthy engine',
            'Calibrated within safe OM651 / OM654 limits',
        ],
        faqs: [
            { question: 'Are you actually Mercedes specialists?', answer: 'Yes - Mercedes vans are our core specialism, with dealer-level Xentry/STAR tooling. Every remap starts with a proper diagnostic pre-check, so we tune only a healthy engine.' },
            { question: 'Will it pass the MOT and keep AdBlue working?', answer: 'Yes. We keep the DPF, EGR and AdBlue/SCR intact - no deletes. Everything stays road-legal and MOT-compliant.' },
            { question: 'Power or economy - which should I choose?', answer: 'Loaded and towing work suits a power and driveability map; high-mileage motorway work suits an economy map. Tell us how you use it and we will advise.' },
            { question: 'Is it reversible and do I tell my insurer?', answer: 'Your original file is backed up and fully reversible. Declare the remap to your insurer - we provide a written handover note for your records.' },
        ],
    },
    'mercedes-vito-remap': {
        slug: 'mercedes-vito-remap',
        brand: 'Mercedes',
        model: 'Vito',
        fullName: 'Mercedes Vito',
        seoTitle: 'Mercedes Vito Remap - Mobile Stage 1, Kent & SE London',
        seoDescription:
            'Mobile Mercedes Vito remap (Stage 1) for OM651 and OM654 (W447): more usable power and driveability, or better economy. Diagnostic-first, reversible. From £199 + VAT.',
        heroSub: 'OM651 & OM654 · W447 · Stage 1 · Mobile',
        engines:
            'Covers the Vito W447 (and earlier W639) - OM651 and OM654 diesel. Mercedes vans are our core specialism. Send your reg to confirm your exact engine.',
        intro:
            'The Mercedes Vito works hard as a panel van, crew cab and taxi, and the stock map is a broad compromise. A Stage 1 remap adds usable torque and sharper response for loaded and stop-start work, or an economy focus for high-mileage drivers. Tuned after a dealer-level diagnostic pre-check, with your original file backed up and fully reversible.',
        gains: [
            'Stronger pull for loaded and stop-start work',
            'Sharper throttle response, less hesitation',
            'Smoother cruising and potential economy gains',
            'Diagnostic-first: we tune only a healthy engine',
            'Calibrated within safe OM651 / OM654 limits',
        ],
        faqs: [
            { question: 'Are you Mercedes specialists?', answer: 'Yes - Mercedes vans are our core specialism, with dealer-level Xentry/STAR tooling. Every remap starts with a diagnostic pre-check, so we tune only a healthy engine.' },
            { question: 'Will it pass the MOT and keep AdBlue working?', answer: 'Yes. We keep the DPF, EGR and AdBlue/SCR intact - no deletes. Everything stays road-legal and MOT-compliant.' },
            { question: 'Power or economy - which should I choose?', answer: 'Loaded and stop-start work suits a power and driveability map; high-mileage runs suit an economy map. Tell us how you use it and we will advise.' },
            { question: 'Is it reversible and do I tell my insurer?', answer: 'Your original file is backed up and fully reversible. Declare the remap to your insurer - we provide a written handover note for your records.' },
        ],
    },
};

export const remapModelList = Object.values(remapModels);
