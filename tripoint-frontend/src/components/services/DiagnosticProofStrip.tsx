import type { GalleryImage } from '@/data/galleryImages';

interface ProofItem extends GalleryImage {
    caption: string;
}

interface DiagnosticProofStripProps {
    items: ProofItem[];
}

export function DiagnosticProofStrip({ items }: DiagnosticProofStripProps) {
    return (
        <div className="mt-6 reveal lg:mt-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">From real visits</p>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
                {items.map((item) => (
                    <figure
                        key={item.src}
                        className="w-[min(78vw,280px)] shrink-0 overflow-hidden rounded-xl border border-border-default bg-surface-alt sm:w-auto"
                    >
                        <div className="relative aspect-[4/3] sm:aspect-[16/10]">
                            <img
                                src={item.src}
                                alt={item.alt}
                                loading="lazy"
                                decoding="async"
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        </div>
                        <figcaption className="border-t border-border-default px-3 py-2 text-xs leading-snug text-text-secondary sm:text-sm">
                            {item.caption}
                        </figcaption>
                    </figure>
                ))}
            </div>
        </div>
    );
}
