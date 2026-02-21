import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { BookOpen } from 'lucide-react';
import { blogPosts } from '@/data/blogPosts';

const categories = ['All', ...Array.from(new Set(blogPosts.map((p) => p.category)))];

export function BlogIndexPage() {
    const [filter, setFilter] = useState('All');
    const filtered = filter === 'All' ? blogPosts : blogPosts.filter((p) => p.category === filter);

    return (
        <>
            <Seo
                title="Blog"
                description="Technical insights on Sprinter limp mode, AdBlue countdown, DPF diagnostics, and mobile vehicle diagnostics from TriPoint."
                canonical="/blog"
            />

            <Section>
                <div className="mx-auto max-w-4xl">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
                        <BookOpen className="h-8 w-8 text-brand" />
                    </div>
                    <h1 className="text-center text-4xl font-extrabold text-text-primary sm:text-5xl">
                        Blog
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-center text-lg text-text-secondary">
                        Technical insights, diagnostic tips, and practical guidance.
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                    filter === cat
                                        ? 'bg-brand text-white'
                                        : 'bg-surface-alt text-text-secondary hover:bg-surface-elevated'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((post) => (
                            <Link
                                key={post.slug}
                                to={`/blog/${post.slug}`}
                                className="rounded-2xl border border-border-default bg-surface-alt p-5 transition-all hover:border-brand/30 hover:bg-brand/5"
                            >
                                <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                                    {post.category}
                                </span>
                                <h3 className="mt-2 font-semibold text-text-primary">{post.title}</h3>
                                <p className="mt-2 text-sm text-text-secondary line-clamp-3">{post.description}</p>
                                <p className="mt-3 text-xs text-text-muted">
                                    {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            </Link>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <p className="mt-12 text-center text-text-secondary">No posts in this category yet.</p>
                    )}

                    <div className="mt-12 text-center">
                        <CTAButton href="/contact" variant="outline">
                            Get in Touch
                        </CTAButton>
                    </div>
                </div>
            </Section>
        </>
    );
}
