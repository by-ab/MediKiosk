# MediKiosk
> **Independent project, not affiliated with the Government of India, ABDM, or the Ministry of AYUSH.** This is a personal/academic technical demonstration exploring how such a system could integrate with India's existing digital health infrastructure — it is not an official product, and none of the government systems referenced (ABHA, ABDM, DPDP compliance) are actually connected; see "What's Simulated" below.

An intelligent outpatient intake and clinical triage system that streamlines patient registration, conducts structured symptom interviews using the clinical SOCRATES framework, digitizes medical records with handwriting confidence scoring, and automatically feeds synthesized summaries into a physician's EMR console.

---

## Overview

**MediKiosk** connects the waiting room to the consultation desk through two integrated interfaces:

- **Patient Kiosk (`/`)**: A touch-friendly terminal where patients check in (via ABHA ID or walk-in registration), receive a queue token, undergo an adaptive structured symptom interview, and upload prescriptions/reports.
- **Doctor EMR Console (`/doctor`)**: A physician workstation where doctors select patients from the live queue, review auto-fetched clinical intake summaries, verify low-confidence handwritten extractions, edit notes, and confirm & file records to the EMR.

---

## 5-Step User Flow

1. **Check-In & Token Assignment**: Patient registers via 14-digit ABHA ID or walk-in form, receiving an assigned queue token (e.g., `#TK-21`).
2. **Adaptive SOCRATES Chat**: An intake assistant conducts a 6-turn structured symptom inquiry (Site, Onset, Character, Radiation, Associations, Timing, Exacerbation, Severity) with real-time emergency red-flag detection.
3. **Document Digitization**: Patients upload prior prescriptions or lab reports. Gemini Vision extracts medications and diagnoses while scoring handwriting legibility (flagging ambiguous cursive for physician verification).
4. **Clinical Summary Synthesis**: An automated 6-part clinical intake summary (Chief Complaint, HPI, Past History, Allergies, Family History, ROS) is generated as an editable draft.
5. **Doctor EMR Review & Filing**: The physician opens the patient's card on the doctor console, reviews alerts, makes any needed edits, and clicks "Confirm & File".

---

## What's Simulated in This Demo

- **ABHA OTP Verification (Simulated)**: Accepts any 14-digit format and 6-digit OTP. Production requires institutional ABDM sandbox gateway onboarding.
- **Doctor Station Authentication (Simulated)**: Open workstation view. In production, this sits behind the hospital's existing SSO/LDAP/Active Directory.
- **Data Storage (In-Memory)**: Sessions and queue state are held in memory for demo agility. Production would use PostgreSQL/Prisma with audit logging.
- **"Confirm & File" (Simulated Export)**: Updates internal state. Production would dispatch HL7 FHIR `Composition` bundles to the hospital HIS/EMR.
- **Document Digitization & Vision OCR (REAL)**: Multimodal Gemini Vision extraction and handwriting confidence assessment are fully functional.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Actions, Route Handlers)
- **UI & Styling**: React, Tailwind CSS, Lucide Icons
- **Language**: TypeScript
- **AI Models**: Google Gemini (auto-fallback across `gemini-3.6-flash` / `gemini-flash-latest` / `gemini-3.7-flash`) via `@google/generative-ai`
- **State**: In-memory repository with Next.js global state persistence

---

## Project Structure

```
medikiosk/
├── src/app/          # Next.js pages (Kiosk, Intake wizard, Doctor console) & API route handlers
├── src/components/   # Reusable UI & Kiosk feature components (Chat, Uploader, Summary, Header)
└── src/lib/          # Gemini AI client prompts, in-memory store repository, and TypeScript types
```

---

## Getting Started

### 1. Installation

```bash
git clone https://github.com/by-ab/medikiosk.git
cd medikiosk
npm install
```

### 2. Configuration

Create `.env.local` in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

*(Note: If `GEMINI_API_KEY` is omitted, the app automatically runs on built-in offline clinical fallbacks.)*

### 3. Run Locally

```bash
npm run dev
```

- **Patient Portal**: [http://localhost:3000](http://localhost:3000)
- **Doctor Console**: [http://localhost:3000/doctor](http://localhost:3000/doctor)

To create a production build:

```bash
npm run build
npm run start
```
