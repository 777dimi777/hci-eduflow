import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useAcademic } from "../context/AcademicContext";
import { useExamSchedules } from "../context/ExamScheduleContext";
import { useMaterials } from "../context/MaterialContext";
import { useSubjects } from "../context/SubjectContext";
import { useTasks } from "../context/TaskContext";

const STORAGE_KEY = "eduflow-onboarding-dismissed";

function GettingStartedPanel() {
  const { subjects } = useSubjects();
  const { tasks } = useTasks();
  const { materials } = useMaterials();
  const { passedExams } = useAcademic();
  const { schedules } = useExamSchedules();

  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const steps = useMemo(() => {
    return [
      {
        id: "subjects",
        title: "Dodaj svoje predmete",
        description: "Unesi predmete, profesore, ESPB i boju za lakše praćenje.",
        icon: "bi-journal-bookmark",
        to: "/subjects",
        actionLabel: "Otvori predmete",
        completed: subjects.length > 0,
      },
      {
        id: "tasks",
        title: "Unesi prve obaveze",
        description: "Dodaj kolokvijume, domaće, projekte i rokove.",
        icon: "bi-list-check",
        to: "/tasks",
        actionLabel: "Dodaj obavezu",
        completed: tasks.length > 0,
      },
      {
        id: "schedule",
        title: "Ubaci raspored ispita",
        description: "Uvezi PDF satnicu i prebaci važne ispite u kalendar.",
        icon: "bi-calendar2-week",
        to: "/pdf-import",
        actionLabel: "Uvezi raspored",
        completed: schedules.length > 0,
      },
      {
        id: "materials",
        title: "Sačuvaj materijale",
        description: "Dodaj skripte, linkove, PDF fajlove i beleške uz predmet.",
        icon: "bi-folder2-open",
        to: "/materials",
        actionLabel: "Otvori materijale",
        completed: materials.length > 0,
      },
      {
        id: "progress",
        title: "Prati akademski uspeh",
        description: "Evidentiraj položene ispite i postavi cilj proseka.",
        icon: "bi-mortarboard",
        to: "/passed-exams",
        actionLabel: "Položeni ispiti",
        completed: passedExams.length > 0,
      },
    ];
  }, [subjects, tasks, schedules, materials, passedExams]);

  const completedCount = steps.filter((step) => step.completed).length;
  const progress = Math.round((completedCount / steps.length) * 100);
  const allCompleted = completedCount === steps.length;

  useEffect(() => {
    if (allCompleted) {
      localStorage.removeItem(STORAGE_KEY);
      setIsDismissed(false);
    }
  }, [allCompleted]);

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsDismissed(true);
  }

  if (isDismissed) {
    return null;
  }

  return (
    <section className="getting-started-panel">
      <div className="getting-started-heading">
        <div>
          <p className="page-eyebrow">
            {allCompleted ? "EDUFLOW JE SPREMAN" : "BRZI POČETAK"}
          </p>

          <h2>
            {allCompleted
              ? "Odlično, organizovao si svoj semestar."
              : "Postavi EduFlow za nekoliko minuta."}
          </h2>

          <p>
            {allCompleted
              ? "Sada koristi Dashboard da pratiš rokove, fokus i napredak."
              : "Završi osnovne korake i aplikacija će moći da ti daje preciznije preporuke."}
          </p>
        </div>

        <button
          type="button"
          className="getting-started-dismiss-button"
          onClick={handleDismiss}
          title="Sakrij kontrolnu listu"
          aria-label="Sakrij kontrolnu listu"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      <div className="getting-started-progress-row">
        <div className="getting-started-progress-label">
          <span>NAPREDAK PODEŠAVANJA</span>
          <strong>
            {completedCount}/{steps.length} završeno
          </strong>
        </div>

        <div
          className="getting-started-progress-track"
          aria-label={`Podešavanje aplikacije: ${progress}% završeno`}
        >
          <span style={{ width: `${progress}%` }}></span>
        </div>
      </div>

      <div className="getting-started-step-list">
        {steps.map((step) => (
          <article
            className={[
              "getting-started-step",
              step.completed ? "getting-started-step-completed" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={step.id}
          >
            <div className="getting-started-step-icon">
              <i
                className={`bi ${
                  step.completed ? "bi-check-lg" : step.icon
                }`}
              ></i>
            </div>

            <div className="getting-started-step-content">
              <strong>{step.title}</strong>
              <span>{step.description}</span>
            </div>

            <Link to={step.to} className="getting-started-step-link">
              {step.completed ? "Pregledaj" : step.actionLabel}
              <i className="bi bi-arrow-right"></i>
            </Link>
          </article>
        ))}
      </div>

      {!allCompleted && (
        <p className="getting-started-tip">
          <i className="bi bi-lightbulb"></i>
          Što uneseš više rokova i predmeta, preporuke za fokus biće korisnije.
        </p>
      )}
    </section>
  );
}

export default GettingStartedPanel;