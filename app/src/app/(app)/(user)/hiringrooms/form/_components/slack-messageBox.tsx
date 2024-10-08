import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Pencil, Check, X } from "lucide-react";
import slackLogo from "../../../../../../../public/slack-logo.png";
import sintaLogo from "../../../../../../../public/sintalogo.png";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import MessageButtons, {
    ButtonAction,
    ButtonType,
    UpdateActionType,
} from "../../_components/message-buttons";
import parse from "html-react-parser";

// Define variable options
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

const SlackMessageBox: React.FC<{
    customMessageBody: string;
    buttons: ButtonAction[];
    onSave: (message: string, buttons: ButtonAction[]) => void;
}> = ({ customMessageBody, buttons, onSave }) => {
    const [isEditing, setIsEditing] = useState(false); // Toggle for editing state
    const [messageContent, setMessageContent] = useState(customMessageBody);
    const [messageButtons, setMessageButtons] = useState<ButtonAction[]>(
        buttons || [],
    );
    const quillRef = useRef<ReactQuill>(null); // Reference for ReactQuill

    useEffect(() => {
        setMessageContent(customMessageBody);
        setMessageButtons(buttons || []); // Ensure messageButtons is an array
    }, [customMessageBody, buttons]);

    const handleSave = () => {
        onSave(messageContent, messageButtons);
        setIsEditing(false); // Exit edit mode
    };

    // Insert variable at cursor position
    const insertVariableAtCursor = (variable: string) => {
        const editor = quillRef.current?.getEditor(); // Get the editor instance
        const cursorPosition = editor?.getSelection()?.index ?? 0; // Get cursor position
        editor?.insertText(cursorPosition, ` ${variable} `); // Insert variable at the cursor position
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

    const handleButtonsChange = (newButtons: ButtonAction[]) => {
        setMessageButtons(newButtons);
    };

    // Function to replace custom variables like {{Interviewer}} with blue badges
    const replaceCustomVariables = (htmlContent: string) => {
        const customVariablePattern = /{{(.*?)}}/g;
        return htmlContent.replace(customVariablePattern, (match, variable) => {
            return `<span class="inline-block mx-1 rounded border border-blue-400 bg-blue-50 px-2 py-1 text-sm font-semibold text-blue-500">${variable}</span>`;
        });
    };

    // Convert markdown and custom variables into displayable content
    const displayContent = parse(replaceCustomVariables(messageContent));

    return (
        <div className=" mt-4">
            <div className="rounded-md border bg-white shadow-sm">
                <div className="flex items-center justify-between rounded-t-md bg-fuchsia-950 p-3">
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
                    {/* Edit mode toggle: pencil or Save/Cancel */}
                    <div className="flex space-x-2">
                        {!isEditing ? (
                            <Pencil
                                size={20}
                                className="cursor-pointer text-white"
                                onClick={() => setIsEditing(true)}
                            />
                        ) : (
                            <>
                                <Check
                                    size={20}
                                    className="cursor-pointer text-white"
                                    onClick={handleSave}
                                />
                                <X
                                    size={20}
                                    className="cursor-pointer text-white"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setMessageContent(customMessageBody);
                                        setMessageButtons(buttons || []);
                                    }}
                                />
                            </>
                        )}
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
                                <div className="flex items-center font-semibold text-gray-700">
                                    Sinta
                                    <span className="ml-1 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-500">
                                        APP
                                    </span>
                                </div>

                                {/* Insert Variable dropdown */}
                                {isEditing && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline">
                                                Insert Variable
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56">
                                            <DropdownMenuGroup>
                                                {variableOptions.map(
                                                    (variable) => (
                                                        <DropdownMenuItem
                                                            key={variable.value}
                                                            onClick={() =>
                                                                insertVariableAtCursor(
                                                                    variable.value,
                                                                )
                                                            }
                                                        >
                                                            {variable.label}
                                                        </DropdownMenuItem>
                                                    ),
                                                )}
                                            </DropdownMenuGroup>
                                            <DropdownMenuGroup>
                                                <div className="mt-2 text-xs text-gray-500">
                                                    Special Variables
                                                </div>
                                                {specialVariableOptions.map(
                                                    (variable) => (
                                                        <DropdownMenuItem
                                                            key={variable.value}
                                                            onClick={() =>
                                                                insertVariableAtCursor(
                                                                    variable.value,
                                                                )
                                                            }
                                                        >
                                                            {variable.label}
                                                        </DropdownMenuItem>
                                                    ),
                                                )}
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                            <div className="text-xs text-gray-500">3:53 PM</div>

                            {!isEditing ? (
                                <div className="mt-2 text-sm text-gray-700">
                                    {displayContent}
                                    {/* Render buttons in final display */}
                                    <div className="mb-2 mt-6 flex space-x-2">
                                        {messageButtons.map((button, index) => (
                                            <Button
                                                key={index}
                                                className={getButtonStyle(
                                                    button,
                                                )}
                                            >
                                                {button.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-2">
                                    <ReactQuill
                                        ref={quillRef}
                                        value={messageContent}
                                        onChange={setMessageContent}
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
                                        className="text-md w-full rounded-lg border bg-white"
                                    />
                                    <div className="mt-4 flex space-x-2">
                                        {messageButtons.map((button, index) => (
                                            <Button
                                                key={index}
                                                className={getButtonStyle(
                                                    button,
                                                )}
                                            >
                                                {button.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="mt-4">
                            <MessageButtons
                                buttons={messageButtons}
                                addButton={() =>
                                    handleButtonsChange([
                                        ...messageButtons,
                                        {
                                            label: "New Button",
                                            action: "",
                                            type: ButtonType.UpdateButton,
                                        },
                                    ])
                                }
                                updateButton={(
                                    index: number,
                                    key: keyof ButtonAction,
                                    value: string,
                                ) => {
                                    const newButtons = [...messageButtons];
                                    if (newButtons[index]) {
                                        newButtons[index][key] = value as never;
                                        handleButtonsChange(newButtons);
                                    }
                                }}
                                removeButton={(index: number) =>
                                    handleButtonsChange(
                                        messageButtons.filter(
                                            (_, i) => i !== index,
                                        ),
                                    )
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SlackMessageBox;
