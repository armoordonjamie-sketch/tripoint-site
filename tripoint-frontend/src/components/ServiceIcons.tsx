import type { SVGProps } from 'react';

const base = {
    viewBox: '0 0 64 64',
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
};

/** Standard Diagnosis - Xentry-style laptop with live data, fault codes, waveform */
export function IconDiagnostics(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...base} {...props}>
            <rect x="8" y="16" width="36" height="24" rx="3" strokeWidth="2" />
            <path d="M12 22h28M12 28h20M12 34h14" strokeWidth="1.5" />
            <circle cx="48" cy="28" r="10" strokeWidth="2" />
            <path d="M48 22v6l4 4" strokeWidth="1.5" />
            <path d="M20 40l4-4 4 4 6-8" strokeWidth="1.2" opacity="0.8" />
        </svg>
    );
}

/** VOR Van Diagnostics - Van with hood up, diagnostic cable, hazard/triage */
export function IconVorDiagnostics(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...base} {...props}>
            <path d="M8 36h48v6a2 2 0 01-2 2H10a2 2 0 01-2-2v-6z" strokeWidth="2" />
            <path d="M8 36l3-14a3 3 0 013-2h38a3 3 0 013 2l3 14" strokeWidth="2" />
            <path d="M12 22v-4a2 2 0 012-2h36a2 2 0 012 2v4" strokeWidth="1.5" />
            <circle cx="16" cy="44" r="4" strokeWidth="2" />
            <circle cx="48" cy="44" r="4" strokeWidth="2" />
            <path d="M28 22v-8M36 22v-8" strokeWidth="1.5" />
            <circle cx="32" cy="14" r="3" fill="currentColor" opacity="0.5" stroke="none" />
            <path d="M20 28l8-4 8 4" strokeWidth="1.2" opacity="0.8" />
        </svg>
    );
}

/** Pre-Purchase Digital Health Check - Report document with van silhouette and checklist */
export function IconPrePurchase(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...base} {...props}>
            <path d="M14 8h28l8 12v32a2 2 0 01-2 2H8a2 2 0 01-2-2V10a2 2 0 012-2z" strokeWidth="2" />
            <path d="M42 8v12h8" strokeWidth="2" />
            <path d="M12 24h24M12 32h18M12 40h14" strokeWidth="1.2" />
            <path d="M44 28c0-4 4-8 4-8s4 4 4 8v12H44V28z" strokeWidth="1.5" opacity="0.7" />
            <path d="M48 36l-2 4-2-2-2 2" strokeWidth="1.2" />
            <circle cx="20" cy="24" r="2" fill="currentColor" stroke="none" opacity="0.6" />
        </svg>
    );
}

/** Mercedes Van Servicing - Oil can, filter cartridge, wrench, service stamp */
export function IconVanServicing(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...base} {...props}>
            <path d="M18 12v12l-4 8h12l-4-8V12" strokeWidth="2" />
            <path d="M18 12h8v6h-8z" strokeWidth="1.5" />
            <ellipse cx="22" cy="38" rx="6" ry="3" strokeWidth="1.5" />
            <path d="M38 18h12v8H38z" strokeWidth="1.5" />
            <path d="M42 26v12M38 32h8" strokeWidth="1.5" />
            <path d="M36 44h12a2 2 0 002-2v-4" strokeWidth="1.2" />
            <path d="M14 48h20a2 2 0 002-2v-2" strokeWidth="1.5" />
            <path d="M18 46v-4l4 2 4-2v4" strokeWidth="1.2" opacity="0.7" />
        </svg>
    );
}

/** Sprinter Servicing - W906/907 silhouette, engine bay, service elements */
export function IconSprinterServicing(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...base} {...props}>
            <path d="M6 38h52v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8z" strokeWidth="2" />
            <path d="M6 38l4-18a3 3 0 013-2h38a3 3 0 013 2l4 18" strokeWidth="2" />
            <path d="M10 20v-2a2 2 0 012-2h40a2 2 0 012 2v2" strokeWidth="1.5" />
            <circle cx="14" cy="48" r="4" strokeWidth="2" />
            <circle cx="50" cy="48" r="4" strokeWidth="2" />
            <rect x="18" y="22" width="28" height="14" rx="1" strokeWidth="1.5" opacity="0.8" />
            <path d="M24 28h4M24 32h6M24 36h4" strokeWidth="1" opacity="0.6" />
            <path d="M22 8l4 4-4 4" strokeWidth="1.5" />
        </svg>
    );
}

/** Vito Servicing - W447 medium van */
export function IconVitoServicing(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...base} {...props}>
            <path d="M10 36h44v6a2 2 0 01-2 2H12a2 2 0 01-2-2v-6z" strokeWidth="2" />
            <path d="M10 36l2-12a3 3 0 013-2h34a3 3 0 013 2l2 12" strokeWidth="2" />
            <path d="M14 24v-2a2 2 0 012-2h32a2 2 0 012 2v2" strokeWidth="1.5" />
            <circle cx="18" cy="44" r="4" strokeWidth="2" />
            <circle cx="46" cy="44" r="4" strokeWidth="2" />
            <path d="M26 24v-6M38 24v-6" strokeWidth="1.5" />
            <circle cx="32" cy="14" r="4" strokeWidth="1.5" />
            <path d="M20 30h24v4H20z" strokeWidth="1.2" opacity="0.7" />
        </svg>
    );
}

