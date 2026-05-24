/**
 * Renders <picture> with WebP + responsive srcset where available, JPG fallback.
 * Uses /images/optimized/ output from npm run optimize-images.
 */

const RESPONSIVE_BASES = new Set([
    'work-48', 'work-03', 'work-46', 'sprinter-specialist', 'cta-bg', 'coverage-map',
    'diagnostic-callout', 'pre-purchase', 'vor-triage',
    'hero-sprinter', 'hero-vito', 'hero-citan', 'hero-mercedes-parent',
]);

export function getOptimizedPaths(src: string): { webp: string; webpSrcset?: string; jpg: string } {
    const match = src.match(/\/images\/(.+)\.(jpg|jpeg|png)$/i);
    if (!match) return { webp: src, jpg: src };
    const base = match[1].replace(/\\/g, '/');
    const parts = base.split('/');
    const name = parts.pop()!;
    const dir = parts.length ? parts.join('/') + '/' : '';
    const prefix = `/images/optimized/${dir}`;
    
    const isResponsive = RESPONSIVE_BASES.has(name) || dir.startsWith('gallery/') || dir.startsWith('blog/') || dir.startsWith('sample-report/') || name === 'coverage-map';

    if (isResponsive) {
        return {
            webp: `${prefix}${name}-1536.webp`,
            webpSrcset: `${prefix}${name}-320.webp 320w, ${prefix}${name}-480.webp 480w, ${prefix}${name}-640.webp 640w, ${prefix}${name}-768.webp 768w, ${prefix}${name}-1024.webp 1024w, ${prefix}${name}-1536.webp 1536w`,
            jpg: `${prefix}${name}-1536.jpg`,
        };
    }
    return {
        webp: `${prefix}${name}.webp`,
        jpg: `${prefix}${name}.jpg`,
    };
}

function isFillLayout(className?: string): boolean {
    return Boolean(className?.includes('absolute') && className?.includes('inset-0'));
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
        src.startsWith('/images/servicing-work/') ||
        src.startsWith('/images/diag_photos/')
    );
}

export function OptimizedImage({ src, priority, alt = '', className, style, width, height, ...rest }: OptimizedImageProps) {
    const isEager = priority;
    const fetchPriority = priority ? ('high' as const) : undefined;
    
    if (useOriginalAsset(src)) {
        return (
            <img
                src={src}
                alt={alt}
                className={className}
                style={style}
                width={width}
                height={height}
                loading={isEager ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={fetchPriority}
                {...rest}
            />
        );
    }

    const { webp, webpSrcset, jpg } = getOptimizedPaths(src);
    const fill = isFillLayout(className);

    const imgProps = {
        alt,
        className: fill ? className : className,
        style,
        width,
        height,
        loading: isEager ? ('eager' as const) : ('lazy' as const),
        decoding: isEager ? ('sync' as const) : ('async' as const),
        fetchPriority,
        ...rest,
    };

    if (webpSrcset) {
        return (
            <picture className={fill ? 'absolute inset-0 block h-full w-full' : className}>
                <source
                    type="image/webp"
                    srcSet={webpSrcset}
                    sizes={fill ? '100vw' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
                />
                <img src={jpg} {...imgProps} />
            </picture>
        );
    }

    if (fill) {
        return (
            <picture className="absolute inset-0 block h-full w-full">
                <source type="image/webp" srcSet={webp} />
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
