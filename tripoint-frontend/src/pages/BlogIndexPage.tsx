import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { OptimizedImage } from '@/components/OptimizedImage';
import { BookOpen, ArrowRight } from 'lucide-react';
import { blogPosts, getPostThumbnail } from '@/data/blogPosts';
import { trackSelectContent } from '@/lib/analytics';
import { siteConfig } from '@/config/site';

function BlogThumbnail({ src, alt, className, priority }: { src: string; alt: string; className?: string; priority?: boolean }) {
    const isGallery = src.startsWith('/images/gallery/');
    if (isGallery) {
        return <OptimizedImage src={src} alt={alt} className={className} priority={priority} />;
    }
    return <img src={src} alt={alt} className={className} loading={priority ? 'eager' : 'lazy'} />;
}

const categories = ['All', ...Array.from(new Set(blogPosts.map((p) => p.category)))];

const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Sprinter and Mercedes Fault Guides | TriPoint Diagnostics Blog',
    description: 'Technical insights on Mercedes diagnostics, turbo failures, Sprinter limp mode, AdBlue, DPF, and mobile vehicle diagnostics.',
    url: `${siteConfig.url}/blog`,
    mainEntity: {
        '@type': 'ItemList',
        itemListElement: blogPosts.map((post, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${siteConfig.url}/blog/${post.slug}`,
            name: post.title,
        })),
    },
};

const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteConfig.url}/blog` },
    ],
};

export function BlogIndexPage() {
    const [filter, setFilter] = useState('All');
    const sorted = [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    const filtered = filter === 'All' ? sorted : sorted.filter((p) => p.category === filter);

    return (
        <>
            <Seo
                title="Sprinter and Mercedes Fault Guides | Blog"
                description="Technical guides on common Mercedes Sprinter, Vito, and diesel van faults. Limp mode, AdBlue countdowns, DPF issues, and turbo failures explained by a Mercedes-Benz trained technician."
                canonical="/blog"
            />
            <Helmet>
            </Helmet>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

            <Section>
                <div className="relative mx-auto max-w-4xl">
                    <div className="absolute inset-0 mesh-gradient opacity-30 pointer-events-none" aria-hidden="true" />
                    <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
                        <BookOpen className="h-8 w-8 text-brand" />
                    </div>
                    <h1 className="relative text-center text-4xl font-extrabold text-text-primary sm:text-5xl">
                        Blog
                    </h1>
                    <p className="relative mx-auto mt-4 max-w-xl text-center text-lg text-text-secondary">
                        Technical insights, diagnostic tips, and practical guidance.
                    </p>

                    <div className="relative mt-8 flex flex-wrap justify-center gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${filter === cat
                                    ? 'bg-brand text-white'
                                    : 'bg-surface-alt text-text-secondary hover:bg-surface-elevated'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {filtered.length === 0 ? (
                        <p className="relative mt-12 text-center text-text-secondary">No posts in this category yet.</p>
                    ) : (
                        <div className="relative mt-12 space-y-10">
                            {/* Featured post - first/latest */}
                            <Link
                                to={`/blog/${filtered[0].slug}`}
                                onClick={() => trackSelectContent('blog_post', filtered[0].slug)}
                                className="blog-index-featured group flex flex-col overflow-hidden rounded-2xl border border-border-default bg-surface-alt transition-all hover:border-brand/30 hover:bg-brand/5 sm:flex-row"
                            >
                                <div className="relative aspect-video w-full shrink-0 sm:w-1/2 sm:aspect-[4/3] lg:w-2/5">
                                    <BlogThumbnail
                                        src={getPostThumbnail(filtered[0])}
                                        alt=""
                                        className="h-full w-full object-cover"
                                        priority
                                    />
                                </div>
                                <div className="flex flex-1 flex-col justify-center p-6 sm:p-8">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                                        {filtered[0].category}
                                    </span>
                                    <h2 className="mt-2 text-xl font-bold text-text-primary sm:text-2xl group-hover:text-brand-light transition-colors">
                                        {filtered[0].title}
                                    </h2>
                                    <p className="mt-2 text-sm text-text-secondary line-clamp-2">
                                        {filtered[0].description}
                                    </p>
                                    <p className="mt-4 text-xs text-text-muted">
                                        {new Date(filtered[0].publishedAt).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>
                                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand group-hover:gap-2 transition-all">
                                        Read article <ArrowRight className="h-4 w-4" />
                                    </span>
                                </div>
                            </Link>

                            {/* Grid cards - remaining posts */}
                            {filtered.length > 1 && (
                                <div className="grid gap-6 sm:grid-cols-2">
                                    {filtered.slice(1).map((post) => (
                                        <Link
                                            key={post.slug}
                                            to={`/blog/${post.slug}`}
                                            onClick={() => trackSelectContent('blog_post', post.slug)}
                                            className="blog-index-card group overflow-hidden rounded-2xl border border-border-default bg-surface-alt transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:bg-brand/5"
                                        >
                                            <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl">
                                                <BlogThumbnail
                                                    src={getPostThumbnail(post)}
                                                    alt=""
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            </div>
                                            <div className="p-5">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                                                    {post.category}
                                                </span>
                                                <h3 className="mt-2 font-semibold text-text-primary group-hover:text-brand-light transition-colors">
                                                    {post.title}
                                                </h3>
                                                <p className="mt-2 text-sm text-text-secondary line-clamp-2">
                                                    {post.description}
                                                </p>
                                                <p className="mt-3 text-xs text-text-muted">
                                                    {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="relative mt-12 text-center">
                        <CTAButton href="/contact" variant="outline">
                            Get in Touch
                        </CTAButton>
                    </div>
                </div>
            </Section>
        </>
    );
}
