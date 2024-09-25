'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Pencil } from "lucide-react";
import slackLogo from "../../../../../../../public/slack-logo.png";
import sintaLogo from "../../../../../../../public/sintalogo.png";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import MessageButtons, { type ButtonAction, ButtonType, UpdateActionType } from "../../_components/message-buttons";

const SlackMessageBox: React.FC<{
    customMessageBody: string;
    onCustomMessageBodyChange: (message: string) => void;
    buttons: ButtonAction[];
    onButtonsChange: (buttons: ButtonAction[]) => void;
}> = ({ customMessageBody, onCustomMessageBodyChange, buttons, onButtonsChange }) => {
    const [isEditing, setIsEditing] = useState(false); // Toggle for editing state
    const [messageContent, setMessageContent] = useState(customMessageBody);
    const [messageButtons, setMessageButtons] = useState<ButtonAction[]>(buttons || []); // Initialize as an empty array if buttons are undefined

    useEffect(() => {
        setMessageContent(customMessageBody);
        setMessageButtons(buttons || []); // Ensure messageButtons is an array
    }, [customMessageBody, buttons]);


    // Handle saving after editing
    const handleSave = () => {
        onCustomMessageBodyChange(messageContent);
        onButtonsChange(messageButtons);
        setIsEditing(false); // Exit edit mode
    };

    const handleVariableSelect = (variable: string) => {
        setMessageContent((prev) => prev + variable);
    };

    const handleDoubleClick = () => {
        setIsEditing(true); // Trigger edit mode on double-click
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

    const addButton = () => {
        const newButtons = [
            ...messageButtons,
            { label: "New Button", action: "", type: ButtonType.UpdateButton },
        ];
        handleButtonsChange(newButtons);
    };

    const updateButton = (index: number, key: keyof ButtonAction, value: string) => {
        const newButtons = [...messageButtons];
        newButtons[index][key] = value;
        handleButtonsChange(newButtons);
    };

    const removeButton = (index: number) => {
        const newButtons = messageButtons.filter((_, i) => i !== index);
        handleButtonsChange(newButtons);
    };

    return (
        <div className="shadow-sm mt-4" onDoubleClick={handleDoubleClick}>
            <div className="rounded-lg border bg-white shadow-sm">
                <div className="flex items-center justify-between bg-fuchsia-950 p-3 rounded-t-lg">
                    <div className="flex items-center space-x-2">
                        <Image src={slackLogo} alt="Slack Logo" className="h-6 w-6" />
                        <span className="text-sm font-semibold text-white">Hiring Room</span>
                    </div>
                    {/* Pencil Icon for Edit */}
                    <div className="cursor-pointer" onClick={() => setIsEditing(true)}>
                        <Pencil size={20} className="text-white" />
                    </div>
                </div>

                <div className="p-4">
                    <div className="flex items-start">
                        <Image src={sintaLogo} alt="User Avatar" className="h-10 w-10 rounded" />
                        <div className="ml-4 flex-1">
                            <div className="flex items-center font-semibold text-gray-700">
                                Sinta
                                <span className="ml-1 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-500">
                                    APP
                                </span>
                            </div>
                            <div className="text-xs text-gray-500">3:53 PM</div>

                            {/* Display Slack Message or Editor */}
                            {!isEditing ? (
                                <div className="mt-2 text-gray-700">
                                    <p>{messageContent}</p>
                                </div>
                            ) : (
                                <div className="mt-2">
                                    <ReactQuill
                                        value={messageContent}
                                        onChange={setMessageContent}
                                        modules={{
                                            toolbar: [["bold", "italic", "underline"], [{ link: "link" }]],
                                        }}
                                        formats={["bold", "italic", "underline", "link"]}
                                        className="text-md w-full bg-white rounded-lg border"
                                    />
                                    <div className="flex space-x-2 mt-4">
                                        <Button variant="outline" onClick={handleSave}>
                                            Save
                                        </Button>
                                        <Button variant="secondary" onClick={() => setIsEditing(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Display Action Buttons */}
                    <div className="mt-4 flex space-x-2">
                        {messageButtons.map((button, index) => (
                            <Button key={index} className={getButtonStyle(button)}>
                                {button.label}
                            </Button>
                        ))}
                    </div>

                    {/* Edit Buttons during Edit Mode */}
                    {isEditing && (
                        <div className="mt-4">
                            <MessageButtons
                                buttons={messageButtons}
                                addButton={addButton}
                                updateButton={updateButton}
                                removeButton={removeButton}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Variable Insertion */}
            {isEditing && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="mt-2">Insert Variable</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => handleVariableSelect("{{Interviewer}}")}>
                                Interviewer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleVariableSelect("{{Role title}}")}>
                                Role Title
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
};

export default SlackMessageBox;
