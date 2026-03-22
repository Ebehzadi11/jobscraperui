import { cn } from '@/lib/utils';
import { Badge } from './badge';

interface StatusBadgeProps {
  status: 'success' | 'partial' | 'failed' | 'active' | 'archived' | 'new' | 'contacted' | 'in-progress' | 'closed';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    success: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
    partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    active: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    archived: 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300',
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    contacted: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    'in-progress': 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300',
  };

  return (
    <Badge
      variant="outline"
      className={cn(variants[status], 'border-0', className)}
    >
      {status}
    </Badge>
  );
}
