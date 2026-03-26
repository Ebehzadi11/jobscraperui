import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { fetchScraperRuns } from '@/lib/queries';
import { Activity, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default async function AdminPage() {
  const scraperRuns = await fetchScraperRuns();

  const successfulRuns = scraperRuns.filter((run) => run.status === 'success').length;
  const failedRuns = scraperRuns.filter((run) => run.status === 'failed').length;
  const totalJobsScraped = scraperRuns.reduce((sum, run) => sum + run.jobsScraped, 0);
  const avgSuccessRate = scraperRuns.length > 0
    ? (scraperRuns.reduce((sum, run) => sum + run.successRate, 0) / scraperRuns.length).toFixed(1)
    : '0.0';

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin</h1>
            <p className="text-muted-foreground mt-1">
              Monitor scraper health and job ingestion status
            </p>
          </div>
          <Button>
            <RefreshCw className="mr-2 h-4 w-4" />
            Run All Scrapers
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Total Runs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{scraperRuns.length}</div>
              <p className="text-xs text-muted-foreground mt-1">last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Successful
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{successfulRuns}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {scraperRuns.length > 0 ? ((successfulRuns / scraperRuns.length) * 100).toFixed(0) : 0}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{failedRuns}</div>
              <p className="text-xs text-muted-foreground mt-1">requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Jobs Scraped
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalJobsScraped.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">total ingested</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Scraper Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Jobs Scraped</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Errors</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scraperRuns.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">{run.source}</TableCell>
                      <TableCell>
                        <StatusBadge status={run.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {run.status === 'success' && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          {run.status === 'partial' && (
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                          )}
                          {run.status === 'failed' && (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-semibold">{run.jobsScraped}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 rounded-full bg-muted h-2">
                            <div
                              className={
                                run.successRate >= 95
                                  ? 'h-2 rounded-full bg-green-500'
                                  : run.successRate >= 80
                                  ? 'h-2 rounded-full bg-yellow-500'
                                  : 'h-2 rounded-full bg-red-500'
                              }
                              style={{ width: `${run.successRate}%` }}
                            />
                          </div>
                          <span className="text-sm">{run.successRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {run.errors > 0 ? (
                          <Badge variant="destructive">{run.errors}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {run.duration}s
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(run.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Source Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from(new Set(scraperRuns.map((r) => r.source))).map((source) => {
                  const sourceRuns = scraperRuns.filter((r) => r.source === source);
                  const avgRate =
                    sourceRuns.reduce((sum, r) => sum + r.successRate, 0) / sourceRuns.length;
                  const health =
                    avgRate >= 95 ? 'Healthy' : avgRate >= 80 ? 'Warning' : 'Critical';
                  return (
                    <div key={source} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{source}</p>
                        <p className="text-xs text-muted-foreground">
                          {avgRate.toFixed(1)}% avg success rate
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

          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scraperRuns
                  .filter((run) => run.errors > 0)
                  .slice(0, 5)
                  .map((run) => (
                    <div key={run.id} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium">{run.source}</p>
                          <p className="text-xs text-muted-foreground">
                            {run.errors} errors during scrape
                          </p>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          {run.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(run.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
