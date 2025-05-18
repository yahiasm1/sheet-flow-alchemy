
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ApiIntegration } from '@/types/worksheet';
import { useToast } from '@/components/ui/use-toast';
import { useWorksheet } from './WorksheetContext';

interface ApiIntegrationContextType {
  apiIntegrations: Record<string, ApiIntegration[]>; // Key is worksheetId
  createApiIntegration: (worksheetId: string, integration: Omit<ApiIntegration, 'id'>) => void;
  updateApiIntegration: (worksheetId: string, integrationId: string, updates: Partial<ApiIntegration>) => void;
  deleteApiIntegration: (worksheetId: string, integrationId: string) => void;
  executeApiIntegration: (worksheetId: string, integrationId: string) => Promise<boolean>;
  getIntegrationsForWorksheet: (worksheetId: string) => ApiIntegration[];
}

const ApiIntegrationContext = createContext<ApiIntegrationContextType | undefined>(undefined);

export function ApiIntegrationProvider({ children }: { children: ReactNode }) {
  const [apiIntegrations, setApiIntegrations] = useState<Record<string, ApiIntegration[]>>({});
  const { toast } = useToast();
  const { activeWorksheet, addRow, updateCell } = useWorksheet();

  const createApiIntegration = (worksheetId: string, integration: Omit<ApiIntegration, 'id'>) => {
    const newIntegration: ApiIntegration = {
      ...integration,
      id: uuidv4()
    };
    
    setApiIntegrations(prev => ({
      ...prev,
      [worksheetId]: [...(prev[worksheetId] || []), newIntegration]
    }));
    
    toast({
      title: "API Integration created",
      description: `"${integration.name}" has been added.`
    });
  };

  const updateApiIntegration = (worksheetId: string, integrationId: string, updates: Partial<ApiIntegration>) => {
    setApiIntegrations(prev => {
      const worksheetIntegrations = prev[worksheetId] || [];
      const updatedIntegrations = worksheetIntegrations.map(integration => 
        integration.id === integrationId ? { ...integration, ...updates } : integration
      );
      
      return {
        ...prev,
        [worksheetId]: updatedIntegrations
      };
    });
  };

  const deleteApiIntegration = (worksheetId: string, integrationId: string) => {
    setApiIntegrations(prev => {
      const worksheetIntegrations = prev[worksheetId] || [];
      const updatedIntegrations = worksheetIntegrations.filter(
        integration => integration.id !== integrationId
      );
      
      return {
        ...prev,
        [worksheetId]: updatedIntegrations
      };
    });
    
    toast({
      title: "API Integration deleted",
      description: "The integration has been removed."
    });
  };

  const executeApiIntegration = async (worksheetId: string, integrationId: string): Promise<boolean> => {
    if (!activeWorksheet) return false;
    
    const integrations = apiIntegrations[worksheetId] || [];
    const integration = integrations.find(i => i.id === integrationId);
    
    if (!integration) {
      toast({
        title: "Error",
        description: "Integration not found.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      // In a real app, we would make actual API calls
      // For this demo, we'll simulate a successful response
      toast({
        title: "Fetching data",
        description: "Connecting to API endpoint..."
      });
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data for demonstration
      const mockApiResponse = [
        { name: "API Item 1", quantity: 42, active: true, created: "2023-05-20" },
        { name: "API Item 2", quantity: 18, active: false, created: "2023-06-15" },
        { name: "API Item 3", quantity: 73, active: true, created: "2023-04-10" }
      ];
      
      // Process the data and add to worksheet
      mockApiResponse.forEach(item => {
        addRow();
        
        // We need to access the latest row that was just added
        const latestRowId = activeWorksheet.rows[activeWorksheet.rows.length - 1]?.id;
        
        if (latestRowId) {
          // Map API response to columns based on the integration mapping
          Object.entries(integration.responseMapping).forEach(([apiField, columnId]) => {
            // @ts-ignore - This is just for demo
            const value = item[apiField];
            if (value !== undefined) {
              updateCell(latestRowId, columnId, value);
            }
          });
        }
      });
      
      // Update the integration's last run timestamp
      updateApiIntegration(worksheetId, integrationId, {
        schedule: {
          ...(integration.schedule || { frequency: 'manual' }),
          lastRun: new Date()
        }
      });
      
      toast({
        title: "Data imported",
        description: `Successfully imported ${mockApiResponse.length} rows from API.`
      });
      
      return true;
    } catch (error) {
      toast({
        title: "API Error",
        description: error instanceof Error ? error.message : "Failed to fetch data from API",
        variant: "destructive"
      });
      return false;
    }
  };

  const getIntegrationsForWorksheet = (worksheetId: string): ApiIntegration[] => {
    return apiIntegrations[worksheetId] || [];
  };

  const value = {
    apiIntegrations,
    createApiIntegration,
    updateApiIntegration,
    deleteApiIntegration,
    executeApiIntegration,
    getIntegrationsForWorksheet
  };

  return <ApiIntegrationContext.Provider value={value}>{children}</ApiIntegrationContext.Provider>;
}

export function useApiIntegration() {
  const context = useContext(ApiIntegrationContext);
  if (context === undefined) {
    throw new Error('useApiIntegration must be used within an ApiIntegrationProvider');
  }
  return context;
}
