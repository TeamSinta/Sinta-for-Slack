"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { FancyMultiSelect } from "@/components/ui/fancy-multi-select";
import { getActiveUsers, getChannels } from "@/server/slack/core";
import { getMockGreenhouseData } from "@/server/greenhouse/core";
import MessageButtons, {
    type ButtonAction,
    ButtonType,
    UpdateActionType,
} from "./message-buttons";
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
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const fields = [
    { value: "name", label: "Candidate Name" },
    { value: "title", label: "Job Title" },
    { value: "company", label: "Company" },
    { value: "email", label: "Email Address" },
    { value: "phone", label: "Phone Number" },
    { value: "social_media", label: "Social Media" },
    { value: "recruiter_name", label: "Recruiter Name" },
    { value: "coordinator_name", label: "Coordinator Name" },
];

const variableOptions = [
    { value: "{{Interviewer}}", label: "Interviewer" },
    { value: "{{Role title}}", label: "Role Title" },
    { value: "{{Job Stage}}", label: "Job Stage" },
    { value: "{{Recruiter}}", label: "Recruiter" },
    { value: "{{Candidate_Name}}", label: "Candidate Name" },
];

const specialVariableOptions = [
    { value: "{{All Job Stages}}", label: "All Job Stages" },
    { value: "{{All Interviewers}}", label: "All Interviewers" },
    { value: "{{All Competencies}}", label: "All Competencies" },
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
    const [options, setOptions] = useState<{ value: string; label: string }[]>(
        [],
    );
    const [customMessageBody, setCustomMessageBody] = useState(
        "Hi Team 👋 \n\nWelcome to the {{role_name}} Hiring Channel! This will be our hub for communication and collaboration. Let's kick things off with a few key resources and tasks.",
    );

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
        onRecipientsChange(selectedOptions);
    };

    const addButton = () => {
        const newButtons = [
            ...buttons,
            { label: "Button", action: "", type: ButtonType.UpdateButton },
        ];
        handleButtonsChange(newButtons);
    };

    const updateButton = (
        index: number,
        key: keyof ButtonAction,
        value: string | never,
    ) => {
        const newButtons = [...buttons];
        newButtons[index][key] = value as string;
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
                const [channelsData, usersData, greenhouseData] =
                    await Promise.all([
                        getChannels(),
                        getActiveUsers(),
                        getMockGreenhouseData(),
                    ]);

                const combinedOptions = [
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
                ];
                setOptions(combinedOptions);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
            setIsLoading(false);
        };

        fetchData();
    }, []);

    const handleCustomMessageBodyChange = (value: string) => {
        setCustomMessageBody(value);
        onCustomMessageBodyChange(value);
    };

    const handleVariableSelect = (variable: string) => {
        setCustomMessageBody((prev) => prev + variable);
        onCustomMessageBodyChange(customMessageBody + variable);
    };

    const getButtonStyle = (button: ButtonAction) => {
        switch (button.type) {
            case ButtonType.AcknowledgeButton:
            case ButtonType.LinkButton:
                return "bg-white text-black border border-gray-300";
            case ButtonType.UpdateButton:
                return button.updateType === UpdateActionType.MoveToNextStage
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white";
            default:
                return "bg-gray-200 text-black border border-gray-300";
        }
    };

    return (
        <div className="space-y-2">
            {/* Custom Message Body Input - Slack Message Style */}
            <div className="shadow-sm ">
                <div className="mt-4">
                    {/* Slack Message Simulation */}
                    <div className="rounded-lg border bg-white pb-6 shadow-sm">
                        <div className="flex items-center justify-between rounded-t-lg bg-fuchsia-950 p-3">
                            <div className="flex items-center space-x-2">
                                <Image
                                    src={slackLogo}
                                    alt="Slack Logo"
                                    className="h-6 w-6"
                                />
                                <span className="text-sm font-semibold text-white">
                                    Hiring Room
                                </span>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-start">
                                <Image
                                    src={sintaLogo}
                                    alt="User Avatar"
                                    className="h-10 w-10 rounded"
                                />
                                <div className="ml-4 flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="ml-2 flex-1">
                                            <div className="flex items-center font-semibold text-gray-700">
                                                Sinta
                                                <span className="ml-1 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-500">
                                                    APP
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                3:53 PM
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-gray-700">
                                        {customMessageBody}
                                    </div>
                                    <div className=" flex space-x-2 pt-6">
                                        {buttons.map((button, index) => (
                                            <Button
                                                key={index}
                                                className={getButtonStyle(
                                                    button,
                                                )}
                                                onClick={() =>
                                                    removeButton(index)
                                                }
                                            >
                                                {button.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Action Buttons */}
                    </div>

                    {/* Quill Editor */}
                    <div className="mt-4">
                        <ReactQuill
                            value={customMessageBody}
                            onChange={handleCustomMessageBodyChange}
                            modules={{
                                toolbar: [
                                    ["bold", "italic", "underline"],
                                    [{ link: "link" }],
                                ],
                            }}
                            formats={["bold", "italic", "underline", "link"]}
                            className="text-md w-full rounded-lg border bg-white"
                        />
                    </div>
                </div>
            </div>

            {/* Variable Insertion */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="mt-2">
                        Insert Variable
                    </Button>
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
                    <DropdownMenuGroup>
                        {specialVariableOptions.map((option) => (
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
            {/* Button Management */}
            <div className="my-4">
                <MessageButtons
                    buttons={buttons}
                    addButton={addButton}
                    updateButton={updateButton}
                    removeButton={removeButton}
                />
            </div>

            {/* Multi-Select for Recipients */}
            <div className="my-4">
                <Label>Select Recipients</Label>
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
