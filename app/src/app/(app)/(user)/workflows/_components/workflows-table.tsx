// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client";

import { DataTable } from "@/app/(app)/_components/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { getColumns, type WorkflowData } from "./columns";
import { workflowStatusEnum } from "@/server/db/schema";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableFilterableColumn, DataTableSearchableColumn } from "@/types/data-table";
import { type getPaginatedWorkflowsQuery } from "@/server/actions/workflows/queries";
import { CustomDataTable } from "./custome-data-table";

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

const searchableColumns: DataTableSearchableColumn<WorkflowData>[] = [
  { id: "name", placeholder: "Search by workflow name..." },
];

type WorkflowsTableProps = {
  workflowsPromise: ReturnType<typeof getPaginatedWorkflowsQuery>;
};

export function WorkflowsTable({ workflowsPromise }: WorkflowsTableProps) {
  const { data, pageCount, total } = React.use(workflowsPromise);

  const columns = useMemo<ColumnDef<WorkflowData, unknown>[]>(
    () => getColumns(),
    []
  );

  const workflowsData: WorkflowData[] = data.map((workflow) => {
    return {
      id: workflow.id,
      name: workflow.name,
      status: workflow.status,
      createdAt: workflow.createdAt,
      recipient: workflow.recipient as JSON,
      alertType: workflow.alertType,
      conditions: workflow.conditions as JSON,
      objectField: workflow.objectField,
      ownerId: workflow.ownerId,
      triggerConfig: workflow.triggerConfig as JSON,
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
      <CustomDataTable
        table={table}
        columns={columns}
        filterableColumns={filterableColumns}
        searchableColumns={searchableColumns}
        totalRows={total}
      />
    </>
  );
}
