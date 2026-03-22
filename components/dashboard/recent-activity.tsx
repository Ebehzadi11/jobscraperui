import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { mockScraperRuns } from '@/lib/mock-data';

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Scraper Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockScraperRuns.slice(0, 5).map((run) => (
            <div key={run.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
              <div className="flex-1">
                <p className="text-sm font-medium">{run.source}</p>
                <p className="text-xs text-muted-foreground">
                  {run.jobsScraped} jobs • {run.successRate}% success
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {new Date(run.timestamp).toLocaleTimeString()}
                </span>
                <StatusBadge status={run.status} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
