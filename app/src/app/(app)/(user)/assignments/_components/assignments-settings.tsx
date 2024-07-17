// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client";

import { DataTable } from "@/app/(app)/_components/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { getColumns, type AssignmentData } from "./columns"; // Adjust to include correct imports and types for hiringrooms
import { assignmentStatusEnum } from "@/server/db/schema";
import { useDataTable } from "@/hooks/use-data-table";
import type {
    DataTableFilterableColumn,
    DataTableSearchableColumn,
} from "@/types/data-table";
import { type getPaginatedAssignmentsQuery } from "@/server/actions/hiringrooms/queries";

// const filterableColumns: DataTableFilterableColumn<AssignmentData>[] = [
//     {
//         id: "status",
//         title: "Status",
//         options: assignmentStatusEnum.enumValues.map((v) => ({
//             label: v,
//             value: v,
//         })),
//     },
// ];

// type AssignmentsTableProps = {
//     assignmentsPromise: ReturnType<typeof getPaginatedAssignmentsQuery>;
// };

// const searchableColumns: DataTableSearchableColumn<AssignmentData>[] = [
//     { id: "name", placeholder: "Search by hiringroom name..." },
// ];

export function AssignmentsSettings() {
    // const { data, pageCount, total } = React.use(assignmentsPromise);

    // const columns = useMemo<ColumnDef<AssignmentData, unknown>[]>(
    //     () => getColumns(),
    //     [],
    // );

    // const assignmentsData: AssignmentData[] = data.map((hiringroom) => {
    //     return {
    //         id: hiringroom.id,
    //         name: hiringroom.name,
    //         status: hiringroom.status,
    //         createdAt: hiringroom.createdAt,
    //         recipient: hiringroom.recipient as JSON, // Cast to JSON
    //         alertType: hiringroom.alertType,
    //         conditions: hiringroom.conditions as JSON, // Cast to JSON
    //         objectField: hiringroom.objectField,
    //         ownerId: hiringroom.ownerId,
    //         triggerConfig: hiringroom.triggerConfig as JSON, // Cast to JSON
    //     };
    // });

    // const { table } = useDataTable({
    //     data: assignmentsData,
    //     columns,
    //     pageCount,
    //     searchableColumns,
    //     filterableColumns,
    // });

    return (
        <>
        go bucks - assignment settings
            {/* <DataTable
                table={table}
                columns={columns}
                filterableColumns={filterableColumns}
                searchableColumns={searchableColumns}
                totalRows={total}
            /> */}
        </>
    );
}
