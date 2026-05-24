import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, CalendarDays, ChevronUp } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { trackNavClick, trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics';
import { getWhatsAppHref } from '@/lib/whatsappHref';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'tripoint_mobile_sticky_cta_collapsed';

const BUTTON_BLOCK_PX = 50;
const GRABBER_EXPANDED_PX = 30;
const COLLAPSED_SHELL_PX = 60;
const EXPANDED_SHELL_PX = GRABBER_EXPANDED_PX + BUTTON_BLOCK_PX;
const SNAP_HIDE_PX = 36;
const SNAP_SHOW_PX = 24;
const TAP_SLOP_PX = 18;

const safeBottom = 'max(10px, env(safe-area-inset-bottom, 0px))';
const expandedShellHeight = `calc(${EXPANDED_SHELL_PX}px + ${safeBottom})`;
const collapsedChromeHeight = `calc(${COLLAPSED_SHELL_PX}px + ${safeBottom})`;

function readStoredCollapsed(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
        return false;
    }
}

function writeStoredCollapsed(collapsed: boolean) {
    if (typeof window === 'undefined') return;
    try {
        if (collapsed) sessionStorage.setItem(STORAGE_KEY, '1');
        else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        /* ignore */
    }
}

export function MobileStickyCTA() {
    const [mounted, setMounted] = useState(false);
    /** SSR + first client paint must match; hydrate from sessionStorage after commit. */
    const [collapsed, setCollapsed] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [justExpanded, setJustExpanded] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);

    const dragOffsetRef = useRef(0);
    const startYRef = useRef(0);
    const modeRef = useRef<'collapse' | 'expand' | null>(null);
    const collapsedRef = useRef(collapsed);
    const activePointerId = useRef<number | null>(null);
    const dragActiveRef = useRef(false);
    const justExpandedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    /** Skip persisting the initial false before useLayoutEffect restores sessionStorage. */
    const skipPersistCollapsed = useRef(true);

    const markJustExpanded = useCallback(() => {
        if (justExpandedTimer.current) clearTimeout(justExpandedTimer.current);
        setJustExpanded(true);
        justExpandedTimer.current = setTimeout(() => setJustExpanded(false), 500);
    }, []);

    useEffect(() => {
        setMounted(true);
        return () => {
            if (justExpandedTimer.current) clearTimeout(justExpandedTimer.current);
        };
    }, []);

    useLayoutEffect(() => {
        setCollapsed(readStoredCollapsed());
        setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }, []);

    useEffect(() => {
        collapsedRef.current = collapsed;
    }, [collapsed]);

    useEffect(() => {
        if (skipPersistCollapsed.current) {
            skipPersistCollapsed.current = false;
            return;
        }
        writeStoredCollapsed(collapsed);
    }, [collapsed]);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const h = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mq.addEventListener('change', h);
        return () => mq.removeEventListener('change', h);
    }, []);

    const finishDrag = useCallback(() => {
        if (!dragActiveRef.current) return;
        dragActiveRef.current = false;

        const off = dragOffsetRef.current;
        const mode = modeRef.current;
        const wasCollapsed = collapsedRef.current;

        modeRef.current = null;
        activePointerId.current = null;
        setIsDragging(false);
        setDragOffset(0);
        dragOffsetRef.current = 0;

        if (mode === 'collapse' && off >= SNAP_HIDE_PX) {
            setCollapsed(true);
        } else if (mode === 'expand' && wasCollapsed) {
            const tapLike = Math.abs(off) <= TAP_SLOP_PX && off <= 8;
            if (off <= -SNAP_SHOW_PX || tapLike) {
                setCollapsed(false);
                markJustExpanded();
            }
        }
    }, [markJustExpanded]);

    const removeWindowListeners = useRef<(() => void) | null>(null);

    const onGrabberPointerDown = (e: React.PointerEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();

        removeWindowListeners.current?.();
        dragActiveRef.current = false;
        activePointerId.current = e.pointerId;
        startYRef.current = e.clientY;
        modeRef.current = collapsedRef.current ? 'expand' : 'collapse';
        dragOffsetRef.current = 0;
        setDragOffset(0);
        dragActiveRef.current = true;
        setIsDragging(true);

        const onMove = (ev: PointerEvent) => {
            if (activePointerId.current !== ev.pointerId || !modeRef.current || !dragActiveRef.current) return;
            const dy = ev.clientY - startYRef.current;

            if (modeRef.current === 'collapse') {
                const next = Math.max(0, Math.min(dy, BUTTON_BLOCK_PX + 72));
                dragOffsetRef.current = next;
                setDragOffset(next);
            } else {
                const next = Math.min(0, Math.max(dy, -(BUTTON_BLOCK_PX + 40)));
                dragOffsetRef.current = next;
                setDragOffset(next);
            }
        };

        const onUp = (ev: PointerEvent) => {
            if (activePointerId.current !== ev.pointerId || !dragActiveRef.current) return;
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
            removeWindowListeners.current = null;
            finishDrag();
        };

        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
        removeWindowListeners.current = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
        };
    };

    useEffect(
        () => () => {
            removeWindowListeners.current?.();
        },
        [],
    );

    const onCollapsedChromePointerDown = (e: React.PointerEvent) => {
        if (!collapsedRef.current || e.button !== 0) return;
        if ((e.target as HTMLElement).closest('a, button')) return;
        onGrabberPointerDown(e);
    };

    const expandFromTap = (e: React.MouseEvent) => {
        if (!collapsed) return;
        e.preventDefault();
        setCollapsed(false);
        markJustExpanded();
    };

    const swallowDeadZone = (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const translateY = dragOffset;
    const dragProgress =
        modeRef.current === 'collapse'
            ? Math.min(1, dragOffset / (BUTTON_BLOCK_PX + 24))
            : modeRef.current === 'expand'
              ? Math.min(1, Math.abs(dragOffset) / (BUTTON_BLOCK_PX + 16))
              : 0;

    const transition =
        reducedMotion || isDragging
            ? 'none'
            : 'transform 0.38s cubic-bezier(0.25, 0.9, 0.25, 1), height 0.38s cubic-bezier(0.25, 0.9, 0.25, 1), opacity 0.38s ease, box-shadow 0.38s ease';

    const toggleFromKeyboard = () => {
        setCollapsed((c) => !c);
    };

    const tree = (
        <div
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] lg:hidden"
            style={{ height: expandedShellHeight }}
        >
            {collapsed && (
                <div
                    className="pointer-events-auto absolute inset-x-0 top-0 touch-none"
                    style={{ bottom: collapsedChromeHeight }}
                    aria-hidden
                    onPointerDown={swallowDeadZone}
                    onPointerUp={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onClick={() => { setCollapsed(false); markJustExpanded(); }}
                />
            )}
            <div
                id="mobile-sticky-cta-shell"
                className={cn(
                    'pointer-events-auto absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-2xl border border-border-default border-b-0 bg-surface/95 backdrop-blur-md',
                    isDragging ? 'shadow-[0_-16px_48px_rgba(14,165,233,0.18)]' : 'shadow-[0_-10px_40px_rgba(0,0,0,0.45)]',
                )}
                style={{
                    height: collapsed ? collapsedChromeHeight : expandedShellHeight,
                    transition,
                    opacity: isDragging ? 0.92 + dragProgress * 0.08 : 1,
                }}
                onPointerDown={collapsed ? onCollapsedChromePointerDown : undefined}
            >
                <div
                    className={cn('flex flex-col', !collapsed && 'h-full')}
                    style={{
                        transform: `translateY(${translateY}px)`,
                        transition,
                    }}
                >
                    <div
                        role="button"
                        tabIndex={0}
                        aria-expanded={!collapsed}
                        aria-controls={collapsed ? undefined : 'mobile-sticky-cta-actions'}
                        aria-label={
                            collapsed
                                ? 'Tap or swipe up to show Call, WhatsApp and Book'
                                : 'Drag handle down to hide quick actions'
                        }
                        onKeyDown={(ev) => {
                            if (ev.key === 'Enter' || ev.key === ' ') {
                                ev.preventDefault();
                                toggleFromKeyboard();
                            }
                        }}
                        onPointerDown={onGrabberPointerDown}
                        onClick={expandFromTap}
                        className={cn(
                            'touch-none flex shrink-0 cursor-grab flex-col items-center justify-center active:cursor-grabbing',
                            'select-none px-3',
                            collapsed ? 'gap-0.5 py-1.5' : 'gap-0.5 py-1',
                        )}
                        style={{ minHeight: collapsed ? undefined : GRABBER_EXPANDED_PX }}
                    >
                        <span
                            className={cn(
                                'h-1 w-9 shrink-0 rounded-full transition-colors duration-200',
                                isDragging ? 'bg-brand-light/90' : 'bg-text-muted/60',
                            )}
                            aria-hidden
                        />
                        {collapsed ? (
                            <span className="flex flex-col items-center gap-0.5 px-1 text-center">
                                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-text-primary">
                                    <ChevronUp className="h-3.5 w-3.5 shrink-0 text-brand-light" aria-hidden />
                                    Quick actions
                                </span>
                                <span className="max-w-[17rem] text-[9px] font-medium leading-snug text-text-secondary">
                                    Tap or swipe up for Call, WhatsApp &amp; Book
                                </span>
                            </span>
                        ) : null}
                    </div>

                    {!collapsed && (
                        <div
                            id="mobile-sticky-cta-actions"
                            className="flex shrink-0 gap-2 px-3 pb-1 pt-0"
                            style={{ minHeight: BUTTON_BLOCK_PX, pointerEvents: justExpanded ? 'none' : 'auto' }}
                        >
                            <a
                                href={`tel:${siteConfig.contact.phoneE164}`}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-brand py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
                                aria-label={`Call us on ${siteConfig.contact.phoneDisplay}`}
                                onClick={() => trackPhoneClick('sticky_mobile')}
                            >
                                <Phone className="h-5 w-5" />
                                Call
                            </a>
                            <a
                                href={getWhatsAppHref()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-success py-2 text-sm font-semibold text-white transition-colors hover:bg-success/90"
                                onClick={() => trackWhatsAppClick('sticky_mobile')}
                            >
                                <MessageCircle className="h-5 w-5" />
                                WhatsApp
                            </a>
                            <Link
                                to="/booking"
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-brand py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
                                onClick={() => trackNavClick('/booking', 'Book Now', 'sticky_mobile')}
                            >
                                <CalendarDays className="h-4 w-4" />
                                Book Now
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (!mounted) return null;
    return createPortal(tree, document.body);
}
