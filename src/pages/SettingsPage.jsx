import { useToast } from "../context/ToastContext";
import { usePreferences } from "../context/PreferencesContext";

function SettingsPage() {
  const { preferences, updatePreference, resetPreferences } = usePreferences();
  const { showToast } = useToast();

  function handlePreferenceChange(preferenceName, value) {
    updatePreference(preferenceName, value);

    const labels = {
      reducedMotion: "Smanjene animacije",
      largerText: "Veći tekst interfejsa",
      enhancedFocus: "Naglašeni fokus tastature",
    };

    showToast({
      message: `${labels[preferenceName]} je ${value ? "uključen" : "isključen"}.`,
      type: "success",
    });
  }

  function handleReset() {
    resetPreferences();

    showToast({
      message: "Podešavanja interfejsa su vraćena na podrazumevane vrednosti.",
      type: "info",
    });
  }

  return (
    <section className="settings-page">
      <div className="dashboard-heading">
        <div>
          <p className="page-eyebrow">PODEŠAVANJA</p>
          <h1>Prilagodi EduFlow sebi</h1>
          <p className="page-description">
            Izaberi prikaz koji ti olakšava koncentraciju, čitanje i rad u
            aplikaciji.
          </p>
        </div>
      </div>

      <section className="settings-accessibility-panel">
        <div className="settings-panel-heading">
          <div>
            <p className="page-eyebrow">PRISTUPAČNOST</p>
            <h2>Prikaz i interakcija</h2>
            <p>
              Podešavanja se čuvaju samo na ovom uređaju i ostaju aktivna i
              posle osvežavanja stranice.
            </p>
          </div>

          <div className="settings-panel-heading-icon">
            <i className="bi bi-universal-access"></i>
          </div>
        </div>

        <div className="settings-preference-list">
          <article className="settings-preference-row">
            <div className="settings-preference-icon settings-motion-icon">
              <i className="bi bi-stars"></i>
            </div>

            <div className="settings-preference-content">
              <h3>Smanji animacije</h3>
              <p>
                Uklanja pomeranja i ulazne animacije, pa je interfejs mirniji
                tokom rada.
              </p>
            </div>

            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={preferences.reducedMotion}
                onChange={(event) =>
                  handlePreferenceChange(
                    "reducedMotion",
                    event.target.checked,
                  )
                }
              />
              <span aria-hidden="true"></span>
              <em>
                {preferences.reducedMotion ? "Uključeno" : "Isključeno"}
              </em>
            </label>
          </article>

          <article className="settings-preference-row">
            <div className="settings-preference-icon settings-text-icon">
              <i className="bi bi-fonts"></i>
            </div>

            <div className="settings-preference-content">
              <h3>Veći tekst interfejsa</h3>
              <p>
                Povećava tekst u aplikaciji da bi rokovi, zadaci i materijali
                bili lakši za čitanje.
              </p>
            </div>

            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={preferences.largerText}
                onChange={(event) =>
                  handlePreferenceChange("largerText", event.target.checked)
                }
              />
              <span aria-hidden="true"></span>
              <em>{preferences.largerText ? "Uključeno" : "Isključeno"}</em>
            </label>
          </article>

          <article className="settings-preference-row">
            <div className="settings-preference-icon settings-focus-icon">
              <i className="bi bi-keyboard"></i>
            </div>

            <div className="settings-preference-content">
              <h3>Naglašeni fokus tastature</h3>
              <p>
                Kada koristiš Tab taster, aktivno dugme ili polje dobija
                izražen žuti okvir.
              </p>
            </div>

            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={preferences.enhancedFocus}
                onChange={(event) =>
                  handlePreferenceChange(
                    "enhancedFocus",
                    event.target.checked,
                  )
                }
              />
              <span aria-hidden="true"></span>
              <em>
                {preferences.enhancedFocus ? "Uključeno" : "Isključeno"}
              </em>
            </label>
          </article>
        </div>

        <div className="settings-reset-row">
          <div>
            <strong>Vrati podrazumevana podešavanja</strong>
            <span>Isključuje sve opcije pristupačnosti iznad.</span>
          </div>

          <button
            type="button"
            className="settings-reset-button"
            onClick={handleReset}
          >
            <i className="bi bi-arrow-counterclockwise"></i>
            Resetuj
          </button>
        </div>
      </section>

      <section className="settings-keyboard-card">
        <div className="settings-keyboard-icon">
          <i className="bi bi-lightbulb"></i>
        </div>

        <div>
          <p className="page-eyebrow">BRZI SAVET</p>
          <h2>Koristi Tab za brži rad</h2>
          <p>
            Tasterom <kbd>Tab</kbd> prolaziš kroz dugmad i polja, a tasterom{" "}
            <kbd>Enter</kbd> aktiviraš izabranu opciju. Uključi naglašeni fokus
            iznad da uvek vidiš gde se nalaziš.
          </p>
        </div>
      </section>
    </section>
  );
}

export default SettingsPage;