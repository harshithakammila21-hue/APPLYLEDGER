# ApplyLedger 📑

> **Job Application Follow-Up and Recruitment Pipeline Tracker**  
> Built with React, TypeScript, Tailwind CSS, and Supabase (PostgreSQL + Row Level Security).

---

## 🌟 Overview

**ApplyLedger** helps software engineers and job seekers track applications across companies, manage interviews, schedule follow-ups, and visualize their recruitment pipeline with guaranteed multi-tenant data privacy.

### Key Features
- **Recruitment Kanban Pipeline**: Track stages from Wishlist ➔ Applied ➔ Screening ➔ Interviewing ➔ Offer ➔ Rejected.
- **Automated Reminders & Overdue Processing**: Automated follow-up alerts with server-side database stored procedure (`process_due_reminders`).
- **Interview Scheduling & History**: Record interview rounds (technical, behavioral, system design), notes, interviewers, and outcomes.
- **Strict Row Level Security (RLS)**: PostgreSQL RLS policies guarantee users can only view, edit, or delete their own applications and reminders.
- **CSV Workflow Support**:
  - Export all pipeline data to formatted CSV.
  - Import applications in bulk from CSV with column auto-mapping and validation.
- **Security & Persistence Verification Suite**: Automated verification script testing RLS isolation, reminder transitions, and CSV roundtrip integrity.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, date-fns
- **Backend / Database**: Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- **Tooling**: Node.js, PostCSS, Autoprefixer

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm or pnpm

### 2. Clone the Repository
```bash
git clone https://github.com/harshithakammila21-hue/APPLYLEDGER.git
cd APPLYLEDGER
```

### 3. Install Dependencies
```bash
npm install
```
*(On Windows PowerShell, use `npm.cmd install` if script execution is restricted).*

### 4. Supabase Setup
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase project dashboard.
3. Paste and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
4. (Optional) Run [`supabase/seed.sql`](supabase/seed.sql) to populate sample test data.
5. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
6. Fill in your project credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-anon-key
   ```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Security & Persistence Verification

Run the automated cross-user tenant security and persistence verification test:

```bash
npm run test:security
```

Tests include:
- Cross-user RLS data isolation (User A vs User B access restrictions)
- Automated reminder status state transitions (pending ➔ overdue)
- CSV Import/Export data roundtrip and quote escaping
- Supabase client initialization check

---

## 📂 Project Structure

```
├── public/               # Static assets
├── scripts/              # Automated security & persistence test harness
│   └── verify-security.js
├── src/
│   ├── components/       # Reusable UI components (Kanban, Modal, Cards, Reminders)
│   ├── contexts/         # Authentication context (Supabase Auth provider)
│   ├── lib/              # Supabase client & typed service layer
│   │   ├── applications.service.ts
│   │   ├── database.types.ts
│   │   ├── interviews.service.ts
│   │   ├── profile.service.ts
│   │   ├── reminders.service.ts
│   │   └── supabase.ts
│   ├── pages/            # Auth & Dashboard page views
│   ├── types/            # TypeScript interfaces and domain types
│   ├── App.tsx           # Route & view controller
│   ├── index.css         # Tailwind & global stylesheet
│   └── main.tsx          # Application entrypoint
├── supabase/
│   ├── schema.sql        # Full Postgres schema, triggers, and RLS policies
│   ├── seed.sql          # Multi-tenant test seed data
│   └── rls_security_verification.sql # SQL verification script for Postgres
└── package.json
```

---

## 📜 License
MIT License.
