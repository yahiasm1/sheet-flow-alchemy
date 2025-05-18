
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApiIntegration } from '@/contexts/ApiIntegrationContext';
import { ApiIntegration } from '@/types/worksheet';

interface ApiIntegrationsListProps {
  worksheetId: string;
  onCreateNew: () => void;
}

export default function ApiIntegrationsList({ worksheetId, onCreateNew }: ApiIntegrationsListProps) {
  const { getIntegrationsForWorksheet, executeApiIntegration, deleteApiIntegration } = useApiIntegration();
  const integrations = getIntegrationsForWorksheet(worksheetId);
  
  const handleRunIntegration = async (integrationId: string) => {
    await executeApiIntegration(worksheetId, integrationId);
  };
  
  const handleDeleteIntegration = (integrationId: string) => {
    if (confirm('Are you sure you want to delete this integration?')) {
      deleteApiIntegration(worksheetId, integrationId);
    }
  };
  
  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">API Integrations</h3>
        <Button onClick={onCreateNew}>Add Integration</Button>
      </div>
      
      {integrations.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
          <p className="text-gray-500">No API integrations configured.</p>
          <Button onClick={onCreateNew} variant="outline" className="mt-4">
            Create Your First Integration
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {integrations.map((integration: ApiIntegration) => (
            <Card key={integration.id}>
              <CardHeader>
                <CardTitle>{integration.name}</CardTitle>
                <CardDescription className="truncate">{integration.url}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Method:</span> {integration.method}
                  </div>
                  <div>
                    <span className="font-medium">Last Run:</span> {formatDate(integration.schedule?.lastRun)}
                  </div>
                  <div>
                    <span className="font-medium">Fields Mapped:</span> {Object.keys(integration.responseMapping).length}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteIntegration(integration.id)}
                >
                  Delete
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleRunIntegration(integration.id)}
                >
                  Run Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
