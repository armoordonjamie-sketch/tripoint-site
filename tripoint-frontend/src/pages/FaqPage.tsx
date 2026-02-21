import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { FaqPageSchema } from '@/components/JsonLd';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { cn } from '@/lib/utils';

interface FaqItem {
    question: string;
    answer: string;
}

interface FaqCategory {
    title: string;
    description: string;
    items: FaqItem[];
}

const faqCategories: FaqCategory[] = [
    {
        title: 'General',
        description: 'The basics - what we do, who we work with, and how we operate.',
        items: [
            {
                question: 'What does TriPoint Diagnostics do?',
                answer: 'We provide mobile vehicle diagnostics and fault-finding services across Kent and South East London. We come to your home, workplace, or depot with professional diagnostic equipment and give you a clear, written outcome for any fault - engine, emissions, electrical, or drivetrain.',
            },
            {
                question: 'Do you work on cars as well as vans?',
                answer: 'Yes - our diagnostic services cover both vans and cars. Our specialist strength is Mercedes commercial vehicles (Sprinter W906/W907, OM651/OM654), but we work across a range of makes and models. If you\'re unsure, get in touch and we\'ll let you know.',
            },
            {
                question: 'Are you mobile only?',
                answer: 'Yes, we\'re fully mobile. We come to your driveway, depot, yard, or wherever the vehicle is parked - as long as it\'s a safe working location. We don\'t have a workshop; that\'s by design, not limitation. It means we\'re at your door faster and you don\'t need to arrange transport.',
            },
            {
                question: 'What makes you different from a garage or breakdown service?',
                answer: 'We specialise in diagnostics - finding the root cause of a problem using live data, guided tests, and systematic analysis. We\'re not a breakdown callout and we\'re not a general garage. We go deeper than code readers, and every visit ends with a written fix plan. If parts or workshop work are needed, we tell you exactly what\'s required so you can get it done right.',
            },
            {
                question: 'Do I need to know what\'s wrong before booking?',
                answer: 'No. Just describe the symptom - warning light, loss of power, strange noise, countdown message - and we\'ll work out what\'s going on. If you\'re unsure which service to book, WhatsApp us or start with a standard Diagnostic Callout.',
            },
            {
                question: 'What equipment do you use?',
                answer: 'We use professional, dealer-level diagnostic equipment including Mercedes Star Diagnosis (Xentry), multi-brand OEM-level platforms, live data logging tools, and component actuation capabilities. This goes well beyond a code reader - we can access every module, run guided tests, perform adaptations, and verify component operation in real time.',
            },
            {
                question: 'Do you fit parts?',
                answer: 'In many cases, yes - especially for common components like sensors, actuators, and serviceable items. If the job requires workshop equipment (lifts, press tools, etc.), we\'ll tell you upfront and can recommend trusted workshops. We never charge for work we can\'t complete on site.',
            },
            {
                question: 'Can you come to my workplace or depot?',
                answer: 'Absolutely. Many of our bookings are at commercial depots, courier hubs, and business premises. We just need a safe, reasonably flat parking area to work in.',
            },
        ],
    },
    {
        title: 'Booking & Pricing',
        description: 'How to book, what to expect, and how we handle payments.',
        items: [
            {
                question: 'How do I book?',
                answer: 'You can book online via our website, WhatsApp us, or call. We\'ll confirm your zone, service, price, and next available slot. A small deposit secures the booking.',
            },
            {
                question: 'How does pricing work?',
                answer: 'All our services are fixed-price, zone-based. We have three zones (A, B, C) based on drive time from our bases. The price is confirmed before you book - no hidden fees. Parts, follow-on labour, and add-ons are quoted separately and always agreed before any work starts.',
            },
            {
                question: 'How do deposits work?',
                answer: 'A small deposit secures your booking slot: £30 for Zone A/B, £50 for Zone C or VOR bookings. You can reschedule free of charge with 24 hours\' notice - the deposit carries over. Late cancellation or no-show forfeits the deposit. The remaining balance is due on completion.',
            },
            {
                question: 'What payment methods do you accept?',
                answer: 'We accept bank transfer, card payment (via invoice link), and cash. Deposits are taken online via a secure payment link sent at the time of booking. You\'ll always receive a receipt or invoice.',
            },
            {
                question: 'Can I reschedule or cancel?',
                answer: 'Yes. Reschedule free with at least 24 hours\' notice - your deposit carries over to the new date. Cancellations with less than 24 hours\' notice, or no-shows, forfeit the deposit.',
            },
            {
                question: 'What if the job takes longer than expected?',
                answer: 'Each service includes a set amount of on-site time (stated on each service page). If we need more time to complete the diagnosis, follow-on labour is billed at £85/hour in 15-minute increments - and we\'ll always discuss it with you before proceeding.',
            },
            {
                question: 'Do you offer discounts for multiple vehicles?',
                answer: 'For fleet bookings or multi-vehicle visits, we can discuss pricing. Get in touch via WhatsApp or our contact page to discuss your requirements.',
            },
            {
                question: 'What do I need to provide when booking?',
                answer: 'Please provide: your postcode, vehicle registration, make/model, approximate mileage, a description of the symptoms or warning lights, whether the vehicle is drivable, and confirmation that it\'s parked in a safe working location (driveway, yard, etc.).',
            },
        ],
    },
    {
        title: 'Diagnostics & Process',
        description: 'What happens during a visit and what you get at the end.',
        items: [
            {
                question: 'What happens during a diagnostic visit?',
                answer: 'We start with a full vehicle scan across all modules (not just engine). We then use live data logging to compare requested vs actual values, run guided tests and component actuations where applicable, and physically inspect known failure points. Every visit ends with a written outcome - what we found, what the evidence says, and what needs doing next.',
            },
            {
                question: 'How long does a visit take?',
                answer: 'Most diagnostic visits take 45–90 minutes depending on the service and fault complexity. Each service page states the included on-site time. If more time is needed, we\'ll discuss it with you before continuing.',
            },
            {
                question: 'Will you fix the problem on the day?',
                answer: 'If the fix is within scope (sensor swap, actuator replacement, hose repair, etc.) and we have the parts, yes - many faults are resolved on the same visit. If the repair requires parts ordering or workshop equipment, we\'ll tell you exactly what\'s needed and quote accordingly.',
            },
            {
                question: 'What\'s a "written outcome"?',
                answer: 'Every visit ends with a documented report that includes: the faults found, the live data evidence, the root cause analysis, what needs to be done next, and whether it can be done mobile or needs workshop time. No ambiguity, no "might be this." You get a clear, actionable fix plan.',
            },
            {
                question: 'Do you just read fault codes?',
                answer: 'No - fault codes are a starting point, not a diagnosis. We go beyond codes with live data capture, requested vs actual comparisons, guided component tests, and physical inspection. A code tells you what the ECU detected. Proper diagnostics tells you why.',
            },
            {
                question: 'What\'s the difference between a Diagnostic Callout and a specialist service?',
                answer: 'A Diagnostic Callout is our general fault-finding visit - ideal for warning lights, unknown symptoms, or when you\'re not sure what\'s wrong. Specialist services (Sprinter Limp Mode, AdBlue Countdown, DPF, etc.) are focused visits designed around specific fault patterns, with extended on-site time and targeted test procedures.',
            },
            {
                question: 'Can you diagnose intermittent faults?',
                answer: 'Yes - intermittent faults are one of our specialities. We use live data logging, connector inspection, wiring checks at known rub points, and systematic testing to catch faults that come and go. We have a dedicated Intermittent Electrical Fault Diagnostic service for this.',
            },
            {
                question: 'What if you can\'t find the fault?',
                answer: 'It\'s rare, but some faults require extended monitoring, road testing, or stripping that isn\'t possible mobile. If we can\'t definitively identify the root cause on site, we\'ll tell you honestly - along with exactly what the next diagnostic step should be. You\'ll never be charged for guesswork.',
            },
        ],
    },
    {
        title: 'Emissions, AdBlue & DPF',
        description: 'Common questions about AdBlue countdowns, DPF regens, and emissions compliance.',
        items: [
            {
                question: 'Do you do AdBlue/DPF/EGR deletes?',
                answer: 'No - never. Removing or defeating emissions systems is illegal for road vehicles. It causes MOT failure, ULEZ non-compliance, and can invalidate insurance. We diagnose and repair emissions systems properly and compliantly.',
            },
            {
                question: 'Can you clear an AdBlue countdown?',
                answer: 'We diagnose the root cause - NOx sensor faults, dosing valve issues, heater circuit problems, or SCR efficiency faults - and carry out the proper repair. Just clearing codes doesn\'t fix the underlying fault and the countdown will return.',
            },
            {
                question: 'My AdBlue countdown says "No Restart in X miles" - can you help?',
                answer: 'Yes. This is one of our most common callouts. The countdown starts when the ECU detects an SCR system fault it can\'t resolve. We diagnose the exact cause with live data and component tests, then repair it properly so the countdown doesn\'t come back.',
            },
            {
                question: 'Can you do a DPF regen on my driveway?',
                answer: 'Yes, where it\'s safe. We run safety checks first - soot load level, oil condition, temperature readings, and sensor plausibility - before forcing a regen. If conditions aren\'t right (soot too high, underlying fault present), we\'ll tell you and recommend the correct next step instead.',
            },
            {
                question: 'Why does my DPF light keep coming back after a regen?',
                answer: 'If the DPF light returns after a regen, there\'s usually an underlying issue preventing normal regeneration - boost leaks, EGR faults, temperature control problems, or sensor issues. A regen treats the symptom (soot buildup), but doesn\'t fix the cause. We diagnose the root cause so it stays fixed.',
            },
            {
                question: 'What\'s the difference between your DPF service and a regen from a garage?',
                answer: 'Most garages will force a regen and hope for the best. We diagnose first: we check differential pressure, temperature plausibility, soot loading, and regen history before deciding whether regen is safe and appropriate. If there\'s a blocker, we fix that first. That\'s why our fixes last.',
            },
            {
                question: 'Can you fix NOx sensor faults?',
                answer: 'Yes. We diagnose NOx sensor issues with live data - sensor drift, heater circuit faults, implausible readings - and replace sensors where needed. We also check upstream causes (dosing accuracy, SCR catalyst condition) to make sure the new sensor won\'t flag the same fault.',
            },
            {
                question: 'Will my van pass its MOT after your emissions repair?',
                answer: 'Our goal is always a compliant, properly functioning emissions system. If the repair addresses the root cause correctly, the vehicle should pass its MOT emissions test. We test and verify results before we leave.',
            },
        ],
    },
    {
        title: 'Mercedes & Sprinter Specialist',
        description: 'Questions specific to Sprinters, Xentry, and Mercedes diagnostics.',
        items: [
            {
                question: 'Do you specialise in Sprinters?',
                answer: 'Yes - Mercedes Sprinters (W906/W907) are our core speciality. We know the common failure patterns, ECU behaviour, and diagnostic procedures inside out. We also work on Vitos and other Mercedes commercial vehicles.',
            },
            {
                question: 'What\'s Sprinter limp mode and can you fix it?',
                answer: 'Limp mode (derate) is when the ECU reduces engine power to protect the drivetrain. It\'s triggered by faults like turbo actuator problems, boost leaks, fuel rail pressure issues, EGR faults, or electrical problems. We diagnose the exact cause with live data and guided tests - not just code clearing. We have a dedicated Sprinter Limp Mode Diagnostic service.',
            },
            {
                question: 'What is Xentry / Star Diagnosis?',
                answer: 'Xentry (formerly Star Diagnosis) is Mercedes-Benz\'s official dealer-level diagnostic system. It provides full access to every module, SCN coding, adaptations, guided tests, and calibration procedures that aftermarket tools can\'t reach. We carry Xentry for Mercedes-specific work.',
            },
            {
                question: 'Can you do Mercedes coding and adaptations?',
                answer: 'Yes - via Xentry we can perform SCN coding (online coding for new components), module adaptations, initialisation procedures, key programming support, and configuration changes. This is the same access a Mercedes dealer has.',
            },
            {
                question: 'My Sprinter has a turbo actuator fault - can you diagnose it mobile?',
                answer: 'Yes. Turbo actuator faults are one of the most common Sprinter issues we see. We test actuator sweep, position accuracy (requested vs actual), and control circuit integrity using live data. If replacement is needed, we can often do it on site.',
            },
            {
                question: 'Do you work on the OM651 and OM654 engines?',
                answer: 'Yes - these are the engines in the W906 and W907 Sprinters respectively, and they\'re our core expertise. We know their common failure modes, sensor layouts, and diagnostic procedures intimately.',
            },
        ],
    },
    {
        title: 'Coverage & Availability',
        description: 'Where we operate, when we\'re available, and how zones work.',
        items: [
            {
                question: 'What areas do you cover?',
                answer: 'We cover up to 60 minutes\' drive time from our bases in Tonbridge (Kent) and Eltham (SE London). Common coverage towns include Bromley, Bexley, Greenwich, Lewisham, Dartford, Orpington, Sidcup, Sevenoaks, Tonbridge, Tunbridge Wells, Maidstone, and Gravesend. Use our Zone Calculator on the services page to check your postcode.',
            },
            {
                question: 'How do zones work?',
                answer: 'We have three zones based on drive time: Zone A (0–25 mins, core area), Zone B (25–45 mins, standard coverage), Zone C (45–60 mins, edge of radius). Each zone has a fixed price per service. Over 60 minutes is by quote only.',
            },
            {
                question: 'What are your operating hours?',
                answer: 'We operate Monday to Saturday, 6:00 AM – 10:00 PM. Early-bird slots (before 8 AM) and evening slots (after 7 PM) are available with a small surcharge. Late-night diagnostic-only visits (9 PM start) are also available.',
            },
            {
                question: 'Do you work on Sundays?',
                answer: 'Not as standard, but we may be available for urgent VOR (vehicle off road) callouts on Sundays by arrangement. Contact us to discuss.',
            },
            {
                question: 'How quickly can you come out?',
                answer: 'For standard bookings, we typically have availability within 1–3 working days. For VOR (vehicle off road) priority callouts, we aim for same-day or next-day response where capacity allows. Priority dispatch upgrades are available for an additional fee.',
            },
            {
                question: 'I\'m outside your coverage area - can you still help?',
                answer: 'Possibly. If you\'re slightly outside our 60-minute radius, get in touch and we\'ll see if we can accommodate you with a quote. For significantly out-of-area requests, we may be able to recommend a trusted specialist closer to you.',
            },
        ],
    },
    {
        title: 'Fleet & Commercial',
        description: 'For fleet operators, couriers, and commercial van users.',
        items: [
            {
                question: 'Do you support fleet operators?',
                answer: 'Yes. We work with owner-driver couriers, SME fleets, van hire branches, and multi-vehicle operators. We offer priority triage (VOR service), documented outcomes per vehicle, and Fleet Diagnostic Health Check sweeps for proactive maintenance.',
            },
            {
                question: 'What\'s a Fleet Diagnostic Health Check?',
                answer: 'It\'s a proactive diagnostic sweep across your fleet: we scan every vehicle for fault status, DPF health, emissions readiness, and general condition - then deliver a priority action list per vehicle. It\'s designed to catch problems before they become roadside breakdowns.',
            },
            {
                question: 'Can you visit our depot and scan multiple vehicles in one visit?',
                answer: 'Yes - that\'s exactly how our Fleet Health Check works. We come to your depot and work through vehicles systematically. Contact us to discuss volume pricing and scheduling.',
            },
            {
                question: 'Do you provide documentation for fleet compliance?',
                answer: 'Yes. Every visit produces a written outcome report that can be filed for compliance records. For fleet health checks, you receive a per-vehicle summary with priority ratings and recommended actions.',
            },
            {
                question: 'My courier van is off the road - how fast can you respond?',
                answer: 'Our VOR Van Diagnostics service is designed for exactly this. We prioritise commercial vehicles that are off-road and losing money. Same-day or next-day response where capacity allows. Priority dispatch upgrades are available.',
            },
        ],
    },
    {
        title: 'Pre-Purchase Inspections',
        description: 'Buying a used van? Get the diagnostic truth before you commit.',
        items: [
            {
                question: 'What does the Pre-Purchase Health Check include?',
                answer: 'We scan every module for stored and current faults, check emissions system health (DPF, AdBlue, SCR status), review service history flags in the ECU, assess mileage plausibility, and provide an honest written condition report - including any red flags or upcoming maintenance needs.',
            },
            {
                question: 'Can you do the inspection at a seller\'s location?',
                answer: 'Yes - we can attend the seller\'s address, a dealership forecourt, or an auction site. As long as we can safely access the vehicle and run diagnostics, we can do it wherever the van is.',
            },
            {
                question: 'Will the inspection tell me if the van is worth buying?',
                answer: 'We give you the diagnostic facts - hidden faults, emissions readiness, ECU history, and condition scoring. We\'ll flag anything concerning and give you an honest opinion. The buying decision is yours, but you\'ll have the information to make it confidently.',
            },
            {
                question: 'Can you check if a DPF has been removed or tampered with?',
                answer: 'Yes. We check DPF presence through diagnostic data (differential pressure behaviour, temperature readings, soot accumulation patterns) and can often identify signs of removal, gutting, or software tampering. This is one of the most important checks on a used commercial vehicle.',
            },
            {
                question: 'How soon do I get the report?',
                answer: 'You get verbal findings immediately on site, and a written report typically the same day or next working day. If there are urgent red flags, we\'ll tell you on the spot.',
            },
        ],
    },
];

