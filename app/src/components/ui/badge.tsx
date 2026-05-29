import { cn } from '@/lib/utils';

type BadgeVariant = 'teal' | 'amber' | 'coral' | 'dark' | 'outline' | 'green';

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  teal: 'bg-[#F0F9F9] text-[#0F6F73]',
  amber: 'bg-gradient-to-r from-[#F77F00] to-[#E06B00] text-white',
  coral: 'bg-[#FFF0F0] text-[#E04347]',
  dark: 'bg-[#171A21] text-white',
  outline: 'border border-[1.5px] border-[#E4E7ED] bg-transparent text-[#444B5A]',
  green: 'bg-[rgba(6,199,85,0.1)] text-[#06C755]',
};

export function Badge({ variant = 'teal', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[12px] font-semibold px-3 py-[3px] rounded-full',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <Badge variant="teal" className={cn('text-[11px] gap-1', className)}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      Verified
    </Badge>
  );
}

export function PremiumBadge({ className }: { className?: string }) {
  return (
    <Badge variant="amber" className={cn('text-[11px]', className)}>
      ✦ Premium
    </Badge>
  );
}
