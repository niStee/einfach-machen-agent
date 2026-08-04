# API Endpoints & Form Structure Discovery

**Discovered:** 2026-08-04T13:26:00.191Z  
**Target URL:** `https://einfach-machen.gov.de/meldeformular`  
**Architecture:** TYPO3 FormFramework (Server-Rendered Multi-Step Form with CSRF & FormCrShield anti-bot tokens)  
**Total Captured POST Calls:** 12  

## Technical Architecture Analysis

- **System:** TYPO3 Form Framework (`tx_form_formframework`)
- **Submission Type:** Multi-step HTML POST form (`multipart/form-urlencoded` / `application/x-www-form-urlencoded`)
- **Security & Anti-Bot Protections:**
  - HMAC signed state tokens (`__state`)
  - Signed trusted properties hash (`__trustedProperties`)
  - Dynamic Challenge-Response Honeypot Shield (`cr-field` via `FormCrShield.js`)
  - Session-bound hidden honeypot fields

## Captured Form Submission Requests


### Request 1: POST `https://www.etracker.de/api/v6/tracking/webEvents`
- **Resource Type:** `fetch`
- **Content-Type:** `multipart/form-data; boundary=#####etrackerBoundary#####`
- **Payload Data:**
```
--#####etrackerBoundary#####
Content-Disposition: form-data; name="et"

Knsno9
--#####etrackerBoundary#####
Content-Disposition: form-data; name="user_id"

abc44513cf7445365eb3a40915a8ca7e
--#####etrackerBoundary#####
Content-Disposition: form-data; name="userData"

{"productIdentifier":null,"pluginVersion":null,"tc":17858499568326,"trcl":"aW","cookie":{"blocked":true,"firstParty":"","domain":"einfach-machen.gov.de","cookieLifetime":24,"http":0}}
--#####etrackerBoundary#####
Content-Disposition: form-data; name="events"

[{"eventType":"cssSelectorClick","eventVersion":1,"clientTm":17858499568336,"cssSelectorClick":{"object":"Frage 1","event_sub_type":"","action":"","category":"Bürokratiemelder","client_info":null,"pagename":"EinfachMachen-Portal | Formular","url":"https://einfach-machen.gov.de/meldeformular","areas":"","page_id":"849955878"}}]
--#####etrackerBoundary#####--
```


### Request 2: POST `https://einfach-machen.gov.de/meldeformular?tx_form_formframework%5Baction%5D=perform&tx_form_formframework%5Bcontroller%5D=FormFrontend&cHash=39d6b6fb16f3b5c0ee21cb3cafdac9c1`
- **Resource Type:** `document`
- **Content-Type:** `multipart/form-data; boundary=----WebKitFormBoundary6iHoocWEKCi368Ex`
- **Payload Data:**
```
------WebKitFormBoundary6iHoocWEKCi368Ex
Content-Disposition: form-data; name="tx_form_formframework[buerokratiemelder-892][__state]"

TzozOToiVFlQTzNcQ01TXEZvcm1cRG9tYWluXFJ1bnRpbWVcRm9ybVN0YXRlIjoyOntzOjI1OiIAKgBsYXN0RGlzcGxheWVkUGFnZUluZGV4IjtpOjA7czoxMzoiACoAZm9ybVZhbHVlcyI7YTowOnt9fQ==3d791ef065fdd5e6411de7248b9cef80d750f924
------WebKitFormBoundary6iHoocWEKCi368Ex
Content-Disposition: form-data; name="tx_form_formframework[__trustedProperties]"

{"buerokratiemelder-892":{"person_art":1,"cr-field":1,"ORdvPItWfhrHauQDCkwpmEe":1,"__currentPage":1}}b189c65d546d2dc136bc2aa58a4bbd5b75258757
------WebKitFormBoundary6iHoocWEKCi368Ex
Content-Disposition: form-data; name="tx_form_formframework[buerokratiemelder-892][person_art]"

Privatperson
------WebKitFormBoundary6iHoocWEKCi368Ex
Content-Disposition: form-data; name="tx_form_formframework[buerokratiemelder-892][cr-field]"

MXwxNzg1OTE3OTIyfDlkZjUxNGUyYjY5MDI2YmFlZWZlNjBkMzZiYmExODI1MTkyNTA1MDJ8Mw==
------WebKitFormBoundary6iHoocWEKCi368Ex
Content-Disposition: form-data; name="tx_form_formframework[buerokratiemelder-892][ORdvPItWfhrHauQDCkwpmEe]"


------WebKitFormBoundary6iHoocWEKCi368Ex
Content-Disposition: form-data; name="tx_form_formframework[buerokratiemelder-892][__currentPage]"

1
------WebKitFormBoundary6iHoocWEKCi368Ex--

```


