'use client';

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SlackHiringroom from "../../_components/slack-hiringroom"; // Assuming this component exists
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
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
const SlackChannelNameFormat: React.FC<{ format: string; setFormat: (format: string) => void; selectedType: string }> = ({
    format,
    setFormat,
    selectedType,
}) => {
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
                className="mt-2 mb-4 w-full border-none bg-gray-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Label className="text-sm text-gray-600">Available Tokens:</Label>
            <ul className="mt-2 list-none space-y-1">
                {tokens.map((token) => (
                    <li key={token.label} className="text-sm text-gray-700">
                        <strong>{`{{${token.label}}}`}</strong> - {token.example}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const SlackConfigurationStep: React.FC = () => {
    const [channelFormat, setChannelFormat] = useState("");
    const [selectedType, setSelectedType] = useState("Candidates");

    const handleOpeningTextChange = (text: string) => console.log("Opening Text:", text);
    const handleFieldsSelect = (fields: string[]) => console.log("Selected Fields:", fields);
    const handleButtonsChange = (buttons: any[]) => console.log("Buttons:", buttons);
    const handleRecipientsChange = (recipients: any[]) => console.log("Recipients:", recipients);
    const handleCustomMessageBodyChange = (messageBody: string) => console.log("Custom Message Body:", messageBody);
    const [customMessageBody, setCustomMessageBody] = useState(
      "Hi Team 👋 \n\nWelcome to the {{role_name}} Hiring Channel! This will be our hub for communication and collaboration. Let's kick things off with a few key resources and tasks.",
  );
    return (
        <div className="space-y-10">
            {/* Slack Channel Name Format Section */}
            <section className="space-y-2">
                <header className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold"></h2>
                    <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Info className="w-5 h-5 text-gray-400 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Configure how Slack channels are named and notifications are handled.</p>
                        </TooltipContent>
                    </Tooltip>
                    </TooltipProvider>
                </header>

                <Card className="p-6 rounded-lg shadow-none bg-white">
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
                <Card className="p-6 rounded-lg shadow-none bg-white">
                    <CardHeader>
                        <CardTitle className="text-sm">Opening Message</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <SlackMessageBox
  customMessageBody={customMessageBody}
  onCustomMessageBodyChange={handleCustomMessageBodyChange}
/>

                    </CardContent>
                </Card>
            </section>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4 sticky bottom-0 bg-white py-4 shadow-lg">
                <Button variant="secondary" className="py-2 px-6">Back</Button>
                <Button variant="primary" className="py-2 px-6">Continue</Button>
            </div>
        </div>
    );
};

export default SlackConfigurationStep;
