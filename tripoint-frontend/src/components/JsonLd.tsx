import { siteConfig } from '@/config/site';

/* ── LocalBusiness (AutoRepair) schema ───────────────────────── */
export function LocalBusinessSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'AutoRepair',
        '@id': `${siteConfig.url}/#business`,
        name: siteConfig.brandName,
        description: siteConfig.description,
        url: siteConfig.url,
        telephone: siteConfig.contact.phoneE164,
        email: siteConfig.contact.email,
        areaServed: {
            '@type': 'GeoCircle',
            geoMidpoint: {
                '@type': 'GeoCoordinates',
                latitude: 51.32,
                longitude: 0.17,
            },
            geoRadius: '60000',
        },
        serviceArea: {
            '@type': 'GeoCircle',
            geoMidpoint: {
                '@type': 'GeoCoordinates',
                latitude: 51.32,
                longitude: 0.17,
            },
            geoRadius: '60000',
        },
        openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '06:00',
            closes: '22:00',
        },
        sameAs: [
            siteConfig.social.facebook,
            siteConfig.social.instagram,
            siteConfig.social.google,
        ].filter((u) => u && !u.includes('REPLACE_ME')),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

/* ── Service schema for service pages ───────────────────────── */
interface ServiceSchemaProps {
    name: string;
    description: string;
    url: string;
    priceFrom: number;
    priceCurrency?: string;
}

export function ServiceSchema({ name, description, url, priceFrom, priceCurrency = 'GBP' }: ServiceSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name,
        description,
        url: `${siteConfig.url}${url}`,
        provider: {
            '@id': `${siteConfig.url}/#business`,
        },
        areaServed: {
            '@type': 'GeoCircle',
            geoMidpoint: {
                '@type': 'GeoCoordinates',
                latitude: 51.32,
                longitude: 0.17,
            },
            geoRadius: '60000',
        },
        offers: {
            '@type': 'Offer',
            priceCurrency,
            price: priceFrom,
            priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

/* ── FAQPage schema ────────────────────────────────────────── */
export interface FaqItem {
    question: string;
    answer: string;
}

interface FaqPageSchemaProps {
    items: FaqItem[];
}

export function FaqPageSchema({ items }: FaqPageSchemaProps) {
    if (!items.length) return null;

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

/* ── BreadcrumbList schema ─────────────────────────────────── */
interface BreadcrumbItem {
    name: string;
    url: string;
}

interface BreadcrumbSchemaProps {
    items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
    if (!items.length) return null;

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: item.url.startsWith('http') ? item.url : `${siteConfig.url}${item.url}`,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