### Request 3: POST `https://www.etracker.de/api/v6/tracking/webEvents`
- **Resource Type:** `ping`
- **Content-Type:** `multipart/form-data; boundary=----WebKitFormBoundaryareYNzW5a6TKnhB0`
- **Payload Data:**
```
------WebKitFormBoundaryareYNzW5a6TKnhB0
Content-Disposition: form-data; name="et"

Knsno9
------WebKitFormBoundaryareYNzW5a6TKnhB0
Content-Disposition: form-data; name="user_id"

abc44513cf7445365eb3a40915a8ca7e
------WebKitFormBoundaryareYNzW5a6TKnhB0
Content-Disposition: form-data; name="userData"

{"productIdentifier":null,"pluginVersion":null,"trcl":"aW","cookie":{"blocked":true,"noResponse":true,"firstParty":"","domain":"einfach-machen.gov.de","cookieLifetime":24}}
------WebKitFormBoundaryareYNzW5a6TKnhB0
Content-Disposition: form-data; name="events"

[{"eventType":"pageExitBeacon","eventVersion":1,"clientTm":0,"pageExitBeacon":{"object":"","event_sub_type":"first","value":797,"client_info":null,"pagename":"EinfachMachen-Portal | Formular","url":"https://einfach-machen.gov.de/meldeformular","areas":"","page_id":"849955878"}},{"eventType":"pageExitBeacon","eventVersion":1,"clientTm":0,"pageExitBeacon":{"client_info":null,"pagename":"EinfachMachen-Portal | Formular","url":"https://einfach-machen.gov.de/meldeformular","areas":"","page_id":"849955878"}}]
------WebKitFormBoundaryareYNzW5a6TKnhB0--

```


### Request 4: GET `https://www.etracker.de/cntcc?&&et=Knsno9&v=2026.803.21145&tc=17858499572842&pagename=EinfachMachen-Portal%20%7C%20Formular&ilevel=1&et_source_url=https%3A%2F%2Feinfach-machen.gov.de%2Fmeldeformular%3Ftx_form_formframework%255Baction%255D%3Dperform%26tx_form_formframework%255Bcontroller%255D%3DFormFrontend%26cHash%3D39d6b6fb16f3b5c0ee21cb3cafdac9c1%23buerokratiemelder-892&et_ref=https%3A%2F%2Feinfach-machen.gov.de%2Fmeldeformular&block_cookies=true&et_bs=1&code_source=%2F%2Fcode.etracker.com%2Fcode%2Fe.js&code_async=true&page_id=849957087&trcl=aW&et_sbscr=0&coid=be0d3ce2d05f91020f615f19ef99b76b&et_cblk=1&et_cd=einfach-machen.gov.de&dh=fXKRgi2FHsTXVnMlwn0Inn9tImsnhBaG&clt=24`
- **Resource Type:** `script`
- **Content-Type:** `N/A`
- **Payload Data:**
```
None
```


