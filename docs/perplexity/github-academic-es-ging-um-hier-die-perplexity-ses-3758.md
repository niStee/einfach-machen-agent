[^3_1]: https://docs.github.com/en/education/about-github-education/github-education-for-students/solving-problems-with-your-github-education-access

[^3_2]: https://docs.github.com/en/education/about-github-education/github-education-for-students/apply-to-github-education-as-a-student

[^3_3]: https://docs.github.com/en/education/about-github-education/use-github-at-your-educational-institution/applying-to-be-a-github-campus-expert

[^3_4]: https://docs.github.com/es/education/about-github-education/github-education-for-students/apply-to-github-education-as-a-student?s=09

[^3_5]: https://github.com/orgs/community/discussions/156376

[^3_6]: https://github.com/orgs/community/discussions/156700

[^3_7]: https://github.com/orgs/community/discussions/111352

[^3_8]: https://github.com/orgs/community/discussions/66773

[^3_9]: https://github.com/education

[^3_10]: https://github.com/orgs/community/discussions/55559

[^3_11]: https://www.youtube.com/watch?v=bG1DTGtjBsg

[^3_12]: https://github744.rssing.com/chan-76365045/index-page3.html

[^3_13]: https://www.youtube.com/watch?v=3_f0LHEMfyU

[^3_14]: https://getedumail.com/blog/how-to-claim-github-student-developer-pack-with-edu-email

[^3_15]: https://skillnation.in/posts/github-education-unable-to-submit/


---

# @GitHub @Academic es ging um hier die perplexity sessions nicht um github aleine!

Alles klar – es ging um **deine Perplexity-Sessions** (also deine bisherigen Perplexity-Chats/Threads), nicht nur um GitHub-Repos. Ziel ist:

1. Alle deine Perplexity-Sessions durchsehen
2. Diejenigen identifizieren, die als **Kandidaten für das einfach-machen-Portal** taugen
3. Davon die filtern, die du **wahrscheinlich schon eingereicht** hast
4. Dir einen **Prompt für deinen lokalen Agenten** geben, der das automatisiert auswerten kann

Da ich keinen direkten Zugriff auf deine Perplexity-Historie habe, baue ich dir einen **Agenten-Prompt**, den du lokal laufen lassen kannst (z. B. über die Perplexity API / lokale LLM + Export deiner Sessions).

***

## Konzept: Was der Agent mit deinen Sessions machen soll

Der Agent soll im Kern folgendes tun:

- **Input**: Alle deine Perplexity-Sessions (Titel + vollständiger Chat-Verlauf, idealerweise als JSON/Markdown-Export).
- **Analyse pro Session**:
    - Thema extrahieren (z. B. „Förderantrag“, „Jobportal“, „Mobilität“, „Steuer“, „Bildung“, „Soziales“ etc.)
    - Prüfen, ob die Session Inhalte enthält, die zu **einfach-machen.gov.de** passen:
        - Behördenkommunikation
        - Anträge / Förderprogramme
        - Jobvermittlung / Arbeitsagentur
        - Mobilitätsleistungen (Bahn, ÖPNV, Reisekosten)
        - Steuer / Finanzbehörden
        - Bildung / BAföG / Stipendien
        - Soziale Leistungen / Bürgergeld etc.
    - Erkennen, ob die Session **bereits als „eingereicht“** aussieht:
        - Formulierungen wie „eingereicht“, „submitted“, „Antrag abgeschickt“, „bestätigt“, „Bescheid“, „Feedback vom Amt“, „Zusage“, „Ablehnung“ etc.
        - Konkrete Referenzen zu Antragsnummern, Bescheiden, offiziellen Portalen.
- **Output**:
    - Liste aller Sessions mit:
        - Titel / ID
        - Thema
        - Relevanz für einfach-machen (hoch / mittel / niedrig)
        - Einreichungs-Status (klar nein / unklar / wahrscheinlich schon eingereicht)
        - Kurze Begründung (1–2 Sätze)
    - Eine **priorisierte Top‑N‑Liste** der besten Kandidaten, die noch nicht eingereicht wurden.

***

## Prompt für deinen lokalen Agenten (Session-Auswerter)

Du kannst diesen Prompt als Vorlage für einen lokalen LLM-Agenten nehmen, der deine Session-Exports liest (z. B. JSON mit `[{id, title, messages: [...]}]`).

