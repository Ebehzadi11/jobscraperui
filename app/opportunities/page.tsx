'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { mockOpportunities } from '@/lib/mock-data';
import { Opportunity } from '@/lib/types';
import { TrendingUp, DollarSign, Building2, FileText, Send, ShoppingCart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function OpportunitiesPage() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalRoles = mockOpportunities.reduce((sum, opp) => sum + opp.totalRoles, 0);
  const totalSalary = mockOpportunities.reduce((sum, opp) => sum + opp.avgSalary * opp.totalRoles, 0);
  const totalSavings = mockOpportunities.reduce((sum, opp) => sum + opp.estimatedSavings, 0);
  const avgAutomation = Math.round(
    mockOpportunities.reduce((sum, opp) => sum + opp.automationPercentage, 0) / mockOpportunities.length
  );

  const handleRowClick = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setDrawerOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Opportunities</h1>
          <p className="text-muted-foreground mt-1">
            High-value automation opportunities for customer outreach
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Total Open Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalRoles}</div>
              <p className="text-xs text-muted-foreground mt-1">across all opportunities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Salary Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${(totalSalary / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-muted-foreground mt-1">annual compensation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Potential Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ${(totalSavings / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-muted-foreground mt-1">estimated annual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Automation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{avgAutomation}%</div>
              <p className="text-xs text-muted-foreground mt-1">automation potential</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Opportunity Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Open Roles</TableHead>
                    <TableHead>Avg Salary</TableHead>
                    <TableHead>Automation %</TableHead>
                    <TableHead>Est. Savings</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOpportunities.map((opp) => (
                    <TableRow
                      key={opp.id}
                      onClick={() => handleRowClick(opp)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">{opp.company}</TableCell>
                      <TableCell>{opp.role}</TableCell>
                      <TableCell>{opp.totalRoles}</TableCell>
                      <TableCell>${(opp.avgSalary / 1000).toFixed(0)}K</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 rounded-full bg-muted h-2">
                            <div
                              className={cn(
                                'h-2 rounded-full',
                                opp.automationPercentage >= 80
                                  ? 'bg-green-500'
                                  : opp.automationPercentage >= 60
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              )}
                              style={{ width: `${opp.automationPercentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold">{opp.automationPercentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold text-green-600">
                          ${(opp.estimatedSavings / 1000).toFixed(0)}K
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={opp.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedOpportunity && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl">Opportunity Details</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">{selectedOpportunity.company}</h3>
                  <p className="text-muted-foreground">{selectedOpportunity.role}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950">
                    <p className="text-sm text-muted-foreground">Open Roles</p>
                    <p className="mt-2 text-2xl font-bold">{selectedOpportunity.totalRoles}</p>
                  </div>

                  <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-950">
                    <p className="text-sm text-muted-foreground">Automation %</p>
                    <p className="mt-2 text-2xl font-bold text-green-700 dark:text-green-300">
                      {selectedOpportunity.automationPercentage}%
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border p-4 bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">Total Salary Budget</p>
                    <p className="text-lg font-bold">
                      ${((selectedOpportunity.avgSalary * selectedOpportunity.totalRoles) / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Estimated Annual Savings</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${(selectedOpportunity.estimatedSavings / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-semibold mb-2">Current Status</p>
                  <StatusBadge status={selectedOpportunity.status} />
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Next Actions</h4>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Detailed Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Send className="mr-2 h-4 w-4" />
                      Start Outreach Campaign
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Send to Marketplace
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Opportunity identified based on role automation analysis and hiring patterns.
                    Contact sales for detailed implementation strategy.
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
