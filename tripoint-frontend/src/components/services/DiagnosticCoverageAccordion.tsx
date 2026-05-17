import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OptimizedImage } from '@/components/OptimizedImage';

export interface DiagnosticCategory {
    id: string;
    icon: LucideIcon;
    title: string;
    desc: string;
    image?: { src: string; alt: string; caption: string };
}

interface DiagnosticCoverageAccordionProps {
    categories: DiagnosticCategory[];
}

export function DiagnosticCoverageAccordion({ categories }: DiagnosticCoverageAccordionProps) {
    const [openId, setOpenId] = useState<string | null>(categories[0]?.id ?? null);

    return (
        <div className="space-y-2 lg:hidden">
            {categories.map((cat) => {
                const Icon = cat.icon;
                const open = openId === cat.id;
                return (
                    <div key={cat.id} id={cat.id} className="rounded-xl border border-border-default bg-surface-alt/60">
                        <button
                            type="button"
                            className="flex w-full items-start gap-3 px-4 py-3 text-left"
                            aria-expanded={open}
                            onClick={() => setOpenId(open ? null : cat.id)}
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                                <Icon className="h-5 w-5" />
                            </div>
                            <span className="min-w-0 flex-1 pt-1 text-sm font-semibold text-text-primary">{cat.title}</span>
                            <ChevronDown
                                className={cn('mt-1 h-5 w-5 shrink-0 text-text-muted transition-transform', open && 'rotate-180')}
                            />
                        </button>
                        {open ? (
                            <div className="border-t border-border-default px-4 pb-4 pt-1">
                                <p className="text-sm leading-relaxed text-text-secondary">{cat.desc}</p>
                                {cat.image ? (
                                    <figure className="mt-3 overflow-hidden rounded-lg border border-border-default">
                                        <div className="relative aspect-[16/10] min-h-[160px]">
                                            <OptimizedImage
                                                src={cat.image.src}
                                                alt={cat.image.alt}
                                                className="absolute inset-0 h-full w-full object-cover"
                                            />
                                        </div>
                                        <figcaption className="border-t border-border-default bg-surface-alt px-3 py-2 text-xs text-text-secondary">
                                            {cat.image.caption}
                                        </figcaption>
                                    </figure>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}
