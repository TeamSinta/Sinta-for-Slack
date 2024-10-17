"use client";

import React from "react";
import Image, { StaticImageData } from "next/image";
import slackLogo from "../../../../../../../public/slack-logo.png";
import greenhouseLogo from "../../../../../../../public/greenhouselogo.png";
import { PlusCircle } from "lucide-react";
import { StageSelectionModal } from "../components/create-new-modal";

const logoMap: Record<string, StaticImageData> = {
    slack: slackLogo,
    greenhouse: greenhouseLogo,
};

const mockHiringProcess = {
    sections: [
        {
            id: "1",
            label: "Sourcing",
            color: "#E0F7FA",
            columns: [
                {
                    id: "1-1",
                    title: "Discovery",
                    items: [
                        {
                            id: "item-1",
                            label: "Post Job to Slack",
                            source: "slack",
                            records: 124,
                        },
                        {
                            id: "item-2",
                            label: "Post Job to Greenhouse",
                            source: "greenhouse",
                            records: 102,
                        },
                    ],
                },
                {
                    id: "1-2",
                    title: "Discovery",
                    items: [
                        {
                            id: "item-1",
                            label: "Post Job to Slack",
                            source: "slack",
                            records: 124,
                        },
                        {
                            id: "item-2",
                            label: "Post Job to Greenhouse",
                            source: "greenhouse",
                            records: 102,
                        },
                    ],
                },
                // Add more columns if needed
            ],
        },
        {
            id: "2",
            label: "Interviewing",
            color: "#FFF3E0",
            columns: [
                {
                    id: "2-1",
                    title: "Interviews",
                    items: [
                        {
                            id: "item-3",
                            label: "Initial Screening",
                            source: "slack",
                            records: 204,
                        },
                        {
                            id: "item-4",
                            label: "Technical Interview",
                            source: "greenhouse",
                            records: 142,
                        },
                    ],
                },
                // Add more columns if needed
            ],
        },
        {
            id: "3",
            label: "Onboarding",
            color: "#E8F5E9",
            columns: [
                {
                    id: "3-1",
                    title: "Offers",
                    items: [
                        {
                            id: "item-5",
                            label: "Send Offer",
                            source: "slack",
                            records: 172,
                        },
                        {
                            id: "item-6",
                            label: "Negotiation",
                            source: "greenhouse",
                            records: 113,
                        },
                    ],
                },
                {
                    id: "3-2",
                    title: "Onboarding",
                    items: [
                        {
                            id: "item-7",
                            label: "Onboard New Hire",
                            source: "slack",
                            records: 232,
                        },
                        {
                            id: "item-8",
                            label: "Setup in Greenhouse",
                            source: "greenhouse",
                            records: 121,
                        },
                    ],
                },
            ],
        },
    ],
};

export default function JourneyBuilder() {
    return (
        <div className="flex min-h-screen min-w-[73vw] pt-6">
            {/* Container for the Kanban Board */}
            <div className="relative z-10 max-h-[95vh] w-full max-w-full overflow-x-auto overflow-y-hidden rounded-lg bg-slate-100 p-2 shadow-inner">
                {/* Title Box */}
                <div className="flex w-full justify-between">
                    <div className="mb-6 mt-4 w-96 rounded-lg bg-white p-4">
                        <h1 className="font-heading text-lg font-bold">
                            Hiring Process Kanban Board
                        </h1>
                    </div>
                    <div className="w-26 mb-8 mt-4 rounded-lg bg-white px-2 pb-2 pt-2">
                        <StageSelectionModal />
                    </div>
                </div>
                <div className="flex min-h-[95vh] min-w-[10%] items-start justify-start space-x-6">
                    {mockHiringProcess.sections.map((section) => (
                        <div
                            key={section.id}
                            className="flex min-h-[95vh] min-w-[600px] flex-col space-y-6"
                        >
                            {/* Section Label */}
                            <div
                                className="rounded-lg bg-white p-4 shadow-md"
                                style={{ backgroundColor: section.color }}
                            >
                                <h2 className="text-center text-lg font-semibold">
                                    {section.label}
                                </h2>
                            </div>

                            {/* Columns within the section */}
                            <div className="flex min-h-[75vh] space-x-4">
                                {section.columns.map((column) => (
                                    <div
                                        key={column.id}
                                        className="flex w-[100%] flex-col justify-start rounded-lg bg-white p-4 shadow-md "
                                    >
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">
                                                {column.title}
                                            </h3>
                                            <PlusCircle className="h-6 w-6 cursor-pointer text-gray-400 hover:text-gray-600" />
                                        </div>
                                        <div className="flex flex-col space-y-4">
                                            {column.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex flex-col rounded-lg bg-gray-50 p-4 shadow-sm"
                                                >
                                                    <div className="mb-2 flex items-center">
                                                        <Image
                                                            src={
                                                                logoMap[
                                                                    item.source
                                                                ] || ""
                                                            }
                                                            alt={`${item.source}-logo`}
                                                            className="mr-3 h-6 w-6"
                                                        />
                                                        <span className="font-medium text-gray-800">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                    {/* Actions Subheader */}
                                                    <div className="mt-2 flex flex-col border-t pt-2">
                                                        <h4 className="text-sm font-semibold text-gray-600">
                                                            Actions:
                                                        </h4>
                                                        <div className="mt-2 space-y-2">
                                                            {/* Example action items */}
                                                            <div className="rounded-lg bg-white p-2 text-gray-700 shadow-sm">
                                                                Action 1
                                                            </div>
                                                            <div className="rounded-lg bg-white p-2 text-gray-700 shadow-sm">
                                                                Action 2
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
