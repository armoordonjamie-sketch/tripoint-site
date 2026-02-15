import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { BookOpen } from 'lucide-react';

export function BlogIndexPage() {
    return (
        <>
            <Seo
                title="Blog"
                description="Technical insights, case studies, and diagnostic tips from TriPoint Diagnostics. Coming soon."
                canonical="/blog"
            />

            <Section>
                <div className="mx-auto max-w-3xl text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
                        <BookOpen className="h-8 w-8 text-brand" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                        Blog
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-lg text-text-secondary">
                        Technical insights, case studies, and diagnostic tips - coming soon.
                    </p>
                    <p className="mt-6 text-sm text-text-muted">
                        We&apos;re preparing articles on common diagnostic scenarios, Sprinter-specific issues,
                        emissions system troubleshooting, and mobile diagnostics best practices.
                    </p>

                    {/* Placeholder cards */}
                    <div className="mt-12 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { title: 'Understanding AdBlue Countdowns', cat: 'Emissions', desc: 'What triggers the countdown, what the stages mean, and how we diagnose it properly.' },
                            { title: 'Sprinter Limp Mode: Common Causes', cat: 'Mercedes', desc: 'A breakdown of the most frequent limp-mode triggers on W906 and W907 platforms.' },
                            { title: 'Mobile vs Workshop Diagnostics', cat: 'Industry', desc: 'When mobile is the right choice - and when you genuinely need a workshop.' },
                        ].map((post) => (
                            <div
                                key={post.title}
                                className="rounded-2xl border border-border-default bg-surface-alt p-5 opacity-60"
                            >
                                <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                                    {post.cat}
                                </span>
                                <h3 className="mt-2 font-semibold text-text-primary">{post.title}</h3>
                                <p className="mt-2 text-sm text-text-secondary">{post.desc}</p>
                                <p className="mt-3 text-xs text-text-muted italic">Coming soon</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12">
                        <CTAButton href="/contact" variant="outline">
                            Get Notified When We Publish
                        </CTAButton>
                    </div>
                </div>
            </Section>
        </>
    );
}
