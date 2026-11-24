# PCI Colombo – Project Status

**Read this first.** It says what exists, what is broken, who fixes what, and what goes into
`main` next. The leader updates it after every merge to `main`.

Last verified against GitHub: **23 Nov 2026** (by Yasasmi, with an AI-assisted audit)

---

## 1. Where the code is today

| Branch | Owner | What it contains | Merged to main? |
|---|---|---|---|
| `main` | Shared | Empty folder skeleton + README (+ these docs) | – |
| `feature/main-admin` | Yasasmi | Firebase config, emulator setup, schema draft (`database/schema/collections.md`), 4 seed scripts, inventory API (create/read/update/archive) | No (draft PR #1) |
| `feature/sub-admin` | Sunera | Express server, Firebase Admin, auth middleware (`verifyToken`, `authorizeRoles`), `/api/auth/me`, React/Vite web app with a working Firebase login page | No |
| `feature/customer` | Dulni | A **second** React/Vite app with Login (placeholder), Customer Dashboard, Profile, Service Locations (React state only, no database) | No |
| `feature/employee` | Sasindi | Flutter starter template (to be removed, we use React Native + Expo) | No |

## 2. Problems we fix **before** building new features

| # | Problem | Owner | Fixed in |
|---|---|---|---|
| P1 | `.idea/` IDE files are committed on `feature/sub-admin` | Sunera | M1 |
| P2 | Auth routes reply `{ message, user }`, not our standard `{ success, message, data }` | Sunera | M1 |
| P3 | `.gitignore` files differ between branches (some miss `.env`, `.agents/`, `skills-lock.json`, `.idea/`) | Sunera (M1), Yasasmi (M2) | M1/M2 |
| P4 | Seed scripts disagree: `role` vs `roleIds`, `status` vs `isActive`/`active`, `itemName`/`availableQuantity` vs `name`/`quantityOnHand` | Yasasmi | M2 |
| P5 | Inventory service checks pest categories with `active === true`, but categories are stored with `status: "active"`, so creating items with categories always fails | Yasasmi | M5 |
| P6 | Inventory files use CommonJS (`require`) but the server uses ES modules (`import`) | Yasasmi | M5 |
| P7 | Inventory routes are not connected to `app.js` and have never been tested | Yasasmi | M5 |
| P8 | **Two separate React apps** (`web/` on sub-admin and on customer) | Yasasmi (M3), Dulni (M6) | M3/M6 |
| P9 | No shared colours/components; login pages use old green colours | Yasasmi (M3), Sunera (M4) | M3/M4 |
| P10 | Customer locations are not saved anywhere (React state only) and use different field names | Dulni | M6 + Phase 1 |
| P11 | Mobile app is a Flutter template and does not compile | Sasindi | M7 |
| P12 | `docs/requirements/main-admin-database.md` describes MySQL | Yasasmi | M2 (label as superseded) |

## 3. Milestones into `main` (one at a time)

A milestone is merged **only when its "Done when" list is fully checked**. Milestones without a
dependency can be built at the same time.

| # | Milestone | Owner | Needs first | Done when |
|---|---|---|---|---|
| **M0** | Team docs (this file, DECISIONS, DESIGN_SYSTEM, TEAM_WORKFLOW) | Yasasmi | – | Docs on `main`; every member has read them |
| **M1** | Authentication foundation (backend + web app shell + login) | Sunera | M0 | Server starts; `/api/health` works; login with the 4 emulator test accounts works; `/api/auth/me` returns the right `role`; wrong role gets 403; no `.idea/`; responses use `{success, message, data}` |
| **M2** | Database foundation (aligned seeds + schema docs) | Yasasmi | M1 | All seeds follow `docs/DECISIONS.md` B1–B7; seeds run cleanly on the emulator; Emulator UI shows correct data; MySQL doc labelled superseded |
| **M3** | Design system + shared layout + role routing | Yasasmi | M1 | `variables.css`/`global.css` exist; Sidebar, Header, DashboardLayout work and are responsive; each role has a placeholder dashboard route |
| **M4** | Login connected to roles + restyled | Sunera | M3 | Login uses the official colours; after login the user goes to their role's dashboard; logged-out users can't open dashboards; logout works |
| **M5** | Inventory API working | Yasasmi | M2 | ES modules; mounted at `/api/inventory`; tested with Postman + emulator (create, list, update, archive, invalid category, archived edit = 409, reserved archive = 409, customer token = 403) |
| **M6** | Customer pages inside the shared web app | Dulni | M3, M4 | Dulni's Dashboard, Profile and Locations pages live in `web/src/pages/customer/`, use the shared layout and colours, and the second React app is gone |
| **M7** | Employee mobile app (Expo) running | Sasindi | M0 | Flutter removed; Expo app in `mobile/` opens in Expo Go; uses the official colours; a placeholder login screen |

Proposed order: M0 → M1 → (M2, M3 and M7 in parallel) → M4 → (M5, M6).

## 4. After the fixes – Phase 1 features (each member owns full CRUD)

The university requires substantial CRUD, and every member must do frontend **and** backend.

| Member | Backend (Express + Firestore) | Frontend |
|---|---|---|
| Yasasmi – Main Admin | Inventory, stock movements, users & roles, categories, leave approval, safety documents | Main Admin pages (web) |
| Sunera – Sub Admin | Request review, inspections, quotations, jobs, scheduling, employee assignments, resource allocation | Sub Admin pages (web) |
| Dulni – Customer | Locations, service requests, quotation accept/reject, invoices/payments view, feedback | Customer pages (web) |
| Sasindi – Employee | Assignments, inspection findings, service reports, safety checklists, leave requests | Employee pages (web) **and** Expo mobile screens |

## 5. Status per member

| Member | Done (committed) | Next |
|---|---|---|
| Yasasmi | Schema draft, Firebase setup, seeds, inventory API (not yet tested) | M0, then M2, M3, M5 |
| Sunera | Express + auth foundation, web app + Firebase login | M1, then M4 |
| Dulni | 4 customer UI pages (no backend yet) | Setup + plan the locations API; M6 after M3/M4 |
| Sasindi | Flutter template (to be removed) | M7 |

## 6. Merge log

| Date | Milestone | PR | Merged by |
|---|---|---|---|
| | | | |
