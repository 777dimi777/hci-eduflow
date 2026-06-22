export function formatDate(dateValue) {
  if (!dateValue) {
    return 'Datum nije unet'
  }

  const parts = dateValue.split('-')

  if (parts.length !== 3) {
    return dateValue
  }

  const [year, month, day] = parts

  return `${day}.${month}.${year}.`
}