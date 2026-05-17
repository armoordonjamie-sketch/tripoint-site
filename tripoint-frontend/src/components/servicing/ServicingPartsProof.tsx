import { Section } from '@/components/Section';
import { OptimizedImage } from '@/components/OptimizedImage';

interface ServicingPartsProofProps {
    heading?: string;
    body: string;
}

export function ServicingPartsProof({
    heading = 'Genuine Mercedes parts, every time',
    body,
}: ServicingPartsProofProps) {
    return (
        <Section className="bg-surface-alt/50">
            <div className="mx-auto max-w-5xl reveal">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">{heading}</h2>
                        <p className="mt-4 text-text-secondary leading-relaxed">{body}</p>
                    </div>
                    <div className="space-y-4">
                        <figure className="overflow-hidden rounded-2xl border border-border-default">
                            <div className="relative aspect-[3/2] min-h-[200px]">
                                <OptimizedImage
                                    src="/images/servicing-work/genuine-mb-parts-laid-out.jpg"
                                    alt="Genuine Mercedes parts laid out next to a van before a mobile service"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            </div>
                            <figcaption className="border-t border-border-default bg-surface-alt px-4 py-3 text-sm text-text-secondary">
                                Parts pre-ordered for your exact model and laid out before we start.
                            </figcaption>
                        </figure>
                        <figure className="overflow-hidden rounded-2xl border border-border-default">
                            <div className="relative aspect-[3/2] min-h-[200px]">
                                <OptimizedImage
                                    src="/images/servicing-work/genuine-mb-filter-box.jpg"
                                    alt="Genuine Mercedes filter box with new filter beside it"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            </div>
                            <figcaption className="border-t border-border-default bg-surface-alt px-4 py-3 text-sm text-text-secondary">
                                Genuine Mercedes filter housings — not pattern parts.
                            </figcaption>
                        </figure>
                    </div>
                </div>
            </div>
        </Section>
    );
}
