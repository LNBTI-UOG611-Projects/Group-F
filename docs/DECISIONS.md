# PCI Colombo – Team Decisions

This file records the decisions every member, and every AI chat helping a member, must follow.
If code disagrees with this file, the code is wrong. To change a decision, open a Pull Request
that edits this file and get the leader's approval first.

Last updated: 24 Nov 2026 by Yasasmi (Group Leader)

---

## A. Architecture (fixed)

| # | Decision |
|---|---|
| A1 | **One shared web app** in `web/` (React + Vite). It contains all four roles: Main Admin, Sub Admin, Customer and Employee. No member creates a second React project. |
| A2 | **One mobile app** in `mobile/` (React Native + Expo, JavaScript), for the **Employee role only**. We test on real phones with the **Expo Go** app. We do **not** use Flutter and we do **not** use Android Studio. |
| A3 | **The web app must be responsive.** Customers, admins and employees must be able to use it on phones, tablets and computers. |
| A4 | **One backend** in `server/` (Node.js + Express, ES modules: `import`/`export`). There is exactly one `server/src/app.js`. Every module adds routes to it. |
| A5 | **One database:** Firebase Cloud Firestore + Firebase Authentication. No MySQL. During development we use the Firebase Emulators (Auth 9099, Firestore 8080, UI 4000). Express runs on 5000, the web app on 5173. |
| A6 | **Only the backend reads and writes business data.** `firestore.rules` stays deny-all for clients. The web and mobile apps call the Express API with the user's Firebase ID token. |
| A7 | **One design system** (see `docs/DESIGN_SYSTEM.md`). Official colours: Deep Burgundy, Muted Gold, Dusty Rose, Soft Gray, Dark Charcoal. |
| A8 | **Node.js 24** on every computer (`node -v` should show v24.x). |

## B. Database conventions (fixed on 23 Nov 2026)

| # | Decision | Reason |
|---|---|---|
| B1 | **User role field = `role`** (a single string): `main_admin`, `sub_admin`, `customer` or `employee`. We do **not** use `roleIds`. | The auth middleware, login page and test accounts already use `role`. One person has one role in this system. |
| B2 | **Active / archived = `status`** (a string): `"active"` or `"archived"` (some collections add their own statuses, e.g. `"pending"`). We do **not** use `isActive` or `active` booleans. | Most of our code and seeds already use `status`. One rule everywhere. |
| B3 | **Never permanently delete business records.** Archive them (`status: "archived"`). | Historical records are needed for jobs, invoices and reports. |
| B4 | **Document IDs:** `users/{uid}` uses the Firebase Auth UID. Everything else uses auto IDs (seed data may use readable IDs like `demo-location`). | Matches `database/schema/collections.md`. |
| B5 | **Field names are camelCase** (`customerId`, `createdAt`). Money is stored as integer cents in LKR (`totalCents`). Every document has `createdAt` and `updatedAt` (server timestamps). Seed scripts (`database/seeds/`) may use fixed past timestamps so demo history looks realistic; API code always uses server timestamps. | Matches the schema draft. |
| B6 | **References between collections are ID strings** (e.g. `customerId: "abc123"`). | Firestore has no foreign keys. |

### B7. Agreed field names for collections already in use

**users/{uid}**: `email`, `displayName`, `role`, `status`, `customerId` (customer only), `employeeId` (employee only), `createdAt`, `updatedAt`

**pestCategories**: `name`, `status`
IDs: `rats`, `cockroaches`, `termites`, `mosquitoes`, `bedbugs`

**serviceCategories**: `name`, `description`, `status`

**inventoryItems**: `name`, `itemType` (`chemical` | `equipment` | `other_consumable`), `sku`, `unit`, `quantityOnHand`, `quantityReserved`, `reorderLevel`, `pestCategoryIds` (array), `status`, `approvalStatus` (chemicals only, starts as `pending_review`), `createdAt`, `updatedAt`
New items start with 0 stock. Stock only changes through `stockMovements`.

**stockMovements**: `inventoryItemId`, `movementType`, `quantity`, `notes`, `recordedByUid`, `createdAt`

**serviceLocations**: `customerId`, `name`, `addressLine1`, `city`, `contactPerson`, `contactNumber`, `notes`, `status`, `createdAt`, `updatedAt`

**serviceRequests**: `customerId`, `locationId`, `serviceCategoryId`, `pestCategoryIds`, `description`, `priority`, `status`, `createdAt`, `updatedAt`

Other collections follow `database/schema/collections.md`. If you need a new collection or field, add it to this section in your Pull Request so everyone sees it.

## C. API conventions (fixed)

| # | Decision |
|---|---|
| C1 | All routes start with `/api/`. Plural nouns: `/api/inventory`, `/api/customers/locations`, `/api/employee/assignments`. |
| C2 | **Every response uses the same shape.** Success: `{ "success": true, "message": "...", "data": ... }`. Error: `{ "success": false, "message": "..." }`. |
| C3 | Status codes: 200 OK, 201 created, 400 bad input, 401 not logged in, 403 wrong role, 404 not found, 409 conflict (e.g. already archived), 500 server error. |
| C4 | **Protected routes** use `verifyToken` and then `authorizeRoles("role_name")` from `server/src/middleware/auth.js`. Never trust a role sent by the frontend. |
| C5 | Each module owns its own route and service files: `server/src/routes/<module>.routes.js` and `server/src/services/<module>.service.js`. |
| C6 | Updates use `PATCH`. Archiving uses `PATCH /:id/archive`. We do not use `DELETE` for business records. |

## D. Git and integration (fixed)

| # | Decision |
|---|---|
| D1 | Each member works only on their own branch. `main` only receives **working, tested** features through Pull Requests. |
| D2 | We merge to `main` **one milestone at a time**, never everything at once (see `docs/PROJECT_STATUS.md`). |
| D3 | Pull Requests are merged with **"Create a merge commit"** (not squash), so every member's daily commits stay visible in `main`. |
| D4 | After anything is merged to `main`, every member updates their branch: `git fetch origin` then `git merge origin/main`. |
| D5 | Shared files (listed in `docs/TEAM_WORKFLOW.md`) are only changed through a Pull Request that the leader reviews. |
| D6 | Never commit `.env` files, passwords, private keys, `node_modules/`, IDE folders (`.idea/`, `.vscode/`) or log files. |

## E. Superseded (do not use)

- **Flutter / Dart / Android Studio** for the mobile app → replaced by React Native + Expo Go.
- **MySQL** → replaced by Firestore. `docs/requirements/main-admin-database.md` describes MySQL tables and is kept only as background for the entities. Do not build from it.
- **`roleIds`** → replaced by `role` (B1).
- **`isActive` / `active` booleans** → replaced by `status` (B2).
- **The green login colours (#1b5e20)** → replaced by the official palette in `docs/DESIGN_SYSTEM.md`.
