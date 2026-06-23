const subjectColorMap = {
  emerald: '#4ade80',
  lime: '#bef264',
  teal: '#2dd4bf',
  mint: '#86efac',
  cyan: '#38bdf8',
  blue: '#60a5fa',
  amber: '#fbbf24',
  violet: '#a78bfa',
  rose: '#fb7185',
}

export function getSubjectColorValue(colorName) {
  return subjectColorMap[colorName] || subjectColorMap.emerald
}