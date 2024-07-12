// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client";

import { DataTable } from "@/app/(app)/_components/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { getColumns, type HiringroomData } from "./columns"; // Adjust to include correct imports and types for hiringrooms
import { hiringroomStatusEnum } from "@/server/db/schema";
import { useDataTable } from "@/hooks/use-data-table";
import type {
    DataTableFilterableColumn,
    DataTableSearchableColumn,
} from "@/types/data-table";
import { type getPaginatedHiringroomsQuery } from "@/server/actions/hiringrooms/queries";

const filterableColumns: DataTableFilterableColumn<HiringroomData>[] = [
    {
        id: "status",
        title: "Status",
        options: hiringroomStatusEnum.enumValues.map((v) => ({
            label: v,
            value: v,
        })),
    },
];

type HiringroomsTableProps = {
    hiringroomsPromise: ReturnType<typeof getPaginatedHiringroomsQuery>;
};

const searchableColumns: DataTableSearchableColumn<HiringroomData>[] = [
    { id: "name", placeholder: "Search by hiringroom name..." },
];

export function HiringroomsTable({ hiringroomsPromise }: HiringroomsTableProps) {
    const { data, pageCount, total } = React.use(hiringroomsPromise);

    const columns = useMemo<ColumnDef<HiringroomData, unknown>[]>(
        () => getColumns(),
        [],
    );

    const hiringroomsData: HiringroomData[] = data.map((hiringroom) => {
        return {
            id: hiringroom.id,
            name: hiringroom.name,
            status: hiringroom.status,
            createdAt: hiringroom.createdAt,
            recipient: hiringroom.recipient as JSON, // Cast to JSON
            alertType: hiringroom.alertType,
            conditions: hiringroom.conditions as JSON, // Cast to JSON
            objectField: hiringroom.objectField,
            ownerId: hiringroom.ownerId,
            triggerConfig: hiringroom.triggerConfig as JSON, // Cast to JSON
        };
    });

    const { table } = useDataTable({
        data: hiringroomsData,
        columns,
        pageCount,
        searchableColumns,
        filterableColumns,
    });

    return (
        <>
            <DataTable
                table={table}
                columns={columns}
                filterableColumns={filterableColumns}
                searchableColumns={searchableColumns}
                totalRows={total}
            />
        </>
    );
}
