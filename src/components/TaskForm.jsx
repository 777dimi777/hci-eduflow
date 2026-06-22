import { useState } from 'react'

function TaskForm({ subjects, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    subjectId: subjects.length > 0 ? String(subjects[0].id) : '',
    title: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo',
    notes: '',
  })

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

    if (!formData.subjectId) {
      newErrors.subjectId = 'Izaberi predmet.'
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Unesi naziv obaveze.'
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Izaberi rok za obavezu.'
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
      subjectId: Number(formData.subjectId),
      title: formData.title.trim(),
      dueDate: formData.dueDate,
      priority: formData.priority,
      status: formData.status,
      notes: formData.notes.trim(),
    })
  }

  return (
    <form className="task-form-card" onSubmit={handleSubmit}>
      <div className="subject-form-heading">
        <div>
          <p className="page-eyebrow">NOVA OBAVEZA</p>
          <h2>Dodaj obavezu u planer</h2>
          <p>
            Rok, prioritet i status omogućavaju jasniju organizaciju učenja.
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
          <span>Naziv obaveze *</span>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Na primer: Priprema za kolokvijum"
          />

          {errors.title && <small className="form-error">{errors.title}</small>}
        </label>

        <label className="form-field">
          <span>Rok *</span>

          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
          />

          {errors.dueDate && (
            <small className="form-error">{errors.dueDate}</small>
          )}
        </label>

        <label className="form-field">
          <span>Prioritet</span>

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="high">Visok</option>
            <option value="medium">Srednji</option>
            <option value="low">Nizak</option>
          </select>

          <small className="form-hint">
            Podrazumevana vrednost je srednji prioritet.
          </small>
        </label>

        <label className="form-field">
          <span>Status</span>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="todo">Nije početo</option>
            <option value="in-progress">U toku</option>
            <option value="done">Završeno</option>
          </select>
        </label>

        <label className="form-field task-notes-field">
          <span>Napomena</span>

          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Dodatna napomena, materijal koji treba ponoviti..."
            rows="3"
          ></textarea>

          <small className="form-hint">Ovo polje nije obavezno.</small>
        </label>
      </div>

      <div className="subject-form-actions">
        <button type="button" className="outline-button" onClick={onCancel}>
          Otkaži
        </button>

        <button type="submit" className="green-button">
          <i className="bi bi-plus-lg"></i>
          Sačuvaj obavezu
        </button>
      </div>
    </form>
  )
}

export default TaskForm