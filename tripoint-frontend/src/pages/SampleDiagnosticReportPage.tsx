import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { FaqAccordion } from '@/components/FaqAccordion';
import { ExpandableReportImage } from '@/components/ExpandableReportImage';
import { BreadcrumbSchema, FaqPageSchema } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';
import { trackNavClick, trackWhatsAppClick } from '@/lib/analytics';
import {
    FileText,
    ListChecks,
    Activity,
    Zap,
    Route,
    MessageCircle,
} from 'lucide-react';

const diagnosticService = siteConfig.pricing.services.find((s) => s.slug === 'diagnostic-callout');
const zoneA = diagnosticService?.zoneA ?? 120;

const base = '/images/sample-report';

const pageFaqs = [
    {
        question: 'Do I get a written report after every diagnosis?',
        answer:
            'Yes. Every Standard Diagnosis ends with a written outcome: what we found, what we checked, the most likely root cause, and what to do next. The screenshots on this page are from one real visit to show the kind of structure and depth you can expect.',
    },
    {
        question: 'Is this just a code scan?',
        answer:
            'No. Fault codes are a starting point, not a diagnosis. We use live data, plausibility checks, guided tests where appropriate, and physical checks when needed. The goal is a reasoned conclusion you can act on—not a list of codes with a guess.',
    },
    {
        question: 'Can you still help if it needs workshop-only work afterwards?',
        answer:
            'Yes. If the fix needs a ramp, major underbody access, or equipment we cannot use safely on site, you still leave with documented findings and a clear next step. Many customers use that write-up to get the right repair done elsewhere without paying twice for guesswork.',
    },
    {
        question: 'Will you recommend deletes or bypasses for AdBlue / DPF faults?',
        answer:
            'No. TriPoint Diagnostics is compliance-first. We do not offer or recommend emissions deletes, bypasses, or defeat devices. We diagnose and repair emissions systems properly and explain the compliant repair path.',
    },
];

const strengthCards = [
    {
        icon: FileText,
        title: 'Plain-English conclusion',
        desc: 'A short summary you can read without needing to decode workshop shorthand.',
    },
    {
        icon: ListChecks,
        title: 'Ruled-out causes',
        desc: 'Evidence that major components were not condemned without support—so spend goes where it belongs.',
    },
    {
        icon: Activity,
        title: 'Live data evidence',
        desc: 'Readings and context from the vehicle, not just what a code description suggests.',
    },
    {
        icon: Zap,
        title: 'Electrical confirmation',
        desc: 'Guided checks where wiring, supply, or sensor behaviour needs to be proved—not assumed.',
    },
    {
        icon: Route,
        title: 'Clear next steps',
        desc: 'A practical sequence: what to replace or reset, what to retest, and what would trigger a change of plan.',
    },
];

const evidenceItems = [
    {
        src: `${base}/01_plain_english_summary.png`,
        alt: 'Plain-English summary section from a written diagnostic report',
        caption: 'Plain-English summary of the conclusion at the top of the write-up.',
    },
    {
        src: `${base}/02_dpf_checks_table.png`,
        alt: 'DPF and exhaust-related readings table from a diagnostic report',
        caption: 'Ruled-out causes: DPF and related readings checked before jumping to expensive parts.',
    },
    {
        src: `${base}/03_scr_live_data_section.png`,
        alt: 'SCR live data section with supporting diagnostic screenshots',
        caption: 'Live data and context for the emissions path—not a single code in isolation.',
    },
    {
        src: `${base}/04_electrical_confirmation_table.png`,
        alt: 'Electrical confirmation and guided test results table',
        caption: 'Guided electrical checks recorded so the conclusion is supported, not guessed.',
    },
    {
        src: `${base}/05_voltage_proof_photos.png`,
        alt: 'Photo evidence of access and measured voltage from diagnostic checks',
        caption: 'Where it helps, photo evidence sits alongside the written checks.',
    },
    {
        src: `${base}/06_technical_diagnosis_box.png`,
        alt: 'Technical diagnosis summary box from a written report',
        caption: 'Technical detail for those who want it—still tied to the same reasoning chain.',
    },
    {
        src: `${base}/07_next_steps_section.png`,
        alt: 'Next steps and recommendation section from a diagnostic report',
        caption: 'Next steps spelled out so you can approve work or book a follow-on with clarity.',
    },
];

const comparisonRows = [
    {
        cheap: 'Fault code only',
        proper: 'Fault code read in context with live data and plausibility',
    },
    {
        cheap: 'Guesswork on parts',
        proper: 'Live data plus guided tests where they add certainty',
    },
    {
        cheap: 'No written plan',
        proper: 'Written outcome you can keep, share, or take to a workshop',
    },
    {
        cheap: 'Intermittent faults easy to misread',
        proper: 'A clearer reasoning path for symptoms that come and go',
    },
];

