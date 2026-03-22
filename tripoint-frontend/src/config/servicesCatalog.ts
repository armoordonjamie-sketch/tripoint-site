/**
 * Single source of truth for service categories + items (ServicePicker, Header mega-menu).
 */
import type { ComponentType, SVGAttributes } from 'react';
import {
    Search,
    AlertTriangle,
    Wrench,
    Truck,
    FileSearch,
    Disc,
    Gauge,
    Users,
    TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { siteConfig } from '@/config/site';
import {
    IconDiagnostics,
    IconVorDiagnostics,
    IconPrePurchase,
    IconVanServicing,
    IconSprinterServicing,
    IconVitoServicing,
    IconCitanServicing,
    IconSprinterBrakes,
    IconVitoBrakes,
    IconCitanBrakes,
    IconLoadTune,
    IconEconomyTune,
    IconFleetTune,
} from '@/components/ServiceIcons';

export type ServiceCategoryId = 'diagnostics' | 'servicing' | 'tuning';

export interface CatalogService {
    title: string;
    description: string;
    href: string;
    priceSlug: string;
    fallbackPrice: number;
    Icon: LucideIcon;
    SvgIcon: ComponentType<SVGAttributes<SVGElement>>;
    /** Optional van photo for ServicePicker card (/public path) */
    thumbnailSrc?: string;
}

export const CATEGORY_META: Record<
    ServiceCategoryId,
    {
        label: string;
        short: string;
        desc: string;
        Icon: LucideIcon;
        accent: [string, string];
        tabRing: string;
        /** Header mega-menu column accent */
        navColumn: string;
    }
> = {
    diagnostics: {
        label: 'Diagnostics',
        short: 'Diagnose',
        desc: 'Fault finding, VOR triage, pre-purchase',
        Icon: Search,
        accent: ['from-sky-500/20', 'to-brand/5'],
        tabRing: 'ring-sky-500/40',
        navColumn: 'border-t-sky-500/60',
    },
    servicing: {
        label: 'Servicing',
        short: 'Service',
        desc: 'Minor & major servicing and brakes',
        Icon: Wrench,
        accent: ['from-amber-500/15', 'to-orange-500/5'],
        tabRing: 'ring-amber-500/35',
        navColumn: 'border-t-amber-500/60',
    },
    tuning: {
        label: 'Tuning',
        short: 'Tune',
        desc: 'Load, economy, fleet tuning',
        Icon: TrendingUp,
        accent: ['from-violet-500/20', 'to-fuchsia-500/5'],
        tabRing: 'ring-violet-500/40',
        navColumn: 'border-t-violet-500/60',
    },
};

export const SERVICES_BY_CATEGORY: Record<ServiceCategoryId, CatalogService[]> = {
    diagnostics: [
        {
            title: 'Standard Diagnosis',
            description:
                'Full-system scan, live data, written outcome. Warning lights, limp mode, emissions, electrical.',
            href: '/services/diagnostic-callout',
            priceSlug: 'diagnostic-callout',
            fallbackPrice: 120,
            Icon: Search,
            SvgIcon: IconDiagnostics,
        },
        {
            title: 'VOR Van Diagnostics',
            description: 'Same-day priority triage for off-road commercial vans.',
            href: '/services/vor-van-diagnostics',
            priceSlug: 'vor-van-diagnostics',
            fallbackPrice: 160,
            Icon: AlertTriangle,
            SvgIcon: IconVorDiagnostics,
        },
        {
            title: 'Pre-Purchase Digital Health Check',
            description: 'Full scan and condition report before you buy.',
            href: '/services/pre-purchase-digital-health-check',
            priceSlug: 'pre-purchase-digital-health-check',
            fallbackPrice: 160,
            Icon: FileSearch,
            SvgIcon: IconPrePurchase,
        },
    ],
    servicing: [
        {
            title: 'Mercedes Van Servicing',
            description: 'Minor and major packages - oil, filters, records.',
            href: '/services/mercedes-van-servicing',
            priceSlug: 'mercedes-van-minor-service',
            fallbackPrice: 175,
            Icon: Wrench,
            SvgIcon: IconVanServicing,
            thumbnailSrc: '/images/services/van-sprinter-w907-front.png',
        },
        {
            title: 'Sprinter Servicing',
            description: 'W906 and W907 schedules at your location.',
            href: '/services/sprinter-servicing',
            priceSlug: 'mercedes-van-minor-service',
            fallbackPrice: 175,
            Icon: Truck,
            SvgIcon: IconSprinterServicing,
            thumbnailSrc: '/images/services/van-sprinter-w907-front.png',
        },
        {
            title: 'Vito Servicing',
            description: 'W447 planned maintenance.',
            href: '/services/vito-servicing',
            priceSlug: 'mercedes-van-minor-service',
            fallbackPrice: 175,
            Icon: Truck,
            SvgIcon: IconVitoServicing,
            thumbnailSrc: '/images/services/van-vito-w447-front.png',
        },
        {
            title: 'Citan Servicing',
            description: 'W415 / W420 servicing.',
            href: '/services/citan-servicing',
            priceSlug: 'mercedes-van-minor-service',
            fallbackPrice: 175,
            Icon: Truck,
            SvgIcon: IconCitanServicing,
            thumbnailSrc: '/images/services/van-citan-w420-front.png',
        },
        {
            title: 'Sprinter Brakes',
            description: 'Front and rear packages for W906 and W907.',
            href: '/services/sprinter-brakes',
            priceSlug: 'sprinter-brakes',
            fallbackPrice: 149,
            Icon: Disc,
            SvgIcon: IconSprinterBrakes,
            thumbnailSrc: '/images/services/van-sprinter-w907-front.png',
        },
        {
            title: 'Vito Brakes',
            description: 'W447 pads, discs, packaged pricing.',
            href: '/services/vito-brakes',
            priceSlug: 'vito-brakes',
            fallbackPrice: 169,
            Icon: Disc,
            SvgIcon: IconVitoBrakes,
            thumbnailSrc: '/images/services/van-vito-w447-front.png',
        },
        {
            title: 'Citan Brakes',
            description: 'W415 / W420 mobile brake service.',
            href: '/services/citan-brakes',
            priceSlug: 'citan-brakes',
            fallbackPrice: 169,
            Icon: Disc,
            SvgIcon: IconCitanBrakes,
            thumbnailSrc: '/images/services/van-citan-w420-front.png',
        },
    ],
    tuning: [
        {
            title: 'Van Load & Driveability Tune',
            description: 'Better loaded pull after diagnostic pre-check.',
            href: '/services/van-load-driveability-tune',
            priceSlug: 'van-load-driveability-tune',
            fallbackPrice: 199,
            Icon: TrendingUp,
            SvgIcon: IconLoadTune,
            thumbnailSrc: '/images/services/van-sprinter-w907-front.png',
        },
        {
            title: 'Van Economy Tune',
            description: 'Economy calibration for high-mileage vans.',
            href: '/services/van-economy-tune',
            priceSlug: 'van-economy-tune',
            fallbackPrice: 199,
            Icon: Gauge,
            SvgIcon: IconEconomyTune,
            thumbnailSrc: '/images/services/van-sprinter-w907-front.png',
        },
        {
            title: 'Fleet Van Tuning',
            description: 'Site-day fleet tuning with volume pricing.',
            href: '/services/fleet-van-tuning',
            priceSlug: 'fleet-van-tuning',
            fallbackPrice: 199,
            Icon: Users,
            SvgIcon: IconFleetTune,
            thumbnailSrc: '/images/services/van-sprinter-w906-front.png',
        },
    ],
};

export const SERVICE_CATEGORY_ORDER: ServiceCategoryId[] = ['diagnostics', 'servicing', 'tuning'];

export function getServicePrice(slug: string, fallback: number): number {
    return siteConfig.pricing.services.find((s) => s.slug === slug)?.zoneA ?? fallback;
}
