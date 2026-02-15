import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface ServiceCardProps {
    title: string;
    description: string;
    icon: ReactNode;
    href: string;
    fromPrice: number;
    className?: string;
}

export function ServiceCard({
    title,
    description,
    icon,
    href,
    fromPrice,
    className,
}: ServiceCardProps) {
    return (
        <Link
            to={href}
            className={cn(
                'group relative flex flex-col rounded-2xl p-6 transition-all duration-300',
                'glass gradient-border shine',
                'hover:shadow-xl hover:shadow-brand/10 hover:-translate-y-1',
                className,
            )}
        >
            {/* Glow on hover */}
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-brand/0 transition-all duration-300 group-hover:bg-brand/3" aria-hidden="true" />

            <div className="relative">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 text-brand transition-transform duration-300 group-hover:scale-110">
                    {icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-text-primary group-hover:text-brand-light transition-colors">
                    {title}
                </h3>
                <p className="mb-4 flex-1 text-sm text-text-secondary leading-relaxed">
                    {description}
                </p>
                <div className="flex items-center justify-between">
                    <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand-light">
                        From £{fromPrice}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-medium text-text-muted transition-all group-hover:text-brand group-hover:gap-2">
                        Learn more
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </div>
            </div>
        </Link>
    );
}
