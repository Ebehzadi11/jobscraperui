export interface Job {
  id: string;
  company: string;
  title: string;
  location: string;
  remoteType: 'remote' | 'hybrid' | 'onsite';
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  automationPercentage: number;
  opportunityScore: number;
  estimatedSavings: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
  tools: string[];
  skills: string[];
  lastUpdated: string;
  status: 'active' | 'archived';
  sourceUrl: string;
  seniority?: string;
  employmentType?: string;
  department?: string;
}

export interface Task {
  id: string;
  jobId: string;
  name: string;
  category: 'communication' | 'data-analysis' | 'documentation' | 'research' | 'coordination' | 'technical';
  judgmentLevel: 'low' | 'medium' | 'high';
  interactionLevel: 'low' | 'medium' | 'high';
  automationPercentage: number;
  description: string;
  complexity: number;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  totalJobs: number;
  avgAutomation: number;
  totalSavings: number;
}

export interface Opportunity {
  id: string;
  company: string;
  role: string;
  totalRoles: number;
  avgSalary: number;
  automationPercentage: number;
  estimatedSavings: number;
  status: 'new' | 'contacted' | 'in-progress' | 'closed';
}

export interface ScraperRun {
  id: string;
  source: string;
  status: 'success' | 'partial' | 'failed';
  jobsScraped: number;
  successRate: number;
  errors: number;
  timestamp: string;
  duration: number;
}

export interface AutomationBreakdown {
  automatable: number;
  humanRequired: number;
  complexity: 'low' | 'medium' | 'high';
}

export interface AIBlueprint {
  agentType: string;
  systemsRequired: string[];
  humanInLoopPoints: string[];
  implementationComplexity: 'low' | 'medium' | 'high';
}
