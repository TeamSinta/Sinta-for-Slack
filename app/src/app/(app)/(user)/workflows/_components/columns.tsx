"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ColumnDropdown } from "./column-dropdown";
import { format } from "date-fns";
import slackLogo from "../../../../../../public/slack-logo.png";
import greenhouseLogo from "../../../../../../public/greenhouseLogo.png";
import Image, { type StaticImageData } from "next/image";

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

  const readableCondition = conditionMappings[condition.condition] ?? condition.condition;
  const unit = condition.unit ? ` ${condition.unit}` : " days";
  const readableField = typeof condition.field === 'object' ? condition.field.label : condition.field;

  return `${readableField} is ${readableCondition} ${condition.value}${unit}`;
}

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
        accessorKey: "recipient",
        header: "Recipient",
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
        accessorKey: "conditions",
        header: "Conditions",
        cell: ({ row }) => {
            const conditionTexts = row.original.conditions.map(formatCondition);
            return (
                <div
                    className="cursor-pointer hover:underline"
                    title={conditionTexts.join("; ")}
                    onClick={() =>
                        console.log("Conditions Clicked:")
                    }
                >
                    {conditionTexts.length > 1
                        ? `${conditionTexts[0]} + ${conditionTexts.length - 1} more`
                        : conditionTexts[0]}
                </div>
            );
        },
    },
    {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => <ColumnDropdown {...row.original} />,
    },
];
