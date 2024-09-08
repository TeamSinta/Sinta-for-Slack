// @ts-nocheck

"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { FancyMultiSelect } from "@/components/ui/fancy-multi-select";
import { FancyBox } from "@/components/ui/fancy.box";
import { getActiveUsers, getChannels } from "@/server/slack/core";
import { getMockGreenhouseData } from "@/server/greenhouse/core";
import slacklogo from "../../../../../../../public/slack-logo.png";
import sintalogo from "../../../../../../../public/sintalogo.png";
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
import {
    HelpCircleIcon,
    CheckCircle,
    AlertTriangle,
    Clock,
    Loader2Icon,
} from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import MessageButtons, {
    type ButtonAction,
    ButtonType,
    UpdateActionType,
} from "../../../hiringrooms/_components/message-buttons";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { LinkActionType } from "../../_components/message-buttons";
import { convertHtmlToSlackMrkdwn } from "@/lib/utils";
const localStorageKey = "workflowActions";

const saveActionData = (data) => {
    const storedData = JSON.parse(localStorage.getItem(localStorageKey)) || {};
    const updatedData = { ...storedData, ...data };
    localStorage.setItem(localStorageKey, JSON.stringify(updatedData));
};

const getActionData = () => {
    return JSON.parse(localStorage.getItem(localStorageKey)) || {};
};

