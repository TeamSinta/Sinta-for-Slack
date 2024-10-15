// @ts-nocheck

import { useState, useEffect } from "react";
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
import { Trash2, PlusCircle } from "lucide-react";
import { ConditionSelector } from "../../../workflows/new/_components/conditionsSelector";
import {
    CONDITIONS_OPTIONS,
    CONDITIONS_ATTRIBUTES_LOOKUP,
    getConditionFieldDataType,
    DataType,
} from "@/utils/conditions-options";

// Define candidate, job, and offer events
const candidateEvents = [
    {
        title: "Candidate Stage Change",
        description: "Triggered when a candidate's stage changes.",
        alertType: "Candidate Stage Change",
        apiUrl: "/api/candidate-stage-change",
    },
    {
        title: "Offer Created",
        description: "Triggered when an offer is created for a candidate.",
        alertType: "Offer Created",
        apiUrl: "/api/offer-created",
    },
];

const jobEvents = [
    {
        title: "Job Approved",
        description: "Triggered when a job is approved.",
        alertType: "Job Approved",
        apiUrl: "/api/job-approved",
    },
    {
        title: "Job Created",
        description: "Triggered when a job is created.",
        alertType: "Job Created",
        apiUrl: "/api/job-created",
    },
    {
        title: "Job Post Created",
        description: "Triggered when a job post is created.",
        alertType: "Job Post Created",
        apiUrl: "/api/job-post-created",
    },
];

const offerEvents = [
    {
        title: "Offer Approved",
        description: "Triggered when an offer is approved.",
        alertType: "Offer Approved",
        apiUrl: "/api/offer-approved",
    },
];

const getObjectFieldTypeFromAlertType = {
    "Candidate Stage Change": null,
    "Offer Created": "candidates",
    "Job Approved": null,
    "Job Created": null,
    "Job Post Created": "jobs",
    "Offer Approved": "offers",
};

export default function ConditionsStep({
    onSaveConditions,
    initialConditions,
    initialEvent, // Initial event prop for persistence
    objectField,
}: {
    onSaveConditions: (conditions: any[], event: { alertType: string }) => void;
    initialConditions: any[];
    initialEvent: { alertType: string }; // Event persistence
    objectField: string;
}) {
    const [selectedEvent, setSelectedEvent] = useState(
        initialEvent
            ? candidateEvents
                  .concat(jobEvents, offerEvents)
                  .find((e) => e.alertType === initialEvent.alertType)
            : null,
    );
    const [conditions, setConditions] = useState(
        initialConditions.length > 0 ? initialConditions : [],
    );
    const [isConditionSectionVisible, setIsConditionSectionVisible] = useState(
        initialConditions.length > 0,
    );
    const [isSaveEnabled, setIsSaveEnabled] = useState(false);
    const [fields, setFields] = useState<
        { field: string; description: string }[]
    >([]);

    // Dynamically load events based on the objectField (Candidates, Jobs, Offer)
    const events =
        objectField === "Candidates"
            ? candidateEvents
            : objectField === "Jobs"
              ? jobEvents
              : offerEvents;

    // Dynamically load attributes based on the selected event
    useEffect(() => {
        const objectType =
            getObjectFieldTypeFromAlertType[selectedEvent?.alertType];
        if (objectType && CONDITIONS_ATTRIBUTES_LOOKUP[objectType]) {
            setFields(CONDITIONS_ATTRIBUTES_LOOKUP[objectType]);
        }
    }, [selectedEvent]);

    // Enable/disable save button based on whether all condition fields are filled and event is selected
    useEffect(() => {
        const allFieldsFilled = conditions.every(
            (condition) =>
                condition.field && condition.condition && condition.value,
        );
        setIsSaveEnabled(allFieldsFilled && selectedEvent);
    }, [conditions, selectedEvent]);

    const handleEventChange = (eventTitle: string) => {
        const event = events.find((e) => e.title === eventTitle);
        setSelectedEvent(event);
    };

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
        const newConditionId =
            conditions.length > 0
                ? Math.max(...conditions.map((item) => item.id)) + 1
                : 0;

        setConditions((prevConditions) => [
            ...prevConditions,
            { id: newConditionId, field: "", condition: "", value: "" },
        ]);

        setIsConditionSectionVisible(true);
    };

    const removeCondition = (id: number) => {
        setConditions((prevConditions) =>
            prevConditions.filter((condition) => condition.id !== id),
        );
    };

    const handleSave = () => {
        if (isSaveEnabled) {
            onSaveConditions(conditions, {
                alertType: selectedEvent?.alertType,
            });
        }
    };

    const getConditionOptions = (field: string) => {
        const objectFieldType =
            getObjectFieldTypeFromAlertType[selectedEvent?.alertType];

        if (!objectFieldType) {
            return [];
        }

        const dataType = getConditionFieldDataType(field, objectFieldType);

        return Object.keys(CONDITIONS_OPTIONS)
            .filter((option) =>
                CONDITIONS_OPTIONS[option].dataType.includes(dataType),
            )
            .map((key) => ({
                value: key,
                label: CONDITIONS_OPTIONS[key].label,
            }));
    };

    return (
        <div className="flex flex-col justify-between pt-2">
            {/* Event Selection */}
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>Select Event</CardTitle>
                    <CardDescription>
                        Choose an event that will interact with the Greenhouse
                        API.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Select
                        onValueChange={handleEventChange}
                        value={selectedEvent?.title || "Choose an event"}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue>
                                {selectedEvent
                                    ? selectedEvent.title
                                    : "Choose an event"}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="space-y-2 rounded-sm p-2">
                            {events.map((event) => (
                                <SelectItem
                                    key={event.title}
                                    value={event.title}
                                >
                                    <div className="p-2">
                                        <p className="font-medium">
                                            {event.title}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {event.description}
                                        </p>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* If no event is selected, don't render an empty card */}
                    {selectedEvent && (
                        <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
                            <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold">
                                    {selectedEvent.title}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-500">
                                {selectedEvent.description}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Conditions List Section */}
            {isConditionSectionVisible && conditions.length > 0 && (
                <div className="space-y-4 overflow-y-auto">
                    {conditions.map((condition) => (
                        <Card
                            key={condition.id}
                            className="transition-colors duration-500"
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

                            <CardContent className="space-y-4">
                                <div className="flex flex-col space-y-2">
                                    {/* Field Selector */}
                                    <ConditionSelector
                                        attributes={fields}
                                        selectedField={condition.field}
                                        onFieldSelect={(field) =>
                                            handleConditionChange(
                                                condition.id,
                                                "field",
                                                field,
                                            )
                                        }
                                    />

                                    {/* Condition Selector */}
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
                                        <SelectTrigger className="mt-1 w-full rounded">
                                            <SelectValue placeholder="Choose condition..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getConditionOptions(
                                                condition.field,
                                            ).map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Value Input */}
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
                                        placeholder="Enter value"
                                        className="text-md mt-1 w-full rounded border p-1 px-2"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Condition and Action Buttons */}
            <div className="mt-6 flex items-center justify-between">
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
                        onClick={() => console.log("Back to previous step")}
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
