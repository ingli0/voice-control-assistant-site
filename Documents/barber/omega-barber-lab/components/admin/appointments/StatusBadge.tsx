import Badge from '@/components/ui/Badge'
import { statusLabel, statusColor } from '@/lib/utils'
import type { AppointmentStatus } from '@/types'

const colorMap: Record<string, 'amber' | 'green' | 'red' | 'blue' | 'gray'> = {
  pending: 'amber',
  confirmed: 'green',
  cancelled: 'red',
  completed: 'blue',
  no_show: 'gray',
}

export default function StatusBadge({ status }: { status: AppointmentStatus }) {
  return <Badge variant={colorMap[status] ?? 'gray'}>{statusLabel(status)}</Badge>
}
