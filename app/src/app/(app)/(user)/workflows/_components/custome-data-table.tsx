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
import Link from "next/link";
import type {
    DataTableFilterableColumn,
    DataTableSearchableColumn,
} from "@/types/data-table";

type DataTableProps<TData extends { id: string }, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    table: TanstackTable<TData>;
    totalRows: number;
    filterableColumns?: DataTableFilterableColumn<TData>[];
    searchableColumns?: DataTableSearchableColumn<TData>[];
};

export function CustomDataTable<TData extends { id: string }, TValue>({
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
            <div className="flex-shrink rounded-md border border-border bg-background shadow">
                <Table className="w-full text-left">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-b">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="p-4">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                ))}
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
                                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="p-4"
                                        >
                                            {/* Conditionally wrap with Link based on cell content */}
                                            {cell.column.id === "name" ? (
                                                <Link
                                                    href={`/workflows/new/${row.original.id}`}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef
                                                            .cell,
                                                        cell.getContext(),
                                                    )}
                                                </Link>
                                            ) : (
                                                flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )
                                            )}
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
