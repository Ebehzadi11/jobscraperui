import { supabase } from './supabase';
import { Job, ScraperRun, Task, AutomationBreakdown, AIBlueprint, Company, Opportunity } from './types';

// Types for filters
export interface JobFilters {
  companies?: string[];
  remoteTypes?: string[];
  automationRange?: [number, number];
  searchQuery?: string;
}

// Types for dashboard stats
export interface DashboardStats {
  totalJobs: number;
  activeCompanies: number;
  avgAutomation: number;
  highOpportunityCount: number;
  jobsAddedToday: number;
}

// Types for industry stats
export interface IndustryStats {
  industry: string;
  automation: number;
  jobs: number;
}

// Helper to compute opportunityScore
function computeOpportunityScore(automationPercentage: number, estimatedSavings: number): number {
  return Math.round(
    (automationPercentage * 0.6) +
    Math.min(estimatedSavings / 1000, 40)
  );
}

// Helper to map remote_type to union type
function mapRemoteType(remoteType: string | null): 'remote' | 'hybrid' | 'onsite' {
  if (remoteType === 'remote' || remoteType === 'hybrid' || remoteType === 'onsite') {
    return remoteType;
  }
  return 'onsite';
}

// Helper to map job row to Job type
function mapJobRow(row: Record<string, unknown>): Job {
  const automationPercentage = (row.overall_automation_pct as number) ?? 0;
  const estimatedSavings = Number(row.estimated_annual_savings) ?? 0;

  return {
    id: String(row.id),
    company: (row.company_name as string) ?? '',
    title: (row.job_title as string) ?? '',
    location: (row.location_text as string) ?? 'Unknown',
    remoteType: mapRemoteType(row.remote_type as string | null),
    salaryMin: (row.salary_min as number) ?? 0,
    salaryMax: (row.salary_max as number) ?? 0,
    salaryCurrency: (row.salary_currency as string) ?? 'USD',
    automationPercentage,
    opportunityScore: computeOpportunityScore(automationPercentage, estimatedSavings),
    estimatedSavings,
    description: (row.full_description_text as string) ?? '',
    responsibilities: (row.responsibilities_list as string[]) ?? [],
    requirements: (row.requirements_list as string[]) ?? [],
    tools: (row.tools_mentioned as string[]) ?? [],
    skills: (row.skills_mentioned as string[]) ?? [],
    lastUpdated: (row.last_seen_timestamp as string) ?? new Date().toISOString(),
    status: row.is_active ? 'active' : 'archived',
    sourceUrl: (row.canonical_job_url as string) ?? '',
    // Optional fields
    seniority: row.seniority_level as string | undefined,
    employmentType: row.employment_type as string | undefined,
    department: row.department as string | undefined,
  };
}

// Helper to map scraper run status
function mapScraperStatus(status: string, errorsCount: number): 'success' | 'partial' | 'failed' {
  if (status === 'error') {
    return 'failed';
  }
  if (status === 'success' && errorsCount > 0) {
    return 'partial';
  }
  if (status === 'success') {
    return 'success';
  }
  return 'failed';
}

// Helper to map scraper run row to ScraperRun type
function mapScraperRunRow(row: Record<string, unknown>): ScraperRun {
  const jobsFound = (row.jobs_found as number) ?? 0;
  const jobsInserted = (row.jobs_inserted as number) ?? 0;
  const jobsUpdated = (row.jobs_updated as number) ?? 0;
  const errorsCount = (row.errors_count as number) ?? 0;
  const status = (row.status as string) ?? 'error';

  const successRate = jobsFound > 0
    ? Math.round(((jobsInserted + jobsUpdated) / jobsFound) * 100)
    : 0;

  return {
    id: String(row.id),
    source: (row.company_name as string) ?? '',
    status: mapScraperStatus(status, errorsCount),
    jobsScraped: jobsFound,
    successRate,
    errors: errorsCount,
    timestamp: (row.started_at as string) ?? new Date().toISOString(),
    duration: Math.round(((row.duration_ms as number) ?? 0) / 1000),
  };
}

/**
 * Fetch jobs with optional filters
 */
