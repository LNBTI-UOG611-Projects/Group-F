# PCI Colombo – Team Workflow Guide

This is how we work every day. It is written for beginners, so follow the steps exactly.
Commands are for **Windows PowerShell** inside VS Code (Terminal → New Terminal).

---

## 0. Why this matters for our marks

- **62% of the marks are individual.** That covers Git contribution (7% interim + 10% final),
  demonstration (15%), and **Code Evaluation & Modification (25%)**.
- "Code Evaluation & Modification" means the examiners may ask **you** to explain or change **your
  own code** on the spot. Commit only code you understand, even when an AI helped you write it.
  Ask the AI to explain anything you don't understand **before** you commit it.
- Contributions are checked on GitHub. A commit only counts for you if **your Git email is listed
  and verified on your GitHub account** (a personal email is fine – approved by the lecturer). See step 1.2.

## 1. One-time setup (every member)

### 1.1 Install
| Tool | Check it works | Notes |
|---|---|---|
| Git | `git --version` | |
| Node.js 24 LTS | `node -v` → v24.x | Download from nodejs.org |
| VS Code | – | |
| Firebase CLI | `firebase --version` | `npm install -g firebase-tools` |
| Java 21 or newer | `java -version` | Needed by the Firestore emulator |
| Postman | – | To test APIs (backend work) |
| Expo Go app on your phone | – | **Sasindi only** (others optional) |

### 1.2 Make sure your commits count
```powershell
git config --global user.name "Your Full Name"
git config --global user.email "the.email@on-your-github-account.com"
git config --show-origin user.email   # check: shows the email AND where it is set
```
On GitHub, open **Settings → Emails** and make sure that **exact** email is listed and verified.
If the check shows `.git/config`, that folder has its own email that wins over the global one.

### 1.3 Get the project and your branch
```powershell
git clone https://github.com/LNBTI-UOG611-Projects/Group-F.git
cd Group-F
git switch feature/<your-branch>     # main-admin / sub-admin / customer / employee
git merge origin/main                # bring in the latest shared work
```

## 2. Your daily routine

**Start of the day**
```powershell
git switch feature/<your-branch>
git status                 # must say "working tree clean" – if not, ask before continuing
git fetch origin           # download news from GitHub (does not change your files)
git merge origin/main      # bring in anything merged to main
```

**While working:** finish one small piece, test it, then commit it.
```powershell
git status                          # see what changed
git diff                            # read your own changes
git add path/to/file1 path/to/file2 # add ONLY your files – never "git add ."
git commit -m "feat(customer): add location form validation"
```

**End of the day** (always push, even for small progress)
```powershell
git push origin feature/<your-branch>
```

### Commit rules
- Commit **every day you work**, in small meaningful steps (1–5 commits a day is normal).
- One commit = one logical change. Do not save everything into one huge commit on Friday.
- **No fake commits** (changing a space, empty commits). Examiners can see what changed.
- Message format: `type(area): what you did`
  - `feat(sub-admin): add create job API`
  - `fix(auth): return 403 for inactive accounts`
  - `style(customer): apply official colours to dashboard`
  - `docs: update API list`
  - `chore(mobile): remove Flutter template`
  - `test(inventory): add Postman checks for archive`
- Before committing, run `git status` and make sure you're not adding `.env`, `node_modules/`,
  `.idea/`, `.vscode/`, logs, `.agents/` or `skills-lock.json`.

## 3. Shared files – don't edit them on your own

These files affect everyone. Change them **only in a small, separate Pull Request** that the
leader reviews, and tell the group first.

- `server/src/app.js` (adding **one line** to mount your route is fine; mention it in your PR)
- `server/src/middleware/auth.js`, `server/src/config/firebaseAdmin.js`
- `server/package.json`, `web/package.json`, `mobile/package.json` (adding a library = tell the group)
- `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json`
- `database/seeds/*`, `database/schema/collections.md`
- `web/src/App.jsx` (routes), `web/src/styles/*`, `web/src/components/layout/*`, `web/src/components/common/*`
- `docs/DECISIONS.md`, `docs/DESIGN_SYSTEM.md`

Never edit files inside another member's module folder (e.g. `pages/customer/` if you're not Dulni).

## 4. Getting your work into `main` (Pull Requests)

We merge **one working feature at a time**.

1. Check the milestone's "Done when" list in `docs/PROJECT_STATUS.md`. Everything must work.
2. Update your branch from main first: `git fetch origin` and then `git merge origin/main`. Test again.
3. Push: `git push origin feature/<your-branch>`.
4. On GitHub: **Pull requests → New pull request**, with base `main` and compare `feature/<your-branch>`.
5. Title: `M1: Authentication foundation`. In the description, say what it does, how you tested it,
   and which shared files you touched.