const fields = [
    { value: "name", label: "Candidate Name", color: "" },
    { value: "title", label: "Job Title", color: "" },
    { value: "company", label: "Company", color: "" },
    { value: "email", label: "Email Address", color: "" },
    { value: "phone", label: "Phone Number", color: "" },
    { value: "social_media", label: "Social Media", color: "" },
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

const specialVariableOptions = [
    { value: "{{All Job Stages}}", label: "All Job Stages" },
    { value: "{{All Interviewers}}", label: "All Interviewers" },
    { value: "{{All Competencies}}", label: "All Competencies" },
    { value: "{{All}}", label: "All (Job Stages, Interviewers, Competencies)" },
];

type Option = {
    value: string;
    label: string;
    source: "slack" | "greenhouse";
};

const Actions: React.FC<{ onSaveActions: (data: any) => void }> = ({
    onSaveActions,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [testButtonLoading, setTestButtonLoading] = useState(false);
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [buttons, setButtons] = useState<ButtonAction[]>([]);
    const [selectedRecipients, setSelectedRecipients] = useState<Option[]>([]);
    const [options, setOptions] = useState<{ value: string; label: string }[]>(
        [],
    );
    const [customMessageBody, setCustomMessageBody] = useState(
        "Hi Team 👋 \n\nWelcome to the {{role_name}} Hiring Channel! This will be our hub for communication and collaboration. Let's kick things off with a few key resources and tasks.",
    );
    const [isSaveEnabled, setIsSaveEnabled] = useState(false);
    const [activeTab, setActiveTab] = useState("message");

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

    useEffect(() => {
        const allFieldsFilled =
            customMessageBody && selectedRecipients.length > 0;
        setIsSaveEnabled(allFieldsFilled);
    }, [customMessageBody, selectedRecipients]);

    const handleCustomMessageBodyChange = (value: string) => {
        console.log(value);
        setCustomMessageBody(value);
    };

    const handleVariableSelect = (variable: string) => {
        const value = customMessageBody + variable;
        setCustomMessageBody(value);
    };

    const handleRecipientsChange = (selectedOptions: Option[]) => {
        setSelectedRecipients(selectedOptions);
    };

    const handleFieldsSelect = (selectedOptions: string[]) => {
        setSelectedFields(selectedOptions);
    };

    const handleContinue = () => {
        if (activeTab === "message") {
            setActiveTab("test");
        } else if (activeTab === "test") {
            handleSave();
        }
    };

    const handleSave = () => {
        if (isSaveEnabled) {
            const actionData = {
                recipients: selectedRecipients,
                openingText: "Custom Opening Text", // Replace with actual field if needed
                messageFields: selectedFields,
                messageButtons: buttons,
                messageDelivery: "Group DM", // Replace with actual field if needed
                customMessageBody,
            };

            // Save to local storage
            saveActionData(actionData);

            onSaveActions(actionData); // Call the original save handler
        }
    };

    const handleTestConfiguration = async () => {
        setTestButtonLoading(true);

        const payload = {
            attachments: [
                {
                    color: "#384ab4",
                    blocks: [
                        {
                            type: "section",
                            block_id: "ig1EJ",
                            text: {
                                type: "mrkdwn",
                                text: convertHtmlToSlackMrkdwn(
                                    customMessageBody,
                                ),
                            },
                        },

                        ...(selectedFields.length > 0
                            ? [
                                  {
                                      type: "divider",
                                      block_id: "TYZqO",
                                  },
                              ]
                            : []),
                        ...selectedFields.map((field, index) => {
                            return {
                                type: "section",
                                text: {
                                    type: "mrkdwn",
                                    text: `{{${fields.find((f) => f.value === field)?.label}}}`,
                                    verbatim: false,
                                },
                            };
                        }),
                        ...(buttons.length > 0
                            ? [
                                  {
                                      type: "actions",
                                      block_id: "block_id_5673600008",
                                      elements: buttons.map((item, index) => {
                                          return {
                                              type: "button",
                                              ...(item.type ===
                                                  ButtonType.UpdateButton &&
                                                  item.updateType && {
                                                      action_id:
                                                          item.updateType,
                                                      style:
                                                          item.updateType ===
                                                          UpdateActionType.MoveToNextStage
                                                              ? "primary"
                                                              : "danger",
                                                  }),
                                              text: {
                                                  type: "plain_text",
                                                  text: item.label,
                                                  emoji: true,
                                              },
                                              ...(item.type ===
                                                  ButtonType.LinkButton &&
                                                  item.linkType ===
                                                      LinkActionType.Dynamic && {
                                                      action_id: item.action,
                                                  }),
                                              ...(item.type ===
                                                  ButtonType.LinkButton &&
                                                  item.linkType ===
                                                      LinkActionType.Static && {
                                                      url: item.action,
                                                  }),
                                          };
                                      }),

                                      // other: [
                                      //     {
                                      //         type: "button",
                                      //         action_id: "2R1vH",
                                      //         text: {
                                      //             type: "plain_text",
                                      //             text: "Candidate Profile",
                                      //             emoji: true,
                                      //         },
                                      //         value: "LinkButton_5673600008",
                                      //         url: "https://app8.greenhouse.io/people/5673600008",
                                      //     },
                                      //     {
                                      //         type: "button",
                                      //         action_id: "move_to_next_stage_5673600008",
                                      //         text: {
                                      //             type: "plain_text",
                                      //             text: "Move to Next Stage",
                                      //             emoji: true,
                                      //         },
                                      //         style: "primary",
                                      //         value: "MoveToNextStage_5673600008",
                                      //     },
                                      //     {
                                      //         type: "button",
                                      //         action_id: "reject_candidate_5673600008",
                                      //         text: {
                                      //             type: "plain_text",
                                      //             text: "Reject Candidate",
                                      //             emoji: true,
                                      //         },
                                      //         style: "danger",
                                      //         value: "RejectCandidate_5673600008",
                                      //     },
                                      // ],
                                  },
                              ]
                            : []),
                    ],
                },
            ],
        };

        try {
            // Send the message to the endpoint (to forward to Slack API because of CORS)
            const response = await fetch("/api/slack/test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    // The URL should be handled programatically: https://api.slack.com/messaging/webhooks#incoming_webhooks_programmatic
                    url: "https://hooks.slack.com/services/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",
                    body: payload,
                }),
            });

            if (response.ok) {
                // Handle successful response
                console.log("Test message sent successfully.");
            } else {
                // Handle errors
                console.error("Failed to send test message.");
            }
        } catch (error) {
            console.error("Error occurred while sending test message:", error);
        } finally {
            setTestButtonLoading(false);
        }
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

    const getTabIcon = (tab: string) => {
        const iconSize = 16;

        if (tab === "message") {
            return customMessageBody ? (
                <CheckCircle className="text-green-500" size={iconSize} />
            ) : (
                <AlertTriangle className="text-gray-500" size={iconSize} />
            );
        }
        if (tab === "test") {
            if (!customMessageBody)
                return <Clock className="text-gray-300" size={iconSize} />;
            return selectedRecipients.length > 0 ? (
                <CheckCircle className="text-green-500" size={iconSize} />
            ) : (
                <AlertTriangle className="text-gray-500" size={iconSize} />
            );
        }
    };

    return (
        <div className="actions-sidebar flex h-full flex-col justify-between p-2">
            <div>
                <div className="mb-4 flex items-center">
                    <Image
                        src={slacklogo}
                        alt="slack-logo"
                        className="ml-2 h-7 w-7"
                    />
                    <Label className="ml-2 text-xl font-bold">Action</Label>
                </div>
                <p className="mb-4 text-sm text-gray-500">
                    Configure this Slack alert to notify relevant team members
                    and manage communication efficiently.
                </p>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full pt-3"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger
                            value="message"
                            className="flex items-center space-x-2"
                        >
                            <span>Message</span>
                            {getTabIcon("message")}
                        </TabsTrigger>
                        <TabsTrigger
                            value="test"
                            disabled={!customMessageBody}
                            className="flex items-center space-x-2"
                        >
                            <span>Test & Recipients</span>
                            {getTabIcon("test")}
                        </TabsTrigger>
                    </TabsList>

                    {/* Message Tab */}
                    <TabsContent value="message" className="mt-4 py-1">
                        <div className="mt-4 rounded-lg border border-gray-300 bg-white pb-6 shadow-sm">
                            {/* Top Bar */}
                            <div className="flex items-center justify-between rounded-t-lg bg-fuchsia-950 px-3 py-1 text-white">
                                <div className="flex space-x-2">
                                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="text-sm">
                                    <HelpCircleIcon />
                                </div>
                            </div>
                            <div className="mb-2 mt-2 flex items-start px-4">
                                <Image
                                    src={sintalogo}
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

                            {buttons.length > 0 && (
                                <hr className="mx-16 my-4" />
                            )}

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
                            addButton={() =>
                                setButtons([
                                    ...buttons,
                                    {
                                        label: "Button",
                                        action: "",
                                        type: ButtonType.UpdateButton,
                                    },
                                ])
                            }
                            updateButton={(index, key, value) =>
                                setButtons((prevButtons) => {
                                    const newButtons = [...prevButtons];
                                    newButtons[index][key] = value;
                                    return newButtons;
                                })
                            }
                            removeButton={(index) =>
                                setButtons((prevButtons) =>
                                    prevButtons.filter((_, i) => i !== index),
                                )
                            }
                        />
                    </TabsContent>

                    {/* Test & Recipients Tab */}
                    <TabsContent value="test" className="mt-4 py-1">
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle>Select Recipients</CardTitle>
                                <CardDescription>
                                    Choose the recipients for your Slack alert.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FancyMultiSelect
                                    selectedOptions={selectedRecipients}
                                    onOptionChange={handleRecipientsChange}
                                    options={options}
                                    loading={isLoading}
                                />
                            </CardContent>
                        </Card>

                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle>Test Configuration</CardTitle>
                                <CardDescription>
                                    Use this section to test your message and
                                    ensure it reaches the right people.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    variant="outline"
                                    className="mt-4 rounded border-green-600 text-green-600 hover:bg-green-100 hover:text-green-600"
                                    onClick={handleTestConfiguration}
                                    disabled={testButtonLoading}
                                >
                                    {testButtonLoading ? (
                                        <>
                                            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                            Testing...
                                        </>
                                    ) : (
                                        "Run Test"
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            <div>
                <Separator />
                <div className="p-6">
                    <Button
                        disabled={!isSaveEnabled}
                        onClick={handleContinue}
                        className="w-full bg-blue-600 text-white"
                    >
                        {activeTab === "test" ? "Save" : "Continue"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Actions;
