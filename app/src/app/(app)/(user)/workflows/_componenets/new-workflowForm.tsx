// Import necessary components and hooks
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"; // Make sure to install and import zod if you haven't already
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // This is a placeholder, replace with your notification system
import { useRouter } from "next/navigation";
import { createWorkflowMutation } from "@/server/actions/workflows/mutations";
import { useMutation } from "@tanstack/react-query";
import { useAwaitableTransition } from "@/hooks/use-awaitable-transition";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroupItem, RadioGroup } from "@/components/ui/radio-group";
import SlackWorkflow from "./slack-workflow";
import ConditionComponent from "./conditions";

const messageButtonSchema = z.object({
    name: z.string(),
    label: z.string(),
});

const recipientSchema = z.object({
    openingText: z.string(),
    messageFields: z.array(z.string()), // Assuming strings correspond to field values like 'full_name'
    messageButtons: z.array(messageButtonSchema),
    messageDelivery: z.enum(["Group DM", "Direct Message", "Channels"]),
    recipients: z.array(z.string()), // Assuming strings are recipient identifiers
});

const workflowFormSchema = z.object({
    name: z.string(),
    objectField: z.string(),
    alertType: z.string(),
    conditions: z.array(
        z.object({
            field: z.string(),
            condition: z.string(),
            value: z.string(),
            greenhouseObject: z.string().optional(), // Optional for conditions other than 'stuck-in-stage'
        }),
    ),
    triggerConfig: z.object({
        apiUrl: z.string(),
        processor: z.string(),
    }),
    recipient: recipientSchema,
    status: z.string(),
    organizationId: z.string(),
});

const createFeedbackFormSchema = workflowFormSchema.omit({
    status: true,
    recipient: true,
    triggerConfig: true,
});

interface Condition {
    field: string;
    condition: string;
    value: string;
    greenhouseObject?: string;
}

