# Zum Hauptinhalt Zur Navigation Zur Suche Deals Spiele &...

---

### 🤖 Perplexity

Zum Hauptinhalt
Zur Navigation
Zur Suche
Deals
Spiele & Rätsel
Forum
Souveränität
Security
KI
Energie
Digitale Souveränität Soofi, Deutschlands Chance auf KI-Souveränität?
War Soofi Millionen Euro Steuergeld wert? Ein Projektmacher erklärt, warum Deutschland bei KI anders vorgehen sollte als OpenAI & Co.
6. August 2026 um 10:15 Uhr / Eine Analyse von Johannes Hiltscher
Die deutsche und die EU-Flagge vor dem Bundestag in Berlin (Bild: Niklas Jeromin, Pexels)
Die deutsche und die EU-Flagge vor dem Bundestag in Berlin Bild: Niklas Jeromin, Pexels / CC0 1.0
Inhalt

Dieser Golem-Plus-Artikel ist 24 Stunden frei verfügbar.

Deutschland soll bei KI unabhängiger von den USA werden, die zunehmend den Zugriff auf moderne Modelle beschränken. Dafür soll das Konsortium Soofi Open-Source-Modelle erstellen; von der Bundesregierung gab es für diesen Zweck Millionen.
Neues aus der Golem Karrierewelt
ISO 27001 Foundation mit Zertifikat: virtueller Zwei-Tage-Workshop
Seminar ISO 27001 Foundation mit Zertifikat: virtueller Zwei-Tage-Workshop
PowerShell für Power-User:innen (E-Learning)
E-Learning PowerShell für Power-User:innen (E-Learning)
ISO 42001 Foundation KI-Beauftragter mit Zertifikat: virtueller Zwei-Tage-Workshop
Seminar ISO 42001 Foundation KI-Beauftragter mit Zertifikat: virtueller Zwei-Tage-Workshop

Mitte Juni wurde mit Soofi-S das erste Modell vorgestellt (PDF). Es soll das erste einer Reihe von Foundation-Modellen sein, die beispielsweise Unternehmen auf ihre Bedürfnisse anpassen können. Das Konsortium will nicht nur Code und Modellgewichte unter Apache-Lizenz veröffentlichen – Soofi soll auch bei den Trainingsdaten offen sein. Laut Pressemitteilung (PDF) "erreicht Soofi im Englischen in seiner Größenklasse Spitzenwerte unter den offenen Modellen; im Deutschen führt es die Vergleichsgruppe an".

Dennoch erntete das Projekt reichlich Kritik: Für das viele Geld sei nur ein Nvidia-Modell neu trainiert und bei dessen Bewertung auch noch getrickst worden. Wir sprachen darüber mit Alexander Löser, der die Forschungsgruppe Datexis (Data Science and Text-based Information Systems) an der Berliner Hochschule für Technik leitet, die an Soofi für das Reinforcement Learning zuständig ist. Er sagt: "Soofi-S ist ein gutes Modell und wir haben hier, trotz Gegenwind aus allen Richtungen, eine enorme Leistung am Standort Deutschland hinbekommen."

Die Strategie von Soofi erklärt Löser so: Europa und Deutschland bräuchten bei KI eine andere Strategie als die USA und China – Ensembles von kleineren, aber spezialisierten Modellen. So ließen sich sogar die Frontier-Modelle mit Billionen Parametern schlagen. Massenweise riesige Rechenzentren zu bauen, könne nicht die Lösung sein, dafür fehle allein schon die Energieinfrastruktur.
Soofi-S hat Testfragen auswendig gelernt

Vor allem interessiert uns Lösers Einschätzung zur Kritik an Soofi. Ein wichtiger Vorwurf: Der Leistungsvergleich zwischen Soofi-S und anderen Modellen sei manipuliert. Konkret geht es um den eigenen Benchmark, der Soofi-S mit Ausnahme von Qwen 3.5 35B A3B deutlich vor anderen Modellen sieht, sowie den von der TU Darmstadt entwickelten Trainingsdatensatz TUDA/QA-base. Er enthielt paraphrasierte Fragen, unter anderem aus dem Test GPQA-Diamond. Durch dieses sogenannte Test Data Leakage konnte das Modell praktisch die Antworten auswendig lernen. Als Erster wies der KI-Forscher Elie Bakouch bei X darauf hin.
Empfohlener redaktioneller Inhalt

