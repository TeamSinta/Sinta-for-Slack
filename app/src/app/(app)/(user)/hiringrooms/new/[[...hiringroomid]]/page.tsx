"use client";

import React from "react";
import Image, { StaticImageData } from "next/image";
import slackLogo from "../../../../../../../public/slack-logo.png";
import greenhouseLogo from "../../../../../../../public/greenhouseLogo.png";
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
                        { id: "item-1", label: "Post Job to Slack", source: "slack", records: 124 },
                        { id: "item-2", label: "Post Job to Greenhouse", source: "greenhouse", records: 102 },
                    ],
                },
                {
                  id: "1-2",
                  title: "Discovery",
                  items: [
                      { id: "item-1", label: "Post Job to Slack", source: "slack", records: 124 },
                      { id: "item-2", label: "Post Job to Greenhouse", source: "greenhouse", records: 102 },
                  ],
              }
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
                        { id: "item-3", label: "Initial Screening", source: "slack", records: 204 },
                        { id: "item-4", label: "Technical Interview", source: "greenhouse", records: 142 },
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
                        { id: "item-5", label: "Send Offer", source: "slack", records: 172 },
                        { id: "item-6", label: "Negotiation", source: "greenhouse", records: 113 },
                    ],
                },
                {
                    id: "3-2",
                    title: "Onboarding",
                    items: [
                        { id: "item-7", label: "Onboard New Hire", source: "slack", records: 232 },
                        { id: "item-8", label: "Setup in Greenhouse", source: "greenhouse", records: 121 },
                    ],
                },
            ],
        },
    ],
};

export default function JourneyBuilder() {
    return (
        <div className="min-h-screen min-w-[73vw] flex pt-6">
            {/* Container for the Kanban Board */}
            <div className="relative z-10 bg-slate-100 rounded-lg shadow-inner p-2 w-full max-w-full max-h-[95vh] overflow-x-auto overflow-y-hidden">
                {/* Title Box */}
                <div className="flex justify-between w-full">

                <div className="bg-white p-4 mt-4 rounded-lg mb-6 w-96">

                    <h1 className="font-heading text-lg font-bold">Hiring Process Kanban Board</h1>
                </div>
                <div className="bg-white pt-2 pb-2 px-2 mt-4 rounded-lg mb-8 w-26">
                  <StageSelectionModal/>
                  </div>
                </div>
                <div className="flex items-start justify-start min-h-[95vh] min-w-[10%] space-x-6">
                    {mockHiringProcess.sections.map((section) => (
                        <div key={section.id} className="flex flex-col space-y-6 min-h-[95vh] min-w-[600px]">
                            {/* Section Label */}
                            <div className="bg-white rounded-lg shadow-md p-4" style={{ backgroundColor: section.color }}>
                                <h2 className="text-lg font-semibold text-center">{section.label}</h2>
                            </div>

                            {/* Columns within the section */}
                            <div className="flex space-x-4 min-h-[75vh]">
                                {section.columns.map((column) => (
                                    <div key={column.id} className="w-[100%] bg-white rounded-lg shadow-md p-4 flex flex-col justify-start ">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold">{column.title}</h3>
                                            <PlusCircle className="h-6 w-6 text-gray-400 cursor-pointer hover:text-gray-600" />
                                        </div>
                                        <div className="flex flex-col space-y-4">
                                            {column.items.map((item) => (
                                                <div key={item.id} className="bg-gray-50 p-4 rounded-lg shadow-sm flex flex-col">
                                                    <div className="flex items-center mb-2">
                                                        <Image
                                                            src={logoMap[item.source]}
                                                            alt={`${item.source}-logo`}
                                                            className="h-6 w-6 mr-3"
                                                        />
                                                        <span className="font-medium text-gray-800">{item.label}</span>
                                                    </div>
                                                    {/* Actions Subheader */}
                                                    <div className="border-t mt-2 pt-2 flex flex-col">
                                                        <h4 className="text-sm font-semibold text-gray-600">Actions:</h4>
                                                        <div className="mt-2 space-y-2">
                                                            {/* Example action items */}
                                                            <div className="bg-white p-2 rounded-lg shadow-sm text-gray-700">Action 1</div>
                                                            <div className="bg-white p-2 rounded-lg shadow-sm text-gray-700">Action 2</div>
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
