import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { ScraperRun } from '@/lib/types';

interface RecentActivityProps {
  runs: ScraperRun[];
}

export function RecentActivity({ runs }: RecentActivityProps) {
  if (runs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Scraper Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            No recent scraper activity
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Scraper Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {runs.map((run) => (
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
