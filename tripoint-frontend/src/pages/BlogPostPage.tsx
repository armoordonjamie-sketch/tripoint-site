import { useParams, Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { BookOpen, ArrowRight } from 'lucide-react';
import { getBlogPost } from '@/data/blogPosts';

const serviceSlugToHref: Record<string, string> = {
    'sprinter-limp-mode': '/services/sprinter-limp-mode',
    'diagnostic-callout': '/services/diagnostic-callout',
    'adblue-countdown': '/services/adblue-countdown',
    'emissions-diagnostics': '/services/emissions-diagnostics',
    'dpf-regeneration-decision': '/services/dpf-regeneration-decision',
};

const serviceSlugToLabel: Record<string, string> = {
    'sprinter-limp-mode': 'Sprinter Limp Mode',
    'diagnostic-callout': 'Diagnostic Callout',
    'adblue-countdown': 'AdBlue Countdown',
    'emissions-diagnostics': 'Emissions Diagnostics',
    'dpf-regeneration-decision': 'DPF Regeneration Decision',
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

    return (
        <>
            <Seo
                title={post.title}
                description={post.description}
                canonical={`/blog/${post.slug}`}
            />

            <Section>
                <div className="mx-auto max-w-4xl lg:flex lg:gap-12">
                    <article className="flex-1 min-w-0">
                        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-brand hover:underline mb-6">
                            ← Back to Blog
                        </Link>
                        <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                            {post.category}
                        </span>
                        <h1 className="mt-2 text-4xl font-extrabold text-text-primary sm:text-5xl">
                            {post.title}
                        </h1>
                        <p className="mt-4 text-text-muted">
                            {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
                        <div
                            className="prose prose-invert mt-8 max-w-none prose-headings:font-bold prose-p:text-text-secondary prose-li:text-text-secondary prose-a:text-brand prose-a:no-underline hover:prose-a:underline"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                        <div className="mt-12 rounded-2xl border border-brand/20 bg-brand/5 p-6">
                            <p className="font-semibold text-text-primary">Need help with this?</p>
                            <p className="mt-2 text-sm text-text-secondary">
                                We offer professional diagnostics for these issues. Book a visit or WhatsApp us.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-3">
                                {relatedLinks.map((r) => (
                                    <CTAButton key={r.href} href={r.href} variant="outline" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
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
                                        <Link to={r.href} className="text-sm text-brand hover:underline">
                                            {r.label} →
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-6">
                                <CTAButton href="/booking" size="sm" className="w-full justify-center">
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
