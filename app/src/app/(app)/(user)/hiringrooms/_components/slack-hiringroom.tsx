// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FancyMultiSelect } from "@/components/ui/fancy-multi-select";
import { FancyBox } from "@/components/ui/fancy.box";
import { getActiveUsers, getChannels } from "@/server/slack/core";
import { getMockGreenhouseData } from "@/server/greenhouse/core";
import MessageButtons, { type ButtonAction, ButtonType } from "./message-buttons";
import slackLogo from "../../../../../../public/slack-logo.png";
import sintaLogo from "../../../../../../public/sintalogo.png";

import Image from "next/image";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const fields = [
    { value: "name", label: "Candidate Name", color: "" },
    { value: "title", label: "Job Title", color: "" },
    { value: "company", label: "Company", color: "" },
    { value: "email", label: "Email Address", color: "" }, // Assuming you will parse to get primary email
    { value: "phone", label: "Phone Number", color: "" }, // Assuming parsing for primary phone
    { value: "social_media", label: "Social Media", color: "" }, // Need to handle parsing
    { value: "recruiter_name", label: "Recruiter Name", color: "" },
    { value: "coordinator_name", label: "Coordinator Name", color: "" },
];

const variableOptions = [
    { value: "{{Interviewer}}", label: "Interviewer" },
    { value: "{{Role title}}", label: "Role Title" },
    { value: "{{Job Stage}}", label: "Job Stage" },
    { value: "{{Recruiter}}", label: "Recruiter" },
    { value: "{{Candidate_Name}}", label: "Candidate Name" },
];

interface SlackHiringroomProps {
    onOpeningTextChange: (text: string) => void;
    onFieldsSelect: (fields: string[]) => void;
    onButtonsChange: (buttons: ButtonAction[]) => void;
    onRecipientsChange: (recipients: Option[]) => void;
    onCustomMessageBodyChange: (customMessageBody: string) => void;
}

type Option = {
    value: string;
    label: string;
    source: "slack" | "greenhouse"; // Define possible sources here
};

const SlackHiringroom: React.FC<SlackHiringroomProps> = ({
    onOpeningTextChange,
    onFieldsSelect,
    onButtonsChange,
    onRecipientsChange,
    onCustomMessageBodyChange,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [openingText, setOpeningText] = useState("");
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [buttons, setButtons] = useState<ButtonAction[]>([]);
    const [selectedRecipients, setSelectedRecipients] = useState<Option[]>([]);
    const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
    const [showMarkdownInput, setShowMarkdownInput] = useState(false);
    const [customMessageBody, setCustomMessageBody] = useState("");

    const handleOpeningTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOpeningText(e.target.value);
        onOpeningTextChange(e.target.value);
    };

    const handleFieldsSelect = (selectedOptions: string[]) => {
        setSelectedFields(selectedOptions);
        onFieldsSelect(selectedOptions);
    };

    const handleButtonsChange = (newButtons: ButtonAction[]) => {
        setButtons(newButtons);
        onButtonsChange(newButtons);
    };

    const handleRecipientsChange = (selectedOptions: Option[]) => {
        setSelectedRecipients(selectedOptions);
        onRecipientsChange(selectedOptions);
    };

    const addButton = () => {
        const newButtons = [
            ...buttons,
            { label: "", action: "", type: ButtonType.UpdateButton },
        ];
        handleButtonsChange(newButtons);
    };

    const updateButton = (index: number, key: keyof ButtonAction, value: string) => {
        const newButtons = [...buttons];
        newButtons[index][key] = value;
        handleButtonsChange(newButtons);
    };

    const removeButton = (index: number) => {
        const newButtons = buttons.filter((_, i) => i !== index);
        handleButtonsChange(newButtons);
    };

    useEffect(() => {
        setIsLoading(true);
        const fetchData = async () => {
            try {
                const [channelsData, usersData, greenhouseData] = await Promise.all([
                    getChannels(),
                    getActiveUsers(),
                    getMockGreenhouseData(),
                ]);

                const combinedOptions = [
                    ...usersData.map((user) => ({ ...user, source: "slack" })),
                    { label: ` ${greenhouseData.recruiter}`, value: greenhouseData.recruiter, source: "greenhouse" },
                    { label: ` ${greenhouseData.coordinator}`, value: greenhouseData.coordinator, source: "greenhouse" },
                    { label: ` ${greenhouseData.hiringTeam}`, value: greenhouseData.hiringTeam, source: "greenhouse" },
                    { label: ` ${greenhouseData.admin}`, value: greenhouseData.admin, source: "greenhouse" },
                    { label: ` ${greenhouseData.owner}`, value: greenhouseData.owner, source: "greenhouse" },
                ];
                setOptions(combinedOptions);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
            setIsLoading(false);
        };

        void fetchData();
    }, []);

    const handleCustomMessageBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setCustomMessageBody(value);
        onCustomMessageBodyChange(value);
    };

    const handleVariableSelect = (variable: string) => {
        const value = customMessageBody + variable;
        setCustomMessageBody(value);
        onCustomMessageBodyChange(value);
    };

    return (
        <div className="hiringroom-container mt-4">
            <div className="flex items-center">
                <Label className="text-xl font-bold">
                    Configure Slack Recipients{" "}
                </Label>
                <Image src={slackLogo} alt="slack-logo" className="ml-2 h-7 w-7" />{" "}
            </div>

            {/* Checkbox to Add Custom Message Body */}
            <div className="my-4">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="customMessageBody"
                        checked={showMarkdownInput}
                        onCheckedChange={() => setShowMarkdownInput(!showMarkdownInput)}
                    />
                    <label
                        htmlFor="customMessageBody"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Select this to add custom body message
                    </label>
                </div>
            </div>

            {/* Custom Message Body Input */}
            {showMarkdownInput && (
                <div className="mt-4 border border-gray-300 rounded-lg p-4 shadow-sm bg-white">
                    <div className="flex items-start mb-2">
                        <Image
                            src={sintaLogo} // Replace this with the user profile image URL
                            alt="user-profile"
                            className="h-10 w-10 rounded"
                        />
                        <div className="ml-2 flex-1">
                            <div className="font-semibold text-gray-700 flex items-center">
                                Sinta
                                <span className="bg-gray-200 text-gray-500 text-xs font-medium ml-1 px-1.5 py-0.5 rounded">APP</span>
                            </div>
                            <div className="text-xs text-gray-500">3:53 PM</div>
                        </div>
                    </div>

                    <div className="ml-12 mt-2">
                        <textarea
                            value={customMessageBody}
                            onChange={handleCustomMessageBodyChange}
                            placeholder="Enter custom message body..."
                            className="w-full p-2 bg-gray-50 border border-gray-300 rounded resize-none shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        ></textarea>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="mt-2 ml-12">Insert Variable</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuGroup>
                                {variableOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onClick={() => handleVariableSelect(option.value)}
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {/* Message Buttons */}
            <MessageButtons
                buttons={buttons}
                addButton={addButton}
                updateButton={updateButton}
                removeButton={removeButton}
            />

            {/* Multi-Select for Recipients */}
            <div className="my-4">
                <Label>Recipients</Label>
                <FancyMultiSelect
                    selectedOptions={selectedRecipients}
                    onOptionChange={handleRecipientsChange}
                    options={options}
                    loading={isLoading}
                />
            </div>
        </div>
    );
};

export default SlackHiringroom;
