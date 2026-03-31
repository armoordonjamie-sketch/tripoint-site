/**
 * Renders <picture> with WebP + responsive srcset where available, JPG fallback.
 * Uses /images/optimized/ output from npm run optimize-images.
 */

const RESPONSIVE_BASES = new Set([
    'work-48', 'work-03', 'work-46', 'sprinter-specialist', 'cta-bg', 'coverage-map',
    'diagnostic-callout', 'pre-purchase', 'vor-triage',
]);

function getOptimizedPaths(src: string): { webp: string; webpSrcset?: string; jpg: string } {
    const match = src.match(/\/images\/(.+)\.(jpg|jpeg|png)$/i);
    if (!match) return { webp: src, jpg: src };
    const base = match[1].replace(/\\/g, '/');
    const parts = base.split('/');
    const name = parts.pop()!;
    const dir = parts.length ? parts.join('/') + '/' : '';
    const prefix = `/images/optimized/${dir}`;

    if (RESPONSIVE_BASES.has(name)) {
        return {
            webp: `${prefix}${name}-1536.webp`,
            webpSrcset: `${prefix}${name}-480.webp 480w, ${prefix}${name}-640.webp 640w, ${prefix}${name}-1024.webp 1024w, ${prefix}${name}-1536.webp 1536w`,
            jpg: `${prefix}${name}-1536.jpg`,
        };
    }
    return {
        webp: `${prefix}${name}.webp`,
        jpg: `${prefix}${name}.jpg`,
    };
}

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    /** Use for LCP hero - adds fetchpriority="high", loading="eager" */
    priority?: boolean;
}

/** Use raw public URLs - no /images/optimized/ mirror (avoids 404 if optimize-images not run on host). */
function useOriginalAsset(src: string): boolean {
    return (
        src.startsWith('/images/new-images/') ||
        src.startsWith('/images/services/') ||
        src.startsWith('/images/sample-report/')
    );
}

export function OptimizedImage({ src, priority, alt = '', className, style, ...rest }: OptimizedImageProps) {
    if (useOriginalAsset(src)) {
        return (
            <img
                src={src}
                alt={alt}
                className={className}
                style={style}
                loading={priority ? ('eager' as const) : ('lazy' as const)}
                fetchPriority={priority ? ('high' as const) : undefined}
                {...rest}
            />
        );
    }

    const { webp, webpSrcset, jpg } = getOptimizedPaths(src);

    const imgProps = {
        alt,
        className,
        style,
        loading: priority ? ('eager' as const) : ('lazy' as const),
        fetchPriority: priority ? ('high' as const) : undefined,
        ...rest,
    };

    if (webpSrcset) {
        return (
            <picture className={className}>
                <source type="image/webp" srcSet={webpSrcset} sizes="(max-width: 640px) 100vw, 1024px" />
                <img src={jpg} {...imgProps} />
            </picture>
        );
    }

    return (
        <picture className={className}>
            <source type="image/webp" srcSet={webp} />
            <img src={jpg} {...imgProps} />
        </picture>
    );
}
