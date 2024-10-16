"use client";

import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FancyMultiSelect } from "@/components/ui/fancy-multi-select";
import { Plus, Trash, Trash2Icon } from "lucide-react";
import { getActiveUsers, getChannels } from "@/server/slack/core";
import { getMockGreenhouseData } from "@/server/greenhouse/core";
import SlackChannelNameFormat from "../../_components/SlackChannelNameFormat";
import ConditionsCard from "./ConditionsCard";
import { CONDITIONS_ATTRIBUTES_LOOKUP } from "@/utils/conditions-options";
import { Condition } from "../../../workflows/_components/columns";

// Define action options for dropdown
const actionsOptions = [
    { value: "add_recipients", label: "Add Additional Recipients" },
    { value: "remove_recipients", label: "Remove Recipients" },
    { value: "rename_channel", label: "Rename Channel" },
    { value: "auto_archive", label: "Auto-Archive Channel" },
];

interface TriggerActionsComponentProps {
    initialActions?: any[]; // Initial data to pre-fill actions
    onSaveAutomatedActions: (actionsData: any[]) => void;
}

const TriggerActionsComponent: React.FC<TriggerActionsComponentProps> = ({
    initialActions = [], // Default to empty array if no initial data is provided
    onSaveAutomatedActions,
}) => {
    // Pre-fill state for selected action, condition, and recipients based on initialActions
    const [selectedAction, setSelectedAction] = useState<string>(
        initialActions[0]?.actionType || "", // Prefill action type if available
    );
    const [selectedRecipients, setSelectedRecipients] = useState<
        { label: string; value: string; source: string }[]
    >(
        initialActions[0]?.modifications?.recipients || [], // Prefill recipients if available
    );
    const [options, setOptions] = useState<
        { value: string; label: string; source: string }[]
    >([]);
    const [isLoading, setIsLoading] = useState(false);
    const [format, setFormat] = useState(
        "intw-{{CANDIDATE_NAME}}-{{CANDIDATE_CREATION_MONTH_TEXT_ABBREVIATED}}-{{CANDIDATE_CREATION_DAY_NUMBER}}",
    );
    const [condition, setCondition] = useState<Condition>({
        id: initialActions[0]?.condition?.id || 0,
        field: initialActions[0]?.condition?.field || "",
        condition: initialActions[0]?.condition?.condition || "",
        value: initialActions[0]?.condition?.value || "",
    });

    const [showAction, setShowAction] = useState(initialActions.length > 0); // Show action if initial data exists
    const [actionsData, setActionsData] = useState(initialActions); // Use initialActions if provided
    const [showDropdown, setShowDropdown] = useState(false); // Added missing state

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
                    ...usersData.map((user) => ({
                        label: user.label,
                        value: user.value,
                        source: "slack",
                    })),
                    {
                        label: "{ Interviewer }",
                        value: "{ Interviewer }",
                        source: "greenhouse",
                    },
                    {
                        label: greenhouseData.recruiter,
                        value: greenhouseData.recruiter,
                        source: "greenhouse",
                    },
                    {
                        label: greenhouseData.coordinator,
                        value: greenhouseData.coordinator,
                        source: "greenhouse",
                    },
                    {
                        label: greenhouseData.hiringTeam,
                        value: greenhouseData.hiringTeam,
                        source: "greenhouse",
                    },
                    {
                        label: greenhouseData.admin,
                        value: greenhouseData.admin,
                        source: "greenhouse",
                    },
                    {
                        label: greenhouseData.interviewer,
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

    const handleRecipientsChange = (
        updatedRecipients: { label: string; value: string; source: string }[],
    ) => {
        setSelectedRecipients(updatedRecipients);
    };

    const handleConditionChange = (field: keyof Condition, value: string) => {
        setCondition((prevCondition) => ({
            ...prevCondition,
            [field]: value,
        }));
    };

    const handleAddAction = () => {
        setShowDropdown(true);
        setShowAction(true); // Show the action card and hide Add Action button
    };

    const handleRemoveAction = () => {
        setShowAction(false);
        setSelectedAction("");
        setShowDropdown(false);
        setCondition({
            id: 0,
            field: "",
            condition: "",
            value: "",
        });
        setSelectedRecipients([]);
    };

    const handleSave = () => {
      const actionData = {
          actionType: selectedAction,
          condition,
          modifications: {
              recipients: selectedRecipients,
              newName: selectedAction === "rename_channel" ? format : undefined,
          },
      };

      // Check if an action with the same actionType already exists
      const existingActionIndex = actionsData.findIndex(
          (action) => action.actionType === selectedAction,
      );

      let updatedActions;
      if (existingActionIndex !== -1) {
          // Replace the existing action with the new one
          updatedActions = [...actionsData];
          updatedActions[existingActionIndex] = actionData;
      } else {
          // Add the new action if it's not already in the actionsData array
          updatedActions = [...actionsData, actionData];
      }

      setActionsData(updatedActions); // Update actionsData in the state
      onSaveAutomatedActions(updatedActions); // Pass the updated actions data to the parent component
  };

    const renderActionComponent = (action: string) => {
        switch (action) {
            case "add_recipients":
            case "remove_recipients":
                return (
                    <div key={action} className="mt-4 space-y-4">
                        <Label className="text-sm font-semibold">
                            {action === "add_recipients" ? "Add Recipients" : "Remove Recipients"}
                        </Label>
                        <FancyMultiSelect
                            selectedOptions={selectedRecipients}
                            onOptionChange={handleRecipientsChange}
                            options={options}
                            loading={isLoading}
                        />
                        <ConditionsCard
                            condition={condition}
                            onRemove={() => handleRemoveAction()}
                            fields={CONDITIONS_ATTRIBUTES_LOOKUP["candidates"]}
                            onFieldSelect={(field) => handleConditionChange("field", field)}
                            onConditionSelect={(value) => handleConditionChange("condition", value)}
                            onValueChange={(value) => handleConditionChange("value", value)}
                            editable={true}
                            objectFieldType="candidates"
                        />
                    </div>
                );
            case "rename_channel":
                return (
                    <div key={action} className="mt-4 space-y-4">
                        <Label className="text-sm font-semibold">Rename Channel</Label>
                        <SlackChannelNameFormat
                            format={format}
                            setFormat={setFormat}
                            selectedType="Candidates"
                        />
                        <ConditionsCard
                            condition={condition}
                            onRemove={() => handleRemoveAction()}
                            fields={CONDITIONS_ATTRIBUTES_LOOKUP["candidates"]}
                            onFieldSelect={(field) => handleConditionChange("field", field)}
                            onConditionSelect={(value) => handleConditionChange("condition", value)}
                            onValueChange={(value) => handleConditionChange("value", value)}
                            editable={true}
                            objectFieldType="candidates"
                        />
                    </div>
                );
            case "auto_archive":
                return (
                    <div key={action} className="mt-4 space-y-4">
                        <Label className="text-sm font-semibold">Auto-Archive Channel</Label>
                        <ConditionsCard
                            condition={condition}
                            onRemove={() => handleRemoveAction()}
                            fields={CONDITIONS_ATTRIBUTES_LOOKUP["candidates"]}
                            onFieldSelect={(field) => handleConditionChange("field", field)}
                            onConditionSelect={(value) => handleConditionChange("condition", value)}
                            onValueChange={(value) => handleConditionChange("value", value)}
                            editable={true}
                            objectFieldType="candidates"
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-800">
                        Automated Actions
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm text-gray-600">
                        Set up automated actions for this hiring room based on the
                        candidate's stage.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!showAction ? (
                        <Button variant="outline" onClick={handleAddAction} type="button">
                            <Plus className="mr-2 w-4 h-4" /> Add Action
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleRemoveAction}>
                                <Trash className="mr-2 w-4 h-4" /> Remove Action
                            </Button>

                            {/* Action Dropdown */}
                            <div className="mt-4">
                                <Label className="text-sm font-semibold">Select Action Type</Label>
                                <Select
                                    value={selectedAction} // Prefill action type
                                    onValueChange={(value) => setSelectedAction(value)}
                                    placeholder="Select an Action"
                                >
                                    <SelectTrigger className="mt-2 w-full rounded-lg border-gray-300 shadow-sm">
                                        <SelectValue placeholder="Select Action Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {actionsOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Render the selected action component */}
                            {selectedAction && renderActionComponent(selectedAction)}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-4 items-end justify-end">
                <Button
                    variant="secondary"
                    onClick={() => console.log("Back to previous step")}
                    className="rounded-md bg-gray-200 px-4 py-2 text-gray-700"
                >
                    Back
                </Button>
                <Button onClick={handleSave} className="rounded-md bg-blue-600 px-4 py-2 text-white">
                    Continue
                </Button>
            </div>
        </>
    );
};

export default TriggerActionsComponent;
