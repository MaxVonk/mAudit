# mAudit — Microsoft 365 Säkerhetsbesiktning & NIS2-analys (CSPM)

mAudit är en automatiserad säkerhetsbesiktningsplattform för Microsoft 365 och Entra ID. Plattformen granskar en organisations molnmiljö enligt CIS Benchmarks och mappar brister mot **NIS2 (Art. 21)** och **GDPR (Art. 32)**, med konkreta åtgärdsvägar i Microsoft Admin Center och PowerShell.

---

## 🚀 Snabbstart

### 1. Förutsättningar
- Node.js 18+ (rekommenderat 20+)
- npm eller pnpm

### 2. Kör lokalt
```bash
# 1. Installera beroenden
npm install

# 2. Generera databasen (SQLite ingår för zero-config lokal körning)
npx prisma db push

# 3. Starta utvecklingsservern
npm run dev
```

Öppna webbläsaren på [http://localhost:3000](http://localhost:3000).

---

## 🎯 Kärnfunktioner

1. **Nordisk minimalistisk UX & Pre-Consent Trust:**
   - 100% skrivskyddad (`*.Read.*`) analys utan lösenordsåtkomst eller innehållsläsning (mejl/filer).
   - Pedagogisk Pre-Consent-sida (`/connect`) som förklarar de 5 begärda rättigheterna och enkel avregistrering.
2. **Kanonisk poängmotor & 90/70 betygströsklar:**
   - 90–100: **Utmärkt säkerhetsläge** (Grön)
   - 70–89: **Godtagbart med åtgärdsbehov** (Gul/Orange)
   - 0–69: **Kritiska sårbarheter identifierade** (Röd)
   - Neutral hantering av `NOT_APPLICABLE` vid saknade premiumlicenser (ingen orättvis poängstraff).
3. **1-Klicks demoläge & Diffing ("Före och Efter"):**
   - Testa direkt utan Microsoft-konto med realistiska demoprofiler (t.ex. *Nordic Retail AB*).
   - "Simulera om-skanning"-knapp demonstrerar scan diffing med poängökning och åtgärdade brister.
4. **Zero-Retention Dataradering:**
   - Rapporter sparas krypterat i 14 dagar.
   - En prominent "Radera data nu"-knapp på rapporten rensar omedelbart all data permanent ur databasen.
5. **Utskriftsoptimerad PDF-export:**
   - Ren och professionell layout vid Ctrl+P / `window.print()`.

---

## 🧪 Köra verifieringstester

Kör de inbyggda testerna för poängmotorn, licensfallback, diffing och databasradering:
```bash
npx tsx tests/engine-verification.ts
```

---

## 🔐 Koppla till Microsoft Entra ID (Produktion)

Konfigurera en Multi-Tenant App Registration i [Microsoft Entra Admin Center](https://entra.microsoft.com):
- **Application Type:** Multi-Tenant Web App
- **Redirect URI:** `https://er-doman.se/api/auth/callback`
- **Application Permissions (Read-Only):**
  - `Directory.Read.All`
  - `Organization.Read.All`
  - `Policy.Read.All`
  - `Reports.Read.All`
  - `RoleManagement.Read.Directory`

Uppdatera `.env`:
```env
AZURE_CLIENT_ID="ditt-app-client-id"
AZURE_CLIENT_SECRET="ditt-app-client-secret"
AZURE_REDIRECT_URI="http://localhost:3000/api/auth/callback"
```
