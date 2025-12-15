'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useTheme } from "@/context/ThemeContext"

interface DynamicTableProps {
  data: Record<string, any>[];
  columnHeaders?: Record<string, string>; 
  onRowClick?: (row: Record<string, any>) => void; 
  visibleColumns?: string[];
}

export default function DynamicTable({ data, columnHeaders, onRowClick, visibleColumns }: DynamicTableProps) {
  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-gray-500 dark:text-gray-400">No data available. You can start adding more!</div>;
  }

  const { theme } = useTheme()
  
  const columns =
    visibleColumns ?? (columnHeaders ? Object.keys(columnHeaders) : Object.keys(data[0]));

  return (
    <div className={`border rounded-xl shadow-md p-2 
      ${theme === "light" ? "bg-gray-50 border-gray-200" : "bg-gray-900 border-gray-700"}`}>
      <Table>
        <TableHeader>
          <TableRow className={`${theme === "light" ? "bg-gray-100" : "bg-gray-800"}`}>
            {columns.map((col) => (
              <TableHead key={col} className={`text-sm font-semibold
                ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}>
                {columnHeaders?.[col] || col.replace(/([A-Z])/g, " $1")}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((row, idx) => (
            <TableRow
              key={idx}
              className={`cursor-pointer text-sm transition-colors 
                ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-800"}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col) => (
                <TableCell key={col} className={`${theme === "light" ? "text-gray-800" : "text-gray-200"}`}>
                  {/* Combine street and purok if this is the address column */}
                  {col === 'address' ? `${row.street}, ${row.purok}` : row[col]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
