import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TaskBreakdownTable } from '@/components/job-detail/task-breakdown-table';
import { AutomationSummary } from '@/components/job-detail/automation-summary';
import { AIBlueprintCard } from '@/components/job-detail/ai-blueprint';
import { getJobById, getTasksByJobId, getAutomationBreakdown, getAIBlueprint } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { Save, Download, FileText, MapPin, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const job = getJobById(params.id);

  if (!job) {
    notFound();
  }

  const tasks = getTasksByJobId(job.id);
  const breakdown = getAutomationBreakdown(job.id);
  const blueprint = getAIBlueprint(job.id);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/jobs"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to Jobs
              </Link>
            </div>
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <h2 className="text-xl text-muted-foreground mt-1">{job.company}</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Automation Potential
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {job.automationPercentage}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Opportunity Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {job.opportunityScore}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Estimated Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${(job.estimatedSavings / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-muted-foreground mt-1">per year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Salary Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(job.salaryMin / 1000).toFixed(0)}K - ${(job.salaryMax / 1000).toFixed(0)}K
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{job.location}</span>
                    <Badge variant="outline" className="ml-1 capitalize">
                      {job.remoteType}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${(job.salaryMin / 1000).toFixed(0)}K - ${(job.salaryMax / 1000).toFixed(0)}K {job.salaryCurrency}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Updated {new Date(job.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{job.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Key Responsibilities</h3>
                  <ul className="space-y-1">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <ul className="space-y-1">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Tools & Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.tools.map((tool) => (
                      <Badge key={tool} variant="secondary">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <AutomationSummary breakdown={breakdown} />

            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Salary</span>
                  <span className="font-semibold">${((job.salaryMin + job.salaryMax) / 2000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Automatable Portion</span>
                  <span className="font-semibold text-green-600">{job.automationPercentage}%</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Annual Savings</span>
                  <span className="text-xl font-bold text-green-600">
                    ${(job.estimatedSavings / 1000).toFixed(0)}K
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Based on automation potential and average compensation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Task Breakdown</h2>
            <p className="text-muted-foreground">
              Detailed analysis of individual tasks and their automation potential
            </p>
          </div>
          <TaskBreakdownTable tasks={tasks} />
        </div>

        <AIBlueprintCard blueprint={blueprint} />

        <div className="flex justify-center">
          <Button variant="outline" asChild>
            <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer">
              View Original Job Posting
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