### Request 5: POST `https://www.etracker.de/api/v6/tracking/webEvents`
- **Resource Type:** `fetch`
- **Content-Type:** `multipart/form-data; boundary=#####etrackerBoundary#####`
- **Payload Data:**
```
--#####etrackerBoundary#####
Content-Disposition: form-data; name="et"

Knsno9
--#####etrackerBoundary#####
Content-Disposition: form-data; name="user_id"

be0d3ce2d05f91020f615f19ef99b76b
--#####etrackerBoundary#####
Content-Disposition: form-data; name="userData"

{"productIdentifier":null,"pluginVersion":null,"tc":17858499579703,"trcl":"aW","cookie":{"blocked":true,"firstParty":"","domain":"einfach-machen.gov.de","cookieLifetime":24,"http":0}}
--#####etrackerBoundary#####
Content-Disposition: form-data; name="events"

[{"eventType":"cssSelectorClick","eventVersion":1,"clientTm":17858499579703,"cssSelectorClick":{"object":"Frage 2","event_sub_type":"","action":"Anliegen beschreiben","category":"Bürokratiemelder","client_info":null,"pagename":"EinfachMachen-Portal | Formular","url":"https://einfach-machen.gov.de/meldeformular?tx_form_formframework%5Baction%5D=perform&tx_form_formframework%5Bcontroller%5D=FormFrontend&cHash=39d6b6fb16f3b5c0ee21cb3cafdac9c1#buerokratiemelder-892","areas":"","page_id":"849957087"}}]
--#####etrackerBoundary#####--
```


### Request 6: POST `https://einfach-machen.gov.de/meldeformular?tx_form_formframework%5Baction%5D=perform&tx_form_formframework%5Bcontroller%5D=FormFrontend&cHash=39d6b6fb16f3b5c0ee21cb3cafdac9c1`
- **Resource Type:** `document`
- **Content-Type:** `multipart/form-data; boundary=----WebKitFormBoundaryL4FjR8nkFFrTBLOA`
- **Payload Data:**
```
------WebKitFormBoundaryL4FjR8nkFFrTBLOA
Content-Disposition: form-data; name="tx_form_formframework[buerokratiemelder-892][__state]"

TzozOToiVFlQTzNcQ01TXEZvcm1cRG9tYWluXFJ1bnRpbWVcRm9ybVN0YXRlIjoyOntzOjI1OiIAKgBsYXN0RGlzcGxheWVkUGFnZUluZGV4IjtpOjE7czoxMzoiACoAZm9ybVZhbHVlcyI7YToyOntzOjE5OiJwZXJzb25fYXJ0Y29udGFpbmVyIjtOO3M6MTA6InBlcnNvbl9hcnQiO3M6MTI6IlByaXZhdHBlcnNvbiI7fX0=59d61134b261f5596330f02b8d57681671918cae
------WebKitFormBoundaryL4FjR8nkFFrTBLOA
Content-Disposition: form-data; name="tx_form_formframework[buerokratiemelder-892][__session]"

2cbd00389621c568d8a137f22c6e0bedfd4a656a|2c03c1695233d6451609a412c27d50bc8acd794f
------WebKitFormBoundaryL4FjR8nkFFrTBLOA
Content-Disposition: form-data; name="tx_form_formframework[__trustedProperties]"

{"buerokratiemelder-892":{"bereich":1,"cr-field":1,"B3ikj1WOPKZebo7wE":1,"__currentPage":1}}6cd84c6651f253ba046f48aa0d91183e13cd1036
------WebKitFormBoundaryL4FjR8nkFFrTBLOA
Content-Disposition: form-data; name="tx_form_formframework[buerokratiemelder-892][bereich]"

Arbeit
------WebKitFormBoundaryL4FjR8nkFFrTBLOA
Content-Disposition: form-data; name="tx_form_formframework[buerokratiemelder-892][cr-field]"

MXwxNzg1OTE3OTIyfDlkZjUxNGUyYjY5MDI2YmFlZWZlNjBkMzZiYmExODI1MTkyNTA1MDJ8Mw==
------WebKitFormBoundaryL4FjR8nkFFrTBLOA
Content-Disposition: form-data; name="tx_form_formframework[buerokratiemelder-892][B3ikj1WOPKZebo7wE]"


------WebKitFormBoundaryL4FjR8nkFFrTBLOA
Content-Disposition: form-data; name="tx_form_formframework[buerokratiemelder-892][__currentPage]"

2
------WebKitFormBoundaryL4FjR8nkFFrTBLOA--

```


