import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIBlueprint } from '@/lib/types';
import { Cpu, Database, CircleAlert as AlertCircle, Zap } from 'lucide-react';

interface AIBlueprintProps {
  blueprint: AIBlueprint;
}

export function AIBlueprintCard({ blueprint }: AIBlueprintProps) {
  const complexityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          AI Agent Blueprint
          <Badge className={complexityColors[blueprint.implementationComplexity] + ' border-0 capitalize'}>
            {blueprint.implementationComplexity} complexity
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold mb-2">
            <Cpu className="h-4 w-4 text-blue-600" />
            Agent Type
          </div>
          <p className="text-sm text-muted-foreground">{blueprint.agentType}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm font-semibold mb-2">
            <Database className="h-4 w-4 text-blue-600" />
            Systems Required
          </div>
          <div className="flex flex-wrap gap-2">
            {blueprint.systemsRequired.map((system) => (
              <Badge key={system} variant="secondary">
                {system}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm font-semibold mb-2">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            Human-in-Loop Points
          </div>
          <ul className="space-y-1">
            {blueprint.humanInLoopPoints.map((point) => (
              <li key={point} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-orange-600 mt-0.5">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="h-3 w-3" />
            This is a preliminary automation blueprint based on role analysis
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
