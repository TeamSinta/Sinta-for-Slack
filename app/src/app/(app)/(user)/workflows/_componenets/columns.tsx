/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ColumnDropdown } from "./column-dropdown";
import { format } from "date-fns";
import slackLogo from "../../../../../../public/slack-logo.png";
import Image from "next/image";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export type WorkflowData = {
    id: string;
    name: string;
    status: string;
    createdAt: Date;
    receipient: JSON;
    conditions: JSON;  // Ensure this aligns with the actual data type
    alertType: string;
    objectField: string;
    ownerId: string; // Optionally display owner related details
    triggerConfig: JSON; // Ensure it's added to the interface

};

// Function to generate columns based on WorkflowData
export function getColumns(): ColumnDef<WorkflowData>[] {
    return columns;
}

// Define columns for workflows
export const columns: ColumnDef<WorkflowData>[] = [
    {
        accessorKey: "name",
        header: () => <span className="pl-2">Name</span>,
    },
    {
        accessorKey: "objectField",
        header: "Object Field",
    },
    {
        accessorKey: "alertType",
        header: "Alert Type",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant="secondary" className="capitalize">
                {row.original.status}
            </Badge>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {format(new Date(row.original.createdAt), "PP")}
            </span>
        ),
    },
    {
        accessorKey: "receipient",
        header: "Receipient",
        cell: ({ row }) => (
            <Badge variant="secondary" className="capitalize ">
                <Image
                    src={slackLogo}
                    alt="slack-logo"
                    className="mr-1 h-4 w-4"
                />
                {/* {row.original.receipient} */}
            </Badge>
        ),
    },

    {
        accessorKey: "conditions",
        header: "Conditions",
    },

    {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => <ColumnDropdown {...row.original} />, // Make sure ColumnDropdown supports workflow operations
    },
];
