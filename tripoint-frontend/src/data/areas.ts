export interface AreaData {
    slug: string;
    name: string;
    intro: string;
    realJobDetail?: { summary: string; detail: string }[];
    localServices?: string[];
    garageNote?: string;
    faqs: { question: string; answer: string }[];
    nearbyAreas: string[];
    crossLinks?: { name: string; href: string }[];
}

export const areasData: Record<string, AreaData> = {
    greenwich: {
        slug: 'greenwich',
        name: 'Greenwich',
        intro:
            'We cover SE10, SE7, SE3, SE18 and the wider Greenwich borough from our Eltham base, typically 15 to 20 minutes via the A2 or A102 Blackwall Tunnel approach. We work across both residential driveways and commercial premises in the area, covering a wide range of Mercedes cars, vans, and commercial vehicles.',
        realJobDetail: [
            {
                summary: '2019 Sprinter 519 W907, SE10, DPF replacement and post-repair verification',
                detail:
                    'A 2019 Mercedes-Benz Sprinter 519 in the SE10 area required a full DPF replacement followed by two further visits to complete the repair with a genuine Mercedes unit and investigate a post-repair fume complaint. All work was carried out on site using Xentry to clear adaptive values and verify the repair.',
            },
        ],
        localServices: [
            'Standard Diagnosis (STAR/XENTRY)',
            'DPF diagnostics and post-repair verification',
            'Xentry coding and adaptive value resets',
            'VOR priority diagnostics for commercial vehicles',
            'Pre-purchase health checks at your location',
        ],
        faqs: [
            {
                question: 'Do you cover the Millennium Dome and Peninsula area?',
                answer:
                    'Yes. The Greenwich Peninsula, including the area around the O2, is within our coverage from the Eltham base. We can attend residential driveways, car parks, and commercial premises in SE10. Drive time is typically 15 to 20 minutes. Book online or call to confirm your zone.',
            },
            {
                question: 'Can you reach commercial depots near the A102?',
                answer:
                    'Yes. The A102 Blackwall Tunnel approach is one of our main routes into the Greenwich area. Depots, yards, and commercial premises along this corridor are well within our Zone A or Zone B coverage. We work on site at commercial locations.',
            },
            {
                question: 'Do you work on site at commercial premises in Greenwich?',
                answer:
                    'Yes. We attend commercial premises, depot yards, and business car parks across the Greenwich area. If you have a van or fleet vehicle that cannot be moved, we come to it. VOR priority bookings are available for urgent commercial jobs.',
            },
            {
                question: 'Which postcodes do you cover in Greenwich?',
                answer:
                    'We cover SE10, SE7, SE3, and SE18, along with the wider Greenwich borough boundary. If your postcode is close to the boundary, book online and enter your postcode to see your zone, or call 020 8058 6095 and we will confirm immediately.',
            },
            {
                question: 'Can you diagnose DPF and AdBlue faults in Greenwich?',
                answer:
                    'Yes. DPF diagnostics, forced regeneration decisions, AdBlue and SCR system fault finding are all services we provide across Greenwich. We diagnose before any regen or repair to make sure we address the root cause rather than masking a fault.',
            },
            {
                question: 'What is your availability for Greenwich?',
                answer:
                    'We operate Monday to Saturday. Greenwich is in our core zone and we can often offer same-day or next-day slots. Book online to see current availability or call 020 8058 6095.',
            },
        ],
        nearbyAreas: ['bexley', 'orpington', 'medway'],
        crossLinks: [
            { name: 'Standard Diagnosis', href: '/services/diagnostic-callout' },
            { name: 'DPF Diagnostics', href: '/blog/dpf-warning-light-regen-vs-worse' },
        ],
    },

    bexley: {
        slug: 'bexley',
        name: 'Bexley',
        intro:
            'We cover DA1 to DA17 from our Eltham base. Bexley, Sidcup, Welling, Erith, and Crayford are all within Zone A or Zone B. Drive time is typically 15 to 20 minutes via the A2 or A20. This page covers the full DA postcode zone, including areas previously listed separately under Sidcup.',
        realJobDetail: [
            {
                summary: '2014 Mercedes C-Class W205, DA5, fuel leak diagnosis and ECU repair',
                detail:
                    'Two separate C-Class W205 diagnostic and repair visits in the DA5 postcode area. The first covering a fuel leak fault and the second a full ECU replacement programmed via Xentry. Both jobs were completed on the customer driveway using dealer-level tooling.',
            },
            {
                summary: '2023 Mercedes eSprinter W910, DA area, mobile service',
                detail:
                    'An eSprinter service completed on site along the A2 corridor in the DA postcode area. Work included a service interval reset and system check using Xentry.',
            },
        ],
        localServices: [
            'Standard Diagnosis (STAR/XENTRY)',
            'Mercedes van and car diagnostics',
            'ECU replacement and programming via Xentry',
            'Mobile Sprinter servicing',
            'VOR priority diagnostics',
            'Pre-purchase health checks',
        ],
        faqs: [
            {
                question: 'Do you cover Crayford and Erith as well as Bexley town?',
                answer:
                    'Yes. Crayford (DA1), Erith (DA8), Welling (DA16), and Bexley town (DA5) are all within our coverage from the Eltham base. Your zone is confirmed at booking based on your postcode. Most DA postcodes fall into Zone A or Zone B.',
            },
            {
                question: 'Can you work on the industrial estates along the A206?',
                answer:
                    'Yes. We attend industrial estates, commercial yards, and depot sites along the A206 and surrounding roads. If your vehicle is on site and cannot be moved, we come to it. VOR bookings are available for urgent commercial jobs.',
            },
            {
                question: 'Do you cover Sidcup DA14 and DA15?',
                answer:
                    'Yes. Sidcup is now covered under this Bexley area page. DA14 and DA15 are within our normal coverage from the Eltham base, typically Zone A or Zone B. Enter your postcode when booking to confirm your exact zone.',
            },
            {
                question: 'What Mercedes vehicles do you work on in the Bexley area?',
                answer:
                    'We work on Mercedes Sprinter, Vito, Citan, eSprinter, V-Class, and other van and commercial platforms, as well as Mercedes cars including C-Class, E-Class, and A-Class where Xentry access applies. All diagnostics use dealer-level STAR/XENTRY.',
            },
            {
                question: 'Can you carry out ECU programming and coding in Bexley?',
                answer:
                    'Yes. ECU replacement programming, variant coding, and adaptations are all carried out on site using Xentry. We have completed ECU programming jobs in the DA5 postcode area. No workshop visit required.',
            },
            {
                question: 'How do I book a diagnostic in Bexley?',
                answer:
                    'Book online via our booking page or call 020 8058 6095. Enter your postcode to see your zone and price. We will confirm your slot and which base will serve you.',
            },
        ],
        nearbyAreas: ['greenwich', 'orpington', 'maidstone'],
        crossLinks: [
            { name: 'Standard Diagnosis', href: '/services/diagnostic-callout' },
            { name: 'Sprinter Servicing', href: '/services/sprinter-servicing' },
        ],
    },

    orpington: {
        slug: 'orpington',
        name: 'Orpington',
        intro:
            'We cover BR5, BR6, BR7, and BR8 from our Eltham base. Orpington, Chislehurst, Swanley, and Hextable are all within Zone A. Drive time is typically 20 to 25 minutes via the A20 or A224. We work on residential driveways, commercial premises, and independent garage premises across the Orpington area.',
        realJobDetail: [
            {
                summary: '2018 Mercedes Vito, BR6 Orpington, EZS ignition fault, same-day response',
                detail:
                    'A same-day priority booking for a 2018 Mercedes Vito with an EZS ignition fault, completed on a residential driveway in BR6. The fault was diagnosed and resolved on site using Xentry guided tests and component activation.',
            },
            {
                summary: 'Mercedes W176 A-Class, BR8, water ingress and non-start fault investigation',
                detail:
                    'A Mercedes A-Class W176 water ingress investigation in the BR8 Swanley area across two visits, tracing a non-start fault to moisture intrusion affecting a control module. Also: a pre-OBD Mercedes W201 190E electrical diagnostic in the BR8 Hextable area.',
            },
        ],
        garageNote:
            'We also carry out Xentry coding and programming work for independent garages in the Orpington area. If you are a garage looking for dealer-level coding support, get in touch to discuss your requirements.',
        localServices: [
            'Standard Diagnosis (STAR/XENTRY)',
            'VOR priority diagnostics',
            'EZS and ignition fault diagnosis',
            'ECU coding and programming for garages',
            'Water ingress and electrical fault finding',
            'Pre-purchase health checks',
        ],
        faqs: [
            {
                question: 'Do you cover Swanley and Hextable BR8 as well as Orpington BR6?',
                answer:
                    'Yes. BR8, covering Swanley and Hextable, is within our Zone A from the Eltham base. We have completed jobs in both BR8 and BR6. Enter your postcode when booking to confirm your zone.',
            },
            {
                question: 'Can you do Xentry coding at an independent garage premises?',
                answer:
                    'Yes. We carry out Xentry coding, ECU programming, and adaptations at independent garage premises in the Orpington area. If you are a garage that needs dealer-level coding support for a customer vehicle, get in touch to discuss the job.',
            },
            {
                question: 'Is Orpington a Zone A or Zone B from your base?',
                answer:
                    'The BR5 and BR6 postcodes are typically Zone A from our Eltham base, at approximately 20 to 25 minutes drive time. BR7 (Chislehurst) is also Zone A. BR8 (Swanley, Hextable) is typically Zone A or Zone B. Your exact zone is confirmed when you book by entering your postcode.',
            },
            {
                question: 'Can you diagnose EZS and ignition faults in Orpington?',
                answer:
                    'Yes. EZS ignition faults, key recognition issues, and related Xentry-only diagnostics are within our scope. We have completed same-day EZS diagnosis and repair in the BR6 area. Call or WhatsApp to discuss your fault before booking.',
            },
            {
                question: 'Do you cover Petts Wood and St Mary Cray?',
                answer:
                    'Yes. Petts Wood (BR5) and St Mary Cray (BR5) are both covered. These postcodes are in our Zone A from the Eltham base.',
            },
            {
                question: 'What Mercedes vehicles do you work on in Orpington?',
                answer:
                    'We work on Mercedes Sprinter, Vito, Citan, A-Class, C-Class, E-Class, and other models where Xentry access applies. We also cover pre-OBD Mercedes including W201 and similar older platforms where dealer diagnostics are needed.',
            },
        ],
        nearbyAreas: ['bexley', 'greenwich', 'maidstone'],
        crossLinks: [
            { name: 'VOR Diagnosis', href: '/services/vor-van-diagnostics' },
            { name: 'Standard Diagnosis', href: '/services/diagnostic-callout' },
        ],
    },

    maidstone: {
        slug: 'maidstone',
        name: 'Maidstone',
        intro:
            'We cover ME14, ME15, ME16, ME17, and surrounding villages from our Tonbridge base. Maidstone town centre is approximately 20 to 25 minutes via the A26 or M20. The A20 and M20 junction areas are also well within range. We work at residential addresses, commercial premises, and depot sites across the Maidstone area.',
        realJobDetail: [
            {
                summary: '2018 Mercedes diesel van, ME15, Service B plus NOx sensor fault diagnosis',
                detail:
                    'A Mercedes diesel van in ME15 required a Service B major service alongside diagnosis of live P2200 and P229F fault codes covering upstream and downstream NOx sensor faults. The job involved a pre-work consultation on genuine sensor costs and a diagnosis-first approach before committing to parts. Work carried out on site using Xentry.',
            },
        ],
        localServices: [
            'Standard Diagnosis (STAR/XENTRY)',
            'Mercedes van servicing (Minor and Major)',
            'NOx sensor and AdBlue/SCR diagnostics',
            'DPF diagnostics and fault finding',
            'VOR priority diagnostics',
            'Pre-purchase health checks',
        ],
        faqs: [
            {
                question: 'Do you cover Maidstone town centre and the Ring Road area?',
                answer:
                    'Yes. Maidstone town centre and the Ring Road area are within our normal coverage from the Tonbridge base, approximately 20 to 25 minutes via the A26 or M20. We attend residential driveways, commercial premises, and car parks across the ME14 and ME15 postcodes.',
            },
            {
                question: 'Can you work at commercial premises and depots around junction 7 of the M20?',
                answer:
                    'Yes. The M20 junction 7 area and nearby industrial and depot sites are well within our coverage. We attend commercial locations and can carry out on-site work for vans that cannot be moved. VOR priority bookings are available for urgent commercial jobs.',
            },
            {
                question: 'Do you cover the ME16 Barming and Allington areas?',
                answer:
                    'Yes. ME16, covering Barming, Allington, and the western side of Maidstone, is within our Zone A or Zone B coverage from the Tonbridge base. Enter your postcode when booking to confirm your exact zone.',
            },
            {
                question: 'Can you diagnose NOx sensor faults and AdBlue issues in Maidstone?',
                answer:
                    'Yes. NOx sensor faults (including P2200 and P229F codes), AdBlue system diagnostics, and SCR system fault finding are all within our scope. We take a diagnosis-first approach before recommending parts, and we discuss genuine versus aftermarket sensor options with you before committing.',
            },
            {
                question: 'Do you cover ME17 and the villages south of Maidstone?',
                answer:
                    'Yes. ME17, covering Chart Sutton, Headcorn, Lenham, and the villages south of Maidstone, is within our extended coverage from the Tonbridge base. Zone depends on drive time. Enter your postcode when booking.',
            },
            {
                question: 'What is your availability for Maidstone?',
                answer:
                    'We operate Monday to Saturday. Maidstone is within our core Kent coverage and we can often offer same-week availability. Call 020 8058 6095 or book online to check current slots.',
            },
        ],
        nearbyAreas: ['tonbridge', 'medway', 'bexley'],
        crossLinks: [
            { name: 'Sprinter Servicing', href: '/services/sprinter-servicing' },
            { name: 'AdBlue Diagnostics', href: '/blog/adblue-countdown-clearing-codes-not-fix' },
        ],
    },

    tonbridge: {
        slug: 'tonbridge',
        name: 'Tonbridge',
        intro:
            'Tonbridge is one of our two operating bases. Zone A covers Tonbridge, Hildenborough, Hadlow, and Paddock Wood. Sevenoaks, Tunbridge Wells, and Tonbridge town centre are all within 15 minutes. For customers in this area we often have same-week and occasionally same-day availability.',
        realJobDetail: [
            {
                summary: '2010 VW Golf 2.0 GTD, TN12 Paddock Wood, Stage 1 calibration after turbo replacement',
                detail:
                    'A 2010 VW Golf GTD in TN12 required a Stage 1 ECU calibration following a new turbo fitment, including a boost and back pressure check as part of the visit. Work was completed on site at the customer address in Paddock Wood.',
            },
            {
                summary: '2021 Mercedes diesel van, TN24 Ashford, EML diagnosis and CDI software update',
                detail:
                    'A 2021 Mercedes diesel van in TN24 Ashford required an EML diagnosis and CDI software update carried out on site using Xentry. The job was booked via our standard diagnosis service.',
            },
        ],
        localServices: [
            'Standard Diagnosis (STAR/XENTRY)',
            'Van ECU calibration and Stage 1 tuning',
            'CDI software updates and coding',
            'Mercedes van servicing (Minor and Major)',
            'DPF and AdBlue diagnostics',
            'VOR priority diagnostics',
        ],
        faqs: [
            {
                question: 'Can you come to my home in Tonbridge town centre?',
                answer:
                    'Yes. Tonbridge town centre is our home base. We can attend residential driveways, off-street parking, and commercial premises across Tonbridge. This is one of our most frequently served areas and we regularly have same-day or next-day availability.',
            },
            {
                question: 'Do you cover Paddock Wood, Hadlow, and the surrounding villages?',
                answer:
                    'Yes. Paddock Wood (TN12) and Hadlow (TN11) are both Zone A from our Tonbridge base and among our most regularly served postcodes. We have completed ECU calibration and servicing jobs in TN12. Villages between Tonbridge and Maidstone are also within our coverage.',
            },
            {
                question: 'Is Ashford within your coverage area from the Tonbridge base?',
                answer:
                    'Yes. Ashford (TN24, TN23) is within our extended coverage from the Tonbridge base, approximately Zone B or Zone C depending on the exact postcode. We have completed jobs in TN24. Enter your postcode when booking to confirm your zone.',
            },
            {
                question: 'Do you cover Hildenborough and Sevenoaks from Tonbridge?',
                answer:
                    'Yes. Hildenborough (TN11) is Zone A, typically under 10 minutes from our Tonbridge base. Sevenoaks (TN13, TN14, TN15) is also within our coverage, typically Zone A or Zone B. Both areas are served frequently.',
            },
            {
                question: 'Can you do ECU calibration and tuning work in Tonbridge?',
                answer:
                    'Yes. We carry out ECU calibration, Stage 1 tuning, CDI software updates, and Xentry coding across the Tonbridge area. If you have recently fitted a turbo or other drivetrain component and need the ECU recalibrated, get in touch to discuss the job before booking.',
            },
            {
                question: 'What is your typical availability for the Tonbridge area?',
                answer:
                    'As this is our home base, we often have same-day and same-week availability for Tonbridge postcodes. We operate Monday to Saturday. Book online or call 020 8058 6095 to check current slots.',
            },
        ],
        nearbyAreas: ['maidstone', 'orpington', 'medway'],
        crossLinks: [
            { name: 'Pricing and Zone Calculator', href: '/pricing' },
            { name: 'Van Load and Driveability Tune', href: '/services/van-load-driveability-tune' },
        ],
    },

    medway: {
        slug: 'medway',
        name: 'Gillingham and Medway',
        intro:
            'We cover the ME5, ME7, and ME8 postcodes covering Chatham, Gillingham, and Rainham from our Tonbridge base. Drive time is approximately 30 minutes via the A228 or A2. Medway is one of our most active Kent zones, with regular bookings for Mercedes van servicing, diagnostics, and Xentry coding across the area.',
        realJobDetail: [
            {
                summary: 'Mercedes V-Class W447 Marco Polo, ME7 Gillingham, major service, battery coding, and CV boot repair across multiple visits',
                detail:
                    'A Mercedes-Benz V-Class W447 Marco Polo in the ME7 area has been serviced across multiple visits including a major B-style service with ASSYST reset via Xentry, a Mercedes starter battery supply and fit with Xentry battery coding, and a CV boot repair. All work carried out on site at the customer address.',
            },
            {
                summary: 'Mercedes Sprinter W906, ME5 Chatham, mobile gearbox service and Xentry diagnostic check',
                detail:
                    'A Mercedes Sprinter W906 gearbox service in ME5 Chatham, including a Xentry quick test to check for any stored faults prior to completing the service. Work was carried out on site at the customer premises.',
            },
        ],
        localServices: [
            'Standard Diagnosis (STAR/XENTRY)',
            'VOR van diagnostics',
            'Mercedes van servicing (Minor and Major)',
            'Brakes',
            'Pre-purchase health checks',
            'Xentry coding and adaptations',
        ],
        faqs: [
            {
                question: 'Do you cover Chatham ME4 and ME5 as well as Gillingham ME7?',
                answer:
                    'Yes. Chatham (ME4, ME5) and Gillingham (ME7) are both within our coverage from the Tonbridge base. We have completed gearbox service and diagnostic work in ME5 Chatham. Enter your postcode when booking to confirm your zone.',
            },
            {
                question: 'Can you attend commercial premises and depot yards in the Medway area?',
                answer:
                    'Yes. We attend commercial premises, depot yards, and business car parks across the Medway area. If you have a van or fleet vehicle that cannot be moved, we come to it. VOR priority bookings are available for urgent commercial jobs in the ME postcode area.',
            },
            {
                question: 'How long does it take you to reach Gillingham from your Tonbridge base?',
                answer:
                    'Drive time from our Tonbridge base to Gillingham ME7 is approximately 30 minutes via the A228 or A2. This puts Gillingham in our Zone B for most bookings. Your exact zone is confirmed when you book using your postcode.',
            },
            {
                question: 'Do you service Mercedes V-Class and Marco Polo conversions?',
                answer:
                    'Yes. We have completed multiple service visits on a Mercedes V-Class W447 Marco Polo in the ME7 area, including major servicing with ASSYST reset, battery coding, and mechanical repairs. If you have a Marco Polo or other V-Class conversion, we can carry out dealer-level servicing on site.',
            },
            {
                question: 'Is Gillingham Zone B or Zone C from the Tonbridge base?',
                answer:
                    'Gillingham ME7 is typically Zone B from our Tonbridge base, based on a 30-minute drive time. Rainham ME8 is similar. Chatham ME4 and ME5 may be Zone B depending on traffic. Your exact zone is calculated at booking using your postcode and live routing.',
            },
            {
                question: 'Do you cover Rainham ME8 and the surrounding area?',
                answer:
                    'Yes. Rainham (ME8) is within our coverage from the Tonbridge base. It is typically Zone B. We also cover Hempstead Valley and the surrounding Medway villages. Enter your postcode when booking to confirm.',
            },
        ],
        nearbyAreas: ['maidstone', 'tonbridge', 'bexley'],
        crossLinks: [
            { name: 'Sprinter Servicing', href: '/services/sprinter-servicing' },
            { name: 'Mercedes Van Servicing', href: '/services/mercedes-van-servicing' },
            { name: 'Standard Diagnosis', href: '/services/diagnostic-callout' },
        ],
    },
};

export function getAreaData(slug: string): AreaData | undefined {
    return areasData[slug];
}
