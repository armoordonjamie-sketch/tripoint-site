import { Link } from 'react-router-dom';
import { Shield, Clock, MapPin } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { ServicePicker } from '@/components/ServicePicker';

export function ServicesPage() {
    return (
        <div className="min-h-0">
            <Seo
                title="Services"
                description="Pick diagnostics, servicing, or tuning. Mobile fixed-price visits across Kent & SE London - then book online or view full details on each service page."
                canonical="/services"
            />

            <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                <ServicePicker
                    title="Our Services"
                    subtitle="Dealer-level mobile work at your door. Pick a category, compare prices, then view details or book."
                    badges={[
                        { icon: Shield, label: 'Fixed zone pricing' },
                        { icon: MapPin, label: 'Kent & SE London' },
                        { icon: Clock, label: 'Mon-Sat 6-22' },
                    ]}
                />
                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-text-muted">
                    <Link to="/booking" className="font-medium text-brand hover:text-brand-light transition-colors">
                        Book online
                    </Link>
                    <span className="text-border-default">·</span>
                    <Link to="/pricing" className="hover:text-text-secondary transition-colors">
                        Zone pricing
                    </Link>
                    <span className="text-border-default">·</span>
                    <Link to="/faq" className="hover:text-text-secondary transition-colors">
                        FAQ
                    </Link>
                </div>
            </div>
        </div>
    );
}
