import React, { useState, useMemo } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';
import TableWrapper from '@/components/ui/TableWrapper';
import { Pagination, PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis } from './pagination';
import { ChevronsUpDown } from 'lucide-react';

export interface Column<T> {
  header: React.ReactNode;
  accessor: keyof T;
  /** Optional custom cell renderer */
  Cell?: (value: any, row: T, rowIndex: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  defaultPageSize?: number;
  /** للحالة المحكومة بالخادم */
  pageIndex?: number;
  onPageChange?: (page: number) => void;
  totalItems?: number;
  loading?: boolean;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  defaultPageSize = 10,
  pageIndex: pageIndexProp,
  onPageChange,
  totalItems: totalItemsProp,
  loading: loadingProp,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    accessor: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [pageIndexState, setPageIndexState] = useState(pageIndexProp ?? 0);
  const [pageSize] = useState(defaultPageSize);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.accessor];
      const bVal = b[sortConfig.accessor];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // حالة محكومة بالخادم أم محلية
  const isControlled = pageIndexProp !== undefined && onPageChange !== undefined && totalItemsProp !== undefined;
  const pageIndex = isControlled ? pageIndexProp! : pageIndexState;
  const loading = loadingProp ?? false;
  const totalItems = isControlled ? totalItemsProp! : sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedData = useMemo(() => {
    if (isControlled) {
      return sortConfig ? sortedData : data;
    }
    return sortedData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  }, [isControlled, data, sortedData, pageIndex, pageSize, sortConfig]);

  const handleSort = (accessor: keyof T) => {
    if (isControlled) {
      onPageChange!(0);
    } else {
      setPageIndexState(0);
    }
    setSortConfig((prev) => {
      if (prev?.accessor === accessor) {
        return { accessor, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { accessor, direction: 'asc' };
    });
  };

  // بناء أرقام الصفحات مع حذف الحلقات لعدد محدود من الأزرار
  const maxPageButtons = 5;
  let pageNumbers: (number | '...')[] = [];
  if (totalPages <= maxPageButtons + 2) {
    pageNumbers = Array.from(Array(totalPages).keys());
  } else {
    const half = Math.floor(maxPageButtons / 2);
    let start = pageIndex - half;
    let end = pageIndex + half;
    if (start < 1) { start = 1; end = maxPageButtons; }
    if (end > totalPages - 2) { start = totalPages - 1 - maxPageButtons; end = totalPages - 2; }
    pageNumbers = [0];
    if (start > 1) pageNumbers.push('...');
    for (let i = start; i <= end; i++) pageNumbers.push(i);
    if (end < totalPages - 2) pageNumbers.push('...');
    pageNumbers.push(totalPages - 1);
  }

  return (
    <TableWrapper>
      <div className="flex flex-col gap-4 w-full">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={String(col.accessor)}
                  className="cursor-pointer select-none"
                  onClick={() => handleSort(col.accessor)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-muted/50">
                {columns.map((col) => (
                  <TableCell key={String(col.accessor)}>
                    {col.Cell ? col.Cell(row[col.accessor], row, rowIndex) : String(row[col.accessor] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationPrevious
                className={pageIndex === 0 ? 'opacity-50 pointer-events-none' : ''}
                onClick={() => {
                  const newIndex = pageIndex - 1;
                  if (newIndex >= 0) {
                    isControlled ? onPageChange!(newIndex) : setPageIndexState(newIndex);
                  }
                }}
              />
              {pageNumbers.map((item, idx) =>
                item === '...' ? (
                  <PaginationEllipsis key={`ellipsis-${idx}`} />
                ) : (
                  <PaginationLink
                    key={item}
                    isActive={item === pageIndex}
                    onClick={() => isControlled ? onPageChange!(item as number) : setPageIndexState(item as number)}
                  >
                    {item + 1}
                  </PaginationLink>
                )
              )}
              <PaginationNext
                className={pageIndex === totalPages - 1 ? 'opacity-50 pointer-events-none' : ''}
                onClick={() => {
                  const newIndex = pageIndex + 1;
                  if (newIndex < totalPages) {
                    isControlled ? onPageChange!(newIndex) : setPageIndexState(newIndex);
                  }
                }}
              />
            </Pagination>
          </div>
        )}
      </div>
    </TableWrapper>
  );
}
