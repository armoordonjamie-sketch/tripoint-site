export interface AreaData {
    slug: string;
    name: string;
    intro: string;
    included: string[];
    faqs: { question: string; answer: string }[];
    nearbyAreas: string[];
}

export const areasData: Record<string, AreaData> = {
    tonbridge: {
        slug: 'tonbridge',
        name: 'Tonbridge',
        intro:
            'TriPoint Diagnostics brings dealer-level Mercedes diagnostics and fault finding to Tonbridge and the surrounding area. We are a mobile service based in Tonbridge, so we come to you at home or work. STAR/XENTRY diagnostics, coding, DPF and AdBlue diagnostics, all with a compliance-first approach.',
        included: [
            'Dealer-level STAR/XENTRY diagnostics at your location',
            'Fault finding and guided component tests',
            'SCN coding and adaptations',
            'DPF and AdBlue/SCR diagnostics',
            'Up to 60 minutes on-site time (standard callout)',
            'Clear written report and next steps',
        ],
        faqs: [
            {
                question: 'How quickly can you get to Tonbridge?',
                answer:
                    'We are based in Tonbridge, so we can often offer same-day or next-day slots for Tonbridge postcodes. Book online or call to check availability.',
            },
            {
                question: 'Do you cover Tonbridge Wells and the surrounding villages?',
                answer:
                    'Yes. We cover Tonbridge, Tonbridge Wells, Hildenborough, Hadlow, and the wider Tonbridge area. Your zone is confirmed when you book based on drive time from our base.',
            },
            {
                question: 'What Mercedes vehicles do you work on in Tonbridge?',
                answer:
                    'We work on Mercedes Sprinter, Vito, Citan, and other Truck and Van platforms. We also cover Mercedes cars where Xentry access applies. All diagnostics are compliance-first.',
            },
            {
                question: 'Can you do DPF regens and AdBlue diagnostics in Tonbridge?',
                answer:
                    'Yes. We offer DPF diagnostics and forced regeneration, and AdBlue/SCR diagnostics. We diagnose before any regen or repair to avoid masking deeper faults.',
            },
        ],
        nearbyAreas: ['sevenoaks', 'tunbridge-wells', 'maidstone'],
    },
    sevenoaks: {
        slug: 'sevenoaks',
        name: 'Sevenoaks',
        intro:
            'TriPoint Diagnostics provides mobile Mercedes diagnostics and fault finding across Sevenoaks and the surrounding area. We come to you with dealer-level STAR/XENTRY equipment. Compliance-first diagnostics for Sprinter, Vito, and commercial vehicles.',
        included: [
            'Mobile STAR/XENTRY diagnostics at your location',
            'Fault finding and live data capture',
            'Coding and adaptations',
            'DPF and emissions diagnostics',
            'Up to 60 minutes on-site (standard callout)',
            'Clear written fix plan',
        ],
        faqs: [
            {
                question: 'Do you cover Sevenoaks town and the villages?',
                answer:
                    'Yes. We cover Sevenoaks town, Riverhead, Chipstead, Sundridge, and the wider Sevenoaks district. Zone is based on drive time from our Tonbridge base.',
            },
            {
                question: 'What is your typical availability for Sevenoaks?',
                answer:
                    'We operate Mon to Sat. Sevenoaks is in our core zone, so we can often offer same-day or next-day slots. Book online to see availability.',
            },
            {
                question: 'Can you diagnose Sprinter limp mode in Sevenoaks?',
                answer:
                    'Yes. We specialise in Sprinter limp mode and other Mercedes commercial vehicle faults. We use guided tests and live data, not just code clearing.',
            },
        ],
        nearbyAreas: ['tonbridge', 'orpington', 'bromley'],
    },
    bromley: {
        slug: 'bromley',
        name: 'Bromley',
        intro:
            'TriPoint Diagnostics offers mobile Mercedes diagnostics and fault finding in Bromley and the surrounding area. We bring dealer-level STAR/XENTRY to your home or workplace. Compliance-first approach for all diagnostics and repairs.',
        included: [
            'Dealer-level diagnostics at your location',
            'Fault finding with guided tests',
            'Coding and adaptations',
            'DPF, AdBlue and emissions diagnostics',
            'Standard callout includes up to 60 minutes on-site',
            'Written report and next steps',
        ],
        faqs: [
            {
                question: 'Which base serves Bromley?',
                answer:
                    'Bromley is typically served from our Eltham base. Your zone and price are confirmed when you book, based on drive time.',
            },
            {
                question: 'Do you cover Bromley town centre and the borough?',
                answer:
                    'Yes. We cover Bromley town, Chislehurst, Beckenham, Hayes, and the wider Bromley area. If you are within 60 minutes of our base, we can reach you.',
            },
            {
                question: 'Can you do pre-purchase health checks in Bromley?',
                answer:
                    'Yes. We offer pre-purchase digital health checks for used Mercedes and commercial vehicles. We come to the vehicle at a location that suits you.',
            },
        ],
        nearbyAreas: ['orpington', 'sidcup', 'bexley', 'lewisham'],
    },
    bexley: {
        slug: 'bexley',
        name: 'Bexley',
        intro:
            'TriPoint Diagnostics brings mobile Mercedes diagnostics to Bexley and the surrounding area. Dealer-level STAR/XENTRY at your location. We cover fault finding, coding, DPF and AdBlue diagnostics with a compliance-first approach.',
        included: [
            'Mobile STAR/XENTRY diagnostics',
            'Fault finding and live data',
            'Coding and adaptations',
            'DPF and AdBlue/SCR diagnostics',
            'Up to 60 minutes on-site (standard callout)',
            'Clear written report',
        ],
        faqs: [
            {
                question: 'Do you cover Bexleyheath and the wider borough?',
                answer:
                    'Yes. We cover Bexleyheath, Welling, Sidcup, Crayford, and the wider Bexley area. Zone is confirmed at booking based on drive time from our Eltham base.',
            },
            {
                question: 'What Mercedes vehicles do you work on in Bexley?',
                answer:
                    'We work on Mercedes Sprinter, Vito, Citan, and other commercial platforms, plus Mercedes cars where Xentry applies. All work is compliance-first.',
            },
            {
                question: 'How do I book a diagnostic in Bexley?',
                answer:
                    'Book online via our booking page, or call 020 8058 6095. Enter your postcode to see your zone and price. We will confirm your slot and base.',
            },
        ],
        nearbyAreas: ['sidcup', 'greenwich', 'dartford', 'bromley'],
    },
    greenwich: {
        slug: 'greenwich',
        name: 'Greenwich',
        intro:
            'TriPoint Diagnostics provides mobile Mercedes diagnostics and fault finding in Greenwich and the surrounding area. We come to you with dealer-level equipment. Compliance-first diagnostics for Sprinter, Vito, and commercial vehicles.',
        included: [
            'Dealer-level diagnostics at your location',
            'Fault finding and guided tests',
            'Coding and adaptations',
            'DPF and emissions diagnostics',
            'Up to 60 minutes on-site (standard callout)',
            'Written fix plan',
        ],
        faqs: [
            {
                question: 'Do you cover Greenwich town and the peninsula?',
                answer:
                    'Yes. We cover Greenwich town, the peninsula, Charlton, and the wider Greenwich area. Served from our Eltham base. Zone confirmed at booking.',
            },
            {
                question: 'Can you diagnose AdBlue and DPF issues in Greenwich?',
                answer:
                    'Yes. We offer AdBlue/SCR and DPF diagnostics. We diagnose before any regen or repair to ensure we address the root cause, not just the symptom.',
            },
            {
                question: 'What is your availability for Greenwich?',
                answer:
                    'We operate Mon to Sat. Greenwich is in our core zone, so we can often offer same-day or next-day slots. Book online to check.',
            },
        ],
        nearbyAreas: ['lewisham', 'bexley', 'eltham'],
    },
    lewisham: {
        slug: 'lewisham',
        name: 'Lewisham',
        intro:
            'TriPoint Diagnostics offers mobile Mercedes diagnostics in Lewisham and the surrounding area. We bring dealer-level STAR/XENTRY to your location. Compliance-first fault finding, coding, and emissions diagnostics.',
        included: [
            'Mobile STAR/XENTRY diagnostics',
            'Fault finding and live data',
            'Coding and adaptations',
            'DPF and AdBlue diagnostics',
            'Up to 60 minutes on-site (standard callout)',
            'Clear written report',
        ],
        faqs: [
            {
                question: 'Do you cover Lewisham town and the borough?',
                answer:
                    'Yes. We cover Lewisham town, Catford, Forest Hill, Sydenham, and the wider Lewisham area. Served from our Eltham base. Zone confirmed at booking.',
            },
            {
                question: 'Can you do VOR and fleet diagnostics in Lewisham?',
                answer:
                    'Yes. We offer VOR and priority triage for commercial vehicles, and fleet health checks. Get in touch to discuss your requirements.',
            },
            {
                question: 'How quickly can you get to Lewisham?',
                answer:
                    'Lewisham is in our core zone. We can often offer same-day or next-day slots. Book online or call 020 8058 6095 to check availability.',
            },
        ],
        nearbyAreas: ['greenwich', 'eltham', 'bromley'],
    },
    dartford: {
        slug: 'dartford',
        name: 'Dartford',
        intro:
            'TriPoint Diagnostics brings mobile Mercedes diagnostics to Dartford and the surrounding area. Dealer-level STAR/XENTRY at your location. We cover fault finding, coding, DPF and AdBlue diagnostics with a compliance-first approach.',
        included: [
            'Dealer-level diagnostics at your location',
            'Fault finding and guided tests',
            'Coding and adaptations',
            'DPF and AdBlue/SCR diagnostics',
            'Up to 60 minutes on-site (standard callout)',
            'Written report and next steps',
        ],
        faqs: [
            {
                question: 'Do you cover Dartford town and the outskirts?',
                answer:
                    'Yes. We cover Dartford town, Greenhithe, Swanscombe, and the wider Dartford area. Zone is based on drive time from our nearest base.',
            },
            {
                question: 'Can you diagnose Sprinter and Vito in Dartford?',
                answer:
                    'Yes. We specialise in Mercedes Sprinter, Vito, Citan, and other commercial platforms. All diagnostics use guided tests and live data.',
            },
            {
                question: 'What is your typical availability for Dartford?',
                answer:
                    'We operate Mon to Sat. Dartford is well within our coverage. Book online to see availability and confirm your zone.',
            },
        ],
        nearbyAreas: ['gravesend', 'bexley', 'sidcup'],
    },
    orpington: {
        slug: 'orpington',
        name: 'Orpington',
        intro:
            'TriPoint Diagnostics provides mobile Mercedes diagnostics in Orpington and the surrounding area. We come to you with dealer-level STAR/XENTRY. Compliance-first diagnostics for Sprinter, Vito, and commercial vehicles.',
        included: [
            'Mobile STAR/XENTRY diagnostics',
            'Fault finding and live data',
            'Coding and adaptations',
            'DPF and emissions diagnostics',
            'Up to 60 minutes on-site (standard callout)',
            'Clear written fix plan',
        ],
        faqs: [
            {
                question: 'Do you cover Orpington town and the villages?',
                answer:
                    'Yes. We cover Orpington town, Petts Wood, St Mary Cray, and the wider Orpington area. Zone confirmed at booking based on drive time.',
            },
            {
                question: 'Can you do pre-purchase checks in Orpington?',
                answer:
                    'Yes. We offer pre-purchase digital health checks for used Mercedes and commercial vehicles. We come to the vehicle at a location that suits you.',
            },
            {
                question: 'How do I book a diagnostic in Orpington?',
                answer:
                    'Book online via our booking page, or call 020 8058 6095. Enter your postcode to see your zone and price. We will confirm your slot.',
            },
        ],
        nearbyAreas: ['bromley', 'sidcup', 'sevenoaks'],
    },
    sidcup: {
        slug: 'sidcup',
        name: 'Sidcup',
        intro:
            'TriPoint Diagnostics offers mobile Mercedes diagnostics and fault finding in Sidcup and the surrounding area. We bring dealer-level equipment to your location. Compliance-first approach for all diagnostics.',
        included: [
            'Dealer-level diagnostics at your location',
            'Fault finding and guided tests',
            'Coding and adaptations',
            'DPF and AdBlue diagnostics',
            'Up to 60 minutes on-site (standard callout)',
            'Written report and next steps',
        ],
        faqs: [
            {
                question: 'Do you cover Sidcup town and the surrounding area?',
                answer:
                    'Yes. We cover Sidcup, Foots Cray, and the wider Bexley borough. Served from our Eltham base. Zone confirmed at booking.',
            },
            {
                question: 'Can you diagnose AdBlue countdown in Sidcup?',
                answer:
                    'Yes. We offer AdBlue and SCR diagnostics. We diagnose before any code clearing to find the root cause. Compliance-first approach.',
            },
            {
                question: 'What Mercedes vehicles do you work on in Sidcup?',
                answer:
                    'We work on Mercedes Sprinter, Vito, Citan, and other Truck and Van platforms, plus Mercedes cars where Xentry applies.',
            },
        ],
        nearbyAreas: ['bexley', 'eltham', 'orpington', 'dartford'],
    },
    eltham: {
        slug: 'eltham',
        name: 'Eltham',
        intro:
            'TriPoint Diagnostics is based in Eltham and provides mobile Mercedes diagnostics across Eltham and the surrounding area. We bring dealer-level STAR/XENTRY to your home or workplace. Compliance-first diagnostics for Sprinter, Vito, and commercial vehicles.',
        included: [
            'Dealer-level STAR/XENTRY diagnostics at your location',
            'Fault finding and guided tests',
            'Coding and adaptations',
            'DPF and AdBlue/SCR diagnostics',
            'Up to 60 minutes on-site (standard callout)',
            'Clear written report',
        ],
        faqs: [
            {
                question: 'How quickly can you get to Eltham?',
                answer:
                    'We are based in Eltham, so we can often offer same-day or next-day slots for Eltham postcodes. Book online or call to check availability.',
            },
            {
                question: 'Do you cover Eltham town and the surrounding areas?',
                answer:
                    'Yes. We cover Eltham town, Mottingham, New Eltham, and the wider Greenwich and Bexley borders. Zone confirmed at booking.',
            },
            {
                question: 'Can you do DPF regens and AdBlue diagnostics in Eltham?',
                answer:
                    'Yes. We offer DPF diagnostics and forced regeneration, and AdBlue/SCR diagnostics. We diagnose first to avoid masking deeper faults.',
            },
        ],
        nearbyAreas: ['greenwich', 'lewisham', 'sidcup', 'bexley'],
    },
    'tunbridge-wells': {
        slug: 'tunbridge-wells',
        name: 'Tunbridge Wells',
        intro:
            'TriPoint Diagnostics brings mobile Mercedes diagnostics to Tunbridge Wells and the surrounding area. We come to you with dealer-level STAR/XENTRY. Compliance-first fault finding, coding, and emissions diagnostics for Sprinter, Vito, and commercial vehicles.',
        included: [
            'Mobile STAR/XENTRY diagnostics at your location',
            'Fault finding and live data',
            'Coding and adaptations',
            'DPF and AdBlue diagnostics',
            'Up to 60 minutes on-site (standard callout)',
            'Written fix plan',
        ],
        faqs: [
            {
                question: 'Do you cover Tunbridge Wells town and the villages?',
                answer:
                    'Yes. We cover Tunbridge Wells town, Southborough, Rusthall, and the wider area. Zone is based on drive time from our Tonbridge base.',
            },
            {
                question: 'Can you diagnose Sprinter limp mode in Tunbridge Wells?',
                answer:
                    'Yes. We specialise in Sprinter limp mode and other Mercedes commercial faults. We use guided tests and live data, not just code clearing.',
            },
            {
                question: 'What is your availability for Tunbridge Wells?',
                answer:
                    'We operate Mon to Sat. Tunbridge Wells is in our core zone. Book online to see availability and confirm your slot.',
            },
        ],
        nearbyAreas: ['tonbridge', 'sevenoaks', 'maidstone'],
    },
    maidstone: {
        slug: 'maidstone',
        name: 'Maidstone',
        intro:
            'TriPoint Diagnostics provides mobile Mercedes diagnostics in Maidstone and the surrounding area. We bring dealer-level STAR/XENTRY to your location. Compliance-first diagnostics for Sprinter, Vito, and commercial vehicles.',
        included: [
            'Dealer-level diagnostics at your location',
            'Fault finding and guided tests',
            'Coding and adaptations',
            'DPF and emissions diagnostics',
            'Up to 60 minutes on-site (standard callout)',
            'Clear written report',
        ],
        faqs: [
            {
                question: 'Do you cover Maidstone town and the outskirts?',
                answer:
                    'Yes. We cover Maidstone town, Bearsted, Detling, and the wider Maidstone area. Zone is based on drive time from our Tonbridge base.',
            },
            {
                question: 'Can you do fleet diagnostics in Maidstone?',
                answer:
                    'Yes. We offer fleet health checks and VOR triage for commercial vehicles. Get in touch to discuss your fleet requirements.',
            },
            {
                question: 'What Mercedes vehicles do you work on in Maidstone?',
                answer:
                    'We work on Mercedes Sprinter, Vito, Citan, and other Truck and Van platforms. All diagnostics are compliance-first.',
            },
        ],
        nearbyAreas: ['tonbridge', 'tunbridge-wells', 'gravesend'],
    },
    gravesend: {
        slug: 'gravesend',
        name: 'Gravesend',
        intro:
            'TriPoint Diagnostics offers mobile Mercedes diagnostics and fault finding in Gravesend and the surrounding area. We come to you with dealer-level STAR/XENTRY. Compliance-first approach for all diagnostics and repairs.',
        included: [
            'Mobile STAR/XENTRY diagnostics',
            'Fault finding and live data',
            'Coding and adaptations',
            'DPF and AdBlue/SCR diagnostics',
            'Up to 60 minutes on-site (standard callout)',
            'Written report and next steps',
        ],
        faqs: [
            {
                question: 'Do you cover Gravesend town and the surrounding area?',
                answer:
                    'Yes. We cover Gravesend town, Northfleet, and the wider Gravesham area. Zone is based on drive time from our nearest base.',
            },
            {
                question: 'Can you diagnose DPF and AdBlue issues in Gravesend?',
                answer:
                    'Yes. We offer DPF diagnostics and forced regeneration, and AdBlue/SCR diagnostics. We diagnose before any regen or repair.',
            },
            {
                question: 'What is your typical availability for Gravesend?',
                answer:
                    'We operate Mon to Sat. Gravesend is within our coverage. Book online to see availability and confirm your zone.',
            },
        ],
        nearbyAreas: ['dartford', 'maidstone'],
    },
};

export function getAreaData(slug: string): AreaData | undefined {
    return areasData[slug];
}
