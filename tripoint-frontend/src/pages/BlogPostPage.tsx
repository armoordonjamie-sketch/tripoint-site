import { useParams } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { BookOpen } from 'lucide-react';

export function BlogPostPage() {
    const { slug } = useParams<{ slug: string }>();

    return (
        <>
            <Seo
                title={`Blog Post: ${slug ?? 'Article'}`}
                description="Blog post from TriPoint Diagnostics."
                noIndex
            />

            <Section>
                <div className="mx-auto max-w-3xl text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
                        <BookOpen className="h-8 w-8 text-brand" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-text-primary sm:text-4xl">
                        {slug?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') ?? 'Blog Post'}
                    </h1>
                    <p className="mt-4 text-text-secondary">
                        This article is coming soon. Check back later for the full content.
                    </p>
                    {/* TODO: Replace with markdown rendering when content is available */}
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
