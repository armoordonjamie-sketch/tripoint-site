import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
    CATEGORY_META,
    SERVICES_BY_CATEGORY,
    SERVICE_CATEGORY_ORDER,
    getServicePrice,
    type ServiceCategoryId,
} from '@/config/servicesCatalog';
import { CTAButton } from '@/components/CTAButton';
import { VatLabel } from '@/components/VatLabel';
import { cn } from '@/lib/utils';
import { trackNavClick, trackSelectContent } from '@/lib/analytics';

interface ServicePickerProps {
    title?: string;
    subtitle?: string;
    badges?: { icon: LucideIcon; label: string }[];
}

export function ServicePicker({ title, subtitle, badges }: ServicePickerProps) {
    const [categoryId, setCategoryId] = useState<ServiceCategoryId>('diagnostics');
    const meta = CATEGORY_META[categoryId];
    const services = SERVICES_BY_CATEGORY[categoryId];

    return (
        <div className="relative overflow-hidden rounded-xl border border-border-default bg-surface-alt/90">
            <div className="pointer-events-none absolute inset-0 dot-grid opacity-20" aria-hidden />
            <div
                className={cn(
                    'pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-2xl opacity-30 bg-gradient-to-br',
                    meta.accent[0],
                    meta.accent[1],
                )}
                aria-hidden
            />
            <div className="relative p-4 sm:p-5">
                {/* Compact header row */}
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div>
                        {title && (
                            <h1 className="text-xl font-bold text-text-primary sm:text-2xl">{title}</h1>
                        )}
                        {subtitle && (
                            <p className="mt-0.5 text-sm text-text-secondary">{subtitle}</p>
                        )}
                    </div>
                    {badges && badges.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 sm:shrink-0">
                            {badges.map(({ icon: Icon, label }) => (
                                <span
                                    key={label}
                                    className="inline-flex items-center gap-1.5 rounded-md border border-border-default bg-surface/80 px-2.5 py-1 text-[11px] font-medium text-text-muted"
                                >
                                    <Icon className="h-3 w-3 text-brand shrink-0" />
                                    {label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div
                    className="flex gap-1.5 rounded-lg bg-surface/70 p-1 ring-1 ring-border-default"
                    role="tablist"
                    aria-label="Service category"
                >
                    {SERVICE_CATEGORY_ORDER.map((id) => {
                        const m = CATEGORY_META[id];
                        const Icon = m.Icon;
                        const active = categoryId === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => {
                                    setCategoryId(id);
                                    trackSelectContent('service_category', id);
                                }}
                                className={cn(
                                    'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition-all min-w-0',
                                    active
                                        ? cn('bg-surface-elevated text-text-primary shadow-sm ring-1', m.tabRing)
                                        : 'text-text-muted hover:text-text-secondary hover:bg-surface-alt/60',
                                )}
                            >
                                <Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-brand-light' : '')} />
                                <span className="truncate sm:hidden">{m.short}</span>
                                <span className="hidden sm:inline truncate">{m.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Service grid */}
                <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2" role="tabpanel">
                    {services.map((s) => {
                        const price = getServicePrice(s.priceSlug, s.fallbackPrice);
                        return (
                            <li
                                key={s.href}
                                className={cn(
                                    'group flex flex-col overflow-hidden rounded-lg border border-border-default bg-surface/80 transition-all',
                                    'hover:border-brand/30 hover:bg-surface-elevated/80',
                                )}
                            >
                                <div className="flex gap-3 p-3">
                                    <Link
                                        to={s.href}
                                        onClick={() => trackSelectContent('service', s.priceSlug, { nav_target: s.href })}
                                        className={cn(
                                            'relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br text-brand transition-transform duration-200 group-hover:scale-105',
                                            !s.thumbnailSrc && meta.accent[0],
                                            !s.thumbnailSrc && meta.accent[1],
                                        )}
                                    >
                                        {s.thumbnailSrc ? (
                                            <img
                                                src={s.thumbnailSrc}
                                                alt=""
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                                decoding="async"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <s.SvgIcon className="h-8 w-8" />
                                        )}
                                    </Link>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-start justify-between gap-1.5">
                                            <h3 className="text-sm font-semibold text-text-primary leading-snug group-hover:text-brand-light transition-colors">
                                                {s.title}
                                            </h3>
                                            <span className="rounded bg-brand/15 px-1.5 py-0.5 text-[11px] font-bold text-brand-light whitespace-nowrap">
                                                £{price}
                                                <VatLabel />
                                            </span>
                                        </div>
                                        <p className="mt-1 text-[11px] text-text-muted leading-relaxed line-clamp-2">{s.description}</p>
                                    </div>
                                </div>
                                <div className="mt-2.5 flex gap-2 border-t border-border-default/60 pt-2.5">
                                    <Link
                                        to={s.href}
                                        onClick={() => trackSelectContent('service', s.priceSlug, { nav_target: s.href })}
                                        className={cn(
                                            'inline-flex flex-1 items-center justify-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors',
                                            'border border-border-default bg-surface-alt text-text-primary hover:border-brand/40 hover:bg-brand/5',
                                        )}
                                    >
                                        Details
                                        <ArrowRight className="h-3 w-3 opacity-70" />
                                    </Link>
                                    <CTAButton
                                        href="/booking"
                                        size="sm"
                                        className="flex-1 min-w-0 justify-center px-2.5 py-1.5 text-xs"
                                        onClick={() => trackNavClick('/booking', 'Book', 'service-picker')}
                                    >
                                        Book
                                    </CTAButton>
                                </div>
                            </li>
                        );
                    })}
                </ul>

                {!title && (
                    <p className="mt-3 text-[11px] text-text-muted">
                        {services.length} option{services.length !== 1 ? 's' : ''} · from £
                        {Math.min(...services.map((s) => getServicePrice(s.priceSlug, s.fallbackPrice)))}
                        <VatLabel />
                    </p>
                )}
            </div>
        </div>
    );
}
