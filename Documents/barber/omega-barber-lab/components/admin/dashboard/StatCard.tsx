import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  color?: 'gold' | 'green' | 'blue' | 'purple'
}

const colors = {
  gold:   { glow: 'shadow-[#c8a96e]/8',  accent: 'bg-[#c8a96e]',   icon: 'text-[#c8a96e] bg-[#c8a96e]/8 border-[#c8a96e]/15',   bar: 'from-[#c8a96e]/30 to-[#c8a96e]/5',   text: 'text-[#c8a96e]' },
  green:  { glow: 'shadow-green-500/8',  accent: 'bg-green-500',    icon: 'text-green-400 bg-green-500/8 border-green-500/15',    bar: 'from-green-500/30 to-green-500/5',    text: 'text-green-400' },
  blue:   { glow: 'shadow-blue-500/8',   accent: 'bg-blue-500',     icon: 'text-blue-400 bg-blue-500/8 border-blue-500/15',     bar: 'from-blue-500/30 to-blue-500/5',     text: 'text-blue-400' },
  purple: { glow: 'shadow-purple-500/8', accent: 'bg-purple-500',   icon: 'text-purple-400 bg-purple-500/8 border-purple-500/15', bar: 'from-purple-500/30 to-purple-500/5', text: 'text-purple-400' },
}

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'gold' }: StatCardProps) {
  const c = colors[color]
  const trendUp = (trend?.value ?? 0) >= 0

  return (
    <div className={cn(
      'relative bg-[#0e0e0e] border border-[#212121] rounded-2xl p-5 overflow-hidden transition-all hover:border-[#2b2b2b] group',
      'shadow-lg', c.glow
    )}>
      {/* Top accent line */}
      <div className={cn('absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r', c.bar)} />

      {/* Background glow blob */}
      <div className={cn(
        'absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500',
        c.bar.replace('from-', 'bg-').split(' ')[0]
      )} />

      <div className="relative">
        {/* Header row */}
        <div className="flex items-start justify-between mb-5">
          <div className={cn('w-9 h-9 rounded-xl border flex items-center justify-center', c.icon)}>
            <Icon size={16} />
          </div>

          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg',
              trendUp ? 'text-green-400 bg-green-500/8' : 'text-red-400 bg-red-500/8'
            )}>
              {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {trendUp ? '+' : ''}{trend.value}%
              <span className="text-[9px] opacity-60 font-normal">{trend.label}</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className={cn('text-3xl font-bold mb-1 tabular-nums tracking-tight', c.text)}>
          {value}
        </div>

        {/* Label */}
        <div className="text-[11px] font-semibold text-[#333] uppercase tracking-[0.15em]">{title}</div>
        {subtitle && <div className="text-[10px] text-[#363636] mt-1">{subtitle}</div>}
      </div>
    </div>
  )
}
