export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) {
    return '--'
  }

  return new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: value >= 100 ? 2 : 4,
    minimumFractionDigits: value >= 100 ? 2 : 4,
  }).format(value)
}

export function formatVolume(value: number): string {
  if (!Number.isFinite(value)) {
    return '--'
  }

  return new Intl.NumberFormat('zh-CN', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return '--'
  }

  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function formatDateTime(value: string | null): string {
  if (!value) {
    return '尚未复盘'
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
