import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  interactive?: boolean;
  dark?: boolean;
  accent?: boolean;
  onClick?: () => void;
}

export function Card({ className, children, interactive, dark, accent, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-[12px] bg-white border border-[rgba(15,111,115,0.10)]',
        interactive && [
          'cursor-pointer transition-all duration-200',
          'hover:-translate-y-[3px] hover:shadow-[0_8px_32px_rgba(15,111,115,0.13)]',
        ],
        dark && 'bg-gradient-to-br from-[#171A21] to-[#0F6F73] text-white border-transparent',
        accent && 'overflow-hidden',
        className
      )}
    >
      {accent && (
        <div className="h-[3px] bg-gradient-to-r from-[#0F6F73] to-[#1A9DA3]" />
      )}
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('px-5 py-4 border-b border-[#F4F5F7] flex items-center justify-between', className)}>
      {children}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('p-5', className)}>
      {children}
    </div>
  );
}
