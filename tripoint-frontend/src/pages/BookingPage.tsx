import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { Notice } from '@/components/Notice';
import { Clock } from 'lucide-react';
import { ZoneCalculator } from '@/components/ZoneCalculator';
import { BookingScheduler } from '@/components/BookingScheduler';

export function BookingPage() {
    return (
        <>
            <Seo
                title="Book a Diagnostic"
                description="Book your mobile diagnostic appointment with TriPoint Diagnostics using our live booking scheduler."
                canonical="/booking"
            />

            <Section>
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl">Book a Diagnostic</h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
                        Pick your service, check live availability, and confirm your fixed zone-based price online.
                    </p>
                    <div className="mx-auto mt-8 max-w-xl">
                        <ZoneCalculator />
                    </div>
                </div>

                <div className="mx-auto mt-12 max-w-3xl">
                    <h2 className="mb-4 text-2xl font-bold text-text-primary">How Booking Works</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-border-default bg-surface-alt p-4">
                            <div className="mb-2 flex items-center gap-2 text-brand">
                                <Clock className="h-5 w-5" />
                                <h3 className="font-semibold text-text-primary">Operating Hours</h3>
                            </div>
                            <p className="text-sm text-text-secondary">
                                <strong>Mon - Sat:</strong> 6:00 AM – 10:00 PM
                                <br />
                                Slots are shown in 30-minute starts and filtered against existing Google Calendar events.
                            </p>
                        </div>
                        <div className="rounded-xl border border-border-default bg-surface-alt p-4">
                            <div className="mb-2 flex items-center gap-2 text-brand">
                                <Clock className="h-5 w-5" />
                                <h3 className="font-semibold text-text-primary">Pricing & Deposits</h3>
                            </div>
                            <p className="text-sm text-text-secondary">
                                Your zone and service selection set the confirmed fixed price instantly.
                                Deposits remain £30 (Zone A/B) and £50 (Zone C or VOR).
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto mt-12 max-w-5xl">
                    <h2 className="mb-4 text-2xl font-bold text-text-primary">Schedule Online</h2>
                    <BookingScheduler />
                </div>

                <div className="mx-auto mt-8 max-w-3xl">
                    <Notice variant="info">
                        <strong>Safety note:</strong> Please confirm the vehicle is in a safe, accessible working location (driveway, depot, yard).
                        We may need to decline or rearrange jobs at unsafe roadside locations.
                    </Notice>
                </div>
            </Section>
        </>
    );
}
