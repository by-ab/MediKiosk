# MediKiosk

> Independent personal project — not affiliated with the Government of India, ABDM, or the Ministry of AYUSH. This is a technical demo exploring how a system like this could plug into India's digital health infrastructure. None of the actual government systems (ABHA, ABDM, DPDP compliance) are really connected — see the "What's Simulated" section below for the honest breakdown.

MediKiosk is a patient intake system built around one idea: by the time a patient sits down in front of a doctor, most of their history should already be captured. Instead of a doctor spending their first few minutes asking the same questions every visit, the patient works through an adaptive AI interview and uploads any prior prescriptions or reports beforehand — and a structured summary is waiting on the doctor's screen the moment they're called in.

There are two sides to it:

- **Patient Kiosk** (`/`) — where patients check in with an ABHA ID (or register as a walk-in), get a queue token, go through a guided symptom interview, and upload documents.
- **Doctor Console** (`/doctor`) — where a physician pulls up whichever patient's been called, reads the auto-generated summary, flags anything that needs a closer look, and confirms it into the record.

## How a visit actually flows

1. **Check-in** — patient enters their ABHA ID (or fills a short walk-in form) and gets a token, like `#TK-21`.
2. **The interview** — an AI-guided chat walks through the SOCRATES framework (site, onset, character, radiation, associations, timing, severity), and immediately flags anything that looks urgent.
3. **Uploading documents** — prior prescriptions or lab reports get scanned with Gemini's vision model, which pulls out medications and diagnoses. If the handwriting's too messy to read confidently, it says so instead of guessing.
4. **Summary generation** — everything from the interview and the documents gets pulled into one clinical summary (chief complaint, history, allergies, family history, and so on), ready for the doctor to review.
5. **Doctor review** — the physician opens the patient's card, checks anything flagged, edits if needed, and files it.

## What's real and what's simulated

Being upfront about this, since a couple of things here are genuinely working and a couple are stand-ins for systems that don't exist at demo scale yet:

- **ABHA login** is simulated — it'll accept any properly-formatted 14-digit ID and 6-digit OTP. A real integration would need onboarding through ABDM's actual sandbox, which isn't something available outside an institutional setting.
- **Doctor console login** doesn't exist here on purpose — in an actual hospital, this would sit behind whatever authentication their EMR already uses. Not something this project needs to rebuild.
- **Data storage** is in-memory, so it resets if the server restarts. A real version would need an actual database.
- **"Confirm & File"** just updates local state right now — a production version would send this to the hospital's system as a proper FHIR record.
- **Document OCR is real** — the Gemini vision calls and the confidence scoring on handwriting are fully functional, not mocked.

## Built with

Next.js (App Router) with TypeScript and Tailwind, Google's Gemini API for both the conversational interview and the document OCR (it tries a few model versions in order in case one's unavailable), and an in-memory store standing in for a real database.

## Project layout

```
src/app/          — pages and API routes (kiosk, intake flow, doctor console)
src/components/   — the UI pieces (chat, uploader, summary view, header)
src/lib/          — Gemini prompts, the in-memory store, and shared types
```

## Running it locally

```bash
git clone https://github.com/by-ab/medikiosk.git
cd medikiosk
npm install
```

Add a `.env.local` file with your own key:
```
GEMINI_API_KEY=your_key_here
```
(If you skip this, the app still runs — it just falls back to a simpler built-in question flow instead of calling Gemini.)

Then:
```bash
npm run dev
```

Patient side is at `localhost:3000`, doctor console at `localhost:3000/doctor`. 

To create a production build:

```bash
npm run build
npm run start
```
