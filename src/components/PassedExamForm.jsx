import { useState } from 'react'
import { toDateKey } from '../utils/dateUtils'

function createInitialForm() {
  return {
    subjectId: '',
    code: '',
    name: '',
    semester: '1',
    ects: '6',
    grade: '8',
    passedDate: toDateKey(new Date()),
  }
}

function PassedExamForm({ subjects, onSave, onCancel }) {
  const [formData, setFormData] = useState(createInitialForm)
  const [errors, setErrors] = useState({})
  const [formMessage, setFormMessage] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }))
  }

  function handleSubjectSelection(event) {
    const selectedSubjectId = event.target.value

    if (!selectedSubjectId) {
      setFormData((previousData) => ({
        ...previousData,
        subjectId: '',
      }))

      return
    }

    const selectedSubject = subjects.find(
      (subject) => subject.id === Number(selectedSubjectId)
    )

    if (!selectedSubject) {
      return
    }

    setFormData((previousData) => ({
      ...previousData,
      subjectId: selectedSubjectId,
      code: selectedSubject.code,
      name: selectedSubject.name,
      semester: String(selectedSubject.semester),
      ects: String(selectedSubject.ects),
    }))
  }

  function validateForm() {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Unesi naziv predmeta.'
    }

    const grade = Number(formData.grade)

    if (!Number.isInteger(grade) || grade < 6 || grade > 10) {
      newErrors.grade = 'Ocena mora biti ceo broj od 6 do 10.'
    }

    const ects = Number(formData.ects)

    if (!Number.isInteger(ects) || ects < 1 || ects > 30) {
      newErrors.ects = 'ESPB mora biti broj od 1 do 30.'
    }

    const semester = Number(formData.semester)

    if (!Number.isInteger(semester) || semester < 1 || semester > 12) {
      newErrors.semester = 'Semestar mora biti broj od 1 do 12.'
    }

    if (!formData.passedDate) {
      newErrors.passedDate = 'Izaberi datum polaganja.'
    }

    return newErrors
  }

  function handleSubmit(event) {
    event.preventDefault()

    const newErrors = validateForm()
    setErrors(newErrors)
    setFormMessage('')

    if (Object.keys(newErrors).length > 0) {
      return
    }

    const result = onSave(formData)

    if (!result.success) {
      if (result.reason === 'duplicate') {
        setFormMessage(
          'Ovaj aktivni predmet je već dodat među položene ispite.'
        )
      }

      return
    }

    setFormData(createInitialForm())
    setErrors({})
  }

  return (
    <form className="exam-form-card" onSubmit={handleSubmit}>
      <div className="subject-form-heading">
        <div>
          <p className="page-eyebrow">NOVI POLOŽENI ISPIT</p>
          <h2>Dodaj položen ispit</h2>
          <p>
            Ako predmet već postoji među aktivnim predmetima, izaberi ga sa
            liste i podaci će se automatski popuniti.
          </p>
        </div>

        <button
          type="button"
          className="subject-form-close"
          onClick={onCancel}
          aria-label="Zatvori formu"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      {formMessage && (
        <p className="form-global-error" aria-live="polite">
          <i className="bi bi-exclamation-circle-fill"></i>
          {formMessage}
        </p>
      )}

      <div className="subject-form-grid">
        <label className="form-field">
          <span>Aktivni predmet</span>

          <select
            name="subjectId"
            value={formData.subjectId}
            onChange={handleSubjectSelection}
          >
            <option value="">Ručni unos starog ispita</option>

            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.code} — {subject.name}
              </option>
            ))}
          </select>

          <small className="form-hint">
            Ovo je opciono. Koristi ga za predmete koji već postoje u planeru.
          </small>
        </label>

        <label className="form-field">
          <span>Šifra predmeta</span>

          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Na primer: MAT1"
          />

          <small className="form-hint">Nije obavezno, ali je korisno za pregled.</small>
        </label>

        <label className="form-field">
          <span>Naziv predmeta *</span>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Na primer: Matematika 1"
          />

          {errors.name && <small className="form-error">{errors.name}</small>}
        </label>

        <label className="form-field">
          <span>Ocena *</span>

          <select
            name="grade"
            value={formData.grade}
            onChange={handleChange}
          >
            <option value="6">6 — dovoljan</option>
            <option value="7">7 — dobar</option>
            <option value="8">8 — vrlo dobar</option>
            <option value="9">9 — odličan</option>
            <option value="10">10 — izuzetan</option>
          </select>

          {errors.grade && <small className="form-error">{errors.grade}</small>}
        </label>

        <label className="form-field">
          <span>ESPB bodovi *</span>

          <input
            type="number"
            min="1"
            max="30"
            name="ects"
            value={formData.ects}
            onChange={handleChange}
          />

          {errors.ects && <small className="form-error">{errors.ects}</small>}
        </label>

        <label className="form-field">
          <span>Semestar *</span>

          <input
            type="number"
            min="1"
            max="12"
            name="semester"
            value={formData.semester}
            onChange={handleChange}
          />

          {errors.semester && (
            <small className="form-error">{errors.semester}</small>
          )}
        </label>

        <label className="form-field">
          <span>Datum polaganja *</span>

          <input
            type="date"
            name="passedDate"
            value={formData.passedDate}
            onChange={handleChange}
          />

          {errors.passedDate && (
            <small className="form-error">{errors.passedDate}</small>
          )}
        </label>
      </div>

      <div className="subject-form-actions">
        <button type="button" className="outline-button" onClick={onCancel}>
          Otkaži
        </button>

        <button type="submit" className="green-button">
          <i className="bi bi-check2-circle"></i>
          Sačuvaj položen ispit
        </button>
      </div>
    </form>
  )
}

export default PassedExamForm