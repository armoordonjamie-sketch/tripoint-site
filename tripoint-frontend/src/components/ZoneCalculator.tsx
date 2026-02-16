import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { CTAButton } from './CTAButton';

const schema = z.object({
    postcode: z.string().min(3, 'Enter a valid postcode').regex(/^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i, 'Invalid postcode format'),
});

type FormData = z.infer<typeof schema>;

interface ZoneResult {
    postcode: string;
    best_base_name: string;
    best_base_address: string;
    time_minutes: number;
    distance_km: number;
    zone: string;
    details: Record<string, any>;
}

export function ZoneCalculator() {
    const [result, setResult] = useState<ZoneResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setError(null);
        setResult(null);
        try {
            const res = await fetch(`/api/calculate-zone?postcode=${encodeURIComponent(data.postcode)}`);
            if (!res.ok) throw new Error('Could not calculate zone. Please check the postcode.');

            const json = await res.json();
            setResult(json);
            trackEvent('zone_check', { postcode: data.postcode, zone: json.zone });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    return (
        <div className="rounded-2xl border border-border-default bg-surface-alt p-6 sm:p-8">
            <h3 className="mb-4 text-xl font-bold text-text-primary">Check Your Zone</h3>
            <p className="mb-6 text-sm text-text-secondary">
                Enter your postcode to see your zone and callout fee instantly.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                    <input
                        {...register('postcode')}
                        placeholder="e.g. ME19 4HT"
                        className="w-full rounded-lg border border-border-default bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                    {errors.postcode && <p className="mt-1 text-xs text-danger">{errors.postcode.message}</p>}
                </div>
                <CTAButton type="submit" disabled={isSubmitting} icon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}>
                    {isSubmitting ? 'Checking...' : 'Check Now'}
                </CTAButton>
            </form>

            {error && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {result && (
                <div className="mt-6 rounded-xl border border-brand/20 bg-brand/5 p-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-1 h-5 w-5 text-brand" />
                        <div>
                            <h4 className="font-bold text-text-primary">
                                You are in <span className="text-brand-light">Zone {result.zone}</span>
                            </h4>
                            <p className="mt-1 text-sm text-text-secondary">
                                Estimated {result.time_minutes} mins drive from our {result.best_base_name} base.
                            </p>

                            {result.zone !== 'Out of area' ? (
                                <div className="mt-3">
                                    <p className="text-sm font-medium text-text-primary">
                                        Standard Callout:
                                        <span className="ml-1 text-brand-light">
                                            {result.zone === 'A' ? '£120' : result.zone === 'B' ? '£135' : '£150'}
                                        </span>
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-2 text-sm text-warning">
                                    You are outside our standard coverage area. Please contact us for a custom quote.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