/* Flatten for JSON-LD schema */
const allFaqs: FaqItem[] = faqCategories.flatMap((c) => c.items);

function FaqAccordionItem({ item }: { item: FaqItem }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="rounded-xl border border-border-default bg-surface-alt overflow-hidden transition-colors open:border-brand/20">
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-surface-elevated"
                aria-expanded={open}
            >
                <span className="pr-4 font-semibold text-text-primary">{item.question}</span>
                <ChevronDown
                    className={cn(
                        'h-5 w-5 shrink-0 text-text-muted transition-transform duration-200',
                        open && 'rotate-180 text-brand',
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
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCategories = searchQuery.trim()
        ? faqCategories
            .map((cat) => ({
                ...cat,
                items: cat.items.filter(
                    (faq) =>
                        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
                ),
            }))
            .filter((cat) => cat.items.length > 0)
        : faqCategories;

    const totalResults = filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0);

    return (
        <>
            <Seo
                title="Frequently Asked Questions"
                description="Common questions about TriPoint Diagnostics - services, coverage, pricing, emissions compliance, Sprinter expertise, fleet support, and more."
                canonical="/faq"
            />
            <FaqPageSchema items={allFaqs} />

            <Section>
                <div className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">FAQ</p>
                    <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">
                        Frequently Asked Questions
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
                        Everything you need to know about our services, process, and coverage. Can&apos;t find your answer? Get in touch.
                    </p>

                    {/* Search bar */}
                    <div className="mx-auto mt-8 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search questions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-border-default bg-surface-alt py-3 pl-12 pr-4 text-text-primary placeholder:text-text-muted focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                            />
                        </div>
                        {searchQuery.trim() && (
                            <p className="mt-2 text-sm text-text-muted">
                                {totalResults} result{totalResults !== 1 ? 's' : ''} found
                            </p>
                        )}
                    </div>

                    {/* Category quick-jump */}
                    {!searchQuery.trim() && (
                        <div className="mx-auto mt-6 flex flex-wrap justify-center gap-2">
                            {faqCategories.map((cat) => (
                                <a
                                    key={cat.title}
                                    href={`#faq-${cat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                                    className="rounded-full border border-border-default bg-surface-alt px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:border-brand/30 hover:bg-brand/5 hover:text-brand"
                                >
                                    {cat.title}
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {filteredCategories.length === 0 && (
                    <div className="mt-16 text-center">
                        <p className="text-lg text-text-secondary">No matching questions found.</p>
                        <p className="mt-2 text-sm text-text-muted">Try a different search term, or get in touch directly.</p>
                        <div className="mt-6">
                            <CTAButton href="/contact" variant="outline">Get in Touch</CTAButton>
                        </div>
                    </div>
                )}

                <div className="mx-auto mt-12 max-w-3xl space-y-12">
                    {filteredCategories.map((cat) => (
                        <div key={cat.title} id={`faq-${cat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-text-primary sm:text-2xl">{cat.title}</h2>
                                <p className="mt-1 text-sm text-text-muted">{cat.description}</p>
                            </div>
                            <div className="space-y-3">
                                {cat.items.map((faq) => (
                                    <FaqAccordionItem key={faq.question} item={faq} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <div className="mx-auto max-w-lg rounded-2xl border border-brand/20 bg-brand/5 p-8">
                        <h3 className="text-lg font-bold text-text-primary">Still have a question?</h3>
                        <p className="mt-2 text-sm text-text-secondary">
                            We&apos;re happy to help. WhatsApp us for a quick answer or use our contact page.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            <CTAButton href="/contact">Get in Touch</CTAButton>
                            <CTAButton href="/booking" variant="outline">Book a Diagnostic</CTAButton>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}
