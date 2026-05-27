# Likeli OS

Likeli OS is a local/offline commercial operating system for Likeli. This MVP includes:

- Objectives tracker
- Cold Calling System
- CSV lead import
- Lead flashcards
- Call outcomes and follow-up fields
- SQLite persistence
- Local analytics with Recharts

## Requirements

- Node.js 18 or newer
- npm

## Install

From this folder:

```bash
npm install
npm run install:all
```

## Run

Option A, run both apps from the project root:

```bash
npm run dev
```

Option B, run separately:

```bash
npm run backend
npm run frontend
```

Backend:

```text
http://127.0.0.1:4040
```

Frontend:

```text
http://127.0.0.1:5173
```

## Import CSV

Open `Cold Calling`, click `Import CSV`, and select a `.csv` file with any of these columns:

```csv
business_name,phone,city,niche,instagram,notes
```

Spanish aliases such as `telefono`, `ciudad`, `nicho`, and `notas` are also accepted.

## Data Storage

SQLite data is stored locally in:

```text
database/likeli.db
```

Imported CSV upload files are stored in:

```text
uploads/
```

## Expanding Later

The backend API lives in `backend/src/server.js`, the database schema lives in `backend/src/db/database.js`, and the React modules live in `frontend/src/components`.

Good next modules:

- Client CRM
- Revenue tracker
- Personal OS section
- Deal pipeline
- Script library
- Follow-up calendar
