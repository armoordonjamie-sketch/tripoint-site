import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { trackNavClick } from '@/lib/analytics';

const SERVICES_SECTION_ID = 'home-services';
const FADE_DISTANCE = 120;

export function HeroScrollCue() {
    const [visible, setVisible] = useState(true);
    const rafRef = useRef(0);

    const handleScroll = useCallback(() => {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            setVisible(window.scrollY < FADE_DISTANCE);
        });
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => {
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(rafRef.current);
        };
    }, [handleScroll]);

    const scrollToServices = () => {
        trackNavClick(`#${SERVICES_SECTION_ID}`, 'Scroll to services', 'hero_scroll_cue');
        document.getElementById(SERVICES_SECTION_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div
            className="pointer-events-none fixed inset-x-0 z-20 flex justify-center transition-opacity duration-300 bottom-[max(6.5rem,calc(112px+max(12px,env(safe-area-inset-bottom,0px))))] sm:hidden"
            style={{ opacity: visible ? 1 : 0 }}
            aria-hidden={!visible}
        >
            <button
                type="button"
                onClick={scrollToServices}
                tabIndex={visible ? 0 : -1}
                className="pointer-events-auto flex flex-col items-center gap-2 active:scale-[0.97] transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                aria-label="Scroll to services section"
            >
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                    Explore services
                </span>
                <div className="flex flex-col items-center -space-y-4 animate-bounce-slow text-brand/70" aria-hidden>
                    <ChevronDown className="h-6 w-6 animate-pulse" />
                    <ChevronDown className="h-6 w-6" />
                </div>
            </button>
        </div>
    );
}
