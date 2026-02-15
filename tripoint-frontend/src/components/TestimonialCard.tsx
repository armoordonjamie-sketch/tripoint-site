import { Star, Quote } from 'lucide-react';

interface TestimonialCardProps {
    name: string;
    vehicle: string;
    quote: string;
    rating?: number;
}

export function TestimonialCard({ name, vehicle, quote, rating = 5 }: TestimonialCardProps) {
    return (
        <div className="glass rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/5 relative overflow-hidden">
            {/* Decorative quote mark */}
            <Quote className="absolute -top-1 -right-1 h-16 w-16 text-brand/5 rotate-180" aria-hidden="true" />

            <div className="relative">
                <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                </div>
                <p className="mb-4 text-sm leading-relaxed text-text-secondary italic">
                    &ldquo;{quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand/20 to-brand/5 text-sm font-bold text-brand">
                        {name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-primary">{name}</p>
                        <p className="text-xs text-text-muted">{vehicle}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
