# WorkGraph - AI Job Automation Intelligence Platform

A production-quality B2B intelligence platform for analyzing job automation potential and surfacing AI-driven cost-saving opportunities.

## Overview

WorkGraph is NOT a job board. It is a data intelligence platform that:
- Ingests scraped job data
- Structures job roles into tasks
- Analyzes automation potential
- Surfaces AI-driven cost-saving opportunities

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Data Tables**: TanStack Table
- **Charts**: Recharts
- **State Management**: React hooks (no overengineered state management)

## Project Structure

```
├── app/
│   ├── dashboard/page.tsx           # Main dashboard with KPIs and charts
│   ├── jobs/page.tsx                # Jobs table with filters and preview
│   ├── jobs/[id]/page.tsx           # Detailed job analysis (MOST IMPORTANT PAGE)
│   ├── opportunities/page.tsx       # Monetization opportunities
│   ├── admin/page.tsx               # Scraper monitoring
│   ├── sources/page.tsx             # Data sources (placeholder)
│   └── layout.tsx                   # Root layout
│
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx              # Left navigation sidebar
│   │   ├── topbar.tsx               # Top navigation bar
│   │   └── app-layout.tsx           # Main app layout wrapper
│   │
│   ├── dashboard/
│   │   ├── kpi-card.tsx             # KPI metric cards
│   │   ├── automation-chart.tsx     # Industry automation chart
│   │   └── recent-activity.tsx      # Recent scraper activity
│   │
│   ├── jobs/
│   │   ├── jobs-table.tsx           # Main jobs data table
│   │   ├── filter-panel.tsx         # Left filter panel
│   │   └── preview-drawer.tsx       # Right preview drawer
│   │
│   ├── job-detail/
│   │   ├── task-breakdown-table.tsx # Task analysis table
│   │   ├── automation-summary.tsx   # Automation pie chart
│   │   └── ai-blueprint.tsx         # AI agent blueprint card
│   │
│   └── ui/
│       ├── status-badge.tsx         # Status indicator badge
│       └── ...shadcn components
│
├── lib/
│   ├── types.ts                     # TypeScript type definitions
│   ├── mock-data.ts                 # Mock data layer
│   └── utils.ts                     # Utility functions
│
└── public/                          # Static assets
```

## Key Features

### 1. Dashboard
- **KPI Cards**: Total jobs, companies tracked, avg automation %, high opportunity roles
- **Top Lists**: Most automatable roles, top hiring companies
- **Chart**: Automation opportunity by industry
- **Activity Feed**: Recent scraper runs and success rates

### 2. Jobs Table (Main Working Interface)
- **Data Table**: Sortable, filterable jobs table with TanStack Table
- **Left Filter Panel**:
  - Company filter
  - Remote type filter
  - Automation % range slider
- **Search**: Full-text search across roles and companies
- **Preview Drawer**: Quick preview with:
  - Automation metrics
  - Top 3 tasks
  - Tools mentioned
  - Link to full details

### 3. Job Detail Page (MOST IMPORTANT)
- **Header Section**:
  - Company and role title
  - Key metrics: Automation %, Opportunity Score, Estimated Savings
  - Action buttons: Save, Export, Generate Report

- **Main Content** (Two-column layout):
  - **Left**: Job details, responsibilities, requirements, tools
  - **Right**: Automation summary, cost analysis

- **Task Breakdown Table**:
  - All tasks with categories
  - Judgment and interaction levels
  - Automation percentage per task
  - Color-coded automation indicators

- **AI Agent Blueprint**:
  - Recommended agent type
  - Required systems
  - Human-in-loop points
  - Implementation complexity

### 4. Opportunities Page
- **Pipeline View**: All monetization opportunities
- **Aggregated Metrics**: Total roles, salary budget, potential savings
- **Detail Drawer**:
  - Opportunity breakdown
  - Action buttons: Generate Report, Start Outreach, Send to Marketplace

### 5. Admin Page
- **Scraper Monitoring**: Status of all scraper runs
- **Health Metrics**: Success rates, error counts, duration
- **Source Health**: Per-source health indicators
- **Error Log**: Recent scraping errors

## Data Models

### Job
- Basic info: company, title, location, salary
- Metrics: automation %, opportunity score, estimated savings
- Details: responsibilities, requirements, tools, skills

### Task
- Task details: name, description, category
- Analysis: judgment level, interaction level, automation %
- Complexity scoring

### Opportunity
- Company and role aggregation
- Total roles and salary information
- Estimated savings
- Pipeline status

### ScraperRun
- Source identification
- Status and success metrics
- Error tracking
- Timestamp and duration

## Design Principles

### Visual Style
- Clean, modern, minimal B2B interface
- Neutral background with subtle blue accents
- Dense but readable layouts
- Focus on data and actionability

### Color Coding
- **Green**: High automation potential (80%+)
- **Yellow**: Medium automation (60-79%)
- **Red**: Low automation (<60%)

### Layout Strategy
- Sidebar navigation (left)
- Top navigation bar
- Main content area with proper spacing
- Two-column layouts for detail views

## Mock Data

The platform includes comprehensive mock data:
- 6 realistic job postings (Customer Support, SDR, Operations Analyst, etc.)
- 10 detailed task breakdowns
- 5 companies with hiring metrics
- 4 opportunities with savings calculations
- 5 scraper runs with various statuses

All mock data is realistic and demonstrates the platform's capabilities.

## How to Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**:
   Navigate to `http://localhost:3000`

   The app will automatically redirect to `/dashboard`

4. **Build for production**:
   ```bash
   npm run build
   ```

## Navigation

- **Dashboard** (`/dashboard`): Overview and key metrics
- **Jobs** (`/jobs`): Main working interface with table and filters
- **Job Detail** (`/jobs/[id]`): Detailed automation analysis
- **Opportunities** (`/opportunities`): Monetization pipeline
- **Sources** (`/sources`): Data sources (placeholder)
- **Admin** (`/admin`): Scraper monitoring and health

## Key Components Usage

### Using the Jobs Table
```tsx
<JobsTable
  data={filteredJobs}
  onRowClick={handleRowClick}
/>
```

### Using the Filter Panel
```tsx
<FilterPanel
  onFilterChange={(filters) => setFilters(filters)}
/>
```

### Using the Preview Drawer
```tsx
<PreviewDrawer
  job={selectedJob}
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
/>
```

## Future Enhancements

1. **Backend Integration**
   - Connect to real job scraping APIs
   - Implement actual task decomposition AI
   - Add real automation scoring algorithms

2. **Advanced Filtering**
   - Save filter presets
   - Export filtered results
   - Advanced search with operators

3. **Collaboration Features**
   - Team sharing and comments
   - Opportunity assignment
   - Status workflow management

4. **Reporting**
   - Custom report builder
   - PDF export with branding
   - Email report scheduling

5. **AI Enhancements**
   - Real-time automation scoring
   - Predictive opportunity detection
   - Custom agent blueprint generation

## Development Notes

- All pages are fully responsive
- Dark mode support included via shadcn
- TypeScript strict mode enabled
- No console errors or warnings
- Production-ready build passes

## Performance

Build Output:
- Total routes: 9
- Dashboard: ~227 kB First Load JS
- Jobs: ~150 kB First Load JS
- Opportunities: ~132 kB First Load JS
- All routes are optimized and production-ready

---

Built with attention to detail for a professional B2B intelligence platform.
