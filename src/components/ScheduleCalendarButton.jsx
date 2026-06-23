import { useMemo } from 'react'
import { useSubjects } from '../context/SubjectContext'
import { useTasks } from '../context/TaskContext'
import {
  normalizeCourseCode,
  normalizeText,
} from '../utils/examSchedulePdfUtils'

function findMatchingSubject(subjects, entry) {
  if (!entry) {
    return null
  }

  const normalizedEntryCode = normalizeCourseCode(entry.courseCode)
  const normalizedEntryName = normalizeText(entry.subjectName)

  return subjects.find((subject) => {
    const normalizedSubjectCode = normalizeCourseCode(subject.code)
    const normalizedSubjectName = normalizeText(subject.name)

    const sameCode =
      normalizedEntryCode &&
      normalizedSubjectCode &&
      normalizedEntryCode === normalizedSubjectCode

    const sameName =
      normalizedEntryName &&
      normalizedSubjectName &&
      (normalizedEntryName === normalizedSubjectName ||
        normalizedEntryName.includes(normalizedSubjectName) ||
        normalizedSubjectName.includes(normalizedEntryName))

    return sameCode || sameName
  })
}

function ScheduleCalendarButton({ schedule, entry, onFeedback }) {
  const { subjects } = useSubjects()
  const { tasks, addExamTask } = useTasks()

  const linkedSubject = useMemo(() => {
    return findMatchingSubject(subjects, entry)
  }, [subjects, entry])

  if (!entry || !entry.subjectName) {
    return (
      <span className="schedule-calendar-added">
        <i className="bi bi-exclamation-circle"></i>
        Nema predmeta
      </span>
    )
  }

  const scheduleReference =
    schedule?.id || schedule?.title || 'raspored-ispita'

  const entryReference =
    entry.id ||
    [
      entry.courseCode,
      entry.dateIso,
      entry.time,
      entry.subjectName,
    ]
      .filter(Boolean)
      .join('|')

  const alreadyAdded = (tasks || []).some(
    (task) =>
      task.sourceScheduleId === scheduleReference &&
      task.sourceScheduleEntryId === entryReference
  )

  function handleAddToCalendar() {
    if (!entry.dateIso) {
      onFeedback(
        'Ispit nema upisan datum. Prvo unesi datum u tabeli rasporeda.'
      )
      return
    }

    const result = addExamTask({
      scheduleId: scheduleReference,
      scheduleTitle: schedule?.title || 'Raspored ispita',
      scheduleEntry: {
        ...entry,
        id: entryReference,
      },
      subjectId: linkedSubject?.id || null,
    })

    if (result.success) {
      onFeedback(
        linkedSubject
          ? `Ispit „${entry.subjectName}“ je dodat u Kalendar i povezan sa predmetom ${linkedSubject.code}.`
          : `Ispit „${entry.subjectName}“ je dodat u Kalendar.`
      )
      return
    }

    if (result.reason === 'duplicate') {
      onFeedback('Ovaj ispit je već dodat u Kalendar.')
    }

    if (result.reason === 'missing-date') {
      onFeedback(
        'Ispit nema upisan datum. Prvo unesi datum u tabeli rasporeda.'
      )
    }
  }

  if (alreadyAdded) {
    return (
      <span className="schedule-calendar-added">
        <i className="bi bi-check-circle-fill"></i>
        U kalendaru
      </span>
    )
  }

  return (
    <button
      type="button"
      className="schedule-calendar-button"
      onClick={handleAddToCalendar}
      disabled={!entry.dateIso}
      title={
        entry.dateIso
          ? 'Dodaj ispit u Kalendar'
          : 'Prvo unesi datum ispita'
      }
    >
      <i className="bi bi-calendar-plus"></i>
      Dodaj
    </button>
  )
}

export default ScheduleCalendarButton