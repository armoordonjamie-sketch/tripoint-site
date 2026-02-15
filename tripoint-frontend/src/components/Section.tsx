import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
    children: ReactNode;
    className?: string;
    id?: string;
    containerClass?: string;
}

export function Section({
    children,
    className,
    id,
    containerClass,
}: SectionProps) {
    return (
        <section id={id} className={cn('py-16 md:py-24', className)}>
            <div className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', containerClass)}>
                {children}
            </div>
        </section>
    );
}
