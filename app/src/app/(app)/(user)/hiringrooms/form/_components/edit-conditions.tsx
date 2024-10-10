// @ts-nocheck

"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import candidateAttributes from "../../../../../../utils/candidate-attributes.json";
import ConditionsCard from "./ConditionsCard";
import { CONDITIONS_ATTRIBUTES_LOOKUP } from "@/utils/conditions-options";

export default function EditConditions({
    onSaveConditions,
    conditions,
    setConditions,
    isEditing = true,
    objectField = "candidates",
}: {
    onSaveConditions: (conditions: any[]) => void;
    conditions;
    isEditing?: boolean;
    setConditions: (conditions: any[]) => void;
    objectField: string;
}) {
    const [fields, setFields] = useState<
        { field: string; description: string }[]
    >([]); // For dynamic field setting based on trigger

    // Set fields dynamically, for now using static fields for demonstration
    useEffect(() => {
        setFields(CONDITIONS_ATTRIBUTES_LOOKUP[objectField.toLowerCase()]); // Change this as needed
    }, []);

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

    return (
        <div className="flex w-full flex-col items-start justify-between px-6">
            {/* Conditions List */}
            {conditions.length > 0 ? (
                <div className="min-w-[24rem] space-y-4 overflow-y-auto">
                    {conditions.map((condition, index) => (
                        <ConditionsCard
                            key={index}
                            condition={condition}
                            onRemove={() => removeCondition(condition.id)}
                            fields={fields}
                            onFieldSelect={(field) =>
                                handleConditionChange(
                                    condition.id,
                                    "field",
                                    field,
                                )
                            }
                            onConditionSelect={(value) =>
                                handleConditionChange(
                                    condition.id,
                                    "condition",
                                    value,
                                )
                            }
                            onValueChange={(value) =>
                                handleConditionChange(
                                    condition.id,
                                    "value",
                                    value,
                                )
                            }
                            editable={isEditing}
                            objectFieldType={objectField}
                        />
                    ))}
                </div>
            ) : (
                <div className="p-6 text-sm text-gray-700">
                    <p className="mt-2 text-gray-500">No conditions set</p>
                </div>
            )}
            {/* Action Buttons */}
            {isEditing && (
                <Button
                    variant="outline"
                    onClick={addCondition}
                    className="mt-4 flex items-center justify-center"
                >
                    <PlusCircle className="mr-2" /> Add Condition
                </Button>
            )}
        </div>
    );
}
