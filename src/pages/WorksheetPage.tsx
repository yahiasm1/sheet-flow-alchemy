
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorksheet } from '@/contexts/WorksheetContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WorksheetGrid from '@/components/worksheet/WorksheetGrid';
import CellHistoryView from '@/components/worksheet/CellHistoryView';
import ApiIntegrationsList from '@/components/api/ApiIntegrationsList';
import ApiIntegrationForm from '@/components/api/ApiIntegrationForm';
import { CellType } from '@/types/worksheet';
import { useToast } from "@/components/ui/use-toast";

export default function WorksheetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { worksheets, setActiveWorksheet, activeWorksheet, addColumn, addRow, deleteRow } = useWorksheet();
  
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [isApiIntegrationOpen, setIsApiIntegrationOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<CellType>('text');
  
  const [historyCell, setHistoryCell] = useState<{ rowId: string; columnId: string } | null>(null);
  
  useEffect(() => {
    if (id && worksheets.length > 0) {
      const worksheet = worksheets.find(w => w.id === id);
      if (worksheet) {
        setActiveWorksheet(id);
      } else {
        toast({
          title: "Worksheet not found",
          description: "The requested worksheet does not exist.",
          variant: "destructive"
        });
        navigate('/');
      }
    }
  }, [id, worksheets, setActiveWorksheet, navigate, toast]);
  
  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      addColumn(newColumnName, newColumnType);
      setNewColumnName('');
      setIsAddColumnOpen(false);
    }
  };
  
  const handleShowCellHistory = (rowId: string, columnId: string) => {
    setHistoryCell({ rowId, columnId });
  };
  
  if (!activeWorksheet) {
    return (
      <div className="container py-8 text-center">
        <p>Loading worksheet...</p>
      </div>
    );
  }
  
  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">{activeWorksheet.name}</h1>
          <p className="text-gray-500 text-sm">
            Last updated: {new Date(activeWorksheet.updatedAt).toLocaleString()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
          <Button onClick={() => setIsAddColumnOpen(true)}>
            Add Column
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="data" className="mt-6">
        <TabsList>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="api">API Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="data" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {activeWorksheet.rows.length} rows, {activeWorksheet.columns.length} columns
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => addRow()}>
                Add Row
              </Button>
              {activeWorksheet.rows.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => deleteRow(activeWorksheet.rows[activeWorksheet.rows.length - 1].id)}
                >
                  Delete Last Row
                </Button>
              )}
            </div>
          </div>
          
          <WorksheetGrid onShowCellHistory={handleShowCellHistory} />
        </TabsContent>
        
        <TabsContent value="api" className="mt-6">
          <ApiIntegrationsList 
            worksheetId={activeWorksheet.id}
            onCreateNew={() => setIsApiIntegrationOpen(true)}
          />
        </TabsContent>
      </Tabs>
      
      {/* Add Column Dialog */}
      <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="column-name">Column Name</Label>
              <Input
                id="column-name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Enter column name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="column-type">Column Type</Label>
              <Select value={newColumnType} onValueChange={(value: CellType) => setNewColumnType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddColumnOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddColumn}>Add Column</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Cell History Dialog */}
      <CellHistoryView
        rowId={historyCell?.rowId || null}
        columnId={historyCell?.columnId || null}
        isOpen={!!historyCell}
        onClose={() => setHistoryCell(null)}
      />
      
      {/* API Integration Form */}
      <ApiIntegrationForm
        worksheetId={activeWorksheet.id}
        isOpen={isApiIntegrationOpen}
        onClose={() => setIsApiIntegrationOpen(false)}
      />
    </div>
  );
}
