'use client';

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { JobsTable } from '@/components/jobs/jobs-table';
import { FilterPanel, FilterState } from '@/components/jobs/filter-panel';
import { PreviewDrawer } from '@/components/jobs/preview-drawer';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { mockJobs } from '@/lib/mock-data';
import { Job } from '@/lib/types';

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    companies: [],
    remoteTypes: [],
    automationRange: [0, 100],
  });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredJobs = useMemo(() => {
    return mockJobs.filter((job) => {
      const matchesSearch =
        searchQuery === '' ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCompany =
        filters.companies.length === 0 || filters.companies.includes(job.company);

      const matchesRemoteType =
        filters.remoteTypes.length === 0 || filters.remoteTypes.includes(job.remoteType);

      const matchesAutomation =
        job.automationPercentage >= filters.automationRange[0] &&
        job.automationPercentage <= filters.automationRange[1];

      return matchesSearch && matchesCompany && matchesRemoteType && matchesAutomation;
    });
  }, [searchQuery, filters]);

  const handleRowClick = (job: Job) => {
    setSelectedJob(job);
    setDrawerOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-muted-foreground mt-1">
            Analyze and explore job automation opportunities
          </p>
        </div>

        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0">
            <FilterPanel onFilterChange={setFilters} />
          </div>

          <div className="flex-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by role title or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {filteredJobs.length} of {mockJobs.length} jobs
              </span>
            </div>

            <JobsTable data={filteredJobs} onRowClick={handleRowClick} />
          </div>
        </div>
      </div>

      <PreviewDrawer
        job={selectedJob}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </AppLayout>
  );
}
