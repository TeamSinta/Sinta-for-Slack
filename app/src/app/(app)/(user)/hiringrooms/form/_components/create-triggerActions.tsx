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

import { getActiveUsers, getChannels } from "@/server/slack/core";
import { getMockGreenhouseData } from "@/server/greenhouse/core";
import SlackChannelNameFormat from "../../_components/SlackChannelNameFormat";
import ConditionComponent from "../../_components/conditions";
import { Condition } from "../../../workflows/_components/columns";

// Define action options for dropdown
const actionsOptions = [
    { value: "add_recipients", label: "Add Additional Recipients" },
    { value: "remove_recipients", label: "Remove Recipients" },
    { value: "rename_channel", label: "Rename Channel" },
    { value: "auto_archive", label: "Auto-Archive Channel" },
];

const TriggerActionsComponent: React.FC = () => {
    const [selectedAction, setSelectedAction] = useState<string>(""); // Tracks selected action
    const [showDropdown, setShowDropdown] = useState<boolean>(false); // Controls action dropdown visibility
    const [selectedRecipients, setSelectedRecipients] = useState<
        { label: string; value: string }[]
    >([]);
    const [options, setOptions] = useState<{ value: string; label: string }[]>(
        [],
    );
    const [isLoading, setIsLoading] = useState(false);
    const [format, setFormat] = useState(
        "intw-{{CANDIDATE_NAME}}-{{CANDIDATE_CREATION_MONTH_TEXT_ABBREVIATED}}-{{CANDIDATE_CREATION_DAY_NUMBER}}",
    );
    const [selectedValue, setSelectedValue] = useState("Candidates"); // Default to "Candidates"
    const [conditions, setConditions] = useState<Condition[]>([]);

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
                        label: user.name,
                        value: user.id,
                        source: "slack",
                    })),
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
        updatedRecipients: { label: string; value: string }[],
    ) => {
        setSelectedRecipients(updatedRecipients);
    };

    const handleConditionChange = (
        index: number,
        field: keyof Condition ,
        value: string,
    ) => {
        const updatedConditions = [...conditions];
        updatedConditions[index] = {
            ...updatedConditions[index],
            [field]: value,
        };
        setConditions(updatedConditions);
    };

    const handleRemoveCondition = (index: number) => {
        const updatedConditions = conditions.filter((_, i) => i !== index);
        setConditions(updatedConditions);
    };

    const handleAddAction = () => {
        setShowDropdown(true); // Show the dropdown when button is clicked
    };

    const renderActionComponent = (action: string) => {
        switch (action) {
            case "add_recipients":
                return (
                    <div
                        key={action}
                        className="mt-4 space-y-4 rounded-md border p-4"
                    >
                        <Label className="text-sm font-semibold">
                            Add Recipients
                        </Label>
                        <FancyMultiSelect
                            selectedOptions={selectedRecipients}
                            onOptionChange={handleRecipientsChange}
                            options={options} // Use fetched options
                            loading={isLoading}
                        />
                        <div className="mt-4">
                            <Label className="text-sm font-semibold">
                                Conditions
                            </Label>
                            <ConditionComponent
                                condition={
                                    conditions[0] || {
                                        field: "",
                                        operator: "",
                                        value: "",
                                        fieldLabel: "",
                                        operatorLabel: "",
                                        valueLabel: "",
                                    }
                                } // Ensure a condition object exists
                                index={0}
                                onChange={handleConditionChange}
                                onRemove={handleRemoveCondition}
                                conditionTypesWithOperators={[]} // Replace with actual condition types
                            />
                        </div>
                    </div>
                );
            case "remove_recipients":
                return (
                    <div
                        key={action}
                        className="mt-4 space-y-4 rounded-md border p-4"
                    >
                        <Label className="text-sm font-semibold">
                            Remove Recipients
                        </Label>
                        <FancyMultiSelect
                            selectedOptions={selectedRecipients}
                            onOptionChange={handleRecipientsChange}
                            options={options} // Use fetched options
                            loading={isLoading}
                        />
                        <div className="mt-4">
                            <Label className="text-sm font-semibold">
                                Condition
                            </Label>
                            <ConditionComponent
                                condition={
                                    conditions[0] || {
                                        field: "",
                                        operator: "",
                                        value: "",
                                        fieldLabel: "",
                                        operatorLabel: "",
                                        valueLabel: "",
                                    }
                                } // Ensure a condition object exists
                                index={0}
                                onChange={handleConditionChange}
                                onRemove={handleRemoveCondition}
                                conditionTypesWithOperators={[]} // Replace with actual condition types
                            />
                        </div>
                    </div>
                );
            case "rename_channel":
                return (
                    <div
                        key={action}
                        className="mt-4 space-y-4 rounded-md border p-4"
                    >
                        <Label className="text-sm font-semibold">
                            Rename Channel
                        </Label>
                        <SlackChannelNameFormat
                            format={format}
                            setFormat={setFormat}
                            selectedType={selectedValue}
                        />
                        <div className="mt-4">
                            <Label className="text-sm font-semibold">
                                Condition
                            </Label>
                            <ConditionComponent
                                condition={
                                    conditions[0] || {
                                        field: "",
                                        operator: "",
                                        value: "",
                                        fieldLabel: "",
                                        operatorLabel: "",
                                        valueLabel: "",
                                    }
                                } // Ensure a condition object exists
                                index={0}
                                onChange={handleConditionChange}
                                onRemove={handleRemoveCondition}
                                conditionTypesWithOperators={[]} // Replace with actual condition types
                            />
                        </div>
                    </div>
                );
            case "auto_archive":
                return (
                    <div
                        key={action}
                        className="mt-4 space-y-4 rounded-md border p-4"
                    >
                        <Label className="text-sm font-semibold">
                            Auto Archive Channel
                        </Label>
                        <div className="mt-4">
                            <Label className="text-sm font-semibold">
                                Conditions
                            </Label>
                            <ConditionComponent
                                condition={
                                    conditions[0] || {
                                        field: "",
                                        operator: "",
                                        value: "",
                                        fieldLabel: "",
                                        operatorLabel: "",
                                        valueLabel: "",
                                    }
                                } // Ensure a condition object exists
                                index={0}
                                onChange={handleConditionChange}
                                onRemove={handleRemoveCondition}
                                conditionTypesWithOperators={[]} // Replace with actual condition types
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
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
                <Button
                    variant="outline"
                    onClick={handleAddAction}
                    type="button"
                >
                    Add Action
                </Button>

                {showDropdown && (
                    <div className="mt-4">
                        <Label className="text-sm font-semibold">
                            Select Action Type
                        </Label>
                        <Select
                            value={selectedAction}
                            onValueChange={(value) => setSelectedAction(value)} // Update action type on selection
                            placeholder="Select an Action"
                        >
                            <SelectTrigger className="mt-2 w-full rounded-lg border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select Action Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {actionsOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Render the selected action component */}
                {selectedAction && renderActionComponent(selectedAction)}
            </CardContent>
        </Card>
    );
};

export default TriggerActionsComponent;
