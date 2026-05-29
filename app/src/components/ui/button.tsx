'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'premium' | 'ghost' | 'danger' | 'line';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  block?: boolean;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'text-white font-semibold border-none',
    'bg-gradient-to-br from-[#0F6F73] to-[#1A9DA3]',
    'shadow-[0_2px_8px_rgba(15,111,115,0.25)]',
    'hover:brightness-110 hover:shadow-[0_6px_20px_rgba(15,111,115,0.4)]',
    'active:scale-[0.97]',
  ].join(' '),
  secondary: [
    'bg-transparent text-[#0F6F73] font-semibold',
    'border border-[1.5px] border-[#0F6F73]',
    'hover:bg-[rgba(15,111,115,0.06)]',
    'active:scale-[0.97]',
  ].join(' '),
  premium: [
    'text-white font-semibold border-none',
    'bg-gradient-to-br from-[#F77F00] to-[#E06B00]',
    'shadow-[0_2px_8px_rgba(247,127,0,0.25)]',
    'hover:brightness-110 hover:shadow-[0_6px_20px_rgba(247,127,0,0.4)]',
    'active:scale-[0.97]',
  ].join(' '),
  ghost: [
    'bg-transparent text-[#444B5A] font-semibold',
    'border border-[1.5px] border-[#E4E7ED]',
    'hover:bg-[#F4F5F7] hover:text-[#171A21]',
    'active:scale-[0.97]',
  ].join(' '),
  danger: [
    'bg-transparent text-[#E04347] font-semibold',
    'border border-[1.5px] border-[#FFD6D7]',
    'hover:bg-[#FFF0F0]',
    'active:scale-[0.97]',
  ].join(' '),
  line: [
    'text-white font-semibold border-none',
    'bg-[#06C755]',
    'hover:bg-[#04a544]',
    'active:scale-[0.97]',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-[14px] py-[7px] text-[13px] rounded-[10px]',
  md: 'px-[22px] py-[10px] text-[14px] rounded-[12px]',
  lg: 'px-[32px] py-[14px] text-[16px] rounded-[12px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, block, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold',
          'transition-all duration-150 cursor-pointer',
          'disabled:opacity-45 disabled:pointer-events-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6F73] focus-visible:ring-offset-1',
          variantStyles[variant],
          sizeStyles[size],
          block && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </>
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
