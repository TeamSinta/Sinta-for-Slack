"use client";

import * as React from "react";
import {
    type ColumnDef,
    type Table as TanstackTable,
    flexRender,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/app/(app)/_components/data-table-pagination";
import { DataTableToolbar } from "@/app/(app)/_components/data-table-toolbar";
import type {
    DataTableFilterableColumn,
    DataTableSearchableColumn,
} from "@/types/data-table";

type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    table: TanstackTable<TData>;
    totalRows: number;
    filterableColumns?: DataTableFilterableColumn<TData>[];
    searchableColumns?: DataTableSearchableColumn<TData>[];
};

export function DataTable<TData, TValue>({
    columns,
    table,
    totalRows,
    searchableColumns = [],
    filterableColumns = [],
}: DataTableProps<TData, TValue>) {
    return (
        <div className="space-y-4">
            <DataTableToolbar
                table={table}
                filterableColumns={filterableColumns}
                searchableColumns={searchableColumns}
            />
            <div className="flex-shrink rounded-md border border-border bg-background">
                <Table className="w-full text-left">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-b">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className="p-4"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : (flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  ) as React.ReactNode)}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                    className="hover:bg-gray-100"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="p-4"
                                        >
                                            {
                                                flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                ) as React.ReactNode
                                            }
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 p-4 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} totalRows={totalRows} />
        </div>
    );
}
