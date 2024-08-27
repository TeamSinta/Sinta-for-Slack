"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ColumnDropdown } from "./column-dropdown";
import { Switch } from "@/components/ui/switch";
import IntegrationsCell from "./intergrations-cell"; // Import the IntegrationsCell component
import slackLogo from "../../../../../../public/slack-logo.png";
import greenhouseLogo from "../../../../../../public/greenhouseLogo.png";
import Image, { type StaticImageData } from "next/image";
import { format } from "date-fns";
import { useState } from "react";  // Import useState for handling switch state

const logoMap: Record<string, StaticImageData> = {
    slack: slackLogo,
    greenhouse: greenhouseLogo,
};

type Recipient = {
    source: string;
    value: string;
    label: string;
};

type TriggerConfig = {
    type: string;
    details: Record<string, unknown>;
};

export type WorkflowData = {
    id: string;
    name: string;
    status: string;
    createdAt: Date;
    recipient: {
        recipients: Recipient[];
    };
    conditions: Condition[];
    alertType: string;
    objectField: string;
    ownerId: string;
    triggerConfig: TriggerConfig;
};

type Field = {
    label: string;
    value: string;
};

// Update the Condition type to use the Field type
export type Condition = {
    condition: string;
    value: string | number;
    unit?: string;
    field: Field | string; // Field can be either an object with label or a string
};

export function getColumns(): ColumnDef<WorkflowData>[] {
    return columns;
}

function formatCondition(condition: Condition): string {
    const conditionMappings: Record<string, string> = {
        greaterThan: "greater than",
        lessThan: "less than",
        equalTo: "equal to",
        notEqualTo: "not equal to",
        contains: "contains",
        doesNotContain: "does not contain",
        beginsWith: "begins with",
        endsWith: "ends with",
        after: "after",
        before: "before",
    };

    const readableCondition =
        conditionMappings[condition.condition] ?? condition.condition;
    const unit = condition.unit ? ` ${condition.unit}` : " days";
    const readableField =
        typeof condition.field === "object"
            ? condition.field.label
            : condition.field;

    return `${readableField} is ${readableCondition} ${condition.value}${unit}`;
}

export const columns: ColumnDef<WorkflowData>[] = [
    {
        accessorKey: "integrations",
        header: () => <span className="pl-2">Integrations</span>,
        cell: ({ row }) => <IntegrationsCell workflow={row.original} />,
    },
    {
        accessorKey: "name",
        header: () => <span className="pl-2">Name</span>,
        cell: ({ row }) => (
            <div>
                <span className="text-sm font-medium">{row.original.name}</span>
                <br />
                <span className="text-xs text-muted-foreground">
                    Created at: {format(new Date(row.original.createdAt), "PPP")}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const [isActive, setIsActive] = useState(row.original.status === "Active");

            const handleStatusChange = async () => {
                // Toggle the status
                const newStatus = isActive ? "Inactive" : "Active";
                setIsActive(!isActive);

                // Perform an API call or state update to persist the change
                // For example:
                // await updateWorkflowStatus(row.original.id, newStatus);
            };

            return (
                <Switch
                    className="data-[state=checked]:bg-indigo-500"
                    checked={isActive}
                    onCheckedChange={handleStatusChange}
                />
            );
        },
    },
    {
        accessorKey: "recipient",
        header: "Recipients",
        cell: ({ row }) => (
            <div className="flex flex-wrap gap-2">
                {row.original.recipient.recipients.map((rec) => (
                    <Badge
                        key={rec.value}
                        variant="secondary"
                        className="capitalize"
                    >
                        <Image
                            src={logoMap[rec.source] ?? slackLogo}
                            alt={`${rec.source}-logo`}
                            className="mr-1 h-4 w-4"
                        />
                        {rec.label}
                    </Badge>
                ))}
            </div>
        ),
    },
    {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => <ColumnDropdown {...row.original} />,
    },
];
