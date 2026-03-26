# Implementation Plan: WorkGraph UI Frontend (Phases 3, 4 & 5)

This plan covers all changes to the `jobscraperui` Next.js codebase. The Python scraper (`job_scraper`) has its own separate plan.

**Principle:** The scraper is the source of truth. This UI adapts to whatever it produces.

**Shared context:** See `IMPLEMENTATION_OVERVIEW.md` (in the `job_scraper` folder) for the full phasing, dependency graph, and how the two codebases connect.

---

## Prerequisites From the Backend Team

**Before starting Phase 3**, the backend team must complete their Phase 1. You need these columns to exist and be populated in Supabase:

- `job_postings.overall_automation_pct` (INTEGER, 0-100)
- `job_postings.estimated_annual_savings` (NUMERIC)
- `job_postings.responsibilities_list` (JSONB, array of strings)
- `job_postings.requirements_list` (JSONB, array of strings)
- `job_postings.normalized_industry` (TEXT, consistently populated)
- `scrape_runs.errors_count` (INTEGER)

**Before starting Phase 4**, the backend team must complete their Phase 2. You need:

- `job_tasks` rows for analyzed jobs (with `task_category` constrained to: `communication`, `data-analysis`, `documentation`, `research`, `coordination`, `technical`)
- `task_automation_scores` rows linked to each task
- `job_automation_summaries` rows linked to each analyzed job

---

## Phase 3: Replace Mock Data With Supabase Queries

**Goal:** Wire every page to real data. Start with the simplest tables and work up.

### 3.1 Create the Data Access Layer

**New file:** `lib/queries.ts`

Build async functions that query Supabase and return data shaped to the existing UI types. This is the **mapping layer** between snake_case DB columns and camelCase frontend interfaces.

```typescript
// Function signatures:
export async function fetchJobs(filters?: JobFilters): Promise<Job[]>
export async function fetchJobById(id: string): Promise<Job | null>
export async function fetchScraperRuns(limit?: number): Promise<ScraperRun[]>
export async function fetchCompanyStats(): Promise<Company[]>
export async function fetchDashboardStats(): Promise<DashboardStats>
```

**Field mapping (job_postings → Job):**

| DB Column (`job_postings`)    | UI Field (`Job`)          | Transform                                    |
|-------------------------------|---------------------------|----------------------------------------------|
| `id`                          | `id`                      | `String(row.id)`                             |
| `company_name`                | `company`                 | direct                                       |
| `job_title`                   | `title`                   | direct                                       |
| `location_text`               | `location`                | `row.location_text ?? 'Unknown'`             |
| `remote_type`                 | `remoteType`              | cast to union type, default `'onsite'`       |
| `salary_min`                  | `salaryMin`               | `row.salary_min ?? 0`                        |
| `salary_max`                  | `salaryMax`               | `row.salary_max ?? 0`                        |
| `salary_currency`             | `salaryCurrency`          | `row.salary_currency ?? 'USD'`               |
| `overall_automation_pct`      | `automationPercentage`    | `row.overall_automation_pct ?? 0`            |
| *(derived — see below)*       | `opportunityScore`        | compute from automation % + salary           |
| `estimated_annual_savings`    | `estimatedSavings`        | `row.estimated_annual_savings ?? 0`          |
| `full_description_text`       | `description`             | direct                                       |
| `responsibilities_list`       | `responsibilities`        | `row.responsibilities_list ?? []`            |
| `requirements_list`           | `requirements`            | `row.requirements_list ?? []`                |
| `tools_mentioned`             | `tools`                   | `row.tools_mentioned ?? []`                  |
| `skills_mentioned`            | `skills`                  | `row.skills_mentioned ?? []`                 |
| `last_seen_timestamp`         | `lastUpdated`             | direct (ISO string)                          |
| `posting_status` / `is_active`| `status`                  | `row.is_active ? 'active' : 'archived'`      |
| `canonical_job_url`           | `sourceUrl`               | direct                                       |

**`opportunityScore` derivation:** This doesn't exist in the DB. Compute it in the mapping layer:

```typescript
const opportunityScore = Math.round(
  (automationPercentage * 0.6) +
  (Math.min(estimatedSavings / 1000, 40)) // cap salary contribution
);
```

**Field mapping (scrape_runs → ScraperRun):**

