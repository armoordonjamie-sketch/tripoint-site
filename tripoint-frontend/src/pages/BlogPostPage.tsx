import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { OptimizedImage, getOptimizedPaths } from '@/components/OptimizedImage';
import { BookOpen, ArrowRight, BookMarked } from 'lucide-react';
import { getBlogPost, getPostThumbnail } from '@/data/blogPosts';
import { siteConfig } from '@/config/site';
import { trackNavClick, trackSelectContent } from '@/lib/analytics';

/* ── Per-post related reading links ── */
const relatedReadingBySlug: Record<string, { label: string; href: string }[]> = {
    'sprinter-obd-port-location': [
        { label: 'Sprinter Limp Mode: What a Proper Diagnostic Looks Like', href: '/blog/sprinter-limp-mode-proper-diagnostic' },
        { label: 'Mercedes Sprinter Warning Lights: A Plain-English Survival Guide', href: '/blog/sprinter-warning-lights-explained' },
        { label: 'Standard Diagnosis', href: '/services/diagnostic-callout' },
    ],
    'sprinter-warning-lights-explained': [
        { label: 'Mercedes Engine Management Light On', href: '/blog/mercedes-eml-on' },
        { label: 'AdBlue Countdown: Why Clearing Codes Is Not a Fix', href: '/blog/adblue-countdown-clearing-codes-not-fix' },
        { label: 'Standard Diagnosis', href: '/services/diagnostic-callout' },
    ],
    'van-underpowered-software-limited': [
        { label: 'Does Remapping a Van Actually Improve MPG?', href: '/blog/does-remapping-a-van-improve-mpg' },
        { label: 'Van Remapping', href: '/services/van-remapping' },
        { label: 'VW Transporter Remap', href: '/services/vw-transporter-remap' },
    ],
    'does-remapping-a-van-improve-mpg': [
        { label: 'Is Your Van Secretly Underpowered?', href: '/blog/van-underpowered-software-limited' },
        { label: 'Van Economy Remap', href: '/services/van-economy-tune' },
        { label: 'Van Remapping', href: '/services/van-remapping' },
    ],
    'om654-turbo-failure-sprinter-vito': [
        { label: 'Mercedes Sprinter Servicing', href: '/services/sprinter-servicing' },
        { label: 'Mercedes Vito Servicing', href: '/services/vito-servicing' },
        { label: 'Standard Diagnosis', href: '/services/diagnostic-callout' },
    ],
    'sprinter-limp-mode-proper-diagnostic': [
        { label: 'Standard Diagnosis', href: '/services/diagnostic-callout' },
        { label: 'VOR Van Diagnostics', href: '/services/vor-van-diagnostics' },
        { label: 'Mobile diagnostics in Greenwich', href: '/areas-covered/greenwich' },
    ],
    'adblue-countdown-clearing-codes-not-fix': [
        { label: 'Standard Diagnosis', href: '/services/diagnostic-callout' },
        { label: 'Mobile diagnostics in Bexley and Sidcup', href: '/areas-covered/bexley' },
        { label: 'Mobile diagnostics in Gillingham and Medway', href: '/areas-covered/medway' },
    ],
    'dpf-warning-light-regen-vs-worse': [
        { label: 'Standard Diagnosis', href: '/services/diagnostic-callout' },
        { label: 'Mercedes Sprinter Servicing', href: '/services/sprinter-servicing' },
        { label: 'Mobile diagnostics in Maidstone', href: '/areas-covered/maidstone' },
    ],
    'sprinter-p0299-turbo-underboost': [
        { label: 'Sprinter Limp Mode: What a Proper Diagnostic Looks Like', href: '/blog/sprinter-limp-mode-proper-diagnostic' },
        { label: 'Standard Diagnosis', href: '/services/diagnostic-callout' },
        { label: 'Mercedes Sprinter Servicing', href: '/services/sprinter-servicing' },
    ],
    'sprinter-p0234-turbo-overboost': [
        { label: 'Sprinter Limp Mode: What a Proper Diagnostic Looks Like', href: '/blog/sprinter-limp-mode-proper-diagnostic' },
        { label: 'Sprinter P0299: Turbo Underboost or Low Boost', href: '/blog/sprinter-p0299-turbo-underboost' },
        { label: 'Standard Diagnosis', href: '/services/diagnostic-callout' },
    ],
    'mercedes-p2002-dpf-fault': [
        { label: 'DPF Warning Lights: When Regen Helps vs When It Makes Things Worse', href: '/blog/dpf-warning-light-regen-vs-worse' },
        { label: 'AdBlue Countdown: Why Clearing Codes Is Not a Fix', href: '/blog/adblue-countdown-clearing-codes-not-fix' },
        { label: 'Standard Diagnosis', href: '/services/diagnostic-callout' },
    ],
    'sprinter-egr-valve-symptoms-cleaning': [
        { label: 'Sprinter P0401: Insufficient EGR Flow', href: '/blog/sprinter-p0401-egr-fault' },
        { label: 'Sprinter Limp Mode: What a Proper Diagnostic Looks Like', href: '/blog/sprinter-limp-mode-proper-diagnostic' },
        { label: 'Standard Diagnosis', href: '/services/diagnostic-callout' },
    ],
    'mercedes-sprinter-diagnostic-cost': [
        { label: "Where's the OBD Port on a Mercedes Sprinter?", href: '/blog/sprinter-obd-port-location' },
        { label: 'Sprinter Limp Mode: What a Proper Diagnostic Looks Like', href: '/blog/sprinter-limp-mode-proper-diagnostic' },
        { label: 'Standard Diagnosis', href: '/services/diagnostic-callout' },
    ],
    'sprinter-adblue-tank-topping-up': [
        { label: 'AdBlue Countdown: Why Clearing Codes Is Not a Fix', href: '/blog/adblue-countdown-clearing-codes-not-fix' },
        { label: 'Mercedes Vito AdBlue Fault', href: '/blog/vito-adblue-fault' },
        { label: 'Standard Diagnosis', href: '/services/diagnostic-callout' },
    ],
    'sprinter-wont-start-loss-of-power': [
        { label: 'Sprinter Limp Mode: What a Proper Diagnostic Looks Like', href: '/blog/sprinter-limp-mode-proper-diagnostic' },
        { label: 'Sprinter P0299: Turbo Underboost or Low Boost', href: '/blog/sprinter-p0299-turbo-underboost' },
        { label: 'VOR Van Diagnostics', href: '/services/vor-van-diagnostics' },
    ],
    'sprinter-dpf-clean-regen-or-replace': [
        { label: 'DPF Warning Lights: When Regen Helps vs When It Makes Things Worse', href: '/blog/dpf-warning-light-regen-vs-worse' },
        { label: 'Sprinter P2463: DPF Soot Accumulation', href: '/blog/sprinter-p2463-dpf-soot-accumulation' },
        { label: 'Standard Diagnosis', href: '/services/diagnostic-callout' },
    ],
    'are-sprinters-expensive-to-repair': [
        { label: 'Why OM654 Turbochargers Are Failing in Sprinter and Vito', href: '/blog/om654-turbo-failure-sprinter-vito' },
        { label: 'Sprinter DPF Blocked: Clean, Regen or Replace?', href: '/blog/sprinter-dpf-clean-regen-or-replace' },
        { label: 'VOR Van Diagnostics', href: '/services/vor-van-diagnostics' },
    ],
    'sprinter-ecu-remap-mpg-power-legal': [
        { label: 'Does Remapping a Van Actually Improve MPG?', href: '/blog/does-remapping-a-van-improve-mpg' },
        { label: 'Is a Van Remap Legal? Will It Pass the MOT?', href: '/blog/is-a-van-remap-legal-mot' },
        { label: 'Mercedes Sprinter Remap', href: '/services/mercedes-sprinter-remap' },
    ],
    'vito-w447-common-problems': [
        { label: 'Mercedes Vito AdBlue Fault', href: '/blog/vito-adblue-fault' },
        { label: 'Sprinter EGR Valve: Symptoms, Location & Clean vs Replace', href: '/blog/sprinter-egr-valve-symptoms-cleaning' },
        { label: 'Mercedes Vito Servicing', href: '/services/vito-servicing' },
    ],
    'is-remapping-a-van-worth-it': [
        { label: 'Does Remapping a Van Actually Improve MPG?', href: '/blog/does-remapping-a-van-improve-mpg' },
        { label: 'Economy Tune vs Load & Driveability Tune', href: '/blog/economy-tune-vs-load-driveability-tune' },
        { label: 'Van Remapping', href: '/services/van-remapping' },
    ],
    'economy-tune-vs-load-driveability-tune': [
        { label: 'Is Remapping a Van Worth It?', href: '/blog/is-remapping-a-van-worth-it' },
        { label: 'Van Economy Remap', href: '/services/van-economy-tune' },
        { label: 'Van Power & Driveability Remap', href: '/services/van-load-driveability-tune' },
    ],
    'is-a-van-remap-legal-mot': [
        { label: 'Van Remap & Insurance: What You Must Declare', href: '/blog/van-remap-insurance-what-to-declare' },
        { label: 'Is Remapping a Van Worth It?', href: '/blog/is-remapping-a-van-worth-it' },
        { label: 'Van Remapping', href: '/services/van-remapping' },
    ],
    'van-remap-insurance-what-to-declare': [
        { label: 'Is a Van Remap Legal? Will It Pass the MOT?', href: '/blog/is-a-van-remap-legal-mot' },
        { label: 'Is Remapping a Van Worth It?', href: '/blog/is-remapping-a-van-worth-it' },
        { label: 'Van Remapping', href: '/services/van-remapping' },
    ],
    'ford-transit-remap-what-to-expect': [
        { label: 'Does Remapping a Van Actually Improve MPG?', href: '/blog/does-remapping-a-van-improve-mpg' },
        { label: 'Economy Tune vs Load & Driveability Tune', href: '/blog/economy-tune-vs-load-driveability-tune' },
        { label: 'Ford Transit Custom Remap', href: '/services/transit-custom-remap' },
    ],
    'vw-transporter-remap-what-to-expect': [
        { label: 'Is Your Van Secretly Underpowered?', href: '/blog/van-underpowered-software-limited' },
        { label: 'Does Remapping a Van Actually Improve MPG?', href: '/blog/does-remapping-a-van-improve-mpg' },
        { label: 'VW Transporter Remap', href: '/services/vw-transporter-remap' },
    ],
    'fleet-van-remapping-worth-it': [
        { label: 'Is Remapping a Van Worth It?', href: '/blog/is-remapping-a-van-worth-it' },
        { label: 'Economy Tune vs Load & Driveability Tune', href: '/blog/economy-tune-vs-load-driveability-tune' },
        { label: 'Fleet Van Remapping', href: '/services/fleet-van-tuning' },
    ],
};

