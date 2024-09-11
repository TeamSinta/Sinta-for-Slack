// @ts-nocheck

"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { FancyMultiSelect } from "@/components/ui/fancy-multi-select";
import { FancyBox } from "@/components/ui/fancy.box";
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
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { HelpCircleIcon } from "lucide-react";
import ReactQuill from "react-quill";
import 'quill/dist/quill.snow.css';


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

const variableOptions: Option[] = [
    { value: "{{Interviewer}}", label: "Interviewer", source: "greenhouse" },
    { value: "{{Role title}}", label: "Role Title", source: "greenhouse" },
    { value: "{{Job Stage}}", label: "Job Stage", source: "greenhouse" },
    { value: "{{Recruiter}}", label: "Recruiter", source: "greenhouse" },
    {
        value: "{{Candidate_Name}}",
        label: "Candidate Name",
        source: "greenhouse",
    },
];

const specialVariableOptions: Option[] = [
    {
        value: "{{All Job Stages}}",
        label: "All Job Stages",
        source: "greenhouse",
    },
    {
        value: "{{All Interviewers}}",
        label: "All Interviewers",
        source: "greenhouse",
    },
    {
        value: "{{All Competencies}}",
        label: "All Competencies",
        source: "greenhouse",
    },
    {
        value: "{{All}}",
        label: "All (Job Stages, Interviewers, Competencies)",
        source: "greenhouse",
    },
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
    const [showQuillEditor, setShowQuillEditor] = useState(false);
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
        newButtons
            ? ([index][key] = value as string)
            : handleButtonsChange(newButtons);
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

    const handleCustomMessageBodyChange = (value: string) => {
        setCustomMessageBody(value);
        onCustomMessageBodyChange(value);
    };

    const handleVariableSelect = (variable: string) => {
        const value = customMessageBody + variable;
        setCustomMessageBody(value);
        onCustomMessageBodyChange(value);
    };

    const getButtonStyle = (button: ButtonAction) => {
        switch (button.type) {
            case ButtonType.AcknowledgeButton:
            case ButtonType.LinkButton:
                return "bg-white text-black border border-gray-300";
            case ButtonType.UpdateButton:
                switch (button.updateType) {
                    case UpdateActionType.MoveToNextStage:
                        return "bg-green-600 text-white";
                    case UpdateActionType.RejectCandidate:
                        return "bg-red-600 text-white";
                    default:
                        return "bg-white-200 text-black border border-gray-300";
                }
            default:
                return "bg-gray-200 text-black border border-gray-300";
        }
    };

    return (
        <div className="hiringroom-container mt-4">
            <div className="flex items-center">
                <Label className="text-xl font-bold">
                    Configure Slack Recipients{" "}
                </Label>
                <Image
                    src={slackLogo}
                    alt="slack-logo"
                    className="ml-2 h-7 w-7"
                />{" "}
            </div>
            <p className="mt-2 text-sm text-gray-500">
                Select the type of alert for this hiring room.
            </p>

            {/* Checkbox to Add Custom Message Body */}
            <div className="my-4">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="customMessageBody"
                        checked={showQuillEditor}
                        onCheckedChange={() =>
                            setShowQuillEditor(!showQuillEditor)
                        }
                    />
                    <label
                        htmlFor="customMessageBody"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Select to customize opening message
                    </label>
                </div>
            </div>

            {/* Custom Message Body Input */}
            {showQuillEditor && (
                <>
                    <div className="mt-4 rounded-lg border border-gray-300 bg-white pb-6 shadow-sm">
                        {/* Top Bar */}
                        <div className="flex items-center justify-between rounded-t-lg bg-fuchsia-950 px-3 py-1 text-white">
                            <div className="flex space-x-2">
                                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="text-sm">
                                <HelpCircleIcon />{" "}
                            </div>
                        </div>
                        <div className="mb-2 mt-2 flex items-start px-4">
                            <Image
                                src={sintaLogo} // Replace this with the user profile image URL
                                alt="user-profile"
                                className="h-10 w-10 rounded"
                            />
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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="mb-3 ml-4 mt-2"
                                    >
                                        Insert Variable
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuGroup>
                                        {variableOptions.map((option) => (
                                            <DropdownMenuItem
                                                key={option.value}
                                                onClick={() =>
                                                    handleVariableSelect(
                                                        option.value,
                                                    )
                                                }
                                            >
                                                {option.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>
                                    <DropdownMenuLabel className="mt-2 text-xs font-semibold text-gray-500">
                                        Special Variables
                                    </DropdownMenuLabel>
                                    <DropdownMenuGroup>
                                        {specialVariableOptions.map(
                                            (option) => (
                                                <DropdownMenuItem
                                                    key={option.value}
                                                    onClick={() =>
                                                        handleVariableSelect(
                                                            option.value,
                                                        )
                                                    }
                                                >
                                                    {option.label}
                                                </DropdownMenuItem>
                                            ),
                                        )}
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="ml-12 px-4">
                            <div className="resize-y overflow-auto rounded-lg border border-gray-300 bg-white p-2 shadow-sm focus:outline-none">
                                <ReactQuill
                                    value={customMessageBody}
                                    onChange={handleCustomMessageBodyChange}
                                    modules={{
                                        toolbar: [
                                            ["bold", "italic", "underline"],
                                            [{ link: "link" }],
                                        ],
                                    }}
                                    formats={[
                                        "bold",
                                        "italic",
                                        "underline",
                                        "link",
                                    ]}
                                    className="text-md min-h-32 w-full bg-white"
                                    style={{ height: "auto" }}
                                />
                            </div>
                        </div>

                        {selectedFields.length > 0 && (
                            <hr className="mx-16 my-4" />
                        )}

                        <div className="ml-12 mt-2 px-4">
                            {selectedFields.map((field) => (
                                <div
                                    key={field}
                                    className="mb-2 flex items-center"
                                >
                                    <span className="text-sm font-medium text-gray-700">
                                        {
                                            fields.find(
                                                (f) => f.value === field,
                                            )?.label
                                        }
                                        :
                                    </span>
                                    <span className="ml-2 text-sm text-gray-500">
                                        {"{{" + field + "}}"}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {buttons.length > 0 && <hr className="mx-16 my-4" />}

                        {buttons.length > 0 && (
                            <div className="ml-12 mt-2 flex flex-wrap gap-2 px-4">
                                {buttons.map((button, index) => (
                                    <button
                                        key={index}
                                        className={`rounded-sm px-3 py-1 text-sm ${getButtonStyle(
                                            button,
                                        )}`}
                                        type="button"
                                    >
                                        {button.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="my-4">
                        <Label>Select Message Fields</Label>
                        <FancyBox
                            selectedOptions={selectedFields}
                            onOptionChange={handleFieldsSelect}
                            fields={fields}
                        />
                    </div>

                    <MessageButtons
                        buttons={buttons}
                        addButton={addButton}
                        updateButton={updateButton}
                        removeButton={removeButton}
                    />
                </>
            )}

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
