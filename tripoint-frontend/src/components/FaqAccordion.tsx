import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FaqItem {
    question: string;
    answer: string;
}

interface FaqAccordionProps {
    items: FaqItem[];
    className?: string;
}

function FaqAccordionItem({ item }: { item: FaqItem }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="rounded-xl border border-border-default bg-surface-alt overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-surface-elevated"
                aria-expanded={open}
            >
                <span className="pr-4 font-semibold text-text-primary">{item.question}</span>
                <ChevronDown
                    className={cn(
                        'h-5 w-5 shrink-0 text-text-muted transition-transform duration-200',
                        open && 'rotate-180',
                    )}
                />
            </button>
            <div
                className={cn(
                    'grid transition-all duration-200',
                    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                )}
            >
                <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm leading-relaxed text-text-secondary">
                        {item.answer}
                    </p>
                </div>
            </div>
        </div>
    );
}

export function FaqAccordion({ items, className }: FaqAccordionProps) {
    return (
        <div className={cn('space-y-3', className)}>
            {items.map((item) => (
                <FaqAccordionItem key={item.question} item={item} />
            ))}
        </div>
    );
}
