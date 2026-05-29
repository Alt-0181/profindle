'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, prefix, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-semibold text-[#171A21]">
            {label}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA0AE] text-[14px] pointer-events-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full text-[14px] px-3.5 py-2.5 rounded-[12px]',
              'border border-[1.5px] border-[#E4E7ED] bg-white text-[#171A21]',
              'outline-none transition-all duration-150',
              'placeholder:text-[#9AA0AE]',
              'focus:border-[#0F6F73] focus:shadow-[0_0_0_3px_rgba(15,111,115,0.12)]',
              error && 'border-[#FF5A5F] focus:shadow-[0_0_0_3px_rgba(255,90,95,0.12)]',
              prefix && 'pl-9',
              className
            )}
            {...props}
          />
        </div>
        {hint && !error && <p className="text-[12px] text-[#9AA0AE]">{hint}</p>}
        {error && <p className="text-[12px] text-[#FF5A5F]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  maxLength?: number;
  currentLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, maxLength, currentLength, className, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const isWarn = maxLength && currentLength && currentLength > maxLength * 0.8;
    const isDanger = maxLength && currentLength && currentLength >= maxLength;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <div className="flex items-center justify-between">
            <label htmlFor={textareaId} className="text-[13px] font-semibold text-[#171A21]">
              {label}
            </label>
            {maxLength && (
              <span className={cn(
                'text-[11.5px]',
                isDanger ? 'text-[#FF5A5F]' : isWarn ? 'text-[#F77F00]' : 'text-[#9AA0AE]'
              )}>
                {currentLength ?? 0} / {maxLength}
              </span>
            )}
          </div>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full text-[14px] px-3.5 py-2.5 rounded-[12px]',
            'border border-[1.5px] border-[#E4E7ED] bg-white text-[#171A21]',
            'outline-none transition-all duration-150 resize-vertical',
            'placeholder:text-[#9AA0AE] min-h-[96px]',
            'focus:border-[#0F6F73] focus:shadow-[0_0_0_3px_rgba(15,111,115,0.12)]',
            error && 'border-[#FF5A5F] focus:shadow-[0_0_0_3px_rgba(255,90,95,0.12)]',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-[12px] text-[#9AA0AE]">{hint}</p>}
        {error && <p className="text-[12px] text-[#FF5A5F]">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
