# Playfield (ClubCourt) — Agent Rules & Engineering Directives

This project enforces strict standards for UI design craft, aesthetic quality, and technical accuracy. Any agent working within this repository must adhere to the following rules:

---

## 1. UI/UX Design & Aesthetic Standards (Taste & Impeccable Skills)

All front-end development, styling, layout, and visual components MUST follow the design philosophy and instructions from the installed workspace skills:
- **`taste-skill`** ([`.agents/skills/taste-skill/SKILL.md`](./.agents/skills/taste-skill/SKILL.md)):
  - **No Lazy / Generic AI Aesthetics:** Reject generic blue/purple AI palettes, default bootstrap-style borders, and generic card grids.
  - **Typography & Scale:** Establish distinct, intentional font pairing and hierarchy.
  - **Color & Lighting:** Tailored contrast, deep dark-modes for TV/GOR kiosk screens, subtle gradients, and cohesive tonal palettes.
  - **Micro-Interactions & Motion:** Delightful, purposeful animations (drag-and-drop feedback, score increment pulses, badminton court status transitions).
- **`impeccable`** ([`.agents/skills/impeccable/SKILL.md`](./.agents/skills/impeccable/SKILL.md)):
  - **Craft Floor & Precision:** Pixel-perfect alignment, rigorous spacing tokens, and clean layout geometry.
  - **Component Auditing & Critique:** Continuously self-critique UI against the highest craft standards before presenting to user.

---

## 2. Technical Accuracy & Documentation Lookup (Context7 MCP)

To ensure code is written according to the latest official standards without hallucinated or deprecated APIs:
- **Mandatory Lookup:** Whenever implementing, updating, or debugging any library, framework, or cloud tool (e.g., `Next.js`, `Tailwind CSS`, `@dnd-kit`, `Cloudflare Workers`, `Cloudflare D1`, `Cloudflare R2`, `Lucide React`):
  1. Call MCP `context7` $\rightarrow$ `resolve-library-id` to identify the official documentation identifier.
  2. Call MCP `context7` $\rightarrow$ `query-docs` to fetch the authoritative, up-to-date syntax, code patterns, and hooks.
- Never guess API signatures or use outdated patterns when Context7 has current documentation.

---

## 3. Architecture & Data Integrity Directives

- **Self-Contained Sesi Mabar:** Follow the specifications in [`documentations/SYSTEM_ARCHITECTURE.md`](./documentations/SYSTEM_ARCHITECTURE.md) and [`documentations/ERD.md`](./documentations/ERD.md).
- **Zero-Friction First:** Default to Guest/No-login flow with secret admin keys; optional user login must never block or slow down quick court setup.
