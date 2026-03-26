'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/lib/types';
import { ExternalLink, MapPin, DollarSign, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

interface PreviewDrawerProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
}

export function PreviewDrawer({ job, open, onClose }: PreviewDrawerProps) {
  if (!job) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{job.title}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold">{job.company}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location}
              </div>
              <Badge variant="outline">{job.remoteType}</Badge>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                ${(job.salaryMin / 1000).toFixed(0)}K - ${(job.salaryMax / 1000).toFixed(0)}K
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-950">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                Automation %
              </div>
              <p className="mt-2 text-2xl font-bold text-green-700 dark:text-green-300">
                {job.automationPercentage}%
              </p>
            </div>

            <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Opportunity Score
              </div>
              <p className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-300">
                {job.opportunityScore}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground">Estimated Savings</p>
            <p className="mt-1 text-2xl font-bold">
              ${(job.estimatedSavings / 1000).toFixed(0)}K
              <span className="text-sm font-normal text-muted-foreground">/year</span>
            </p>
          </div>

          <Separator />

          {(job.tools.length > 0 || job.skills.length > 0) && (
            <div className="space-y-3">
              {job.tools.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.tools.map((tool) => (
                      <Badge key={tool} variant="secondary">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {job.skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Separator />

          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href={`/jobs/${job.id}`}>
                View Full Details
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
