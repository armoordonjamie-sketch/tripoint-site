import type { ReactNode, ButtonHTMLAttributes, MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface CTAButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: Variant;
    size?: Size;
    href?: string;
    external?: boolean;
    icon?: ReactNode;
}

const variants: Record<Variant, string> = {
    primary:
        'bg-brand hover:bg-brand-light text-white shadow-lg shadow-brand/20 hover:shadow-brand/40',
    secondary:
        'bg-surface-elevated hover:bg-surface-alt text-text-primary border border-border-default',
    outline:
        'border-2 border-brand text-brand hover:bg-brand hover:text-white',
    ghost:
        'text-text-secondary hover:text-text-primary hover:bg-surface-alt',
};

const sizes: Record<Size, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
};

export function CTAButton({
    children,
    variant = 'primary',
    size = 'md',
    href,
    external = false,
    icon,
    className,
    onClick,
    ...props
}: CTAButtonProps) {
    const classes = cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:grayscale',
        variants[variant],
        sizes[size],
        className,
    );

    if (href && external) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={classes}
                onClick={onClick as unknown as MouseEventHandler<HTMLAnchorElement>}
            >
                {icon}
                {children}
            </a>
        );
    }

    if (href) {
        return (
            <Link to={href} className={classes} onClick={onClick as unknown as MouseEventHandler<HTMLAnchorElement>}>
                {icon}
                {children}
            </Link>
        );
    }

    return (
        <button className={classes} onClick={onClick} {...props}>
            {icon}
            {children}
        </button>
    );
}
