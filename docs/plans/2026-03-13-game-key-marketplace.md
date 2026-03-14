# Game Key Marketplace Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a robust, secure, and scalable Game Key Marketplace MVP with support for hybrid payments (Pix/Global) and a reputation-based escrow system.

**Architecture:** Next.js 15 (App Router) frontend with Supabase for Backend-as-a-Service (Auth, DB, Edge Functions, Storage).

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Mercado Pago API, Stripe API.

---

## Chunk 1: Base Infrastructure & Auth

**Goal:** Initialize the project, setup Supabase, and implement authentication.

### Task 1: Project Initialization

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`

- [ ] **Step 1: Initialize Next.js project**
Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`

- [ ] **Step 2: Install core dependencies**
Run: `npm install @supabase/supabase-js @supabase/auth-helpers-nextjs lucide-react clsx tailwind-merge`

- [ ] **Step 3: Setup shadcn/ui**
Run: `npx shadcn-ui@latest init` (Select Slate, New York, and CSS variables)

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "chore: initial next.js project setup"
```

### Task 2: Supabase & Database Schema

**Files:**
- Create: `supabase/migrations/20260313000000_initial_schema.sql`

- [ ] **Step 1: Write initial schema migration**
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (Profiles)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  is_seller BOOLEAN DEFAULT FALSE,
  reputation_score DECIMAL DEFAULT 5.0,
  balance_available DECIMAL DEFAULT 0,
  balance_pending DECIMAL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games Table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  platform TEXT NOT NULL,
  region_lock TEXT DEFAULT 'Global',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Games are viewable by everyone." ON games FOR SELECT USING (true);
```

- [ ] **Step 2: Commit**
```bash
git add supabase/
git commit -m "feat: initial database schema and RLS"
```

### Task 3: Authentication Flow

**Files:**
- Create: `src/components/auth/auth-form.tsx`
- Create: `src/app/login/page.tsx`

- [ ] **Step 1: Create login page and auth component**
(Implementation using Supabase Auth UI or custom components)

- [ ] **Step 2: Verify auth flow**
Expected: User can sign up/login and a profile record is created via trigger.

- [ ] **Step 3: Commit**
```bash
git add src/
git commit -m "feat: implement authentication flow"
```
