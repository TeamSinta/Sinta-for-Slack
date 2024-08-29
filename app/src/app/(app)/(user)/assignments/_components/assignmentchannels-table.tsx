// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client";

import { DataTable } from "@/app/(app)/_components/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";
import {
    getColumns,
    type SlackChannelsCreatedData,
} from "./slackchannelscreated-columns"; // Adjust to include correct imports and types for hiringrooms
import { slackChannelsCreatedStatusEnum } from "@/server/db/schema";
import { useDataTable } from "@/hooks/use-data-table";
import type {
    DataTableFilterableColumn,
    DataTableSearchableColumn,
} from "@/types/data-table";
import { type getSlackChannelsCreatedPromise } from "@/server/actions/hiringrooms/queries";

const filterableColumns: DataTableFilterableColumn<SlackChannelsCreatedData>[] =
    [
        {
            id: "isArchived",
            title: "isArchived",
            options: slackChannelsCreatedStatusEnum.enumValues.map((v) => ({
                label: v,
                value: v,
            })),
        },
    ];

type SlackChannelsCreatedTableProps = {
    slackChannelsCreatedPromise: ReturnType<
        typeof getSlackChannelsCreatedPromise
    >;
    greenhouseCandidateDict: any;
    greenhouseJobsDict: any;
};

const searchableColumns: DataTableSearchableColumn<SlackChannelsCreatedData>[] =
    [{ id: "name", placeholder: "Search by slack channels created name..." }];

export function AssignmentsChannelTable({
    slackChannelsCreatedPromise,
    greenhouseCandidateDict,
    greenhouseJobsDict,
}: SlackChannelsCreatedTableProps) {
    const { data, pageCount, total } = React.use(slackChannelsCreatedPromise);
    // console.log('DATA -')
    const columns = useMemo<ColumnDef<SlackChannelsCreatedData, unknown>[]>(
        () => getColumns(),
        [],
    );

    const slackChannelsCreatedData: SlackChannelsCreatedData[] = data.map(
        (slack_channel) => {
            const curCand =
                greenhouseCandidateDict[slack_channel.greenhouseCandidateId];
            const curJob = greenhouseJobsDict[slack_channel.greenhouseJobId];
            const curApp = curCand?.applications
                ? curCand.applications[0]
                : null;
            const appliedDate = new Date(curApp.applied_at);
            const formattedDate = `${appliedDate.getMonth() + 1}/${appliedDate.getDate()}`;

            return {
                id: slack_channel.id,
                name: slack_channel.name,
                appliedDate: formattedDate,
                candidateStage: curApp.current_stage.name,
                greenhouseCandidateInitials: curCand
                    ? (
                          curCand.first_name[0] + curCand.last_name[0]
                      ).toUpperCase()
                    : "",
                greenhouseCandidateName: curCand
                    ? curCand.first_name + " " + curCand.last_name
                    : "",
                greenhouseCandidateId: slack_channel.greenhouseCandidateId,
                greenhouseJobName: curJob ? curJob.name : "",
                greenhouseJobId: slack_channel.greenhouseJobId,
                isArchived: slack_channel.isArchived,
                invitedUsers: slack_channel.invitedUsers,
                channelFormat: slack_channel.channelFormat,
                channelId: slack_channel.channelId,
                createdAt: slack_channel.createdAt,
                // greenhouseCandidateId: s
                // name: hiringroom.name,
                // status: slack_channel.status,
                // createdAt: hiringroom.createdAt,
                // recipient: hiringroom.recipient as JSON, // Cast to JSON
                // alertType: hiringroom.alertType,
                // conditions: hiringroom.conditions as JSON, // Cast to JSON
                // objectField: hiringroom.objectField,
                // ownerId: hiringroom.ownerId,
                // triggerConfig: hiringroom.triggerConfig as JSON, // Cast to JSON
            };
        },
    );

    const { table } = useDataTable({
        data: slackChannelsCreatedData,
        columns,
        pageCount,
        searchableColumns,
        filterableColumns,
    });
    // console.log('slackchanenlcreate - ',slackChannelsCreatedData)
    // console.log('data - ',data)
    // console.log('total - ',total)

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
