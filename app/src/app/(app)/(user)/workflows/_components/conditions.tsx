import React from "react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem,
} from "@/components/ui/select"; // Ensure correct imports
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface Condition {
    field: { value: string; label: string } | string;
    condition: string;
    value: string;
    unit?: string;
}

interface ConditionProps {
    condition: Condition;
    index: number;
    onChange: (index: number, field: keyof Condition, value: string) => void;
    onRemove: (index: number) => void;
    objectFieldOptions: Array<{ name: string; apiUrl: string }>;
    conditionOptions: Array<{ value: string; label: string }>;
}

const ConditionComponent: React.FC<ConditionProps> = ({
    condition,
    index,
    onChange,
    onRemove,
    objectFieldOptions,
    conditionOptions,
}) => {
    const handleFieldChange = (value: string) => {
        console.log('go bucks field change handle')
        const selectedOption = objectFieldOptions.find(
            (option) => option.name === value,
        );
        onChange(
            index,
            "field",
            selectedOption
                ? JSON.stringify({
                      value: selectedOption.name,
                      label: selectedOption.name,
                  })
                : value,
        );
    };

    const fieldValue =
        typeof condition.field === "string"
            ? condition.field
            : condition.field.value;

    return (
        <div className="mb-4 flex flex-col gap-2 rounded-lg border border-gray-300 bg-gray-100 p-4">
            <div className="flex flex-row gap-4">
                {/* Field Selector */}
                <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Field
                    </Label>
                    <Select
                        value={fieldValue}
                        // onValueChange={()=>{handleFieldChange}
                        onValueChange={(value) =>
                            onChange(index, "field", value)
                        }
                    >
                        <SelectTrigger className="w-full border border-gray-300 bg-white">
                            <SelectValue placeholder="Select Field" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {objectFieldOptions.map((option) => (
                                    <SelectItem
                                        key={option.name}
                                        value={option.name}
                                    >
                                        {option.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                {/* Condition Selector */}
                <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Condition
                    </Label>
                    <Select
                        value={condition.condition}
                        onValueChange={(value) =>
                            onChange(index, "condition", value)
                        }
                    >
                        <SelectTrigger className="w-full border border-gray-300 bg-white">
                            <SelectValue placeholder="Select Condition" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {conditionOptions.map((option) => (
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
            </div>

            {/* Value Input */}
            <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Value
                </Label>
                <Input
                    placeholder="Enter Value"
                    value={condition.value}
                    onChange={(e) => onChange(index, "value", e.target.value)}
                    className="w-full border border-gray-300 bg-white"
                />
            </div>

            {/* Remove Button */}
            <Button
                variant="destructive"
                size="sm"
                onClick={() => onRemove(index)}
                type="button"
                className="self-end"
            >
                Delete
            </Button>
        </div>
    );
};

export default ConditionComponent;
