
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApiIntegration } from '@/contexts/ApiIntegrationContext';
import { useWorksheet } from '@/contexts/WorksheetContext';
import { ApiIntegration } from '@/types/worksheet';

interface ApiIntegrationFormProps {
  worksheetId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiIntegrationForm({ worksheetId, isOpen, onClose }: ApiIntegrationFormProps) {
  const { createApiIntegration } = useApiIntegration();
  const { activeWorksheet } = useWorksheet();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([
    { key: 'Content-Type', value: 'application/json' }
  ]);
  const [responseMapping, setResponseMapping] = useState<{ apiField: string; columnId: string }[]>([
    { apiField: '', columnId: '' }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert headers array to object
    const headersObj: Record<string, string> = {};
    headers.forEach(header => {
      if (header.key.trim() !== '') {
        headersObj[header.key] = header.value;
      }
    });
    
    // Convert response mapping array to object
    const responseMappingObj: Record<string, string> = {};
    responseMapping.forEach(mapping => {
      if (mapping.apiField.trim() !== '' && mapping.columnId) {
        responseMappingObj[mapping.apiField] = mapping.columnId;
      }
    });
    
    const integration: Omit<ApiIntegration, 'id'> = {
      name,
      url,
      method,
      headers: headersObj,
      responseMapping: responseMappingObj,
      schedule: {
        frequency: 'manual'
      }
    };
    
    createApiIntegration(worksheetId, integration);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setUrl('');
    setMethod('GET');
    setHeaders([{ key: 'Content-Type', value: 'application/json' }]);
    setResponseMapping([{ apiField: '', columnId: '' }]);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders);
  };

  const addMapping = () => {
    setResponseMapping([...responseMapping, { apiField: '', columnId: '' }]);
  };

  const updateMapping = (index: number, field: 'apiField' | 'columnId', value: string) => {
    const newMapping = [...responseMapping];
    newMapping[index][field] = value;
    setResponseMapping(newMapping);
  };

  const removeMapping = (index: number) => {
    const newMapping = responseMapping.filter((_, i) => i !== index);
    setResponseMapping(newMapping);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create API Integration</DialogTitle>
          <DialogDescription>
            Configure an API endpoint to fetch data into your worksheet.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Integration Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="My API Integration"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="method">HTTP Method</Label>
                <Select value={method} onValueChange={(value: 'GET' | 'POST') => setMethod(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url">API URL</Label>
              <Input 
                id="url" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                placeholder="https://api.example.com/data"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Headers</Label>
                <Button type="button" variant="outline" size="sm" onClick={addHeader}>
                  Add Header
                </Button>
              </div>
              
              <div className="space-y-2">
                {headers.map((header, index) => (
                  <div key={index} className="flex gap-2">
                    <Input 
                      value={header.key} 
                      onChange={(e) => updateHeader(index, 'key', e.target.value)} 
                      placeholder="Header name"
                    />
                    <Input 
                      value={header.value} 
                      onChange={(e) => updateHeader(index, 'value', e.target.value)} 
                      placeholder="Header value"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeHeader(index)}
                      disabled={index === 0}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Response Mapping</Label>
                <Button type="button" variant="outline" size="sm" onClick={addMapping}>
                  Add Field Mapping
                </Button>
              </div>
              
              <div className="space-y-2">
                {responseMapping.map((mapping, index) => (
                  <div key={index} className="flex gap-2">
                    <Input 
                      value={mapping.apiField} 
                      onChange={(e) => updateMapping(index, 'apiField', e.target.value)} 
                      placeholder="API field (e.g. name, price)"
                    />
                    <Select 
                      value={mapping.columnId} 
                      onValueChange={(value) => updateMapping(index, 'columnId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeWorksheet?.columns.map(column => (
                          <SelectItem key={column.id} value={column.id}>
                            {column.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeMapping(index)}
                      disabled={index === 0 && responseMapping.length === 1}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Integration
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
