"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ColumnDropdown } from "./column-dropdown";
import slackLogo from "../../../../../../public/slack-logo.png";
import greenhouseLogo from "../../../../../../public/greenhouseLogo.png";
import { type StaticImageData } from "next/image";
import { type ReactNode } from "react";

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

export type SlackChannelsCreatedData = {
    invitedUsers: ReactNode;
    isArchived: ReactNode;
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

export function getColumns(): ColumnDef<SlackChannelsCreatedData>[] {
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

export const columns: ColumnDef<SlackChannelsCreatedData>[] = [
    // {
    //     accessorKey: "objectField",
    //     header: "Object Field",
    // },
    {
        accessorKey: "greenhouseCandidateInitials",
        header: "Cand.",
    },
    {
        accessorKey: "greenhouseJobName",
        header: "Job",
    },
    {
        accessorKey: "candidateStage",
        header: "Stage",
    },
    // {
    //     accessorKey: "greenhouseCandidateId",
    //     header: "Candidate Id",
    // },
    // {
    //     accessorKey: "channelId",
    //     header: "Channel Id",
    // },
    {
        accessorKey: "appliedDate",
        header: "App. Date",
        // cell: ({ row }) => (
        // <span className="text-muted-foreground">
        // {row.original.createdAt ? format(new Date(row.original.createdAt), "PP") : ""}
        // </span>
        // ),
    },
    {
        accessorKey: "isArchived",
        header: "Archived",
        // cell: ({ row }) => (
        // <div className="flex flex-wrap gap-2">
        // {row.original.isArchived}
        // </div>
        // ),
    },
    {
        accessorKey: "name",
        header: () => <span className="pl-2">Channel Name</span>,
    },
    {
        accessorKey: "invitedUsers",
        header: "Invited Users",
        cell: ({ row }) => {
            const invUsers = row.original.invitedUsers as any[];
            return invUsers.map((invUser) => (
                <div>{invUser}</div>
                // <div>{invUsers.length} - users, {invUsers.toString()}</div>
            ));
            // let invitedUsers = row.original.invitedUsers as any[]
            // // if(row.original.conditions && row.original.conditions.length){
            // //     invitedUsers = row.original.invitedUsers.map(formatCondition);
            // // }
            // return (
            //     <div
            //         className="cursor-pointer hover:underline"
            //         title={invitedUsers.join("; ")}
            //         onClick={() => console.log("Conditions Clicked:")}
            //     >
            //         {invitedUsers.length > 1
            //             ? `${invitedUsers[0]} + ${invitedUsers.length - 1} more`
            //             : invitedUsers[0]}
            //     </div>
            // );
        },
    },
    {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => <ColumnDropdown {...row.original} />,
    },
];
