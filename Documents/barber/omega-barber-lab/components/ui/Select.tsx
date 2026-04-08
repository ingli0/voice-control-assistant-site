import { cn } from '@/lib/utils'
import { forwardRef, type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-[#ccc]">
            {label}
            {props.required && <span className="text-[#c8a96e] ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          suppressHydrationWarning
          className={cn(
            'w-full bg-[#292929] border border-[#363636] rounded-lg px-3 py-2.5 text-sm text-[#e5e5e5] outline-none transition-all cursor-pointer',
            'focus:border-[#c8a96e] focus:ring-1 focus:ring-[#c8a96e]/30',
            error && 'border-red-700',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
export default Select
