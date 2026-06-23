import { useMemo, useState } from 'react'
import SubjectCard from '../components/SubjectCard'
import SubjectForm from '../components/SubjectForm'
import { useSubjects } from '../context/SubjectContext'
import { subjectColorOptions } from '../utils/subjectColorUtils'

function SubjectsPage() {
  const { subjects, addSubject, updateSubject, deleteSubject } = useSubjects()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [feedback, setFeedback] = useState('')

  const semesters = useMemo(() => {
    return [...new Set(subjects.map((subject) => subject.semester))].sort(
      (firstSemester, secondSemester) => firstSemester - secondSemester
    )
  }, [subjects])

  const suggestedColor = useMemo(() => {
    const usedColors = new Set(subjects.map((subject) => subject.color))

    const unusedColor = subjectColorOptions.find(
      (option) => !usedColors.has(option.value)
    )

    return unusedColor ? unusedColor.value : 'emerald'
  }, [subjects])

  const filteredSubjects = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return subjects.filter((subject) => {
      const matchesSearch =
        subject.name.toLowerCase().includes(normalizedSearch) ||
        subject.code.toLowerCase().includes(normalizedSearch) ||
        subject.professor.toLowerCase().includes(normalizedSearch)

      const matchesSemester =
        selectedSemester === 'all' ||
        subject.semester === Number(selectedSemester)

      return matchesSearch && matchesSemester
    })
  }, [subjects, searchTerm, selectedSemester])

  function closeForm() {
    setShowForm(false)
    setEditingSubject(null)
  }

  function handleOpenAddForm() {
    setEditingSubject(null)
    setShowForm(true)
    setFeedback('')
  }

  function handleOpenEditForm(subject) {
    setEditingSubject(subject)
    setShowForm(true)
    setFeedback('')
  }

  function handleSaveSubject(subjectData) {
    if (editingSubject) {
      updateSubject(editingSubject.id, subjectData)

      setFeedback(`Predmet „${subjectData.name}“ je uspešno izmenjen.`)
    } else {
      addSubject(subjectData)

      setFeedback(`Predmet „${subjectData.name}“ je dodat u planer.`)
    }

    closeForm()
  }

  function handleDeleteSubject(subject) {
    const isConfirmed = window.confirm(
      `Da li sigurno želiš da obrišeš predmet "${subject.name}"?`
    )

    if (isConfirmed) {
      deleteSubject(subject.id)
      setFeedback(`Predmet „${subject.name}“ je obrisan.`)
    }
  }

  return (
    <section className="subjects-page">
      <div className="dashboard-heading">
        <div>
          <p className="page-eyebrow">ORGANIZACIJA UČENJA</p>
          <h1>Predmeti</h1>
          <p className="page-description">
            Dodaj svoje predmete, menjaj njihov napredak i koristi različite boje
            za lakše snalaženje.
          </p>
        </div>

        <button
          type="button"
          className="green-button"
          onClick={showForm ? closeForm : handleOpenAddForm}
        >
          <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'}`}></i>
          {showForm ? 'Zatvori formu' : 'Dodaj predmet'}
        </button>
      </div>

      {feedback && (
        <p className="subjects-page-feedback" aria-live="polite">
          <i className="bi bi-check-circle-fill"></i>
          {feedback}
        </p>
      )}

      {showForm && (
        <div className="subject-form-wrapper">
          <SubjectForm
            subjectToEdit={editingSubject}
            suggestedColor={suggestedColor}
            onSave={handleSaveSubject}
            onCancel={closeForm}
          />
        </div>
      )}

      <div className="subjects-toolbar">
        <div className="subjects-search-box">
          <i className="bi bi-search"></i>

          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Pretraži naziv, šifru ili nastavnika..."
            aria-label="Pretraga predmeta"
          />
        </div>

        <select
          className="subjects-filter-select"
          value={selectedSemester}
          onChange={(event) => setSelectedSemester(event.target.value)}
          aria-label="Filtriranje po semestru"
        >
          <option value="all">Svi semestri</option>

          {semesters.map((semester) => (
            <option key={semester} value={semester}>
              {semester}. semestar
            </option>
          ))}
        </select>
      </div>

      <p className="subjects-summary">
        Prikazano: <strong>{filteredSubjects.length}</strong> od{' '}
        <strong>{subjects.length}</strong> predmeta
      </p>

      {filteredSubjects.length > 0 ? (
        <div className="subject-grid">
          {filteredSubjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onEdit={handleOpenEditForm}
              onDelete={handleDeleteSubject}
            />
          ))}
        </div>
      ) : (
        <div className="subjects-empty-state">
          <i className="bi bi-journal-x"></i>
          <h2>Nema pronađenih predmeta</h2>
          <p>Promeni pretragu, filter ili dodaj novi predmet u planer.</p>
        </div>
      )}
    </section>
  )
}

export default SubjectsPage