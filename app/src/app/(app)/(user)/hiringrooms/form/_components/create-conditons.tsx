"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import candidateAttributes from "../../../../../../utils/candidate-attributes.json";
import ConditionsCard from "./ConditionsCard";

export default function ConditionsStep({
    onSaveConditions,
    initialConditions, // Pass in existing conditions to pre-fill form
    isEditing = true,
    setIsEditing,
}: {
    onSaveConditions: (conditions: any[]) => void;
    initialConditions: any[]; // Pre-fill with existing conditions
    isEditing?: boolean;
    setIsEditing?: (isEditing: boolean) => void;
}) {
    const [conditions, setConditions] = useState(
        initialConditions.length > 0
            ? initialConditions
            : [{ id: 0, field: "", condition: "", value: "" }],
    );
    const [isSaveEnabled, setIsSaveEnabled] = useState(false);
    const [fields, setFields] = useState<
        { field: string; description: string }[]
    >([]); // For dynamic field setting based on trigger

    // Set fields dynamically, for now using static fields for demonstration
    useEffect(() => {
        setFields(candidateAttributes.candidate.attributes); // Change this as needed
    }, []);

    // Enable/disable save button based on whether all condition fields are filled
    useEffect(() => {
        const allFieldsFilled = conditions.every(
            (condition) =>
                condition.field && condition.condition && condition.value,
        );
        setIsSaveEnabled(allFieldsFilled);
    }, [conditions]);

    const handleConditionChange = (id: number, key: string, value: string) => {
        setConditions((prevConditions) =>
            prevConditions.map((condition) =>
                condition.id === id
                    ? { ...condition, [key]: value }
                    : condition,
            ),
        );
    };

    const addCondition = () => {
        const highestConditionId = Math.max(
            ...conditions.map((item) => item.id),
            -1,
        );
        setConditions((prevConditions) => [
            ...prevConditions,
            { id: highestConditionId + 1, field: "", condition: "", value: "" },
        ]);
    };

    const removeCondition = (id: number) => {
        setConditions((prevConditions) =>
            prevConditions.filter((condition) => condition.id !== id),
        );
    };

    const handleSave = () => {
        if (isSaveEnabled) {
            onSaveConditions([...conditions]); // Pass the conditions to the parent component
        }
    };

    return (
        <div className="flex w-full flex-col items-center justify-between pt-2">
            {/* Conditions List */}
            <div className="min-w-[24rem] space-y-4 overflow-y-auto">
                {conditions.map((condition) => (
                    <ConditionsCard
                        key={condition.id}
                        condition={condition}
                        onRemove={() => removeCondition(condition.id)}
                        fields={fields}
                        onFieldSelect={(field) =>
                            handleConditionChange(condition.id, "field", field)
                        }
                        onConditionSelect={(value) =>
                            handleConditionChange(
                                condition.id,
                                "condition",
                                value,
                            )
                        }
                        onValueChange={(value) =>
                            handleConditionChange(condition.id, "value", value)
                        }
                    />
                ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex w-full items-center justify-between">
                <Button
                    variant="outline"
                    onClick={addCondition}
                    className="flex items-center justify-center"
                >
                    <PlusCircle className="mr-2" /> Add Condition
                </Button>

                <div className="flex space-x-4">
                    <Button
                        variant="secondary"
                        onClick={() => console.log("Back to previous step")} // Implement back button
                        className="rounded-md bg-gray-200 px-4 py-2 text-gray-700"
                    >
                        Back
                    </Button>
                    <Button
                        disabled={!isSaveEnabled}
                        onClick={handleSave}
                        className="rounded-md bg-blue-600 px-4 py-2 text-white"
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    );
}
