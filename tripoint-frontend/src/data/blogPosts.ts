export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    category: string;
    publishedAt: string;
    content: string;
    relatedServices: string[];
}

export const blogPosts: BlogPost[] = [
    {
        slug: 'sprinter-limp-mode-proper-diagnostic',
        title: 'Sprinter Limp Mode: What a Proper Diagnostic Looks Like',
        description: 'Common triggers for Sprinter limp mode, why code-clearing doesn\'t work, and what a proper diagnostic session involves.',
        category: 'Mercedes',
        publishedAt: '2025-01-15',
        relatedServices: ['sprinter-limp-mode', 'diagnostic-callout'],
        content: `
            <div class="blog-lead">
                Sprinter limp mode is frustrating for one reason: it turns a working van into a liability. You feel it immediately - reduced power, limited revs, poor pull, sometimes a speed limiter, and a dashboard that looks like a Christmas tree.
            </div>

            <figure class="blog-image">
                <img src="/images/gallery/work-31.jpg" alt="Sprinter instrument cluster with multiple warning lights active" loading="lazy" />
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
                <img src="/images/gallery/work-22.jpg" alt="Damaged turbocharger with sheared metal inside housing" loading="lazy" />
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
                <img src="/images/gallery/work-26.jpg" alt="Fouled EGR pipe with thick carbon soot on white Sprinter" loading="lazy" />
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
                <img src="/images/gallery/work-05.jpg" alt="Damaged wiring loom in Sprinter engine bay with frayed cables" loading="lazy" />
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
                <img src="/images/gallery/work-48.jpg" alt="Teslong borescope inspecting Sprinter engine bay with Milwaukee tools" loading="lazy" />
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

            <div class="blog-cta-box">
                <p><strong>Want this done properly?</strong></p>
                <p>If your Sprinter is in limp mode, book our <a href="/services/sprinter-limp-mode">Sprinter Limp Mode Triage</a> or use our <a href="/services/diagnostic-callout">Diagnostic Callout</a> for general fault finding.</p>
            </div>
        `,
    },
    {
        slug: 'adblue-countdown-clearing-codes-not-fix',
        title: 'AdBlue Countdown: Why Clearing Codes Isn\'t a Fix',
        description: 'What triggers the AdBlue countdown, why it returns after clearing, and what a proper decision visit actually does.',
        category: 'Emissions',
        publishedAt: '2025-01-20',
        relatedServices: ['adblue-countdown', 'emissions-diagnostics'],
        content: `
            <div class="blog-lead">
                An AdBlue countdown is one of the most stressful warnings you can get because it creates urgency. You're not just looking at a light - you're watching a timer that feels like it's closing in.
            </div>

            <figure class="blog-image">
                <img src="/images/gallery/work-30.jpg" alt="MBUX screen showing vehicle breakdown alert on Sprinter" loading="lazy" />
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
                <img src="/images/gallery/work-27.jpg" alt="Soot-covered NOx sensor probe removed from engine" loading="lazy" />
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
                <img src="/images/gallery/work-33.jpg" alt="Corroded sensor pins with moisture damage in connector" loading="lazy" />
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
                <img src="/images/gallery/work-41.jpg" alt="UNI-T clamp multimeter measuring parasitic draw on Mercedes door sill" loading="lazy" />
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
                <p>Book our <a href="/services/adblue-countdown">AdBlue Countdown Diagnostic</a> service or visit the <a href="/services/emissions-diagnostics">Emissions Diagnostics Hub</a>.</p>
            </div>
        `,
    },
    {
        slug: 'dpf-warning-light-regen-vs-worse',
        title: 'DPF Warning Lights: When Regen Helps vs When It Makes Things Worse',
        description: 'Forced regen vs passive, when regen is safe, when it masks a deeper fault, and why we diagnose first.',
        category: 'Emissions',
        publishedAt: '2025-01-25',
        relatedServices: ['dpf-regeneration-decision', 'emissions-diagnostics'],
        content: `
            <div class="blog-lead">
                DPF warning lights cause a predictable reaction: "Can you just force a regen?" Sometimes yes - a regen is the right move and it gets you back on the road quickly. But sometimes forcing a regen is either unsafe, pointless, or it hides a deeper problem that will bring the warning straight back.
            </div>

            <figure class="blog-image">
                <img src="/images/gallery/work-14.jpg" alt="Sooty exhaust tailpipe showing carbon deposits for emissions check" loading="lazy" />
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
                <img src="/images/gallery/work-43.jpg" alt="Garrett turbocharger removed showing soot build-up inside housing" loading="lazy" />
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
                <img src="/images/gallery/work-35.jpg" alt="Carbon-clogged MAP sensor from Sprinter engine bay" loading="lazy" />
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
                <img src="/images/gallery/work-44.jpg" alt="Removed intake manifold and throttle body with carbon deposits on workshop floor" loading="lazy" />
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
                <p>Book our <a href="/services/dpf-regeneration-decision">DPF Diagnostic / Decision Visit</a> or visit the <a href="/services/emissions-diagnostics">Emissions Diagnostics Hub</a>.</p>
            </div>
        `,
    },
];

export function getBlogPost(slug: string): BlogPost | undefined {
    return blogPosts.find((p) => p.slug === slug);
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
    if (!category) return blogPosts;
    return blogPosts.filter((p) => p.category.toLowerCase() === category.toLowerCase());
}
