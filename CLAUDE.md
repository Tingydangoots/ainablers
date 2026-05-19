# AINABLERS — AI Adoption Tracker

## Project Purpose
Internal tool for CM (Change Management) team to track, validate, and visualise AI learning and adoption progress. Surfaces contributions, assigns personas, and runs a 4-eye approval workflow.

## Personas (core domain concept)
| Persona | Definition |
|---|---|
| **Adopter** | Basic adoption — Copilot, AI meeting tools, mail drafting |
| **Transformer** | AI-driven productivity on deliverables — user stories, code gen, analysis |
| **Innovator** | Built agentic AI tools / workflow apps delivering business value |

Persona is NOT self-selected. It is derived from validator-approved contributions and their ratings.

## Core Features
1. **Contribution Form** — team member submits: activity description, area (Deliverable / Productivity / Innovation / Other), benefit realised, impact level, client or Capgemini scope
2. **4-Eye Validation Workflow** — validator reviews, approves/rejects, assigns rating (1–5). Rating aggregates into persona score
3. **Dashboard** — per-person persona badge, contribution history, team-level leaderboard, area breakdown charts
4. **Tracker** — tabular view with status (Pending / Approved / Rejected), filters by person/area/date

## Stack
- **Framework**: Next.js 14+ (App Router, TypeScript)
- **UI**: Tailwind CSS + shadcn/ui components
- **Database**: Prisma ORM + SQLite (dev) → Postgres (prod-ready schema)
- **Auth**: NextAuth.js (credentials provider for simplicity; swap to SSO later)
- **Charts**: Recharts
- **Validation**: Zod + React Hook Form

## Conventions
- All components in `src/components/`, colocated with their types
- API routes under `src/app/api/`
- Prisma schema at `prisma/schema.prisma`
- Use server actions where possible, API routes for complex mutations
- Tailwind only — no inline styles, no CSS modules
- shadcn/ui component imports from `@/components/ui/`
- TypeScript strict mode — no `any`
- Zod schemas colocated with forms in `src/lib/schemas/`

## Persona Scoring Logic
- Each approved contribution carries a validator rating (1–5)
- Weighted by area: Innovation > Deliverable > Productivity
- Score thresholds: Adopter (< 20), Transformer (20–49), Innovator (50+)
- Score resets/recalculates on approval/rejection changes

## Roles
- **Member** — can submit contributions, view own dashboard
- **Validator** — can approve/reject/rate all contributions, view team dashboard
- **Admin** — can manage users and roles

## Do Not
- Do not use `any` in TypeScript
- Do not use CSS modules or inline styles
- Do not skip Zod validation on any form or API input
- Do not commit `.env` or `.env.local`
- Do not use `git add -A` blindly — stage specific files

## Key Files
- `prisma/schema.prisma` — source of truth for data model
- `src/lib/auth.ts` — NextAuth config
- `src/lib/db.ts` — Prisma client singleton
- `src/lib/schemas/` — all Zod schemas
