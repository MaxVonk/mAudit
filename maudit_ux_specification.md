# UX/UI & Frontend Specification: mAudit

Denna specifikation definierar designsystem, användarresor, sidlayouter och komponentarkitektur för **mAudit** – en automatiserad säkerhetsbesiktningsplattform för Microsoft 365.

---

## 1. Varumärkesidentitet & Designfilosofi

Säkerhetsverktyg lider ofta av att antingen se för komplexa ut (Enterprise/SIEM-stil) eller att upplevas som opålitliga ("phishing-liknande"). **mAudit** ska förmedla **nordisk minimalism, teknisk precision och absolut transparens**.

### 1.1 Kärnvärden
- **Extrem transparens:** Inga dolda behörigheter. Kunden ska alltid förstå *varför* en rättighet begärs och hur de raderar appen.
- **Icke-alarmistisk:** Vi säljer inte genom panik ("DU ÄR HACKAD!"), utan genom lugn fakta och handfasta åtgärder ("Här är 3 enkla justeringar som höjer er säkerhet").
- **Klick-till-handling:** Varje brist presenteras tillsammans med en direkt klickväg i adminportalen eller ett färdigt PowerShell-kommando.

### 1.2 Design Tokens & Färgpalett (Tailwind CSS)

```css
/* Primära färger */
--background: #0B0F19;         /* Djup nattblå / slate bakgrund */
--surface: #111827;            /* Kort- och panelbakgrund */
--surface-subtle: #1F2937;     /* Hover-tillstånd, sekundära block */
--border: #374151;             /* Subtila skiljelinjer */

/* Accent & Brand */
--brand-primary: #2563EB;      /* mAudit Blå (Action/CTA) */
--brand-accent: #06B6D4;       /* Cyan highlight (Glows, accenter) */
--brand-gradient: linear-gradient(135deg, #2563EB 0%, #06B6D4 100%);

/* Statusfärger (Säkerhetsbetyg) */
--status-pass: #10B981;        /* Grön (90-100 / Godkänd) */
--status-warning: #F59E0B;     /* Amber (70-89 / Varning) */
--status-fail: #EF4444;        /* Röd (<70 / Kritisk brist) */
--status-neutral: #64748B;     /* Skiffergrå (Licens krävs / Info) */

/* Text */
--text-primary: #F9FAFB;       /* Rubriker och primär text */
--text-secondary: #9CA3AF;     /* Förklarande brödtext */
--text-muted: #6B7280;         /* Metadata, disclaimers */
```

### 1.3 Typografi & Ikoner
- **Typsnitt:** `Inter` eller `Geist Sans` för gränssnitt; `JetBrains Mono` eller `Geist Mono` för PowerShell-kommandon, DNS-poster och tekniska värden.
- **Ikonbibliotek:** `lucide-react` (enhetlig linjetjocklek: `strokeWidth={1.75}`).

---

## 2. Användarresa (User Journey)

```
[1. Startsida (/)] 
      │ 
      ▼ (Klick: "Starta besiktning")
[2. Förtroende & Pre-Consent (/connect)] 
      │ 
      ▼ (Omdirigering till login.microsoftonline.com)
[3. Microsoft Admin Consent] 
      │ 
      ▼ (Callback med token)
[4. Live Skanningsvy (/scan/[id])] 
      │ 
      ▼ (Färdigställd analys ~45s)
[5. Interaktiv Besiktningsrapport (/report/[token])]
```

---

## 3. Detaljerade Sidlayouter & Komponenter

### 3.1 Startsida (`/`)

#### A. Hero-sektion
- **Badge:** `[Nyhet] Automatiserad analys enligt NIS2 & CIS Benchmark`
- **H1:** *"Besiktiga er Microsoft 365-miljö på 60 sekunder"*
- **Underrubrik:** *"Få en oberoende hälsokontroll av er molnsäkerhet. Inga lösenord delas, inga inställningar ändras, och ni tar enkelt bort behörigheten direkt efteråt."*
- **Huvud-CTA:**
  - Inmatningsfält: Företagsnamn eller domän (valfritt för rapportens omslag).
  - Stor knapp: `Starta gratis säkerhetskoll` (med Microsoft-logotyp och hover-glow).
- **Trygghetsikoner direkt under CTA:**
  - `ShieldCheck` Endast läsrättigheter (`*.Read.*`)
  - `KeyRound` Noll lösenordsåtkomst
  - `Trash2` Raderas automatiskt efter 14 dagar

