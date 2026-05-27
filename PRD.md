# Product Requirements Document: Project Graveyard

## 1. Product Overview

**Project Graveyard** is a personal project tracker designed for developers who have accumulated unfinished side projects. It provides a centralized graveyard to log, categorize, and revisit paused, abandoned, or completed projects — with the goal of making future restarts deliberate and informed.

### 1.1 Problem Statement

Developers start many side projects but finish few. Over time, context is lost — why a project was paused, what the next step would be, or which tech stack was used. The lack of a lightweight tracking system means abandoned projects stay forgotten, even when restarting them would be valuable.

### 1.2 Target Audience

- Solo developers and hobbyists with multiple side projects
- Developers who want to track unfinished work across GitHub repos
- Anyone who needs a simple inventory of their technical ideas and experiments

### 1.3 Value Proposition

Keep unfinished projects visible, searchable, and easy to restart. Save what stopped, what still matters, and the next move that would bring it back.

---

## 2. Features & Requirements

### 2.1 Project Management (Core)

| ID | Feature | Description | Priority |
|---|---|---|---|
| PM-1 | Create Project | Add a new project with name, description, goal, technologies (comma-separated), tags (#prefixed), and optional GitHub repo URL. Defaults to "active" status with 0% progress. | P0 |
| PM-2 | View Project Detail | Dedicated detail page showing all metadata, status, progress bar, GitHub activity, goal, tags/technologies badges, stopped reason, AI analysis, milestones, activity heatmap, timeline, and journal notes. | P0 |
| PM-3 | Edit Project | Edit any project field including status, progress, stopped reason, and metadata. | P0 |
| PM-4 | Delete Project | Permanently delete a project from the database. | P0 |
| PM-5 | Archive/Restore | Archive a project (soft-delete, sets `archived_at`) or restore it from archive. | P1 |
| PM-6 | Pin Projects | Pin important projects to the top of the dashboard list. | P1 |
| PM-7 | Restart Project | Move a paused/abandoned project back to active status, recording the restart date. | P1 |

### 2.2 Project Status System

Projects have four statuses:

| Status | Meaning | Visual |
|---|---|---|
| `active` | Currently being worked on | 🟢 Green |
| `paused` | Temporarily stopped | 🔴 Red |
| `abandoned` | Permanently stopped | ⚫ Black |
| `completed` | Finished | ✅ Green check |

Each status change is logged as a `ProjectStatusEvent` for the timeline.

### 2.3 Dashboard

| ID | Feature | Description | Priority |
|---|---|---|---|
| DB-1 | Stats Cards | Show total, active, paused, completed, abandoned counts; average project lifespan; recently updated count; archived count. | P0 |
| DB-2 | Activity Heatmap | GitHub-style contribution heatmap showing project activity (creation, updates, notes, status changes, restores, archives). | P1 |
| DB-3 | Resurrection Stats | Visual showing how many projects have been restarted over time. | P1 |
| DB-4 | Status Filter | Filter projects by status (all, active, paused, abandoned, completed, archived). | P0 |
| DB-5 | Tag Filter | Filter projects by tag. | P1 |
| DB-6 | Side Panel Metrics | Show needs-review count, completion rate, oldest update, top technology, top tag, archived count. | P1 |
| DB-7 | Empty States | Themed empty states for "no projects yet" and "all projects archived" with CTAs. | P1 |
| DB-8 | Project Card List | Each project appears as a card showing name, status icon, tags, technologies, stopped reason, progress bar, last updated time, and action buttons (archive, restart, pin, edit). | P0 |

### 2.4 Notes / Journal

| ID | Feature | Description | Priority |
|---|---|---|---|
| NJ-1 | Add Note | Create markdown-supported notes for any project. | P0 |
| NJ-2 | Note Timeline | Chronological display of all notes for a project. | P1 |
| NJ-3 | Markdown Rendering | Notes render as formatted markdown with GFM support. | P1 |

### 2.5 Milestones

| ID | Feature | Description | Priority |
|---|---|---|---|
| MS-1 | Add Milestone | Create ordered milestones for a project. | P1 |
| MS-2 | Toggle Completion | Mark milestones as complete/incomplete. | P1 |
| MS-3 | Ordered List | Milestones display in a defined order with completion status. | P1 |

### 2.6 Progress Timeline

| ID | Feature | Description | Priority |
|---|---|---|---|
| PT-1 | Status Event Log | Display a chronological timeline of all status events (created, status_change, progress_update, resurrected, archived, restored). | P1 |
| PT-2 | Fallback Timeline | Generate a minimal timeline from project fields if no explicit events exist. | P1 |

### 2.7 GitHub Integration

| ID | Feature | Description | Priority |
|---|---|---|---|
| GI-1 | Connect GitHub Token | Save an encrypted fine-grained PAT to the database. | P1 |
| GI-2 | Sync Repositories | Import up to 50 non-fork repos as projects, deriving status from inactivity (60+ days = abandoned, 21+ days = paused). | P1 |
| GI-3 | Auto-detect Status | Derive project status from GitHub last commit/push dates. | P1 |
| GI-4 | Encrypted Storage | GitHub tokens are encrypted at rest using AES-256-GCM. | P1 |
| GI-5 | Read-only Access | The system only reads GitHub data (metadata, commits, contents) — never writes. | P1 |

### 2.8 AI Analysis

| ID | Feature | Description | Priority |
|---|---|---|---|
| AI-1 | OpenRouter Integration | Connect an OpenRouter API key for AI-powered project analysis. | P2 |
| AI-2 | Project Analysis | AI analyzes why a project stopped based on its context (description, status, tech stack, GitHub activity). | P2 |
| AI-3 | Custom Questions | Users can ask custom questions about a project to the AI. | P2 |
| AI-4 | Model Selection | Choose from available OpenRouter models. | P2 |
| AI-5 | Free Model Default | Defaults to `openrouter/free` model. | P2 |

### 2.9 Settings

| ID | Feature | Description | Priority |
|---|---|---|---|
| ST-1 | GitHub Settings | Connect/disconnect token, view token state, manual sync. | P1 |
| ST-2 | AI Settings | Configure OpenRouter API key and select model. | P2 |

### 2.10 Authentication

| ID | Feature | Description | Priority |
|---|---|---|---|
| AU-1 | Email Registration | Register with email/password via Supabase Auth. | P0 |
| AU-2 | Login | Login with email/password. | P0 |
| AU-3 | Protected Routes | Redirect unauthenticated users to login; redirect authenticated users away from auth pages. | P0 |
| AU-4 | Auto-profile Creation | Profile is created automatically on signup via database trigger. | P0 |

### 2.11 Public Landing Page

| ID | Feature | Description | Priority |
|---|---|---|---|
| LP-1 | Hero Section | Value proposition, CTA to start tracking or sign in, feature checklist. | P0 |
| LP-2 | Feature Sections | Three-column layout showing collect/keep/restart workflow. | P1 |
| LP-3 | Problem/Solution Cards | Show how the app addresses scope change, technical blockers, and no-time scenarios. | P1 |
| LP-4 | Footer | Project name, tagline, GitHub link. | P1 |

---

## 3. Data Model

### 3.1 Core Entities

| Entity | Key Fields | Description |
|---|---|---|
| `profiles` | id (FK→auth.users), username, full_name, avatar_url | Auto-created user profile |
| `projects` | id, user_id, name, description, goal, technologies[], tags[], github_repo_url, status, progress, stopped_reason, started_at, last_updated_at, archived_at, restarted_at, pinned, pinned_at | Main project entity |
| `project_notes` | id, project_id, content | Markdown notes per project |
| `project_milestones` | id, project_id, title, completed, position | Ordered milestones |
| `project_status_events` | id, project_id, event_type, from_status, to_status, progress, note, happened_at | Activity timeline entries |
| `github_connections` | id, user_id, github_login, token_ciphertext (encrypted) | GitHub PAT storage |
| `ai_settings` | id, user_id, openrouter_api_key_ciphertext, model, ai_enabled | AI configuration |

### 3.2 Project Statuses
- `active` • `paused` • `abandoned` • `completed`

### 3.3 Stopped Reasons
- `motivation` • `scope_creep` • `technical` • `no_time` • `changed_mind` • `other`

### 3.4 Event Types
- `created` • `status_change` • `progress_update` • `resurrected` • `archived` • `restored`

---

## 4. Technical Architecture

### 4.1 Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 |
| UI Components | Base UI, shadcn, custom components |
| Icons | lucide-react |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (SSR) |
| ORM/Client | @supabase/supabase-js, @supabase/ssr |
| Encryption | Node.js crypto (AES-256-GCM) |
| AI | OpenRouter API |
| Fonts | Geist (sans + mono) |
| Theme | next-themes (dark-first, system-aware) |

### 4.2 Key Design Decisions

- **Server Components by default**: Data fetching happens in Server Components with `force-dynamic` for real-time data.
- **Form actions**: Server actions for settings; client-side forms for project CRUD.
- **Row-Level Security (RLS)**: All database access scoped to authenticated user's own data.
- **AES-256-GCM encryption**: GitHub tokens and OpenRouter keys encrypted at rest with a server-only key.
- **Dark mode default**: The app defaults to dark theme with system-aware switching.

### 4.3 Route Structure

```
/                          → Landing page (public)
/login                     → Login page
/register                  → Registration page
/dashboard                 → Main dashboard (protected)
/dashboard/new             → Create new project
/dashboard/[id]            → Project detail page
/dashboard/[id]/edit       → Edit project
/dashboard/settings        → Settings (GitHub integration)
/dashboard/settings/ai     → AI settings
```

### 4.4 Database Migrations

The project includes 6 incremental SQL migrations:
1. `00001_init` — profiles, projects, project_notes tables + RLS + triggers
2. `00002_github_integration` — github_connections table
3. `00003_project_tags` — tags column on projects
4. `00004_archive_restart_pin` — archived_at, restarted_at, pinned columns
5. `00005_milestones_activity_timeline` — project_milestones, project_status_events tables
6. `00006_ai_settings` — ai_settings table

---

## 5. User Flows

### 5.1 First-time User
1. Lands on homepage → reads value proposition
2. Clicks "Start tracking" → registers with email/password
3. Redirected to dashboard (empty state)
4. Clicks "New Project" → fills form → creates first project
5. Project appears in dashboard with active status

### 5.2 Project Management Flow
1. View all projects on dashboard (filterable by status/tag)
2. Click project → see detail page with all context
3. Add notes, set milestones, track progress
4. Change status as work evolves
5. Archive completed or abandoned projects
6. Restart paused/abandoned projects when ready

### 5.3 GitHub Sync Flow
1. Navigate to Settings
2. Enter fine-grained PAT with repository read access
3. Token encrypted and saved → repos synced automatically
4. Imported repos appear as projects with derived status
5. Manual sync available from settings page

### 5.4 AI Analysis Flow
1. Navigate to Settings → AI
2. Enter OpenRouter API key → select model
3. On project detail page, click "Analyze"
4. AI returns analysis of why the project likely stopped
5. Ask follow-up questions for deeper insights

---

## 6. Success Metrics

| Metric | Target |
|---|---|
| Projects tracked per user | >5 average |
| Project restart rate | >15% of paused/abandoned projects |
| GitHub connections | >30% of active users |
| Session retention | Users return within 30 days after creating a project |
| Tasks completed (milestones) | >40% of milestones checked off |

---

## 7. Future Opportunities (Post-MVP)

- **Gravestone Theme Cards**: Each status gets a thematic visual — mossy stone for abandoned, marble monument for completed, fresh flowers for active.
- **Status-based Ambient Background**: Dynamic gradient/pattern backgrounds on project detail pages based on status.
- **3D Graveyard Scene**: Three.js graveyard scene on dashboard where buried projects add tombstones.
- **Ghost Empty States**: Empty states themed with ghost/taboo visuals.
- **Cover Images**: Optional cover images on project cards for premium grid appearance.
- **Achievement / Badge System**: Badges for "first burial", "5 resurrected", "10 completed" etc.
- **Animated Dashboard Transitions**: Smooth filter transitions and micro-animations on status updates.

---

## 8. Constraints & Assumptions

- **Auth provider**: Supabase Auth only; no OAuth providers configured (extensible via Supabase).
- **Deployment**: Optimized for Vercel (Next.js target); Supabase-hosted PostgreSQL.
- **Encryption key**: `GITHUB_TOKEN_ENCRYPTION_KEY` must be a 32+ character server-only env var.
- **GitHub scope**: Read-only access; fine-grained PAT required with Contents: read and Metadata: read.
- **AI dependency**: OpenRouter API key required for AI features; model support depends on OpenRouter availability.
- **No offline mode**: The application requires network connectivity for all operations.
