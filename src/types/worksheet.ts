
export type CellType = 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'formula';

export interface ColumnDefinition {
  id: string;
  name: string;
  type: CellType;
  width?: number;
  options?: string[]; // For dropdown type
  formula?: string; // For formula type
}

export interface CellData {
  value: string | number | boolean | Date | null;
  displayValue?: string;
  edited?: boolean;
  formula?: string;
}

export interface CellChange {
  timestamp: Date;
  userId: string;
  userName: string;
  previousValue: any;
  newValue: any;
}

export interface WorksheetRow {
  id: string;
  cells: Record<string, CellData>;
}

export interface Worksheet {
  id: string;
  name: string;
  columns: ColumnDefinition[];
  rows: WorksheetRow[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  changes: Record<string, CellChange[]>; // Key format: "rowId:columnId"
}

export interface ApiIntegration {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST';
  headers: Record<string, string>;
  body?: string;
  responseMapping: Record<string, string>; // Maps API response fields to column IDs
  schedule?: {
    frequency: 'manual' | 'hourly' | 'daily' | 'weekly';
    lastRun?: Date;
    nextRun?: Date;
  };
}

export interface WorksheetWithApiIntegration extends Worksheet {
  apiIntegrations: ApiIntegration[];
}
