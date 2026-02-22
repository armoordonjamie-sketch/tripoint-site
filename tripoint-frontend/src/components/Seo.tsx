import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { siteConfig } from '@/config/site';

interface SeoProps {
    title?: string;
    description?: string;
    canonical?: string;
    ogImage?: string;
    noIndex?: boolean;
}

export function Seo({
    title,
    description = siteConfig.defaultSeo.description,
    canonical,
    ogImage,
    noIndex = false,
}: SeoProps) {
    const { pathname } = useLocation();
    const fullTitle = title
        ? siteConfig.defaultSeo.titleTemplate.replace('%s', title)
        : siteConfig.defaultSeo.defaultTitle;

    const canonicalUrl = canonical
        ? `${siteConfig.url}${canonical.startsWith('/') ? canonical : `/${canonical}`}`
        : undefined;

    const imageUrl = ogImage
        ? (ogImage.startsWith('http') ? ogImage : `${siteConfig.url}${ogImage}`)
        : `${siteConfig.url}/og-default.jpg`;

    return (
        <Helmet htmlAttributes={{ lang: 'en-GB' }}>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
            {!noIndex && (
                <meta name="robots" content="index, follow, max-image-preview:large" />
            )}
            {noIndex && <meta name="robots" content="noindex,nofollow" />}

            {/* hreflang - only when we have canonical */}
            {canonicalUrl && (
                <>
                    <link rel="alternate" hrefLang="en-GB" href={canonicalUrl} />
                    <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
                </>
            )}

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={siteConfig.defaultSeo.openGraph.type} />
            <meta property="og:locale" content={siteConfig.defaultSeo.openGraph.locale} />
            <meta property="og:site_name" content={siteConfig.defaultSeo.openGraph.siteName} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={`${siteConfig.brandName} - ${siteConfig.tagline}`} />
            <meta property="og:url" content={canonicalUrl ?? `${siteConfig.url}${pathname}`} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />
        </Helmet>
    );
}
