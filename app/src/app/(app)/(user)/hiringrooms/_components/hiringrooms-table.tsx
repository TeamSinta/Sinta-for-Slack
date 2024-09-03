"use client";

import React from "react";
import Link from "next/link";
import { type getPaginatedHiringroomsQuery } from "@/server/actions/hiringrooms/queries";
import { hiringroomStatusEnum } from "@/server/db/schema";
import { Badge } from "@/components/ui/badge";
import Image, { StaticImageData } from "next/image";
import slackLogo from "../../../../../../public/slack-logo.png";
import greenhouseLogo from "../../../../../../public/greenhouseLogo.png";
import flow from "../../../../../../public/kanban.jpg";
import { format } from "date-fns";

const logoMap: Record<string, StaticImageData> = {
    slack: slackLogo,
    greenhouse: greenhouseLogo,
};

const filterableColumns = [
    {
        id: "status",
        title: "Status",
        options: hiringroomStatusEnum.enumValues.map((v) => ({
            label: v,
            value: v,
        })),
    },
];

const searchableColumns = [
    { id: "name", placeholder: "Search by hiringroom name..." },
];

type HiringroomData = {
    id: string;
    name: string;
    status: string;
    createdAt: Date;
    recipient: {
        recipients: {
            source: string;
            value: string;
            label: string;
        }[];
    };
    conditions: {
        condition: string;
        value: string | number;
        unit?: string;
        field: { label: string; value: string } | string;
    }[];
    alertType: string;
    objectField: string;
    ownerId: string;
    triggerConfig: {
        type: string;
        details: Record<string, unknown>;
    };
};

export function HiringroomsTable({
    hiringroomsPromise,
}: {
    hiringroomsPromise: ReturnType<typeof getPaginatedHiringroomsQuery>;
}) {
    const { data, pageCount, total } = React.use(hiringroomsPromise);

    const hiringroomsData: HiringroomData[] = data.map((hiringroom) => ({
        id: hiringroom.id,
        name: hiringroom.name,
        status: hiringroom.status,
        createdAt: hiringroom.createdAt,
        recipient: hiringroom.recipient as JSON,
        alertType: hiringroom.alertType,
        conditions: hiringroom.conditions as JSON,
        objectField: hiringroom.objectField,
        ownerId: hiringroom.ownerId,
        triggerConfig: hiringroom.triggerConfig as JSON,
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hiringroomsData.map((hiringroom) => (
                <Link
                    key={hiringroom.id}
                    href="/hiringrooms/new"
                    className="p-4 bg-white rounded-lg shadow-md border border-border hover:shadow-lg transition-shadow"
                >
                    {/* Card Image */}
                    <div className="h-40 md:h-48 bg-gray-100 flex items-center justify-center rounded-t-lg overflow-hidden">
                        <Image
                            src={flow}
                            alt="Workflow Diagram"
                            className="object-cover h-full w-full"
                        />
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                        <h3 className="text-xl font-semibold truncate mb-2">{hiringroom.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {hiringroom.recipient.recipients.map((rec) => (
                                <Badge key={rec.value} variant="secondary" className="capitalize flex items-center">
                                    <Image src={logoMap[rec.source] ?? slackLogo} alt={`${rec.source}-logo`} className="mr-1 h-4 w-4" />
                                    {rec.label}
                                </Badge>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500">
                            Last updated: {format(new Date(hiringroom.createdAt), "PPpp")}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
}
