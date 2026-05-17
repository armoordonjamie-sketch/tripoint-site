/**
 * Real Google reviews for TriPoint Diagnostics.
 * Source: Google Business Profile.
 * Update by adding new entries at the top — most recent first.
 *
 * `datePublished` should be the actual review date (used in JSON-LD);
 * `relative` is the human-readable "X weeks ago" shown in the UI.
 */

export interface GoogleReview {
    author: string;
    /** True if Google labels them as a Local Guide */
    localGuide?: boolean;
    /** Total reviews this author has left on Google */
    reviewCount?: number;
    /** Total photos this author has added on Google */
    photoCount?: number;
    rating: 1 | 2 | 3 | 4 | 5;
    /** ISO date for schema.org */
    datePublished: string;
    /** Human-readable relative time for the UI */
    relative: string;
    text: string;
}

export const googleReviews: GoogleReview[] = [
    {
        author: "Archie's Castles & SoftPlay",
        localGuide: true,
        reviewCount: 53,
        photoCount: 40,
        rating: 5,
        datePublished: '2026-05-03',
        relative: '2 weeks ago',
        text: 'Highly recommend 👌 Had Jamie and another gentleman out for a gearbox oil service on our Sprinter — very reasonable price and service was 10/10.',
    },
    {
        author: 'J W',
        reviewCount: 3,
        rating: 5,
        datePublished: '2026-05-03',
        relative: '2 weeks ago',
        text: 'Great work so far — hopefully the issue gets resolved fully on the next visit.',
    },
    {
        author: 'Denise Harrild',
        reviewCount: 7,
        rating: 5,
        datePublished: '2026-04-26',
        relative: '3 weeks ago',
        text: "Outstanding service. This company goes above and beyond expectations. Had a full service including diagnostics and service report on my Mercedes Marco Polo. Jamie's work was thorough — really pleased to have found this company, I will be using in future. Thank you.",
    },
    {
        author: 'Tom Khan-Lavin',
        localGuide: true,
        reviewCount: 250,
        photoCount: 470,
        rating: 5,
        datePublished: '2026-04-19',
        relative: '4 weeks ago',
        text: 'Jamie was great. Booked me in soon after we spoke, came at the exact time he said and even went back home to get different equipment and returned — costing him at least 5 hours and only charging me for 1. Really would recommend him to others.',
    },
    {
        author: 'Alan W Taylor',
        reviewCount: 5,
        rating: 5,
        datePublished: '2026-04-05',
        relative: '6 weeks ago',
        text: '100% positive experience. Jamie was competent, knowledgeable, prompt, reliable — and a thoroughly nice guy!',
    },
];

export const googleReviewsAggregate = {
    ratingValue:
        Math.round(
            (googleReviews.reduce((sum, r) => sum + r.rating, 0) / googleReviews.length) * 10,
        ) / 10,
    reviewCount: googleReviews.length,
};
