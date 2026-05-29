import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  imageUrl?: string;
}

const sizeStyles = {
  sm: 'w-8 h-8 text-[12px]',
  md: 'w-10 h-10 text-[14px]',
  lg: 'w-12 h-12 text-[16px]',
  xl: 'w-[72px] h-[72px] text-[24px] rounded-[18px]',
};

export function Avatar({ name, size = 'md', className, imageUrl }: AvatarProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn(
          'rounded-full object-cover flex-shrink-0',
          sizeStyles[size],
          size === 'xl' ? 'rounded-[18px]' : 'rounded-full',
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center font-bold flex-shrink-0',
        'bg-gradient-to-br from-[#0F6F73] to-[#1A9DA3] text-white',
        size === 'xl' ? 'rounded-[18px]' : 'rounded-full',
        sizeStyles[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
