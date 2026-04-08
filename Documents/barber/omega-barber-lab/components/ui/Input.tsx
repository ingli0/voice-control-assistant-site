import { cn } from '@/lib/utils'
import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#ccc]">
            {label}
            {props.required && <span className="text-[#c8a96e] ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          suppressHydrationWarning
          className={cn(
            'w-full bg-[#292929] border border-[#363636] rounded-lg px-3 py-2.5 text-sm text-[#e5e5e5] placeholder-[#555] outline-none transition-all',
            'focus:border-[#c8a96e] focus:ring-1 focus:ring-[#c8a96e]/30',
            error && 'border-red-700 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-[#666]">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
