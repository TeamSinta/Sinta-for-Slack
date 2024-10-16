// @ts-nocheck

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    getSlackChannelsCreatedPromise,
    type getPaginatedHiringroomsQuery,
} from "@/server/actions/hiringrooms/queries";
import {
    LucideIcon,
    Users,
    Briefcase,
    FileText,
    Repeat,
    User,
    Plus,
} from "lucide-react"; // Import icons
import { format } from "date-fns";
import Image from "next/image";
import slackLogo from "../../../../../../public/slack-logo.png";
import {
    HoverCard,
    HoverCardTrigger,
    HoverCardContent,
} from "@/components/ui/hover-card";

// Icon map with color coding for different room types
const iconMap: Record<string, { icon: LucideIcon; color: string }> = {
    Jobs: {
        icon: Briefcase,
        color: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
    },
    candidates: {
        icon: Users,
        color: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300",
    },
    reports: {
        icon: FileText,
        color: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
    },
};

// Fetch Slack Channels
async function fetchSlackChannels(hiringroomId: string) {
    const result = await getSlackChannelsCreatedPromise({
        page: 1,
        per_page: 10,
        sort: "",
        name: "",
        status: "",
        ownerId: "",
    });
    return result.data.filter(
        (channel) => channel.hiringroomId === hiringroomId,
    );
}

export function HiringroomsTable({
    hiringroomsPromise,
}: {
    hiringroomsPromise: ReturnType<typeof getPaginatedHiringroomsQuery>;
}) {
    const { data, pageCount, total } = React.use(hiringroomsPromise);

    const hiringroomsData = data.map((hiringroom) => ({
        id: hiringroom.id,
        name: hiringroom.name,
        status: hiringroom.status,
        createdAt: hiringroom.createdAt,
        recipient: hiringroom.recipient as JSON,
        objectField: hiringroom.objectField,
        alertType: hiringroom.alertType,
        conditions: hiringroom.conditions,
        customMessageBody: hiringroom.recipient.customMessageBody,
    }));

    // Mock data for participant count (replace with actual data from your system)
    const numberOfParticipants =
        hiringroomsData[0]?.recipient.recipients.length || 3;

    return (
        <div className="mx-auto max-w-6xl py-8">
            {/* Hiring Rooms List */}
            <div className="space-y-6">
                {hiringroomsData.map((hiringroom) => {
                    const IconComponent =
                        iconMap[hiringroom.objectField]?.icon || Users;
                    const iconColor =
                        iconMap[hiringroom.objectField]?.color ||
                        "text-gray-600 bg-gray-100 dark:bg-gray-700";

                    // Fetch Slack channels created for this hiring room
                    const [slackChannels, setSlackChannels] = useState([]);
                    React.useEffect(() => {
                        async function getSlackChannels() {
                            const channels = await fetchSlackChannels(
                                hiringroom.id,
                            );
                            setSlackChannels(channels);
                        }
                        getSlackChannels();
                    }, [hiringroom.id]);

                    const mainChannel =
                        slackChannels[0]?.name || "No Channels Created";
                    const additionalChannels = slackChannels.slice(1);
                    const totalChannels = slackChannels.length; // This will be the number of times created

                    return (
                        <Link
                            key={hiringroom.id}
                            href={`/hiringrooms/form/${hiringroom.id}`}
                        >
                            <div className="mb-6 flex items-center justify-between rounded-xl border border-gray-200 bg-card  p-4 text-card-foreground shadow transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-black">
                                {/* Left Section: Icon and Room Info */}
                                <div className="flex items-center space-x-4">
                                    {/* Icon with background */}
                                    <div
                                        className={`rounded-lg p-3 ${iconColor}`}
                                    >
                                        <IconComponent size={46} />
                                    </div>

                                    {/* Room Name, Created Date, and Additional Info */}
                                    <div>
                                        <p className="mt-2 pb-1 text-xs font-medium text-gray-600">
                                            {format(
                                                new Date(hiringroom.createdAt),
                                                "PPP",
                                            )}
                                        </p>
                                        <div className="pb-1 font-heading text-lg font-semibold leading-tight text-gray-800 dark:text-gray-100">
                                            <span className="text-gray-500 dark:text-gray-400"></span>
                                            {hiringroom.name}
                                        </div>
                                        {/* Display Alert Type and Conditions */}
                                        {hiringroom.alertType && (
                                            <p className="mt-1 pb-2 text-xs text-muted-foreground">
                                                <span className="rounded bg-blue-100 px-2  py-1 text-xs font-semibold text-blue-500 dark:bg-indigo-900 dark:text-indigo-400">
                                                    {hiringroom.alertType}{" "}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Middle Section: Status Badge and Stats */}

                                {/* Right Section: Recipients and Slack Channels */}
                                <div className="flex flex-col items-end space-y-2">
                                    {/* Recipients */}

                                    {/* Status Badge */}
                                    <span
                                        className={`rounded px-3 py-1 text-sm font-semibold ${
                                            hiringroom.status === "Active"
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                                        }`}
                                    >
                                        {hiringroom.status}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        {/* Participants */}
                                        <span className="flex items-center rounded bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-500 dark:bg-indigo-900 dark:text-indigo-400">
                                            <User className="mr-2 h-4 w-4" />{" "}
                                            {numberOfParticipants}
                                        </span>

                                        {/* Times Created */}
                                        <span className="flex items-center rounded bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-500 dark:bg-indigo-900 dark:text-indigo-400">
                                            <Repeat className="mr-2 h-4 w-4" />{" "}
                                            {totalChannels}
                                        </span>
                                    </div>
                                    {/* Slack Channels Badge */}
                                    <HoverCard>
                                        <HoverCardTrigger asChild>
                                            <div className="flex items-center space-x-2 rounded border bg-gray-100 px-2 py-1 shadow dark:bg-gray-700">
                                                <Image
                                                    src={slackLogo}
                                                    alt="Slack logo"
                                                    className="h-4 w-4"
                                                />
                                                <span className="text-sm text-gray-800 dark:text-gray-300">
                                                    {mainChannel}
                                                </span>
                                                {additionalChannels.length >
                                                    0 && (
                                                    <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                        +{" "}
                                                        {
                                                            additionalChannels.length
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </HoverCardTrigger>

                                        <HoverCardContent
                                            side="top"
                                            align="center"
                                            className="rounded-md bg-white p-4 shadow-md dark:bg-gray-800"
                                        >
                                            <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-200">
                                                Slack Channels
                                            </h4>
                                            <ul className="space-y-2">
                                                {additionalChannels.map(
                                                    (channel) => (
                                                        <li
                                                            key={channel.id}
                                                            className="flex items-center space-x-3"
                                                        >
                                                            {/* Slack logo next to each channel */}
                                                            <Image
                                                                src={slackLogo}
                                                                alt="Slack logo"
                                                                className="h-4 w-4"
                                                            />
                                                            <div>
                                                                {/* Channel name with improved typography */}
                                                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                                    {
                                                                        channel.name
                                                                    }
                                                                </span>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Created:{" "}
                                                                    {format(
                                                                        new Date(
                                                                            channel.createdAt,
                                                                        ),
                                                                        "PPP",
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </HoverCardContent>
                                    </HoverCard>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
