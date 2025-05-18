
import React, { useState, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWorksheet } from '@/contexts/WorksheetContext';
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';

interface CsvImporterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CsvImporter({ isOpen, onClose }: CsvImporterProps) {
  const { activeWorksheet, addColumn, addRow, updateCell } = useWorksheet();
  const { toast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };
  
  const handleImport = async () => {
    if (!csvFile || !activeWorksheet) return;
    
    setIsImporting(true);
    
    try {
      const fileContent = await csvFile.text();
      const rows = fileContent.split('\n');
      
      if (rows.length < 2) {
        throw new Error('CSV file is empty or invalid');
      }
      
      // Parse header row
      const headers = rows[0].split(',').map(header => header.trim());
      
      // Create columns if they don't exist
      const existingColumnNames = activeWorksheet.columns.map(col => col.name);
      const columnMapping: Record<string, string> = {}; // Maps header to column ID
      
      headers.forEach((header, index) => {
        if (!header) return;
        
        const existingColumn = activeWorksheet.columns.find(col => col.name === header);
        if (existingColumn) {
          columnMapping[index] = existingColumn.id;
        } else {
          const newColumnId = uuidv4();
          addColumn(header, 'text');
          columnMapping[index] = newColumnId;
        }
      });
      
      // Add data rows
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue;
        
        const values = rows[i].split(',');
        addRow();
        
        // We need to access the latest row that was just added
        const latestRowId = activeWorksheet.rows[activeWorksheet.rows.length - 1]?.id;
        
        if (latestRowId) {
          headers.forEach((_, index) => {
            const columnId = columnMapping[index];
            if (columnId && values[index]) {
              updateCell(latestRowId, columnId, values[index].trim());
            }
          });
        }
      }
      
      toast({
        title: "CSV Imported",
        description: `Successfully imported ${rows.length - 1} rows.`
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import CSV",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import CSV Data</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-500">
            Select a CSV file to import. The first row will be used as column headers.
            New columns will be created if they don't exist.
          </p>
          
          <div className="border-2 border-dashed rounded-md p-6 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer">
              <div className="space-y-2">
                <div className="text-gray-500">
                  {csvFile ? csvFile.name : 'Click to select a CSV file'}
                </div>
                <Button type="button" variant="outline">
                  Choose File
                </Button>
              </div>
            </label>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!csvFile || isImporting}
          >
            {isImporting ? 'Importing...' : 'Import Data'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
