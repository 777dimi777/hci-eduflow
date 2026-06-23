import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useSubjects } from "../context/SubjectContext";
import { useTasks } from "../context/TaskContext";

const quickPages = [
  {
    id: "page-dashboard",
    title: "Kontrolna tabla",
    subtitle: "Pregled dana i preporuke",
    icon: "bi-grid-1x2",
    to: "/",
    keywords: "dashboard pocetna kontrolna tabla",
  },
  {
    id: "page-subjects",
    title: "Predmeti",
    subtitle: "Dodaj, izmeni i otvori predmet",
    icon: "bi-journal-bookmark",
    to: "/subjects",
    keywords: "predmeti semestar espb profesor",
  },
  {
    id: "page-tasks",
    title: "Obaveze",
    subtitle: "Planer taskova i rokova",
    icon: "bi-list-check",
    to: "/tasks",
    keywords: "obaveze taskovi rokovi planer",
  },
  {
    id: "page-calendar",
    title: "Kalendar",
    subtitle: "Pregled rokova po datumima",
    icon: "bi-calendar3",
    to: "/calendar",
    keywords: "kalendar datumi ispiti rokovi",
  },
  {
    id: "page-materials",
    title: "Materijali",
    subtitle: "Beleške, linkovi i dokumenti",
    icon: "bi-folder2-open",
    to: "/materials",
    keywords: "materijali pdf skripte linkovi",
  },
  {
    id: "page-exams",
    title: "Položeni ispiti",
    subtitle: "Ocene, ESPB i prosek",
    icon: "bi-mortarboard",
    to: "/passed-exams",
    keywords: "ispiti ocene prosek espb",
  },
  {
    id: "page-goal",
    title: "Cilj proseka",
    subtitle: "Plan za željeni prosek",
    icon: "bi-bullseye",
    to: "/grade-goal",
    keywords: "cilj prosek ocene",
  },
  {
    id: "page-statistics",
    title: "Statistika",
    subtitle: "Napredak i opterećenje",
    icon: "bi-bar-chart-line",
    to: "/statistics",
    keywords: "statistika napredak analiza",
  },
  {
    id: "page-settings",
    title: "Podešavanja",
    subtitle: "Prikaz i pristupačnost",
    icon: "bi-sliders",
    to: "/settings",
    keywords: "podesavanja pristupacnost animacije tekst",
  },
];