An dieser Stelle finden Sie einen externen Inhalt von twitter.com, der den Artikel ergänzt.

i took a second look since this is going viral, this model is a copy paste of nemotron 3 nano, same arch, ~80% of the mixture in common which oversells very hard the sovereign aspect. but this is not even the issue, they literally train on benchmark eval set: (twitter.com)
Zustimmung zur Anzeige externer Inhalte von twitter.com in meinem Browser (Cookie)

Ich bin damit einverstanden, dass mir externe Inhalte angezeigt werden. Damit können personenbezogene Daten an Drittanbieter übermittelt werden.
Mehr dazu in unserer Datenschutzerklärung.

Der Test besteht aus komplexen Fragen, die umfangreiches Fachwissen erfordern. Er ist ein Standardbenchmark für große Sprachmodelle. Dabei schneidet Soofi-S im Vergleich zu Nvidias Version von Nemotron 3 Nano, auf dem es aufbaut, besonders gut ab. – Kein Wunder?

Löser sagt, es sei lediglich ein einziger Benchmark-Datensatz betroffen gewesen – und mittlerweile auch korrigiert worden. Die anderen mehr als 80 Benchmarks seien in Ordnung; es sei also "eher sehr sorgfältig gearbeitet" worden. Allerdings ist das GPQA-Ergebnis maßgeblich für den Vorsprung im eigenen Benchmarksatz (Capability Index) verantwortlich, wie Bakouch hervorhebt. Im Capability Index macht es ein Fünftel des Gesamtergebnisses aus.

Den Datensatz lernte Soofi-S in der Annealing-Phase, in der das neuronale Netz durch Training mit hochwertigen Daten und niedriger Lernrate in einen Optimalzustand gebracht werden soll. Und zwar öfter als alle anderen Datensätze: Zehn Epochen, also Durchläufe durch den gesamten Datensatz, waren es laut dem veröffentlichten Bericht (siehe Tabelle 8 im Anhang).

Zwar ist der Datensatz der kleinste, und dass kleine Datensätze aufgrund der niedrigen Tokenzahl häufiger wiederholt werden, ist durchaus üblich. Doch bei allen anderen Datensätzen – auch ähnlich kleinen wie nvidia/Nemotron-RLHF-GenRM-v1, nvidia/Nemotron-Science-v1 und nvidia/Nemotron-SWE-v1 – waren es maximal zwei Durchläufe.

Effektiv hat das Modell damit sowohl von der deutschen als auch der englischen Version von TUDA/QA-base mehr Tokens gesehen als von den anderen drei genannten Datensätzen. Dass Test Data Leakage durchaus spürbare Effekte auf die Leistung eines Modells in Benchmarks haben kann, zeigten Forscher des französischen Instituts Inria (Veröffentlichung bei Arxiv, siehe Abschnitt 5.3).
GPQA-Antworten durch Fehler in Trainingsdaten gelandet

Löser hält dagegen, die GPQA-Paraphrasen seien aufgrund eines Fehlers in den Trainingsdaten gelandet. Von Hugging Face sei ein GPQA-Datensatz heruntergeladen worden, der fälschlicherweise als Trainingsdatensatz gelabelt gewesen sei.

Aufgefallen sei das, da es im Bericht gestanden habe; zu dem Zeitpunkt sei das Training aber bereits abgeschlossen gewesen. Fehler könnten bei einem so umfangreichen Datensatz passieren, deshalb versuche man, alles transparent zu machen. Bei nachfolgenden Trainingsläufen habe man die Daten entfernt.

Nach unserem Gespräch wurde auch der Bericht entsprechend ergänzt, GPQA aus dem Benchmark herausgerechnet. Dort ist zu lesen, dass während des Trainings keine auffällige, sprunghafte Steigerung des GPQA-Ergebnisses aufgetreten sei, weshalb das Problem unbemerkt geblieben sei.

Den Capability Index strichen die Verantwortlichen ersatzlos, stattdessen wird nun die Gesamtleistung (aggregate performance) als Vergleich herangezogen. Für die auffällig vielen Trainingsläufe allerdings hatte Löser keine befriedigende Erklärung, er führte sie auf die Annealing-Phase zurück.

Auch die Kosten ordnete Löser ein: Den Großteil verursacht das Training.

