import { OptimizedLogo } from '@/components/OptimizedLogo';

export function RouteLoadingFallback() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-surface" role="status" aria-live="polite">
            <div className="animate-pulse-glow" aria-hidden>
                <OptimizedLogo name="logo-no-text-light" alt="" className="h-16 w-auto opacity-90" />
            </div>
            <span className="sr-only">Loading page</span>
        </div>
    );
}
