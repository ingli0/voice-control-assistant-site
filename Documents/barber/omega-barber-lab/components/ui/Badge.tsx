import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'gold' | 'green' | 'red' | 'amber' | 'blue' | 'gray' | 'default'
  className?: string
}

const variantStyles = {
  default: 'bg-[#222] text-[#888] border-[#333]',
  gold: 'bg-[#c8a96e]/10 text-[#c8a96e] border-[#c8a96e]/30',
  green: 'bg-green-900/30 text-green-400 border-green-800',
  red: 'bg-red-900/30 text-red-400 border-red-800',
  amber: 'bg-amber-900/30 text-amber-400 border-amber-800',
  blue: 'bg-blue-900/30 text-blue-400 border-blue-800',
  gray: 'bg-[#272727] text-[#666] border-[#363636]',
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
