"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import SlackMessageBox from "./slack-messageBox";

const candidateTokens = [
    { label: "CANDIDATE_NAME", example: '"John Doe"' },
    { label: "CANDIDATE_LAST_NAME", example: '"Doe"' },
    { label: "CANDIDATE_FIRST_NAME", example: '"John"' },
    { label: "CANDIDATE_CREATION_DATE", example: '"2023-03-14"' },
];

const jobTokens = [
    { label: "JOB_NAME", example: '"Software Engineer"' },
    { label: "JOB_POST_DATE", example: '"2023-03-14"' },
];

// Clean Apple-Like UI for Slack Channel Naming Component
const SlackChannelNameFormat: React.FC<{
    format: string;
    setFormat: (format: string) => void;
    selectedType: string;
}> = ({ format, setFormat, selectedType }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormat(e.target.value);
    };

    const tokens = selectedType === "Candidates" ? candidateTokens : jobTokens;

    return (
        <div>
            <Label className="text-sm font-semibold">Channel Name Format</Label>
            <Input
                type="text"
                value={format}
                onChange={handleChange}
                placeholder="Enter the Slack channel format"
                className="mb-4 mt-2 w-full rounded-lg border-none bg-gray-100 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Label className="text-sm text-gray-600">Available Tokens:</Label>
            <ul className="mt-2 list-none space-y-1">
                {tokens.map((token) => (
                    <li key={token.label} className="text-sm text-gray-700">
                        <strong>{`{{${token.label}}}`}</strong> -{" "}
                        {token.example}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const SlackConfigurationStep: React.FC = () => {
    const [channelFormat, setChannelFormat] = useState("");
    const [selectedType, setSelectedType] = useState("Candidates");

    const handleCustomMessageBodyChange = (messageBody: string) =>
        console.log("Custom Message Body:", messageBody);
    const [customMessageBody, setCustomMessageBody] = useState(
        "Hi Team 👋 \n\nWelcome to the {{role_name}} Hiring Channel! This will be our hub for communication and collaboration. Let's kick things off with a few key resources and tasks.",
    );
    return (
        <div className="space-y-10">
            {/* Slack Channel Name Format Section */}
            <section className="space-y-2">
                <header className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold"></h2>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="h-5 w-5 cursor-pointer text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>
                                    Configure how Slack channels are named and
                                    notifications are handled.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </header>

                <Card className="rounded-lg bg-white p-6 shadow-none">
                    <CardContent>
                        <SlackChannelNameFormat
                            format={channelFormat}
                            setFormat={setChannelFormat}
                            selectedType={selectedType}
                        />
                    </CardContent>
                </Card>
            </section>

            {/* Slack Hiring Room Section */}
            <section className="space-y-4">
                <div className="text-sm font-medium">Opening Message</div>

                <SlackMessageBox
                    customMessageBody={customMessageBody}
                    onCustomMessageBodyChange={handleCustomMessageBodyChange}
                />
            </section>
            <div className="flex items-end justify-end space-x-4">
                <Button
                    variant="secondary"
                    onClick={() => console.log("Back to previous step")} // Implement back button
                    className="rounded-md bg-gray-200 px-4 py-2 text-gray-700"
                >
                    Back
                </Button>
                <Button className="rounded-md bg-blue-600 px-4 py-2 text-white">
                    Continue
                </Button>
            </div>
        </div>
    );
};

export default SlackConfigurationStep;
