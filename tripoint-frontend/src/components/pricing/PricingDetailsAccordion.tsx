import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notice } from '@/components/Notice';
import { VatLabel } from '@/components/VatLabel';

const SECTIONS = [
    {
        id: 'included',
        title: "What's included",
        content: (
            <ul className="space-y-2 text-sm text-text-secondary">
                <li>Travel within your zone</li>
                <li>Full diagnostic scan across all modules</li>
                <li>Live data checks and guided tests</li>
                <li>Written outcome with findings and next steps</li>
                <li>On-site time as per service (typically 60–90 mins)</li>
            </ul>
        ),
    },
    {
        id: 'not-included',
        title: "What's not included",
        content: (
            <ul className="space-y-2 text-sm text-text-secondary">
                <li>Major mechanical repairs requiring ramp access</li>
                <li>Unsafe roadside work</li>
                <li>Parts (quoted separately when needed)</li>
            </ul>
        ),
    },
    {
        id: 'booking',
        title: 'Booking & deposits',
        content: (
            <p className="text-sm text-text-secondary leading-relaxed">
                A deposit secures your slot. Zone A/B: £30<VatLabel />. Zone C and VOR: £50<VatLabel />. Reschedule
                free with 24 hours notice — your deposit carries over. Late cancellation or no-show retains the
                deposit. We confirm your zone and final price when you book.
            </p>
        ),
    },
] as const;

export function PricingDetailsAccordion() {
    const [openId, setOpenId] = useState<string | null>(null);

    return (
        <div className="mt-8 space-y-2 lg:hidden">
            <h2 className="text-lg font-bold text-text-primary">Good to know</h2>
            {SECTIONS.map((section) => {
                const open = openId === section.id;
                return (
                    <div key={section.id} className="rounded-xl border border-border-default bg-surface-alt/60">
                        <button
                            type="button"
                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                            aria-expanded={open}
                            onClick={() => setOpenId(open ? null : section.id)}
                        >
                            <span className="text-sm font-semibold text-text-primary">{section.title}</span>
                            <ChevronDown
                                className={cn('h-5 w-5 shrink-0 text-text-muted transition-transform', open && 'rotate-180')}
                            />
                        </button>
                        {open ? <div className="border-t border-border-default px-4 pb-4 pt-2">{section.content}</div> : null}
                    </div>
                );
            })}
            <Notice variant="info" className="text-sm">
                <strong>VOR priority:</strong> Limited slots. WhatsApp us if your van is off the road.
            </Notice>
        </div>
    );
}
