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
    const fullTitle = title
        ? siteConfig.defaultSeo.titleTemplate.replace('%s', title)
        : siteConfig.defaultSeo.defaultTitle;

    const canonicalUrl = canonical
        ? `${siteConfig.url}${canonical}`
        : undefined;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
            {noIndex && <meta name="robots" content="noindex,nofollow" />}

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={siteConfig.defaultSeo.openGraph.type} />
            <meta property="og:locale" content={siteConfig.defaultSeo.openGraph.locale} />
            <meta property="og:site_name" content={siteConfig.defaultSeo.openGraph.siteName} />
            {ogImage && <meta property="og:image" content={ogImage} />}
            {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
        </Helmet>
    );
}