```text
Du bist ein spezialisierter Analyse-Agent für Perplexity-Sessions im Kontext des „einfach-machen“-Portals (einfach-machen.gov.de).

Input:
- Du erhältst eine Liste von Perplexity-Sessions im JSON-Format.
- Jede Session hat mindestens: `id`, `title`, `messages` (Array aus User- und Assistant-Nachrichten).

Aufgabe:
1. Analysiere jede Session einzeln.
2. Bestimme pro Session:
   a) Das Hauptthema (z. B. „Förderantrag“, „Jobvermittlung“, „Mobilität“, „Steuer“, „Bildung“, „Soziales“, „Sonstiges“).
   b) Die Relevanz für das einfach-machen-Portal:
      - hoch: Session behandelt direkt Anträge, Förderprogramme, Behördenleistungen, Job-/Mobilitäts-/Bildungs-/Sozialthemen, die über ein zentrales Portal abgewickelt werden könnten.
      - mittel: Session tangiert solche Themen nur indirekt (z. B. Vorbereitung, Recherche, aber kein konkreter Antrag).
      - niedrig: Session hat keinen erkennbaren Bezug zu Behörden, Förderung, Arbeit, Mobilität, Bildung oder Sozialem.
   c) Den wahrscheinlichen Einreichungs-Status:
      - „klar nein“: Keine Hinweise auf bereits eingereichte Anträge oder offizielle Rückmeldungen.
      - „unklar“: Es gibt vage Hinweise, aber keine klaren Formulierungen zu Einreichung oder Bescheid.
      - „wahrscheinlich schon eingereicht“: Es gibt klare Hinweise wie „eingereicht“, „Antrag abgeschickt“, „bestätigt“, „Bescheid erhalten“, „Zusage/Ablehnung“, Antragsnummern, offizielle Portal-Namen etc.
3. Erstelle eine strukturierte Übersicht aller Sessions mit:
   - `session_id`
   - `title`
   - `hauptthema`
   - `relevanz` (hoch/mittel/niedrig)
   - `einreichungs_status` (klar nein / unklar / wahrscheinlich schon eingereicht)
   - `begruendung` (1–2 Sätze, warum diese Einschätzung)
4. Erzeuge am Ende eine **priorisierte Top‑N‑Liste** (z. B. Top 10) der Sessions, die:
   - Relevanz = hoch
   - einreichungs_status ≠ „wahrscheinlich schon eingereicht“
   - besonders gut als Kandidaten für das einfach-machen-Portal geeignet erscheinen.
   Begründe kurz, warum diese Sessions priorisiert werden.

Ausgabeformat:
- Gib zunächst eine kurze Einleitung (2–3 Sätze).
- Dann eine Tabelle im Markdown-Format mit den Spalten:
  `session_id`, `title`, `hauptthema`, `relevanz`, `einreichungs_status`, `begruendung`.
- Danach eine priorisierte Top‑N‑Liste als nummerierte Liste mit je 1–2 Sätzen Begründung pro Eintrag.

Hinweise:
- Behandle die Session-Inhalte vertraulich; erfinde keine Details, die nicht im Text stehen.
- Sei konservativ bei der Einschätzung „wahrscheinlich schon eingereicht“: nur bei klaren Indizien.
- Wenn eine Session thematisch interessant ist, aber unklar bleibt, ob schon eingereicht, markiere sie als „unklar“ und priorisiere sie trotzdem, falls inhaltlich stark.

Input-Daten (Beispielstruktur, wird zur Laufzeit gefüllt):
[
  {
    "id": "SESSION_001",
    "title": "Antrag auf Mobilitätsförderung",
    "messages": [
      {"role": "user", "content": "..."},
      {"role": "assistant", "content": "..."}
    ]
  },
  ...
]
```


***

## Wie du das konkret nutzen kannst

1. **Exportiere deine Perplexity-Sessions**:
    - Entweder manuell über die Library (Threads öffnen, kopieren) und in ein strukturiertes JSON packen.
    - Oder über ein Skript, das deine History abruft (falls du API-Zugriff / lokalen Export hast).
2. **Füttere diesen Export in deinen lokalen Agenten** mit dem obigen Prompt.
3. Der Agent liefert dir:
    - Eine vollständige Tabelle aller Sessions mit Bewertung.
    - Eine priorisierte Kandidatenliste für das einfach-machen-Portal, bereits bereinigt um „wahrscheinlich schon eingereicht“.

Wenn du möchtest, kann ich dir im nächsten Schritt eine **konkrete JSON-Vorlage** für deine Sessions bauen oder ein kleines Skript, das aus Rohtexten (z. B. Markdown-Exports) das passende JSON für den Agenten erzeugt.
<span style="display:none">[^4_1][^4_10][^4_11][^4_12][^4_13][^4_14][^4_15][^4_2][^4_3][^4_4][^4_5][^4_6][^4_7][^4_8][^4_9]</span>