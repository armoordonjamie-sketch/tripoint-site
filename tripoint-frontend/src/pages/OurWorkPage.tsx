import { useState } from 'react';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { PhotoGallery } from '@/components/PhotoGallery';
import { galleryImages, getImagesByCategory } from '@/data/galleryImages';

const categories = [
    { id: 'all', label: 'All Work' },
    { id: 'sprinter', label: 'Sprinter' },
    { id: 'engine-bay', label: 'Engine Bay' },
    { id: 'diagnostics', label: 'Diagnostics' },
    { id: 'electrical', label: 'Electrical' },
    { id: 'emissions', label: 'Emissions' },
    { id: 'brakes', label: 'Brakes' },
    { id: 'damage-faults', label: 'Faults Found' },
    { id: 'tools', label: 'Tools & Equipment' },
    { id: 'dashboard', label: 'Dashboard' },
];

export function OurWorkPage() {
    const [activeCategory, setActiveCategory] = useState('all');

    const filtered = activeCategory === 'all'
        ? galleryImages
        : getImagesByCategory(activeCategory);

    return (
        <>
            <Seo
                title="Our Work"
                description="Real photos from real diagnostic jobs - Mercedes Sprinter engine bays, fault finding, emissions work, electrical diagnostics, and more."
                canonical="/our-work"
            />

            <Section>
                <div className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">Gallery</p>
                    <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                        Our Work
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
                        Real photos from real jobs. Every image here is from an actual TriPoint diagnostic or repair session  -
                        no stock photos, no AI.
                    </p>
                </div>

                {/* Category filters */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                    {categories.map((cat) => {
                        const count = cat.id === 'all' ? galleryImages.length : getImagesByCategory(cat.id).length;
                        if (count === 0 && cat.id !== 'all') return null;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${activeCategory === cat.id
                                        ? 'bg-brand text-white shadow-lg shadow-brand/25'
                                        : 'border border-brand/15 bg-brand/5 text-brand-light hover:bg-brand/10 hover:border-brand/30'
                                    }`}
                            >
                                {cat.label}
                                <span className="ml-1.5 text-xs opacity-60">({count})</span>
                            </button>
                        );
                    })}
                </div>

                {/* Photo grid */}
                <div className="mt-10">
                    <PhotoGallery images={filtered} columns={3} />
                </div>

                {filtered.length === 0 && (
                    <p className="mt-10 text-center text-text-muted">No images in this category.</p>
                )}
            </Section>
        </>
    );
}
