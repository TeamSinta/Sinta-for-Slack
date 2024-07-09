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
    field: { value: string; label: string };
    operator: string;
    value: string;
    conditionType: string;
}

interface ConditionProps {
    condition: Condition;
    index: number;
    onChange: (index: number, field: keyof Condition, value: any) => void;
    onRemove: (index: number) => void;
    conditionTypesWithOperators: Array<{
        name: string;
        operators: Array<{ value: string; label: string }>;
        values: Array<string>;
    }>;
}

const ConditionComponent: React.FC<ConditionProps> = ({
    condition,
    index,
    onChange,
    onRemove,
    conditionTypesWithOperators,
}) => {
    const handleFieldChange = (value: string) => {
        const selectedOption = conditionTypesWithOperators.find(
            (option) => option.name === value,
        );
        if (selectedOption) {
            onChange(index, "field", { value: selectedOption.name, label: selectedOption.name });
            onChange(index, "operator", "");
            onChange(index, "value", "");
        }
    };

    const handleOperatorChange = (value: string) => {
        const operator = selectedField?.operators.find(
            (op) => op.value === value,
        );
        onChange(index, "operator", value);
    };

    const handleValueChange = (value: string) => {
        onChange(index, "value", value);
    };

    const fieldValue = condition.field.value;
    const selectedField = conditionTypesWithOperators.find(
        (option) => option.name === fieldValue,
    );

    return (
        <div className="mb-4 flex flex-col gap-2 rounded-lg border border-gray-300 bg-gray-100 p-4">
            <div className="flex flex-row gap-4">
                {/* Field Selector */}
                <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Property
                    </Label>
                    <Select
                        value={fieldValue}
                        onValueChange={handleFieldChange}
                    >
                        <SelectTrigger className="w-full border border-gray-300 bg-white">
                            <SelectValue placeholder="Select Property">
                                {condition.field.label}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {conditionTypesWithOperators.map((option) => (
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

                {/* Operator Selector */}
                <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Operator
                    </Label>
                    <Select
                        value={condition.operator}
                        onValueChange={handleOperatorChange}
                        disabled={!selectedField}
                    >
                        <SelectTrigger className="w-full border border-gray-300 bg-white">
                            <SelectValue placeholder="Select Operator">
                                {condition.operator}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {selectedField?.operators.map((option) => (
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

            {/* Value Input or Selector */}
            <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Value
                </Label>
                {selectedField?.values?.length ?? 0 > 0 ? (
                    <Select
                        value={condition.value}
                        onValueChange={handleValueChange}
                        disabled={!selectedField}
                    >
                        <SelectTrigger className="w-full border border-gray-300 bg-white">
                            <SelectValue placeholder="Select Value">
                                {condition.value}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {selectedField?.values.map((value) => (
                                    <SelectItem key={value} value={value}>
                                        {value}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                ) : (
                    <Input
                        placeholder="Enter Value"
                        value={condition.value}
                        onChange={(e) => handleValueChange(e.target.value)}
                        className="w-full border border-gray-300 bg-white"
                        disabled={!selectedField}
                    />
                )}
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
