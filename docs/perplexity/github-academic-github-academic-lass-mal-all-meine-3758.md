[^2_1]: https://github.com/orgs/community/discussions/171019

[^2_2]: https://github.com/orgs/community/discussions/201044

[^2_3]: https://github.com/orgs/community/discussions/161101

[^2_4]: https://github.com/orgs/community/discussions/79162

[^2_5]: https://github.com/orgs/community/discussions/70667

[^2_6]: https://github.com/orgs/community/discussions/37159

[^2_7]: https://docs.github.com/en/education/about-github-education/github-education-for-students/solving-problems-with-your-github-education-access

[^2_8]: https://docs.github.com/de/education/about-github-education/github-education-for-students/solving-problems-with-your-github-education-access

[^2_9]: https://github.com/orgs/community/discussions/172528

[^2_10]: https://github.com/academicpages/academicpages.github.io


---

# @GitHub @Academic "@GitHub @Academic lass mal all meine sessions hier auswerten und gucken was sich davon als kandidaten für das einfach machen portal lohnen. diese natürlich filtern mit denen die ich warscheinlich schon eingereicht habe. und mir dann für meinen lokalen agent einen prompt geben

Something went wrong while generating this response.
@GitHub @Academic try again?"

Hier ist eine kompakte Auswertung deiner GitHub-Sessions im Kontext „einfach-machen-Portal“ plus ein Prompt für deinen lokalen Agenten.

## Kurzfassung

- Du hast mehrere private Repos, die als Kandidaten für automatisierte Einreichungen über einfach-machen.gov.de infrage kommen (z. B. `agenturFuerArbeit`, `stellenradar`, `bahn-mcp`, `tax-agent`, `einfach-machen-agent`).[^3_1]
- Das Repo `einfach-machen-agent` ist explizit auf API‑Discovery für einfach-machen.gov.de ausgelegt und enthält bereits strukturierte Feedback‑Daten (`data/feedbacks.json`).[^3_1]
- Für einen lokalen Agenten lohnt es sich, zunächst alle Repos zu filtern, die (a) Behörden‑/Förder‑/Job‑Themen abbilden, (b) bereits API‑/Scraper‑Logik enthalten, und (c) nicht bereits als „eingereicht“ markiert sind.


## Kandidaten‑Repos (nach Themen \& Potenzial)

| Repo | Thema | Warum relevant für einfach-machen | Status-Hinweis |
| :-- | :-- | :-- | :-- |
| `einfach-machen-agent` | API‑Discovery für einfach-machen.gov.de (Playwright‑MCP) | Direkt passend; enthält bereits Feedback‑Struktur | Aktiv (zuletzt aktualisiert 06.08.2026) |
| `agenturFuerArbeit` | BA‑Jobportal (TypeScript) | Könnte Anträge/Leistungen abbilden | Privat, keine Issues offen |
| `stellenradar` | BA‑Job‑Suche, Scoring, Contact Enrichment | Passt zu Förder‑/Job‑Angeboten | Privat |
| `bahn-mcp` | MCP‑Integration für Bahn‑APIs | Mobilitäts‑Förderungen könnten relevant sein | Privat |
| `tax-agent` | Steuer‑Audit, Finanzblick‑Extraction | Steuer‑/Förder‑Themen könnten tangiert sein | Privat |
| `jobsage`, `bewerbung` | Bewerbung/Job‑Assistenz | Indirekt relevant, wenn es um Arbeits‑/Förder‑Anträge geht | Privat |

Repos wie `fritzbox`, `pantella-wow`, `omoStack`, `volt`, `ai-infra` sind eher infrastrukturell oder themenfremd und sollten für einfach-machen zunächst ausgeklammert werden.

## Filterlogik für „schon eingereicht“

Da GitHub Education / einfach-machen keine direkte „Einreichungs‑Historie“ pro Repo bietet, kannst du folgende Signale nutzen:

- **Issues/PRs** mit Keywords wie `submitted`, `applied`, `eingereicht`, `application`, `antrag`.[^3_1]
- **README/Docs** mit Abschnitten „Status“, „Submission“, „Einreichung“.
- **Commit‑Messages** oder Tags wie `submitted-*`, `applied-*`.
- **Feedback‑Dateien** (wie `data/feedbacks.json`), die bereits Einreichungs‑Feedback enthalten.

Wenn ein Repo solche Marker hat, würdest du es als „wahrscheinlich schon eingereicht“ flaggen und für neue Einreichungen zurückstellen.

## Prompt für deinen lokalen Agenten

```text
Du bist ein spezialisierter Agent zur Vorbereitung und Einreichung von Projekten über das einfach-machen.gov.de Portal.

Aufgabe:
1. Analysiere alle Repos im GitHub-Account „niStee“.
2. Filtere Repos nach Relevanz für einfach-machen:
   - Themen: Behörden, Förderprogramme, Jobvermittlung, Mobilität, Steuer, Bildung, Soziales.
   - Technische Hinweise: API-Clients, Scraper, MCP-Integrationen, Automatisierungsskripte.
3. Prüfe pro Repo, ob es bereits als „eingereicht“ markiert sein könnte:
   - Suche in README, Issues, PRs, Commit-Messages und Tags nach Keywords: „submitted“, „applied“, „eingereicht“, „application“, „Antrag“.
   - Prüfe vorhandene Feedback- oder Status-Dateien (z. B. data/feedbacks.json).
4. Erstelle eine priorisierte Liste der Kandidaten-Repos, die:
   - thematisch passen,
   - technisch einreichbar sind (API/Scraper/Automation),
   - keine klaren Hinweise auf bereits erfolgte Einreichung haben.
5. Für jedes Kandidaten-Repo:
   - Fasse kurz den Zweck zusammen.
   - Nenne die wichtigsten technischen Komponenten (Sprache, APIs, Skripte).
   - Schätze ein, welcher einfach-machen-Programmteil (Förderung, Job, Mobilität, etc.) am besten passt.
   - Schlage vor, welche Unterlagen/Infos noch fehlen würden für eine Einreichung.

Ausgabeformat:
- Kurze Einleitung (2–3 Sätze).
- Tabelle mit Spalten: Repo, Thema, Technische Kernelemente, Passendes einfach-machen-Programm, Einreichungs-Status (klar / unklar / wahrscheinlich schon eingereicht), Nächste Schritte.
- Danach eine priorisierte Top‑3‑Liste mit Begründung.

Hinweis:
- Ignoriere Repos, die offensichtlich infrastrukturell oder themenfremd sind (z. B. reine Infrastruktur, Gaming, Home‑Automation), es sei denn, sie haben klare Bezüge zu Förder‑/Behördenthemen.
- Sei konservativ bei der Einschätzung „schon eingereicht“: nur markieren, wenn es starke Hinweise gibt.
```

Wenn du magst, kann ich dir auf Basis dieses Prompts auch direkt eine konkrete Kandidaten‑Liste aus deinen Repos generieren (inkl. kurzer Bewertung pro Repo).
<span style="display:none">[^3_10][^3_11][^3_12][^3_13][^3_14][^3_15][^3_2][^3_3][^3_4][^3_5][^3_6][^3_7][^3_8][^3_9]</span>