### Request 7: POST `https://www.etracker.de/api/v6/tracking/webEvents`
- **Resource Type:** `ping`
- **Content-Type:** `multipart/form-data; boundary=----WebKitFormBoundaryD1yHlt1ceqxLHfux`
- **Payload Data:**
```
------WebKitFormBoundaryD1yHlt1ceqxLHfux
Content-Disposition: form-data; name="et"

Knsno9
------WebKitFormBoundaryD1yHlt1ceqxLHfux
Content-Disposition: form-data; name="user_id"

be0d3ce2d05f91020f615f19ef99b76b
------WebKitFormBoundaryD1yHlt1ceqxLHfux
Content-Disposition: form-data; name="userData"

{"productIdentifier":null,"pluginVersion":null,"trcl":"aW","cookie":{"blocked":true,"noResponse":true,"firstParty":"","domain":"einfach-machen.gov.de","cookieLifetime":24}}
------WebKitFormBoundaryD1yHlt1ceqxLHfux
Content-Disposition: form-data; name="events"

[{"eventType":"pageExitBeacon","eventVersion":1,"clientTm":0,"pageExitBeacon":{"object":"","event_sub_type":"first","value":698,"client_info":null,"pagename":"EinfachMachen-Portal | Formular","url":"https://einfach-machen.gov.de/meldeformular?tx_form_formframework%5Baction%5D=perform&tx_form_formframework%5Bcontroller%5D=FormFrontend&cHash=39d6b6fb16f3b5c0ee21cb3cafdac9c1#buerokratiemelder-892","areas":"","page_id":"849957087"}},{"eventType":"pageExitBeacon","eventVersion":1,"clientTm":0,"pageExitBeacon":{"client_info":null,"pagename":"EinfachMachen-Portal | Formular","url":"https://einfach-machen.gov.de/meldeformular?tx_form_formframework%5Baction%5D=perform&tx_form_formframework%5Bcontroller%5D=FormFrontend&cHash=39d6b6fb16f3b5c0ee21cb3cafdac9c1#buerokratiemelder-892","areas":"","page_id":"849957087"}}]
------WebKitFormBoundaryD1yHlt1ceqxLHfux--

```


### Request 8: GET `https://www.etracker.de/cntcc?&&et=Knsno9&v=2026.803.21145&tc=17858499583965&pagename=EinfachMachen-Portal%20%7C%20Formular&ilevel=1&et_source_url=https%3A%2F%2Feinfach-machen.gov.de%2Fmeldeformular%3Ftx_form_formframework%255Baction%255D%3Dperform%26tx_form_formframework%255Bcontroller%255D%3DFormFrontend%26cHash%3D39d6b6fb16f3b5c0ee21cb3cafdac9c1%23buerokratiemelder-892&et_ref=https%3A%2F%2Feinfach-machen.gov.de%2Fmeldeformular%3Ftx_form_formframework%255Baction%255D%3Dperform%26tx_form_formframework%255Bcontroller%255D%3DFormFrontend%26cHash%3D39d6b6fb16f3b5c0ee21cb3cafdac9c1&block_cookies=true&et_bs=1&code_source=%2F%2Fcode.etracker.com%2Fcode%2Fe.js&code_async=true&page_id=849958215&trcl=aW&et_sbscr=0&coid=4ac324ceed795d80468e91bc9638f120&et_cblk=1&et_cd=einfach-machen.gov.de&dh=fXKRgi2FHsQv1ZN52%2Fg6n39tImsnhBaG&clt=24`
- **Resource Type:** `script`
- **Content-Type:** `N/A`
- **Payload Data:**
```
None
```


