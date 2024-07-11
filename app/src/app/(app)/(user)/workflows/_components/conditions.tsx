/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchGreenhouseUsers } from "@/server/greenhouse/core";

export interface Condition {
    field: { value: string; label: string };
    operator: string;
    value: { id: string; email: string; name: string } | string;
    conditionType: string;
    operatorLabel: string;
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
    const [users, setUsers] = useState<
        { id: string; email: string; name: string }[]
    >([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            if (
                condition.field.value === "Coordinator" ||
                condition.field.value === "Recruiter"
            ) {
                setIsLoading(true);
                const userMap = await fetchGreenhouseUsers();
                const userList = Object.values(userMap);
                setUsers(userList);
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [condition.field.value]);

    const handleFieldChange = (value: string) => {
        const selectedOption = conditionTypesWithOperators.find(
            (option) => option.name === value,
        );
        if (selectedOption) {
            onChange(index, "field", {
                value: selectedOption.name,
                label: selectedOption.name,
            });
            onChange(index, "operator", "");
            onChange(index, "value", "");
        }
    };

    const handleOperatorChange = (value: string) => {
        onChange(index, "operator", value);
    };

    const handleValueChange = (userId: string) => {
        const user = users.find((user) => user.id === userId);
        if (user) {
            onChange(index, "value", user);
        }
    };

    const fieldValue = condition.field.value;
    const selectedField = conditionTypesWithOperators.find(
        (option) => option.name === fieldValue,
    );

    useEffect(() => {
        if (users.length > 0 && typeof condition.value === "string") {
            const user = users.find((user) => user.id === condition.value);
            if (user) {
                onChange(index, "value", user);
            }
        }
    }, [users, condition.value, index, onChange]);

    console.log("condition", condition); // Debugging log

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
                                {condition.field.label || "Select Property"}
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
                                {condition.operatorLabel}
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
                        value={
                            typeof condition.value === "object"
                                ? condition.value.id
                                : condition.value
                        }
                        onValueChange={handleValueChange}
                        disabled={!selectedField}
                    >
                        <SelectTrigger className="w-full border border-gray-300 bg-white">
                            <SelectValue placeholder="Select Value">
                                {typeof condition.value === "object"
                                    ? (
                                          condition.value as {
                                              id: string;
                                              email: string;
                                              name: string;
                                          }
                                      ).name
                                    : condition.value}
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
                ) : fieldValue === "Coordinator" ||
                  fieldValue === "Recruiter" ? (
                    <Select
                        value={
                            typeof condition.value === "object"
                                ? condition.value.id
                                : ""
                        }
                        onValueChange={handleValueChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="w-full border border-gray-300 bg-white">
                            <SelectValue placeholder="Select User">
                                {typeof condition.value === "object"
                                    ? condition.value.name
                                    : "Select User"}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                ) : (
                    <Input
                        placeholder="Enter Value"
                        value={
                            typeof condition.value === "object"
                                ? condition.value.name
                                : condition.value
                        }
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
