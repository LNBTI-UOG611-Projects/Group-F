# Seed scripts (Firebase Emulator only)

These scripts fill the **local emulator** with fictional demo data.
They refuse to run unless the emulator variables are set, so they can never touch live Firestore.

## How to run (Windows PowerShell)

1. Terminal 1, in the `Group-F` folder: `firebase emulators:start`
2. Terminal 2:

```powershell
cd database\seeds
npm install
$env:FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
$env:FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"
$env:DEMO_TEST_PASSWORD="ask-the-leader"   # never commit this
npm run seed
```
3. Check the data at http://127.0.0.1:4000/firestore

The emulator forgets all data when it stops, so run `npm run seed` again each time.

## What each script creates (run order)

| # | Script | npm command | Creates |
|---|---|---|---|
| 1 | `seed-auth.cjs` | `npm run seed:auth` | 4 test logins + `users` profiles (`role`, `status`) |
| 2 | `seed-phase2.cjs` | `npm run seed:phase2` | `roles`, 5 `pestCategories`, `inventoryItems`, `stockMovements`, `leaveRequests` |
| 3 | `seed.cjs` | `npm run seed:base` | `customers`, `employees`, `serviceLocations`, `serviceCategories`, `serviceRequests` |
| 4 | `seed-services.cjs` | `npm run seed:services` | Workflow: inspection → quotation → job → visit → assignment → invoice |

`npm run seed` runs all four in this order and stops if one fails.

## Rules

- Field names follow `docs/DECISIONS.md` B1–B7 (`role`, `status`, camelCase, money in cents).
- Each collection is created by **one** script only. Don't add the same collection to two scripts.
- Inventory stock (`quantityOnHand`) must equal the total of that item's `stockMovements`.
- Seed data may use fixed past timestamps (DECISIONS B5); API code always uses server timestamps.
- All data is fictional. Test accounts: `admin@example.test`, `subadmin@example.test`, `customer@example.test`, `employee@example.test`.