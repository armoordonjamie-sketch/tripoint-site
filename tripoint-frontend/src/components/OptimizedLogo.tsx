/**
 * Logo with WebP + PNG fallback, explicit dimensions for CLS.
 * Uses /optimized/ output from npm run optimize-images.
 */

interface OptimizedLogoProps {
    /** e.g. "logo-no-text-light" or "logo-light" */
    name: string;
    alt: string;
    className?: string;
}

const LOGO_DIMS: Record<string, { w: number; h: number }> = {
    'logo-no-text-light': { w: 59, h: 56 }, // 413:390, h-14=56px
    'logo-light': { w: 56, h: 56 }, // square, h-14=56px
};

export function OptimizedLogo({ name, alt, className }: OptimizedLogoProps) {
    const dims = LOGO_DIMS[name] ?? { w: 104, h: 98 };
    const webp = `/optimized/${name}.webp`;
    const png = `/${name}.png`;

    return (
        <picture>
            <source type="image/webp" srcSet={webp} />
            <img
                src={png}
                alt={alt}
                width={dims.w}
                height={dims.h}
                className={className}
                loading="eager"
            />
        </picture>
    );
}