function normalizeText(value) {
  return String(value || "")
    .toLocaleLowerCase("sr-RS")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function QuickCommandPalette() {
  const navigate = useNavigate();
  const { subjects } = useSubjects();
  const { tasks } = useTasks();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef(null);

  useEffect(() => {
    function handleShortcut(event) {
      const isCommandShortcut =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLocaleLowerCase("sr-RS") === "k";

      if (!isCommandShortcut) {
        return;
      }

      event.preventDefault();

      setIsOpen((previousValue) => !previousValue);
      setQuery("");
      setActiveIndex(0);
    }

    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen]);

  const subjectMap = useMemo(() => {
    return new Map(
      subjects.map((subject) => [Number(subject.id), subject]),
    );
  }, [subjects]);

  const searchItems = useMemo(() => {
    const subjectItems = subjects.map((subject) => ({
      id: `subject-${subject.id}`,
      title: `${subject.code} — ${subject.name}`,
      subtitle: `${subject.semester}. semestar · ${subject.ects} ESPB`,
      icon: "bi-journal-bookmark-fill",
      to: `/subjects/${subject.id}`,
      type: "Predmet",
      keywords: `${subject.code} ${subject.name} ${subject.professor}`,
    }));

    const taskItems = tasks
      .filter((task) => task.status !== "done")
      .map((task) => {
        const subject = subjectMap.get(Number(task.subjectId));

        return {
          id: `task-${task.id}`,
          title: task.title,
          subtitle: subject
            ? `${subject.code} · Rok: ${task.dueDate || "nije unet"}`
            : `Aktivna obaveza · Rok: ${task.dueDate || "nije unet"}`,
          icon: task.taskType === "exam" ? "bi-mortarboard" : "bi-list-task",
          to: "/tasks",
          type: "Obaveza",
          keywords: `${task.title} ${task.notes || ""} ${
            subject?.code || ""
          } ${subject?.name || ""}`,
        };
      });

    return [
      ...quickPages.map((page) => ({
        ...page,
        type: "Stranica",
      })),
      ...subjectItems,
      ...taskItems,
    ];
  }, [subjects, tasks, subjectMap]);

  const visibleItems = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());

    if (!normalizedQuery) {
      return quickPages.map((page) => ({
        ...page,
        type: "Brza navigacija",
      }));
    }

    return searchItems
      .filter((item) => {
        const searchableText = normalizeText(
          `${item.title} ${item.subtitle} ${item.keywords}`,
        );

        return searchableText.includes(normalizedQuery);
      })
      .slice(0, 9);
  }, [query, searchItems]);

  function closePalette() {
    setIsOpen(false);
    setQuery("");
    setActiveIndex(0);
  }

  function handleChoose(item) {
    navigate(item.to);
    closePalette();
  }

  function handleInputKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closePalette();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveIndex((previousIndex) =>
        Math.min(previousIndex + 1, visibleItems.length - 1),
      );

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveIndex((previousIndex) =>
        Math.max(previousIndex - 1, 0),
      );

      return;
    }

    if (event.key === "Enter" && visibleItems[activeIndex]) {
      event.preventDefault();
      handleChoose(visibleItems[activeIndex]);
    }
  }

  function handleQueryChange(event) {
    setQuery(event.target.value);
    setActiveIndex(0);
  }

  return (
    <>
      <button
        type="button"
        className="command-palette-launcher"
        onClick={() => setIsOpen(true)}
        title="Brza pretraga"
      >
        <i className="bi bi-search"></i>
        <span>Brza pretraga</span>
        <kbd>Ctrl K</kbd>
      </button>

      {isOpen && (
        <div
          className="command-palette-backdrop"
          role="presentation"
          onMouseDown={closePalette}
        >
          <section
            className="command-palette"
            role="dialog"
            aria-modal="true"
            aria-label="Brza pretraga EduFlow aplikacije"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="command-palette-search-row">
              <i className="bi bi-search"></i>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleQueryChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Pretraži stranice, predmete ili obaveze..."
                aria-label="Pretraži EduFlow"
              />

              <button
                type="button"
                onClick={closePalette}
                title="Zatvori pretragu"
                aria-label="Zatvori pretragu"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="command-palette-result-heading">
              <span>
                {query.trim()
                  ? "REZULTATI PRETRAGE"
                  : "BRZA NAVIGACIJA"}
              </span>

              <small>
                <kbd>↑</kbd>
                <kbd>↓</kbd>
                kreći se · <kbd>Enter</kbd> otvori
              </small>
            </div>

            {visibleItems.length > 0 ? (
              <div className="command-palette-results">
                {visibleItems.map((item, index) => (
                  <button
                    type="button"
                    className={
                      index === activeIndex
                        ? "command-palette-result command-palette-result-active"
                        : "command-palette-result"
                    }
                    key={item.id}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => handleChoose(item)}
                  >
                    <span className="command-palette-result-icon">
                      <i className={`bi ${item.icon}`}></i>
                    </span>

                    <span className="command-palette-result-content">
                      <strong>{item.title}</strong>
                      <small>{item.subtitle}</small>
                    </span>

                    <span className="command-palette-result-type">
                      {item.type}
                    </span>

                    <i className="bi bi-arrow-return-left"></i>
                  </button>
                ))}
              </div>
            ) : (
              <div className="command-palette-empty">
                <i className="bi bi-search-heart"></i>
                <h3>Nema rezultata</h3>
                <p>Probaj naziv predmeta, obaveze ili stranice.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

export default QuickCommandPalette;