1
2
3
…
5

Digitale Souveränität: Soofi, Deutschlands Chance auf KI-Souveränität?
25 Millionen Euro für ein Modell, das es bereits gibt?
Wird Soofi-S als mehr angepriesen, als es ist?
Souverän mit Nvidia?
Europa braucht andere KI-Ansätze

Relevante Themen
LLM
Souveränität
Raus aus der (US)-Cloud
KI
Software
Politik
Nvidia
Donald Trump
Kommentare
Habe ich das richtig verstanden?
Da hat irgendeine Firma 25 Millionen Euro vom Staat bekommen um ein deutsches KI Modell... Neon84 / 6. August 2026 um 13:50 Uhr
Erinnert mich an das Zambian Space Program...
Was für eine Farce. 1000 GPUs lol. Und Souveränität proklamieren bei totaler Abhängigkeit... c0l0n3lp4n1c / 6. August 2026 um 13:21 Uhr
Ich finde es etwas traurig, das man es nicht...
Qwen Coder 3 Next -Yrunterladen ->läuft. Soofi... Anmelden, keine Rückmeldung seit Wochen. gadthrawn / 6. August 2026 um 12:49 Uhr
Stellenmarkt
Senior Cybersecurity Engineer (all genders) XITASO GmbH IT & Software Solutions, Augsburg, Krumbach, Berlin, Erlangen, Leipzig, München
Fullstack Developer (m/w/d) Fast Forward IT GmbH, Düsseldorf, Home Office
Network Consultant (m/w/d) Axsos AG, Metzingen, Home Office
Software Engineer Digital Solutions (m/w/d) WashTec Cleaning Technology GmbH, Augsburg
Verwandte Artikel
Investitionen in die Cybersicherheit sind das wichtigste Thema für IT-Führungskräfte. (Bild: Pexels / Jakub Zerdzicki) (Pexels / Jakub Zerdzicki)
IT-Budgets unter Druck Lizenz- und Tokenkosten blockieren Geld für IT-Modernisierung
/
Ministerpräsident Hendrik Wüst im März 2024 am Standort der künftigen Microsoft-Rechenzentren im Rheinischen Revier (Bild: Microsoft Deutschland) (Microsoft Deutschland)
Hohe Nachfrage Microsoft baut neues Rechenzentrum in Nordrhein-Westfalen
/
Deutsche KMU können sich die Cloud teilen. (Bild: Luna Groothedde/Pexels) (Luna Groothedde/Pexels)
Shared Sovereignty Souveräne Cloud ohne Millionenbudget
/
Meistgelesene Artikel
Primoco-Flugzeug mit Mobilfunktechnik der Deutschen Telekom (Bild: Deutsche Telekom) (Deutsche Telekom)
Tschechien Deutsche Telekom sieht sich mit fliegenden Antennen erfolgreich
/
Wolframstab mit oxidierter Oberfläche (Bild: Jurii / Wikipedia) (Jurii / Wikipedia)
Schrottsammler USA verbieten Lithium- und Wolfram-Exporte
/
Das Akte-X-Set hat acht Minifiguren. (Bild: Lego/Hintergrund: KI-generiert mit Firefly 3) (Lego/Hintergrund: KI-generiert mit Firefly 3)
X-Files 21369 Legos Akte-X-Set bringt Figuren von Mulder, Scully und Aliens
/

Golem Advanced Intel

GPU
Nvidia GeForce RTX 5070 Ti
CPU
Intel Core Ultra 7 265KF
RAM
32GB DDR5
SSD
2TB NVMe

€ 2.479,90 inkl. MwSt. Solange der Vorrat reicht
Golem-PC Beispielbild

Home
News
Soofi, Deutschlands Chance auf KI-Souveränität?

Über uns
Inserieren
Arbeiten bei Golem

Impressum
AGB
Datenschutz
Cookies & Tracking
Zusatzdienste
Inhalt Melden
Abo Kündigen
Vertrag widerrufen

©2026 Golem.de
Alle Rechte vorbehalten

### 🤖 Perplexity

Ja – der Artikel trifft den Kern der Kritik, aber „25 Millionen für ein bereits existierendes Nvidia-Modell“ wäre zu kurz gegriffen. Soofi S ist ein tatsächlich neu trainiertes deutsches/europäisches Basismodell, nutzt aber bewusst die offen dokumentierte Nemotron-3-Nano-Referenzarchitektur von Nvidia und deren Trainings-Ökosystem.
arxiv

