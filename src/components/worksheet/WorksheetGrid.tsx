
import React, { useState, useRef, KeyboardEvent } from 'react';
import { useWorksheet } from '@/contexts/WorksheetContext';
import { CellType } from '@/types/worksheet';
import { format } from 'date-fns';

interface WorksheetGridProps {
  onShowCellHistory: (rowId: string, colId: string) => void;
}

export default function WorksheetGrid({ onShowCellHistory }: WorksheetGridProps) {
  const { activeWorksheet, updateCell } = useWorksheet();
  const [selectedCell, setSelectedCell] = useState<{ rowId: string; colId: string } | null>(null);
  const [editingCell, setEditingCell] = useState<{ rowId: string; colId: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!activeWorksheet) {
    return <div className="p-6 text-center text-gray-500">No active worksheet selected.</div>;
  }

  const handleCellClick = (rowId: string, colId: string) => {
    setSelectedCell({ rowId, colId });
  };

  const handleCellDoubleClick = (rowId: string, colId: string) => {
    setEditingCell({ rowId, colId });
    setSelectedCell({ rowId, colId });
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleCellKeyDown = (e: KeyboardEvent, rowId: string, colId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setEditingCell({ rowId, colId });
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const currentRowIndex = activeWorksheet.rows.findIndex(r => r.id === rowId);
      if (currentRowIndex < activeWorksheet.rows.length - 1) {
        const nextRowId = activeWorksheet.rows[currentRowIndex + 1].id;
        setSelectedCell({ rowId: nextRowId, colId });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const currentRowIndex = activeWorksheet.rows.findIndex(r => r.id === rowId);
      if (currentRowIndex > 0) {
        const prevRowId = activeWorksheet.rows[currentRowIndex - 1].id;
        setSelectedCell({ rowId: prevRowId, colId });
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const currentColIndex = activeWorksheet.columns.findIndex(c => c.id === colId);
      if (currentColIndex < activeWorksheet.columns.length - 1) {
        const nextColId = activeWorksheet.columns[currentColIndex + 1].id;
        setSelectedCell({ rowId, colId: nextColId });
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const currentColIndex = activeWorksheet.columns.findIndex(c => c.id === colId);
      if (currentColIndex > 0) {
        const prevColId = activeWorksheet.columns[currentColIndex - 1].id;
        setSelectedCell({ rowId, colId: prevColId });
      }
    }
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const handleCellChange = (rowId: string, colId: string, value: any) => {
    const column = activeWorksheet.columns.find(c => c.id === colId);
    if (!column) return;

    let processedValue = value;
    
    // Process value based on column type
    if (column.type === 'number') {
      processedValue = value === '' ? null : Number(value);
    } else if (column.type === 'date') {
      try {
        processedValue = value ? new Date(value) : null;
      } catch (e) {
        processedValue = null;
      }
    } else if (column.type === 'checkbox') {
      processedValue = Boolean(value);
    }
    
    updateCell(rowId, colId, processedValue);
  };

  const formatCellValue = (value: any, type: CellType): string => {
    if (value === null || value === undefined) return '';
    
    if (type === 'date' && value instanceof Date) {
      return format(value, 'yyyy-MM-dd');
    }
    
    if (type === 'checkbox') {
      return value ? '✓' : '✗';
    }
    
    return String(value);
  };

  const renderCell = (rowId: string, colId: string, value: any, type: CellType) => {
    const isSelected = selectedCell?.rowId === rowId && selectedCell?.colId === colId;
    const isEditing = editingCell?.rowId === rowId && editingCell?.colId === colId;
    
    if (isEditing) {
      if (type === 'checkbox') {
        return (
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => handleCellChange(rowId, colId, e.target.checked)}
            onBlur={handleCellBlur}
            className="h-5 w-5"
          />
        );
      } else if (type === 'date') {
        return (
          <input
            ref={inputRef}
            type="date"
            value={value instanceof Date ? format(value, 'yyyy-MM-dd') : ''}
            onChange={(e) => handleCellChange(rowId, colId, e.target.value)}
            onBlur={handleCellBlur}
            className="w-full h-full outline-none"
          />
        );
      } else {
        return (
          <input
            ref={inputRef}
            type={type === 'number' ? 'number' : 'text'}
            value={value === null ? '' : value}
            onChange={(e) => handleCellChange(rowId, colId, e.target.value)}
            onBlur={handleCellBlur}
            className="w-full h-full outline-none"
          />
        );
      }
    }
    
    return (
      <div 
        className="flex justify-between items-center h-full"
        onContextMenu={(e) => {
          e.preventDefault();
          onShowCellHistory(rowId, colId);
        }}
      >
        <span>{formatCellValue(value, type)}</span>
        {isSelected && (
          <button 
            onClick={() => onShowCellHistory(rowId, colId)} 
            className="opacity-50 hover:opacity-100 ml-2 text-xs"
          >
            ⋯
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="worksheet-grid border border-worksheet-border overflow-auto">
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            <th className="worksheet-row-number">#</th>
            {activeWorksheet.columns.map(column => (
              <th key={column.id} className="worksheet-header-cell">
                {column.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activeWorksheet.rows.map((row, rowIndex) => (
            <tr key={row.id}>
              <td className="worksheet-row-number">{rowIndex + 1}</td>
              {activeWorksheet.columns.map(column => {
                const cell = row.cells[column.id] || { value: null };
                const isSelected = selectedCell?.rowId === row.id && selectedCell?.colId === column.id;
                
                return (
                  <td
                    key={`${row.id}-${column.id}`}
                    className={`worksheet-cell ${isSelected ? 'selected' : ''} ${cell.edited ? 'font-medium' : ''}`}
                    onClick={() => handleCellClick(row.id, column.id)}
                    onDoubleClick={() => handleCellDoubleClick(row.id, column.id)}
                    onKeyDown={(e) => handleCellKeyDown(e, row.id, column.id)}
                    tabIndex={0}
                  >
                    {renderCell(row.id, column.id, cell.value, column.type)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
