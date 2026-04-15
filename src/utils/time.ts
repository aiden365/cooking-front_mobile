function normalizeTimeInput(input: string | number | Date) {
  if (input instanceof Date) {
    return new Date(input.getTime())
  }

  if (typeof input === 'number') {
    return new Date(input)
  }

  const normalized = input.trim().replace(/-/g, '/')
  return new Date(normalized)
}

export function formatRelativeTime(input: string | number | Date, now = new Date()) {
  const targetDate = normalizeTimeInput(input)

  if (Number.isNaN(targetDate.getTime())) {
    return ''
  }

  const diff = now.getTime() - targetDate.getTime()

  if (diff <= 0) {
    return '刚刚'
  }

  const second = 1000
  const minute = 60 * second
  const hour = 60 * minute
  const day = 24 * hour
  const month = 30 * day
  const year = 365 * day

  if (diff < minute) {
    return `${Math.max(1, Math.floor(diff / second))}秒前`
  }

  if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  }

  if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  }

  if (diff < month) {
    return `${Math.floor(diff / day)}天前`
  }

  if (diff < year) {
    return `${Math.floor(diff / month)}个月前`
  }

  return `${Math.floor(diff / year)}年前`
}