Was Soofi technisch ist

Soofi S ist ein hybrides Mamba-Transformer-MoE-Modell mit rund 31,6 Milliarden Parametern, von denen pro Token etwa 3,2 Milliarden aktiv sind. Es wurde auf ungefähr 26,7 Billionen Token trainiert, mit gezielt höherem Deutsch-Anteil, auf bis zu 512 Nvidia-B200-GPUs in der Telekom Industrial AI Cloud in München.
arxiv

Das Projekt zielt primär nicht auf einen Endnutzer-Chatbot, sondern auf ein anpassbares Basismodell für Industrie, Verwaltung, Forschung und Self-/Sovereign-Hosting – etwa für Dokumentenanalyse, Code-Workloads und agentische Systeme.

Der Leak war real

Die Kritik am Benchmarking ist substantiell: In den Trainingsdaten befanden sich paraphrasierte Varianten von Fragen aus GPQA, einschließlich GPQA-Diamond. Genau dieser Benchmark war zugleich Teil der ursprünglichen Leistungsdarstellung.
arxiv
+1

Das Team dokumentiert in Report-Version 3 die Ursache: Der betroffene GPQA-Datensatz war auf Hugging Face mit dem Split-Namen train versehen, obwohl das Material faktisch Evaluierungsfragen enthielt; die Datenpipeline selektierte nach Split-Namen.
arxiv
+1

Das ist kein bloßer kosmetischer Fehler, denn trainierte oder eng paraphrasierte Testfragen machen ein Evaluationsergebnis nicht mehr belastbar. Der ursprüngliche „Capability Index“ war zusätzlich besonders problematisch, weil GPQA-Diamond ein eigener gewichtiger Bestandteil war.
news.ycombinator
+1

Die Korrektur ist angemessen

Soofi hat GPQA aus der Evaluation entfernt, die verglichenen Modelle neu ausgewertet und den Capability Index aufgegeben. Das ist die richtige unmittelbare Reaktion; die Transparenz des Datenmixes machte die externe Entdeckung überhaupt erst möglich.
arxiv
+1

Trotzdem bleibt der Vorwurf berechtigt, dass die ursprüngliche Kommunikation die Modellposition zu stark überbetont hat. Bei einem öffentlich finanzierten Souveränitätsprojekt müssen Eval-Suites vor Veröffentlichung automatisiert gegen alle Trainingsquellen – auch Paraphrasen und Übersetzungen – geprüft und von unabhängigen Stellen reproduziert werden.

Was „souverän“ hier bedeutet

Soofi ist nicht hardware-souverän: Training und Infrastruktur beruhen auf Nvidia-B200-GPUs, Nvidia Megatron-Bridge und der von Telekom betriebenen Cloud. Das bestreitet der technische Bericht auch nicht; die Modellarchitektur entspricht ausdrücklich der offenen Nemotron-3-Nano-Referenzarchitektur.
arxiv

Es kann aber im engeren, praktischen Sinn zur europäischen Souveränität beitragen: Gewichte, ausgewählte Checkpoints, Trainings- und Evaluierungscode sowie eine detaillierte Herkunftsrechnung der Daten sollen unter freizügigen Bedingungen verfügbar sein. Dadurch können europäische Akteure Modelle auditieren, betreiben, weitertrainieren und in eigene Betriebsumgebungen integrieren.
arxiv

Souveränitätsdimension	Soofi S
Betrieb und Datenhaltung	Gut möglich: Ausrichtung auf eigene bzw. europäisch betriebene Infrastruktur.
Modellartefakte und Audit	Vergleichsweise stark: Gewichte, Code, Checkpoints und Datenmischung werden offengelegt. 
arxiv

Trainingsdaten	Weitgehend rekonstruierbar, aber nicht vollständig offen: Der kommerziell lizenzierte Genios-Bestand bleibt eine dokumentierte Ausnahme. 
arxiv

Hardware und Kern-Stack	Schwach: hohe Abhängigkeit von Nvidia-Hardware und -Frameworks. 
arxiv

Frontier-Unabhängigkeit	Begrenzt: kein Ersatz für die allergrößten US-/chinesischen Frontier-Modelle.
Mein Urteil

