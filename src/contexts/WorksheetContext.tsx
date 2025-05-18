
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/components/ui/use-toast";
import { Worksheet, ColumnDefinition, WorksheetRow, CellData, CellChange } from '@/types/worksheet';
import { useAuth } from './AuthContext';

interface WorksheetContextType {
  worksheets: Worksheet[];
  activeWorksheet: Worksheet | null;
  createWorksheet: (name: string) => void;
  setActiveWorksheet: (worksheetId: string) => void;
  addColumn: (name: string, type: ColumnDefinition['type']) => void;
  updateColumn: (columnId: string, updates: Partial<ColumnDefinition>) => void;
  deleteColumn: (columnId: string) => void;
  addRow: () => void;
  updateCell: (rowId: string, columnId: string, value: any) => void;
  deleteRow: (rowId: string) => void;
  getChangesForCell: (rowId: string, columnId: string) => CellChange[];
}

// Mock data for demonstration
const initialWorksheets: Worksheet[] = [
  {
    id: '1',
    name: 'Sample Worksheet',
    columns: [
      { id: 'col1', name: 'Name', type: 'text' },
      { id: 'col2', name: 'Age', type: 'number' },
      { id: 'col3', name: 'Active', type: 'checkbox' },
      { id: 'col4', name: 'Start Date', type: 'date' },
    ],
    rows: [
      {
        id: 'row1',
        cells: {
          col1: { value: 'John Doe' },
          col2: { value: 30 },
          col3: { value: true },
          col4: { value: new Date('2023-01-15') },
        }
      },
      {
        id: 'row2',
        cells: {
          col1: { value: 'Jane Smith' },
          col2: { value: 28 },
          col3: { value: false },
          col4: { value: new Date('2023-02-10') },
        }
      }
    ],
    createdBy: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    changes: {}
  }
];

const WorksheetContext = createContext<WorksheetContextType | undefined>(undefined);

