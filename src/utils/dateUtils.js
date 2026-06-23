const monthNames = [
  'januar',
  'februar',
  'mart',
  'april',
  'maj',
  'jun',
  'jul',
  'avgust',
  'septembar',
  'oktobar',
  'novembar',
  'decembar',
]

export const weekDayLabels = [
  'Pon',
  'Uto',
  'Sre',
  'Čet',
  'Pet',
  'Sub',
  'Ned',
]

export function parseDateKey(dateValue) {
  if (!dateValue) {
    return null
  }

  const [year, month, day] = dateValue.split('-').map(Number)

  if (!year || !month || !day) {
    return null
  }

  return new Date(year, month - 1, day)
}

export function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function formatDate(dateValue) {
  const date = parseDateKey(dateValue)

  if (!date) {
    return 'Datum nije unet'
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${day}.${month}.${date.getFullYear()}.`
}

export function formatLongDate(dateValue) {
  const date = typeof dateValue === 'string' ? parseDateKey(dateValue) : dateValue

  if (!date) {
    return 'Datum nije unet'
  }

  return `${date.getDate()}. ${monthNames[date.getMonth()]} ${date.getFullYear()}.`
}

export function formatMonthTitle(date) {
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}.`
}

export function getCalendarDays(monthDate) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const mondayFirstIndex = (firstDay.getDay() + 6) % 7

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, month, 1 - mondayFirstIndex + index)

    return {
      date,
      dateKey: toDateKey(date),
      isCurrentMonth: date.getMonth() === month,
    }
  })
}