### Request 9: POST `https://www.etracker.de/api/v6/tracking/webEvents`
- **Resource Type:** `fetch`
- **Content-Type:** `multipart/form-data; boundary=#####etrackerBoundary#####`
- **Payload Data:**
```
--#####etrackerBoundary#####
Content-Disposition: form-data; name="et"

Knsno9
--#####etrackerBoundary#####
Content-Disposition: form-data; name="user_id"

4ac324ceed795d80468e91bc9638f120
--#####etrackerBoundary#####
Content-Disposition: form-data; name="userData"

{"productIdentifier":null,"pluginVersion":null,"tc":17858499590896,"trcl":"aW","cookie":{"blocked":true,"firstParty":"","domain":"einfach-machen.gov.de","cookieLifetime":24,"http":0}}
--#####etrackerBoundary#####
Content-Disposition: form-data; name="events"

[{"eventType":"cssSelectorClick","eventVersion":1,"clientTm":17858499590896,"cssSelectorClick":{"object":"Frage 3","event_sub_type":"","action":"Behördenleistung auswählen","category":"Bürokratiemelder","client_info":null,"pagename":"EinfachMachen-Portal | Formular","url":"https://einfach-machen.gov.de/meldeformular?tx_form_formframework%5Baction%5D=perform&tx_form_formframework%5Bcontroller%5D=FormFrontend&cHash=39d6b6fb16f3b5c0ee21cb3cafdac9c1#buerokratiemelder-892","areas":"","page_id":"849958215"}}]
--#####etrackerBoundary#####--
```


### Request 10: POST `https://einfach-machen.gov.de/meldeformular?tx_form_formframework%5Baction%5D=perform&tx_form_formframework%5Bcontroller%5D=FormFrontend&cHash=39d6b6fb16f3b5c0ee21cb3cafdac9c1`
- **Resource Type:** `document`
- **Content-Type:** `multipart/form-data; boundary=----WebKitFormBoundaryXzbENQOlHnJMLd1k`
- **Payload Data:**
```
------WebKitFormBoundaryXzbENQOlHnJMLd1k
Content-Disposition: form-data; name="tx_form_formframework[buerokratiemelder-892][__state]"

TzozOToiVFlQTzNcQ01TXEZvcm1cRG9tYWluXFJ1bnRpbWVcRm9ybVN0YXRlIjoyOntzOjI1OiIAKgBsYXN0RGlzcGxheWVkUGFnZUluZGV4IjtpOjI7czoxMzoiACoAZm9ybVZhbHVlcyI7YTo1OntzOjE5OiJwZXJzb25fYXJ0Y29udGFpbmVyIjtOO3M6MTA6InBlcnNvbl9hcnQiO3M6MTI6IlByaXZhdHBlcnNvbiI7czoxNjoiYmVyZWljaGNvbnRhaW5lciI7TjtzOjc6ImJlcmVpY2giO3M6NjoiQXJiZWl0IjtzOjE3OiJCM2lrajFXT1BLWmVibzd3RSI7czowOiIiO319d0b81b465408eaf5041d9a1897a2444b1321fd69
------WebKitFormBoundaryXzbENQOlHnJMLd1k
Content-Disposition: form-data; name="tx_form_formframework[buerokratiemelder-892][__session]"

2cbd00389621c568d8a137f22c6e0bedfd4a656a|2c03c1695233d6451609a412c27d50bc8acd794f
------WebKitFormBoundaryXzbENQOlHnJMLd1k
Content-Disposition: form-data; name="tx_form_formframework[__trustedProperties]"

{"buerokratiemelder-892":{"allgemeine_beschreibung":1,"BRX5siIyFSJxo1b":1,"cr-field":1,"__currentPage":1}}d07d880aef0970eb854b5f5f4ed02b1e26673a25
------WebKitFormBoundaryXzbENQOlHnJMLd1k
Content-Disposition: form-data; name="tx_form_formframework[buerokratiemelder-892][allgemeine_beschreibung]"

Automated API Discovery Test: Testing public endpoints and TYPO3 form structure.
------WebKitFormBoundaryXzbENQOlHnJMLd1k
Content-Disposition: form-data; name="tx_form_formframework[buerokratiemelder-892][BRX5siIyFSJxo1b]"


------WebKitFormBoundaryXzbENQOlHnJMLd1k
Content-Disposition: form-data; name="tx_form_formframework[buerokratiemelder-892][cr-field]"

MXwxNzg1OTE3OTIyfDlkZjUxNGUyYjY5MDI2YmFlZWZlNjBkMzZiYmExODI1MTkyNTA1MDJ8Mw==
------WebKitFormBoundaryXzbENQOlHnJMLd1k
Content-Disposition: form-data; name="tx_form_formframework[buerokratiemelder-892][__currentPage]"

3
------WebKitFormBoundaryXzbENQOlHnJMLd1k--

```


