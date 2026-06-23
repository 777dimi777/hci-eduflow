import { useEffect, useState } from 'react'
import {
  getSubjectColorValue,
  subjectColorOptions,
} from '../utils/subjectColorUtils'

function createFormData(subjectToEdit, suggestedColor) {
  if (subjectToEdit) {
    return {
      code: subjectToEdit.code || '',
      name: subjectToEdit.name || '',
      professor: subjectToEdit.professor || '',
      semester: String(subjectToEdit.semester || 1),
      ects: String(subjectToEdit.ects || 6),
      progress: String(subjectToEdit.progress ?? 0),
      color: subjectToEdit.color || 'emerald',
    }
  }

  return {
    code: '',
    name: '',
    professor: '',
    semester: '6',
    ects: '6',
    progress: '0',
    color: suggestedColor || 'emerald',
  }
}

function SubjectForm({
  onSave,
  onCancel,
  subjectToEdit = null,
  suggestedColor = 'emerald',
}) {
  const isEditMode = Boolean(subjectToEdit)

  const [formData, setFormData] = useState(() =>
    createFormData(subjectToEdit, suggestedColor)
  )

  const [errors, setErrors] = useState({})

  useEffect(() => {
    setFormData(createFormData(subjectToEdit, suggestedColor))
    setErrors({})
  }, [subjectToEdit, suggestedColor])

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }))
  }

  function validateForm() {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Unesi naziv predmeta.'
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Unesi šifru predmeta.'
    }

    const semester = Number(formData.semester)
    const ects = Number(formData.ects)
    const progress = Number(formData.progress)

    if (!Number.isInteger(semester) || semester < 1 || semester > 12) {
      newErrors.semester = 'Semestar mora biti broj od 1 do 12.'
    }

    if (!Number.isInteger(ects) || ects < 1 || ects > 30) {
      newErrors.ects = 'ESPB mora biti broj od 1 do 30.'
    }

    if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
      newErrors.progress = 'Napredak mora biti broj od 0 do 100.'
    }

    return newErrors
  }

  function handleSubmit(event) {
    event.preventDefault()

    const newErrors = validateForm()
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    onSave({
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      professor: formData.professor.trim() || 'Nastavnik nije unet',
      semester: Number(formData.semester),
      ects: Number(formData.ects),
      progress: Number(formData.progress),
      color: formData.color,
      tasks: subjectToEdit?.tasks || 0,
      nextDeadline: subjectToEdit?.nextDeadline || 'Rok nije unet',
    })
  }

  return (
    <form className="subject-form-card" onSubmit={handleSubmit}>
      <div className="subject-form-heading">
        <div>
          <p className="page-eyebrow">
            {isEditMode ? 'IZMENA PREDMETA' : 'NOVI PREDMET'}
          </p>

          <h2>
            {isEditMode
              ? 'Izmeni podatke o predmetu'
              : 'Dodaj predmet u planer'}
          </h2>

          <p>
            Boja predmeta se prikazuje na karticama, u kalendaru, dnevnom fokusu
            i prikazu akademskog uspeha.
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

      <div className="subject-form-grid">
        <label className="form-field">
          <span>Šifra predmeta *</span>

          <input
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Na primer: HCI"
          />

          {errors.code && <small className="form-error">{errors.code}</small>}
        </label>

        <label className="form-field">
          <span>Naziv predmeta *</span>

          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Na primer: Interakcija čovek–računar"
          />

          {errors.name && <small className="form-error">{errors.name}</small>}
        </label>

        <label className="form-field">
          <span>Nastavnik</span>

          <input
            name="professor"
            value={formData.professor}
            onChange={handleChange}
            placeholder="Na primer: Prof. dr Ime Prezime"
          />

          <small className="form-hint">Ovo polje nije obavezno.</small>
        </label>

        <label className="form-field">
          <span>Semestar *</span>

          <input
            name="semester"
            type="number"
            min="1"
            max="12"
            value={formData.semester}
            onChange={handleChange}
          />

          {errors.semester && (
            <small className="form-error">{errors.semester}</small>
          )}
        </label>

        <label className="form-field">
          <span>ESPB bodovi *</span>

          <input
            name="ects"
            type="number"
            min="1"
            max="30"
            value={formData.ects}
            onChange={handleChange}
          />

          {errors.ects && <small className="form-error">{errors.ects}</small>}
        </label>

        <label className="form-field">
          <span>Napredak u učenju (%) *</span>

          <input
            name="progress"
            type="number"
            min="0"
            max="100"
            value={formData.progress}
            onChange={handleChange}
          />

          {errors.progress && (
            <small className="form-error">{errors.progress}</small>
          )}
        </label>

        <div className="form-field subject-color-field">
          <span>Boja predmeta</span>

          <div
            className="subject-color-picker"
            role="group"
            aria-label="Izbor boje predmeta"
          >
            {subjectColorOptions.map((option) => {
              const isSelected = formData.color === option.value

              return (
                <button
                  type="button"
                  key={option.value}
                  className={[
                    'subject-color-option',
                    isSelected ? 'subject-color-option-active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() =>
                    setFormData((previousData) => ({
                      ...previousData,
                      color: option.value,
                    }))
                  }
                  style={{
                    '--picker-color': getSubjectColorValue(option.value),
                  }}
                  aria-pressed={isSelected}
                  title={option.label}
                >
                  <span className="subject-color-option-dot"></span>
                  {option.label}
                </button>
              )
            })}
          </div>

          <small className="form-hint">
            Koristi različitu boju za svaki predmet radi lakšeg razlikovanja.
          </small>
        </div>
      </div>

      <div className="subject-form-actions">
        <button type="button" className="outline-button" onClick={onCancel}>
          Otkaži
        </button>

        <button type="submit" className="green-button">
          <i className={`bi ${isEditMode ? 'bi-check-lg' : 'bi-plus-lg'}`}></i>
          {isEditMode ? 'Sačuvaj izmene' : 'Sačuvaj predmet'}
        </button>
      </div>
    </form>
  )
}

export default SubjectForm