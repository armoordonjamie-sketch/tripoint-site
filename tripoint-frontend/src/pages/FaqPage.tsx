import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { cn } from '@/lib/utils';

interface FaqItem {
    question: string;
    answer: string;
}

const faqs: FaqItem[] = [
    {
        question: 'Do you work on cars as well as vans?',
        answer:
            'Yes - our diagnostic services cover both vans and cars. Our specialist strength is Mercedes commercial vehicles (Sprinter W906/W907, OM651/OM654), but we work across a range of makes and models. If you\'re unsure, get in touch and we\'ll let you know.',
    },
    {
        question: 'Are you mobile only?',
        answer:
            'Yes, we\'re fully mobile. We come to your driveway, depot, yard, or wherever the vehicle is parked - as long as it\'s a safe working location. We don\'t have a workshop; that\'s by design, not limitation. It means we\'re at your door faster and you don\'t need to arrange transport.',
    },
    {
        question: 'Do you do AdBlue/DPF/EGR deletes?',
        answer:
            'No. We diagnose and repair emissions systems; we do not disable, remove, or defeat them. DPF removal is almost always illegal for road vehicles in the UK and can result in MOT failure and fines. We take a compliance-first approach - always.',
    },
    {
        question: 'Can you clear an AdBlue countdown?',
        answer:
            'We can diagnose the root cause of an AdBlue countdown (such as NOx sensor faults, AdBlue quality issues, or SCR efficiency problems) and carry out compliant repairs. Simply "clearing" a countdown without fixing the underlying issue would be irresponsible - the countdown exists for a reason.',
    },
    {
        question: 'Can you do a regen on my driveway?',
        answer:
            'We can perform forced regenerations where it\'s safe and appropriate. However, we always run safety checks first - a forced regen generates extreme heat, and we need to verify conditions (exhaust soot load, oil level, temperature safety) before proceeding. If a regen isn\'t safe to do mobile, we\'ll tell you and recommend the next step.',
    },
    {
        question: 'What do you need from me before you arrive?',
        answer:
            'When booking, please provide: your postcode, vehicle registration, make/model, approximate mileage, a description of the symptoms or warning lights, whether the vehicle is drivable, and confirmation that it\'s parked in a safe working location (driveway, yard, etc.).',
    },
    {
        question: 'How do payment and deposits work?',
        answer:
            'A small deposit secures your booking slot: £30 for Zone A/B, £50 for Zone C or VOR bookings. Reschedule free with 24 hours notice - deposit carries over. Late cancellation or no-show retains the deposit. The balance is due on completion of the visit. Invoice/receipt provided.',
    },
    {
        question: 'What areas do you cover?',
        answer:
            'We cover up to 60 minutes drive time from our active base that week. On PM weeks we\'re based from Tonbridge (TN9), on AM weeks from Eltham (SE9). Saturdays are 8am–4pm. Common coverage includes Bromley, Bexley, Greenwich, Dartford, Orpington, Sevenoaks, Tonbridge, Tunbridge Wells, Maidstone, and Gravesend.',
    },
    {
        question: 'Do you support fleet operators?',
        answer:
            'Yes. We work with owner-driver couriers, SME fleets, and van hire branches. For fleets, we offer priority triage (VOR service), documented outcomes, and can discuss fleet scan sweep arrangements for preventive maintenance.',
    },
    {
        question: 'What are your operating hours?',
        answer:
            'We operate 6:00 AM – 10:00 PM, Monday to Saturday. We cover up to 60 minutes drive time from our bases in Tonbridge (TN9) and Eltham (SE9).',
    },
];

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

export function FaqPage() {
    return (
        <>
            <Seo
                title="Frequently Asked Questions"
                description="Common questions about TriPoint Diagnostics - coverage, pricing, emissions compliance, operating hours, and more."
                canonical="/faq"
            />

            <Section>
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                        Frequently Asked Questions
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
                        Got a question? Here are the most common ones. If you can&apos;t find what you&apos;re looking for, get in touch.
                    </p>
                </div>

                <div className="mx-auto mt-12 max-w-3xl space-y-3">
                    {faqs.map((faq) => (
                        <FaqAccordionItem key={faq.question} item={faq} />
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="mb-4 text-text-secondary">Still have a question?</p>
                    <CTAButton href="/contact">Get in Touch</CTAButton>
                </div>
            </Section>
        </>
    );
}
