import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { CTAButton } from '@/components/CTAButton';
import { siteConfig } from '@/config/site';
import { googleReviews, googleReviewsAggregate, type GoogleReview } from '@/data/googleReviews';
import { cn } from '@/lib/utils';

/** Marquee speed (px/sec) — slow enough to read, fast enough to feel alive. */
const SCROLL_PX_PER_SEC = 40;

const AVATAR_PALETTE = [
    'bg-brand/15 text-brand-light',
    'bg-emerald-500/15 text-emerald-300',
    'bg-amber-500/15 text-amber-300',
    'bg-purple-500/15 text-purple-300',
    'bg-rose-500/15 text-rose-300',
];

function initials(name: string): string {
    const parts = name
        .replace(/[^A-Za-z\s'-]/g, '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
    return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function GoogleG({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 48 48" aria-hidden="true" className={className} xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
            <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
            <path fill="#FBBC05" d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.991 21.991 0 002 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
            <path fill="#EA4335" d="M24 9.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 3.18 29.93 1 24 1 15.4 1 7.96 5.93 4.34 13.12l7.35 5.7C13.42 13.62 18.27 9.75 24 9.75z" />
        </svg>
    );
}

function StarRow({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
    const cls = size === 'lg' ? 'h-5 w-5' : size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
    return (
        <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    className={cn(cls, n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-text-muted/40')}
                />
            ))}
        </div>
    );
}

function ReviewCard({ review, paletteIdx }: { review: GoogleReview; paletteIdx: number }) {
    const avatar = AVATAR_PALETTE[paletteIdx % AVATAR_PALETTE.length];
    const meta = [
        review.localGuide ? 'Local Guide' : null,
        review.reviewCount ? `${review.reviewCount} review${review.reviewCount === 1 ? '' : 's'}` : null,
        review.photoCount ? `${review.photoCount} photo${review.photoCount === 1 ? '' : 's'}` : null,
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <article
            className="flex h-full flex-col rounded-2xl border border-border-default bg-surface-alt/60 p-5 sm:p-6"
            itemScope
            itemType="https://schema.org/Review"
        >
            <meta itemProp="itemReviewed" content={siteConfig.brandName} />
            <header className="flex items-start gap-3">
                <div
                    className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                        avatar,
                    )}
                    aria-hidden="true"
                >
                    {initials(review.author)}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary" itemProp="author">
                        {review.author}
                    </p>
                    {meta ? <p className="mt-0.5 truncate text-xs text-text-muted">{meta}</p> : null}
                </div>
                <GoogleG className="h-5 w-5 shrink-0" />
            </header>

            <div className="mt-3 flex items-center gap-2">
                <StarRow rating={review.rating} />
                <time className="text-xs text-text-muted" dateTime={review.datePublished} itemProp="datePublished">
                    {review.relative}
                </time>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-text-secondary" itemProp="reviewBody">
                {review.text}
            </p>

            <meta itemProp="reviewRating" content={String(review.rating)} />
        </article>
    );
}

export function GoogleReviews() {
    const { ratingValue, reviewCount } = googleReviewsAggregate;
    const ratingDisplay = Number.isInteger(ratingValue) ? `${ratingValue}.0` : ratingValue.toFixed(1);

    const [paused, setPaused] = useState(false);

    const viewportRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const halfWidthRef = useRef(0);
    const [cardWidth, setCardWidth] = useState(0);
    const x = useMotionValue(0);

    /** Size cards from the viewport (overflow container) so 1 / 2 / 3 are visible. */
    useLayoutEffect(() => {
        const vp = viewportRef.current;
        if (!vp) return;
        const GAP_PX = 20; // matches sm:gap-5 / gap-4 (close enough for either)
        const compute = () => {
            const w = vp.clientWidth;
            let visible = 1;
            if (w >= 1024) visible = 3;
            else if (w >= 640) visible = 2;
            const totalGap = GAP_PX * (visible - 1);
            const card = visible === 1 ? Math.min(320, Math.round(w * 0.82)) : Math.floor((w - totalGap) / visible);
            setCardWidth(card);
        };
        compute();
        const ro = new ResizeObserver(compute);
        ro.observe(vp);
        return () => ro.disconnect();
    }, []);

    /** Re-measure the doubled track whenever cards resize. */
    useLayoutEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        halfWidthRef.current = el.scrollWidth / 2;
        // wrap current x if cards shrank past the new half
        if (halfWidthRef.current > 0) {
            let cur = x.get();
            while (-cur >= halfWidthRef.current) cur += halfWidthRef.current;
            x.set(cur);
        }
    }, [cardWidth, x]);

    /** Pause auto-scroll when tab is hidden so it doesn't drift on long sessions. */
    useEffect(() => {
        const onVisibility = () => setPaused(document.hidden);
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, []);

    /** Continuous marquee — translate left, wrap by half-width when past one set. */
    useAnimationFrame((_, delta) => {
        if (paused) return;
        const half = halfWidthRef.current;
        if (half <= 0) return;
        let next = x.get() - (delta / 1000) * SCROLL_PX_PER_SEC;
        while (-next >= half) next += half;
        x.set(next);
    });

    const items = [...googleReviews, ...googleReviews];

    return (
        <section className="py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="reveal text-center">
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand">Customer Reviews</p>
                    <h2 className="mt-2 text-3xl font-bold text-text-primary sm:text-4xl">What our customers say</h2>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-alt/60 px-4 py-2">
                        <GoogleG className="h-5 w-5" />
                        <span className="text-sm font-semibold text-text-primary">{ratingDisplay}</span>
                        <StarRow rating={Math.round(ratingValue)} size="sm" />
                        <span className="text-xs text-text-muted">·</span>
                        <span className="text-xs text-text-muted">
                            {reviewCount} verified Google review{reviewCount === 1 ? '' : 's'}
                        </span>
                    </div>
                </div>

                <div
                    className="reviews-marquee relative mt-8 sm:mt-10"
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                    onFocusCapture={() => setPaused(true)}
                    onBlurCapture={() => setPaused(false)}
                    onTouchStart={() => setPaused(true)}
                    onTouchEnd={() => setPaused(false)}
                    aria-roledescription="carousel"
                    aria-label="Customer reviews — auto-scrolling"
                >
                    <div className="overflow-hidden" ref={viewportRef}>
                        <motion.div
                            ref={trackRef}
                            style={{ x }}
                            className="flex w-max gap-5"
                        >
                            {items.map((review, idx) => (
                                <div
                                    key={`${review.author}-${review.datePublished}-${idx}`}
                                    className="shrink-0"
                                    style={{ width: cardWidth || undefined }}
                                    aria-hidden={idx >= googleReviews.length}
                                >
                                    <ReviewCard review={review} paletteIdx={idx % googleReviews.length} />
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Edge fades */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-surface to-transparent sm:w-16" aria-hidden="true" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-surface to-transparent sm:w-16" aria-hidden="true" />
                </div>

                <div className="mt-8 flex flex-col items-center gap-3 reveal sm:flex-row sm:justify-center sm:gap-4">
                    <CTAButton
                        href={siteConfig.social.google}
                        external
                        size="md"
                        className="w-full max-w-xs sm:w-auto"
                        icon={<ArrowRight className="h-4 w-4" />}
                    >
                        Leave a Google review
                    </CTAButton>
                    <a
                        href={siteConfig.social.google}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-text-secondary hover:text-brand-light hover:underline"
                    >
                        See all reviews on Google
                    </a>
                </div>
            </div>
        </section>
    );
}