function CreateWorkflowSheet() {
    const [conditions, setConditions] = useState<Condition[]>([]);
    const [recipientConfig, setRecipientConfig] = useState({
        openingText: "",
        messageFields: [],
        messageButtons: [],
        messageDelivery: "",
        recipients: [],
    });
    const [selectedAlertType, setSelectedAlertType] = useState("create/update");
    const [selectedValue, setSelectedValue] = useState("");
    const [selectedRecipient, setSelectedRecipient] = useState("");
    const [selectedOrganization, setSelectedOrganization] = useState("");
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Set default conditions based on selected alert type
        if (selectedAlertType === "timebased") {
            setConditions([
                {
                    field: "",
                    condition: "",
                    value: "",
                    greenhouseObject: "open",
                },
            ]);
        } else if (selectedAlertType === "stuck-in-stage") {
            setConditions([
                {
                    field: "when stuck-in-stage in",
                    condition: "",
                    value: "for",
                    greenhouseObject: "open",
                },
            ]);
        } else {
            // For other alert types, reset the conditions
            setConditions([]);
        }
    }, [selectedAlertType]);

    const handleConditionChange = (
        index: number,
        key: keyof Condition,
        value: string,
    ) => {
        const newConditions = [...conditions];
        const condition = newConditions[index];
        if (!condition) return;
        condition[key] = value;
        setConditions(newConditions);
    };
    const addCondition = () => {
        setConditions([
            ...conditions,
            { field: "", condition: "", value: "", greenhouseObject: "open" },
        ]);
    };

    const removeCondition = (index: number) => {
        const newConditions = [...conditions];
        newConditions.splice(index, 1);
        setConditions(newConditions);
    };

    const handleSelectChange = (
        value: string,
        field: "objectField" | "alertType" | "organizationId",
    ) => {
        switch (field) {
            case "objectField":
                setSelectedValue(value);
                const selectedObject = objectFieldOptions.find(
                    (obj) => obj.name === value,
                );
                if (selectedObject) {
                    form.setValue("objectField", value); // Set the objectField value
                    form.setValue("triggerConfig", {
                        apiUrl: selectedObject.apiUrl,
                        processor: "",
                    });
                }
                break;
            case "alertType":
                if (alertTypeOptions.some((option) => option.value === value)) {
                    setSelectedAlertType(value);
                    form.setValue("alertType", value);
                }
                break;
            case "organizationId":
                setSelectedOrganization(value);
                form.setValue("organizationId", value);
                break;
            default:
                // Handle default case or invalid field
                break;
        }
    };
    const handleOpeningTextChange = (text: string) => {
        updateRecipient("openingText", text);
    };

    const handleFieldsSelect = (fields: string[]) => {
        updateRecipient("messageFields", fields);
    };

    const handleButtonsChange = (buttons: any[]) => {
        updateRecipient("messageButtons", buttons);
    };

    const handleDeliveryOptionChange = (option: string) => {
        updateRecipient("messageDelivery", option);
    };

    const handleRecipientsChange = (recipients: string[]) => {
        updateRecipient("recipients", recipients);
    };

    const updateRecipient = (key: keyof typeof recipientConfig, value: any) => {
        const newRecipient = { ...recipientConfig, [key]: value };
        setRecipientConfig(newRecipient);
        form.setValue("recipient", newRecipient);
    };
    const form = useForm({
        resolver: zodResolver(createFeedbackFormSchema),
        defaultValues: {
            name: "",
            objectField: "",
            alertType: "",
            recipient: recipientConfig, // Initialize with the state
            conditions: [],
            organizationId: "",
            triggerConfig: { apiUrl: "", processor: "" },
        },
    });

    useEffect(() => {
        form.setValue("conditions", conditions);
    }, [conditions, form]);

    useEffect(() => {
        form.setValue("recipient", recipientConfig);
    }, [recipientConfig, form]);

    // Assuming createWorkflowMutation expects a type that conforms to the Zod schema
    const {
        mutateAsync,
        isPending: isMutatePending,
        reset,
    } = useMutation({
        mutationFn: createWorkflowMutation,
        onSuccess: () => {
            // Code to execute on success, e.g., navigating or showing a success message
            router.refresh();
            reset();
            setIsOpen(false);
        },
        onError: (error) => {
            // Code to execute on error, e.g., showing an error message
            toast.error(
                (error as { message?: string })?.message ??
                    "Failed to submit Workflow",
            );
        },
    });

    const [, startAwaitableTransition] = useAwaitableTransition();

    const onSubmit = async () => {
        try {
            const formData = form.getValues();
            await mutateAsync(formData);
            await startAwaitableTransition(() => {
                router.refresh();
            });
            reset();
            setIsOpen(false);
            toast.success("Workflow created successfully");
        } catch (error) {
            toast.error(
                (error as { message?: string })?.message ??
                    "Failed to submit Workflow",
            );
        }
    };

    const alertTypeOptions = [
        { value: "timebased", label: "Time-based" },
        { value: "create/update", label: "Create/Update" },
        { value: "stuck-in-stage", label: "Stuck-in-Stage" },
    ];

    const objectFieldOptions = [
        {
            name: "Activity Feed",
            apiUrl: "https://api.greenhouse.io/v1/activity_feed",
        },
        {
            name: "Applications",
            apiUrl: "https://api.greenhouse.io/v1/applications",
        },
        { name: "Approvals", apiUrl: "https://api.greenhouse.io/v1/approvals" },
        {
            name: "Candidates",
            apiUrl: "https://api.greenhouse.io/v1/candidates",
        },
        {
            name: "Close Reasons",
            apiUrl: "https://api.greenhouse.io/v1/close_reasons",
        },
        {
            name: "Custom Fields",
            apiUrl: "https://api.greenhouse.io/v1/custom_fields",
        },
        {
            name: "Demographic Data",
            apiUrl: "https://api.greenhouse.io/v1/demographic_data",
        },
        {
            name: "Departments",
            apiUrl: "https://api.greenhouse.io/v1/departments",
        },
        { name: "Education", apiUrl: "https://api.greenhouse.io/v1/education" },
        { name: "EEOC", apiUrl: "https://api.greenhouse.io/v1/eeoc" },
        {
            name: "Email Templates",
            apiUrl: "https://api.greenhouse.io/v1/email_templates",
        },
        {
            name: "Job Openings",
            apiUrl: "https://api.greenhouse.io/v1/job_openings",
        },
        { name: "Job Posts", apiUrl: "https://api.greenhouse.io/v1/job_posts" },
        {
            name: "Job Stages",
            apiUrl: "https://api.greenhouse.io/v1/job_stages",
        },
        { name: "Jobs", apiUrl: "https://api.greenhouse.io/v1/jobs" },
        { name: "Offers", apiUrl: "https://api.greenhouse.io/v1/offers" },
        { name: "Offices", apiUrl: "https://api.greenhouse.io/v1/offices" },
        {
            name: "Prospect Pools",
            apiUrl: "https://api.greenhouse.io/v1/prospect_pools",
        },
        {
            name: "Rejection Reasons",
            apiUrl: "https://api.greenhouse.io/v1/rejection_reasons",
        },
        {
            name: "Scheduled Interviews",
            apiUrl: "https://api.greenhouse.io/v1/scheduled_interviews",
        },
        {
            name: "Scorecards",
            apiUrl: "https://api.greenhouse.io/v1/scorecards",
        },
        { name: "Sources", apiUrl: "https://api.greenhouse.io/v1/sources" },
        { name: "Tags", apiUrl: "https://api.greenhouse.io/v1/tags" },
        {
            name: "Tracking Links",
            apiUrl: "https://api.greenhouse.io/v1/tracking_links",
        },
        { name: "Users", apiUrl: "https://api.greenhouse.io/v1/users" },
        {
            name: "User Permissions",
            apiUrl: "https://api.greenhouse.io/v1/user_permissions",
        },
        {
            name: "User Roles",
            apiUrl: "https://api.greenhouse.io/v1/user_roles",
        },
    ];

    const conditionOptions = [
        { value: "equal", label: "Equal To" },
        { value: "notEqual", label: "Not equal To" },
        { value: "one", label: "Is one of" },
        { value: "notOne", label: "Is not one of" },
        { value: "notBlank", label: "Is not blank" },
        { value: "blank", label: "Is blank " },
    ];

    const timeConditionOptions = [
        { value: "before", label: "Before" },
        { value: "after", label: "After" },
        { value: "same", label: "Same Day" },
    ];

    const dateFieldOptions = [
        "Created at",
        "Closed at ",
        "Updated at",
        "Last activity",
    ];

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600">
                    Create Workflow
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] min-w-[90vw] overflow-y-auto bg-white dark:bg-gray-800">
                <DialogHeader className="flex flex-row justify-between">
                    <img
                        src="https://assets-global.website-files.com/6457f112b965721ffc2b0777/653e865d87d06c306e2b5147_Group%201321316944.png"
                        alt="Logo_sinta"
                        className="h-12 w-12"
                    />
                    <DialogTitle className=" flex flex-col items-center dark:text-white">
                        <h2 className="text-xl font-semibold">
                            Create Workflow
                        </h2>
                        <DialogDescription className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Get started by filling in the basics.
                        </DialogDescription>
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-gray-500 dark:text-gray-400"></DialogDescription>
                </DialogHeader>
                <hr className="mb-6 mt-2 border-gray-300 dark:border-gray-700" />

                <div className="flex h-full flex-col gap-6 overflow-y-auto px-6">
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        {/* General */}
                        <div className="flex items-start gap-8">
                            <div className="w-1/3">
                                <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                    General
                                </Label>
                                <p className="mt-2 text-sm text-gray-500">
                                    Configure the general settings of the
                                    workflow.
                                </p>
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <Label
                                        htmlFor="name"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Name
                                    </Label>
                                    <Input
                                        {...form.register("name")}
                                        placeholder="Enter name"
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 dark:border-gray-600"
                                    />
                                </div>

                                <div>
                                    <Label
                                        htmlFor="objectField"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Select Greenhouse Object
                                    </Label>
                                    <Select
                                        value={selectedValue}
                                        onValueChange={(value) =>
                                            handleSelectChange(
                                                value,
                                                "objectField",
                                            )
                                        }
                                    >
                                        <SelectTrigger className="w-full border-gray-300">
                                            <SelectValue placeholder="Select Greenhouse Object" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {objectFieldOptions.map(
                                                    (option) => (
                                                        <SelectItem
                                                            key={option.name}
                                                            value={option.name}
                                                        >
                                                            {option.name}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <hr className="my-2 border-gray-300 dark:border-gray-700" />

                        {/* Alert Type */}
                        <div className="flex items-start gap-8">
                            <div className="w-1/3">
                                <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                    Alert Type
                                </Label>
                                <p className="mt-2 text-sm text-gray-500">
                                    Select the type of alert for this workflow.
                                </p>
                            </div>
                            <div className="flex-1">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Alert Type Options
                                </Label>
                                <RadioGroup
                                    defaultValue={selectedAlertType}
                                    onValueChange={(value) =>
                                        handleSelectChange(value, "alertType")
                                    }
                                    className="flex flex-row space-x-4"
                                >
                                    {alertTypeOptions.map((option) => (
                                        <div
                                            key={option.value}
                                            className="flex w-full items-center gap-3"
                                        >
                                            <RadioGroupItem
                                                value={option.value}
                                                id={option.value}
                                                className="peer sr-only"
                                            />
                                            <Label
                                                htmlFor={option.value}
                                                className={`flex w-full flex-col items-center justify-center rounded-md border border-gray-300 bg-popover p-4 ${
                                                    selectedAlertType ===
                                                    option.value
                                                        ? "bg-indigo-500 text-white"
                                                        : "hover:bg-indigo-100 hover:text-indigo-800"
                                                }`}
                                                style={{ height: "40px" }}
                                            >
                                                <h2 className="mb-0">
                                                    {option.label}
                                                </h2>
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        </div>
                        <hr className="my-2 border-gray-300 dark:border-gray-700" />
                        <div className="flex items-start gap-8">
                            <div className="w-1/3">
                                <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                    Conditions
                                </Label>

                                <p className="mt-2 text-sm text-gray-500">
                                    Specify conditions for triggering the
                                    workflow.
                                </p>
                            </div>
                            <div className="flex-1 space-y-4">
                                {/* Conditional rendering based on selected alert type */}
                                {selectedAlertType === "timebased" && (
                                    <div className="mb-4 flex gap-4 rounded-lg border border-gray-300 bg-gray-100 p-4">
                                        <div className="flex-1">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Date Field
                                            </Label>
                                            <Select
                                                onValueChange={(value) =>
                                                    handleConditionChange(
                                                        0,
                                                        "field",
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="w-full border border-gray-300 bg-white">
                                                    <SelectValue placeholder="Select Date Field" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {dateFieldOptions.map(
                                                            (option) => (
                                                                <SelectItem
                                                                    key={option}
                                                                    value={
                                                                        option
                                                                    }
                                                                >
                                                                    {option}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex-1">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Condition
                                            </Label>
                                            <Select
                                                onValueChange={(value) =>
                                                    handleConditionChange(
                                                        0,
                                                        "condition",
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="w-full border border-gray-300 bg-white">
                                                    <SelectValue placeholder="Select Condition" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {timeConditionOptions.map(
                                                            (option) => (
                                                                <SelectItem
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex-1">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Value
                                            </Label>
                                            <Input
                                                placeholder="Enter Value"
                                                className="w-full border border-gray-300 bg-white"
                                                onChange={(e) =>
                                                    handleConditionChange(
                                                        0,
                                                        "value",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                                {selectedAlertType === "stuck-in-stage" && (
                                    <div className="mb-4 flex gap-4 rounded-lg border border-gray-300 bg-gray-100 p-4">
                                        <div className="flex-1">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Stage
                                            </Label>
                                            <Select
                                                onValueChange={(value) =>
                                                    handleConditionChange(
                                                        0,
                                                        "field",
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="w-full border border-gray-300 bg-white">
                                                    <SelectValue placeholder="Select Stage" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {objectFieldOptions.map(
                                                            (option) => (
                                                                <SelectItem
                                                                    key={
                                                                        option.name
                                                                    }
                                                                    value={
                                                                        option.name
                                                                    }
                                                                >
                                                                    {
                                                                        option.name
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <h1 className="mt-4 self-center text-gray-700 dark:text-gray-300">
                                            For
                                        </h1>
                                        <div className="flex-1">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Days
                                            </Label>
                                            <Input
                                                placeholder="Enter Days"
                                                className="w-full border border-gray-300 bg-white"
                                                onChange={(e) =>
                                                    handleConditionChange(
                                                        0,
                                                        "value",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Display additional conditions dynamically added */}
                                {conditions.slice(1).map((condition, index) => (
                                    <ConditionComponent
                                        key={index}
                                        index={index + 1} // Adjust index for zero-based array
                                        condition={condition}
                                        onChange={handleConditionChange}
                                        onRemove={removeCondition}
                                        objectFieldOptions={objectFieldOptions}
                                        conditionOptions={conditionOptions}
                                    />
                                ))}

                                {/* Button to add new conditions */}
                                <Button
                                    variant="outline"
                                    className="mt-2 w-full hover:bg-indigo-100 hover:text-indigo-800"
                                    onClick={addCondition}
                                    type="button"
                                >
                                    + Add Condition
                                </Button>
                            </div>
                        </div>

                        <hr className="my-2 border-gray-300 dark:border-gray-700" />

                        {/* Recipient */}
                        <div className="flex items-start gap-8">
                            <div className="w-1/3">
                                <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                    Recipient
                                </Label>
                                <p className="mt-2 text-sm text-gray-500">
                                    Specify the recipient of the alert.
                                </p>
                            </div>
                            <div className="flex-1">
                                <SlackWorkflow
                                    onOpeningTextChange={
                                        handleOpeningTextChange
                                    }
                                    onFieldsSelect={handleFieldsSelect}
                                    onButtonsChange={handleButtonsChange}
                                    onDeliveryOptionChange={
                                        handleDeliveryOptionChange
                                    }
                                    onRecipientsChange={handleRecipientsChange}
                                />
                            </div>
                        </div>

                        {/* Additional fields as required... */}
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={isMutatePending}
                                className="bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
                            >
                                Submit Workflow
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default CreateWorkflowSheet;
