import { siteConfig } from '@/config/site';
import { googleReviews, googleReviewsAggregate } from '@/data/googleReviews';

const AREA_SERVED_TOWNS = [
    'Tonbridge',
    'Bexley',
    'Greenwich',
    'Orpington',
    'Maidstone',
    'Gillingham',
    'Medway',
    'Chatham',
    'Rainham',
    'Sidcup',
    'Welling',
    'Erith',
    'Crayford',
    'Swanley',
    'Hextable',
    'Chislehurst',
    'Hadlow',
    'Hildenborough',
    'Paddock Wood',
];

const SERVICE_TYPES = [
    'Mercedes diagnostics',
    'STAR/XENTRY diagnostics',
    'Coding',
    'Fault finding',
    'DPF diagnostics and regeneration',
    'AdBlue/SCR diagnostics',
    'Mercedes van servicing (Sprinter, Vito, Citan)',
    'Mobile brake service',
    'Commercial van tuning',
];

const sameAsSocial = [
    siteConfig.social.facebook,
    siteConfig.social.instagram,
    siteConfig.social.google,
].filter((u) => u && !u.includes('REPLACE_ME'));

/* ── LocalBusiness (AutoRepair) schema ───────────────────────── */
export function LocalBusinessSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'AutoRepair' as const,
        '@id': `${siteConfig.url}/#business`,
        parentOrganization: { '@id': `${siteConfig.url}/#organization` },
        name: siteConfig.brandName,
        description: siteConfig.description,
        url: siteConfig.url,
        telephone: siteConfig.contact.phoneE164,
        email: siteConfig.contact.email,
        priceRange: '££' as const,
        areaServed: AREA_SERVED_TOWNS.map((name) => ({
            '@type': 'AdministrativeArea' as const,
            name,
        })),
        serviceArea: {
            '@type': 'GeoCircle' as const,
            geoMidpoint: {
                '@type': 'GeoCoordinates' as const,
                latitude: 51.32,
                longitude: 0.17,
            },
            geoRadius: '60000',
        },
        serviceType: SERVICE_TYPES,
        openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification' as const,
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '06:00',
            closes: '22:00',
        },
        sameAs: sameAsSocial,
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(schema).replace(/£/g, '\\u00a3'),
            }}
        />
    );
}

/* ── WebSite schema (site-wide, Organization expressed via AutoRepair) ── */
export function OrganizationWebsiteSchema() {
    const website = {
        '@context': 'https://schema.org',
        '@type': 'WebSite' as const,
        '@id': `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.brandName,
        inLanguage: 'en-GB',
        publisher: { '@id': `${siteConfig.url}/#organization` },
    };
    return (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
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
            priceValidUntil: '2030-12-31',
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

/* ── Google reviews + aggregate rating, attached to LocalBusiness ── */
export function GoogleReviewsSchema() {
    const businessId = `${siteConfig.url}/#business`;
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'AutoRepair' as const,
        '@id': businessId,
        name: siteConfig.brandName,
        url: siteConfig.url,
        aggregateRating: {
            '@type': 'AggregateRating' as const,
            ratingValue: googleReviewsAggregate.ratingValue,
            reviewCount: googleReviewsAggregate.reviewCount,
            bestRating: 5,
            worstRating: 1,
        },
        review: googleReviews.map((r) => ({
            '@type': 'Review' as const,
            author: { '@type': 'Person' as const, name: r.author },
            datePublished: r.datePublished,
            reviewBody: r.text,
            reviewRating: {
                '@type': 'Rating' as const,
                ratingValue: r.rating,
                bestRating: 5,
                worstRating: 1,
            },
            publisher: { '@type': 'Organization' as const, name: 'Google' },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
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
