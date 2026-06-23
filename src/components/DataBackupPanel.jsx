import { useState } from "react";
import { useToast } from "../context/ToastContext";

const BACKUP_VERSION = 1;

function getEduFlowData() {
  const data = {};

  Object.keys(localStorage)
    .filter((key) => key.startsWith("eduflow-"))
    .forEach((key) => {
      const value = localStorage.getItem(key);

      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = value;
      }
    });

  return data;
}

function formatBackupDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "nepoznat datum";
  }

  return new Intl.DateTimeFormat("sr-RS", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function DataBackupPanel() {
  const { showToast } = useToast();

  const [pendingBackup, setPendingBackup] = useState(null);
  const [feedback, setFeedback] = useState("");

  function handleExport() {
    const backup = {
      app: "EduFlow",
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: getEduFlowData(),
    };

    const fileContent = JSON.stringify(backup, null, 2);
    const fileBlob = new Blob([fileContent], {
      type: "application/json",
    });

    const downloadUrl = URL.createObjectURL(fileBlob);
    const link = document.createElement("a");

    const datePart = new Date().toISOString().slice(0, 10);

    link.href = downloadUrl;
    link.download = `eduflow-backup-${datePart}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(downloadUrl);

    const message = "Backup je uspešno preuzet na računar.";

    setFeedback(message);
    showToast({
      message,
      type: "success",
    });
  }

  async function handleBackupSelection(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const fileText = await file.text();
      const parsedBackup = JSON.parse(fileText);

      const hasValidStructure =
        parsedBackup &&
        typeof parsedBackup === "object" &&
        parsedBackup.app === "EduFlow" &&
        parsedBackup.version === BACKUP_VERSION &&
        parsedBackup.data &&
        typeof parsedBackup.data === "object" &&
        !Array.isArray(parsedBackup.data);

      if (!hasValidStructure) {
        throw new Error("Neispravan backup");
      }

      const importedKeys = Object.keys(parsedBackup.data).filter((key) =>
        key.startsWith("eduflow-"),
      );

      if (importedKeys.length === 0) {
        throw new Error("Backup nema EduFlow podatke");
      }

      setPendingBackup({
        ...parsedBackup,
        fileName: file.name,
        importedKeys,
      });

      setFeedback(
        `Backup „${file.name}“ je spreman za vraćanje. Pregledaj podatke pa potvrdi.`,
      );
    } catch {
      setPendingBackup(null);

      const message =
        "Fajl nije validan EduFlow backup. Izaberi .json fajl koji je napravljen iz aplikacije.";

      setFeedback(message);
      showToast({
        message,
        type: "error",
      });
    }
  }

  function handleRestore() {
    if (!pendingBackup) {
      return;
    }

    const shouldRestore = window.confirm(
      "Vraćanje backupa će zameniti trenutne EduFlow podatke u ovom pregledaču. Nastavljaš?",
    );

    if (!shouldRestore) {
      return;
    }

    Object.keys(localStorage)
      .filter((key) => key.startsWith("eduflow-"))
      .forEach((key) => localStorage.removeItem(key));

    Object.entries(pendingBackup.data)
      .filter(([key]) => key.startsWith("eduflow-"))
      .forEach(([key, value]) => {
        const valueToStore =
          typeof value === "string" ? value : JSON.stringify(value);

        localStorage.setItem(key, valueToStore);
      });

    const message =
      "Podaci su vraćeni. EduFlow se osvežava sa backup podacima.";

    setFeedback(message);

    showToast({
      message,
      type: "success",
      duration: 2000,
    });

    window.setTimeout(() => {
      window.location.reload();
    }, 900);
  }

  function handleCancelRestore() {
    setPendingBackup(null);
    setFeedback("Vraćanje backupa je otkazano.");
  }

  return (
    <section className="data-backup-panel">
      <div className="data-backup-heading">
        <div>
          <p className="page-eyebrow">BEZBEDNOST PODATAKA</p>
          <h2>Sačuvaj svoj EduFlow napredak</h2>
          <p>
            Predmeti, obaveze, ispiti, materijali i planovi se čuvaju lokalno
            u ovom pregledaču.
          </p>
        </div>

        <div className="data-backup-heading-icon">
          <i className="bi bi-shield-check"></i>
        </div>
      </div>

      {feedback && (
        <p className="data-backup-feedback" aria-live="polite">
          <i className="bi bi-info-circle-fill"></i>
          {feedback}
        </p>
      )}

      <div className="data-backup-grid">
        <article className="data-backup-action-card">
          <div className="data-backup-action-icon data-backup-export-icon">
            <i className="bi bi-download"></i>
          </div>

          <p className="page-eyebrow">IZVEZI PODATKE</p>
          <h3>Napravi backup</h3>

          <p>
            Preuzmi jedan JSON fajl sa svim trenutno sačuvanim podacima.
          </p>

          <button
            type="button"
            className="data-backup-primary-button"
            onClick={handleExport}
          >
            <i className="bi bi-download"></i>
            Preuzmi backup
          </button>
        </article>

        <article className="data-backup-action-card">
          <div className="data-backup-action-icon data-backup-import-icon">
            <i className="bi bi-upload"></i>
          </div>

          <p className="page-eyebrow">VRATI PODATKE</p>
          <h3>Učitaj backup</h3>

          <p>
            Izaberi EduFlow JSON backup sa računara i vrati prethodno stanje
            aplikacije.
          </p>

          <label className="data-backup-file-label">
            <i className="bi bi-file-earmark-arrow-up"></i>
            Izaberi JSON fajl

            <input
              type="file"
              accept=".json,application/json"
              onChange={handleBackupSelection}
            />
          </label>
        </article>
      </div>

      {pendingBackup && (
        <section className="data-backup-preview">
          <div className="data-backup-preview-icon">
            <i className="bi bi-file-earmark-check"></i>
          </div>

          <div className="data-backup-preview-content">
            <span>SPREMAN ZA VRAĆANJE</span>
            <strong>{pendingBackup.fileName}</strong>

            <small>
              Napravljen: {formatBackupDate(pendingBackup.exportedAt)} ·{" "}
              {pendingBackup.importedKeys.length} grupa podataka
            </small>
          </div>

          <div className="data-backup-preview-actions">
            <button
              type="button"
              className="data-backup-cancel-button"
              onClick={handleCancelRestore}
            >
              Otkaži
            </button>

            <button
              type="button"
              className="data-backup-restore-button"
              onClick={handleRestore}
            >
              <i className="bi bi-arrow-repeat"></i>
              Vrati podatke
            </button>
          </div>
        </section>
      )}
    </section>
  );
}

export default DataBackupPanel;