#### B. Sammanfattning av besiktningsområden
Ett interaktivt rutnät (2x3 kort) som visar vad mAudit kontrollerar:
1. **Identitet & MFA:** Kartläggning av multifaktor och legacy auth.
2. **Globala Administratörer:** Behörighetsläckor och odedikerade adminkonton.
3. **Villkorsstyrd Åtkomst (Conditional Access):** Efterlevnad av nollförtroendeprinciper.
4. **E-posthygien & DNS:** Djupkontroll av SPF, DKIM och DMARC.
5. **Fildelning & Samarbete:** Gästrättigheter i Teams, OneDrive och SharePoint.
6. **Applikationer & Behörigheter:** Tredjepartsappar och farliga OAuth-godkännanden.

#### C. NIS2- & GDPR-puff
Ett sektionsblock som visar hur mAudit automatiserar rapporteringsunderlag för ledning och IT-ansvariga i ljuset av EU:s cybersäkerhetskrav.

---

### 3.2 Förtroende- och Pre-Consent-sida (`/connect`)

Detta är **den mest kritiska konverteringssidan**. Här övervinner vi tvekan hos IT-chefen innan de skickas till Microsoft.

#### Layout
Ett centrerat fönster (max-w-2xl) med en tydlig checklista:

1. **Rubrik:** *"Hur mAudit ansluter till er organisation"*
2. **Kortfattad princip:**
   - **Vad vi gör:** Läser konfigurationer och sammanställer aggregerad statistik.
   - **Vad vi INTE gör:** Vi kan inte läsa mejl, filer, chattar eller ändra en enda inställning.
3. **Transparensruta (Klickbar lista):**
   - Visa de 5 behörigheterna som kommer efterfrågas på Microsofts ruta, översatta till begriplig svenska:
     - `Directory.Read.All`: Identifiera aktiva adminkonton och grundlicenser.
     - `Policy.Read.All`: Se om säkerhetspolicyer är påslagna.
     - `Reports.Read.All`: Se hur många procent av användarna som har MFA aktiverat.
4. **Avregistreringslöfte (Callout box):**
   - *"Så tar du bort mAudit efteråt: Gå till portal.azure.com > Företagsappar > mAudit > Ta bort. Det tar 10 sekunder."*
5. **Godkännandeknapp:** `Fortsätt till Microsofts säkra inloggning →`

---

### 3.3 Live Skanningsvy (`/scan/[id]`)

En minimalistisk laddningsvy med live-feedback som gör att väntetiden (30–60 sekunder) känns snabb och professionell.

#### Komponenter
- **Cirkulär Progress-indikator** (0% -> 100%).
- **Aktivitetslogg i realtid** (visar vad som körs just nu med subtil fade-in):
  - `[✓] Verifierar licenser och tenant-förmågor...`
  - `[✓] Slår upp SPF, DKIM och DMARC mot publika DNS-servrar...`
  - `[✓] Granskar administratörsroller och MFA-efterlevnad...`
  - `[●] Kontrollerar Conditional Access och blockering av legacy auth...`
  - `[ ] Sammanställer besiktningsprotokoll...`

---

### 3.4 Besiktningsrapporten (`/report/[token]`)

Rapportsidan är verktygets huvudleverans. Den ska vara optimerad för både skärmläsning och utskrift (PDF).

#### A. Rapportens Header
- Företagsnamn & Skanningsdatum (t.ex. `Acme AB — Besiktigad 24 maj 2026`).
- **Diff-badge (om tidigare skanning finns):** `+18 poäng sedan senaste skanningen (12 maj)`.
- Snabbknappar i toppen:
  - `Ladda ner PDF`
  - `Dela länk (giltig i 14 dgr)`
  - `Radera data nu` (Röd diskret text med bekräftelsemodal).

#### B. Executive Score Card
- **Säkerhetsindex (Gauge Chart):** Stor siffra 0–100.
  - 90–100: **Utmärkt** (Grön)
  - 70–89: **Godtagbart med åtgärdsbehov** (Gul/Orange)
  - 0–69: **Kritiska sårbarheter identifierade** (Röd)
- **3 snabba nyckeltal (Grid):**
  - MFA-täckning: `84% av användarna`
  - Globala administratörer: `5 st (Rekommenderat: 2–4)`
  - E-postskydd: `DMARC saknas`
- **Regelefterlevnad:**
  - `NIS2 Artikel 21:` 3 av 5 kontroller uppfyllda
  - `GDPR Artikel 32:` 4 av 4 kontroller uppfyllda

