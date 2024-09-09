import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export enum ButtonType {
    UpdateButton = "UpdateButton",
    LinkButton = "LinkButton",
    AcknowledgeButton = "AcknowledgeButton",
}

export enum UpdateActionType {
    MoveToNextStage = "MoveToNextStage",
    RejectCandidate = "RejectCandidate",
}

export enum LinkActionType {
    Static = "Static",
    Dynamic = "Dynamic",
}

export interface ButtonAction {
    label?: string;
    action?: string;
    type: ButtonType;
    updateType?: UpdateActionType;
    linkType?: LinkActionType;
}

interface MessageButtonsProps {
    buttons: ButtonAction[];
    addButton: () => void;
    updateButton: (
        index: number,
        key: keyof ButtonAction,
        value: string,
    ) => void;
    removeButton: (index: number) => void;
}

const MessageButtons: React.FC<MessageButtonsProps> = ({
    buttons,
    addButton,
    updateButton,
    removeButton,
}) => {
    return (
        <div className="my-4 flex flex-col">
            <Label className="text-md font-bold">Message Buttons</Label>
            {buttons.map((button, idx) => (
                <div key={idx} className="mt-4 flex flex-col gap-4">
                    {idx > 0 && <hr className="my-4" />}
                    <div className="flex items-center gap-2">
                        <div className="flex w-full flex-col">
                            <Label className="text-sm text-gray-600">
                                Button Type
                            </Label>
                            <Select
                                value={button.type}
                                onValueChange={(value) =>
                                    updateButton(
                                        idx,
                                        "type",
                                        value as ButtonType,
                                    )
                                }
                            >
                                <SelectTrigger className="mt-1 w-full border-gray-300">
                                    <SelectValue placeholder="Select Button Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem
                                            value={ButtonType.UpdateButton}
                                        >
                                            Update Button 📝
                                        </SelectItem>
                                        <SelectItem
                                            value={ButtonType.LinkButton}
                                        >
                                            Link Button 🔗
                                        </SelectItem>
                                        <SelectItem
                                            value={ButtonType.AcknowledgeButton}
                                        >
                                            Acknowledge Button ✅
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-full flex-col">
                            <Label className="text-sm text-gray-600">
                                Button Label
                            </Label>
                            <Input
                                className="mt-1"
                                value={button.label}
                                onChange={(e) =>
                                    updateButton(idx, "label", e.target.value)
                                }
                                placeholder="Button label"
                            />
                        </div>
                    </div>
                    {button.type === ButtonType.UpdateButton && (
                        <div className="flex w-full items-center gap-2">
                            <div className="flex w-full flex-col">
                                <Label className="text-sm text-gray-600">
                                    Update Action
                                </Label>
                                <Select
                                    value={button.updateType ?? ""}
                                    onValueChange={(value) =>
                                        updateButton(
                                            idx,
                                            "updateType",
                                            value as UpdateActionType,
                                        )
                                    }
                                >
                                    <SelectTrigger className="mt-1 w-full border-gray-300">
                                        <SelectValue placeholder="Select Action" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem
                                                value={
                                                    UpdateActionType.MoveToNextStage
                                                }
                                            >
                                                Move to Next Stage
                                            </SelectItem>
                                            <SelectItem
                                                value={
                                                    UpdateActionType.RejectCandidate
                                                }
                                            >
                                                Reject Candidate
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    {button.type === ButtonType.LinkButton && (
                        <div className="flex w-full items-center gap-2">
                            <div className="flex w-full flex-col">
                                <Label className="text-sm text-gray-600">
                                    Link Type
                                </Label>
                                <Select
                                    value={button.linkType ?? ""}
                                    onValueChange={(value) =>
                                        updateButton(
                                            idx,
                                            "linkType",
                                            value as LinkActionType,
                                        )
                                    }
                                >
                                    <SelectTrigger className="mt-1 w-full border-gray-300">
                                        <SelectValue placeholder="Select Link Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem
                                                value={LinkActionType.Static}
                                            >
                                                Static
                                            </SelectItem>
                                            <SelectItem
                                                value={LinkActionType.Dynamic}
                                            >
                                                Dynamic
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            {button.linkType === LinkActionType.Static && (
                                <div className="flex w-full flex-col">
                                    <Label className="text-sm text-gray-600">
                                        Action URL
                                    </Label>
                                    <Input
                                        className="mt-1"
                                        value={button.action}
                                        onChange={(e) =>
                                            updateButton(
                                                idx,
                                                "action",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Action URL"
                                    />
                                </div>
                            )}
                            {button.linkType === LinkActionType.Dynamic && (
                                <div className="flex w-full flex-col">
                                    <Label className="text-sm text-gray-600">
                                        Link Target
                                    </Label>
                                    <Select
                                        value={button.action}
                                        onValueChange={(value) =>
                                            updateButton(idx, "action", value)
                                        }
                                    >
                                        <SelectTrigger className="mt-1 w-full border-gray-300">
                                            <SelectValue placeholder="Select Link Target" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="candidateRecord">
                                                    Candidate Profile
                                                </SelectItem>
                                                <SelectItem value="jobRecord">
                                                    Job
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex items-end justify-end">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeButton(idx)}
                            type="button"
                        >
                            Remove
                        </Button>
                    </div>
                </div>
            ))}
            <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={addButton}
                className="my-4"
            >
                + Add button
            </Button>
        </div>
    );
};

export default MessageButtons;
