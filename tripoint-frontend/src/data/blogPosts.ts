export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    category: string;
    publishedAt: string;
    /** ISO date when content was materially updated (optional; defaults to publishedAt in schema) */
    updatedAt?: string;
    content: string;
    relatedServices: string[];
    ogImage?: string;
    ogImageAlt?: string;
    thumbnail?: string;
    author?: string;
    /** Optional FAQ items for FAQPage schema and visible FAQ block */
    faqs?: { question: string; answer: string }[];
}

export const blogPosts: BlogPost[] = [
    {
        slug: 'om654-turbo-failure-sprinter-vito',
        title: 'Why OM654 Turbochargers Are Failing in Mercedes Sprinter and Vito',
        description: 'Real workshop-level technical breakdown of OM654 turbo failures in W907 Sprinter and W447 Vito. Root causes, symptoms, repair costs, and prevention.',
        category: 'Mercedes',
        publishedAt: '2026-02-23',
        updatedAt: '2026-05-24',
        ogImage: '/images/blog/om654-turbo-failure/om654-turbo-compressor-split.jpeg',
        ogImageAlt: 'Split turbocharger compressor wheel showing catastrophic failure on Mercedes OM654 engine',
        thumbnail: '/images/blog/om654-turbo-failure/om654-turbo-compressor-split.jpeg',
        author: 'Jamie Armoordon',
        relatedServices: ['diagnostic-callout'],
        content: `
            <div class="blog-lead">
                At TriPoint Diagnostics Ltd (covering Kent and London), we're seeing a clear pattern: OM654 turbo failures are disproportionately common in commercial vans - especially the Sprinter (W907/VS30) and Vito (W447) - compared with passenger-car applications. The root cause isn't a defective turbocharger. It's emissions-driven thermal stress combined with lubrication degradation.
            </div>

            <figure class="blog-image">
                <img src="/images/blog/om654-turbo-failure/om654-turbo-compressor-split.jpeg" alt="Split turbocharger compressor wheel showing catastrophic failure on Mercedes OM654 engine" loading="lazy" />
                <figcaption>Catastrophic compressor wheel failure on an OM654 turbocharger - a pattern we're seeing repeatedly on Sprinters and Vitos.</figcaption>
            </figure>

            <div class="blog-takeaway">
                <span class="takeaway-label">Key point</span>
                <p>The turbo itself isn't necessarily weak - it's often manufactured by Garrett, a well-known and generally reliable manufacturer. <strong>The operating environment is what kills it.</strong></p>
            </div>

            <h2>The core reason: the OM654 turbo sits in a much hotter emissions layout</h2>
            <p>On the OM654, the aftertreatment layout is designed to stay hot and work fast - especially for modern Euro 6d/RDE targets. The close-coupled DOC followed by urea injection/mixing and a DPF/SCR unit means a compact "close to the engine" emissions system.</p>

            <div class="blog-callout">
                <p>Close-coupled emissions system (DPF/cat directly below the turbo compared to OM651) → <strong>significantly higher turbo operating temperature.</strong></p>
            </div>

            <p>That's great for emissions compliance. But it pushes more heat into the turbo's neighbourhood, and that heat has consequences.</p>

            <figure class="blog-image">
                <img src="/images/blog/om654-turbo-failure/om654-engine-exhaust-system-diagram.avif" alt="OM654 engine exhaust and aftertreatment system diagram showing close-coupled DPF and SCR layout" loading="lazy" />
                <figcaption>OM654 exhaust system layout - note the close-coupled aftertreatment positioning directly below the turbocharger.</figcaption>
            </figure>

            <hr class="blog-divider"/>

            <h2>Regeneration heat is the turbo's worst enemy (and vans trigger it more often)</h2>
            <p>DPF regeneration is basically the ECU intentionally raising exhaust temps to burn soot out of the filter. During active regen, typical target temperature is around 600-700°C.</p>

            <p>Repeated regen cycles cause:</p>
            <ul>
                <li>Extreme turbo thermal cycling</li>
                <li>Bearing fatigue</li>
                <li>Oil breakdown</li>
                <li>Shaft distortion</li>
            </ul>

            <div class="blog-callout">
                <p>And it's especially problematic in vans doing <strong>short trips, urban stop/start, and delivery work</strong> - which is exactly typical W907/W447 usage.</p>
            </div>

            <hr class="blog-divider"/>

            <h2>Lubrication breakdown: the silent killer</h2>
            <p>The turbo bearings live off a thin oil film. When the turbo runs hotter (and heat-soaks more), oil is more likely to degrade. Extended oil service intervals make this significantly worse.</p>

            <div class="blog-step"><span class="step-num">1</span> Oil feed restriction from carbon buildup</div>
            <div class="blog-step"><span class="step-num">2</span> Oil degradation from excessive heat</div>
            <div class="blog-step"><span class="step-num">3</span> Oil coking inside the turbo bearing housing</div>
            <div class="blog-step"><span class="step-num">4</span> Reduced lubrication film strength</div>

            <p>That chain leads to: shaft play → seal control issues → oil migration → failure or seizure.</p>

            <figure class="blog-image">
                <img src="/images/blog/om654-turbo-failure/om654-oil-pouring-out-charge-air-cooler.jpeg" alt="Engine oil pouring out of OM654 charge air cooler showing turbo seal failure" loading="lazy" />
                <figcaption>Oil pouring out of the charge air cooler - clear evidence of turbo seal failure allowing oil to migrate through the boost system.</figcaption>
            </figure>

            <hr class="blog-divider"/>

            <h2>Single turbo design under commercial duty</h2>
            <p>The OM654 uses a single turbo doing all the work in a heavy van duty cycle. That means high average turbine load - especially when regen and high EGR/boost strategies are in play.</p>

            <div class="blog-takeaway">
                <span class="takeaway-label">Workshop translation</span>
                <p>"It's not some no-name unit - the environment is killing it." Many OM654 Sprinter turbo listings are indeed Garrett-referenced by OE number.</p>
            </div>

            <hr class="blog-divider"/>

            <h2>Why OM651 turbos often lasted longer</h2>
            <p>The previous-generation OM651 had several advantages that helped turbo longevity:</p>
            <ul class="blog-checklist">
                <li>Lower exhaust temps (less thermal stress in the turbo area)</li>
                <li>Twin turbo load distribution / bigger single turbo design</li>
                <li>Less aggressive regen strategy</li>
                <li>More robust oil viscosity spec / oil change intervals (in many real-world fleets)</li>
                <li>Less tightly integrated emissions system</li>
            </ul>

            <div class="blog-callout">
                <p>A major technical difference: OM651 high-output variants use <strong>dual-stage turbocharging</strong> (small high-pressure + large low-pressure turbo). The boost work is split across stages instead of one unit constantly eating everything.</p>
            </div>

            <p>Typical OM651 failure pattern (what we see):</p>
            <ul>
                <li>60k-120k miles turbo failure window</li>
                <li>Often oil present in intake/intercooler</li>
                <li>Shaft play increasing before failure</li>
                <li>Frequently occurs with DPF/EGR issues</li>
            </ul>

            <hr class="blog-divider"/>

            <h2>Why we're not seeing these failures as often in passenger cars</h2>
            <p>The W907 Sprinter and W447 Vito are particularly vulnerable because of:</p>
            <ul>
                <li>Heavy vehicle load</li>
                <li>Frequent stop/start driving</li>
                <li>Long idle times</li>
                <li>Frequent DPF regeneration</li>
                <li>Commercial duty cycle</li>
            </ul>
            <p>Passenger cars generally see fewer failures because their duty cycle is usually kinder: fewer interrupted regens, less idling, more steady-state cruising.</p>

            <hr class="blog-divider"/>

            <h2>Symptoms and failure modes: what owners actually notice</h2>

            <div class="blog-step"><span class="step-num">1</span> Shaft play and bearing wear (caught early = best outcome)</div>
            <p><strong>Symptoms:</strong> whining noise, loss of boost, oil in intake/intercooler.</p>
            <p><strong>Cause:</strong> oil breakdown and bearing wear.</p>
            <div class="blog-callout">
                <p>If you catch it here, you're often saving the whole intake/emissions system from becoming an oil trap.</p>
            </div>

            <figure class="blog-image">
                <img src="/images/blog/om654-turbo-failure/om654-charge-air-cooler-oil-carbo.jpeg" alt="Carbon and oil contamination inside OM654 charge air cooler from turbo failure" loading="lazy" />
                <figcaption>Carbon and oil buildup inside the charge air cooler - contamination from a failing turbo that wasn't caught early enough.</figcaption>
            </figure>

            <div class="blog-step"><span class="step-num">2</span> Turbo seizure / catastrophic failure (the expensive version)</div>
            <p><strong>Symptoms:</strong> sudden loss of power, limp mode, no boost. In severe cases: non-start or major running issues if enough oil enters cylinders.</p>

            <div class="blog-takeaway">
                <span class="takeaway-label">⚠️ Hydrolock risk</span>
                <p>When cylinders fill with oil, the real risk is <strong>liquid ingestion / hydrolock</strong> - a known mechanism that can cause severe damage including bent connecting rods.</p>
            </div>

            <figure class="blog-image">
                <img src="/images/blog/om654-turbo-failure/om654-intake-ports-full-of-oil.jpeg" alt="OM654 intake ports completely saturated with engine oil from turbo failure" loading="lazy" />
                <figcaption>Intake ports completely saturated with oil - this level of contamination risks hydrolock and catastrophic engine damage.</figcaption>
            </figure>

            <figure class="blog-image">
                <img src="/images/blog/om654-turbo-failure/om654-glow-plugs-oil-contamination.jpeg" alt="Oil-contaminated glow plugs removed from OM654 engine after turbo failure" loading="lazy" />
                <figcaption>Glow plugs removed from this OM654 - covered in oil that migrated through the intake from the failed turbo.</figcaption>
            </figure>

            <figure class="blog-image">
                <img src="/images/blog/om654-turbo-failure/om654-oil-in-tailpipe.jpeg" alt="Visible oil residue in exhaust tailpipe indicating severe turbo oil migration on Mercedes" loading="lazy" />
                <figcaption>Oil residue visible in the exhaust tailpipe - a sign that turbo oil migration has contaminated the entire exhaust tract.</figcaption>
            </figure>

            <hr class="blog-divider"/>

            <h2>Why the closely integrated emissions system increases risk</h2>
            <p>Closely integrated emissions systems increase the risk of:</p>
            <ul>
                <li>Soot contamination entering the turbine housing</li>
                <li>Oil contamination from blow-by</li>
                <li>Carbon buildup affecting turbo seals</li>
            </ul>

            <p>Also worsened by:</p>
            <ul>
                <li>Extended oil change intervals</li>
                <li>Low-viscosity oil spec (where the oil has less tolerance once heat degradation starts)</li>
                <li>Aggressive EGR use</li>
                <li>Higher boost pressures</li>
                <li>More frequent regen cycles</li>
                <li>Higher sustained turbine load</li>
            </ul>

            <hr class="blog-divider"/>

            <h2>Repair costs: why early diagnosis is everything</h2>

            <div class="blog-step"><span class="step-num">✓</span> If caught early</div>
            <p>Diagnosed before it becomes an oil-dump situation: as low as <strong>~£1,500</strong> for parts and labour to fit a remanufactured turbo (vehicle-dependent, access-dependent, assuming no extra faults).</p>

            <div class="blog-step"><span class="step-num">✗</span> If left too long</div>
            <p>If the turbo starts passing significant oil, it can contaminate:</p>
            <ul class="blog-checklist">
                <li>Charge air cooler (intercooler)</li>
                <li>Intake manifold</li>
                <li>EGR coolers / EGR tract</li>
            </ul>

            <div class="blog-callout">
                <p>MAHLE specifically notes that after turbocharger damage, the charge air cooler must be checked and may need replacing - internal contamination can't always be removed reliably. In the worst cases, oil ingestion can lead to <strong>hydrolock-type damage including bent rods.</strong></p>
            </div>

            <hr class="blog-divider"/>

            <h2>What can you do to reduce the risk?</h2>

            <div class="blog-step"><span class="step-num">1</span> Don't stick rigidly to the longest Mercedes oil interval for commercial use</div>
            <p>If your interval is typically 2 years or 40,000 km, consider making it <strong>1 year or 20,000 km</strong> - especially for urban/delivery vans.</p>

            <div class="blog-step"><span class="step-num">2</span> Disable stop/start for heavy urban duty</div>
            <p>This can reduce repeated heat-soak cycles and constant restart demand. (Trade-off: fuel economy.)</p>

            <div class="blog-step"><span class="step-num">3</span> Reduce short drives / give it a proper run</div>
            <p>Short trips and interrupted regens are turbo punishment. A regular longer run helps the DPF complete regeneration cleanly and reduces repeated "attempted" regen cycles.</p>

            <hr class="blog-divider"/>

            <h2>Final takeaway</h2>
            <div class="blog-takeaway">
                <span class="takeaway-label">The bottom line</span>
                <p>The OM654 turbo failure issue is fundamentally caused by <strong>emissions-driven thermal stress + lubrication degradation</strong> - not a simple defective turbocharger.</p>
            </div>

            <div class="blog-cta-box">
                <p><strong>Hearing whining, seeing oil in boost pipes, or getting underboost/limp mode on a W907 Sprinter or W447 Vito?</strong></p>
                <p>The best money you'll spend is a proper diagnostic before it escalates. Book a <a href="/services/diagnostic-callout">Standard Diagnosis</a> - we cover all limp mode, emissions, and turbo-related faults in one visit.</p>
            </div>
        `,
    },
    {
        slug: 'sprinter-limp-mode-proper-diagnostic',
        title: 'Sprinter Limp Mode: What a Proper Diagnostic Looks Like',
        description: 'Common triggers for Sprinter limp mode, why code-clearing doesn\'t work, and what a proper diagnostic session involves.',
        category: 'Mercedes',
        publishedAt: '2026-05-23',
        updatedAt: '2026-05-24',
        ogImage: '/images/gallery/work-31.jpg',
        ogImageAlt: 'Sprinter instrument cluster with multiple warning lights active',
        author: 'Jamie Armoordon',
        thumbnail: '/images/gallery/work-31.jpg',
        relatedServices: ['diagnostic-callout'],
        content: `
            <div class="blog-lead">
                Sprinter limp mode is frustrating for one reason: it turns a working van into a liability. You feel it immediately - reduced power, limited revs, poor pull, sometimes a speed limiter, and a dashboard that looks like a Christmas tree.
            </div>

            <figure class="blog-image">
                <img src="/images/optimized/gallery/work-31.jpg" alt="Sprinter instrument cluster with multiple warning lights active" loading="lazy" />
            </figure>

            <p>A lot of people try the quick route: clear the codes and hope it's gone. Sometimes the van feels better for a short while… until the same fault is detected again and the power drops back.</p>

            <div class="blog-takeaway">
                <span class="takeaway-label">Key point</span>
                <p>Limp mode isn't the fault - it's the van's <strong>response</strong> to a fault. This post explains what "proper diagnostics" actually looks like on W906 and W907 Sprinters, and why it saves money compared to guessing.</p>
            </div>

            <h2>What limp mode really is (in plain terms)</h2>
            <p>Your ECU has a target for what the engine should be doing - boost, fuel pressure, airflow, temperatures, emissions targets. If the ECU sees readings that don't match what it expects (or a component doesn't respond correctly), it will reduce torque to protect the engine and drivetrain.</p>

            <div class="blog-callout">
                <p>So the real question isn't "How do we get it out of limp mode?"<br/>It's: <strong>Why did the ECU decide to protect itself?</strong></p>
            </div>

            <hr class="blog-divider"/>

            <h2>Common triggers we see on W906 / W907</h2>
            <p>Limp mode can be caused by loads of things, but these are the common patterns that show up in real jobs.</p>

            <div class="blog-step"><span class="step-num">1</span> Boost control problems (very common)</div>
            <ul>
                <li>Sticky or failing turbo actuator</li>
                <li>Wastegate/actuator control not matching requested position</li>
                <li>MAP/boost sensor issues</li>
                <li>Split intercooler hose / loose clamp / cracked charge pipe</li>
            </ul>
            <div class="blog-symptom">No pull, underboost codes, worse under load</div>

            <figure class="blog-image">
                <img src="/images/optimized/gallery/work-22.jpg" alt="Damaged turbocharger with sheared metal inside housing" loading="lazy" />
            </figure>

            <div class="blog-step"><span class="step-num">2</span> Fuel rail pressure deviation</div>
            <ul>
                <li>Rail pressure sensor faults</li>
                <li>Pressure control valve issues</li>
                <li>Supply side problems (filter restriction, air ingress, weak pump)</li>
            </ul>
            <div class="blog-symptom">Hesitation, limp under acceleration, sometimes hard starting</div>

            <div class="blog-step"><span class="step-num">3</span> EGR / intake faults</div>
            <ul>
                <li>EGR valve sticking or failing electrically</li>
                <li>Cooler issues</li>
                <li>Carbon buildup affecting airflow plausibility</li>
            </ul>
            <div class="blog-symptom">Poor response, smoke, flat spots, recurring derate</div>

            <figure class="blog-image">
                <img src="/images/optimized/gallery/work-26.jpg" alt="Fouled EGR pipe with thick carbon soot on white Sprinter" loading="lazy" />
            </figure>

            <div class="blog-step"><span class="step-num">4</span> DPF/emissions-related derate</div>
            <p>Sometimes the van derates due to the system detecting conditions that prevent normal operation (regen inhibited, sensor plausibility, etc.). You can waste days chasing "turbo issues" when the van is actually pulling power for another reason.</p>

            <div class="blog-step"><span class="step-num">5</span> Intermittent electrical faults</div>
            <ul>
                <li>Wiring rub-through</li>
                <li>Connector pin fitment problems</li>
                <li>Water ingress</li>
                <li>CAN communication faults</li>
            </ul>
            <div class="blog-symptom">Random limp mode that appears/disappears, comes back on bumps or in rain</div>

            <figure class="blog-image">
                <img src="/images/optimized/gallery/work-05.jpg" alt="Damaged wiring loom in Sprinter engine bay with frayed cables" loading="lazy" />
            </figure>

            <hr class="blog-divider"/>

            <h2>Why code-clearing rarely solves it</h2>
            <p>Clearing codes can remove the warning light temporarily, but it doesn't change what the sensors are reading or how components are behaving.</p>
            <p>If the ECU still detects:</p>
            <ul class="blog-checklist">
                <li>boost not matching request</li>
                <li>rail pressure out of target</li>
                <li>an actuator not responding</li>
                <li>implausible sensor signals</li>
            </ul>
            <p>…the van will derate again. Sometimes immediately, sometimes after a drive cycle, sometimes the moment it sees load.</p>

            <hr class="blog-divider"/>

            <h2>What a proper diagnostic session actually involves</h2>
            <p>Here's what "done properly" means for a limp mode job.</p>

            <div class="blog-step"><span class="step-num">1</span> Confirm the symptom and the conditions</div>
            <p>We start by asking the questions that matter:</p>
            <ul class="blog-checklist">
                <li>Does it happen under load, uphill, towing, motorway, or any time?</li>
                <li>Does it reset after ignition cycle?</li>
                <li>Has anything been replaced already?</li>
                <li>Any recent servicing, DPF work, AdBlue top ups, or battery issues?</li>
            </ul>
            <div class="blog-callout"><p>This matters because limp mode patterns are often repeatable once you know the conditions.</p></div>

            <div class="blog-step"><span class="step-num">2</span> Full vehicle scan (not just engine)</div>
            <p>A quick engine-only scan misses context. We scan across modules to see:</p>
            <ul class="blog-checklist">
                <li>what's current vs stored vs pending</li>
                <li>what's linked</li>
                <li>what appeared first (often the key clue)</li>
            </ul>

            <figure class="blog-image">
                <img src="/images/optimized/gallery/work-48.jpg" alt="Teslong borescope inspecting Sprinter engine bay with Milwaukee tools" loading="lazy" />
            </figure>

            <div class="blog-step"><span class="step-num">3</span> Live data capture: "requested vs actual"</div>
            <p>This is where the truth lives. Examples of what we'll log depending on the symptom:</p>
            <ul>
                <li>Boost requested vs actual</li>
                <li>MAF/MAP plausibility</li>
                <li>Turbo actuator position requested vs actual</li>
                <li>Rail pressure requested vs actual</li>
                <li>EGR command vs feedback</li>
                <li>Temperatures and plausibility where needed</li>
            </ul>

            <div class="blog-step"><span class="step-num">4</span> Guided tests and actuations</div>
            <p>This is the difference between reading a fault and <strong>proving it</strong>. We'll command components where possible and check response:</p>
            <ul class="blog-checklist">
                <li>Actuator sweep</li>
                <li>EGR operation</li>
                <li>Sensor plausibility checks</li>
                <li>System tests that confirm whether the component can actually do its job</li>
            </ul>

            <div class="blog-step"><span class="step-num">5</span> Physical verification</div>
            <p>Because software isn't everything. A proper diagnostic always includes real-world checks:</p>
            <ul class="blog-checklist">
                <li>Boost hose integrity</li>
                <li>Vacuum lines (where applicable)</li>
                <li>Connector checks</li>
                <li>Wiring inspection in common rub points</li>
            </ul>

            <div class="blog-step"><span class="step-num">6</span> A written fix plan</div>
            <div class="blog-callout">
                <p>You shouldn't be left with "might be this." We provide:</p>
            </div>
            <ul class="blog-checklist">
                <li>what we found</li>
                <li>what the evidence says</li>
                <li>what needs doing next</li>
                <li>what can be done mobile vs what needs workshop time</li>
                <li>how we'll verify it's fixed</li>
            </ul>

            <hr class="blog-divider"/>

            <h2>Common fault codes associated with Sprinter limp mode</h2>
            <p>The most common codes that accompany limp mode on the W906 and W907 Sprinter with OM651 engine are P0234 (turbo overboost), P0299 (turbo underboost or low boost), P0401 (insufficient EGR flow), and P2563 (turbo actuator position sensor). On the OM654 engine found in the W907, P0299 and boost-related codes are also the most frequent triggers, often linked to the variable geometry actuator or intercooler circuit. Electrical faults on the CAN bus or in the engine harness can produce P-codes that look like boost or fuelling issues but are wiring problems in disguise. A proper diagnostic session reads the full freeze frame data alongside live boost, fuelling, and actuator values to separate the root cause from secondary codes.</p>

            <p>If your Sprinter is showing a specific fault code alongside limp mode, the following guides cover the most common ones in detail.</p>
            <ul>
                <li><a href="/blog/sprinter-p0299-turbo-underboost">Sprinter P0299: Turbo Underboost or Low Boost</a></li>
                <li><a href="/blog/sprinter-p0234-turbo-overboost">Sprinter P0234: Turbo Overboost</a></li>
                <li><a href="/blog/sprinter-p0401-egr-fault">P0401 EGR fault on the Sprinter</a></li>
            </ul>

            <div class="blog-cta-box">
                <p><strong>Want this done properly?</strong></p>
                <p>If your Sprinter is in limp mode, book a <a href="/services/diagnostic-callout">Standard Diagnosis</a> - we cover all limp mode faults including turbo, boost, EGR, and electrical issues in one visit.</p>
            </div>
        `,
    },
    {
        slug: 'adblue-countdown-clearing-codes-not-fix',
        title: 'AdBlue Countdown: Why Clearing Codes Isn\'t a Fix',
        description: 'What triggers the AdBlue countdown, why it returns after clearing, and what a proper decision visit actually does.',
        category: 'Emissions',
        publishedAt: '2026-05-08',
        updatedAt: '2026-05-24',
        ogImage: '/images/gallery/work-30.jpg',
        ogImageAlt: 'MBUX screen showing vehicle breakdown alert on Sprinter',
        author: 'Jamie Armoordon',
        thumbnail: '/images/gallery/work-30.jpg',
        relatedServices: ['diagnostic-callout'],
        content: `
            <div class="blog-lead">
                An AdBlue countdown is one of the most stressful warnings you can get because it creates urgency. You're not just looking at a light - you're watching a timer that feels like it's closing in.
            </div>

            <figure class="blog-image">
                <img src="/images/optimized/gallery/work-30.jpg" alt="MBUX screen showing vehicle breakdown alert on Sprinter" loading="lazy" />
            </figure>

            <p>The internet is full of "quick fixes" like clearing codes, disconnecting sensors, or trying random resets. The problem is: if the underlying system issue is still present, the countdown usually returns.</p>

            <div class="blog-takeaway">
                <span class="takeaway-label">What this post covers</span>
                <p>What typically triggers the countdown, why it reappears, and what a proper diagnosis looks like.</p>
            </div>

            <h2>What triggers an AdBlue countdown?</h2>
            <p>The countdown usually begins when the ECU detects a fault in the SCR system (Selective Catalytic Reduction) or a condition it can't verify. Common triggers include:</p>

            <div class="blog-step"><span class="step-num">1</span> NOx sensor faults (very common)</div>
            <ul>
                <li>Sensor drift / implausible readings</li>
                <li>Heater circuit faults</li>
                <li>Signal issues from wiring/connectors</li>
            </ul>

            <figure class="blog-image">
                <img src="/images/optimized/gallery/work-27.jpg" alt="Soot-covered NOx sensor probe removed from engine" loading="lazy" />
            </figure>

            <div class="blog-step"><span class="step-num">2</span> AdBlue dosing faults</div>
            <ul>
                <li>Dosing valve/injector issues (including crystallisation)</li>
                <li>Supply/pump faults</li>
                <li>Pressure/flow plausibility problems</li>
            </ul>

            <div class="blog-step"><span class="step-num">3</span> Heater / temperature control faults</div>
            <ul>
                <li>Tank heater or line heater faults</li>
                <li>Temperature plausibility issues that prevent correct dosing behaviour</li>
            </ul>

            <div class="blog-step"><span class="step-num">4</span> System efficiency faults</div>
            <p>Sometimes the system decides the expected NOx reduction isn't happening. That's not always a "bad catalyst" - it can be caused by upstream issues that make dosing inaccurate or sensor feedback unreliable.</p>

            <hr class="blog-divider"/>

            <h2>Why clearing codes doesn't fix it</h2>
            <p>Clearing codes can temporarily remove the message, but most of the triggers above are still detectable as soon as the ECU runs checks again.</p>
            <p>If a sensor is reading implausibly, if dosing isn't behaving as expected, or if a component fails a plausibility test - the fault comes back. Sometimes immediately, sometimes after a short drive.</p>

            <figure class="blog-image">
                <img src="/images/optimized/gallery/work-33.jpg" alt="Corroded sensor pins with moisture damage in connector" loading="lazy" />
            </figure>

            <div class="blog-takeaway">
                <span class="takeaway-label">The real goal</span>
                <p>The goal isn't "clear the message." The goal is: <strong>prove what's wrong and fix the cause.</strong></p>
            </div>

            <hr class="blog-divider"/>

            <h2>What a proper "Decision Visit" does</h2>
            <p>The fastest way to stop the countdown long-term is to diagnose it properly the first time. A TriPoint Decision Visit typically includes:</p>

            <div class="blog-step"><span class="step-num">1</span> Full scan + fault status</div>
            <p>We don't just grab one code and guess - we look at:</p>
            <ul class="blog-checklist">
                <li>which faults are current</li>
                <li>which are historic</li>
                <li>what order they appeared in</li>
                <li>whether multiple faults share the same root cause</li>
            </ul>

            <div class="blog-step"><span class="step-num">2</span> Live data checks (NOx and dosing behaviour)</div>
            <p>Depending on the vehicle and fault type, we check live readings to see:</p>
            <ul class="blog-checklist">
                <li>if sensor values are plausible</li>
                <li>whether the system is responding correctly</li>
                <li>whether commanded actions match expected results</li>
            </ul>

            <figure class="blog-image">
                <img src="/images/optimized/gallery/work-41.jpg" alt="UNI-T clamp multimeter measuring parasitic draw on Mercedes door sill" loading="lazy" />
            </figure>

            <div class="blog-step"><span class="step-num">3</span> Component-level checks</div>
            <p>Where applicable, we'll verify:</p>
            <ul class="blog-checklist">
                <li>dosing valve response</li>
                <li>heater circuits</li>
                <li>wiring integrity and connector condition</li>
                <li>known failure points (especially on high-mileage commercial vans)</li>
            </ul>

            <div class="blog-step"><span class="step-num">4</span> Clear plan: what to do next</div>
            <div class="blog-callout">
                <p>You get a clear written plan:</p>
            </div>
            <ul class="blog-checklist">
                <li>likely root cause</li>
                <li>what needs replacing (if anything)</li>
                <li>what needs testing before parts are fitted</li>
                <li>what can be done mobile vs workshop</li>
            </ul>

            <div class="blog-cta-box">
                <p><strong>Got an AdBlue countdown?</strong></p>
                <p>Book a <a href="/services/diagnostic-callout">Standard Diagnosis</a> - we cover all AdBlue, SCR, and emissions faults in one visit.</p>
            </div>
        `,
    },
    {
        slug: 'dpf-warning-light-regen-vs-worse',
        title: 'DPF Warning Lights: When Regen Helps vs When It Makes Things Worse',
        description: 'Forced regen vs passive, when regen is safe, when it masks a deeper fault, and why we diagnose first.',
        category: 'Emissions',
        publishedAt: '2026-03-16',
        updatedAt: '2026-05-24',
        ogImage: '/images/gallery/work-14.jpg',
        ogImageAlt: 'Sooty exhaust tailpipe showing carbon deposits for emissions check',
        author: 'Jamie Armoordon',
        thumbnail: '/images/gallery/work-14.jpg',
        relatedServices: ['diagnostic-callout'],
        content: `
            <div class="blog-lead">
                DPF warning lights cause a predictable reaction: "Can you just force a regen?" Sometimes yes - a regen is the right move and it gets you back on the road quickly. But sometimes forcing a regen is either unsafe, pointless, or it hides a deeper problem that will bring the warning straight back.
            </div>

            <figure class="blog-image">
                <img src="/images/optimized/gallery/work-14.jpg" alt="Sooty exhaust tailpipe showing carbon deposits for emissions check" loading="lazy" />
            </figure>

            <div class="blog-takeaway">
                <span class="takeaway-label">What this post covers</span>
                <p>The difference between when a forced regen helps and when it makes things worse - and what we check before we attempt anything.</p>
            </div>

            <h2>Passive vs active vs forced regen</h2>

            <div class="blog-callout">
                <p><strong>Passive regen</strong> - happens naturally during longer steady driving when temperatures are high enough.</p>
            </div>
            <div class="blog-callout">
                <p><strong>Active regen</strong> - initiated by the ECU to raise exhaust temperatures and burn soot.</p>
            </div>
            <div class="blog-callout">
                <p><strong>Forced regen</strong> - initiated with diagnostic equipment when normal regen isn't completing and conditions allow it.</p>
            </div>

            <div class="blog-takeaway">
                <span class="takeaway-label">Key point</span>
                <p>Regen is a process, not a cure. If something is stopping the system from regening normally, forcing it won't solve the real issue.</p>
            </div>

            <hr class="blog-divider"/>

            <h2>When regen is usually a good idea</h2>
            <p>A forced regen can be helpful when:</p>
            <ul class="blog-checklist">
                <li>soot loading is within a sensible range</li>
                <li>temperatures and sensor readings are plausible</li>
                <li>the engine is healthy enough to perform it safely</li>
                <li>there are no underlying faults blocking regen</li>
            </ul>

            <p>When it works properly you'll typically see:</p>
            <ul class="blog-checklist">
                <li>reduced backpressure</li>
                <li>warning light cleared</li>
                <li>the van returns to normal regen behaviour afterwards</li>
            </ul>

            <hr class="blog-divider"/>

            <h2>When regen is a bad idea (or just delays the problem)</h2>
            <p>Regen becomes risky or pointless when:</p>
            <ul>
                <li>soot loading is too high for a controlled burn</li>
                <li>there are faults that will immediately block regen again</li>
                <li>a sensor is lying (so the ECU can't manage the process correctly)</li>
                <li>the real problem is upstream (EGR, boost leaks, temp control, etc.)</li>
            </ul>

            <figure class="blog-image">
                <img src="/images/optimized/gallery/work-43.jpg" alt="Garrett turbocharger removed showing soot build-up inside housing" loading="lazy" />
            </figure>

            <div class="blog-callout">
                <p>This is where people waste money: they pay for a regen, the light goes off, then it comes back a week later because the <strong>cause wasn't fixed</strong>.</p>
            </div>

            <hr class="blog-divider"/>

            <h2>When the DPF light is a symptom, not the cause</h2>
            <p>DPF issues are often <strong>downstream</strong> of something else. Common culprits include:</p>
            <ul>
                <li><strong>Boost leaks</strong> - causing incorrect airflow/combustion → higher soot</li>
                <li><strong>EGR faults</strong> - affecting combustion and temps</li>
                <li><strong>Thermostat/temp control issues</strong> - preventing proper operating conditions</li>
                <li><strong>Sensor plausibility faults</strong> - preventing regen strategy</li>
            </ul>

            <figure class="blog-image">
                <img src="/images/optimized/gallery/work-35.jpg" alt="Carbon-clogged MAP sensor from Sprinter engine bay" loading="lazy" />
            </figure>

            <div class="blog-takeaway">
                <span class="takeaway-label">The real question</span>
                <p>It's not "can you regen it?" It's: <strong>should you regen it, and why did it load up?</strong></p>
            </div>

            <hr class="blog-divider"/>

            <h2>What a proper "DPF Decision Visit" looks like</h2>
            <p>We diagnose first, then decide.</p>

            <div class="blog-step"><span class="step-num">1</span> Read the DPF-related data properly</div>
            <ul>
                <li>Differential pressure plausibility</li>
                <li>Temperature readings plausibility</li>
                <li>Soot loading indicators (where supported)</li>
                <li>Regen status / history indicators (where supported)</li>
            </ul>

            <figure class="blog-image">
                <img src="/images/optimized/gallery/work-44.jpg" alt="Removed intake manifold and throttle body with carbon deposits on workshop floor" loading="lazy" />
            </figure>

            <div class="blog-step"><span class="step-num">2</span> Check for regen blockers</div>
            <p>If the vehicle has a fault that prevents regen, we address the blocker first - otherwise regen is wasted effort.</p>

            <div class="blog-step"><span class="step-num">3</span> Regen only when conditions are right</div>
            <p>If the data says it's safe and likely to succeed, we proceed. If it isn't, we give you the correct next step (repair path / cleaning path / workshop path).</p>

            <div class="blog-step"><span class="step-num">4</span> Verify results</div>
            <div class="blog-callout">
                <p>We don't just hit "start regen" and leave. We <strong>check results</strong> and ensure the numbers make sense afterward.</p>
            </div>

            <div class="blog-cta-box">
                <p><strong>DPF light on?</strong></p>
                <p>Book a <a href="/services/diagnostic-callout">Standard Diagnosis</a> - we cover all DPF, regen, and emissions faults in one visit.</p>
            </div>
        `,
    },
    {
        slug: 'sprinter-p0299-turbo-underboost',
        title: 'Sprinter P0299: Turbo Underboost or Low Boost',
        description: 'P0299 on a Mercedes Sprinter W906 or W907 means the turbo is producing less boost than requested. Here is what causes it and what a proper diagnostic session looks at.',
        category: 'Mercedes',
        publishedAt: '2026-05-23',
        updatedAt: '2026-05-24',
        ogImage: '/images/gallery/work-22.jpg',
        ogImageAlt: 'Damaged turbocharger with sheared metal inside housing',
        author: 'Jamie Armoordon',
        thumbnail: '/images/gallery/work-22.jpg',
        relatedServices: ['diagnostic-callout', 'sprinter-servicing'],
        faqs: [
            { question: 'Can I drive my Sprinter with P0299?', answer: 'The van will likely be in limp mode with reduced power. It is drivable in most cases but you should not leave it undiagnosed. Running with a persistent boost fault puts additional stress on the turbo and can cause further damage if the root cause is a leak allowing unfiltered air into the intake.' },
            { question: 'Will clearing P0299 fix it?', answer: 'No. Clearing the code removes the stored fault but does not address the underlying cause. The code will return, usually within a short drive.' },
            { question: 'Is P0299 the same as a turbo failure?', answer: 'Not usually. P0299 indicates low boost, which has several possible causes. A failed turbo is one of them, but actuator faults and boost leaks are more common on the W906 and W907 and are significantly cheaper to fix.' },
            { question: 'How long does it take to diagnose P0299?', answer: 'A proper diagnostic session covering live data, actuator test, and boost leak check takes approximately 45 to 60 minutes on site.' },
        ],
        content: `
            <div class="blog-lead">
                P0299 is stored when the ECU detects that actual boost pressure is significantly below the requested value. On the W906 and W907 Sprinter with OM651 and OM654 engines, this is one of the most common codes seen alongside limp mode and power loss. The code tells you that boost is low. It does not tell you why.
            </div>

            <h2>What P0299 means on a Sprinter</h2>
            <p>The ECU compares requested boost (from the boost pressure model) against actual boost measured at the MAP sensor. When the gap is large enough for long enough, P0299 is stored and the engine enters a derate or limp mode to protect the turbo and engine from running lean. The fault can be intermittent or permanent. Intermittent P0299 with no obvious driveability symptom is often a slow actuator or a minor boost leak. Permanent P0299 with clear power loss points to a more significant restriction or failure.</p>

            <hr class="blog-divider"/>

            <h2>Common causes on the OM651 and OM654</h2>
            <p>On the OM651 (W906), the most common causes in order of frequency are: a failing or sticking variable geometry actuator (the turbo cannot open the vanes fully to build boost), a boost or intake leak at an intercooler pipe, hose, or charge pipe fitting, a worn or cracked intercooler core, a faulty MAP sensor or boost pressure sensor giving an incorrect actual reading, and EGR valve issues causing exhaust backpressure that reduces effective boost. On the OM654 (W907), actuator faults are also common, with the variable geometry mechanism being a known failure point at higher mileages. Intercooler pipe connections on the W907 are a frequent source of slow leaks that produce intermittent P0299.</p>

            <hr class="blog-divider"/>

            <h2>What a diagnostic session looks at</h2>
            <p>Reading fault codes alone is not enough to diagnose P0299. A proper session uses live data to compare requested boost against actual boost across the RPM range, checks actuator sweep and position accuracy (requested position versus actual position), performs a smoke test on the intake and charge system to identify boost leaks, and verifies MAP sensor plausibility by cross-referencing with other load and fuelling data. On the OM651, guided tests via Xentry can command the actuator through its full range and confirm whether the fault is mechanical or electrical.</p>

            <hr class="blog-divider"/>

            <h2>What P0299 does not mean</h2>
            <p>P0299 on its own does not mean the turbo needs replacing. The majority of P0299 faults on W906 Sprinters are resolved by actuator cleaning or replacement, boost leak repair, or intercooler replacement. Replacing a turbocharger without confirming root cause through live data testing is the most expensive wrong turn on this fault.</p>

            <hr class="blog-divider"/>

            <h2>Frequently asked questions</h2>

            <div class="blog-callout">
                <p><strong>Can I drive my Sprinter with P0299?</strong></p>
                <p>The van will likely be in limp mode with reduced power. It is drivable in most cases but you should not leave it undiagnosed. Running with a persistent boost fault puts additional stress on the turbo and can cause further damage if the root cause is a leak allowing unfiltered air into the intake.</p>
            </div>

            <div class="blog-callout">
                <p><strong>Will clearing P0299 fix it?</strong></p>
                <p>No. Clearing the code removes the stored fault but does not address the underlying cause. The code will return, usually within a short drive.</p>
            </div>

            <div class="blog-callout">
                <p><strong>Is P0299 the same as a turbo failure?</strong></p>
                <p>Not usually. P0299 indicates low boost, which has several possible causes. A failed turbo is one of them, but actuator faults and boost leaks are more common on the W906 and W907 and are significantly cheaper to fix.</p>
            </div>

            <div class="blog-callout">
                <p><strong>How long does it take to diagnose P0299?</strong></p>
                <p>A proper diagnostic session covering live data, actuator test, and boost leak check takes approximately 45 to 60 minutes on site.</p>
            </div>

            <div class="blog-cta-box">
                <p><strong>Sprinter showing P0299?</strong></p>
                <p>Book a <a href="/services/diagnostic-callout">Standard Diagnosis</a> - we cover boost, actuator, and leak faults with live data and a proper written fix plan.</p>
            </div>
        `,
    },
    {
        slug: 'sprinter-p0234-turbo-overboost',
        title: 'Sprinter P0234: Turbo Overboost',
        description: 'P0234 on a Mercedes Sprinter means the turbo is producing more boost than requested. Here is what causes it on the W906 and W907 and what the diagnostic process looks like.',
        category: 'Mercedes',
        publishedAt: '2026-05-23',
        updatedAt: '2026-05-24',
        ogImage: '/images/gallery/work-43.jpg',
        ogImageAlt: 'Garrett turbocharger removed showing soot build-up inside housing',
        author: 'Jamie Armoordon',
        thumbnail: '/images/gallery/work-43.jpg',
        relatedServices: ['diagnostic-callout'],
        faqs: [
            { question: 'Can P0234 damage my engine?', answer: 'Persistent overboost puts stress on the turbo bearings and can cause damage over time. The ECU limp mode is designed to prevent the worst outcomes, but the fault should be diagnosed and resolved promptly.' },
            { question: 'Is P0234 always an actuator fault?', answer: 'On the W906 and W907 it is the most common cause. A stuck or slow actuator that cannot limit boost covers the majority of cases. Sensor faults and wiring issues are less common but possible.' },
            { question: 'What is the fix for P0234?', answer: 'That depends on the diagnostic finding. A seized variable geometry mechanism may respond to cleaning and forced regeneration of the actuator travel. A failed actuator motor or position sensor requires replacement. A wiring fault requires tracing and repair. A quote cannot be given until the root cause is confirmed.' },
        ],
        content: `
            <div class="blog-lead">
                P0234 is stored when actual boost pressure exceeds the maximum threshold set by the ECU. Where P0299 means too little boost, P0234 means too much. On W906 and W907 Sprinters the most common trigger is a stuck or slow variable geometry actuator that cannot close the vanes sufficiently to limit boost. Limp mode is the usual result.
            </div>

            <h2>What P0234 means on a Sprinter</h2>
            <p>The turbocharger on the OM651 and OM654 is a variable geometry unit. The ECU controls boost by adjusting the position of the vanes inside the turbo housing through an actuator. If the actuator cannot close the vanes to the commanded position, boost continues to rise beyond the target. The ECU detects this through the MAP sensor and stores P0234 before entering a derate to protect the engine.</p>

            <hr class="blog-divider"/>

            <h2>Common causes</h2>
            <p>On the OM651 the most common cause is a seized or carboned variable geometry mechanism that prevents the vanes from closing. This is often accompanied by P0299 stored historically, with the fault alternating between over and under boost as the actuator sticks in different positions. A faulty actuator motor or position sensor is the next most common cause. On the OM654 the actuator mechanism is updated but carbon buildup remains a factor at higher mileages. A less common but possible cause on both engines is a boost control solenoid fault or a wiring fault in the actuator circuit.</p>

            <hr class="blog-divider"/>

            <h2>What a diagnostic session looks at</h2>
            <p>Live data comparing commanded actuator position against actual position is the primary test. If the actuator is commanded to a closing position and actual position lags or does not move, the fault is mechanical or electrical in the actuator circuit. A Xentry guided test can command the actuator through its full range and record response. If the actuator moves correctly under guided test but still produces P0234 under load, the MAP sensor or boost circuit wiring should be checked for intermittent faults.</p>

            <hr class="blog-divider"/>

            <h2>Frequently asked questions</h2>

            <div class="blog-callout">
                <p><strong>Can P0234 damage my engine?</strong></p>
                <p>Persistent overboost puts stress on the turbo bearings and can cause damage over time. The ECU limp mode is designed to prevent the worst outcomes, but the fault should be diagnosed and resolved promptly.</p>
            </div>

            <div class="blog-callout">
                <p><strong>Is P0234 always an actuator fault?</strong></p>
                <p>On the W906 and W907 it is the most common cause. A stuck or slow actuator that cannot limit boost covers the majority of cases. Sensor faults and wiring issues are less common but possible.</p>
            </div>

            <div class="blog-callout">
                <p><strong>What is the fix for P0234?</strong></p>
                <p>That depends on the diagnostic finding. A seized variable geometry mechanism may respond to cleaning and forced regeneration of the actuator travel. A failed actuator motor or position sensor requires replacement. A wiring fault requires tracing and repair. A quote cannot be given until the root cause is confirmed.</p>
            </div>

            <div class="blog-cta-box">
                <p><strong>Sprinter showing P0234?</strong></p>
                <p>Book a <a href="/services/diagnostic-callout">Standard Diagnosis</a> - we use live data and Xentry guided tests to confirm whether the fault is mechanical, electrical, or sensor-related before any parts are recommended.</p>
            </div>
        `,
    },
    {
        slug: 'mercedes-p2002-dpf-fault',
        title: 'Mercedes P2002: DPF Efficiency Below Threshold',
        description: 'P2002 on a Mercedes diesel means the DPF is not reducing particulate matter as expected. Here is what triggers it, what the diagnostic process covers, and when regen helps versus when it does not.',
        category: 'Emissions',
        publishedAt: '2026-05-23',
        updatedAt: '2026-05-24',
        ogImage: '/images/gallery/work-14.jpg',
        ogImageAlt: 'Sooty exhaust tailpipe showing carbon deposits for emissions check',
        author: 'Jamie Armoordon',
        thumbnail: '/images/gallery/work-14.jpg',
        relatedServices: ['diagnostic-callout'],
        faqs: [
            { question: 'Does P2002 mean I need a new DPF?', answer: 'Not necessarily. P2002 indicates the filter is not performing to threshold, but the cause could be soot loading, a sensor fault, or a failed regen rather than a physically damaged filter. A diagnostic session is needed to confirm which it is before any repair decision is made.' },
            { question: 'Can I regen my DPF to fix P2002?', answer: 'A regen may resolve P2002 if the fault is soot loading and there are no underlying issues preventing a successful regen. We always check conditions before forcing a regen. If there is an active fault preventing completion, a regen will not fix P2002 and may cause further issues.' },
            { question: 'Will P2002 cause an MOT failure?', answer: 'A DPF warning light on the dashboard is an MOT failure in itself. Resolving P2002 properly, including verifying that the filter is functioning correctly before the test, is the correct approach.' },
            { question: 'How do you check if a DPF has been removed or tampered with?', answer: 'Through a combination of differential pressure behaviour (a gutted DPF shows abnormally low pressure drop), temperature readings, and the regen history log. Physical removal or software bypass is identifiable during a standard diagnostic session.' },
        ],
        content: `
            <div class="blog-lead">
                P2002 is stored when the ECU determines that the diesel particulate filter is not reducing particulate matter to the expected level. It is one of several DPF-related codes and is often accompanied by P2463 (DPF restriction due to soot loading) or codes pointing to the differential pressure sensor or temperature sensors used to monitor the DPF. The code can appear after a failed regen or as the first sign of a DPF problem. It does not automatically mean the DPF needs replacing.
            </div>

            <h2>What P2002 means</h2>
            <p>The DPF is monitored by the ECU using differential pressure sensors (measuring the pressure drop across the filter), temperature sensors upstream and downstream, and the regen history log. P2002 is an efficiency code: the ECU has concluded that the filter is not performing as it should. This can be because the filter is heavily loaded with soot or ash and is blocking flow, because a previous regen did not complete correctly, because a sensor giving false readings is making the DPF appear less effective than it is, or because the DPF is physically damaged, cracked, or has been bypassed.</p>

            <hr class="blog-divider"/>

            <h2>What the diagnostic process covers</h2>
            <p>A diagnostic session for P2002 reads the full freeze frame and live data for the DPF circuit: soot load percentage, ash load estimate, differential pressure readings under different conditions, temperature sensor plausibility upstream and downstream, regen history (how many regens have been attempted, how many completed, how many aborted), and any secondary codes that suggest a sensor or heating circuit fault. The purpose is to establish whether the DPF is blocked and needs a regen, whether there is an underlying fault preventing regen from completing, or whether the DPF itself is damaged and needs replacement. A forced regen without this assessment risks damaging an already-stressed DPF or masking a deeper fault.</p>

            <hr class="blog-divider"/>

            <h2>When regen helps and when it does not</h2>
            <p>A forced regen is appropriate when the DPF is loaded with soot, there is no underlying fault preventing regen, and the conditions (oil level, temperature circuit, exhaust system) are correct. It is not appropriate when the DPF is loaded beyond the safe regen threshold, when there is an active EGR or turbo fault that will prevent the regen temperature being reached, when the DPF is damaged or cracked, or when P2002 is being driven by a faulty differential pressure sensor rather than actual blockage. The <a href="/blog/dpf-warning-light-regen-vs-worse">DPF warning lights post</a> on this site covers this distinction in more detail.</p>

            <hr class="blog-divider"/>

            <h2>P2002 and emissions compliance</h2>
            <p>P2002 with a DPF that is genuinely failing or has been tampered with will result in an MOT failure on emissions grounds. A DPF that has been physically removed or has had software modifications to bypass the regen cycle will also produce P2002 alongside abnormal differential pressure readings. This is identifiable during a diagnostic session and is not something we will assist with. Our approach is to diagnose and repair the DPF system correctly so the vehicle passes its MOT and meets its emissions obligations.</p>

            <hr class="blog-divider"/>

            <h2>Frequently asked questions</h2>

            <div class="blog-callout">
                <p><strong>Does P2002 mean I need a new DPF?</strong></p>
                <p>Not necessarily. P2002 indicates the filter is not performing to threshold, but the cause could be soot loading, a sensor fault, or a failed regen rather than a physically damaged filter. A diagnostic session is needed to confirm which it is before any repair decision is made.</p>
            </div>

            <div class="blog-callout">
                <p><strong>Can I regen my DPF to fix P2002?</strong></p>
                <p>A regen may resolve P2002 if the fault is soot loading and there are no underlying issues preventing a successful regen. We always check conditions before forcing a regen. If there is an active fault preventing completion, a regen will not fix P2002 and may cause further issues.</p>
            </div>

            <div class="blog-callout">
                <p><strong>Will P2002 cause an MOT failure?</strong></p>
                <p>A DPF warning light on the dashboard is an MOT failure in itself. Resolving P2002 properly, including verifying that the filter is functioning correctly before the test, is the correct approach.</p>
            </div>

            <div class="blog-callout">
                <p><strong>How do you check if a DPF has been removed or tampered with?</strong></p>
                <p>Through a combination of differential pressure behaviour (a gutted DPF shows abnormally low pressure drop), temperature readings, and the regen history log. Physical removal or software bypass is identifiable during a standard diagnostic session.</p>
            </div>

            <hr class="blog-divider"/>

            <h2>Related reading</h2>
            <ul>
                <li><a href="/blog/sprinter-p2463-dpf-soot-accumulation">P2463: DPF soot accumulation on the Sprinter</a></li>
            </ul>

            <div class="blog-cta-box">
                <p><strong>P2002 stored on your Mercedes?</strong></p>
                <p>Book a <a href="/services/diagnostic-callout">Standard Diagnosis</a> - we read DPF live data and regen history before any repair decision is made.</p>
            </div>
        `,
    },
    {
        slug: 'sprinter-p0401-egr-fault',
        title: 'Sprinter P0401: Insufficient EGR Flow',
        description: 'P0401 on a Mercedes Sprinter means insufficient EGR flow. Here is what causes it on the OM651 and OM654 and what a proper diagnostic session looks at before any parts are replaced.',
        category: 'Emissions',
        publishedAt: '2026-05-23',
        updatedAt: '2026-05-24',
        ogImage: '/images/diag_photos/egr-pipe-oil.jpg',
        ogImageAlt: 'Oil contaminated EGR pipe on Mercedes Sprinter',
        author: 'Jamie Armoordon',
        thumbnail: '/images/diag_photos/egr-pipe-oil.jpg',
        relatedServices: ['diagnostic-callout'],
        faqs: [
            { question: 'Can I drive with P0401?', answer: 'The van may run normally or enter a mild derate depending on whether limp mode is also active. The fault should be diagnosed promptly as continued operation with an EGR fault can cause carbon buildup to worsen and affect other components.' },
            { question: 'Does P0401 always mean the EGR valve needs replacing?', answer: 'No. A blocked EGR pipe, a faulty EGR cooler, or a position sensor fault can all produce P0401. Replacing the valve without confirming the root cause through live data is a common and expensive mistake on this fault.' },
            { question: 'Will cleaning the EGR valve fix P0401?', answer: 'It may, if the fault is carbon buildup on the valve itself preventing it from opening. If the restriction is in the EGR pipe or cooler, cleaning the valve will not resolve the code.' },
            { question: 'Is P0401 an MOT failure?', answer: 'An EGR fault affecting emissions performance can cause an MOT failure on exhaust emissions grounds. A dashboard warning light is also an MOT failure in itself.' },
            { question: 'How long does a P0401 diagnostic take?', answer: 'Approximately 45 to 60 minutes on site covering live data checks, position sensor plausibility, and visual inspection of accessible EGR components.' }
        ],
        content: `
            <div class="blog-lead">
                P0401 is stored when the ECU detects that exhaust gas recirculation flow is below the expected level. On W906 and W907 Sprinters with OM651 and OM654 engines, this is a common emissions fault that frequently triggers alongside limp mode, increased smoke, or a rough idle. The code does not identify which component has failed. It tells you the system is not delivering the expected amount of recirculated exhaust gas.
            </div>

            <figure class="blog-image">
                <img src="/images/diag_photos/egr-pipe-oil.jpg" alt="Oil contaminated EGR pipe on Mercedes Sprinter" loading="lazy" />
            </figure>

            <h2>What the EGR system does and why P0401 occurs</h2>
            <p>The EGR valve recirculates a controlled quantity of exhaust gas back into the intake manifold. This reduces combustion temperature and NOx output. The ECU monitors EGR flow by comparing the expected flow rate (based on valve position and engine conditions) against what the MAF sensor and other load inputs indicate is actually happening. P0401 is stored when the flow is consistently below target.</p>

            <hr class="blog-divider"/>

            <h2>Common causes on the OM651 and OM654</h2>
            <p>On the OM651, the most common cause is a heavily carboned EGR valve that cannot open to the commanded position, or a partially blocked EGR pipe restricting flow. Oil-contaminated EGR pipes are a known issue on high-mileage OM651 engines and produce exactly the fault pattern P0401 describes. A faulty EGR cooler that is partially blocked is also a cause. On the OM654, the EGR system is revised but carbon buildup and valve sticking remain a factor. A failed EGR position sensor giving incorrect position feedback can cause P0401 even when the valve is physically functioning correctly.</p>

            <figure class="blog-image">
                <img src="/images/diag_photos/intake-manifold-blocked.jpg" alt="Blocked intake manifold from heavy carbon soot build up" loading="lazy" />
            </figure>

            <hr class="blog-divider"/>

            <h2>What a diagnostic session looks at</h2>
            <p>Live data showing commanded EGR position against actual EGR position is the primary check. If the valve is commanded open and actual position matches but P0401 still stores, the restriction is downstream of the valve in the pipe or cooler. If actual position does not match commanded position, the valve mechanism or motor is at fault. MAF sensor plausibility checks are run alongside this because a faulty MAF can produce a false P0401 by reporting incorrect air mass flow. A visual inspection of the EGR pipe for oil contamination or carbon restriction is done where accessible on site.</p>

            <hr class="blog-divider"/>

            <h2>P0401 and emissions compliance</h2>
            <p>P0401 with a confirmed EGR fault will affect emissions performance and can contribute to an MOT failure on exhaust emissions. EGR deletion or defeat is not a legal or compliant repair for road vehicles. The correct approach is to diagnose the fault and restore the EGR system to correct function.</p>

            <hr class="blog-divider"/>

            <h2>Related reading</h2>
            <ul>
                <li><a href="/blog/sprinter-limp-mode-proper-diagnostic">Sprinter Limp Mode: What a Proper Diagnostic Looks Like</a></li>
                <li><a href="/blog/adblue-countdown-clearing-codes-not-fix">AdBlue Countdown: Why Clearing Codes Isn't a Fix</a></li>
                <li><a href="/services/diagnostic-callout">Standard Diagnosis Service</a></li>
            </ul>

            <div class="blog-cta-box">
                <p><strong>Got a P0401 fault code?</strong></p>
                <p>Book a <a href="/services/diagnostic-callout">Standard Diagnosis</a> - we'll check the live data and physically inspect the EGR system before any parts are recommended.</p>
            </div>
        `,
    },
    {
        slug: 'mercedes-p0420-catalyst-fault',
        title: 'Mercedes P0420: Catalyst System Efficiency Below Threshold',
        description: 'P0420 on a Mercedes diesel means catalyst efficiency is below threshold. Here is what the code means, what causes it, and what a diagnostic session looks at before condemning the cat.',
        category: 'Emissions',
        publishedAt: '2026-05-23',
        updatedAt: '2026-05-24',
        ogImage: '/images/diag_photos/sensor-sooted.jpg',
        ogImageAlt: 'Heavily sooted exhaust sensor removed for inspection',
        author: 'Jamie Armoordon',
        thumbnail: '/images/diag_photos/sensor-sooted.jpg',
        relatedServices: ['diagnostic-callout'],
        faqs: [
            { question: 'Does P0420 always mean I need a new catalyst?', answer: 'No. Sensor faults and upstream engine issues can produce P0420 without the catalyst itself being at fault. A diagnostic session is needed to confirm the root cause before any parts are ordered.' },
            { question: 'Will P0420 cause an MOT failure?', answer: 'An exhaust emissions fault and a dashboard warning light are both MOT failure points. A properly functioning catalyst is required to pass the emissions check.' },
            { question: 'Can a damaged catalyst be cleaned rather than replaced?', answer: 'In some cases a catalyst that is soot-loaded but not physically degraded can recover after correct operation. A catalyst that is structurally damaged or contaminated requires replacement.' },
            { question: 'How is a removed or bypassed catalyst identified?', answer: 'Through exhaust temperature behaviour and sensor plausibility. A gutted or bypassed catalyst shows distinctive temperature patterns and sensor readings that differ from a degraded but present unit.' }
        ],
        content: `
            <div class="blog-lead">
                P0420 is stored when the ECU determines that the catalytic converter is not reducing harmful emissions to the required level. On Mercedes diesel vans it is often associated with the oxidation catalyst upstream of the DPF. It is a code that appears straightforward but has several possible causes beyond a failed catalyst.
            </div>

            <figure class="blog-image">
                <img src="/images/diag_photos/multimeter-exhaust-pulse.jpg" alt="Multimeter probe testing exhaust temperature sensor reading" loading="lazy" />
            </figure>

            <h2>What P0420 means</h2>
            <p>The catalyst efficiency is monitored by comparing exhaust gas composition upstream and downstream of the catalyst using temperature sensors, NOx sensors on equipped models, and the oxygen or lambda sensor where fitted. When the ECU calculates that the conversion efficiency is below threshold, P0420 is stored. This can reflect a genuinely degraded catalyst, a sensor giving incorrect readings, or an upstream fault that is preventing the catalyst from reaching its correct operating temperature.</p>

            <hr class="blog-divider"/>

            <h2>Common causes on Mercedes diesel vans</h2>
            <p>A degraded or physically damaged oxidation catalyst is the most direct cause. However P0420 can also be triggered by: a faulty exhaust temperature sensor upstream or downstream of the catalyst giving incorrect efficiency readings, a failed or contaminated NOx sensor on SCR-equipped models creating a false efficiency assessment, an engine fault causing excessive unburned fuel to enter the exhaust and overheat or contaminate the catalyst, and a catalyst that has been physically removed or bypassed. This last cause is identifiable during a diagnostic session and is not something we will advise on or facilitate.</p>
            
            <figure class="blog-image">
                <img src="/images/diag_photos/sensor-sooted.jpg" alt="Heavily sooted exhaust sensor removed for inspection" loading="lazy" />
            </figure>

            <hr class="blog-divider"/>

            <h2>What a diagnostic session looks at</h2>
            <p>Exhaust temperature sensor plausibility upstream and downstream is checked first. If sensor readings are implausible relative to engine load and conditions, the sensor rather than the catalyst may be at fault. On SCR-equipped models the NOx sensor data is reviewed for correct function. Engine fuelling and combustion health is checked to rule out an upstream fault contributing to catalyst degradation. Physical inspection of the catalyst housing where accessible. If all sensors are plausible and no upstream fault is present, the catalyst itself is the most likely cause.</p>

            <hr class="blog-divider"/>

            <h2>Related reading</h2>
            <ul>
                <li><a href="/blog/mercedes-p2002-dpf-fault">P2002: DPF Efficiency Below Threshold</a></li>
                <li><a href="/blog/dpf-warning-light-regen-vs-worse">DPF Warning Lights: When Regen Helps vs When It Makes Things Worse</a></li>
                <li><a href="/services/diagnostic-callout">Standard Diagnosis Service</a></li>
            </ul>

            <div class="blog-cta-box">
                <p><strong>Seeing P0420 on your Mercedes?</strong></p>
                <p>Book a <a href="/services/diagnostic-callout">Standard Diagnosis</a> - we'll verify sensor plausibility and rule out upstream engine issues before condemning the catalyst.</p>
            </div>
        `,
    },
    {
        slug: 'sprinter-p2463-dpf-soot-accumulation',
        title: 'Sprinter P2463: DPF Soot Accumulation',
        description: 'P2463 on a Mercedes Sprinter means the DPF has accumulated soot beyond the threshold. Here is what causes it, when a forced regen helps, and when it does not.',
        category: 'Emissions',
        publishedAt: '2026-05-23',
        updatedAt: '2026-05-24',
        ogImage: '/images/gallery/work-43.jpg',
        ogImageAlt: 'Carbon build up inside a Mercedes turbocharger indicating exhaust backpressure',
        author: 'Jamie Armoordon',
        thumbnail: '/images/gallery/work-14.jpg',
        relatedServices: ['diagnostic-callout'],
        faqs: [
            { question: 'Will a forced regen fix P2463?', answer: 'It may, if the DPF is soot-loaded within the recoverable range and there are no underlying faults. It will not fix P2463 if ash accumulation is the primary issue or if an upstream fault is preventing regen from completing.' },
            { question: 'Can I do a manual regen by driving on the motorway?', answer: 'A sustained motorway run can initiate a passive regen if soot loading is not too high and exhaust temperatures can be reached. If P2463 is already stored, the ECU may not allow a passive regen cycle to proceed without active intervention.' },
            { question: 'How many forced regens can a DPF tolerate?', answer: 'There is no fixed number, but repeated forced regens on a filter with high ash load or underlying faults accelerate degradation. Addressing the root cause of repeated soot accumulation is more important than the number of regens.' },
            { question: 'Is P2463 an MOT failure?', answer: 'A DPF warning light is an MOT failure. P2463 with a dashboard warning present will fail the vehicle.' }
        ],
        content: `
            <div class="blog-lead">
                P2463 is stored when the ECU calculates that the DPF soot load has exceeded the maximum threshold. It is closely related to P2002 (DPF efficiency below threshold) and the two often appear together. P2463 is specifically a soot loading code: the filter is blocked to the point where the ECU cannot initiate or complete a normal passive regen cycle.
            </div>

            <figure class="blog-image">
                <img src="/images/optimized/gallery/work-43.jpg" alt="Carbon build up inside a Mercedes turbocharger indicating exhaust backpressure" loading="lazy" />
            </figure>

            <h2>Why DPFs block on Sprinters</h2>
            <p>Passive DPF regeneration requires sustained exhaust temperatures above approximately 550 to 600 degrees Celsius. On the W906 and W907 Sprinter this is achieved during prolonged motorway or A-road driving. Short urban journeys, stop-start use, and depot-based operations where the van rarely sustains a long run are the most common causes of progressive soot accumulation. On the OM651 a partially blocked EGR or a degraded oxidation catalyst can prevent the exhaust temperatures needed for passive regen from being reached, compounding the problem. Injector wear affecting combustion quality is a less common but possible contributing factor at very high mileages.</p>

            <hr class="blog-divider"/>

            <h2>What a diagnostic session looks at</h2>
            <p>Soot load percentage from the DPF control module is read first. Ash load estimate is checked separately: ash is non-combustible residue from engine oil and does not reduce during regen. A DPF that is heavily ash-loaded cannot be recovered by regen regardless of how many forced cycles are attempted. Regen history is reviewed: how many regens have been attempted, how many completed, and how many aborted. A high abort rate suggests an underlying condition preventing regen completion. Differential pressure sensor readings are checked for plausibility. If soot load is within the recoverable range and no underlying fault is preventing regen, a forced regen via Xentry is appropriate. If soot load is above the safe regen threshold or ash load is the primary issue, physical DPF cleaning or replacement is the correct path.</p>

            <hr class="blog-divider"/>

            <h2>P2463 and the regen decision</h2>
            <p>A forced regen should not be performed without first confirming that conditions are safe for it. Running a forced regen on a DPF that is beyond the recovery threshold risks thermal damage to the filter. Running a forced regen when an active EGR or turbo fault is present risks the regen not completing and the fault returning within a short drive. The DPF warning lights post on this site covers the regen decision in more detail.</p>
            
            <figure class="blog-image">
                <img src="/images/optimized/gallery/work-14.jpg" alt="Thick soot accumulation inside an exhaust tailpipe" loading="lazy" />
            </figure>

            <hr class="blog-divider"/>

            <h2>Related reading</h2>
            <ul>
                <li><a href="/blog/mercedes-p2002-dpf-fault">P2002: DPF Efficiency Below Threshold</a></li>
                <li><a href="/blog/dpf-warning-light-regen-vs-worse">DPF Warning Lights: When Regen Helps vs When It Makes Things Worse</a></li>
                <li><a href="/services/diagnostic-callout">Standard Diagnosis Service</a></li>
            </ul>

            <div class="blog-cta-box">
                <p><strong>Stuck with P2463?</strong></p>
                <p>Book a <a href="/services/diagnostic-callout">Standard Diagnosis</a> - we'll check your soot load, ash estimate, and regen blockers before deciding if a regen is the right move.</p>
            </div>
        `,
    },
    {
        slug: 'vito-adblue-fault',
        title: 'Mercedes Vito AdBlue Fault: What It Means and What to Do',
        description: 'AdBlue warning on a Mercedes Vito W639 or W447? Here is what causes it, why clearing the code does not fix it, and what a proper diagnostic session covers.',
        category: 'Emissions',
        publishedAt: '2026-05-23',
        updatedAt: '2026-05-24',
        ogImage: '/images/gallery/work-30.jpg',
        ogImageAlt: 'Mercedes instrument cluster displaying AdBlue countdown to non-start',
        author: 'Jamie Armoordon',
        thumbnail: '/images/gallery/work-30.jpg',
        relatedServices: ['diagnostic-callout', 'vito-servicing'],
        faqs: [
            { question: 'Can I top up AdBlue to fix the warning?', answer: 'If the warning is purely a low-level alert, topping up to the correct level and having the system reset via Xentry will resolve it. If the warning is a quality or sensor fault, topping up will not clear it.' },
            { question: 'Can I use any AdBlue or does it need to be a specific grade?', answer: 'AdBlue must meet the ISO 22241 specification. Substandard or contaminated AdBlue is a common cause of P2BA9 quality faults on the W447. Use a reputable supplier and check the expiry date.' },
            { question: 'How long does the diagnostic take on an AdBlue fault?', answer: 'Approximately 45 to 60 minutes covering the full SCR system scan, live data checks, and dosing unit actuation.' },
            { question: 'What happens if the countdown reaches zero?', answer: 'The vehicle will not start. A Xentry reset is required once the underlying fault is resolved.' }
        ],
        content: `
            <div class="blog-lead">
                The Mercedes Vito W447 with the OM654 engine uses an SCR (selective catalytic reduction) system that requires AdBlue to reduce NOx emissions. When the AdBlue system develops a fault or the fluid level drops too low, the van enters a countdown warning sequence that will eventually prevent starting if not resolved. This page covers the most common Vito AdBlue fault types, what causes them, and what a diagnostic session involves.
            </div>

            <figure class="blog-image">
                <img src="/images/optimized/gallery/work-30.jpg" alt="Mercedes instrument cluster displaying AdBlue countdown to non-start" loading="lazy" />
            </figure>

            <h2>Common AdBlue fault codes on the Vito W447</h2>
            <p>The most frequently seen codes on the W447 Vito SCR system are P20EE (SCR NOx catalyst efficiency below threshold), P2BAD or P2BA9 (reagent quality, the ECU believes the AdBlue concentration is incorrect), P203F (reductant level sensor), and codes relating to the dosing unit or injector. Each code points to a different part of the system: the sensor measuring what goes in, the sensor measuring what comes out, the dosing unit that injects AdBlue into the exhaust, or the quality of the AdBlue itself.</p>

            <hr class="blog-divider"/>

            <h2>Why the countdown starts and why clearing codes does not fix it</h2>
            <p>The AdBlue countdown is a regulatory requirement. When the SCR system detects a fault or fluid level is critically low, the ECU initiates a countdown (displayed in miles remaining) that ends in a non-start condition. This countdown cannot be reset by a generic code clear. The underlying fault or the fluid condition must be resolved, and on most faults a dealer-level reset or teach-in procedure through Xentry is required to confirm the system is functioning correctly and lift the countdown.</p>

            <hr class="blog-divider"/>

            <h2>What a diagnostic session covers</h2>
            <p>Full SCR and AdBlue system scan including freeze frame data. Live data for NOx sensor upstream and downstream to confirm sensor function. Dosing unit actuation test. AdBlue quality check where accessible. Physical inspection of the AdBlue tank and fill point for contamination. Review of any historic fault pattern to identify whether the fault is intermittent or progressive.</p>
            <p><em>Note: The W639 Vito (pre-2014) does not use AdBlue or SCR. If your W639 has an emissions warning, it relates to the EGR system rather than AdBlue. See the P0401 EGR fault page for the relevant information.</em></p>

            <figure class="blog-image">
                <img src="/images/optimized/gallery/work-27.jpg" alt="NOx sensor removed for inspection during an SCR AdBlue diagnostic" loading="lazy" />
            </figure>

            <hr class="blog-divider"/>

            <h2>Related reading</h2>
            <ul>
                <li><a href="/blog/adblue-countdown-clearing-codes-not-fix">AdBlue Countdown: Why Clearing Codes Isn't a Fix</a></li>
                <li><a href="/services/vito-servicing">Vito Servicing Packages</a></li>
                <li><a href="/services/diagnostic-callout">Standard Diagnosis Service</a></li>
            </ul>

            <div class="blog-cta-box">
                <p><strong>Vito in AdBlue countdown?</strong></p>
                <p>Book a <a href="/services/diagnostic-callout">Standard Diagnosis</a> - we'll read the SCR live data and pinpoint the sensor, doser, or quality issue triggering the countdown.</p>
            </div>
        `,
    },
    {
        slug: 'mercedes-eml-on',
        title: 'Mercedes Engine Management Light On: What It Means and What to Do',
        description: 'Engine management light on a Mercedes van or car? Here is what it can mean, why the light alone does not tell you what is wrong, and what a proper diagnostic session involves.',
        category: 'Mercedes',
        publishedAt: '2026-05-23',
        updatedAt: '2026-05-24',
        ogImage: '/images/diag_photos/picoscope-multimeter.jpg',
        ogImageAlt: 'Using a PicoScope and multimeter to verify an electrical fault',
        author: 'Jamie Armoordon',
        thumbnail: '/images/diag_photos/picoscope-multimeter.jpg',
        relatedServices: ['diagnostic-callout'],
        faqs: [
            { question: 'Can I drive with the EML on?', answer: 'If the van drives normally with no other symptoms, it is generally safe to drive a short distance to get it diagnosed. If there is limp mode, power loss, unusual smoke, or noise, stop as soon as it is safe to do so.' },
            { question: 'Will the EML go off on its own?', answer: 'If the fault that triggered it was intermittent and has not recurred, the ECU may clear it automatically after a set number of drive cycles. The underlying cause is still present and the code may return.' },
            { question: 'Can a generic OBD reader tell me what is wrong?', answer: 'A generic reader will show the stored code. It will not show Mercedes-specific sub-codes, freeze frame data across all modules, or live data from proprietary Mercedes systems. It is a starting point at best.' },
            { question: 'Does an EML cause an MOT failure?', answer: 'Yes. A dashboard warning light is an MOT failure point regardless of what caused it.' }
        ],
        content: `
            <div class="blog-lead">
                An engine management light (EML) on a Mercedes van or car tells you the ECU has detected a fault and stored a code. It does not tell you what the fault is, how serious it is, or what needs to be done. On its own the light is a prompt to investigate, not a diagnosis. This page covers what the EML indicates, why reading the code is only the starting point, and what a proper diagnostic session involves.
            </div>

            <figure class="blog-image">
                <img src="/images/optimized/gallery/work-31.jpg" alt="Mercedes instrument cluster with the engine management light illuminated" loading="lazy" />
            </figure>

            <h2>What triggers the EML on a Mercedes</h2>
            <p>The EML can be triggered by faults across the entire engine management system: emissions components (EGR, DPF, AdBlue, NOx sensors), fuelling (injectors, fuel pressure, rail pressure sensor), boost and turbo circuit (boost pressure, actuator, MAP sensor), electrical faults (wiring, CAN bus, connector corrosion), sensor faults (MAF, coolant temperature, crankshaft position), and coding or adaptation issues following a component replacement. On Mercedes vans the most common triggers in practice are emissions system faults, boost faults, and electrical intermittents. The EML does not distinguish between a minor sensor fault and a significant mechanical issue: the same light covers both.</p>

            <hr class="blog-divider"/>

            <h2>Why reading the code is not the same as diagnosing the fault</h2>
            <p>A fault code stored in the ECU describes a symptom, not a cause. P0299 tells you boost is low. It does not tell you whether the cause is a sticking actuator, a boost leak, a worn turbo, a faulty MAP sensor, or an electrical fault in the actuator circuit. A code read without live data, plausibility checks, and guided tests produces a code number and a guess. A diagnostic session uses the code as a starting point and works through the evidence to confirm root cause.</p>

            <figure class="blog-image">
                <img src="/images/diag_photos/picoscope-multimeter.jpg" alt="Using a PicoScope and multimeter to verify an electrical fault" loading="lazy" />
            </figure>

            <hr class="blog-divider"/>

            <h2>What a diagnostic session covers for an EML</h2>
            <p>Full system scan across all modules (not just the engine module), freeze frame data review, live data checks relevant to the stored code, plausibility tests on related sensors, guided tests where the fault requires active component testing, and a written outcome naming the most likely root cause with recommended next steps.</p>

            <hr class="blog-divider"/>

            <h2>When an EML is urgent</h2>
            <p>If the EML is accompanied by limp mode, loss of power, smoke, or unusual noises, the fault is likely active and more serious. If the EML is on but the van drives normally, the fault may be intermittent or stored from a previous event. Both should be investigated but a van in limp mode needs attention sooner.</p>
            
            <hr class="blog-divider"/>

            <h2>Related reading</h2>
            <ul>
                <li><a href="/blog/sprinter-limp-mode-proper-diagnostic">Sprinter Limp Mode: What a Proper Diagnostic Looks Like</a></li>
                <li><a href="/blog/adblue-countdown-clearing-codes-not-fix">AdBlue Countdown: Why Clearing Codes Isn't a Fix</a></li>
                <li><a href="/services/diagnostic-callout">Standard Diagnosis Service</a></li>
            </ul>

            <div class="blog-cta-box">
                <p><strong>Is your Engine Management Light on?</strong></p>
                <p>Book a <a href="/services/diagnostic-callout">Standard Diagnosis</a> - we use dealer-level tools to confirm exactly why the light was triggered and provide a clear repair plan.</p>
            </div>
        `,
    }
];

const DEFAULT_BLOG_THUMBNAIL = '/images/gallery/work-48.jpg';

export function getBlogPost(slug: string): BlogPost | undefined {
    return blogPosts.find((p) => p.slug === slug);
}

export function getPostThumbnail(post: BlogPost): string {
    return post.thumbnail ?? post.ogImage ?? DEFAULT_BLOG_THUMBNAIL;
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
    if (!category) return blogPosts;
    return blogPosts.filter((p) => p.category.toLowerCase() === category.toLowerCase());
}