### Request 11: POST `https://www.etracker.de/api/v6/tracking/webEvents`
- **Resource Type:** `ping`
- **Content-Type:** `multipart/form-data; boundary=----WebKitFormBoundaryTNA6zNSW9TPpPTLB`
- **Payload Data:**
```
------WebKitFormBoundaryTNA6zNSW9TPpPTLB
Content-Disposition: form-data; name="et"

Knsno9
------WebKitFormBoundaryTNA6zNSW9TPpPTLB
Content-Disposition: form-data; name="user_id"

4ac324ceed795d80468e91bc9638f120
------WebKitFormBoundaryTNA6zNSW9TPpPTLB
Content-Disposition: form-data; name="userData"

{"productIdentifier":null,"pluginVersion":null,"trcl":"aW","cookie":{"blocked":true,"noResponse":true,"firstParty":"","domain":"einfach-machen.gov.de","cookieLifetime":24}}
------WebKitFormBoundaryTNA6zNSW9TPpPTLB
Content-Disposition: form-data; name="events"

[{"eventType":"pageExitBeacon","eventVersion":1,"clientTm":0,"pageExitBeacon":{"object":"","event_sub_type":"first","value":707,"client_info":null,"pagename":"EinfachMachen-Portal | Formular","url":"https://einfach-machen.gov.de/meldeformular?tx_form_formframework%5Baction%5D=perform&tx_form_formframework%5Bcontroller%5D=FormFrontend&cHash=39d6b6fb16f3b5c0ee21cb3cafdac9c1#buerokratiemelder-892","areas":"","page_id":"849958215"}},{"eventType":"pageExitBeacon","eventVersion":1,"clientTm":0,"pageExitBeacon":{"client_info":null,"pagename":"EinfachMachen-Portal | Formular","url":"https://einfach-machen.gov.de/meldeformular?tx_form_formframework%5Baction%5D=perform&tx_form_formframework%5Bcontroller%5D=FormFrontend&cHash=39d6b6fb16f3b5c0ee21cb3cafdac9c1#buerokratiemelder-892","areas":"","page_id":"849958215"}}]
------WebKitFormBoundaryTNA6zNSW9TPpPTLB--

```


### Request 12: GET `https://www.etracker.de/cntcc?&&et=Knsno9&v=2026.803.21145&tc=17858499595430&pagename=EinfachMachen-Portal%20%7C%20Formular&ilevel=1&et_source_url=https%3A%2F%2Feinfach-machen.gov.de%2Fmeldeformular%3Ftx_form_formframework%255Baction%255D%3Dperform%26tx_form_formframework%255Bcontroller%255D%3DFormFrontend%26cHash%3D39d6b6fb16f3b5c0ee21cb3cafdac9c1%23buerokratiemelder-892&et_ref=https%3A%2F%2Feinfach-machen.gov.de%2Fmeldeformular%3Ftx_form_formframework%255Baction%255D%3Dperform%26tx_form_formframework%255Bcontroller%255D%3DFormFrontend%26cHash%3D39d6b6fb16f3b5c0ee21cb3cafdac9c1&block_cookies=true&et_bs=1&code_source=%2F%2Fcode.etracker.com%2Fcode%2Fe.js&code_async=true&page_id=849959359&trcl=aW&et_sbscr=0&coid=7eaec41a4023e621cd702aafd2751f9b&et_cblk=1&et_cd=einfach-machen.gov.de&dh=fXKRgi2FHsQXT4pAeJ910n9tImsnhBaG&clt=24`
- **Resource Type:** `script`
- **Content-Type:** `N/A`
- **Payload Data:**
```
None
```

