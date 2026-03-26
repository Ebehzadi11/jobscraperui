import { AppLayout } from '@/components/layout/app-layout';
import { KPICard } from '@/components/dashboard/kpi-card';
import { AutomationChart } from '@/components/dashboard/automation-chart';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Building2, Percent, TrendingUp, ArrowRight } from 'lucide-react';
import { fetchDashboardStats, fetchJobs, fetchScraperRuns, fetchIndustryStats, fetchCompanyStats } from '@/lib/queries';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  // Fetch all data in parallel
  const [stats, jobs, scraperRuns, industryStats, companyStats] = await Promise.all([
    fetchDashboardStats(),
    fetchJobs(),
    fetchScraperRuns(5),
    fetchIndustryStats(),
    fetchCompanyStats(),
  ]);

  // Get top automatable roles (sorted by automation percentage)
  const topAutomatableRoles = [...jobs]
    .sort((a, b) => b.automationPercentage - a.automationPercentage)
    .slice(0, 5);

  // Get top companies by job count (using fetchCompanyStats data)
  const topCompanies = companyStats.slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of job automation intelligence and opportunities
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Jobs Analyzed"
            value={stats.totalJobs}
            change={`${stats.jobsAddedToday} added today`}
            changeType={stats.jobsAddedToday > 0 ? 'positive' : 'neutral'}
            icon={Briefcase}
          />
          <KPICard
            title="Companies Tracked"
            value={stats.activeCompanies}
            change="active companies"
            changeType="neutral"
            icon={Building2}
          />
          <KPICard
            title="Avg Automation Potential"
            value={`${stats.avgAutomation}%`}
            change="across all roles"
            changeType="neutral"
            icon={Percent}
            iconColor="text-green-600"
          />
          <KPICard
            title="High Opportunity Roles"
            value={stats.highOpportunityCount}
            change=">75% automation"
            changeType="neutral"
            icon={TrendingUp}
            iconColor="text-orange-600"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top Automatable Roles</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/jobs">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {topAutomatableRoles.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  No jobs available
                </div>
              ) : (
                <div className="space-y-4">
                  {topAutomatableRoles.map((job) => (
                    <div key={job.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex-1">
                        <Link href={`/jobs/${job.id}`} className="text-sm font-medium hover:text-blue-600">
                          {job.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">{job.company}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">
                            {job.automationPercentage}%
                          </p>
                          <p className="text-xs text-muted-foreground">automation</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            ${(job.estimatedSavings / 1000).toFixed(0)}K
                          </p>
                          <p className="text-xs text-muted-foreground">savings</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top Companies Hiring</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/opportunities">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {topCompanies.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  No companies available
                </div>
              ) : (
                <div className="space-y-4">
                  {topCompanies.map((company) => (
                    <div key={company.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{company.name}</p>
                        <p className="text-xs text-muted-foreground">{company.industry}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold">{company.totalJobs}</p>
                          <p className="text-xs text-muted-foreground">jobs</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-blue-600">
                            {company.avgAutomation}%
                          </p>
                          <p className="text-xs text-muted-foreground">avg auto</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <AutomationChart data={industryStats} />

        <RecentActivity runs={scraperRuns} />
      </div>
    </AppLayout>
  );
}
