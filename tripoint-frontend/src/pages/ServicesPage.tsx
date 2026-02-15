import { Search, AlertTriangle, Gauge, Wrench } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { ServiceCard } from '@/components/ServiceCard';
import { Notice } from '@/components/Notice';
import { CTAButton } from '@/components/CTAButton';

const services = [
    {
        title: 'Diagnostic Callout',
        description:
            'Full-system scan, live data checks, and guided tests - we identify the root cause and give you a clear written outcome with next steps.',
        icon: <Search className="h-6 w-6" />,
        href: '/services/diagnostic-callout',
        fromPrice: 80,
    },
    {
        title: 'VOR / Priority Triage',
        description:
            'Off-road commercially? Same-day priority triage to identify the failure, confirm severity, and create an action plan to get you moving.',
        icon: <AlertTriangle className="h-6 w-6" />,
        href: '/services/vor-triage',
        fromPrice: 120,
    },
    {
        title: 'Emissions Diagnostics',
        description:
            'DPF, AdBlue, SCR, EGR - compliance-first diagnostics for emissions-related faults. We diagnose and repair; we never delete.',
        icon: <Gauge className="h-6 w-6" />,
        href: '/services/emissions-diagnostics',
        fromPrice: 120,
    },
    {
        title: 'Pre-Purchase Health Check',
        description:
            'Thinking about buying a used van? We scan everything, check service history flags, and give you an honest condition report before you commit.',
        icon: <Wrench className="h-6 w-6" />,
        href: '/services/pre-purchase-health-check',
        fromPrice: 90,
    },
];

export function ServicesPage() {
    return (
        <>
            <Seo
                title="Services"
                description="Mobile vehicle diagnostic services across Kent & SE London. Diagnostic callout, VOR triage, emissions diagnostics, and pre-purchase health checks."
                canonical="/services"
            />

            <Section>
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                        Our Services
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
                        Fixed-price mobile diagnostic services with written outcomes. Every visit ends with a clear fix plan - no guesswork, no surprises.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-2">
                    {services.map((s) => (
                        <ServiceCard
                            key={s.title}
                            title={s.title}
                            description={s.description}
                            icon={s.icon}
                            href={s.href}
                            fromPrice={s.fromPrice}
                        />
                    ))}
                </div>

                <div className="mx-auto mt-12 max-w-2xl">
                    <Notice variant="info">
                        All services include travel to your location, a full diagnostic scan, and a written outcome report. Parts and follow-on labour are quoted separately.
                    </Notice>
                </div>

                <div className="mt-8 text-center">
                    <CTAButton href="/booking" size="lg">
                        Book a Diagnostic
                    </CTAButton>
                </div>
            </Section>
        </>
    );
}
