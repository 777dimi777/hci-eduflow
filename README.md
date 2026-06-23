# EduFlow

EduFlow je web aplikacija za organizaciju studentskih obaveza, rokova, ispita, materijala i fokusa tokom semestra.

Aplikacija pomaže studentu da na jednom mestu prati predmete, kolokvijume, projekte, ispitne rokove, prosečnu ocenu i dnevni plan rada.

## Glavne funkcionalnosti

* Dodavanje, izmena i brisanje predmeta
* Predmeti obojeni različitim bojama radi lakšeg praćenja
* Upravljanje obavezama, prioritetima i rokovima
* Interaktivan kalendar sa obavezama i ispitima
* Dnevni fokus sa mogućnošću završavanja i vraćanja obaveza
* Pametne preporuke za učenje prema roku i prioritetu
* Pregled narednih rokova i ispita
* Uvoz ispitnog rasporeda iz PDF dokumenta
* Povezivanje ispita sa predmetima
* Praćenje položenih ispita, ESPB bodova i težinskog proseka
* Postavljanje cilja proseka i procena potrebnih budućih ocena
* Biblioteka materijala, beleški i linkova
* Statistika po predmetima i semestrima
* Focus Timer za koncentrisan rad
* Nedeljni pregled fokus sesija i kontinuiteta učenja
* Dnevni osvrt na učenje
* Backup i vraćanje podataka iz JSON fajla
* Podešavanja pristupačnosti: veći tekst, manje animacija i fokus tastature
* Globalna brza pretraga pomoću prečice `Ctrl + K`

## HCI obrasci korišćeni u aplikaciji

EduFlow koristi više obrazaca iz oblasti interakcije čovek–računar:

* **Overview Plus Details** — statistika daje pregled, a detalji predmeta prikazuju konkretne obaveze i materijale.
* **Color-Coded Sections** — svaki predmet ima sopstvenu boju kroz kartice, kalendar i rokove.
* **Visibility of System Status** — toast poruke, statusi taskova, progres trake i indikator dnevnog opterećenja.
* **Direct Manipulation** — direktno završavanje taskova, dodavanje u dnevni fokus i upravljanje kalendarom.
* **Dynamic Queries** — globalna pretraga predmeta, obaveza i stranica.
* **Good Defaults** — početni fokus tajmer od 25 minuta i preporuke prema prioritetu i roku.
* **Progressive Disclosure** — onboarding lista vodi novog korisnika kroz najvažnije korake.
* **User Control and Freedom** — korisnik može menjati predmete, vraćati završene obaveze, resetovati podešavanja i vratiti backup.
* **Accessibility** — podrška za veći tekst, smanjene animacije, tastaturnu navigaciju i naglašen fokus.

## Tehnologije

* React
* Vite
* React Router
* Bootstrap Icons
* CSS
* Local Storage

## Pokretanje projekta

Instalacija biblioteka:

```bash
npm install
```

Pokretanje razvojnog servera:

```bash
npm run dev
```

Kreiranje produkcione verzije:

```bash
npm run build
```

## Čuvanje podataka

Aplikacija podatke čuva lokalno u pregledaču pomoću `localStorage`.

Korisnik može da napravi JSON backup svih podataka i kasnije ga vrati kroz Dashboard sekciju za backup.

## Autor

Miloš Dimitrijević
Elektronski fakultet u Nišu
Računarstvo i informatika
