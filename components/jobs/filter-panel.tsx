'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
  companyOptions?: string[];
}

export interface FilterState {
  companies: string[];
  remoteTypes: string[];
  automationRange: [number, number];
}

export function FilterPanel({ onFilterChange, companyOptions = [] }: FilterPanelProps) {
  const [companies, setCompanies] = useState<string[]>([]);
  const [remoteTypes, setRemoteTypes] = useState<string[]>([]);
  const [automationRange, setAutomationRange] = useState<[number, number]>([0, 100]);

  const remoteOptions = [
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'On-site' },
  ];

  const handleCompanyChange = (company: string, checked: boolean) => {
    const updated = checked
      ? [...companies, company]
      : companies.filter((c) => c !== company);
    setCompanies(updated);
    onFilterChange({ companies: updated, remoteTypes, automationRange });
  };

  const handleRemoteTypeChange = (type: string, checked: boolean) => {
    const updated = checked
      ? [...remoteTypes, type]
      : remoteTypes.filter((t) => t !== type);
    setRemoteTypes(updated);
    onFilterChange({ companies, remoteTypes: updated, automationRange });
  };

  const handleAutomationChange = (value: number[]) => {
    const range: [number, number] = [value[0], value[1]];
    setAutomationRange(range);
    onFilterChange({ companies, remoteTypes, automationRange: range });
  };

  const clearFilters = () => {
    setCompanies([]);
    setRemoteTypes([]);
    setAutomationRange([0, 100]);
    onFilterChange({ companies: [], remoteTypes: [], automationRange: [0, 100] });
  };

  return (
    <Card className="h-fit">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Filters</CardTitle>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Company</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {companyOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No companies available</p>
            ) : (
              companyOptions.map((company) => (
                <div key={company} className="flex items-center space-x-2">
                  <Checkbox
                    id={`company-${company}`}
                    checked={companies.includes(company)}
                    onCheckedChange={(checked) => handleCompanyChange(company, !!checked)}
                  />
                  <label
                    htmlFor={`company-${company}`}
                    className="text-sm cursor-pointer"
                  >
                    {company}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-semibold">Remote Type</Label>
          <div className="space-y-2">
            {remoteOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`remote-${option.value}`}
                  checked={remoteTypes.includes(option.value)}
                  onCheckedChange={(checked) => handleRemoteTypeChange(option.value, !!checked)}
                />
                <label
                  htmlFor={`remote-${option.value}`}
                  className="text-sm cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Automation %</Label>
            <span className="text-sm text-muted-foreground">
              {automationRange[0]}% - {automationRange[1]}%
            </span>
          </div>
          <Slider
            value={automationRange}
            onValueChange={handleAutomationChange}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