function BlogHeroImage({ src, alt }: { src: string; alt: string }) {
    const isGallery = src.startsWith('/images/gallery/');
    if (isGallery) {
        return <OptimizedImage src={src} alt={alt} className="h-full w-full object-cover" priority />;
    }
    return <img src={src} alt={alt} className="h-full w-full object-cover" loading="eager" />;
}

const serviceSlugToHref: Record<string, string> = {
    'sprinter-limp-mode': '/services/diagnostic-callout?from=merged',
    'diagnostic-callout': '/services/diagnostic-callout',
    'adblue-countdown': '/services/diagnostic-callout?from=merged',
    'emissions-diagnostics': '/services/diagnostic-callout?from=merged',
    'dpf-regeneration-decision': '/services/diagnostic-callout?from=merged',
    'mercedes-van-servicing': '/services/mercedes-van-servicing',
    'sprinter-servicing': '/services/sprinter-servicing',
    'vito-servicing': '/services/vito-servicing',
    'citan-servicing': '/services/citan-servicing',
    'sprinter-brakes': '/services/sprinter-brakes',
    'vito-brakes': '/services/vito-brakes',
    'citan-brakes': '/services/citan-brakes',
    'van-load-driveability-tune': '/services/van-load-driveability-tune',
    'van-economy-tune': '/services/van-economy-tune',
    'fleet-van-tuning': '/services/fleet-van-tuning',
    'van-remapping': '/services/van-remapping',
    'transit-custom-remap': '/services/transit-custom-remap',
    'vw-transporter-remap': '/services/vw-transporter-remap',
    'vw-caddy-remap': '/services/vw-caddy-remap',
    'ford-transit-remap': '/services/ford-transit-remap',
    'vauxhall-vivaro-remap': '/services/vauxhall-vivaro-remap',
    'mercedes-sprinter-remap': '/services/mercedes-sprinter-remap',
    'mercedes-vito-remap': '/services/mercedes-vito-remap',
    'vor-van-diagnostics': '/services/vor-van-diagnostics',
};

