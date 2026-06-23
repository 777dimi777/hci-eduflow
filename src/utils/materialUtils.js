export const materialTypeOptions = [
  {
    value: 'note',
    label: 'Beleška',
    icon: 'bi-journal-text',
  },
  {
    value: 'link',
    label: 'Link',
    icon: 'bi-link-45deg',
  },
  {
    value: 'pdf',
    label: 'PDF materijal',
    icon: 'bi-file-earmark-pdf',
  },
  {
    value: 'video',
    label: 'Video',
    icon: 'bi-play-btn',
  },
  {
    value: 'presentation',
    label: 'Prezentacija',
    icon: 'bi-easel2',
  },
  {
    value: 'other',
    label: 'Ostalo',
    icon: 'bi-folder2-open',
  },
]

const materialTypeMap = Object.fromEntries(
  materialTypeOptions.map((item) => [item.value, item])
)

export function getMaterialType(type) {
  return materialTypeMap[type] || materialTypeMap.other
}

export function normalizeExternalUrl(value) {
  const trimmedValue = String(value || '').trim()

  if (!trimmedValue) {
    return ''
  }

  const preparedUrl = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`

  try {
    new URL(preparedUrl)

    return preparedUrl
  } catch {
    return null
  }
}

export function parseTags(value) {
  const tags = String(value || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  return [...new Set(tags)]
}

export function formatMaterialDate(dateValue) {
  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return 'Datum nije dostupan'
  }

  return new Intl.DateTimeFormat('sr-RS', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}