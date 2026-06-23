import { useEffect, useState } from 'react'
import {
  materialTypeOptions,
  normalizeExternalUrl,
  parseTags,
} from '../utils/materialUtils'

function createFormData(materialToEdit, subjects) {
  if (materialToEdit) {
    return {
      subjectId: String(materialToEdit.subjectId),
      title: materialToEdit.title || '',
      type: materialToEdit.type || 'note',
      description: materialToEdit.description || '',
      url: materialToEdit.url || '',
      tagsText: Array.isArray(materialToEdit.tags)
        ? materialToEdit.tags.join(', ')
        : '',
    }
  }

  return {
    subjectId: subjects.length > 0 ? String(subjects[0].id) : '',
    title: '',
    type: 'note',
    description: '',
    url: '',
    tagsText: '',
  }
}

function MaterialForm({
  subjects,
  materialToEdit,
  onSave,
  onCancel,
}) {
  const isEditMode = Boolean(materialToEdit)

  const [formData, setFormData] = useState(() =>
    createFormData(materialToEdit, subjects)
  )

  const [errors, setErrors] = useState({})

  useEffect(() => {
    setFormData(createFormData(materialToEdit, subjects))
    setErrors({})
  }, [materialToEdit, subjects])

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }))
  }

  function validateForm() {
    const newErrors = {}

    if (!formData.subjectId) {
      newErrors.subjectId = 'Izaberi predmet.'
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Unesi naziv materijala.'
    }

    const normalizedUrl = normalizeExternalUrl(formData.url)

    if (formData.url.trim() && !normalizedUrl) {
      newErrors.url = 'Unesi ispravan link.'
    }

    return {
      errors: newErrors,
      normalizedUrl,
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    const { errors: newErrors, normalizedUrl } = validateForm()

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    onSave({
      subjectId: formData.subjectId,
      title: formData.title,
      type: formData.type,
      description: formData.description,
      url: normalizedUrl,
      tags: parseTags(formData.tagsText),
    })
  }

  return (
    <form className="subject-form-card material-form-card" onSubmit={handleSubmit}>
      <div className="subject-form-heading">
        <div>
          <p className="page-eyebrow">
            {isEditMode ? 'IZMENA MATERIJALA' : 'NOVI MATERIJAL'}
          </p>

          <h2>
            {isEditMode
              ? 'Izmeni materijal'
              : 'Dodaj materijal za učenje'}
          </h2>

          <p>
            Sačuvaj belešku, link, PDF referencu, video ili prezentaciju uz
            konkretan predmet.
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

      {subjects.length === 0 && (
        <p className="form-global-error">
          <i className="bi bi-exclamation-circle-fill"></i>
          Prvo dodaj najmanje jedan predmet.
        </p>
      )}

      <div className="subject-form-grid">
        <label className="form-field">
          <span>Predmet *</span>

          <select
            name="subjectId"
            value={formData.subjectId}
            onChange={handleChange}
          >
            <option value="">Izaberi predmet</option>

            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.code} — {subject.name}
              </option>
            ))}
          </select>

          {errors.subjectId && (
            <small className="form-error">{errors.subjectId}</small>
          )}
        </label>

        <label className="form-field">
          <span>Tip materijala</span>

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            {materialTypeOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <small className="form-hint">
            Podrazumevano se bira beleška.
          </small>
        </label>

        <label className="form-field">
          <span>Naziv materijala *</span>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Na primer: HCI obrasci — kratke beleške"
          />

          {errors.title && <small className="form-error">{errors.title}</small>}
        </label>

        <label className="form-field">
          <span>Link ka materijalu</span>

          <input
            type="text"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="drive.google.com/... ili youtube.com/..."
          />

          {errors.url ? (
            <small className="form-error">{errors.url}</small>
          ) : (
            <small className="form-hint">
              Možeš uneti link i bez https://
            </small>
          )}
        </label>

        <label className="form-field material-description-field">
          <span>Opis ili beleška</span>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Šta se nalazi u materijalu, šta treba naučiti, važne formule..."
            rows="5"
          ></textarea>

          <small className="form-hint">
            Ovaj deo je dobar za tvoje lične beleške.
          </small>
        </label>

        <label className="form-field material-tags-field">
          <span>Oznake</span>

          <input
            type="text"
            name="tagsText"
            value={formData.tagsText}
            onChange={handleChange}
            placeholder="teorija, kolokvijum, važno"
          />

          <small className="form-hint">
            Odvoji oznake zarezom.
          </small>
        </label>
      </div>

      <div className="subject-form-actions">
        <button type="button" className="outline-button" onClick={onCancel}>
          Otkaži
        </button>

        <button
          type="submit"
          className="green-button"
          disabled={subjects.length === 0}
        >
          <i className={`bi ${isEditMode ? 'bi-check-lg' : 'bi-plus-lg'}`}></i>
          {isEditMode ? 'Sačuvaj izmene' : 'Dodaj materijal'}
        </button>
      </div>
    </form>
  )
}

export default MaterialForm