// @ts-nocheck

import React from "react";
import Link from "next/link";
import { type getPaginatedHiringroomsQuery } from "@/server/actions/hiringrooms/queries";
import { hiringroomStatusEnum } from "@/server/db/schema";
import { Badge } from "@/components/ui/badge";
import Image, { StaticImageData } from "next/image";
import slackLogo from "../../../../../../public/slack-logo.png";
import greenhouseLogo from "../../../../../../public/greenhouseLogo.png";
import flow from "../../../../../../public/RoleChannel.png";
import jobsImage from "../../../../../../public/RoleChannel.png"; // Add your image here
import candidatesImage from "../../../../../../public/Candidate-Channel.png"; // Add your image here
import { format } from "date-fns";

// Map the appropriate images for the different object fields
const imageMap: Record<string, StaticImageData> = {
    jobs: jobsImage,
    candidates: candidatesImage,
};

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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hiringroomsData.map((hiringroom) => (
                <Link
                    key={hiringroom.id}
                    href="/hiringrooms/form"
                    className="rounded-lg border border-border bg-white p-4 shadow-md transition-shadow hover:shadow-lg"
                >
                    {/* Card Image */}
                    <div className="flex h-40 items-center justify-center overflow-hidden rounded-t-lg bg-gray-100 md:h-48">
                        <Image
                            src={imageMap[hiringroom.objectField] || flow} // Use the objectField to select the appropriate image
                            alt={`${hiringroom.objectField}-image`}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                        <h3 className="mb-2 truncate text-xl font-semibold">
                            {hiringroom.name}
                        </h3>
                        <div className="mb-3 flex flex-wrap gap-2">
                            {hiringroom.recipient.recipients.map((rec) => (
                                <Badge
                                    key={rec.value}
                                    variant="secondary"
                                    className="flex items-center capitalize"
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
                        <p className="text-xs text-gray-500">
                            Last updated:{" "}
                            {format(new Date(hiringroom.createdAt), "PPpp")}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
}