export function WorksheetProvider({ children }: { children: ReactNode }) {
  const [worksheets, setWorksheets] = useState<Worksheet[]>(initialWorksheets);
  const [activeWorksheet, setActiveWorksheetState] = useState<Worksheet | null>(initialWorksheets[0]);
  const { toast } = useToast();
  const { user } = useAuth();

  const createWorksheet = (name: string) => {
    if (!user) return;
    
    const newWorksheet: Worksheet = {
      id: uuidv4(),
      name,
      columns: [
        { id: 'col1', name: 'Column 1', type: 'text' }
      ],
      rows: [],
      createdBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      changes: {}
    };
    
    setWorksheets([...worksheets, newWorksheet]);
    setActiveWorksheetState(newWorksheet);
    
    toast({
      title: "Worksheet created",
      description: `"${name}" has been created successfully.`
    });
  };

  const setActiveWorksheet = (worksheetId: string) => {
    const worksheet = worksheets.find(w => w.id === worksheetId);
    if (worksheet) {
      setActiveWorksheetState(worksheet);
    }
  };

  const addColumn = (name: string, type: ColumnDefinition['type']) => {
    if (!activeWorksheet) return;
    
    const newColumn: ColumnDefinition = {
      id: uuidv4(),
      name,
      type
    };
    
    const updatedWorksheet = {
      ...activeWorksheet,
      columns: [...activeWorksheet.columns, newColumn],
      updatedAt: new Date()
    };
    
    updateWorksheet(updatedWorksheet);
    
    toast({
      title: "Column added",
      description: `"${name}" column has been added.`
    });
  };

  const updateColumn = (columnId: string, updates: Partial<ColumnDefinition>) => {
    if (!activeWorksheet) return;
    
    const updatedColumns = activeWorksheet.columns.map(col => 
      col.id === columnId ? { ...col, ...updates } : col
    );
    
    const updatedWorksheet = {
      ...activeWorksheet,
      columns: updatedColumns,
      updatedAt: new Date()
    };
    
    updateWorksheet(updatedWorksheet);
  };

  const deleteColumn = (columnId: string) => {
    if (!activeWorksheet) return;
    
    const updatedColumns = activeWorksheet.columns.filter(col => col.id !== columnId);
    
    const updatedRows = activeWorksheet.rows.map(row => {
      const { [columnId]: _, ...remainingCells } = row.cells;
      return {
        ...row,
        cells: remainingCells
      };
    });
    
    const updatedWorksheet = {
      ...activeWorksheet,
      columns: updatedColumns,
      rows: updatedRows,
      updatedAt: new Date()
    };
    
    updateWorksheet(updatedWorksheet);
    
    toast({
      title: "Column deleted",
      description: "The column has been removed."
    });
  };

  const addRow = () => {
    if (!activeWorksheet || !user) return;
    
    const newRowId = uuidv4();
    const cells: Record<string, CellData> = {};
    
    activeWorksheet.columns.forEach(col => {
      cells[col.id] = { value: null };
    });
    
    const newRow: WorksheetRow = {
      id: newRowId,
      cells
    };
    
    const updatedWorksheet = {
      ...activeWorksheet,
      rows: [...activeWorksheet.rows, newRow],
      updatedAt: new Date()
    };
    
    updateWorksheet(updatedWorksheet);
  };

  const updateCell = (rowId: string, columnId: string, value: any) => {
    if (!activeWorksheet || !user) return;
    
    const row = activeWorksheet.rows.find(r => r.id === rowId);
    if (!row) return;
    
    const currentCell = row.cells[columnId] || { value: null };
    const previousValue = currentCell.value;
    
    // Create change record
    const change: CellChange = {
      timestamp: new Date(),
      userId: user.id,
      userName: user.name,
      previousValue,
      newValue: value
    };
    
    const cellKey = `${rowId}:${columnId}`;
    const currentChanges = activeWorksheet.changes[cellKey] || [];
    
    const updatedRows = activeWorksheet.rows.map(r => 
      r.id === rowId 
        ? { 
            ...r, 
            cells: { 
              ...r.cells, 
              [columnId]: { value, edited: true } 
            } 
          }
        : r
    );
    
    const updatedWorksheet = {
      ...activeWorksheet,
      rows: updatedRows,
      changes: {
        ...activeWorksheet.changes,
        [cellKey]: [...currentChanges, change]
      },
      updatedAt: new Date()
    };
    
    updateWorksheet(updatedWorksheet);
  };

  const deleteRow = (rowId: string) => {
    if (!activeWorksheet) return;
    
    const updatedRows = activeWorksheet.rows.filter(row => row.id !== rowId);
    
    const updatedWorksheet = {
      ...activeWorksheet,
      rows: updatedRows,
      updatedAt: new Date()
    };
    
    updateWorksheet(updatedWorksheet);
    
    toast({
      title: "Row deleted",
      description: "The row has been removed."
    });
  };

  const getChangesForCell = (rowId: string, columnId: string): CellChange[] => {
    if (!activeWorksheet) return [];
    
    const cellKey = `${rowId}:${columnId}`;
    return activeWorksheet.changes[cellKey] || [];
  };

  // Helper to update the worksheet in both state arrays
  const updateWorksheet = (updatedWorksheet: Worksheet) => {
    setActiveWorksheetState(updatedWorksheet);
    setWorksheets(worksheets.map(w => 
      w.id === updatedWorksheet.id ? updatedWorksheet : w
    ));
  };

  const value = {
    worksheets,
    activeWorksheet,
    createWorksheet,
    setActiveWorksheet,
    addColumn,
    updateColumn,
    deleteColumn,
    addRow,
    updateCell,
    deleteRow,
    getChangesForCell
  };

  return <WorksheetContext.Provider value={value}>{children}</WorksheetContext.Provider>;
}

export function useWorksheet() {
  const context = useContext(WorksheetContext);
  if (context === undefined) {
    throw new Error('useWorksheet must be used within a WorksheetProvider');
  }
  return context;
}
