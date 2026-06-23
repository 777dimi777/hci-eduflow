import { useEffect, useMemo, useState } from 'react'
import { useExamSchedules } from '../context/ExamScheduleContext'
import {
  createEmptyExamEntry,
  extractPdfRows,
  parseExamScheduleRows,
} from '../utils/examSchedulePdfUtils'

const defaultProfile = {
  level: 'OAS',
  accreditation: '2019',
  semester: '6',
  module: 'RII',
  codePrefix: '3OER6',
}

const accentOptions = [
  '#4ade80',
  '#2dd4bf',
  '#38bdf8',
  '#a78bfa',
  '#fbbf24',
  '#fb7185',
]

function getProfileLabel(profile) {
  return [
    profile.level,
    profile.accreditation,
    profile.module,
    profile.semester ? `${profile.semester}. semestar` : '',
  ]
    .filter(Boolean)
    .join(' · ')
}

function isValidEntry(entry) {
  return (
    String(entry.courseCode || '').trim() &&
    String(entry.subjectName || '').trim()
  )
}

function PdfImportPage() {
  const {
    schedules,
    addSchedule,
    updateScheduleTitle,
    updateScheduleEntry,
    addScheduleEntry,
    deleteScheduleEntry,
    deleteSchedule,
  } = useExamSchedules()

  const [selectedFile, setSelectedFile] = useState(null)
  const [scheduleTitle, setScheduleTitle] = useState('')
  const [profile, setProfile] = useState(defaultProfile)
  const [accentColor, setAccentColor] = useState(accentOptions[0])

  const [candidateEntries, setCandidateEntries] = useState([])
  const [extractedPdf, setExtractedPdf] = useState(null)

  const [selectedScheduleId, setSelectedScheduleId] = useState(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [progress, setProgress] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const selectedStillExists = schedules.some(
      (schedule) => schedule.id === selectedScheduleId
    )

    if (!selectedStillExists) {
      setSelectedScheduleId(schedules.length > 0 ? schedules[0].id : null)
    }
  }, [schedules, selectedScheduleId])

  const selectedSchedule = schedules.find(
    (schedule) => schedule.id === selectedScheduleId
  )

  const selectedCandidateCount = candidateEntries.filter(
    (entry) => entry.selected && isValidEntry(entry)
  ).length

  const allCandidatesSelected =
    candidateEntries.length > 0 &&
    candidateEntries.every((entry) => entry.selected)

  const sortedScheduleEntries = useMemo(() => {
    if (!selectedSchedule) {
      return []
    }

    return [...selectedSchedule.entries].sort((firstEntry, secondEntry) => {
      const firstValue = `${firstEntry.dateIso || ''} ${firstEntry.time || ''}`
      const secondValue = `${secondEntry.dateIso || ''} ${secondEntry.time || ''}`

      return firstValue.localeCompare(secondValue)
    })
  }, [selectedSchedule])

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null

    setSelectedFile(file)
    setCandidateEntries([])
    setExtractedPdf(null)
    setError('')
    setFeedback('')

    if (file) {
      setScheduleTitle(file.name.replace(/\.pdf$/i, ''))
    }
  }

  function handleProfileChange(event) {
    const { name, value } = event.target

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }))
  }

  function decorateEntries(entries) {
    return entries.map((entry, index) => ({
      ...entry,
      id: `candidate-${Date.now()}-${index}`,
      selected: true,
    }))
  }

  async function handleExtractSchedule() {
    if (!selectedFile) {
      setError('Prvo izaberi PDF fajl.')
      return
    }

    setIsExtracting(true)
    setProgress(null)
    setError('')
    setFeedback('')
    setCandidateEntries([])

    try {
      const result = await extractPdfRows(selectedFile, setProgress)

      const parsedEntries = parseExamScheduleRows(result.rows, profile)

      setExtractedPdf(result)
      setCandidateEntries(decorateEntries(parsedEntries))

      if (parsedEntries.length === 0) {
        setFeedback(
          'PDF je pročitan, ali nije pronađen nijedan red za izabrani profil. Promeni modul, semestar ili prefiks šifre i pokušaj ponovo.'
        )
      } else {
        setFeedback(
          `PDF je pročitan. Pronađeno je ${parsedEntries.length} ispita za profil: ${getProfileLabel(
            profile
          )}.`
        )
      }
    } catch (caughtError) {
      setError(
        caughtError.message ||
          'Došlo je do greške prilikom čitanja PDF dokumenta.'
      )
    } finally {
      setIsExtracting(false)
      setProgress(null)
    }
  }

  function handleCandidateChange(entryId, field, value) {
    setCandidateEntries((previousEntries) =>
      previousEntries.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              [field]: value,
            }
          : entry
      )
    )
  }

  function handleToggleAllCandidates() {
    setCandidateEntries((previousEntries) =>
      previousEntries.map((entry) => ({
        ...entry,
        selected: !allCandidatesSelected,
      }))
    )
  }

  function handleAddManualCandidate() {
    setCandidateEntries((previousEntries) => [
      ...previousEntries,
      {
        ...createEmptyExamEntry(profile),
        id: `candidate-${Date.now()}-${previousEntries.length}`,
        selected: true,
      },
    ])
  }

  function handleRemoveCandidate(entryId) {
    setCandidateEntries((previousEntries) =>
      previousEntries.filter((entry) => entry.id !== entryId)
    )
  }

  function handleSaveSchedule() {
    if (!scheduleTitle.trim()) {
      setError('Unesi naslov rasporeda, na primer: Junski rok 2026.')
      return
    }

    const selectedEntries = candidateEntries
      .filter((entry) => entry.selected && isValidEntry(entry))
      .map(({ selected, ...entry }) => entry)

    if (selectedEntries.length === 0) {
      setError('Izaberi ili ručno dodaj najmanje jedan validan ispit.')
      return
    }

    const newSchedule = addSchedule({
      title: scheduleTitle.trim(),
      sourceFileName: selectedFile?.name || 'Ručni unos',
      profile,
      accentColor,
      entries: selectedEntries,
    })

    setSelectedScheduleId(newSchedule.id)
    setFeedback(
      `Raspored „${scheduleTitle.trim()}“ je sačuvan sa ${selectedEntries.length} stavki.`
    )
    setError('')
    setCandidateEntries([])
    setExtractedPdf(null)
    setSelectedFile(null)
    setScheduleTitle('')
  }

  function handleDeleteSchedule(schedule) {
    const confirmed = window.confirm(
      `Da li sigurno želiš da obrišeš raspored „${schedule.title}“?`
    )

    if (confirmed) {
      deleteSchedule(schedule.id)
      setFeedback(`Raspored „${schedule.title}“ je obrisan.`)
    }
  }

  function handleAddSavedEntry() {
    if (!selectedSchedule) {
      return
    }

    addScheduleEntry(
      selectedSchedule.id,
      createEmptyExamEntry(selectedSchedule.profile)
    )
  }

  function handleDeleteSavedEntry(entryId) {
    if (!selectedSchedule) {
      return
    }

    deleteScheduleEntry(selectedSchedule.id, entryId)
  }

  return (
    <section className="exam-schedule-page">
      <div className="dashboard-heading">
        <div>
          <p className="page-eyebrow">RASPOREDI ISPITA</p>
          <h1>Uvoz rasporeda iz PDF-a</h1>
          <p className="page-description">
            Svaki PDF dobija svoju tabelu. Unesi naslov, proveri redove i sačuvaj
            poseban raspored za svaki ispitni rok.
          </p>
        </div>
      </div>

      <section className="exam-schedule-import-card">
        <div className="exam-schedule-import-heading">
          <div className="exam-schedule-import-icon">
            <i className="bi bi-file-earmark-pdf"></i>
          </div>

          <div>
            <p className="page-eyebrow">NOVI RASPORED</p>
            <h2>Učitaj PDF i izdvoji svoje ispite</h2>
            <p>
              Za PDF koji ima kolone Modul i Semestar koristi se direktan
              filter. Za PDF bez tih kolona koristi se prefiks šifre predmeta.
            </p>
          </div>
        </div>

        <div className="exam-schedule-import-grid">
          <label className="exam-schedule-file-picker">
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
            />

            <i className="bi bi-upload"></i>

            <strong>
              {selectedFile
                ? selectedFile.name
                : 'Klikni i izaberi PDF raspored'}
            </strong>

            <small>
              {selectedFile
                ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                : 'Maksimalna veličina: 15 MB'}
            </small>
          </label>

          <div className="exam-schedule-form-fields">
            <label>
              <span>Naslov tabele *</span>

              <input
                type="text"
                value={scheduleTitle}
                onChange={(event) => setScheduleTitle(event.target.value)}
                placeholder="Na primer: Junski ispitni rok 2026"
              />
            </label>

            <label>
              <span>Akcentna boja</span>

              <select
                value={accentColor}
                onChange={(event) => setAccentColor(event.target.value)}
              >
                <option value="#4ade80">Zelena</option>
                <option value="#2dd4bf">Tirkizna</option>
                <option value="#38bdf8">Plava</option>
                <option value="#a78bfa">Ljubičasta</option>
                <option value="#fbbf24">Narandžasta</option>
                <option value="#fb7185">Roze</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="exam-schedule-profile-card">
        <div>
          <p className="page-eyebrow">FILTER PROFILA</p>
          <h2>Za koga se izdvajaju ispiti?</h2>
          <p>
            Podrazumevano je podešeno za OAS 2019, RII i 6. semestar.
          </p>
        </div>

        <div className="exam-schedule-profile-grid">
          <label>
            <span>Nivo</span>

            <input
              type="text"
              name="level"
              value={profile.level}
              onChange={handleProfileChange}
            />
          </label>

          <label>
            <span>Akreditacija</span>

            <input
              type="text"
              name="accreditation"
              value={profile.accreditation}
              onChange={handleProfileChange}
            />
          </label>

          <label>
            <span>Semestar</span>

            <input
              type="number"
              min="1"
              max="12"
              name="semester"
              value={profile.semester}
              onChange={handleProfileChange}
            />
          </label>

          <label>
            <span>Modul</span>

            <input
              type="text"
              name="module"
              value={profile.module}
              onChange={handleProfileChange}
            />
          </label>

          <label>
            <span>Prefiks šifre</span>

            <input
              type="text"
              name="codePrefix"
              value={profile.codePrefix}
              onChange={handleProfileChange}
              placeholder="Na primer: 3OER6"
            />
          </label>

          <button
            type="button"
            className="green-button"
            onClick={handleExtractSchedule}
            disabled={!selectedFile || isExtracting}
          >
            <i
              className={`bi ${
                isExtracting ? 'bi-arrow-repeat' : 'bi-search'
              }`}
            ></i>
            {isExtracting ? 'Čitanje...' : 'Izdvoji ispite'}
          </button>
        </div>
      </section>

      {progress && (
        <div className="exam-schedule-progress">
          <div>
            <span>Čitanje PDF-a</span>
            <strong>
              Strana {progress.currentPage} od {progress.totalPages}
            </strong>
          </div>

          <div>
            <span
              style={{
                width: `${
                  (progress.currentPage / progress.totalPages) * 100
                }%`,
              }}
            ></span>
          </div>
        </div>
      )}

      {error && (
        <p className="exam-schedule-message exam-schedule-message-error">
          <i className="bi bi-exclamation-circle-fill"></i>
          {error}
        </p>
      )}

      {feedback && (
        <p className="exam-schedule-message exam-schedule-message-success">
          <i className="bi bi-check-circle-fill"></i>
          {feedback}
        </p>
      )}

      {(extractedPdf || candidateEntries.length > 0) && (
        <section className="exam-schedule-preview-card">
          <div className="exam-schedule-preview-heading">
            <div>
              <p className="page-eyebrow">PROVERA PRE UVOZA</p>
              <h2>Pronađeni ispiti</h2>
              <p>
                Svaki red možeš da izmeniš, ukloniš ili dopuniš ručno pre
                čuvanja tabele.
              </p>
            </div>

            <div className="exam-schedule-preview-actions">
              <button
                type="button"
                className="outline-button"
                onClick={handleAddManualCandidate}
              >
                <i className="bi bi-plus-lg"></i>
                Dodaj red ručno
              </button>

              <button
                type="button"
                className="green-button"
                onClick={handleSaveSchedule}
                disabled={selectedCandidateCount === 0}
              >
                <i className="bi bi-save2"></i>
                Sačuvaj tabelu ({selectedCandidateCount})
              </button>
            </div>
          </div>

          {candidateEntries.length > 0 ? (
            <div className="exam-schedule-table-wrapper">
              <table className="exam-schedule-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={allCandidatesSelected}
                        onChange={handleToggleAllCandidates}
                        aria-label="Označi sve redove"
                      />
                    </th>
                    <th>Šifra</th>
                    <th>Predmet</th>
                    <th>Datum</th>
                    <th>Vreme</th>
                    <th>Trajanje</th>
                    <th>Sale</th>
                    <th>Sem.</th>
                    <th>Modul</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {candidateEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={entry.selected}
                          onChange={(event) =>
                            handleCandidateChange(
                              entry.id,
                              'selected',
                              event.target.checked
                            )
                          }
                          aria-label={`Izaberi predmet ${entry.subjectName}`}
                        />
                      </td>

                      <td>
                        <input
                          value={entry.courseCode}
                          onChange={(event) =>
                            handleCandidateChange(
                              entry.id,
                              'courseCode',
                              event.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          value={entry.subjectName}
                          onChange={(event) =>
                            handleCandidateChange(
                              entry.id,
                              'subjectName',
                              event.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="date"
                          value={entry.dateIso}
                          onChange={(event) =>
                            handleCandidateChange(
                              entry.id,
                              'dateIso',
                              event.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          value={entry.time}
                          onChange={(event) =>
                            handleCandidateChange(
                              entry.id,
                              'time',
                              event.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          value={entry.duration}
                          onChange={(event) =>
                            handleCandidateChange(
                              entry.id,
                              'duration',
                              event.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          value={entry.rooms}
                          onChange={(event) =>
                            handleCandidateChange(
                              entry.id,
                              'rooms',
                              event.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          value={entry.semester}
                          onChange={(event) =>
                            handleCandidateChange(
                              entry.id,
                              'semester',
                              event.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          value={entry.module}
                          onChange={(event) =>
                            handleCandidateChange(
                              entry.id,
                              'module',
                              event.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <button
                          type="button"
                          className="exam-schedule-remove-button"
                          onClick={() => handleRemoveCandidate(entry.id)}
                          title="Ukloni red"
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="exam-schedule-empty">
              <i className="bi bi-table"></i>
              <h3>Nema automatski pronađenih ispita</h3>
              <p>
                Promeni profil ili dodaj redove ručno. Tabela može da se napravi
                i bez automatskog izdvajanja.
              </p>

              <button
                type="button"
                className="outline-button"
                onClick={handleAddManualCandidate}
              >
                <i className="bi bi-plus-lg"></i>
                Dodaj prvi red
              </button>
            </div>
          )}
        </section>
      )}

      <section className="saved-schedules-layout">
        <aside className="saved-schedules-list-card">
          <div className="saved-schedules-list-heading">
            <div>
              <p className="page-eyebrow">SAČUVANI RASPOREDI</p>
              <h2>Moje tabele</h2>
            </div>

            <span>{schedules.length}</span>
          </div>

          {schedules.length > 0 ? (
            <div className="saved-schedule-list">
              {schedules.map((schedule) => (
                <button
                  type="button"
                  key={schedule.id}
                  className={[
                    'saved-schedule-item',
                    selectedScheduleId === schedule.id
                      ? 'saved-schedule-item-active'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{
                    '--schedule-color': schedule.accentColor,
                  }}
                  onClick={() => setSelectedScheduleId(schedule.id)}
                >
                  <span className="saved-schedule-color"></span>

                  <span>
                    <strong>{schedule.title}</strong>
                    <small>
                      {schedule.entries.length} stavki ·{' '}
                      {getProfileLabel(schedule.profile)}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="saved-schedules-empty">
              <i className="bi bi-calendar2-week"></i>
              <p>Još nema sačuvanih rasporeda ispita.</p>
            </div>
          )}
        </aside>

        <section className="saved-schedule-detail-card">
          {selectedSchedule ? (
            <>
              <div
                className="saved-schedule-detail-heading"
                style={{
                  '--schedule-color': selectedSchedule.accentColor,
                }}
              >
                <div>
                  <p className="page-eyebrow">IZABRANA TABELA</p>

                  <input
                    value={selectedSchedule.title}
                    onChange={(event) =>
                      updateScheduleTitle(
                        selectedSchedule.id,
                        event.target.value
                      )
                    }
                    aria-label="Naziv rasporeda"
                  />

                  <span>
                    Fajl: {selectedSchedule.sourceFileName} ·{' '}
                    {getProfileLabel(selectedSchedule.profile)}
                  </span>
                </div>

                <div className="saved-schedule-detail-actions">
                  <button
                    type="button"
                    className="outline-button"
                    onClick={handleAddSavedEntry}
                  >
                    <i className="bi bi-plus-lg"></i>
                    Dodaj red
                  </button>

                  <button
                    type="button"
                    className="material-delete-button"
                    onClick={() => handleDeleteSchedule(selectedSchedule)}
                  >
                    <i className="bi bi-trash3"></i>
                    Obriši tabelu
                  </button>
                </div>
              </div>

              <div className="exam-schedule-table-wrapper">
                <table className="exam-schedule-table saved-exam-schedule-table">
                  <thead>
                    <tr>
                      <th>Šifra</th>
                      <th>Predmet</th>
                      <th>Datum</th>
                      <th>Vreme</th>
                      <th>Trajanje</th>
                      <th>Sale</th>
                      <th>Sem.</th>
                      <th>Modul</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedScheduleEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td>
                          <input
                            value={entry.courseCode}
                            onChange={(event) =>
                              updateScheduleEntry(
                                selectedSchedule.id,
                                entry.id,
                                'courseCode',
                                event.target.value
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            value={entry.subjectName}
                            onChange={(event) =>
                              updateScheduleEntry(
                                selectedSchedule.id,
                                entry.id,
                                'subjectName',
                                event.target.value
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            type="date"
                            value={entry.dateIso}
                            onChange={(event) =>
                              updateScheduleEntry(
                                selectedSchedule.id,
                                entry.id,
                                'dateIso',
                                event.target.value
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            value={entry.time}
                            onChange={(event) =>
                              updateScheduleEntry(
                                selectedSchedule.id,
                                entry.id,
                                'time',
                                event.target.value
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            value={entry.duration}
                            onChange={(event) =>
                              updateScheduleEntry(
                                selectedSchedule.id,
                                entry.id,
                                'duration',
                                event.target.value
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            value={entry.rooms}
                            onChange={(event) =>
                              updateScheduleEntry(
                                selectedSchedule.id,
                                entry.id,
                                'rooms',
                                event.target.value
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            value={entry.semester}
                            onChange={(event) =>
                              updateScheduleEntry(
                                selectedSchedule.id,
                                entry.id,
                                'semester',
                                event.target.value
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            value={entry.module}
                            onChange={(event) =>
                              updateScheduleEntry(
                                selectedSchedule.id,
                                entry.id,
                                'module',
                                event.target.value
                              )
                            }
                          />
                        </td>

                        <td>
                          <button
                            type="button"
                            className="exam-schedule-remove-button"
                            onClick={() =>
                              handleDeleteSavedEntry(entry.id)
                            }
                            title="Obriši red"
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="saved-schedule-detail-empty">
              <i className="bi bi-calendar-event"></i>
              <h2>Izaberi raspored</h2>
              <p>
                Nakon uvoza, svaki PDF će ovde imati svoju zasebnu tabelu.
              </p>
            </div>
          )}
        </section>
      </section>
    </section>
  )
}

export default PdfImportPage