function serviceHrefToContentId(href: string): string {
    try {
        const p = new URL(href, siteConfig.url).pathname;
        const seg = p.match(/\/services\/([^/?]+)/);
        return seg ? seg[1] : href;
    } catch {
        return href;
    }
}

const serviceSlugToLabel: Record<string, string> = {
    'sprinter-limp-mode': 'Sprinter Limp Mode',
    'diagnostic-callout': 'Diagnostic Callout',
    'adblue-countdown': 'AdBlue Countdown',
    'emissions-diagnostics': 'Emissions Diagnostics',
    'dpf-regeneration-decision': 'DPF Regeneration Decision',
    'mercedes-van-servicing': 'Mercedes Van Servicing',
    'sprinter-servicing': 'Sprinter Servicing',
    'vito-servicing': 'Vito Servicing',
    'citan-servicing': 'Citan Servicing',
    'sprinter-brakes': 'Sprinter Brakes',
    'vito-brakes': 'Vito Brakes',
    'citan-brakes': 'Citan Brakes',
    'van-load-driveability-tune': 'Van Power & Driveability Remap',
    'van-economy-tune': 'Van Economy Remap',
    'fleet-van-tuning': 'Fleet Van Remapping',
    'van-remapping': 'Van Remapping',
    'transit-custom-remap': 'Ford Transit Custom Remap',
    'vw-transporter-remap': 'VW Transporter Remap',
    'vw-caddy-remap': 'VW Caddy Remap',
    'ford-transit-remap': 'Ford Transit Remap',
    'vauxhall-vivaro-remap': 'Vauxhall Vivaro Remap',
    'mercedes-sprinter-remap': 'Mercedes Sprinter Remap',
    'mercedes-vito-remap': 'Mercedes Vito Remap',
    'vor-van-diagnostics': 'VOR Van Diagnostics',
};

