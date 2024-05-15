/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ColumnDropdown } from "./column-dropdown";
import { format } from "date-fns";
import slackLogo from "../../../../../../public/slack-logo.png";
import greenhouse from "../../../../../../public/greenhouse-logo.png";

import Image from "next/image";
import { Condition } from "./new-workflowForm";

// This type is used to define the shape of our data.

const logoMap = {
  slack: slackLogo,  // Path to your Slack logo
  greenhouse: greenhouse  // Path to your Greenhouse logo
};

// You can use a Zod schema here if you want.

export type WorkflowData = {
    id: string;
    name: string;
    status: string;
    createdAt: Date;
    recipient: JSON;
    conditions: JSON; // Ensure this aligns with the actual data type
    alertType: string;
    objectField: string;
    ownerId: string; // Optionally display owner related details
    triggerConfig: JSON; // Ensure it's added to the interface
};

// Function to generate columns based on WorkflowData
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



  // Map the condition keyword to a more readable format, or use it as-is if not found in the mappings
  const readableCondition = conditionMappings[condition.condition] || condition.condition;

  // Include the unit in the formatted string if it exists
  const unit = condition.unit ? ` ${condition.unit}` : '';

  // Replace underscores in the field names with spaces for better readability
  const readableField = condition.field.replace(/_/g, ' ');

  return `${readableField} is ${readableCondition} ${condition.value}${unit}`;
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
      accessorKey: "recipient",
      header: "Recipient",
      cell: ({ row }) => (

          <div className="flex flex-wrap gap-2">
              {row.original.recipient.recipients.map((rec) => (
                  <Badge key={rec.value} variant="secondary" className="capitalize">
                       <Image
                      src={logoMap[rec.source] ?? slackLogo}
                      alt={`${rec.source}-logo`}
                      className="mr-1 h-3.5 w-3"        />
                      {rec.label}
                  </Badge>
              ))}
          </div>
      ),
  }
  ,

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
}
,

    {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => <ColumnDropdown {...row.original} />, // Make sure ColumnDropdown supports workflow operations
    },
];
