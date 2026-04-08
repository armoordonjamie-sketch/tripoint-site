import { useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OptimizedImage } from '@/components/OptimizedImage';
import type { GalleryImage } from '@/data/galleryImages';

interface PhotoGalleryProps {
    images: GalleryImage[];
    columns?: 2 | 3 | 4;
    className?: string;
    /** Show max N images, with a "+X more" button */
    maxVisible?: number;
    /** Fires when user opens the lightbox from the grid */
    onOpenLightbox?: (index: number, image: GalleryImage) => void;
    /** Fires when user expands "Show all" */
    onShowAll?: () => void;
}

export function PhotoGallery({ images, columns = 3, className, maxVisible, onOpenLightbox, onShowAll }: PhotoGalleryProps) {
    const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
    const [showAll, setShowAll] = useState(!maxVisible);

    const visibleImages = showAll ? images : images.slice(0, maxVisible);
    const hasMore = maxVisible && !showAll && images.length > maxVisible;

    const openLightbox = useCallback((idx: number) => setLightboxIdx(idx), []);
    const closeLightbox = useCallback(() => setLightboxIdx(null), []);
    const prev = useCallback(() => setLightboxIdx((i) => (i !== null ? (i - 1 + images.length) % images.length : null)), [images.length]);
    const next = useCallback(() => setLightboxIdx((i) => (i !== null ? (i + 1) % images.length : null)), [images.length]);

    const colClass = columns === 2 ? 'grid grid-cols-2' : columns === 4 ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3';

    return (
        <>
            {/* Grid */}
            <div className={cn(`${colClass} gap-3 sm:gap-4`, className)}>
                {visibleImages.map((img, i) => (
                    <button
                        key={img.src}
                        onClick={() => {
                            openLightbox(i);
                            onOpenLightbox?.(i, img);
                        }}
                        className="group relative block w-full aspect-square overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                        <OptimizedImage
                            src={img.src}
                            alt={img.alt}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 flex items-end rounded-xl bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <p className="p-4 text-sm text-white/90 leading-snug">{img.alt}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Show more button */}
            {hasMore && (
                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setShowAll(true);
                            onShowAll?.();
                        }}
                        className="rounded-full border border-brand/20 bg-brand/5 px-6 py-2 text-sm font-semibold text-brand-light transition-all hover:bg-brand/10 hover:border-brand/30"
                    >
                        Show all {images.length} photos
                    </button>
                </div>
            )}

            {/* Lightbox */}
            {lightboxIdx !== null && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
                    onClick={closeLightbox}
                >
                    {/* Close button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                        aria-label="Close"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Prev */}
                    <button
                        onClick={(e) => { e.stopPropagation(); prev(); }}
                        className="absolute left-4 z-50 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>

                    {/* Image */}
                    <div className="max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
                        <OptimizedImage
                            src={images[lightboxIdx].src}
                            alt={images[lightboxIdx].alt}
                            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
                        />
                        <p className="mt-3 text-center text-sm text-white/70">
                            {images[lightboxIdx].alt}
                            <span className="ml-2 text-white/40">
                                {lightboxIdx + 1} / {images.length}
                            </span>
                        </p>
                    </div>

                    {/* Next */}
                    <button
                        onClick={(e) => { e.stopPropagation(); next(); }}
                        className="absolute right-4 z-50 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                        aria-label="Next"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>
            )}
        </>
    );
}
