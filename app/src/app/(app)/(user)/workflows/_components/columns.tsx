"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ColumnDropdown } from "./column-dropdown";
import { format } from "date-fns";
import slackLogo from "../../../../../../public/slack-logo.png";
import greenhouse from "../../../../../../public/greenhouselogo.png";
import Image from "next/image";
import { Condition } from "./new-workflowForm";

const logoMap = {
  slack: slackLogo,  // Path to your Slack logo
  greenhouse: greenhouse  // Path to your Greenhouse logo
};

// This type is used to define the shape of our data.
export type WorkflowData = {
    id: string;
    name: string;
    status: string;
    createdAt: Date;
    recipient: any; // Adjust to actual type
    conditions: Condition[];
    alertType: string;
    objectField: string;
    ownerId: string; // Optionally display owner-related details
    triggerConfig: any; // Adjust to actual type
};

export function getColumns(): ColumnDef<WorkflowData>[] {
    return columns;
}

function formatCondition(condition: Condition): string {
  const conditionMappings: Record<string, string> = {
      "greaterThan": "greater than",
      "lessThan": "less than",
      "equalTo": "equal to",
      "notEqualTo": "not equal to",
      "contains": "contains",
      "doesNotContain": "does not contain",
      "beginsWith": "begins with",
      "endsWith": "ends with",
      "after": "after",
      "before": "before" // Ensure all relevant conditions are mapped
  };

  const readableCondition = conditionMappings[condition.condition] || condition.condition;
  const unit = condition.unit ? ` ${condition.unit}` : ' days';
  const readableField = condition.field.label || condition.field;

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
                    <Badge key={rec.value} variant="secondary" className="capitalize">
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
                    onClick={() => console.log("Conditions Clicked:", row.original.conditions)}
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
        cell: ({ row }) => <ColumnDropdown {...row.original} />, // Make sure ColumnDropdown supports workflow operations
    },
];
