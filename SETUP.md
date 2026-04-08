# Surf Tracker — Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **New Project**, give it a name like "surf-tracker"
3. Save the database password somewhere safe (you won't need it often)
4. Wait ~2 minutes for the project to provision

## 2. Run the Database Schema

1. In your Supabase project, go to **SQL Editor** → **New Query**
2. Paste the contents of `schema.sql` from this repo
3. Click **Run** — you should see "Success"

## 3. Create the Storage Bucket (for gear photos)

1. In Supabase, go to **Storage** → **New Bucket**
2. Name it exactly: `gear-photos`
3. Toggle **Public bucket** ON
4. Click **Save**

## 4. Get Your API Keys

1. In Supabase, go to **Project Settings** → **API**
2. Copy:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon / public** key (the long `eyJ...` string)

## 5. Configure Local Environment

```bash
cp .env.example .env.local
```

Then edit `.env.local`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 6. Run Locally

```bash
npm run dev
```

Open http://localhost:5173 — start by adding a Location, a Board, and a Fin set in the **Gear** tab, then log your first session.

---

## 7. Deploy to GitHub Pages

### First-time setup

1. Create a GitHub repo (e.g. `surf-tracker`)
2. In `vite.config.js`, change `base` to match your repo name:
   ```js
   base: '/surf-tracker/',  // must match your GitHub repo name
   ```
3. Push the code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/surf-tracker.git
   git push -u origin main
   ```

4. In your GitHub repo → **Settings** → **Pages**:
   - Source: **GitHub Actions**

5. Add your Supabase secrets in GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key

6. Push any change to `main` — the Actions workflow will build and deploy automatically.

Your app will be live at: `https://YOUR_USERNAME.github.io/surf-tracker/`

---

## 8. Backfilling Historical Data

When you're ready to import previous sessions from your Google Sheet/CSV, share the CSV and we can write a one-time import script.

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React + Vite | Fast dev, modern |
| Styling | Tailwind CSS v4 | Utility-first, CSS-first config |
| Router | React Router (HashRouter) | Works with GitHub Pages (no server) |
| Database | Supabase (PostgreSQL) | Free tier, JS client, no backend needed |
| Charts | Recharts | React-native chart library |
| Deploy | GitHub Actions → Pages | Free, automatic on push |
