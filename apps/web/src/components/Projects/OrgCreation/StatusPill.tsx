import Pill from '@components/DesignSystem/Pills/Pill'
import { ProjectStatus } from '@servicegeek/db'

export const getStatusColor = (status?: ProjectStatus | null) => {
  if (status === ProjectStatus.active) {
    return 'green'
  }
  if (status === ProjectStatus.mitigation) {
    return 'blue'
  }
  if (status === ProjectStatus.inspection) {
    return 'yellow'
  }
  if (status === ProjectStatus.review) {
    return 'orange'
  }
  if (status === ProjectStatus.incomplete) {
    return 'red'
  }
  return 'none'
}

const StatusPill = ({ status }: { status?: ProjectStatus | null }) => {
  return <Pill color={getStatusColor(status)}>{status}</Pill>
}

export const StatusValuePill = ({
  label,
  color,
}: {
  label: string
  color: string
}) => {
  return <Pill color={color}>{label}</Pill>
}

export default StatusPill
