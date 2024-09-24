'use client';

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SlackHiringroom from "../../_components/slack-hiringroom";

const candidateTokens = [
    { label: "CANDIDATE_NAME", example: '"John Doe" for John Doe' },
    { label: "CANDIDATE_LAST_NAME", example: '"Doe" for John Doe' },
    { label: "CANDIDATE_FIRST_NAME", example: '"John" for John Doe' },
    { label: "CANDIDATE_CREATION_MONTH_TEXT", example: '"March" for March' },
    { label: "CANDIDATE_CREATION_MONTH_NUMBER", example: '"03" for March' },
    { label: "CANDIDATE_CREATION_MONTH_TEXT_ABBREVIATED", example: '"Mar" for March' },
    { label: "CANDIDATE_CREATION_DAY_NUMBER", example: '"11" for the 11th' },
    { label: "CANDIDATE_CREATION_DATE", example: '"2023-03-14" for March 14th, 2023' },
];

const jobTokens = [
    { label: "JOB_NAME", example: '"Software Engineer" for the job name' },
    { label: "JOB_POST_DATE", example: '"2023-03-14" for the job post date' },
    { label: "JOB_POST_MONTH_TEXT", example: '"March" for March' },
    { label: "JOB_POST_MONTH_NUMBER", example: '"03" for March' },
    { label: "JOB_POST_MONTH_TEXT_ABBREVIATED", example: '"Mar" for March' },
    { label: "JOB_POST_DAY_NUMBER", example: '"11" for the 11th' },
];

interface SlackChannelNameFormatProps {
    format: string;
    setFormat: (format: string) => void;
    selectedType: string;
}

const SlackChannelNameFormat: React.FC<SlackChannelNameFormatProps> = ({
    format,
    setFormat,
    selectedType,
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormat(e.target.value);
    };

    const tokens = selectedType === "Candidates" ? candidateTokens : jobTokens;

    return (
        <div className="">
            <Label className="text-md font-medium text-gray-700 dark:text-gray-300">
                Slack Channel Name Format
            </Label>
            <Input
                type="text"
                value={format}
                onChange={handleChange}
                className="mb-4 w-full border border-gray-300 bg-white"
            />
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tokens Available:
            </Label>
            <ul className="mb-4 list-disc pl-5 text-xs">
                {tokens.map((token) => (
                    <li key={token.label}>
                        <strong>{`{{${token.label}}}`}</strong> - i.e.{" "}
                        {token.example}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const SlackConfigurationStep: React.FC = () => {
    const [channelFormat, setChannelFormat] = useState("");
    const [selectedType, setSelectedType] = useState("Candidates"); // 'Candidates' or 'Jobs'

    // Handlers for SlackHiringroom Component
    const handleOpeningTextChange = (text: string) => {
        console.log("Opening Text:", text);
    };

    const handleFieldsSelect = (fields: string[]) => {
        console.log("Selected Fields:", fields);
    };

    const handleButtonsChange = (buttons: any[]) => {
        console.log("Buttons:", buttons);
    };

    const handleRecipientsChange = (recipients: any[]) => {
        console.log("Recipients:", recipients);
    };

    const handleCustomMessageBodyChange = (messageBody: string) => {
        console.log("Custom Message Body:", messageBody);
    };

    return (
        <div className="space-y-6">
            {/* Slack Channel Name Format Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Slack Channel Name Format</CardTitle>
                </CardHeader>
                <CardContent>
                    <SlackChannelNameFormat
                        format={channelFormat}
                        setFormat={setChannelFormat}
                        selectedType={selectedType}
                    />
                </CardContent>
            </Card>

            {/* Slack Hiring Room Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Slack Hiring Room Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                    <SlackHiringroom
                        onOpeningTextChange={handleOpeningTextChange}
                        onFieldsSelect={handleFieldsSelect}
                        onButtonsChange={handleButtonsChange}
                        onRecipientsChange={handleRecipientsChange}
                        onCustomMessageBodyChange={handleCustomMessageBodyChange}
                    />
                </CardContent>
            </Card>

            {/* Continue and Back Buttons */}
            <div className="flex justify-between mt-4">
                <Button variant="secondary">Back</Button>
                <Button variant="primary">Continue</Button>
            </div>
        </div>
    );
};

export default SlackConfigurationStep;