6. Post the link in the group chat. The leader reviews it, and another member should look too.
7. The leader merges with **"Create a merge commit"** (never "Squash and merge").
8. **Everyone** then runs `git fetch origin` and `git merge origin/main` on their own branch.

## 5. When `git merge origin/main` shows a conflict

Don't panic and don't delete anything.
1. `git status` lists the files "both modified".
2. Open each file in VS Code. It shows **Current** (yours) and **Incoming** (main).
3. For shared files, **keep main's version** unless you know your change is needed. For your own
   module files, keep yours.
4. Save, then `git add <that file>`. When all conflicts are fixed, run `git commit` (the message is prefilled).
5. If you're unsure, run `git merge --abort` (this cancels the merge safely) and ask the leader.

## 6. Running the project locally (after M1 is in `main`)

Open **separate terminals** for each part.

```powershell
# Terminal 1 – Firebase emulators (from the Group-F folder)
firebase emulators:start
#   Emulator UI: http://127.0.0.1:4000

# Terminal 2 – seed test data (every time the emulators start, because they start empty)
cd database\seeds
npm install
$env:FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
$env:FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"
$env:DEMO_TEST_PASSWORD="ask-the-leader"     # never commit this
npm run seed                 # runs all 4 seed scripts in order (see database/seeds/README.md)

# Terminal 3 – backend
cd server
npm install
copy .env.example .env       # first time only; fill in the values (never commit .env)
npm run dev                  # http://localhost:5000/api/health

# Terminal 4 – web app
cd web
npm install
copy .env.example .env       # first time only
npm run dev                  # http://localhost:5173

# Mobile (Sasindi)
cd mobile
npx expo start               # scan the QR code with Expo Go (phone on the same Wi-Fi)
```

Test accounts (emulator only): `admin@example.test`, `subadmin@example.test`,
`customer@example.test`, `employee@example.test`.

## 7. Never run these unless the leader tells you to

| Command | Why it's dangerous |
|---|---|
| `git push --force` | Overwrites history on GitHub, and can erase teammates' commits |
| `git reset --hard` | Deletes your uncommitted work permanently |
| `git clean -fd` | Deletes untracked files permanently |
| `git add .` | Adds secrets, logs and other people's files by accident |
| Merging another member's branch into yours | Brings their unfinished work into your branch |
| Pushing directly to `main` | `main` only changes through reviewed Pull Requests |

## 8. Working with an AI chat (one chat per member)

Each member continues in **their own chat**. Every new chat starts knowing nothing, so begin it
with this prompt and attach the four docs from `docs/` (PROJECT_STATUS, DECISIONS, DESIGN_SYSTEM,
TEAM_WORKFLOW).

```text
I am [NAME], the [ROLE] developer in Group F (LNBTI ICT2410) building the
PCI Colombo Smart Pest Control Service Management System.
Repo: https://github.com/LNBTI-UOG611-Projects/Group-F  — my branch: [BRANCH]

I attached our team docs. Treat them as the source of truth:
- PROJECT_STATUS.md (what exists, problems, milestones)
- DECISIONS.md (architecture, field names, API format – do not change these)
- DESIGN_SYSTEM.md (official colours and UI rules)
- TEAM_WORKFLOW.md (Git rules)

Rules for you:
1. I am a beginner. Guide me one small step at a time, with Windows PowerShell commands,
   which file to open, what to change, and what output to expect.
2. Before suggesting changes, ask me to show you the current file (or read it on GitHub).
3. Only change files in my area. If a shared file must change, tell me and I will ask the leader.
4. Follow DECISIONS.md exactly (field names, `role`, `status`, response format, ES modules).
5. Use only the official colours (CSS variables / colors.js) for any UI.
6. Explain the code so I can explain and modify it myself during evaluation.
7. Remind me to commit small steps and push every day. Never suggest git push --force,
   reset --hard, clean -fd or git add .
8. At the end of each session, give me a short summary: what changed, files, commits,
   tests done, what's next, and anything the leader must know.

My current task: [PASTE YOUR MILESTONE FROM PROJECT_STATUS.md]
```

| Member | [ROLE] | [BRANCH] | First task |
|---|---|---|---|
| Yasasmi | Main Admin + Group Leader | `feature/main-admin` | M2, then M3, M5 |
| Sunera | Sub Admin | `feature/sub-admin` | M1, then M4 |
| Dulni | Customer | `feature/customer` | Setup, then M6 (after M3/M4) |
| Sasindi | Employee (web + Expo mobile) | `feature/employee` | M7 |

At the end of every session, paste the AI's summary into the group chat so the leader can update
`PROJECT_STATUS.md`.