| DB Column (`scrape_runs`) | UI Field (`ScraperRun`) | Transform                                            |
|---------------------------|-------------------------|------------------------------------------------------|
| `id`                      | `id`                    | `String(row.id)`                                     |
| `company_name`            | `source`                | direct (was `source` in mock, is `company_name` in DB)|
| `status`                  | `status`                | map `"success"` / `"error"` → `"success"` / `"failed"`, derive `"partial"` from errors_count > 0 + status == success |
| `jobs_found`              | `jobsScraped`           | `row.jobs_found ?? 0`                                |
| *(derived)*               | `successRate`           | `jobs_found > 0 ? ((jobs_inserted + jobs_updated) / jobs_found * 100) : 0` |
| `errors_count`            | `errors`                | `row.errors_count ?? 0`                              |
| `started_at`              | `timestamp`             | direct (ISO string)                                  |
| `duration_ms`             | `duration`              | `(row.duration_ms ?? 0) / 1000` (convert to seconds) |

### 3.2 Update Types (If Needed)

**File:** `lib/types.ts`

The existing types should work as-is since the mapping layer handles the transformation. However, consider adding optional fields that the DB has but mock data didn't:

- Add `seniority?: string` to `Job`
- Add `employmentType?: string` to `Job`
- Add `department?: string` to `Job`

### 3.3 Wire Up Admin Page (First)

**File:** `app/admin/page.tsx`