export function BlogPostPage() {
    const { slug } = useParams<{ slug: string }>();
    const post = slug ? getBlogPost(slug) : undefined;

    if (!post) {
        return (
            <>
                <Seo title="Post Not Found" noIndex />
                <Section>
                    <div className="mx-auto max-w-3xl text-center">
                        <h1 className="text-2xl font-bold text-text-primary">Post not found</h1>
                        <p className="mt-4 text-text-secondary">The article you're looking for doesn't exist.</p>
                        <div className="mt-8">
                            <CTAButton href="/blog" variant="outline">
                                ← Back to Blog
                            </CTAButton>
                        </div>
                    </div>
                </Section>
            </>
        );
    }

    const relatedLinks = post.relatedServices
        .filter((s) => serviceSlugToHref[s])
        .map((s) => ({ href: serviceSlugToHref[s], label: serviceSlugToLabel[s] ?? s }));

    const canonicalUrl = `${siteConfig.url}/blog/${post.slug}`;
    const imageUrl = post.ogImage
        ? (post.ogImage.startsWith('http') ? post.ogImage : `${siteConfig.url}${post.ogImage}`)
        : `${siteConfig.url}/og-default.jpg`;

    // Rough word count from HTML content for schema
    const wordCount = post.content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

    const blogPostingLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        wordCount,
        articleSection: post.category,
        inLanguage: 'en-GB',
        publisher: {
            '@id': `${siteConfig.url}/#local-business`,
        },
        author: {
            '@type': 'Person',
            name: 'Jamie Armoordon',
            url: `${siteConfig.url}/about`,
        },
        image: imageUrl,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': canonicalUrl,
        },
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: siteConfig.url,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: `${siteConfig.url}/blog`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: canonicalUrl,
            },
        ],
    };

    return (
        <>
            <Seo
                title={post.title}
                description={post.description}
                canonical={`/blog/${post.slug}`}
                ogImage={post.ogImage}
                ogImageAlt={post.ogImageAlt}
            />
            <Helmet>
                <meta property="og:type" content="article" />
                <meta property="article:published_time" content={post.publishedAt} />
                {post.updatedAt && <meta property="article:modified_time" content={post.updatedAt} />}
                <meta property="article:section" content={post.category} />
            </Helmet>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
            {post.faqs && post.faqs.length > 0 && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: post.faqs.map((faq) => ({
                        '@type': 'Question',
                        name: faq.question,
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: faq.answer,
                        },
                    })),
                })}} />
            )}

            {/* Hero section */}
            <section className="relative flex min-h-[50vh] flex-col md:min-h-[40vh] overflow-hidden">
                <div className="absolute inset-0">
                    <BlogHeroImage src={getPostThumbnail(post)} alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
                </div>
                <div className="relative z-10 flex min-h-full flex-col px-4 py-8 sm:px-6 lg:px-8">
                    <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white hover:underline">
                        ← Back to Blog
                    </Link>
                    <div className="mx-auto mt-auto w-full max-w-4xl pb-8 pt-12">
                        <span className="text-xs font-semibold uppercase tracking-wider text-brand-light">
                            {post.category}
                        </span>
                        <h1 className="mt-2 text-4xl font-extrabold text-white sm:text-5xl drop-shadow-lg">
                            {post.title}
                        </h1>
                        <p className="mt-4 text-white/80">
                            {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
            </section>

            <Section>
                <div className="mx-auto max-w-4xl lg:flex lg:gap-12">
                    <article className="flex-1 min-w-0">
                        <div className="mt-2 mb-6 text-sm text-text-secondary">
                            By <Link to="/about" className="text-brand hover:underline">Jamie Armoordon</Link> &middot; Mercedes-Benz Trained Technician &middot; TriPoint Diagnostics Ltd
                        </div>
                        <div
                            className="prose prose-invert mt-8 max-w-none prose-headings:font-bold prose-p:text-text-secondary prose-li:text-text-secondary prose-a:text-brand prose-a:no-underline hover:prose-a:underline"
                            dangerouslySetInnerHTML={{
                                __html: post.content.replace(/<img\s+src="(\/images\/(?:blog|gallery)\/[^"]+)"([^>]*)>/g, (match, src, rest) => {
                                    const { webpSrcset, jpg } = getOptimizedPaths(src);
                                    if (!webpSrcset) return match;
                                    return `<picture>
                                        <source type="image/webp" srcset="${webpSrcset}" sizes="(max-width: 768px) 100vw, 800px" />
                                        <img src="${jpg}" ${rest} />
                                    </picture>`;
                                }),
                            }}
                        />

                        {/* Related reading block */}
                        {relatedReadingBySlug[post.slug] && (
                            <div className="mt-10 rounded-2xl border border-border-default bg-surface-alt p-6">
                                <div className="flex items-center gap-2 text-text-primary">
                                    <BookMarked className="h-5 w-5 text-brand" />
                                    <h2 className="font-semibold">Related reading</h2>
                                </div>
                                <ul className="mt-4 space-y-2">
                                    {relatedReadingBySlug[post.slug].map((item) => (
                                        <li key={item.href}>
                                            <Link
                                                to={item.href}
                                                className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
                                                onClick={() => trackNavClick(item.href, item.label, 'blog_post_related_reading')}
                                            >
                                                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="mt-8 rounded-2xl border border-brand/20 bg-brand/5 p-6">
                            <p className="font-semibold text-text-primary">Need help with this?</p>
                            <p className="mt-2 text-sm text-text-secondary">
                                We offer professional diagnostics for these issues. Book a visit or WhatsApp us.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-3">
                                {relatedLinks.map((r) => (
                                    <CTAButton
                                        key={r.href}
                                        href={r.href}
                                        variant="outline"
                                        size="sm"
                                        icon={<ArrowRight className="h-4 w-4" />}
                                        onClick={() => {
                                            trackNavClick(r.href, r.label, 'blog_post_cta');
                                            trackSelectContent('blog_related_service', serviceHrefToContentId(r.href));
                                        }}
                                    >
                                        {r.label}
                                    </CTAButton>
                                ))}
                            </div>
                        </div>
                    </article>
                    <aside className="mt-12 lg:mt-0 lg:w-64 lg:shrink-0">
                        <div className="sticky top-24 rounded-2xl border border-border-default bg-surface-alt p-5">
                            <div className="flex items-center gap-2 text-brand">
                                <BookOpen className="h-5 w-5" />
                                <span className="font-semibold">Related Services</span>
                            </div>
                            <ul className="mt-4 space-y-2">
                                {relatedLinks.map((r) => (
                                    <li key={r.href}>
                                        <Link
                                            to={r.href}
                                            className="text-sm text-brand hover:underline"
                                            onClick={() => trackSelectContent('blog_related_service', serviceHrefToContentId(r.href))}
                                        >
                                            {r.label} →
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-6">
                                <CTAButton
                                    href="/booking"
                                    size="sm"
                                    className="w-full justify-center"
                                    onClick={() => trackNavClick('/booking', 'Book Now', 'blog_post_sidebar')}
                                >
                                    Book Now
                                </CTAButton>
                            </div>
                        </div>
                    </aside>
                </div>
            </Section>
        </>
    );
}
