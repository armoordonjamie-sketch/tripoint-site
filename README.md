# TriPoint Site

Website and assets for **TriPoint Diagnostics** — a mobile, appointment-based diagnostics and repair service for modern diesel vans (Mercedes-Benz focus) across Kent and South East London.

**Positioning:** Compliance-first mobile diagnostics & repairs — dealer-level depth, written fix plans, no guesswork.

---

## Repository structure

| Folder | Description |
|--------|-------------|
| **tripoint-frontend** | Main marketing/booking site: React 19 + Vite 7 + TypeScript + Tailwind 4 |
| **business-docs** | Business plan, pricing, and image prompts (internal reference) |
| **python-scripts** | Image conversion (HEIC→JPG) and asset generation for the site |

---

## TriPoint frontend (website)

- **Stack:** React 19, Vite 7, TypeScript, Tailwind CSS 4, React Router, React Hook Form, Zod
- **Run locally:** `cd tripoint-frontend && npm install && npm run dev`
- **Build:** `npm run build`
- **Preview build:** `npm run preview`

See `tripoint-frontend/README.md` for Vite/React details.

---

## Business docs

- `business-plan.md` — Full business plan (mission, market, operations, compliance, KPIs)
- `pricing.md` — Published pricing, zones, and booking policy
- `image-prompt.md` — Prompts used for generating site imagery

---

## Python scripts

- **process_images.py** — Converts HEIC images to JPG (e.g. for web use)
- **generate_images.py** — Uses image descriptions/assignments to generate or assign assets
- **Inputs:** `my-images/` (source HEIC), `image-descriptions.json`, `image-assignments.json`
- **Outputs:** `converted/` (JPGs)

Requires Python 3 and any dependencies listed in the scripts (e.g. `pillow`, `pyheif` if used).

---

## Links

- **GitHub repo:** [armoordonjamie-sketch/tripoint-site](https://github.com/armoordonjamie-sketch/tripoint-site)