Das Projekt ist nicht wertlos – aber die Erfolgsmessung muss deutlich nüchterner werden. Der eigentliche öffentliche Wert liegt weniger darin, „Deutschlands OpenAI“ zu bauen, sondern in offenen Trainingsartefakten, deutschsprachiger Datenkompetenz, reproduzierbaren Pipelines und einer real betreibbaren Modellbasis.
arxiv

Für dein typisches Self-hosting-/Agenten-Szenario wäre Soofi vor allem dann interessant, wenn die Gewichte tatsächlich ohne unnötiges Gating verfügbar sind, vLLM-/SGLang-Support solide ist und das Modell bei Deutsch, Tool Use sowie Code-Aufgaben gegen Qwen- und Llama-nahe Alternativen unabhängig evaluiert wird. Die behauptete Langkontext-Effizienz der Mamba-MoE-Architektur ist dabei technisch plausibel und potenziell relevanter als ein einzelner Benchmark-Rang.
arxiv

### 🤖 Perplexity

Du meinst vermutlich: Bitte falsifiziere bzw. widerlege deine vorige Antwort. Das gelingt in mehreren wichtigen Punkten – insbesondere bei der Behauptung einer bereits verfügbaren „offenen“ Nutzung und meiner zu unkritischen Bewertung der Souveränität.

Klare Korrekturen

Soofi ist derzeit nicht frei nutzbar. Die offizielle Projektseite sagt ausdrücklich, dass noch keine allgemeine Veröffentlichung zur direkten Nutzung erfolgt ist; aktuell laufen praxisnahe Tests mit Industriepartnern. Meine Formulierung, Soofi sei für Self-hosting relevant, war daher zu spekulativ.
soofi

Eine finale kommerzielle Lizenz liegt offenbar noch nicht vor. Öffentlich waren zumindest zeitweise nur zugangsbeschränkte Preview-Gewichte verfügbar; damit ist „open“ als gegenwärtige Nutzereigenschaft nicht gerechtfertigt, sondern allenfalls ein angekündigtes Ziel.
digitalhandwerk
+1

„Unter Apache-Lizenz veröffentlicht“ war aus dem zitierten Artikel nicht als vollendete Tatsache ableitbar. Die belastbare Formulierung lautet: Das Konsortium beabsichtigt eine permissive Veröffentlichung, während Zugang und finale Lizenz noch nicht allgemein verfügbar sind.
soofi
+1

Architektur und Eigenleistung

Meine Aussage „neu trainiert“ bleibt wahrscheinlich zutreffend, darf aber nicht mit einer eigenständigen Modellinnovation verwechselt werden. Die Mamba-Transformer-MoE-Architektur sei laut Analyse unverändert von Nvidias Nemotron 3 Nano übernommen worden; die nennenswerte Eigenleistung liegt somit vor allem in Datenmischung, Training, Dokumentation und möglichem späteren Post-Training.
digitalhandwerk

Die stärkere, aber präzisere Kritik lautet daher: Soofi ist kein „deutsches Gegenstück zu OpenAI“ auf der Ebene eigener Frontier-Architektur oder unabhängiger Compute-Lieferkette, sondern ein öffentlich geförderter europäischer Trainings- und Transparenzversuch auf Nvidia-Grundlage. Das ist nicht wertlos, aber erheblich weniger weitreichend als politische Souveränitätsrhetorik suggeriert.
nevercodealone
+1

Benchmark-Behauptung

Der GPQA-Leak widerlegt nicht, dass Soofi irgendeine brauchbare Modellqualität hat. Er widerlegt aber die Belastbarkeit der ursprünglich publizierten GPQA-Werte und damit auch jedes Marketing, das seine Spitzenposition wesentlich mit diesem Ergebnis begründete.
courionai

Dass das Konsortium GPQA entfernte und alle 16 Vergleichsmodelle neu bewertete, ist eine sinnvolle Korrektur. Die Aussage, die Rangfolge habe sich nicht geändert, stammt jedoch aus der Darstellung des Projekts bzw. einer darauf beruhenden Einordnung; ohne vollständig unabhängige Reproduktion ist sie keine endgültige Entkräftung der Kritik.
courionai

Mein korrigiertes Urteil

