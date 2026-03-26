import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchSources } from '@/lib/queries';
import { Database, Building2, Globe, CircleCheck as CheckCircle, Activity, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function SourcesPage() {
  const sources = await fetchSources();

  const totalSources = sources.length;
  const totalJobsScraped = sources.reduce((sum, source) => sum + source.totalJobsScraped, 0);
  const avgSuccessRate = sources.length > 0
    ? Math.round(sources.reduce((sum, source) => sum + source.successRate, 0) / sources.length)
    : 0;
  const totalRuns = sources.reduce((sum, source) => sum + source.totalRuns, 0);

  // Group sources by company for the health overview
  const companyMap = new Map<string, { sources: number; avgRate: number; totalJobs: number }>();
  for (const source of sources) {
    const existing = companyMap.get(source.companyName) ?? { sources: 0, avgRate: 0, totalJobs: 0 };
    companyMap.set(source.companyName, {
      sources: existing.sources + 1,
      avgRate: existing.sources > 0
        ? (existing.avgRate * existing.sources + source.successRate) / (existing.sources + 1)
        : source.successRate,
      totalJobs: existing.totalJobs + source.totalJobsScraped,
    });
  }

  const companyStats = Array.from(companyMap.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.totalJobs - a.totalJobs)
    .slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sources</h1>
          <p className="text-muted-foreground mt-1">
            Manage job data sources and track scraper performance
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Database className="h-4 w-4" />
                Total Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSources}</div>
              <p className="text-xs text-muted-foreground mt-1">active data sources</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Jobs Scraped
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalJobsScraped.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">total jobs collected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Avg Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{avgSuccessRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">across all sources</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Total Runs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalRuns.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">scrape runs executed</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Data Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Database className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Sources Yet</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Sources will appear here once the scraper has run.
                  Check the admin page for scraper status.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Source Type</TableHead>
                      <TableHead>Careers URL</TableHead>
                      <TableHead>Last Scrape</TableHead>
                      <TableHead>Jobs Scraped</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Total Runs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sources.map((source) => (
                      <TableRow key={source.id}>
                        <TableCell className="font-medium">{source.companyName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {source.sourceType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {source.careersUrl ? (
                            <Button variant="ghost" size="sm" asChild className="h-auto p-0">
                              <Link
                                href={source.careersUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                              >
                                <span className="max-w-[200px] truncate">{source.careersUrl}</span>
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {source.lastScrapeTimestamp
                            ? new Date(source.lastScrapeTimestamp).toLocaleString()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">{source.totalJobsScraped.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 rounded-full bg-muted h-2">
                              <div
                                className={
                                  source.successRate >= 95
                                    ? 'h-2 rounded-full bg-green-500'
                                    : source.successRate >= 80
                                    ? 'h-2 rounded-full bg-yellow-500'
                                    : 'h-2 rounded-full bg-red-500'
                                }
                                style={{ width: `${source.successRate}%` }}
                              />
                            </div>
                            <span className="text-sm">{source.successRate}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {source.totalRuns}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {companyStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Companies by Jobs Scraped</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companyStats.map((company) => {
                  const health =
                    company.avgRate >= 95 ? 'Healthy' : company.avgRate >= 80 ? 'Warning' : 'Critical';
                  return (
                    <div key={company.name} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{company.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {company.sources} source{company.sources !== 1 ? 's' : ''} • {company.totalJobs.toLocaleString()} jobs
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          health === 'Healthy'
                            ? 'bg-green-100 text-green-800 border-0 dark:bg-green-950 dark:text-green-300'
                            : health === 'Warning'
                            ? 'bg-yellow-100 text-yellow-800 border-0 dark:bg-yellow-950 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 border-0 dark:bg-red-950 dark:text-red-300'
                        }
                      >
                        {health}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
