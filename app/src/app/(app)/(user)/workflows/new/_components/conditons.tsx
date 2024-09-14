// @ts-nocheck

import React, { useState, useEffect, useRef } from "react";
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
import { Trash2, PlusCircle, FilterIcon, FileAudio2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { fetchGreenhouseUsers } from "@/server/greenhouse/core";
import { cn } from "@/lib/utils";

const localStorageKey = "workflowConditions";

const saveConditionsData = (newConditions) => {
    localStorage.setItem(localStorageKey, JSON.stringify(newConditions));
    return;
    const storedData = JSON.parse(localStorage.getItem(localStorageKey)) || [];

    // Filter out duplicate conditions before saving
    const updatedData = [...storedData, ...newConditions].filter(
        (condition, index, self) =>
            index ===
            self.findIndex(
                (c) =>
                    c.field === condition.field &&
                    c.condition === condition.condition &&
                    c.value === condition.value,
            ),
    );
};

const getConditionsData = () => {
    return JSON.parse(localStorage.getItem(localStorageKey)) || [];
};

const fields = [
    { value: "name", label: "Candidate Name" },
    { value: "title", label: "Job Title" },
    { value: "company", label: "Company" },
    { value: "email", label: "Email Address" },
    { value: "phone", label: "Phone Number" },
    { value: "social_media", label: "Social Media" },
    { value: "recruiter_name", label: "Recruiter Name" },
    { value: "coordinator_name", label: "Coordinator Name" },
];

const ConditionsComponent = ({
    onSaveConditions,
    workflowData,
    selectedElementId,
}) => {
    const [conditions, setConditions] = useState([
        { id: -1, field: "", condition: "", value: "" },
    ]);
    const [isSaveEnabled, setIsSaveEnabled] = useState(false);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const componentsRef = useRef<Record<number, HTMLDivElement | null>>({});
    const [highlightedConditionIndex, setHighlightedConditionIndex] =
        useState(null);
    useEffect(() => {
        setConditions(getConditionsData());
        if (
            typeof selectedElementId === "number" &&
            componentsRef.current[selectedElementId]
        ) {
            componentsRef.current[selectedElementId]?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
            setHighlightedConditionIndex(selectedElementId);
        }
    }, [selectedElementId]);

    useEffect(() => {
        if (highlightedConditionIndex !== null) {
            const timer = setTimeout(() => {
                setHighlightedConditionIndex(null);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [highlightedConditionIndex]);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const userMap = await fetchGreenhouseUsers();
                const userList = Object.values(userMap);
                setUsers(userList);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleConditionChange = (id, key, value) => {
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
            {
                id: highestConditionId + 1,
                field: "",
                condition: "",
                value: "",
            },
        ]);
    };

    const removeCondition = (id) => {
        setConditions((prevConditions) =>
            prevConditions.filter((condition) => condition.id !== id),
        );
    };

    useEffect(() => {
        const allFieldsFilled = conditions.every(
            (condition) =>
                condition.field && condition.condition && condition.value,
        );
        setIsSaveEnabled(allFieldsFilled);
    }, [conditions]);

    const handleSave = () => {
        if (isSaveEnabled) {
            const existingConditions = getConditionsData();

            // Remove the conditions from existing conditions that have been removed!
            const filteredConditions = existingConditions.filter((c1) =>
                conditions.some((c2) => c2.id === c1.id),
            );

            // Get NEW conditions (that are not saved)
            const newConditions = conditions.filter(
                (condition) =>
                    condition.field &&
                    condition.condition &&
                    condition.value &&
                    !filteredConditions.some((c2) => condition.id === c2.id),
            );

            // Merge new and existing conditions and remove duplicates
            const updatedConditions = [
                // ...filteredConditions,
                // ...newConditions,
                ...conditions,
            ]
                .filter(
                    (condition, index, self) =>
                        index ===
                        self.findIndex(
                            (c) =>
                                c.field === condition.field &&
                                c.condition === condition.condition &&
                                c.value === condition.value,
                        ),
                )
                .map((item, index) => ({ ...item, id: index }));

            saveConditionsData(updatedConditions); // Save unique conditions to local storage
            onSaveConditions(filteredConditions); // Update WorkflowBuilder with only the new conditions

            // Reset the conditions form after saving
            setConditions([{ id: -1, field: "", condition: "", value: "" }]);
        }
    };

    return (
        <div className="conditions-sidebar flex h-full flex-col justify-between p-2">
            <div>
                {/* Title and Description */}
                <div className="mb-4 flex items-center">
                    <FilterIcon width={40} height={40} className="mx-2" />
                    <h2 className="text-xl font-semibold">Filter Conditions</h2>
                </div>
                <p className="mb-4 text-sm text-gray-500">
                    Set up rules to refine your workflow based on specific
                    conditions.
                </p>

                <div className="space-y-4">
                    {conditions.map((condition, index) => (
                        <Card
                            key={condition.id}
                            className={cn(
                                "mb-4 transition-colors duration-500",
                                condition.id === highlightedConditionIndex &&
                                    "border-emerald-500",
                            )}
                            ref={(el) =>
                                (componentsRef.current[condition.id] = el)
                            }
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    Condition
                                    <Button
                                        variant="ghost"
                                        onClick={() =>
                                            removeCondition(condition.id)
                                        }
                                        className="ml-auto text-red-600 hover:bg-red-100"
                                    >
                                        <Trash2 className="mr-2" /> Remove
                                    </Button>
                                </CardTitle>
                                <CardDescription>
                                    Define a condition to filter on.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className={"space-y-4 "}>
                                <div className="flex flex-col space-y-2">
                                    <div>
                                        <Select
                                            value={condition.field}
                                            onValueChange={(value) =>
                                                handleConditionChange(
                                                    condition.id,
                                                    "field",
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id={`field-${condition.id}`}
                                                className="mt-1 w-full"
                                            >
                                                <SelectValue placeholder="Choose field..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fields.map((field) => (
                                                    <SelectItem
                                                        key={field.value}
                                                        value={field.value}
                                                    >
                                                        {field.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Select
                                            value={condition.condition}
                                            onValueChange={(value) =>
                                                handleConditionChange(
                                                    condition.id,
                                                    "condition",
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id={`condition-${condition.id}`}
                                                className="mt-1 w-full"
                                            >
                                                <SelectValue placeholder="Choose condition..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="equals">
                                                    Equals
                                                </SelectItem>
                                                <SelectItem value="not_equals">
                                                    Not Equals
                                                </SelectItem>
                                                <SelectItem value="contains">
                                                    Contains
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        {[
                                            "coordinator_name",
                                            "recruiter_name",
                                        ].includes(condition.field) ? (
                                            <Select
                                                value={
                                                    typeof condition.value ===
                                                    "object"
                                                        ? condition.value.id
                                                        : ""
                                                }
                                                onValueChange={(userId) =>
                                                    handleConditionChange(
                                                        condition.id,
                                                        "value",
                                                        users.find(
                                                            (user) =>
                                                                user.id ===
                                                                userId,
                                                        ),
                                                    )
                                                }
                                                disabled={isLoading}
                                            >
                                                <SelectTrigger
                                                    id={`value-${condition.id}`}
                                                    className="mt-1 w-full"
                                                >
                                                    <SelectValue placeholder="Choose user...">
                                                        {typeof condition.value ===
                                                        "object"
                                                            ? condition.value
                                                                  .name
                                                            : "Choose user..."}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {users.map((user) => (
                                                        <SelectItem
                                                            key={user.id}
                                                            value={user.id}
                                                        >
                                                            {user.name} (
                                                            {user.email})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <input
                                                type="text"
                                                value={condition.value}
                                                onChange={(e) =>
                                                    handleConditionChange(
                                                        condition.id,
                                                        "value",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Enter value..."
                                                id={`value-${condition.id}`}
                                                className="mt-1 w-full rounded border p-2"
                                            />
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-6">
                    <Button
                        variant="outline"
                        onClick={addCondition}
                        className="flex w-full items-center justify-center"
                    >
                        <PlusCircle className="mr-2" /> Add Condition
                    </Button>
                </div>
            </div>

            <div>
                <Separator />
                <div className="p-6">
                    <Button
                        disabled={!isSaveEnabled}
                        onClick={handleSave}
                        className="w-full bg-blue-600 text-white"
                    >
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConditionsComponent;
