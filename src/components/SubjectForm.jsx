import { useState } from 'react'

const emptyForm = {
  code: '',
  name: '',
  professor: '',
  semester: '6',
  ects: '6',
  color: 'emerald',
}

function SubjectForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState(emptyForm)
  const [errors, setErrors] = useState({})

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

    if (!Number.isInteger(semester) || semester < 1 || semester > 12) {
      newErrors.semester = 'Semestar mora biti broj od 1 do 12.'
    }

    if (!Number.isInteger(ects) || ects < 1 || ects > 30) {
      newErrors.ects = 'ESPB mora biti broj od 1 do 30.'
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
      professor: formData.professor.trim() || 'Nije unet nastavnik',
      semester: Number(formData.semester),
      ects: Number(formData.ects),
      color: formData.color,
      progress: 0,
      tasks: 0,
      nextDeadline: 'Rok nije unet',
    })

    setFormData(emptyForm)
    setErrors({})
  }

  return (
    <form className="subject-form-card" onSubmit={handleSubmit}>
      <div className="subject-form-heading">
        <div>
          <p className="page-eyebrow">NOVI PREDMET</p>
          <h2>Dodaj predmet u planer</h2>
          <p>
            Polja označena zvezdicom su obavezna. Predmet se odmah čuva lokalno.
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
          <span>Boja predmeta</span>
          <select name="color" value={formData.color} onChange={handleChange}>
            <option value="emerald">Smaragdno zelena</option>
            <option value="lime">Limeta zelena</option>
            <option value="teal">Tirkizno zelena</option>
            <option value="mint">Svetlo zelena</option>
          </select>
          <small className="form-hint">
            Boja pomaže bržem razlikovanju predmeta.
          </small>
        </label>
      </div>

      <div className="subject-form-actions">
        <button type="button" className="outline-button" onClick={onCancel}>
          Otkaži
        </button>

        <button type="submit" className="green-button">
          <i className="bi bi-plus-lg"></i>
          Sačuvaj predmet
        </button>
      </div>
    </form>
  )
}

export default SubjectForm