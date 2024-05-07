"use client";

import { DataTable } from "@/app/(app)/_components/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { getColumns, type WorkflowData } from "./columns"; // Adjust to include correct imports and types for workflows
import { workflowStatusEnum } from "@/server/db/schema";
import { useDataTable } from "@/hooks/use-data-table";
import type {
    DataTableFilterableColumn,
    DataTableSearchableColumn,
} from "@/types/data-table";
import { type getPaginatedWorkflowsQuery } from "@/server/actions/workflows/queries";

const filterableColumns: DataTableFilterableColumn<WorkflowData>[] = [
    {
        id: "status",
        title: "Status",
        options: workflowStatusEnum.enumValues.map((v) => ({
            label: v,
            value: v,
        })),
    },
];

type WorkflowsTableProps = {
    workflowsPromise: ReturnType<typeof getPaginatedWorkflowsQuery>;
};

const searchableColumns: DataTableSearchableColumn<WorkflowData>[] = [
    { id: "name", placeholder: "Search by workflow name..." },
];

export function WorkflowsTable({ workflowsPromise }: WorkflowsTableProps) {
    const { data, pageCount, total } = React.use(workflowsPromise);

    const columns = useMemo<ColumnDef<WorkflowData, unknown>[]>(
        () => getColumns(),
        [],
    );

    console.log(data);
    const workflowsData: WorkflowData[] = data.map((workflow) => {
        return {
            id: workflow.id,
            name: workflow.name,
            status: workflow.status,
            createdAt: workflow.createdAt,
            receipient: workflow.receipient as JSON, // Cast to JSON
            alertType: workflow.alertType,
            conditions: workflow.conditions as JSON, // Cast to JSON
            objectField: workflow.objectField,
            ownerId: workflow.ownerId,
            triggerConfig: workflow.triggerConfig as JSON, // Cast to JSON
        };
    });

    const { table } = useDataTable({
        data: workflowsData,
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
