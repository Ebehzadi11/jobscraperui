'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AutomationBreakdown } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';

interface AutomationSummaryProps {
  breakdown: AutomationBreakdown;
}

export function AutomationSummary({ breakdown }: AutomationSummaryProps) {
  const data = [
    { name: 'Automatable', value: breakdown.automatable },
    { name: 'Human Required', value: breakdown.humanRequired },
  ];

  const COLORS = ['#10b981', '#94a3b8'];

  const complexityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automation Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Automatable</span>
            <span className="text-2xl font-bold text-green-600">{breakdown.automatable}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Human Required</span>
            <span className="text-2xl font-bold text-gray-600">{breakdown.humanRequired}%</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-sm text-muted-foreground">Implementation Complexity</span>
            <Badge className={complexityColors[breakdown.complexity] + ' border-0 capitalize'}>
              {breakdown.complexity}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
