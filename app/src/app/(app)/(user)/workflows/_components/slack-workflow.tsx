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
import MessageButtons, {
    type ButtonAction,
    ButtonType,
} from "./message-buttons";
import slackLogo from "../../../../../../public/slack-logo.png";
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

interface SlackWorkflowProps {
    onOpeningTextChange: (text: string) => void;
    onFieldsSelect: (fields: string[]) => void;
    onButtonsChange: (buttons: ButtonAction[]) => void;
    onRecipientsChange: (recipients: Option[]) => void;
    onCustomMessageBodyChange: (customMessageBody: string) => void; // Add this line
}

type Option = {
    value: string;
    label: string;
    source: "slack" | "greenhouse"; // Define possible sources here
};

const SlackWorkflow: React.FC<SlackWorkflowProps> = ({
    onOpeningTextChange,
    onFieldsSelect,
    onButtonsChange,
    onRecipientsChange,
    onCustomMessageBodyChange, // Add this line
    selectedRecipients,
    setSelectedRecipients
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [openingText, setOpeningText] = useState("");
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [buttons, setButtons] = useState<ButtonAction[]>([]);
    // const [selectedRecipients, setSelectedRecipients] = useState<Option[]>([]);
    const [options, setOptions] = useState<{ value: string; label: string }[]>(
        [],
    );
    const [showMarkdownInput, setShowMarkdownInput] = useState(false); // Add this state
    const [customMessageBody, setCustomMessageBody] = useState(""); // Add this state

    const handleOpeningTextChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
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
        onRecipientsChange(selectedOptions); // Directly passing the array of objects
    };

    const addButton = () => {
        const newButtons = [
            ...buttons,
            { label: "", action: "", type: ButtonType.UpdateButton },
        ];
        handleButtonsChange(newButtons);
    };

    const updateButton = (
        index: number,
        key: keyof ButtonAction,
        value: string,
    ) => {
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
                // Fetch both sets of data in parallel
                const [channelsData, usersData, greenhouseData] =
                    await Promise.all([
                        getChannels(),
                        getActiveUsers(),
                        getMockGreenhouseData(),
                    ]);

                // Combine the data into a single array, incorporating greenhouseData
                const combinedOptions = [
                    ...channelsData.map((channel) => ({
                        ...channel,
                        source: "slack",
                    })),
                    ...usersData.map((user) => ({ ...user, source: "slack" })),
                    {
                        label: ` ${greenhouseData.recruiter}`,
                        value: greenhouseData.recruiter,
                        source: "greenhouse",
                    },
                    {
                        label: ` ${greenhouseData.coordinator}`,
                        value: greenhouseData.coordinator,
                        source: "greenhouse",
                    },
                    {
                        label: ` ${greenhouseData.hiringTeam}`,
                        value: greenhouseData.hiringTeam,
                        source: "greenhouse",
                    },
                    {
                        label: ` ${greenhouseData.admin}`,
                        value: greenhouseData.admin,
                        source: "greenhouse",
                    },
                    {
                        label: ` ${greenhouseData.interviewer}`,
                        value: greenhouseData.interviewer,
                        source: "greenhouse",
                    },
                ];
                setOptions(combinedOptions);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
            setIsLoading(false);
        };

        void fetchData();
    }, []);

    const handleCustomMessageBodyChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
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
        <div className="workflow-container mt-4">
            <div className="flex items-center">
                <Label className="text-xl font-bold">
                    Configure Slack Alert{" "}
                </Label>
                <Image
                    src={slackLogo}
                    alt={`slack-logo`}
                    className="ml-2 h-7 w-7"
                />{" "}
            </div>
            {/* Opening Text */}
            <div className="my-4">
                <Label>Opening Text</Label>
                <Input
                    value={openingText}
                    onChange={handleOpeningTextChange}
                    placeholder="Enter opening text..."
                />
            </div>

            {/* Message Fields */}
            <div className="my-4">
                <Label>Select Message Fields</Label>
                <FancyBox
                    selectedOptions={selectedFields}
                    onOptionChange={handleFieldsSelect}
                    fields={fields}
                />
            </div>

            {/* Checkbox to Add Custom Message Body */}
            <div className="my-4">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="customMessageBody"
                        checked={showMarkdownInput}
                        onCheckedChange={() =>
                            setShowMarkdownInput(!showMarkdownInput)
                        }
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
                <div className="my-4">
                    <Label>Custom Message Body</Label>
                    <textarea
                        value={customMessageBody}
                        onChange={handleCustomMessageBodyChange}
                        placeholder="Enter custom message body..."
                        className="mt-2 h-24 w-full rounded border border-gray-300 p-2"
                    ></textarea>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">Insert Variable</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuGroup>
                                {variableOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onClick={() =>
                                            handleVariableSelect(option.value)
                                        }
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

export default SlackWorkflow;
