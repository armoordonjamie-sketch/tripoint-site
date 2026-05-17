/**
 * Real-work photos taken on TriPoint diagnostic visits.
 * Source files live in /public/images/diag_photos/ (converted from HEIC).
 *
 * Captions are written to *sell the service* — show depth, tooling and
 * the kind of faults a code-reader / cowboy mechanic will miss.
 */
import type { GalleryImage } from '@/data/galleryImages';

export interface DiagPhoto extends GalleryImage {
    /** Short caption shown under proof-strip thumbnails */
    caption: string;
}

const base = '/images/diag_photos';

export const diagPhotos: DiagPhoto[] = [
    {
        src: `${base}/picoscope-multimeter.jpg`,
        alt: 'Picoscope and multimeter set up on a Mercedes for live signal capture during diagnosis',
        category: ['diagnostics', 'tools'],
        orientation: 'landscape',
        caption: 'Picoscope + multimeter on a Mercedes — we measure live signals, not guess at codes.',
    },
    {
        src: `${base}/smoke-leak-test.jpg`,
        alt: 'Smoke machine leak testing the intake on a Mercedes diesel during diagnosis',
        category: ['diagnostics', 'tools', 'emissions'],
        orientation: 'landscape',
        caption: 'Smoke testing the intake — visible proof of every boost leak.',
    },
    {
        src: `${base}/multimeter-exhaust-pulse.jpg`,
        alt: 'Multimeter probes inserted to measure exhaust pulse pressure on a Mercedes Sprinter',
        category: ['diagnostics', 'emissions', 'sprinter'],
        orientation: 'landscape',
        caption: 'Exhaust pulse pressure check — finds restricted DPFs a code reader misses.',
    },
    {
        src: `${base}/intake-manifold-blocked.jpg`,
        alt: 'Heavily carbon-blocked intake manifold removed during diagnosis on a Mercedes diesel',
        category: ['emissions', 'engine-bay', 'damage-faults'],
        orientation: 'landscape',
        caption: 'Carbon-blocked intake manifold — hidden cause of derate and poor running.',
    },
    {
        src: `${base}/multimeter-in-use.jpg`,
        alt: 'Multimeter probing a sensor circuit on a Mercedes engine bay during live testing',
        category: ['diagnostics', 'tools', 'electrical'],
        orientation: 'landscape',
        caption: 'Live circuit testing in the engine bay — sensor signals verified, not assumed.',
    },
    {
        src: `${base}/multimeter-voltage.jpg`,
        alt: 'Multimeter showing battery and circuit voltage during a parasitic drain test on a Mercedes',
        category: ['diagnostics', 'electrical'],
        orientation: 'landscape',
        caption: 'Parasitic drain test on a Mercedes — found the circuit killing the battery overnight.',
    },
    {
        src: `${base}/coilpacks-swap.jpg`,
        alt: 'Diagnostic coil-pack swap test to isolate a misfire on a Mercedes petrol engine',
        category: ['diagnostics', 'engine-bay'],
        orientation: 'portrait',
        caption: 'Coil-pack swap test to isolate a misfire — proves the failed cylinder.',
    },
    {
        src: `${base}/intercooler-crack.jpg`,
        alt: 'Hairline crack found in a Sprinter intercooler causing boost loss and power derate',
        category: ['damage-faults', 'sprinter', 'engine-bay'],
        orientation: 'portrait',
        caption: 'Hairline intercooler crack — root cause of boost loss and limp mode.',
    },
    {
        src: `${base}/egr-pipe-oil.jpg`,
        alt: 'Oil-contaminated EGR pipe pulled from a Mercedes diesel during emissions diagnosis',
        category: ['emissions', 'engine-bay'],
        orientation: 'portrait',
        caption: 'Oil-contaminated EGR pipe — classic Mercedes diesel emissions fault.',
    },
    {
        src: `${base}/corroded-connector.jpg`,
        alt: 'Corroded multi-pin connector traced as the cause of an intermittent CAN-bus fault on a Mercedes',
        category: ['damage-faults', 'electrical'],
        orientation: 'portrait',
        caption: 'Corroded multi-pin connector — root cause of an intermittent CAN-bus fault.',
    },
    {
        src: `${base}/sensor-sooted.jpg`,
        alt: 'Heavily sooted emissions sensor probe removed from a Mercedes diesel during live data review',
        category: ['emissions', 'damage-faults'],
        orientation: 'portrait',
        caption: 'Sooted emissions sensor — found via live data, not just a fault code.',
    },
    {
        src: `${base}/can-piggyback-device.jpg`,
        alt: 'Hidden CAN-bus piggyback device discovered during a fault investigation on a Sprinter',
        category: ['electrical', 'sprinter', 'damage-faults'],
        orientation: 'portrait',
        caption: 'Hidden CAN-bus piggyback device discovered during a no-start investigation.',
    },
    {
        src: `${base}/desoldered-ecu-chip.jpg`,
        alt: 'Desoldered chip from a Mercedes control unit board for module-level repair',
        category: ['electrical', 'tools'],
        orientation: 'portrait',
        caption: 'Module-level board repair — no need to throw a £1,000 ECU at the problem.',
    },
    {
        src: `${base}/ezs-circuit-board.jpg`,
        alt: 'Mercedes EZS (steering lock / ignition) circuit board open for inspection during a no-start diagnosis',
        category: ['electrical', 'damage-faults'],
        orientation: 'portrait',
        caption: 'EZS module open on the bench — diagnosed a no-start fault to the board level.',
    },
    {
        src: `${base}/air-filter-clogged.jpg`,
        alt: 'Heavily fouled air filter discovered during a poor-running fault diagnosis',
        category: ['engine-bay', 'damage-faults'],
        orientation: 'portrait',
        caption: 'Heavily fouled air filter — found during a poor-running diagnosis.',
    },
    {
        src: `${base}/sump-off-crank.jpg`,
        alt: 'Sump removed for crankshaft inspection following a noise diagnosis on a Sprinter',
        category: ['engine-bay', 'sprinter'],
        orientation: 'portrait',
        caption: 'Sump dropped for crank inspection after a bottom-end noise diagnosis.',
    },
];

const bySrc = new Map(diagPhotos.map((p) => [p.src.split('/').pop()!.replace('.jpg', ''), p]));

/** Pick a subset of diag photos by short key (filename without ext). */
export function pickDiagPhotos(keys: string[]): DiagPhoto[] {
    return keys.map((k) => {
        const p = bySrc.get(k);
        if (!p) throw new Error(`Unknown diag photo key: ${k}`);
        return p;
    });
}
