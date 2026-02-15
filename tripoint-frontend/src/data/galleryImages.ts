/**
 * Gallery images data - all from the user's own photos of real TriPoint work.
 * Each image is categorised for use in different pages / sections.
 */

export interface GalleryImage {
    src: string;
    alt: string;
    category: string[];
    orientation: 'landscape' | 'portrait';
}

export const galleryImages: GalleryImage[] = [
    { src: '/images/gallery/work-01.jpg', alt: 'Mercedes OM651 diesel engine removed and on floor jack', category: ['engine-bay', 'sprinter'], orientation: 'landscape' },
    { src: '/images/gallery/work-02.jpg', alt: 'Dual overhead camshafts and timing gears exposed during engine strip', category: ['engine-bay', 'sprinter'], orientation: 'portrait' },
    { src: '/images/gallery/work-03.jpg', alt: 'Sprinter engine bay inspection with Milwaukee impact driver and inspection light', category: ['engine-bay', 'diagnostics'], orientation: 'portrait' },
    { src: '/images/gallery/work-04.jpg', alt: 'Mercedes IC5 control unit with Sprinter W907 part numbers', category: ['electrical', 'sprinter'], orientation: 'portrait' },
    { src: '/images/gallery/work-05.jpg', alt: 'Damaged wiring loom in Sprinter engine bay with frayed cables', category: ['damage-faults', 'electrical'], orientation: 'portrait' },
    { src: '/images/gallery/work-06.jpg', alt: 'Sprinter interior stripped to firewall showing exposed wiring and ECU', category: ['electrical', 'sprinter'], orientation: 'portrait' },
    { src: '/images/gallery/work-07.jpg', alt: 'Damaged multi-pin connector with broken wire from Sprinter harness', category: ['damage-faults', 'electrical'], orientation: 'portrait' },
    { src: '/images/gallery/work-08.jpg', alt: 'Frayed wiring harness with severed wires from vehicle chassis', category: ['damage-faults', 'electrical'], orientation: 'portrait' },
    { src: '/images/gallery/work-09.jpg', alt: 'Undercarriage engine oil pan with scuffing damage', category: ['engine-bay', 'damage-faults'], orientation: 'portrait' },
    { src: '/images/gallery/work-10.jpg', alt: 'Vacuum gauge testing on Mercedes engine bay', category: ['diagnostics', 'tools'], orientation: 'portrait' },
    { src: '/images/gallery/work-11.jpg', alt: 'Scuffed wing mirror on white Mercedes Sprinter with shattered indicator', category: ['damage-faults', 'exterior', 'sprinter'], orientation: 'portrait' },
    { src: '/images/gallery/work-12.jpg', alt: 'Internal door mirror motor housing with corroded wiring', category: ['damage-faults', 'electrical'], orientation: 'portrait' },
    { src: '/images/gallery/work-13.jpg', alt: 'Worn brake caliper with torn dust boot and rusty pistons', category: ['brakes', 'damage-faults'], orientation: 'portrait' },
    { src: '/images/gallery/work-14.jpg', alt: 'Sooty exhaust tailpipe showing carbon deposits for emissions check', category: ['emissions'], orientation: 'portrait' },
    { src: '/images/gallery/work-15.jpg', alt: 'Under-chassis view of driveshaft exhaust and fuel tank', category: ['engine-bay', 'brakes'], orientation: 'portrait' },
    { src: '/images/gallery/work-16.jpg', alt: 'Mercedes vernier caliper measuring worn brake disc at 15.6mm', category: ['brakes', 'tools'], orientation: 'portrait' },
    { src: '/images/gallery/work-17.jpg', alt: 'Seized corroded slide pin removed from brake assembly', category: ['brakes', 'damage-faults'], orientation: 'portrait' },
    { src: '/images/gallery/work-18.jpg', alt: 'Mercedes fuel pressure regulator removed from engine bay', category: ['engine-bay', 'sprinter'], orientation: 'portrait' },
    { src: '/images/gallery/work-19.jpg', alt: 'OM651 fuel injector with Mercedes part number A6510703087', category: ['engine-bay', 'sprinter'], orientation: 'portrait' },
    { src: '/images/gallery/work-20.jpg', alt: 'Oily intake sensor showing carbon build-up in engine bay', category: ['engine-bay', 'emissions'], orientation: 'portrait' },
    { src: '/images/gallery/work-21.jpg', alt: 'Damaged engine air filter with torn seal and warped media', category: ['engine-bay', 'damage-faults'], orientation: 'portrait' },
    { src: '/images/gallery/work-22.jpg', alt: 'Damaged turbocharger with sheared metal inside housing', category: ['engine-bay', 'damage-faults'], orientation: 'portrait' },
    { src: '/images/gallery/work-23.jpg', alt: 'Sprinter engine bay with leak detection foam on components', category: ['engine-bay', 'diagnostics', 'sprinter'], orientation: 'landscape' },
    { src: '/images/gallery/work-24.jpg', alt: 'Sprinter 4-cylinder engine block with new head gasket during rebuild', category: ['engine-bay', 'sprinter'], orientation: 'portrait' },
    { src: '/images/gallery/work-25.jpg', alt: 'Stanley borescope showing internal component inspection on screen', category: ['diagnostics', 'tools'], orientation: 'portrait' },
    { src: '/images/gallery/work-26.jpg', alt: 'Fouled EGR pipe with thick carbon soot on white Sprinter', category: ['emissions', 'sprinter'], orientation: 'portrait' },
    { src: '/images/gallery/work-27.jpg', alt: 'Soot-covered NOx sensor probe removed from engine', category: ['emissions', 'engine-bay'], orientation: 'portrait' },
    { src: '/images/gallery/work-28.jpg', alt: 'Exposed valve train and rocker arms in open engine bay', category: ['engine-bay'], orientation: 'portrait' },
    { src: '/images/gallery/work-29.jpg', alt: 'Sprinter battery and fuse compartment with heavy-duty power cables', category: ['electrical', 'sprinter'], orientation: 'portrait' },
    { src: '/images/gallery/work-30.jpg', alt: 'MBUX screen showing vehicle breakdown alert on Sprinter', category: ['dashboard', 'diagnostics', 'sprinter'], orientation: 'landscape' },
    { src: '/images/gallery/work-31.jpg', alt: 'Sprinter instrument cluster with multiple warning lights active', category: ['dashboard', 'sprinter'], orientation: 'landscape' },
    { src: '/images/gallery/work-32.jpg', alt: 'Continental control module and circuit board from Sprinter', category: ['electrical', 'sprinter'], orientation: 'portrait' },
    { src: '/images/gallery/work-33.jpg', alt: 'Corroded sensor pins with moisture damage in connector', category: ['damage-faults', 'electrical'], orientation: 'portrait' },
    { src: '/images/gallery/work-34.jpg', alt: 'Scored exhaust pipe showing internal turbo wear', category: ['emissions', 'damage-faults'], orientation: 'portrait' },
    { src: '/images/gallery/work-35.jpg', alt: 'Carbon-clogged MAP sensor from Sprinter engine bay', category: ['emissions', 'engine-bay', 'sprinter'], orientation: 'portrait' },
    { src: '/images/gallery/work-36.jpg', alt: 'Mercedes harness plug with red weather seal under vehicle', category: ['electrical', 'sprinter'], orientation: 'portrait' },
    { src: '/images/gallery/work-37.jpg', alt: 'OM654 engine component with Mercedes part number and oil residue', category: ['engine-bay', 'sprinter'], orientation: 'portrait' },
    { src: '/images/gallery/work-38.jpg', alt: 'Rear main seal area with oil leak visible after flywheel removal', category: ['engine-bay', 'damage-faults'], orientation: 'portrait' },
    { src: '/images/gallery/work-39.jpg', alt: 'Mercedes fuse box and relay panel with coloured blade fuses', category: ['electrical', 'sprinter'], orientation: 'landscape' },
    { src: '/images/gallery/work-40.jpg', alt: 'Open rear differential showing ring gear and carrier assembly', category: ['brakes', 'sprinter'], orientation: 'portrait' },
    { src: '/images/gallery/work-41.jpg', alt: 'UNI-T clamp multimeter measuring parasitic draw on Mercedes door sill', category: ['diagnostics', 'tools', 'sprinter'], orientation: 'portrait' },
    { src: '/images/gallery/work-42.jpg', alt: 'UNI-T multimeter and oscilloscope showing 13.65V battery test', category: ['diagnostics', 'tools'], orientation: 'portrait' },
    { src: '/images/gallery/work-43.jpg', alt: 'Garrett turbocharger removed showing soot build-up inside housing', category: ['engine-bay', 'emissions'], orientation: 'landscape' },
    { src: '/images/gallery/work-44.jpg', alt: 'Removed intake manifold and throttle body with carbon deposits on workshop floor', category: ['engine-bay', 'emissions'], orientation: 'landscape' },
    { src: '/images/gallery/work-45.jpg', alt: 'Diesel engine intake manifold and fuel rail area soiled with oil', category: ['engine-bay'], orientation: 'landscape' },
    { src: '/images/gallery/work-46.jpg', alt: 'Sprinter engine bay lit by DeWalt work light during injector repair', category: ['engine-bay', 'tools', 'sprinter'], orientation: 'portrait' },
    { src: '/images/gallery/work-47.jpg', alt: 'Sprinter internal fuse box with Hella relays and aftermarket wiring', category: ['electrical', 'sprinter'], orientation: 'landscape' },
    { src: '/images/gallery/work-48.jpg', alt: 'Teslong borescope inspecting Sprinter engine bay with Milwaukee tools', category: ['diagnostics', 'tools', 'sprinter'], orientation: 'portrait' },
    { src: '/images/gallery/work-49.jpg', alt: 'Owon oscilloscope measuring 2.685V in Sprinter footwell', category: ['diagnostics', 'tools', 'sprinter'], orientation: 'portrait' },
    { src: '/images/gallery/work-50.jpg', alt: 'Mercedes ECU with A447 part number and wiring harnesses in dashboard', category: ['electrical', 'sprinter'], orientation: 'landscape' },
];

/** Filter images by category */
export function getImagesByCategory(cat: string): GalleryImage[] {
    return galleryImages.filter((img) => img.category.includes(cat));
}

/** Get a subset of images (random-ish) for a section */
export function getImagesForSection(categories: string[], count: number): GalleryImage[] {
    const matches = galleryImages.filter((img) =>
        categories.some((cat) => img.category.includes(cat))
    );
    // Prefer landscape images first for better grid display, then fill with portrait
    const landscape = matches.filter((img) => img.orientation === 'landscape');
    const portrait = matches.filter((img) => img.orientation === 'portrait');
    return [...landscape, ...portrait].slice(0, count);
}
