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
            id: "status",
            title: "Status",
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
};

const searchableColumns: DataTableSearchableColumn<SlackChannelsCreatedData>[] =
    [{ id: "name", placeholder: "Search by slack channels created name..." }];

export function SlackChannelsCreatedTable({
    slackChannelsCreatedPromise,
}: SlackChannelsCreatedTableProps) {
    const { data, pageCount, total } = React.use(slackChannelsCreatedPromise);

    const columns = useMemo<ColumnDef<SlackChannelsCreatedData, unknown>[]>(
        () => getColumns(),
        [],
    );

    const slackChannelsCreatedData: SlackChannelsCreatedData[] = data.map(
        (slack_channel) => {
            return {
                id: slack_channel.id,
                name: slack_channel.name,
                greenhouseCandidateId: slack_channel.greenhouseCandidateId,
                greenhouseJobId: slack_channel.greenhouseJobId,
                isArchived: slack_channel.isArchived,
                invitedUsers: slack_channel.invitedUsers,
                channelFormat: slack_channel.channelFormat,
                channelId: slack_channel.channelId,
                createdAt: slack_channel.createdAt,
                greenhouseCandidateName: "Name",
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
    console.log("slackchanenlcreate - ", slackChannelsCreatedData);
    console.log("data - ", data);
    console.log("total - ", total);

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