/** Citan Servicing - W415/420 compact van */
export function IconCitanServicing(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...base} {...props}>
            <path d="M14 38h36v6a2 2 0 01-2 2H16a2 2 0 01-2-2v-6z" strokeWidth="2" />
            <path d="M14 38l2-10a2 2 0 012-2h28a2 2 0 012 2l2 10" strokeWidth="2" />
            <path d="M18 28v-2a2 2 0 012-2h24a2 2 0 012 2v2" strokeWidth="1.5" />
            <circle cx="22" cy="46" r="4" strokeWidth="2" />
            <circle cx="42" cy="46" r="4" strokeWidth="2" />
            <path d="M28 28v-4M36 28v-4" strokeWidth="1.5" />
            <circle cx="32" cy="20" r="3" strokeWidth="1.5" />
            <path d="M22 32h20v3H22z" strokeWidth="1.2" opacity="0.7" />
        </svg>
    );
}

/** Sprinter Brakes - W906 ventilated disc, caliper, pad profile */
export function IconSprinterBrakes(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...base} {...props}>
            <circle cx="32" cy="32" r="18" strokeWidth="2" />
            <circle cx="32" cy="32" r="10" strokeWidth="1.5" />
            <path d="M14 32h4M46 32h4M32 14v4M32 46v4M17 17l2.8 2.8M44.2 44.2l2.8 2.8M17 47l2.8-2.8M44.2 19.8l2.8-2.8" strokeWidth="1.5" />
            <rect x="38" y="26" width="8" height="12" rx="2" strokeWidth="1.5" opacity="0.9" />
            <path d="M40 28v8M44 28v8" strokeWidth="1" opacity="0.6" />
        </svg>
    );
}

/** Vito Brakes - W447 brake assembly */
export function IconVitoBrakes(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...base} {...props}>
            <circle cx="32" cy="32" r="16" strokeWidth="2" />
            <circle cx="32" cy="32" r="8" strokeWidth="1.5" />
            <path d="M16 32h3M45 32h3M32 16v3M32 45v3M19 19l2 2M43 43l2 2M19 45l2-2M43 19l2-2" strokeWidth="1.2" />
            <rect x="36" y="28" width="6" height="8" rx="1" strokeWidth="1.5" />
        </svg>
    );
}

/** Citan Brakes - W415/420 compact brake */
export function IconCitanBrakes(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...base} {...props}>
            <circle cx="32" cy="32" r="14" strokeWidth="2" />
            <circle cx="32" cy="32" r="6" strokeWidth="1.5" />
            <path d="M18 32h2M44 32h2M32 18v2M32 44v2" strokeWidth="1.2" />
            <rect x="35" y="29" width="5" height="6" rx="1" strokeWidth="1.2" />
        </svg>
    );
}

/** Van Load & Driveability Tune - ECU chip, steep torque curve, throttle */
export function IconLoadTune(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...base} {...props}>
            <rect x="10" y="14" width="20" height="24" rx="2" strokeWidth="2" />
            <path d="M14 20h12M14 26h10M14 32h8" strokeWidth="1.2" />
            <path d="M8 48l6-20 8 12 10-8 14 16" strokeWidth="2" />
            <path d="M8 52h48" strokeWidth="1.5" />
            <path d="M44 20l4-4 4 4v8h-8V20z" strokeWidth="1.5" opacity="0.8" />
        </svg>
    );
}

/** Van Economy Tune - Fuel efficiency, smooth curve, mpg */
export function IconEconomyTune(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...base} {...props}>
            <ellipse cx="32" cy="28" rx="12" ry="14" strokeWidth="2" />
            <path d="M32 20v6M28 26h8" strokeWidth="1.5" />
            <path d="M12 48c8-12 12-8 20-4s16-4 20 4" strokeWidth="2" />
            <path d="M8 52h48" strokeWidth="1.5" />
            <path d="M14 42l4-2 4 4 6-6 8 4" strokeWidth="1.2" opacity="0.7" />
        </svg>
    );
}

/** Fleet Van Tuning - Three vans, depot, volume calibration */
export function IconFleetTune(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...base} {...props}>
            <path d="M6 40h14v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6z" strokeWidth="1.5" />
            <path d="M6 40l1-8a2 2 0 012-2h10a2 2 0 012 2l1 8" strokeWidth="1.5" />
            <path d="M24 40h14v6a2 2 0 01-2 2H26a2 2 0 01-2-2v-6z" strokeWidth="1.5" />
            <path d="M24 40l1-8a2 2 0 012-2h10a2 2 0 012 2l1 8" strokeWidth="1.5" />
            <path d="M42 40h14v6a2 2 0 01-2 2H44a2 2 0 01-2-2v-6z" strokeWidth="1.5" />
            <path d="M42 40l1-8a2 2 0 012-2h10a2 2 0 012 2l1 8" strokeWidth="1.5" />
            <circle cx="13" cy="48" r="3" strokeWidth="1.5" />
            <circle cx="31" cy="48" r="3" strokeWidth="1.5" />
            <circle cx="49" cy="48" r="3" strokeWidth="1.5" />
            <path d="M8 34v-4M18 34v-4M26 34v-4M38 34v-4M46 34v-4M56 34v-4" strokeWidth="1" opacity="0.6" />
            <path d="M30 12v6M34 12v6" strokeWidth="1.5" />
            <path d="M32 6a2 2 0 012 2v2" strokeWidth="1.2" />
        </svg>
    );
}