Die vorherige Antwort war zu wohlwollend, weil sie angekündigte Offenheit teilweise wie bereits realisierte Offenheit behandelte. Aktuell ist die robusteste Einordnung:

Behauptung	Belastbarer Stand
„Soofi ist Open Source“	Noch nicht vollständig belegt: allgemeiner Zugang und finale Lizenz fehlen offenbar. 
soofi
+1

„Soofi ist souverän“	Teilweise: Training in Deutschland und dokumentierte Artefakte; aber Abhängigkeit von Nvidia-Architektur, GPUs und Software-Stack bleibt. 
digitalhandwerk
+1

„Soofi ist Benchmark-Spitze“	Ursprüngliche Kommunikation ist durch GPQA-Kontamination kompromittiert; korrigierte Resultate benötigen externe Reproduktion. 
courionai

„Soofi ist eine echte Eigenentwicklung“	Gewichte wurden neu trainiert, Architektur aber offenbar unverändert übernommen. 
digitalhandwerk

„Soofi ist heute praktisch self-hostbar“	Für die Allgemeinheit nein, solange Zugang und finale Lizenz ausstehen. 
soofi
+1

### 🤖 Perplexity

Du hast recht: Meine vorige „Falsifizierung“ war selbst in einem entscheidenden Punkt zu weich bzw. unsauber formuliert. Sie lässt sich weiter falsifizieren.

Aktueller Release-Status

Nicht nur „die finale Lizenz fehlt offenbar“: Das offizielle Model Card sagt eindeutig, dass der veröffentlichte Checkpoint kein Open Release ist, sondern ein Research-Artefakt in einer geschlossenen Beta mit bereits ausgewählten Partnern. Der finale Checkpoint soll erst künftig ohne Gating unter einer permissiven Lizenz erscheinen.
huggingface

Die offiziellen Gewichte sind zudem tatsächlich gegated: Das Repository ist sichtbar, Dateien können aber erst nach Annahme von Bedingungen bzw. Freigabe abgerufen werden.
huggingface

Meine frühere Aussage, „aktuell offenbar nur zugangsbeschränkte Preview-Gewichte“, war also zu vorsichtig: Das ist durch die Projektquellen selbst bestätigt.
huggingface
+1

Lizenzstatus

Auch die Formulierung „eine finale kommerzielle Lizenz liegt offenbar noch nicht vor“ war unpräzise. Die aktuell sichtbare Preview wird als „Other“ bzw. Custom License geführt, während die Model Card gleichzeitig ankündigt, die endgültige Version später permissiv zu lizenzieren.
huggingface
+1

Daraus folgt: Soofi S ist Stand jetzt weder frei zugänglich noch unter einer nachweislich offenen Lizenz veröffentlicht. Die Bezeichnung „Open Source“ beschreibt ein Projektversprechen bzw. ein angestrebtes Endergebnis, nicht den Status der aktuellen Modellgewichte.
huggingface
+1

Praktische Nutzbarkeit

Meine Aussage, Soofi sei „nicht heute praktisch self-hostbar“, war im Ergebnis richtig, aber noch zu großzügig: Selbst ein zugelassener Preview-Nutzer erhält ein uninstruiertes, nicht ausgerichtetes Basismodell. Laut Model Card ist es nicht für den direkten Einsatz als Endnutzer-Assistent vorgesehen und benötigt eigenes Post-Training oder Domain-Adaption.
huggingface

Dazu kommt ein technischer Vertrauensanker: Das Modell erfordert eigenes Modeling Code und trust_remote_code=True. Für eine Sicherheitsbewertung in Firmen- oder Verwaltungsumgebungen ist das ein zusätzlicher Prüfpunkt, nicht bloß eine Installationszeile.
huggingface

Präzises Urteil

Die belastbare Aussage lautet daher:

Soofi S ist derzeit ein geschlossener Beta-Checkpoint eines öffentlich finanzierten Forschungsprojekts, nicht ein allgemein verfügbares Open-Source-Modell.

Das schließt nicht aus, dass die finale Veröffentlichung tatsächlich offen und nützlich wird. Solange Gewichtszugang, vollständiger Lizenztext, finale Evaluierung und die angekündigte permissive Freigabe jedoch ausstehen, ist jede Gegenwartsbehauptung wie „Deutschland hat nun ein offenes souveränes Foundation Model“ faktisch nicht gedeckt.
huggingface
+2

