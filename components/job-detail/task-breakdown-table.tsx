import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TaskBreakdownTableProps {
  tasks: Task[];
}

export function TaskBreakdownTable({ tasks }: TaskBreakdownTableProps) {
  const getAutomationColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 dark:bg-green-950';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950';
    return 'text-red-600 bg-red-50 dark:bg-red-950';
  };

  const getLevelBadge = (level: string) => {
    const variants = {
      low: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
      high: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    };
    return variants[level as keyof typeof variants] || variants.medium;
  };

  return (
    <div className="rounded-lg border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35%]">Task Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Judgment</TableHead>
            <TableHead>Interaction</TableHead>
            <TableHead>Automation %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{task.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {task.category.replace('-', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn(getLevelBadge(task.judgmentLevel), 'border-0 capitalize')}>
                  {task.judgmentLevel}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn(getLevelBadge(task.interactionLevel), 'border-0 capitalize')}>
                  {task.interactionLevel}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className={cn(
                          'h-2 rounded-full',
                          task.automationPercentage >= 80 ? 'bg-green-500' :
                          task.automationPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        )}
                        style={{ width: `${task.automationPercentage}%` }}
                      />
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-semibold w-12 text-right',
                      task.automationPercentage >= 80 ? 'text-green-600' :
                      task.automationPercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                    )}
                  >
                    {task.automationPercentage}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
