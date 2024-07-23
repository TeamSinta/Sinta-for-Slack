/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

// @ts-nocheck

"use client";

import {
    updateWorkflowMutation,
} from "@/server/actions/workflows/mutations";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { fetchJobsFromGreenhouse } from "@/server/greenhouse/core";
import { getWorkflowById } from '@/server/actions/workflows/queries'
import StagesDropdown from "./stages-dropdown";
import JobsDropdown from "./job-select";
import Image from "next/image";
import { toast } from "sonner";

const messageButtonSchema = z.object({
    name: z.string(),
    label: z.string(),
});

export const recipientSchema = z.object({
    openingText: z.string(),
    messageFields: z.array(z.string()),
    messageButtons: z.array(messageButtonSchema),
    messageDelivery: z.enum(["Group DM", "Direct Message", "Channels"]),
    recipients: z.array(
        z.object({
            label: z.string(),
            value: z.string(),
        }),
    ),
    customMessageBody: z.string().optional(), // This can be a large string
});

export const workflowFormSchema = z.object({
    name: z.string(),
    objectField: z.string(),
    alertType: z.string(),
    conditions: z.array(
        z.object({
            field: z.object({
                value: z.string(),
                label: z.string(),
            }),
            condition: z.string(),
            value: z.string(),
            unit: z.string().optional(),
            conditionType: z.string(), // Add this line
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

export interface Condition {
    field: string;
    operator: string;
    value: string;
}

export interface TimeBasedCondition {
    field: { value: string; label: string };
    condition: string;
    value: string;
    unit?: string;
    conditionType: string; // Add this line
}

interface DateFieldOption {
    value: string;
    label: string;
}

interface Job {
    id: number;
    name: string;
}

function WorkflowSheet({ workflowId, mode }: { workflowId: string; mode: string }) {
    const [selectedRecipients, setSelectedRecipients] = useState<any[]>([]);
    const [conditions, setConditions] = useState<Condition[]>([
        { field: "", operator: "", value: "" },
    ]);
    const [timeBasedConditions, setTimeBasedConditions] = useState<
        TimeBasedCondition[]
    >([
        {
            field: { value: "", label: "" },
            condition: "",
            value: "",
            unit: "",
            conditionType: "main",
        },
    ]);
    const [stuckStageConditions, setStuckStageConditions] = useState<
        Condition[]
    >([
        {
            field: {
                value: "when stuck-in-stage in",
                label: "When Stuck in Stage",
            },
            operator: "greaterThan",
            value: "",
            conditionType: "main",
        },
    ]);
    const [recipientConfig, setRecipientConfig] = useState({
        openingText: "",
        messageFields: [],
        messageButtons: [],
        messageDelivery: "",
        recipients: [],
        customMessageBody: "",
    });
    const [selectedAlertType, setSelectedAlertType] = useState("timebased");
    const [isInitialSetupDone, setIsInitialSetupDone] =
        useState<boolean>(false);

    const [, setSelectedOrganization] = useState("");
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [, setJobs] = useState<Job[]>([]);
    const [isCandidateSelected, setIsCandidateSelected] =
        useState<boolean>(false);
    const [selectedValue, setSelectedValue] = useState<string>("");
    const [selectedJobId, setSelectedJobId] = useState<string>("");

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const jobs = await fetchJobsFromGreenhouse();
                setJobs(jobs);
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
            }
        };
        void fetchJobs();
    }, []);

    useEffect(() => {
        if (!isInitialSetupDone) {
            if (selectedAlertType === "timebased") {
                setTimeBasedConditions([
                    {
                        field: { value: "", label: "" },
                        condition: "",
                        value: "",
                        unit: "Days",
                        conditionType: "main",
                    },
                ]);
            } else if (selectedAlertType === "stuck-in-stage") {
                setStuckStageConditions([
                    {
                        field: {
                            value: "when stuck-in-stage in",
                            label: "When Stuck in Stage",
                        },
                        operator: "greaterThan",
                        value: "",
                        conditionType: "main",
                    },
                ]);
            } else {
                setConditions([]);
            }
            setIsInitialSetupDone(true);
        }
    }, [selectedAlertType, isInitialSetupDone]);

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
        if (selectedAlertType === "timebased") {
            form.setValue("conditions", [
                ...timeBasedConditions,
                ...newConditions,
            ]);
        } else {
            form.setValue("conditions", [
                ...stuckStageConditions,
                ...newConditions,
            ]);
        }
    };

    const handleConditionChangeTimeBased = (
        index: number,
        key: keyof TimeBasedCondition,
        value: any,
    ) => {
        const newConditions = [...timeBasedConditions];
        const condition = newConditions[index];
        if (!condition) return;

        if (key === "field") {
            condition[key] = { value: value.value, label: value.label };
        } else {
            condition[key] = value;
        }

        setTimeBasedConditions(newConditions);
        form.setValue("conditions", [...newConditions, ...conditions]);
    };

    const handleConditionChangeStuckStage = (
        index: number,
        key: keyof Condition,
        value: any,
    ) => {
        const newConditions = [...stuckStageConditions];
        const condition = newConditions[index];
        if (!condition) return;

        if (key === "field") {
            condition[key] = { value: value.value, label: value.label };
        } else {
            condition[key] = value;
        }

        setStuckStageConditions(newConditions);
        form.setValue("conditions", [...newConditions, ...conditions]);
    };

    const addCondition = () => {
        setConditions([
            ...conditions,
            {
                field: "",
                operator: "",
                value: "",
                conditionType: "add-on",
            },
        ]);
    };

    const removeCondition = (index: number) => {
        const newConditions = [...conditions];
        newConditions.splice(index, 1);
        setConditions(newConditions);
        if (selectedAlertType === "timebased") {
            form.setValue("conditions", [
                ...timeBasedConditions,
                ...newConditions,
            ]);
        } else {
            form.setValue("conditions", [
                ...stuckStageConditions,
                ...newConditions,
            ]);
        }
    };

    const handleSelectChange = (
        value: string,
        label: string,
        field:
            | "objectField"
            | "alertType"
            | "organizationId"
            | "jobId"
            | "stage",
    ) => {
        switch (field) {
            case "objectField":
                setSelectedValue(value);
                const selectedObject = objectFieldOptions.find(
                    (obj) => obj.name === value,
                );
                if (selectedObject) {
                    form.setValue("objectField", value);
                    form.setValue("triggerConfig", {
                        apiUrl: selectedObject.apiUrl,
                        processor: "",
                    });
                }
                if (value === "Candidates") {
                    setIsCandidateSelected(true);
                } else {
                    setIsCandidateSelected(false);
                }
                break;
            case "alertType":
                if (alertTypeOptions.some((option) => option.value === value)) {
                    setSelectedAlertType(value);
                    form.setValue("alertType", value);
                    setIsInitialSetupDone(false); // Reset the initial setup flag
                    if (value === "timebased") {
                        setTimeBasedConditions([
                            {
                                field: { value: "", label: "" },
                                condition: "",
                                value: "",
                                unit: "Days",
                                conditionType: "main",
                            },
                        ]);
                        setConditions([]);
                    } else if (value === "stuck-in-stage") {
                        setStuckStageConditions([
                            {
                                field: {
                                    value: "when stuck-in-stage in",
                                    label: "When Stuck in Stage",
                                },
                                operator: "greaterThan",
                                value: "",
                                conditionType: "main",
                            },
                        ]);
                        setConditions([]);
                    }
                }
                break;
            case "organizationId":
                setSelectedOrganization(value);
                form.setValue("organizationId", value);
                break;
            case "jobId":
                setSelectedJobId(value);
                form.setValue("triggerConfig.processor", value);
                break;
            case "stage":
                const conditionIndex = stuckStageConditions.findIndex(
                    (condition) =>
                        typeof condition.field !== "string" &&
                        condition.field.value === "when stuck-in-stage in",
                );
                handleConditionChangeStuckStage(conditionIndex, "field", {
                    value: value,
                    label,
                });
                break;
            default:
                break;
        }
    };

    const handleOpeningTextChange = (text: string) => {
        updateRecipient("openingText", text);
    };

    const handleFieldsSelect = (fields: string[]) => {
        updateRecipient("messageFields", fields);
    };

    const handleButtonsChange = (
        buttons: { action: string; label: string }[],
    ) => {
        updateRecipient("messageButtons", buttons);
    };

    const handleDeliveryOptionChange = (option: string) => {
        updateRecipient("messageDelivery", option);
    };

    const handleRecipientsChange = (
        recipientObjects: { label: string; value: string }[],
    ) => {
        updateRecipient("recipients", recipientObjects);
    };

    const handleCustomMessageBodyChange = (customMessageBody: string) => {
        updateRecipient("customMessageBody", customMessageBody);
    };

    const updateRecipient = (
        key: keyof typeof recipientConfig,
        value: unknown,
    ) => {
        const newRecipient = { ...recipientConfig, [key]: value };
        setRecipientConfig(newRecipient);
        form.setValue("recipient", newRecipient);
    };

    interface FormValues {
        name: string;
        objectField: string;
        alertType: string;
        recipient: typeof recipientConfig;
        conditions: Condition[]; // Ensure conditions is of type Condition[]
        organizationId: string;
        triggerConfig: {
            apiUrl: string;
            processor: string;
        };
    }

    // Initialize the form with correct types
    const form = useForm<FormValues>({
        resolver: zodResolver(createFeedbackFormSchema),
        defaultValues: {
            name: "",
            objectField: "",
            alertType: "timebased",
            recipient: recipientConfig,
            conditions: [], // Initialize with an empty array of Condition[]
            organizationId: "",
            triggerConfig: { apiUrl: "", processor: "" },
        },
    });

    useEffect(() => {
        if (
            selectedAlertType === "timebased" ||
            selectedAlertType === "stuck-in-stage"
        ) {
            form.setValue("conditions", timeBasedConditions);
        } else {
            form.setValue("conditions", stuckStageConditions);
        }
    }, [
        timeBasedConditions,
        stuckStageConditions,
        conditions,
        form,
        selectedAlertType,
    ]);

    useEffect(() => {
        form.setValue("recipient", recipientConfig);
    }, [recipientConfig, form]);

    const {
        mutateAsync,
        isPending: isMutatePending,
        reset,
    } = useMutation({
        mutationFn: createWorkflowMutation,
        onSuccess: () => {
            router.refresh();
            reset();
            setIsOpen(false);
        },
        onError: (error) => {
            toast.error(
                (error as { message?: string })?.message ??
                    "Failed to submit Workflow",
            );
        },
    });
    // import { db } from "@/server/db"; // Adjust the import to your actual db instance
// import { workflows } from "@/server/db/schema"; // Adjust the import to your actual schema
const [isFormReady, setIsFormReady] = useState(false);

useEffect(() => {
    if (mode === 'edit' && workflowId) {
        setIsFormReady(true);
    }
}, [mode, workflowId]);

useEffect(() => {
    if (isFormReady && mode === 'edit' && workflowId) {
        const fetchWorkflowData = async () => {
            try {
                const data = await getWorkflowById(workflowId);
                console.log('DATA - ',data)
                const formattedData = {
                    name: data.name || "",
                    objectField: data.objectField || "",
                    alertType: data.alertType || "timebased",
                    recipient: data.recipient || "",
                    conditions: data.conditions || [],
                    organizationId: data.organizationId || "",
                    triggerConfig: data.triggerConfig || { apiUrl: "", processor: "" },
                };
                console.log('DAA - ALERT ',data?.alertType)
                form.setValue("id",data.id || "")
                form.setValue("conditions",data.conditions || [])
                form.setValue("createdAt",data.createdAt || "")
                form.setValue("id",data.id || "")
                form.setValue("modifiedAt",data.modifiedAt || "")
                form.setValue("name",data.name || "")
                form.setValue("objectField",data.objectField || "")
                form.setValue("organizationId",data.organizationId || "")
                form.setValue("ownerId",data.ownerId || "")
                form.setValue("recipient",data.recipient || "")
                form.setValue("status",data.status || "ACTIVE")
                form.setValue("alertType",data.alertType || "timebased")
                handleSelectChange(data.objectField || "","","objectField",)
                handleSelectChange("timebased" || "","","alertType",)
                // handleSelectChange(data.alertType || "timebased" || "","","alertType",)
                handleSelectChange(data.recipient || "","","recipient",)
                handleSelectChange(data.conditions || "","","conditions",)
                handleSelectChange(data.organizationId || "","","organizationId",)
                handleSelectChange(data.triggerConfig || "","","triggerConfig",)
                handleRecipientsChange(data.recipient.recipients) // to fill in
                handleCustomMessageBodyChange(data?.recipient?.customMessageBody)
                setSelectedRecipients(data.recipient.recipients)
                setRecipientConfig(data.recipient);
                form.setValue("recipient", data.recipient);
                // handleConditionChange
                // handleOpeningTextChange
            // }
            // onFieldsSelect={handleFieldsSelect}
            // onButtonsChange={handleButtonsChange}
            // onDeliveryOptionChange={
            //     handleDeliveryOptionChange
            // }
            // onRecipientsChange={handleRecipientsChange}
            // onCustomMessageBodyChange={
            //     handleCustomMessageBodyChange
                // reset(formattedData); // Reset form with fetched data
            } catch (error) {
                toast.error("Failed to load workflow data."+error);
            }
        };

        fetchWorkflowData();
    }
}, [isFormReady, mode, workflowId, reset]);


    const [, startAwaitableTransition] = useAwaitableTransition();

    const onSubmit = async () => {
        console.log('on submit')
        try {
            const formData = form.getValues();
            console.log("Form Data before submission:", formData);

            // Combine timeBasedConditions or stuckStageConditions and additional conditions
            const allConditions =
                selectedAlertType === "timebased"
                    ? timeBasedConditions
                        .map((condition) => ({
                            ...condition,
                            field: {
                                value: condition.field.value,
                                label: condition.field.label,
                            },
                        }))
                        .concat(conditions)
                    : stuckStageConditions
                        .map((condition) => ({
                            ...condition,
                            field: {
                                value: condition.field.value,
                                label: condition.field.label,
                            },
                        }))
                        .concat(conditions);

            // Transform and include combined conditions
            const transformedData = {
                ...formData,
                conditions: allConditions,
            };

            if (mode == "edit"){
                //update db
                await updateWorkflowMutation(transformedData)
            }
            else{
                await mutateAsync(transformedData);
            }

            await startAwaitableTransition(() => {
                router.refresh();
            });
            reset();
            setIsOpen(false);
            if (mode == "edit"){
                toast.success("Workflow updated successfully");
                router.push('/workflows')
            }
            else{
                toast.success("Workflow created successfully");
            }
        } catch (error) {
            toast.error(
                (error as { message?: string })?.message ??
                    "Failed to submit Workflow",
            );
        }
    };

    const alertTypeOptions = [
        { value: "timebased", label: "Time-based" },
        { value: "stuck-in-stage", label: "Stuck-in-Stage" },
    ];

    const objectFieldOptions = [
        {
            name: "Activity Feed",
            apiUrl: "https://harvest.greenhouse.io/v1/activity_feed",
        },
        {
            name: "Applications",
            apiUrl: "https://harvest.greenhouse.io/v1/applications",
        },
        {
            name: "Approvals",
            apiUrl: "https://harvest.greenhouse.io/v1/approvals",
        },
        {
            name: "Candidates",
            apiUrl: "https://harvest.greenhouse.io/v1/candidates",
        },
        { name: "Jobs", apiUrl: "https://harvest.greenhouse.io/v1/jobs" },
        { name: "Offers", apiUrl: "https://harvest.greenhouse.io/v1/offers" },
        {
            name: "Scheduled Interviews",
            apiUrl: "https://harvest.greenhouse.io/v1/scheduled_interviews",
        },
        {
            name: "Scorecards",
            apiUrl: "https://harvest.greenhouse.io/v1/scorecards",
        },
    ];

    const timeConditionOptions = [
        { value: "before", label: "Before" },
        { value: "after", label: "After" },
        { value: "same", label: "Same" },
    ];

    const dateFieldOptions: DateFieldOption[] = [
        { label: "Created at", value: "created_at" },
        { label: "Closed at", value: "closed_at" },
        { label: "Last activity", value: "last_activity" },
        { label: "Interview End time", value: "end.date_time" },
    ];

    const conditionTypesWithOperators = [
        {
            name: "Anonymized",
            operators: [{ value: "equal", label: "Equal To" }],
            values: ["True", "False"],
        },
        {
            name: "Coordinator",
            operators: [
                { value: "equal", label: "Equal To" },
                { value: "notEqual", label: "Not Equal To" },
            ],
            values: [],
        },
        {
            name: "Following",
            operators: [{ value: "equal", label: "Equal To" }],
            values: ["True", "False"],
        },
        {
            name: "GDPR Consent Status",
            operators: [
                { value: "equal", label: "Equal To" },
                { value: "notEqual", label: "Not Equal To" },
            ],
            values: ["Granted", "Denied"],
        },
        {
            name: "Last Activity",
            operators: [
                { value: "equal", label: "Equal To" },
                { value: "before", label: "Before" },
                { value: "after", label: "After" },
            ],
            values: [],
        },
        {
            name: "Recruiter",
            operators: [
                { value: "equal", label: "Equal To" },
                { value: "notEqual", label: "Not Equal To" },
            ],
            values: [],
        },
        {
            name: "Tags",
            operators: [{ value: "equal", label: "Equal To" }],
            values: [],
        },
    ];

    const isSameDayOrTimeCondition = (condition: string) =>
        condition === "same";

    return (
        <Dialog open={isOpen || mode == "edit"} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600">
                    Create Workflow
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] min-w-[90vw] overflow-y-auto bg-white dark:bg-gray-800">
                <DialogHeader className="flex flex-row justify-between">
                    <Image
                        src="https://assets-global.website-files.com/6457f112b965721ffc2b0777/653e865d87d06c306e2b5147_Group%201321316944.png"
                        alt="Logo_sinta"
                        width={48}
                        height={48}
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
                                                "",
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
                                {isCandidateSelected && (
                                    <JobsDropdown
                                        onJobSelect={(jobId) =>
                                            handleSelectChange(
                                                jobId,
                                                "",
                                                "jobId",
                                            )
                                        }
                                    />
                                )}
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
                                        handleSelectChange(
                                            value,
                                            "",
                                            "alertType",
                                        )
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
                                                disabled={
                                                    option.value ===
                                                        "stuck-in-stage" &&
                                                    !isCandidateSelected
                                                }
                                            />
                                            <Label
                                                htmlFor={option.value}
                                                className={`flex w-full flex-col items-center justify-center rounded-md border border-gray-300 bg-popover p-4 ${
                                                    selectedAlertType ===
                                                    option.value
                                                        ? "bg-indigo-500 text-white"
                                                        : option.value ===
                                                                "stuck-in-stage" &&
                                                            !isCandidateSelected
                                                          ? "cursor-not-allowed bg-gray-300 text-opacity-50"
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

                        {/* Conditions */}
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
                                {selectedAlertType === "timebased" && (
                                    <div className="mb-4 flex gap-4 rounded-lg border border-gray-300 bg-gray-100 p-4">
                                        <div className="flex-1">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Date Property
                                            </Label>
                                            <Select
                                                onValueChange={(value) =>
                                                    handleConditionChangeTimeBased(
                                                        0,
                                                        "field",
                                                        {
                                                            value,
                                                            label:
                                                                dateFieldOptions.find(
                                                                    (opt) =>
                                                                        opt.value ===
                                                                        value,
                                                                )?.label ??
                                                                value,
                                                        },
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
                                                Operator
                                            </Label>
                                            <Select
                                                onValueChange={(value) =>
                                                    handleConditionChangeTimeBased(
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
                                        {!isSameDayOrTimeCondition(
                                            timeBasedConditions[0]?.condition,
                                        ) && (
                                            <>
                                                <div className="flex-1">
                                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Value
                                                    </Label>
                                                    <Input
                                                        placeholder="Enter Value"
                                                        className="w-full border border-gray-300 bg-white"
                                                        value={
                                                            timeBasedConditions[0]
                                                                ?.value
                                                        }
                                                        onChange={(e) =>
                                                            handleConditionChangeTimeBased(
                                                                0,
                                                                "value",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </>
                                        )}
                                        <div className="flex-1">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Time Unit
                                            </Label>
                                            <Select
                                                value={
                                                    timeBasedConditions[0]
                                                        ?.unit ?? "Days"
                                                }
                                                onValueChange={(value) =>
                                                    handleConditionChangeTimeBased(
                                                        0,
                                                        "unit",
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="w-full border border-gray-300 bg-white">
                                                    <SelectValue placeholder="Select Unit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectItem value="Days">
                                                            Days
                                                        </SelectItem>
                                                        <SelectItem value="Hours">
                                                            Hours
                                                        </SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                                {selectedAlertType === "stuck-in-stage" && (
                                    <div className="mb-4 flex gap-4 rounded-lg border border-gray-300 bg-gray-100 p-4">
                                        <StagesDropdown
                                            jobId={selectedJobId}
                                            onStageSelect={(
                                                stageId,
                                                stageLabel,
                                            ) =>
                                                handleSelectChange(
                                                    stageId,
                                                    stageLabel,
                                                    "stage",
                                                )
                                            }
                                        />
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
                                                    handleConditionChangeStuckStage(
                                                        0,
                                                        "value",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                {conditions.map((condition, index) => (
                                    <div key={index}>
                                        <ConditionComponent
                                            index={index}
                                            condition={condition}
                                            onChange={handleConditionChange}
                                            onRemove={removeCondition}
                                            conditionTypesWithOperators={
                                                conditionTypesWithOperators
                                            }
                                        />
                                        {index < conditions.length - 1 && (
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    margin: "10px 0",
                                                }}
                                            >
                                                AND
                                            </div>
                                        )}
                                    </div>
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
                                    onCustomMessageBodyChange={
                                        handleCustomMessageBodyChange
                                    } // Add this line
                                    selectedRecipients={selectedRecipients}
                                    setSelectedRecipients={setSelectedRecipients}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={isMutatePending}
                                className="bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
                            >
                                {mode == "edit" ? <>Save Workflow</>:<>Submit Workflow</>}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default WorkflowSheet;
