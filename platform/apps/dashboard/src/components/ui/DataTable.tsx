import {useState} from 'react';
import {Center, Heading, Table, Text, VStack} from '@chakra-ui/react';
import type {ColumnDef, SortingState} from '@tanstack/react-table';
import {flexRender, getCoreRowModel, getSortedRowModel, useReactTable} from '@tanstack/react-table';
import {ArrowDown, ArrowUp, ArrowUpDown, Inbox} from 'lucide-react';
import {Colors} from '../../constants/colors';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  emptyTitle?: string;
  emptyDescription?: string;
}

function SortIcon({direction}: {direction: false | 'asc' | 'desc'}) {
  if (direction === 'asc') return <ArrowUp size="0.875rem"/>;
  if (direction === 'desc') return <ArrowDown size="0.875rem"/>;
  return <ArrowUpDown size="0.875rem" opacity={0.3}/>;
}

export function DataTable<TData>({columns, data, emptyTitle = 'No data', emptyDescription}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {sorting},
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Table.ScrollArea>
      <Table.Root variant="outline" size="md">
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const align = (header.column.columnDef.meta as Record<string, string> | undefined)?.align;
                return (
                  <Table.ColumnHeader
                    key={header.id}
                    textAlign={align === 'right' ? 'right' : undefined}
                    cursor={canSort ? 'pointer' : undefined}
                    userSelect={canSort ? 'none' : undefined}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.25rem'}}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && <SortIcon direction={header.column.getIsSorted()}/>}
                    </span>
                  </Table.ColumnHeader>
                );
              })}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={columns.length}>
                <Center minH="12.5rem">
                  <VStack gap="0.75rem">
                    <Inbox size="2.5rem" color={Colors.text.muted}/>
                    <Heading size="md" color={Colors.text.secondary}>{emptyTitle}</Heading>
                    {emptyDescription && <Text color={Colors.text.muted}>{emptyDescription}</Text>}
                  </VStack>
                </Center>
              </Table.Cell>
            </Table.Row>
          ) : (
            table.getRowModel().rows.map((row) => (
              <Table.Row key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const align = (cell.column.columnDef.meta as Record<string, string> | undefined)?.align;
                  return (
                    <Table.Cell
                      key={cell.id}
                      textAlign={align === 'right' ? 'right' : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Cell>
                  );
                })}
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
}