#### C. Åtgärdslista & Kategorier (Filtrerbart gränssnitt)
Flikar: `Alla (15)`, `Kritiska (2)`, `Varningar (3)`, `Godkända (9)`, `Licens saknas (1)`.

Varje brist visas som ett fällbart dragspelskort (Accordion):
- **Korthuvud:**
  - Statusikon (`CheckCircle2` / `AlertTriangle` / `XCircle`)
  - Titel: t.ex. *"Extern automatisk vidarebefordran är inte blockerad"*
  - Kategori & Allvarlighetsgrad-badge (`Kritisk`, `Hög`, `Medel`)
  - Efterlevnads-taggar: `[NIS2 Art 21.2.e]`
- **Utfällt innehåll:**
  - **Varför detta är en risk:** Pedagogisk förklaring (2 meningar).
  - **Nuvarande värde:** `Tillåten för alla användare` (Röd text).
  - **Rekommenderat läge:** `Blockerad på organisationsnivå` (Grön text).
  - **Åtgärda via Microsoft 365 Admin Center:**
    - Steg-för-steg-klickväg: `Exchange Admin Center > E-postflöde > Fjärrdomäner > Redigera standard > Avmarkera 'Tillåt automatisk vidarebefordran'`.
  - **Åtgärda via PowerShell:**
    - Kodblock med "Kopiera"-knapp:
      ```powershell
      Set-RemoteDomain Default -AutoForwardEnabled $false
      ```

---

## 4. UI-komponenter & Kodmallar (React / Tailwind)

### 4.1 Förtroendekort för Pre-Consent (React-exempel)

```tsx
import { ShieldCheck, Lock, Eye, Trash2 } from "lucide-react";

export function TrustCard() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-100">100% skrivskyddad analys</h3>
          <p className="text-xs text-slate-400">Inga ändringar kan göras i er miljö</p>
        </div>
      </div>

      <ul className="space-y-3 text-sm text-slate-300">
        <li className="flex items-start gap-2.5">
          <Eye className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <span><strong>Enbart läsrättigheter:</strong> mAudit begär uteslutande <code>.Read</code>-access via Microsofts officiella API:er.</span>
        </li>
        <li className="flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <span><strong>Noll åtkomst till innehåll:</strong> Vi kan varken läsa inkorgar, dokument, lösenord eller personliga filer.</span>
        </li>
        <li className="flex items-start gap-2.5">
          <Trash2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <span><strong>Enkel avregistrering:</strong> Du kan ta bort mAudit under <em>Företagsappar</em> i er Microsoft-portal när rapporten är klar.</span>
        </li>
      </ul>
    </div>
  );
}
```

### 4.2 Score Gauge & Resultatkomponent

```tsx
export function ScoreBadge({ score }: { score: number }) {
  const getStatus = (s: number) => {
    if (s >= 85) return { color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", label: "Mycket bra säkerhetsläge" };
    if (s >= 65) return { color: "text-amber-400 border-amber-500/30 bg-amber-500/10", label: "Åtgärder rekommenderas" };
    return { color: "text-rose-400 border-rose-500/30 bg-rose-500/10", label: "Kritiska risker upptäckta" };
  };

  const status = getStatus(score);

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-slate-800 bg-slate-900/80 text-center">
      <div className="relative flex items-center justify-center mb-3">
        <span className="text-6xl font-extrabold tracking-tight text-white">{score}</span>
        <span className="text-2xl text-slate-500 font-medium ml-1">/100</span>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
        {status.label}
      </div>
    </div>
  );
}
```

---

## 5. Riktlinjer för Text & Tonalitet (Microcopy)

- Använd etablerade svenska termer för M365 (t.ex. *Villkorsstyrd åtkomst*, *Global administratör*, *Säkerhetsstandarder*), men behåll engelska namn i parentes om de hjälper administratören att hitta rätt i Microsoft Entra Admin Center.
- Undvik skrämselpropaganda. Ersätt:
  - ❌ *"ER DOMÄN KAN LÄTTAST UTNYTTJAS AV HACKARE!"*
  - med
  - ✔️ *"DMARC saknas: Detta innebär att utomstående kan skicka e-post i ert namn utan att mottagaren varnas. Lägg till en DMARC-post i era DNS-inställningar för att skydda ert varumärke."*
- Tydlig information om dataradering:
  - *"Rapporten och tillhörande analysdata sparas krypterat i 14 dagar så att ni hinner åtgärda bristerna, och raderas därefter permanent."*