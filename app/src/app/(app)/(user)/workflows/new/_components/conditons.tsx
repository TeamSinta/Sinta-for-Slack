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
import { Trash2, PlusCircle, FilterIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { fetchGreenhouseUsers } from "@/server/greenhouse/core";
import offerAttributes from "../../../../../../utils/offer-attributes.json";  // This is where your JSON file for offers is stored
import candidateAttributes from "../../../../../../utils/candidate-attributes.json";  // This is for the candidate attributes
import { ConditionSelector } from "./conditionsSelector";

const localStorageKey = "workflowConditions";

const saveConditionsData = (newConditions) => {
    localStorage.setItem(localStorageKey, JSON.stringify(newConditions));
};

const getConditionsData = () => {
    return JSON.parse(localStorage.getItem(localStorageKey)) || [];
};

const ConditionsComponent = ({
    onSaveConditions,
    selectedElementId,
    workflowData
}) => {
    const [conditions, setConditions] = useState([
        { id: -1, field: "", condition: "", value: "" },
    ]);
    const [isSaveEnabled, setIsSaveEnabled] = useState(false);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const componentsRef = useRef<Record<number, HTMLDivElement | null>>({});
    const [highlightedConditionIndex, setHighlightedConditionIndex] = useState(null);
    const [triggerConfig, setTriggerConfig] = useState(null);  // Hold the trigger config
    const [fields, setFields] = useState([]);  // Dynamically load fields based on API URL

    // Fetching triggerConfig from localStorage
    useEffect(() => {
        const localTriggerConfig = localStorage.getItem('workflowTriggers');
        if (localTriggerConfig) {
            const parsedConfig = JSON.parse(localTriggerConfig);
            setTriggerConfig(parsedConfig);

            // Dynamically set the fields based on the API URL
            const objectField = parsedConfig.objectField;
            if (objectField && objectField.toLowerCase().includes("approvals")) {
                // Set offer attributes if the objectField indicates Approvals
                setFields(offerAttributes.offer.attributes);
            } else if (objectField && objectField.toLowerCase().includes("candidates")) {
                // Set candidate attributes if the objectField indicates Candidates
                setFields(candidateAttributes.candidate.attributes);
            }
        }
    }, []);

    // Load previously saved conditions
    useEffect(() => {
        setConditions(getConditionsData());
        if (typeof selectedElementId === "number" && componentsRef.current[selectedElementId]) {
            componentsRef.current[selectedElementId]?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
            setHighlightedConditionIndex(selectedElementId);
        }
    }, [selectedElementId]);

    // Timeout for highlighted conditions
    useEffect(() => {
        if (highlightedConditionIndex !== null) {
            const timer = setTimeout(() => {
                setHighlightedConditionIndex(null);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [highlightedConditionIndex]);

    // Fetching Greenhouse users
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
                condition.id === id ? { ...condition, [key]: value } : condition,
            ),
        );
    };

    const addCondition = () => {
        const highestConditionId = Math.max(...conditions.map((item) => item.id), -1);
        setConditions((prevConditions) => [
            ...prevConditions,
            { id: highestConditionId + 1, field: "", condition: "", value: "" },
        ]);
    };

    const removeCondition = (id) => {
        setConditions((prevConditions) =>
            prevConditions.filter((condition) => condition.id !== id),
        );
    };

    // Enable or disable the Save button based on whether all fields are filled
    useEffect(() => {
        const allFieldsFilled = conditions.every(
            (condition) => condition.field && condition.condition && condition.value,
        );
        setIsSaveEnabled(allFieldsFilled);
    }, [conditions]);

    const handleSave = () => {
        if (isSaveEnabled) {
            const updatedConditions = [...conditions];
            saveConditionsData(updatedConditions);
            onSaveConditions(updatedConditions);

            // Reset the conditions form after saving
            setConditions([{ id: -1, field: "", condition: "", value: "" }]);
        }
    };

    const handleFieldChange = (id, field) => {
        handleConditionChange(id, "field", field); // Update field in the condition
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
                    Set up rules to refine your workflow based on specific conditions.
                </p>

                <div className="space-y-4">
                    {conditions.map((condition) => (
                        <Card
                            key={condition.id}
                            className={`mb-4 transition-colors duration-500 ${condition.id === highlightedConditionIndex ? "border-emerald-500" : ""}`}
                            ref={(el) => (componentsRef.current[condition.id] = el)}
                        >
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
                                    <div>
                                        <ConditionSelector
                                            attributes={fields}
                                            onFieldSelect={(field) => handleFieldChange(condition.id, field)} // Update the field based on user selection
                                        />
                                    </div>

                                    {/* Condition Selector */}
                                    <div>
                                        <Select
                                            value={condition.condition}
                                            onValueChange={(value) =>
                                                handleConditionChange(condition.id, "condition", value)
                                            }
                                        >
                                            <SelectTrigger className="mt-1 w-full rounded">
                                                <SelectValue placeholder="Choose condition..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                            <SelectItem value="contains">(Text) Contains</SelectItem>
        <SelectItem value="not_contains">(Text) Does not contain</SelectItem>
        <SelectItem value="exactly_matches">(Text) Exactly matches</SelectItem>
        <SelectItem value="not_exactly_matches">(Text) Does not exactly match</SelectItem>
        <SelectItem value="starts_with">(Text) Starts with</SelectItem>
        <SelectItem value="not_starts_with">(Text) Does not start with</SelectItem>
        <SelectItem value="ends_with">(Text) Ends with</SelectItem>

        <SelectItem value="greater_than">(Number) Greater than</SelectItem>
        <SelectItem value="less_than">(Number) Less than</SelectItem>

        <SelectItem value="after">(Date/Time) After</SelectItem>
        <SelectItem value="before">(Date/Time) Before</SelectItem>
        <SelectItem value="equals">(Date/Time) Equals</SelectItem>

                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Value Input */}
                                    <div>
                                        {["coordinator_name", "recruiter_name"].includes(condition.field) ? (
                                            <Select
                                                value={typeof condition.value === "object" ? condition.value.id : ""}
                                                onValueChange={(userId) =>
                                                    handleConditionChange(
                                                        condition.id,
                                                        "value",
                                                        users.find((user) => user.id === userId),
                                                    )
                                                }
                                                disabled={isLoading}
                                            >
                                                <SelectTrigger className="mt-1 w-full">
                                                    <SelectValue placeholder="Choose user..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {users.map((user) => (
                                                        <SelectItem key={user.id} value={user.id}>
                                                            {user.name} ({user.email})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <input
                                                type="text"
                                                value={condition.value}
                                                onChange={(e) =>
                                                    handleConditionChange(condition.id, "value", e.target.value)
                                                }
                                                placeholder="Enter value"
                                                className="mt-1 w-full rounded border p-1 px-2 text-md "
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
