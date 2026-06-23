export const subjectColorOptions = [
  {
    value: 'emerald',
    label: 'Smaragdna',
    color: '#4ade80',
  },
  {
    value: 'teal',
    label: 'Tirkizna',
    color: '#2dd4bf',
  },
  {
    value: 'cyan',
    label: 'Cijan',
    color: '#38bdf8',
  },
  {
    value: 'blue',
    label: 'Plava',
    color: '#60a5fa',
  },
  {
    value: 'violet',
    label: 'Ljubičasta',
    color: '#a78bfa',
  },
  {
    value: 'amber',
    label: 'Narandžasta',
    color: '#fbbf24',
  },
  {
    value: 'rose',
    label: 'Roze',
    color: '#fb7185',
  },
  {
    value: 'lime',
    label: 'Limeta',
    color: '#bef264',
  },
  {
    value: 'mint',
    label: 'Svetlo zelena',
    color: '#86efac',
  },
]

const subjectColorMap = Object.fromEntries(
  subjectColorOptions.map((option) => [option.value, option.color])
)

export function getSubjectColorValue(colorName) {
  return subjectColorMap[colorName] || subjectColorMap.emerald
}