**What to change:**
- Remove `import { mockScraperRuns } from '@/lib/mock-data'`.
- Make the component async (it's already a server component).
- Call `fetchScraperRuns()` from `lib/queries.ts`.
- The rest of the page logic (KPI calculations, table rendering) stays the same — it already operates on the `ScraperRun[]` array.

**Why first:** This page only needs `scrape_runs`, which is the simplest table with no joins. It proves the Supabase connection works end to end.

**Current mock data references to replace:**
- `mockScraperRuns` (used for KPIs, table, source health, and recent errors sections)

### 3.4 Wire Up Jobs List Page (Second)

**File:** `app/jobs/page.tsx`

**What to change:**
- This is a `'use client'` component, so it can't use server-side data fetching directly.
- **Option A (recommended):** Convert to server component + client components for interactive parts. Create a new client component `JobsPageClient` that receives jobs as props. The server component fetches data and passes it down.
- **Option B:** Add a `useEffect` + `useState` pattern to call `fetchJobs()` on mount. Add loading state.
- Replace `mockJobs` import with the fetched data.
- The `FilterPanel`, `JobsTable`, and `PreviewDrawer` components don't need changes — they already receive `Job[]` as props.

**File:** `components/jobs/filter-panel.tsx`

- The company list is currently hardcoded (6 companies). Derive it from the fetched jobs data instead — extract unique company names and pass as a prop, or add a `fetchDistinctCompanies()` query.

**Current mock data references to replace:**
- `mockJobs` in `app/jobs/page.tsx` (used for filtering/rendering)
- `mockJobs.length` for the "Showing X of Y" counter

### 3.5 Wire Up Dashboard (Third)

**File:** `app/dashboard/page.tsx`

**What to change:**
- Replace mock data imports with calls to `fetchDashboardStats()`, `fetchJobs()`, `fetchScraperRuns()`.
- `fetchDashboardStats()` should return pre-aggregated data:
  - Total jobs count (Supabase `.select('*', { count: 'exact', head: true })`)
  - Active companies count (distinct `company_name`)
  - Average `overall_automation_pct`
  - Count of jobs with `overall_automation_pct > 75` (high opportunity)
  - Jobs added today (`first_seen_timestamp >= today`)
- The industry automation chart needs data grouped by `normalized_industry` — add `fetchIndustryStats()` that does a grouped aggregation.
- Recent activity uses `scrape_runs` — reuse `fetchScraperRuns(5)`.
- Top automatable roles — query `job_postings` ordered by `overall_automation_pct DESC` limit 5.

**Current mock data references to replace:**
- `mockJobs` (for KPI calculations and top roles)
- `mockCompanies` (for top companies section)
- `mockScraperRuns` (for recent activity)
- `industryAutomationData` (for the bar chart)

### 3.6 Wire Up Job Detail Page (Fourth — Partial)

**File:** `app/jobs/[id]/page.tsx`

**What to change:**
- Replace `getJobById(id)` with `await fetchJobById(id)` from `lib/queries.ts`.
- The page already handles `notFound()` if job is null.
- All the job metadata, description, responsibilities, requirements, tools, skills sections will work once the mapping layer provides the right types.
- **Leave task breakdown and AI blueprint sections as conditional:** Show them only if data exists, display an "Analysis pending" state if the job hasn't been analyzed yet (no rows in `job_tasks`).
- This prevents the page from breaking before Phase 4 data is available.

**Current mock data references to replace:**
- `getJobById(id)` from `@/lib/mock-data`
- `getTasksByJobId(job.id)` — replace with placeholder until Phase 4
- `getAutomationBreakdown(job.id)` — replace with placeholder until Phase 4
- `getAIBlueprint(job.id)` — replace with placeholder until Phase 4

### 3.7 Remove Mock Data File

**File:** `lib/mock-data.ts`

Once all pages are wired up, delete this file and remove all imports. Search the codebase for `mock-data` to ensure no references remain.

### Phase 3 Files Changed

| File | Change |
|------|--------|
| `lib/queries.ts` | **New** — Supabase query + mapping layer |
| `lib/types.ts` | Minor additions (optional fields) |
| `app/admin/page.tsx` | Replace `mockScraperRuns` import with `fetchScraperRuns()` |
| `app/jobs/page.tsx` | Replace `mockJobs` import, add data fetching + loading state |
| `app/dashboard/page.tsx` | Replace all mock imports, add aggregation queries |
| `app/jobs/[id]/page.tsx` | Replace `getJobById`, add conditional task/blueprint sections |
| `components/jobs/filter-panel.tsx` | Derive company list from data |
| `lib/mock-data.ts` | Delete when all pages migrated |

---

## Phase 4: Connect the Analysis Features

**Goal:** Light up the task breakdown table, automation summary, and AI blueprint with real data from the analysis tables.

**Prerequisite:** Backend Phase 2 must be complete — `job_tasks`, `task_automation_scores`, and `job_automation_summaries` tables must have data.

### 4.1 Add Analysis Query Functions

**File:** `lib/queries.ts`

Add:

```typescript
export async function fetchTasksForJob(jobId: string): Promise<Task[]>
export async function fetchAutomationBreakdown(jobId: string): Promise<AutomationBreakdown | null>
export async function fetchAIBlueprint(jobId: string): Promise<AIBlueprint | null>
```

**`fetchTasksForJob` mapping (`job_tasks` + `task_automation_scores` → `Task`):**

| DB Column                           | UI Field              | Transform                          |
|-------------------------------------|-----------------------|------------------------------------|
| `job_tasks.id`                      | `id`                  | `String(row.id)`                   |
| `job_tasks.job_posting_id`          | `jobId`               | `String(row.job_posting_id)`       |
| `job_tasks.task_text`               | `name`                | direct                             |
| `job_tasks.task_category`           | `category`            | direct (ensure enum alignment)     |
| `job_tasks.requires_judgment`       | `judgmentLevel`       | direct (low/medium/high)           |
| `job_tasks.requires_human_interaction` | `interactionLevel` | direct (low/medium/high)           |
| `task_automation_scores.overall_automation_score` | `automationPercentage` | direct (0-100)       |
| `job_tasks.task_text` (first line)  | `description`         | direct                             |
| `task_automation_scores.integration_complexity_score` | `complexity` | `Math.ceil(score / 10)` (1-10 scale) |

This requires a **join query**. Supabase supports this via:

```typescript
const { data } = await supabase
  .from('job_tasks')
  .select('*, task_automation_scores(*)')
  .eq('job_posting_id', numericId)
  .order('task_sequence')
```

**`fetchAutomationBreakdown` mapping (`job_automation_summaries` → `AutomationBreakdown`):**

| DB Column                         | UI Field        | Transform                                  |
|-----------------------------------|-----------------|--------------------------------------------|
| `tasks_fully_automatable_pct`     | `automatable`   | `round(fully + partially)`                 |
| `tasks_not_automatable_pct`       | `humanRequired` | direct                                     |
| `implementation_complexity`       | `complexity`    | direct (low/medium/high)                   |

**`fetchAIBlueprint` mapping (`job_automation_summaries` → `AIBlueprint`):**

| DB Column                    | UI Field                     | Transform                            |
|------------------------------|------------------------------|--------------------------------------|
| `automation_category`        | `agentType`                  | map to readable label                |
| `recommended_ai_tools`       | `systemsRequired`            | direct (JSON array)                  |
| `primary_blockers`           | `humanInLoopPoints`          | direct (JSON array)                  |
| `implementation_complexity`  | `implementationComplexity`   | direct (low/medium/high)             |

### 4.2 Update Job Detail Page

**File:** `app/jobs/[id]/page.tsx`

**What to change:**
- Replace the Phase 3 placeholder with real queries:
  - `getTasksByJobId(job.id)` → `await fetchTasksForJob(id)`
  - `getAutomationBreakdown(job.id)` → `await fetchAutomationBreakdown(id)`
  - `getAIBlueprint(job.id)` → `await fetchAIBlueprint(id)`
- Add conditional rendering: if `tasks.length === 0`, show an "Analysis pending" state in the task breakdown section instead of an empty table.
- If `breakdown` is null, show a simpler version of the automation summary using just the job's `automationPercentage`.

### 4.3 Update Preview Drawer

**File:** `components/jobs/preview-drawer.tsx`

The preview drawer currently shows "Top automatable tasks" for the selected job. This needs task data.

- Either prefetch tasks when opening the drawer (adds latency), or
- Show only the job-level automation score in the preview and reserve the task breakdown for the full detail page.

**Recommended:** Keep the preview lightweight — show automation %, savings, tools/skills. Reserve task details for the detail page.

### Phase 4 Files Changed

| File | Change |
|------|--------|
| `lib/queries.ts` | Add `fetchTasksForJob`, `fetchAutomationBreakdown`, `fetchAIBlueprint` |
| `app/jobs/[id]/page.tsx` | Wire task breakdown, automation summary, AI blueprint |
| `components/jobs/preview-drawer.tsx` | Simplify or add task preview |

---

## Phase 5: Company Aggregation and Opportunity Pipeline

**Goal:** Make the Companies and Opportunities features work with real data.

### 5.1 Company Stats (Computed — No New Table)

**File:** `lib/queries.ts`

Add `fetchCompanyStats()` that queries `job_postings` grouped by `company_name`:

```typescript
// Pseudo-query:
// SELECT company_name,
//        COUNT(*) as total_jobs,
//        AVG(overall_automation_pct) as avg_automation,
//        SUM(estimated_annual_savings) as total_savings,
//        normalized_industry (mode/first)
// FROM job_postings WHERE is_active = true
// GROUP BY company_name
```

Supabase doesn't support `GROUP BY` directly in the JS client, so either:
- Use a **Supabase database function** (SQL function) that returns aggregated results, or
- Fetch all jobs and aggregate client-side (fine for < 10K jobs), or
- Create a **Supabase view** `company_stats` that does the grouping.

**Recommended:** Create a Supabase view. This keeps the frontend simple and the query fast.

**File to update:** `app/dashboard/page.tsx` — replace `mockCompanies` with `fetchCompanyStats()`.

**Remaining gap:** `industry` and `size` are in the `Company` type but don't exist as dedicated columns. Industry can come from `normalized_industry` on `job_postings`. Company `size` would need either a new `companies` table with curated metadata, external enrichment, or simply omitting it from the UI for now.

### 5.2 Opportunity Pipeline

The mock data has `Opportunity` objects with `status: 'new' | 'contacted' | 'in-progress' | 'closed'` — this is CRM state that the scraper can't generate.

**Option A: Auto-generated opportunities (read-only) — recommended for first iteration**

- Define an opportunity as: a company + role combination where `overall_automation_pct > 70` and there are multiple open positions.
- Query `job_postings` grouped by `company_name` + `normalized_role_family` where `overall_automation_pct > threshold`.
- Display in the Opportunities page without pipeline status — just show the data.
- The `status` field becomes read-only based on data freshness (e.g., `new` for recent, `active` for ongoing).

**Option B: Full CRM pipeline (requires new Supabase table)**

- Ask the backend team to create an `opportunities` table:

```sql
CREATE TABLE opportunities (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  role_family TEXT NOT NULL,
  total_roles INTEGER DEFAULT 0,
  avg_salary NUMERIC,
  automation_percentage INTEGER,
  estimated_savings NUMERIC,
  status TEXT DEFAULT 'new',  -- new, contacted, in-progress, closed
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

- Auto-populate from job data (scraper-side or via Supabase function).
- Allow manual status updates from the UI (needs direct Supabase update calls).

**File:** `app/opportunities/page.tsx`

Replace `mockOpportunities` with the chosen approach.

### 5.3 Sources Page

**File:** `app/sources/page.tsx`

Currently shows "Coming soon". Build it from existing data without a new table:

- Derive the source list from distinct `company_name` + `source_type` + `careers_url` combinations in `scrape_runs`.
- Show last scrape time, total jobs per source, and success rate.
- This mirrors what the `job_scraper`'s `sources/companies.yaml` contains but sourced from actual scrape history.

### Phase 5 Files Changed

| File | Change |
|------|--------|
| `lib/queries.ts` | Add `fetchCompanyStats`, `fetchOpportunities`, `fetchSources` |
| `app/dashboard/page.tsx` | Wire company stats |
| `app/opportunities/page.tsx` | Replace `mockOpportunities` |
| `app/sources/page.tsx` | Build from `scrape_runs` data |
| Supabase (optional) | View for `company_stats`, optional `opportunities` table |