export async function fetchJobs(filters?: JobFilters): Promise<Job[]> {
  let query = supabase
    .from('job_postings')
    .select('*')
    .order('last_seen_timestamp', { ascending: false });

  if (filters?.companies && filters.companies.length > 0) {
    query = query.in('company_name', filters.companies);
  }

  if (filters?.remoteTypes && filters.remoteTypes.length > 0) {
    query = query.in('remote_type', filters.remoteTypes);
  }

  if (filters?.automationRange) {
    query = query
      .gte('overall_automation_pct', filters.automationRange[0])
      .lte('overall_automation_pct', filters.automationRange[1]);
  }

  if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
    const search = filters.searchQuery.trim().toLowerCase();
    query = query.or(`job_title.ilike.%${search}%,company_name.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }

  return (data ?? []).map(mapJobRow);
}

/**
 * Fetch a single job by ID
 */
export async function fetchJobById(id: string): Promise<Job | null> {
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    return null;
  }

  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('id', numericId)
    .single();

  if (error || !data) {
    console.error('Error fetching job by ID:', error);
    return null;
  }

  return mapJobRow(data);
}

/**
 * Fetch scraper runs with optional limit
 */
export async function fetchScraperRuns(limit?: number): Promise<ScraperRun[]> {
  let query = supabase
    .from('scrape_runs')
    .select('*')
    .order('started_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching scraper runs:', error);
    return [];
  }

  return (data ?? []).map(mapScraperRunRow);
}

/**
 * Fetch dashboard statistics
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  // Get total jobs count
  const { count: totalJobs, error: countError } = await supabase
    .from('job_postings')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error fetching total jobs count:', countError);
  }

  // Get distinct company names for active companies count
  const { data: companiesData, error: companiesError } = await supabase
    .from('job_postings')
    .select('company_name')
    .eq('is_active', true);

  if (companiesError) {
    console.error('Error fetching companies:', companiesError);
  }

  const uniqueCompanies = new Set((companiesData ?? []).map(row => row.company_name));
  const activeCompanies = uniqueCompanies.size;

  // Get average automation percentage
  const { data: automationData, error: automationError } = await supabase
    .from('job_postings')
    .select('overall_automation_pct');

  if (automationError) {
    console.error('Error fetching automation data:', automationError);
  }

  const automationValues = (automationData ?? [])
    .map(row => row.overall_automation_pct)
    .filter((val): val is number => val !== null);

  const avgAutomation = automationValues.length > 0
    ? Math.round(automationValues.reduce((sum, val) => sum + val, 0) / automationValues.length)
    : 0;

  // Get high opportunity count (automation > 75)
  const { count: highOpportunityCount, error: highOpError } = await supabase
    .from('job_postings')
    .select('*', { count: 'exact', head: true })
    .gt('overall_automation_pct', 75);

  if (highOpError) {
    console.error('Error fetching high opportunity count:', highOpError);
  }

  // Get jobs added today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const { count: jobsAddedToday, error: todayError } = await supabase
    .from('job_postings')
    .select('*', { count: 'exact', head: true })
    .gte('first_seen_timestamp', todayISO);

  if (todayError) {
    console.error('Error fetching jobs added today:', todayError);
  }

  return {
    totalJobs: totalJobs ?? 0,
    activeCompanies,
    avgAutomation,
    highOpportunityCount: highOpportunityCount ?? 0,
    jobsAddedToday: jobsAddedToday ?? 0,
  };
}

/**
 * Fetch industry statistics for the bar chart
 */
export async function fetchIndustryStats(): Promise<IndustryStats[]> {
  const { data, error } = await supabase
    .from('job_postings')
    .select('normalized_industry, overall_automation_pct');

  if (error) {
    console.error('Error fetching industry stats:', error);
    return [];
  }

  // Group by industry and calculate averages
  const industryMap = new Map<string, { total: number; count: number }>();

  for (const row of data ?? []) {
    const industry = (row.normalized_industry as string) || 'Unknown';
    const automation = (row.overall_automation_pct as number) ?? 0;

    const existing = industryMap.get(industry) ?? { total: 0, count: 0 };
    industryMap.set(industry, {
      total: existing.total + automation,
      count: existing.count + 1,
    });
  }

  // Convert to array and calculate averages
  const results: IndustryStats[] = [];

  Array.from(industryMap.entries()).forEach(([industry, stats]) => {
    if (industry !== 'Unknown' && stats.count > 0) {
      results.push({
        industry,
        automation: Math.round(stats.total / stats.count),
        jobs: stats.count,
      });
    }
  });

  // Sort by automation percentage descending
  results.sort((a, b) => b.automation - a.automation);

  return results;
}

/**
 * Fetch distinct company names from job_postings
 */
export async function fetchDistinctCompanies(): Promise<string[]> {
  const { data, error } = await supabase
    .from('job_postings')
    .select('company_name')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching distinct companies:', error);
    return [];
  }

  const companySet = new Set((data ?? []).map(row => row.company_name as string));
  const uniqueCompanies = Array.from(companySet);
  return uniqueCompanies.filter(Boolean).sort();
}

// Helper to map task category to valid union type
function mapTaskCategory(category: string | null): Task['category'] {
  const validCategories = ['communication', 'data-analysis', 'documentation', 'research', 'coordination', 'technical'];
  if (category && validCategories.includes(category)) {
    return category as Task['category'];
  }
  return 'technical'; // default
}

// Helper to map judgment/interaction level to valid union type
function mapLevel(level: string | null): 'low' | 'medium' | 'high' {
  if (level === 'low' || level === 'medium' || level === 'high') {
    return level;
  }
  return 'medium'; // default
}

// Helper to map complexity level to valid union type
function mapComplexity(complexity: string | null): 'low' | 'medium' | 'high' {
  if (complexity === 'low' || complexity === 'medium' || complexity === 'high') {
    return complexity;
  }
  return 'medium'; // default
}

// Helper to map automation_category to readable agent type label
function mapAgentType(automationCategory: string | null): string {
  const categoryMap: Record<string, string> = {
    'fully_automatable': 'Fully Autonomous Agent',
    'highly_automatable': 'Autonomous Agent with Monitoring',
    'partially_automatable': 'Human-AI Collaborative Agent',
    'minimally_automatable': 'AI-Assisted Human Workflow',
    'not_automatable': 'Human-Only Workflow',
  };
  return categoryMap[automationCategory ?? ''] ?? 'Analysis Pending';
}

/**
 * Fetch tasks for a specific job with automation scores
 */
export async function fetchTasksForJob(jobId: string): Promise<Task[]> {
  const numericId = parseInt(jobId, 10);

  if (isNaN(numericId)) {
    return [];
  }

  const { data, error } = await supabase
    .from('job_tasks')
    .select('*, task_automation_scores(*)')
    .eq('job_posting_id', numericId)
    .order('task_sequence');

  if (error) {
    console.error('Error fetching tasks for job:', error);
    return [];
  }

  return (data ?? []).map((row): Task => {
    // The task_automation_scores is returned as an array (one-to-many relationship)
    // We take the first score if it exists
    const scores = row.task_automation_scores as Array<Record<string, unknown>> | null;
    const score = scores && scores.length > 0 ? scores[0] : null;

    const overallScore = score ? (score.overall_automation_score as number) ?? 0 : 0;
    const integrationComplexity = score ? (score.integration_complexity_score as number) ?? 50 : 50;

    return {
      id: String(row.id),
      jobId: String(row.job_posting_id),
      name: (row.task_text as string) ?? '',
      category: mapTaskCategory(row.task_category as string | null),
      judgmentLevel: mapLevel(row.requires_judgment as string | null),
      interactionLevel: mapLevel(row.requires_human_interaction as string | null),
      automationPercentage: overallScore,
      description: (row.task_text as string) ?? '',
      complexity: Math.ceil(integrationComplexity / 10), // Convert to 1-10 scale
    };
  });
}

/**
 * Fetch automation breakdown for a specific job
 */
export async function fetchAutomationBreakdown(jobId: string): Promise<AutomationBreakdown | null> {
  const numericId = parseInt(jobId, 10);

  if (isNaN(numericId)) {
    return null;
  }

  const { data, error } = await supabase
    .from('job_automation_summaries')
    .select('*')
    .eq('job_posting_id', numericId)
    .single();

  if (error || !data) {
    // No summary found - job may not have been analyzed yet
    if (error?.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is expected for unanalyzed jobs
      console.error('Error fetching automation breakdown:', error);
    }
    return null;
  }

  const fullyAutomatable = (data.tasks_fully_automatable_pct as number) ?? 0;
  const partiallyAutomatable = (data.tasks_partially_automatable_pct as number) ?? 0;
  const notAutomatable = (data.tasks_not_automatable_pct as number) ?? 0;

  return {
    automatable: Math.round(fullyAutomatable + partiallyAutomatable),
    humanRequired: Math.round(notAutomatable),
    complexity: mapComplexity(data.implementation_complexity as string | null),
  };
}

/**
 * Fetch AI blueprint for a specific job
 */
export async function fetchAIBlueprint(jobId: string): Promise<AIBlueprint | null> {
  const numericId = parseInt(jobId, 10);

  if (isNaN(numericId)) {
    return null;
  }

  const { data, error } = await supabase
    .from('job_automation_summaries')
    .select('*')
    .eq('job_posting_id', numericId)
    .single();

  if (error || !data) {
    // No summary found - job may not have been analyzed yet
    if (error?.code !== 'PGRST116') {
      console.error('Error fetching AI blueprint:', error);
    }
    return null;
  }

  return {
    agentType: mapAgentType(data.automation_category as string | null),
    systemsRequired: (data.recommended_ai_tools as string[]) ?? [],
    humanInLoopPoints: (data.primary_blockers as string[]) ?? [],
    implementationComplexity: mapComplexity(data.implementation_complexity as string | null),
  };
}

/**
 * Fetch company statistics aggregated from active job_postings
 * Aggregates by company_name: total_jobs, avg_automation, total_savings, industry (mode)
 */
export async function fetchCompanyStats(): Promise<Company[]> {
  const { data, error } = await supabase
    .from('job_postings')
    .select('company_name, overall_automation_pct, estimated_annual_savings, normalized_industry')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching company stats:', error);
    return [];
  }

  // Aggregate by company_name client-side
  const companyMap = new Map<string, {
    totalJobs: number;
    totalAutomation: number;
    totalSavings: number;
    industries: Map<string, number>;
  }>();

  for (const row of data ?? []) {
    const companyName = (row.company_name as string) ?? 'Unknown';
    const automation = (row.overall_automation_pct as number) ?? 0;
    const savings = Number(row.estimated_annual_savings) ?? 0;
    const industry = (row.normalized_industry as string) ?? 'Unknown';

    const existing = companyMap.get(companyName) ?? {
      totalJobs: 0,
      totalAutomation: 0,
      totalSavings: 0,
      industries: new Map<string, number>(),
    };

    existing.totalJobs += 1;
    existing.totalAutomation += automation;
    existing.totalSavings += savings;
    existing.industries.set(industry, (existing.industries.get(industry) ?? 0) + 1);

    companyMap.set(companyName, existing);
  }

  // Convert to Company array
  const companies: Company[] = [];

  Array.from(companyMap.entries()).forEach(([name, stats]) => {
    // Find the most common industry (mode)
    let modeIndustry = 'Unknown';
    let maxCount = 0;
    Array.from(stats.industries.entries()).forEach(([industry, count]) => {
      if (count > maxCount) {
        maxCount = count;
        modeIndustry = industry;
      }
    });

    companies.push({
      id: name, // Use company name as ID since we don't have a companies table
      name,
      industry: modeIndustry,
      size: 'Unknown', // Size not available from job_postings
      totalJobs: stats.totalJobs,
      avgAutomation: stats.totalJobs > 0 ? Math.round(stats.totalAutomation / stats.totalJobs) : 0,
      totalSavings: stats.totalSavings,
    });
  });

  // Sort by total jobs descending
  companies.sort((a, b) => b.totalJobs - a.totalJobs);

  return companies;
}

/**
 * Fetch auto-generated opportunities from job_postings
 * Groups by company_name + normalized_role_family where overall_automation_pct > 70
 */
export async function fetchOpportunities(): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from('job_postings')
    .select('company_name, normalized_role_family, overall_automation_pct, estimated_annual_savings, salary_min, salary_max')
    .eq('is_active', true)
    .gt('overall_automation_pct', 70);

  if (error) {
    console.error('Error fetching opportunities:', error);
    return [];
  }

  // Group by company_name + normalized_role_family
  const opportunityMap = new Map<string, {
    company: string;
    role: string;
    totalRoles: number;
    totalSalary: number;
    totalAutomation: number;
    totalSavings: number;
  }>();

  for (const row of data ?? []) {
    const company = (row.company_name as string) ?? 'Unknown';
    const role = (row.normalized_role_family as string) ?? 'General';
    const automation = (row.overall_automation_pct as number) ?? 0;
    const savings = Number(row.estimated_annual_savings) ?? 0;
    const salaryMin = (row.salary_min as number) ?? 0;
    const salaryMax = (row.salary_max as number) ?? 0;
    const salaryMidpoint = (salaryMin + salaryMax) / 2;

    const key = `${company}::${role}`;
    const existing = opportunityMap.get(key) ?? {
      company,
      role,
      totalRoles: 0,
      totalSalary: 0,
      totalAutomation: 0,
      totalSavings: 0,
    };

    existing.totalRoles += 1;
    existing.totalSalary += salaryMidpoint;
    existing.totalAutomation += automation;
    existing.totalSavings += savings;

    opportunityMap.set(key, existing);
  }

  // Convert to Opportunity array
  const opportunities: Opportunity[] = [];
  let idCounter = 1;

  Array.from(opportunityMap.values()).forEach((stats) => {
    opportunities.push({
      id: String(idCounter++),
      company: stats.company,
      role: stats.role,
      totalRoles: stats.totalRoles,
      avgSalary: stats.totalRoles > 0 ? Math.round(stats.totalSalary / stats.totalRoles) : 0,
      automationPercentage: stats.totalRoles > 0 ? Math.round(stats.totalAutomation / stats.totalRoles) : 0,
      estimatedSavings: stats.totalSavings,
      status: 'new', // All auto-generated opportunities start as 'new'
    });
  });

  // Sort by estimated savings descending
  opportunities.sort((a, b) => b.estimatedSavings - a.estimatedSavings);

  return opportunities;
}

// Types for source statistics
export interface SourceStats {
  id: string;
  companyName: string;
  sourceType: string;
  careersUrl: string;
  lastScrapeTimestamp: string;
  totalJobsScraped: number;
  successRate: number;
  totalRuns: number;
  successfulRuns: number;
}

/**
 * Fetch source statistics from scrape_runs
 * Groups by company_name + source_type + careers_url
 */
export async function fetchSources(): Promise<SourceStats[]> {
  const { data, error } = await supabase
    .from('scrape_runs')
    .select('company_name, source_type, careers_url, started_at, jobs_found, jobs_inserted, jobs_updated, status, errors_count')
    .order('started_at', { ascending: false });

  if (error) {
    console.error('Error fetching sources:', error);
    return [];
  }

  // Group by company_name + source_type + careers_url
  const sourceMap = new Map<string, {
    companyName: string;
    sourceType: string;
    careersUrl: string;
    lastScrapeTimestamp: string;
    totalJobsScraped: number;
    totalRuns: number;
    successfulRuns: number;
    totalJobsFound: number;
    totalJobsProcessed: number;
  }>();

  for (const row of data ?? []) {
    const companyName = (row.company_name as string) ?? 'Unknown';
    const sourceType = (row.source_type as string) ?? 'unknown';
    const careersUrl = (row.careers_url as string) ?? '';
    const startedAt = (row.started_at as string) ?? '';
    const jobsFound = (row.jobs_found as number) ?? 0;
    const jobsInserted = (row.jobs_inserted as number) ?? 0;
    const jobsUpdated = (row.jobs_updated as number) ?? 0;
    const status = (row.status as string) ?? '';
    const errorsCount = (row.errors_count as number) ?? 0;

    const key = `${companyName}::${sourceType}::${careersUrl}`;
    const existing = sourceMap.get(key);

    if (!existing) {
      // First run for this source - this will be the most recent due to ordering
      sourceMap.set(key, {
        companyName,
        sourceType,
        careersUrl,
        lastScrapeTimestamp: startedAt,
        totalJobsScraped: jobsFound,
        totalRuns: 1,
        successfulRuns: status === 'success' && errorsCount === 0 ? 1 : 0,
        totalJobsFound: jobsFound,
        totalJobsProcessed: jobsInserted + jobsUpdated,
      });
    } else {
      // Accumulate stats
      existing.totalJobsScraped += jobsFound;
      existing.totalRuns += 1;
      if (status === 'success' && errorsCount === 0) {
        existing.successfulRuns += 1;
      }
      existing.totalJobsFound += jobsFound;
      existing.totalJobsProcessed += jobsInserted + jobsUpdated;
    }
  }

  // Convert to SourceStats array
  const sources: SourceStats[] = [];
  let idCounter = 1;

  Array.from(sourceMap.values()).forEach((stats) => {
    const successRate = stats.totalRuns > 0
      ? Math.round((stats.successfulRuns / stats.totalRuns) * 100)
      : 0;

    sources.push({
      id: String(idCounter++),
      companyName: stats.companyName,
      sourceType: stats.sourceType,
      careersUrl: stats.careersUrl,
      lastScrapeTimestamp: stats.lastScrapeTimestamp,
      totalJobsScraped: stats.totalJobsScraped,
      successRate,
      totalRuns: stats.totalRuns,
      successfulRuns: stats.successfulRuns,
    });
  });

  // Sort by last scrape timestamp descending
  sources.sort((a, b) =>
    new Date(b.lastScrapeTimestamp).getTime() - new Date(a.lastScrapeTimestamp).getTime()
  );

  return sources;
}
