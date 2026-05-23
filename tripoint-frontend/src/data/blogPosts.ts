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
        ogImage: '/images/blog/om654-turbo-failure/om654-turbo-compressor-split.jpeg',
        thumbnail: '/images/blog/om654-turbo-failure/om654-turbo-compressor-split.jpeg',
        author: 'TriPoint Diagnostics',
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
        updatedAt: '2026-05-23',
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
        publishedAt: '2026-05-23',
        updatedAt: '2026-05-23',
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
        publishedAt: '2026-05-23',
        updatedAt: '2026-05-23',
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
        updatedAt: '2026-05-23',
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
        updatedAt: '2026-05-23',
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
        updatedAt: '2026-05-23',
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

            <div class="blog-cta-box">
                <p><strong>P2002 stored on your Mercedes?</strong></p>
                <p>Book a <a href="/services/diagnostic-callout">Standard Diagnosis</a> - we read DPF live data and regen history before any repair decision is made.</p>
            </div>
        `,
    },
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
