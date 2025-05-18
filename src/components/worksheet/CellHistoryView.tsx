
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { useWorksheet } from '@/contexts/WorksheetContext';

interface CellHistoryViewProps {
  rowId: string | null;
  columnId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CellHistoryView({ rowId, columnId, isOpen, onClose }: CellHistoryViewProps) {
  const { getChangesForCell, activeWorksheet } = useWorksheet();
  
  if (!rowId || !columnId || !activeWorksheet) {
    return null;
  }
  
  const changes = getChangesForCell(rowId, columnId);
  
  const getColumnName = (colId: string) => {
    const column = activeWorksheet.columns.find(c => c.id === colId);
    return column ? column.name : 'Unknown Column';
  };
  
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'Empty';
    }
    
    if (value instanceof Date) {
      return format(value, 'yyyy-MM-dd HH:mm:ss');
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    return String(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cell Change History</DialogTitle>
          <DialogDescription>
            {`${getColumnName(columnId)} - Row ${activeWorksheet.rows.findIndex(r => r.id === rowId) + 1}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[400px] overflow-y-auto">
          {changes.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No changes recorded for this cell.</p>
          ) : (
            <div className="space-y-4">
              {changes.map((change, index) => (
                <div key={index} className="border rounded-md p-3 bg-gray-50">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>{change.userName}</span>
                    <span>{format(new Date(change.timestamp), 'MMM d, yyyy HH:mm:ss')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="text-sm">
                      <span className="block text-gray-500">Previous:</span>
                      <span className="font-medium">{formatValue(change.previousValue)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="block text-gray-500">New:</span>
                      <span className="font-medium">{formatValue(change.newValue)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