export function SampleDiagnosticReportPage() {
    return (
        <>
            <Seo
                title="Sample Diagnostic Report | What You Get After a Proper Vehicle Diagnosis"
                description="See what a real written diagnostic report looks like from TriPoint Diagnostics. Plain-English findings, evidence from live data and guided tests, and clear next steps."
                canonical="/sample-diagnostic-report"
            />
            <BreadcrumbSchema
                items={[
                    { name: 'Home', url: '/' },
                    { name: 'Services', url: '/services' },
                    { name: 'Sample Diagnostic Report', url: '/sample-diagnostic-report' },
                ]}
            />
            <FaqPageSchema items={pageFaqs} />

            <Section className="border-b border-border-default/60 pb-12 md:pb-16">
                <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-brand">
                            Real diagnostic proof
                        </p>
                        <h1 className="mt-3 text-4xl font-extrabold text-text-primary sm:text-5xl">
                            What a Proper Diagnostic Visit Actually Gives You
                        </h1>
                        <p className="mt-4 text-lg text-text-secondary leading-relaxed">
                            Fault codes are not the same as proving root cause. This page shows a real example of what a proper diagnostic visit produces: a written outcome with plain-English explanation, evidence from the vehicle, and a clear path forward.
                        </p>
                        <ul className="mt-6 space-y-3 text-text-secondary">
                            <li className="flex gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                                <span>Plain-English conclusion you can act on</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                                <span>Evidence from live data and guided tests</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                                <span>Clear next-step recommendation</span>
                            </li>
                        </ul>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <CTAButton
                                href="/booking"
                                size="lg"
                                onClick={() => trackNavClick('/booking', 'Book Standard Diagnosis', 'sample_report_hero')}
                            >
                                Book Standard Diagnosis
                            </CTAButton>
                            <CTAButton
                                href={`https://wa.me/${siteConfig.contact.whatsappE164}`}
                                variant="outline"
                                size="lg"
                                external
                                icon={<MessageCircle className="h-5 w-5" />}
                                onClick={() => trackWhatsAppClick('sample_report_hero')}
                            >
                                WhatsApp Your Symptoms
                            </CTAButton>
                        </div>
                    </div>
                    <figure className="overflow-hidden rounded-2xl border border-border-default bg-surface-alt shadow-lg shadow-black/20">
                        <ExpandableReportImage
                            src={`${base}/00_front_page_proof_public_safe.png`}
                            alt="Redacted front page of a real TriPoint diagnostic report showing title and plain-English conclusion"
                            className="overflow-hidden rounded-t-2xl"
                            priority
                        />
                        <figcaption className="border-t border-border-default px-4 py-3 text-xs text-text-muted">
                            Public-safe crop from one real visit. Vehicle identifiers removed.
                        </figcaption>
                    </figure>
                </div>
            </Section>

            <Section className="bg-surface-alt/30">
                <div className="mx-auto max-w-3xl">
                    <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
                        What you are actually paying for
                    </h2>
                    <p className="mt-4 text-text-secondary leading-relaxed">
                        A cheap code read tells you what the ECU has logged. It does not tell you whether that code is the whole story, whether another fault is driving it, or whether a major component is truly at fault. Proper diagnosis is time spent reasoning: checking plausibility, ruling out misleading paths, and recording what was tested.
                    </p>
                    <p className="mt-4 text-text-secondary leading-relaxed">
                        You are paying for a written outcome—findings, ruled-out causes where relevant, and next steps—so you can make decisions without paying twice for the wrong part or the wrong repair.
                    </p>
                </div>
            </Section>

            <Section>
                <div className="mx-auto max-w-3xl rounded-2xl border border-border-default bg-surface-alt p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-text-primary">A real example (one recent visit)</h2>
                    <p className="mt-4 text-text-secondary leading-relaxed">
                        In a recent diagnostic visit, the vehicle had an intermittent engine management light with no obvious loss of power. The evidence pointed to a failed upstream NOx sensor rather than condemning the DPF or SCR hardware at that stage. Live data and guided electrical checks supported that conclusion. The documented next step was sensor replacement, correct reset or teach-in where required, and retest—not a shortcut around emissions compliance.
                    </p>
                    <p className="mt-4 text-sm text-text-muted">
                        We keep the focus on process: the same approach applies across makes and symptoms—scan and codes are only the start.
                    </p>
                </div>
            </Section>

            <Section className="bg-surface-alt/30">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">Why this diagnosis was strong</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
                        The report is useful because it combines plain language with traceable evidence—not because it lists the most codes.
                    </p>
                </div>
                <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {strengthCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.title}
                                className="rounded-xl border border-border-default bg-surface-alt p-5 transition-colors hover:border-brand/25"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h3 className="mt-4 font-semibold text-text-primary">{card.title}</h3>
                                <p className="mt-2 text-sm text-text-secondary leading-relaxed">{card.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </Section>

            <Section>
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">What the written outcome can include</h2>
                    <p className="mt-3 text-text-secondary">
                        Excerpts from the same visit, shown with short captions. Identifying details are not published on the site.
                        Click or tap an image to enlarge.
                    </p>
                </div>
                <div className="mt-10 grid gap-8 sm:grid-cols-2">
                    {evidenceItems.map((item) => (
                        <figure
                            key={item.src}
                            className="overflow-hidden rounded-xl border border-border-default bg-surface-alt"
                        >
                            <div className="relative bg-surface">
                                <ExpandableReportImage src={item.src} alt={item.alt} />
                            </div>
                            <figcaption className="border-t border-border-default px-4 py-3 text-sm text-text-secondary">
                                {item.caption}
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </Section>

            <Section className="bg-surface-alt/30">
                <div className="mx-auto max-w-4xl">
                    <h2 className="text-center text-2xl font-bold text-text-primary sm:text-3xl">
                        Code read vs proper diagnosis
                    </h2>
                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-border-default bg-surface-alt p-5">
                            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Cheap code read</p>
                            <ul className="mt-4 space-y-3 text-sm text-text-secondary">
                                {comparisonRows.map((row) => (
                                    <li key={row.cheap} className="border-l-2 border-text-muted/40 pl-3">
                                        {row.cheap}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-xl border border-brand/30 bg-brand/5 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wider text-brand">Proper diagnosis</p>
                            <ul className="mt-4 space-y-3 text-sm text-text-secondary">
                                {comparisonRows.map((row) => (
                                    <li key={row.proper} className="border-l-2 border-brand pl-3">
                                        {row.proper}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </Section>

            <Section>
                <div className="mx-auto max-w-3xl rounded-2xl border border-brand/20 bg-brand/5 p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-text-primary">Why diagnosis is worth paying for</h2>
                    <p className="mt-4 text-text-secondary leading-relaxed">
                        Standard Diagnosis starts from <span className="font-semibold text-brand-light">£{zoneA}</span> in Zone A
                        (travel and up to 60 minutes on-site included). That fee is not about “reading codes”—it is about time,
                        tooling, and judgement used to narrow the fault properly.
                    </p>
                    <p className="mt-4 text-text-secondary leading-relaxed">
                        The expensive option is often guessing: the wrong sensor, the wrong component replaced, or a regen or
                        cleaning that never addressed the root cause. A clear written outcome reduces that risk before you commit
                        to more spend.
                    </p>
                    <div className="mt-6">
                        <CTAButton
                            href="/pricing"
                            variant="outline"
                            onClick={() => trackNavClick('/pricing', 'View Pricing', 'sample_report_fee')}
                        >
                            View full pricing
                        </CTAButton>
                    </div>
                </div>
            </Section>

            <Section className="bg-surface-alt/30">
                <div className="mx-auto max-w-3xl">
                    <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">Who this is for</h2>
                    <ul className="mt-6 space-y-3 text-text-secondary">
                        {[
                            'Recurring or stubborn warning lights',
                            'Intermittent faults that do not show every time',
                            'Emissions-related warnings where you want a compliant, evidence-based answer',
                            'Another garage suggested a likely cause but did not prove it',
                            'You want a written answer before approving further parts or labour',
                        ].map((line) => (
                            <li key={line} className="flex gap-2">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                                <span>{line}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </Section>

            <Section>
                <div className="mx-auto max-w-3xl">
                    <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">Questions</h2>
                    <div className="mt-6">
                        <FaqAccordion items={pageFaqs} />
                    </div>
                </div>
            </Section>

            <Section className="border-t border-border-default bg-surface-alt/40 pb-12 md:pb-16">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">Ready for a proper answer?</h2>
                    <p className="mt-3 text-text-secondary">
                        Book Standard Diagnosis and get a written outcome tailored to your vehicle—not a generic code printout.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <CTAButton
                            href="/booking"
                            size="lg"
                            onClick={() => trackNavClick('/booking', 'Book Standard Diagnosis', 'sample_report_footer')}
                        >
                            Book Standard Diagnosis
                        </CTAButton>
                        <CTAButton
                            href="/pricing"
                            variant="outline"
                            size="lg"
                            onClick={() => trackNavClick('/pricing', 'View Pricing', 'sample_report_footer')}
                        >
                            View Pricing
                        </CTAButton>
                    </div>
                </div>
            </Section>
        </>
    );
}
