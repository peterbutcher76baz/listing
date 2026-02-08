# RealInfo — Listing Report Generator (RESO-compliant)

**Infosource** (Infosource.com.au) is the company name; **RealInfo** is the registered trading name for all real estate agent software tools, including this suite.

**RESO** = Real Estate Standards Organisation (industry-standard data dictionary). All data is RESO-compliant.

A robust, type-safe web application for Real Estate Agents to generate localized property reports. Built with a "Guardrail-First" architecture to ensure data integrity and minimized AI token consumption.

## 🏗️ Technical Stack
- **Framework:** Next.js (App Router)
- **UI Library:** Material UI (MUI) - Chosen for robust data-grid capabilities.
- **ORM:** Drizzle ORM (PostgreSQL) - TypeScript-first database management.
- **Validation:** Zod - Strictly enforced RESO 2.0 Data Dictionary standards.
- **Localization:** Australian Metric System (SqM) & AUD Currency.

## 🛡️ AI Guardrails & Context Framework
This project uses specialized `.cursor/rules` to maintain architectural integrity:
- **Global Constraints:** Prohibits unauthorized dependency changes or schema modifications.
- **Schema Sentinel:** Protects the RESO 2.0 Zod/Drizzle definitions from accidental "drift."
- **UI Logic Lock:** Ensures business logic and database writes stay out of React components.

## 🇦🇺 Localization Logic
Australian market: areas are **square metres (m²) only**. No square foot references in the UI or property store.
- **Area:** All area fields (living, land) use square metres. Formatting via `src/utils/conversions.ts` (`formatAreaSqm`).
- **Currency:** Standardized `en-AU` formatting for all price fields.

## 🚀 Getting Started
1. **Environment:** Copy `.env.example` to `.env` and add your `DATABASE_URL`.
2. **Install:** `npm install`
3. **Database:** Run `npm run db:push` to sync the schema (or `npm run db:migrate` to apply migrations). This creates the `property_analysis` table required for AI vendor strategies.
4. **Test Guardrails:** `npm run test:guardrails` to verify schema snapshots.

## 📁 Project Structure
- `/src/schemas`: RESO 2.0 Zod validation logic.
- `/src/db`: Drizzle table definitions and connection.
- `/src/utils`: DeepFreeze, conversions, and formatting.
- `/tests`: Snapshot and persistence guardrail tests.
