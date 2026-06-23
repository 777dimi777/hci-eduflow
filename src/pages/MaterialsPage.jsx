import { useEffect, useMemo, useState } from 'react'
import MaterialForm from '../components/MaterialForm'
import MaterialListItem from '../components/MaterialListItem'
import { useMaterials } from '../context/MaterialContext'
import { useSubjects } from '../context/SubjectContext'
import {
  formatMaterialDate,
  getMaterialType,
  materialTypeOptions,
} from '../utils/materialUtils'
import { getSubjectColorValue } from '../utils/subjectColorUtils'

function MaterialsPage() {
  const { subjects } = useSubjects()

  const {
    materials,
    addMaterial,
    updateMaterial,
    deleteMaterial,
  } = useMaterials()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedMaterialId, setSelectedMaterialId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [deletingMaterialId, setDeletingMaterialId] = useState(null)
  const [feedback, setFeedback] = useState('')

  const subjectMap = useMemo(() => {
    return new Map(subjects.map((subject) => [subject.id, subject]))
  }, [subjects])

  const filteredMaterials = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return materials
      .filter((material) => {
        const subject = subjectMap.get(material.subjectId)

        const matchesSearch =
          material.title.toLowerCase().includes(normalizedSearch) ||
          material.description.toLowerCase().includes(normalizedSearch) ||
          material.tags.some((tag) =>
            tag.toLowerCase().includes(normalizedSearch)
          ) ||
          subject?.name.toLowerCase().includes(normalizedSearch) ||
          subject?.code.toLowerCase().includes(normalizedSearch)

        const matchesSubject =
          selectedSubjectId === 'all' ||
          material.subjectId === Number(selectedSubjectId)

        const matchesType =
          selectedType === 'all' || material.type === selectedType

        return matchesSearch && matchesSubject && matchesType
      })
      .sort((firstMaterial, secondMaterial) =>
        secondMaterial.createdAt.localeCompare(firstMaterial.createdAt)
      )
  }, [
    materials,
    searchTerm,
    selectedSubjectId,
    selectedType,
    subjectMap,
  ])

  useEffect(() => {
    const selectedExists = filteredMaterials.some(
      (material) => material.id === selectedMaterialId
    )

    if (!selectedExists) {
      setSelectedMaterialId(
        filteredMaterials.length > 0 ? filteredMaterials[0].id : null
      )
    }
  }, [filteredMaterials, selectedMaterialId])

  const selectedMaterial = filteredMaterials.find(
    (material) => material.id === selectedMaterialId
  )

  function closeForm() {
    setShowForm(false)
    setEditingMaterial(null)
  }

  function handleOpenAddForm() {
    setEditingMaterial(null)
    setShowForm(true)
    setFeedback('')
  }

  function handleOpenEditForm() {
    if (!selectedMaterial) {
      return
    }

    setEditingMaterial(selectedMaterial)
    setShowForm(true)
    setFeedback('')
  }

  function handleSaveMaterial(materialData) {
    if (editingMaterial) {
      updateMaterial(editingMaterial.id, materialData)

      setFeedback(`Materijal „${materialData.title}“ je uspešno izmenjen.`)
    } else {
      const newMaterial = addMaterial(materialData)

      setSelectedMaterialId(newMaterial.id)
      setFeedback(`Materijal „${materialData.title}“ je dodat.`)
    }

    closeForm()
  }

  function handleDeleteMaterial() {
    if (!selectedMaterial) {
      return
    }

    const confirmed = window.confirm(
      `Da li sigurno želiš da obrišeš materijal "${selectedMaterial.title}"?`
    )

    if (!confirmed) {
      return
    }

    const materialName = selectedMaterial.title

    setDeletingMaterialId(selectedMaterial.id)

    window.setTimeout(() => {
      deleteMaterial(selectedMaterial.id)
      setDeletingMaterialId(null)
      setFeedback(`Materijal „${materialName}“ je obrisan.`)
    }, 230)
  }

  function getSubjectColor(material) {
    const subject = subjectMap.get(material.subjectId)

    return subject ? getSubjectColorValue(subject.color) : '#94a3b8'
  }

  return (
    <section className="materials-page">
      <div className="dashboard-heading">
        <div>
          <p className="page-eyebrow">BIBLIOTEKA UČENJA</p>
          <h1>Materijali i beleške</h1>
          <p className="page-description">
            Organizuj PDF reference, linkove, videe, prezentacije i svoje
            beleške po predmetima.
          </p>
        </div>

        <button
          type="button"
          className="green-button"
          onClick={showForm ? closeForm : handleOpenAddForm}
        >
          <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'}`}></i>
          {showForm ? 'Zatvori formu' : 'Dodaj materijal'}
        </button>
      </div>

      {feedback && (
        <p className="materials-feedback" aria-live="polite">
          <i className="bi bi-check-circle-fill"></i>
          {feedback}
        </p>
      )}

      {showForm && (
        <div className="material-form-wrapper">
          <MaterialForm
            subjects={subjects}
            materialToEdit={editingMaterial}
            onSave={handleSaveMaterial}
            onCancel={closeForm}
          />
        </div>
      )}

      <div className="materials-workspace">
        <section className="materials-library-card">
          <div className="materials-library-heading">
            <div>
              <p>MATERIJALI</p>
              <h2>Moja biblioteka</h2>
            </div>

            <span>{filteredMaterials.length}</span>
          </div>

          <div className="materials-toolbar">
            <div className="materials-search-box">
              <i className="bi bi-search"></i>

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Pretraži materijale..."
                aria-label="Pretraga materijala"
              />
            </div>

            <div className="materials-filter-row">
              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
              >
                <option value="all">Svi predmeti</option>

                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code}
                  </option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value)}
              >
                <option value="all">Svi tipovi</option>

                {materialTypeOptions.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredMaterials.length > 0 ? (
            <div className="material-list">
              {filteredMaterials.map((material) => (
                <MaterialListItem
                  key={material.id}
                  material={material}
                  subject={subjectMap.get(material.subjectId)}
                  isSelected={selectedMaterialId === material.id}
                  isDeleting={deletingMaterialId === material.id}
                  onSelect={setSelectedMaterialId}
                />
              ))}
            </div>
          ) : (
            <div className="materials-empty-state">
              <i className="bi bi-folder-plus"></i>
              <h3>Nema pronađenih materijala</h3>
              <p>Promeni filtere ili dodaj prvi materijal u biblioteku.</p>
            </div>
          )}
        </section>

        <aside className="material-detail-card">
          {selectedMaterial ? (
            <>
              <div
                className="material-detail-hero"
                style={{
                  '--subject-color': getSubjectColor(selectedMaterial),
                }}
              >
                <div className="material-detail-icon">
                  <i
                    className={`bi ${
                      getMaterialType(selectedMaterial.type).icon
                    }`}
                  ></i>
                </div>

                <div>
                  <span>
                    {getMaterialType(selectedMaterial.type).label}
                  </span>

                  <h2>{selectedMaterial.title}</h2>
                </div>
              </div>

              <div className="material-detail-content">
                <div
                  className="material-detail-subject"
                  style={{
                    '--subject-color': getSubjectColor(selectedMaterial),
                  }}
                >
                  <span className="material-detail-subject-dot"></span>

                  <div>
                    <strong>
                      {subjectMap.get(selectedMaterial.subjectId)
                        ? `${subjectMap.get(selectedMaterial.subjectId).code} — ${
                            subjectMap.get(selectedMaterial.subjectId).name
                          }`
                        : 'Obrisan predmet'}
                    </strong>

                    <span>
                      Dodat: {formatMaterialDate(selectedMaterial.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="material-detail-description">
                  <p className="page-eyebrow">OPIS I BELEŠKE</p>

                  {selectedMaterial.description ? (
                    <p>{selectedMaterial.description}</p>
                  ) : (
                    <p className="material-detail-empty-text">
                      Za ovaj materijal još nema dodatne beleške.
                    </p>
                  )}
                </div>

                {selectedMaterial.tags.length > 0 && (
                  <div className="material-detail-tags">
                    <p className="page-eyebrow">OZNAKE</p>

                    <div>
                      {selectedMaterial.tags.map((tag) => (
                        <span key={tag}>#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="material-detail-actions">
                  {selectedMaterial.url && (
                    <a
                      href={selectedMaterial.url}
                      target="_blank"
                      rel="noreferrer"
                      className="green-button"
                    >
                      <i className="bi bi-box-arrow-up-right"></i>
                      Otvori materijal
                    </a>
                  )}

                  <button
                    type="button"
                    className="outline-button"
                    onClick={handleOpenEditForm}
                  >
                    <i className="bi bi-pencil-square"></i>
                    Izmeni
                  </button>

                  <button
                    type="button"
                    className="material-delete-button"
                    onClick={handleDeleteMaterial}
                  >
                    <i className="bi bi-trash3"></i>
                    Obriši
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="material-detail-empty">
              <div>
                <i className="bi bi-journal-bookmark"></i>
              </div>

              <h2>Izaberi materijal</h2>

              <p>
                Klikni na stavku iz biblioteke da ovde vidiš sve detalje,
                beleške i linkove.
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

export default MaterialsPage