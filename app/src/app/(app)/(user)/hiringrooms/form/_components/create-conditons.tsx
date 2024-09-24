'use client';

import { useState, useEffect, useRef } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Trash2, PlusCircle, Filter } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import candidateAttributes from "../../../../../../utils/candidate-attributes.json";
import { ConditionSelector } from "../../../workflows/new/_components/conditionsSelector";

export default function ConditionsStep({ onSaveConditions }: { onSaveConditions: (conditions: any[]) => void }) {
    const [conditions, setConditions] = useState([{ id: 0, field: "", condition: "", value: "" }]);
    const [isSaveEnabled, setIsSaveEnabled] = useState(false);
    const [fields, setFields] = useState<{ field: string; description: string; }[]>([]); // For dynamic field setting based on trigger

    // Set fields dynamically, for now using static fields for demonstration
    useEffect(() => {
        setFields(candidateAttributes.candidate.attributes); // Change this as needed
    }, []);

    // Enable/disable save button based on whether all condition fields are filled
    useEffect(() => {
        const allFieldsFilled = conditions.every((condition) => condition.field && condition.condition && condition.value);
        setIsSaveEnabled(allFieldsFilled);
    }, [conditions]);

    const handleConditionChange = (id: number, key: string, value: string) => {
        setConditions((prevConditions) =>
            prevConditions.map((condition) => (condition.id === id ? { ...condition, [key]: value } : condition))
        );
    };

    const addCondition = () => {
        const highestConditionId = Math.max(...conditions.map((item) => item.id), -1);
        setConditions((prevConditions) => [
            ...prevConditions,
            { id: highestConditionId + 1, field: "", condition: "", value: "" },
        ]);
    };

    const removeCondition = (id: number) => {
        setConditions((prevConditions) => prevConditions.filter((condition) => condition.id !== id));
    };

    const handleSave = () => {
        if (isSaveEnabled) {
            onSaveConditions([...conditions]); // Pass the conditions to the parent component
            setConditions([{ id: -1, field: "", condition: "", value: "" }]); // Reset form after saving if necessary
        }
    };

    return (
        <div className="flex flex-col justify-between pt-2">
            {/* Title and Description */}


            {/* Conditions List */}
            <div className="space-y-4 overflow-y-auto">
                {conditions.map((condition) => (
                    <Card key={condition.id} className="transition-colors duration-500">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                Condition
                                <Button
                                    variant="ghost"
                                    onClick={() => removeCondition(condition.id)}
                                    className="ml-auto text-red-600 hover:bg-red-100"
                                >
                                    <Trash2 className="mr-2" /> Remove
                                </Button>
                            </CardTitle>
                            <CardDescription>Define a condition to filter on.</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="flex flex-col space-y-2">
                                {/* Field Selector */}
                                <ConditionSelector
                                    attributes={fields}
                                    onFieldSelect={(field) => handleConditionChange(condition.id, "field", field)}
                                />

                                {/* Condition Selector */}
                                <Select
                                    value={condition.condition}
                                    onValueChange={(value) => handleConditionChange(condition.id, "condition", value)}
                                >
                                    <SelectTrigger className="mt-1 w-full rounded">
                                        <SelectValue placeholder="Choose condition..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="contains">(Text) Contains</SelectItem>
                                        <SelectItem value="not_contains">(Text) Does not contain</SelectItem>
                                        <SelectItem value="exactly_matches">(Text) Exactly matches</SelectItem>
                                        {/* Add more items as needed */}
                                    </SelectContent>
                                </Select>

                                {/* Value Input */}
                                <input
                                    type="text"
                                    value={condition.value}
                                    onChange={(e) => handleConditionChange(condition.id, "value", e.target.value)}
                                    placeholder="Enter value"
                                    className="text-md mt-1 w-full rounded border p-1 px-2"
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-6">
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
                        onClick={() => console.log('Back to previous step')} // Implement back button
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
                    >
                        Back
                    </Button>
                    <Button
                        disabled={!isSaveEnabled}
                        onClick={handleSave}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    );
}