### 🤖 Perplexity

Wäre das etwas für das einfach machen Portal?

### 🤖 Perplexity

Ja, als Meldung ist das gut geeignet – aber nicht als pauschales „Soofi ist schlecht“, sondern als konkreter Vorschlag zur verlässlichen Beschaffung und Veröffentlichung staatlich finanzierter KI-Modelle. Das EinfachMachen-Portal sammelt gerade bürokratische bzw. administrative Hindernisse und konkrete Verbesserungsvorschläge; KI-gestützte Kategorisierung und Auswertung sind ausdrücklich als Ausbauschritt vorgesehen.
bmds.bund
+1

Sinnvolle Stoßrichtung

Melde nicht primär den technischen GPQA-Fehler. Das Portal ist kein Forschungs-Peer-Review. Das Verwaltungsproblem ist vielmehr:

Bei öffentlich finanzierten KI-Projekten ist für Außenstehende zu spät und zu schwer überprüfbar, ob angekündigte Offenheit, Lizenz, Modellzugang, Datenprovenienz, Benchmark-Integrität und Hardwareabhängigkeiten tatsächlich erfüllt sind.

Soofi ist dafür ein anschaulicher Anlass: Das Projekt bewirbt langfristig eine lizenzfreie Verfügbarkeit, befindet sich derzeit aber in einer Beta mit ausgewählten Industriepartnern.
soofi

Textvorschlag

Titel:
Verbindliche Transparenzstandards für staatlich finanzierte KI-Modelle

Hindernis:
Öffentlich finanzierte KI-Projekte werden häufig mit Begriffen wie „Open Source“, „offen“ oder „souverän“ kommuniziert, obwohl Modellgewichte, endgültige Lizenz, Trainingsdaten-Dokumentation, Zugangsbedingungen oder reproduzierbare unabhängige Evaluationen noch nicht allgemein verfügbar sind. Bürger, Unternehmen, Forschung und kleinere Anbieter können deshalb kaum prüfen, ob der öffentliche Förderzweck tatsächlich erreicht wird. Dies erschwert eine informierte Nutzung öffentlicher Digitalprojekte und erzeugt unnötige Vertrauens- und Prüfkosten.

Konkreter Vorschlag:
Für jedes überwiegend staatlich finanzierte KI-Basismodell sollte spätestens zum Projektstart ein standardisiertes öffentliches Transparenzblatt verpflichtend sein. Es sollte laufend maschinenlesbar aktualisiert werden und mindestens enthalten:

Fördersumme, Fördergeber, Laufzeit und messbare Liefergegenstände

Status von Gewichten, Code, Trainingsdaten-Artefakten und Dokumentation

Endgültige Lizenz, Zugangsbeschränkungen und Termin der allgemeinen Veröffentlichung

Herkunft und Lizenzstatus der Daten, einschließlich nicht veröffentlichbarer Anteile

Hardware-, Cloud- und Software-Abhängigkeiten, insbesondere von nicht-europäischen Anbietern

Vorab festgelegte, versionierte Evaluierungsprotokolle und unabhängige Reproduktion

Pflicht zur Kennzeichnung und Neubewertung bei Benchmark-Kontamination

Öffentlich nachvollziehbare Kriterien, wann der Förderer das Projekt als erfolgreich bewertet

Bei angekündigter Offenheit sollte die Förderung außerdem an verbindliche Meilensteine gekoppelt sein: Werden frei nutzbare Gewichte, eine tatsächlich offene Lizenz oder die zugesagte Dokumentation nicht fristgerecht geliefert, müssen Nachbesserung, Rückforderung oder eine begründete öffentliche Ausnahmeentscheidung folgen.

Warum das anschlussfähig ist

Der Vorschlag verlangt keine bestimmte Modellarchitektur und keine Abkehr von Nvidia, sondern reduziert Verwaltungs- und Kontrollaufwand durch einheitliche Nachweise. Er passt damit zum Zweck des Portals, Hindernisse sichtbar zu machen und Verfahren transparenter, nachvollziehbarer und wirksamer zu gestalten.
bmds.bund

Er ist auch politisch weniger angreifbar als eine Einzelfallbeschwerde: Wer offene, souveräne oder strategische KI mit Steuergeld fördert, muss die Begriffe operationalisieren und überprüfbar machen.

