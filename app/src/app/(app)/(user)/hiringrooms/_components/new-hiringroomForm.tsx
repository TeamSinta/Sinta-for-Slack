/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

// @ts-nocheck

"use client";

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
import { createHiringroomMutation } from "@/server/actions/hiringrooms/mutations";
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
import SlackHiringroom from "./slack-hiringroom";
import ConditionComponent from "./conditions";
import {
    fetchJobsFromGreenhouse,
    fetchAllGreenhouseJobsFromGreenhouse,
    fetchAllGreenhouseUsers,
    fetchCandidates,
} from "@/server/greenhouse/core";
import StagesDropdown from "./stages-dropdown";
import SlackChannelNameFormat from "./SlackChannelNameFormat";
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

export const hiringroomFormSchema = z.object({
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

const createFeedbackFormSchema = hiringroomFormSchema.omit({
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

function CreateHiringroomSheet() {
    const [, setCoordinators] = useState([]);
    const [, setRecruiters] = useState([]);
    const [, setJobNames] = useState([]);

    const [format, setFormat] = useState(
        "intw-{{CANDIDATE_NAME}}-{{CANDIDATE_CREATION_MONTH_TEXT_ABBREVIATED}}-{{CANDIDATE_CREATION_DAY_NUMBER}}",
    );

    const [conditionTypesWithOperators, setConditionTypesWithOperators] =
        useState([
            {
                name: "Coordinator",
                operators: [
                    { value: "equal", label: "Equal To" },
                    { value: "notEqual", label: "Not Equal To" },
                ],
                values: [], // Assuming values are dynamic or not predefined
            },
            {
                name: "Recruiter",
                operators: [
                    { value: "equal", label: "Equal To" },
                    { value: "notEqual", label: "Not Equal To" },
                ],
                values: [], // Assuming values are dynamic or not predefined
            },
            {
                name: "Job Name",
                operators: [
                    { value: "equal", label: "Equal To" },
                    { value: "notEqual", label: "Not Equal To" },
                ],
                values: [], // Assuming values are dynamic or not predefined
            },
            // {
            //     name: "Tags",
            //     operators: [{ value: "equal", label: "Equal To" }],
            //     values: [], // Assuming values are dynamic or not predefined
            // }
        ]) as any[];

    useEffect(() => {
        const fetchData = async () => {
            const greenhouseUsers = await fetchAllGreenhouseUsers();
            const greenhouseJobs = await fetchAllGreenhouseJobsFromGreenhouse();
            const greenhouseCandidates = await fetchCandidates();
            const coords = getAllCoordinators(
                greenhouseUsers,
                greenhouseJobs,
                greenhouseCandidates,
            );
            const recrus = getAllRecruiters(
                greenhouseUsers,
                greenhouseJobs,
                greenhouseCandidates,
            );
            setCoordinators(coords);
            setRecruiters(recrus);
            setJobNames(greenhouseJobs);
            const tmpConditionTypesWithOperators = conditionTypesWithOperators;

            const coordinatorsList = coords.map(
                (coordinator) => coordinator.name,
            );
            const recruitersList = recrus.map((recruiter) => recruiter.name);
            const jobNamesList = greenhouseJobs.map((jobName) => jobName.name);
            tmpConditionTypesWithOperators[0].values = coordinatorsList;
            //recruiter
            tmpConditionTypesWithOperators[1].values = recruitersList;
            tmpConditionTypesWithOperators[2].values = jobNamesList;

            setConditionTypesWithOperators(tmpConditionTypesWithOperators);
        };
        fetchData();
    }, []);

    function getAllCoordinators(
        users: GreenhouseUser[],
        jobs: GreenhouseJob[],
        candidates: GreenhouseCandidate[],
    ) {
        // Get all coordinators from jobs
        const coordinatorSet = new Set<string>();
        jobs.forEach((job) => {
            if (job.coordinator_ids) {
                job.coordinator_ids.forEach((id) => coordinatorSet.add(id));
            }
        });

        // Get all coordinators from candidates
        candidates.forEach((candidate) => {
            if (candidate.coordinator) {
                coordinatorSet.add(candidate.coordinator.id);
            }
        });

        // Create list of coordinators
        const coordinators = users.filter((user) =>
            coordinatorSet.has(user.id),
        );

        return coordinators;
    }
    function getAllRecruiters(
        users: GreenhouseUser[],
        jobs: GreenhouseJob[],
        candidates: GreenhouseCandidate[],
    ) {
        // Get all coordinators from jobs
        const recruiterSet = new Set<string>();
        jobs.forEach((job) => {
            if (job.recruiter_ids) {
                job.recruiter_ids.forEach((id) => recruiterSet.add(id));
            }
        });

        // Get all coordinators from candidates
        candidates.forEach((candidate) => {
            if (candidate.recruiter) {
                recruiterSet.add(candidate.recruiter.id);
            }
        });

        // Create list of coordinators
        const recruiters = users.filter((user) => recruiterSet.has(user.id));

        return recruiters;
    }
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
    const handleFormatChange = (slackFormatString: string) => {
        setFormat(slackFormatString);
        form.setValue("slackChannelFormat", [
            ...stuckStageConditions,
            ...newConditions,
        ]);
    };
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
        slackChannelFormat: string;
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
            slackChannelFormat: format,
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
        mutationFn: createHiringroomMutation,
        onSuccess: async (hiringroomValue) => {
            // handleIndividualHiringroom(hiringroomValue) // to build

            // call endpoint that calls handle indiviual hiring room backend

            try {
                const response = await fetch("/api/hiringroom", {
                    // const response = await fetch("https://slack.com/api/conversations.create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        // Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(hiringroomValue),
                });

                const data = await response.json();
                if (!data.ok) {
                    throw new Error(`Error creating channel: ${data.error}`);
                }

                console.log("Channel created successfully:");
                // console.log('Channel created successfully:', data);
                return data.channel.id; // Return the channel ID for further use
            } catch (error) {
                console.error("Error creating Slack channel route:", error);
            }

            // router.refresh();
            // reset();
            // setIsOpen(false);
        },
        onError: (error) => {
            toast.error(
                (error as { message?: string })?.message ??
                    "Failed to submit Hiringroom",
            );
        },
    });

    const [, startAwaitableTransition] = useAwaitableTransition();

    const onSubmit = async () => {
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

            await mutateAsync(transformedData);
            await startAwaitableTransition(() => {
                router.refresh();
            });
            reset();
            setIsOpen(false);
            toast.success("Hiringroom created successfully");
        } catch (error) {
            toast.error(
                (error as { message?: string })?.message ??
                    "Failed to submit Hiringroom",
            );
        }
    };

    const alertTypeOptions = [
        { value: "timebased", label: "Time-based" },
        { value: "stuck-in-stage", label: "Stuck-in-Stage" },
    ];

    const objectFieldOptions = [
        // {
        //     name: "Activity Feed",
        //     apiUrl: "https://harvest.greenhouse.io/v1/activity_feed",
        // }, // Verify if correct
        // {
        //     name: "Applications",
        //     apiUrl: "https://harvest.greenhouse.io/v1/applications",
        // },
        // {
        //     name: "Approvals",
        //     apiUrl: "https://harvest.greenhouse.io/v1/approvals",
        // }, // Verify if correct
        {
            name: "Candidates",
            apiUrl: "https://harvest.greenhouse.io/v1/candidates",
        },

        { name: "Jobs", apiUrl: "https://harvest.greenhouse.io/v1/jobs" },
        // { name: "Offers", apiUrl: "https://harvest.greenhouse.io/v1/offers" },
        // {
        //     name: "Scheduled Interviews",
        //     apiUrl: "https://harvest.greenhouse.io/v1/scheduled_interviews",
        // },
        // {
        //     name: "Scorecards",
        //     apiUrl: "https://harvest.greenhouse.io/v1/scorecards",
        // },
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
    const handleTypeChange = (value: string) => {
        if (value.toLowerCase().includes("candidate")) {
            setFormat(
                "intw-{{CANDIDATE_NAME}}-{{CANDIDATE_CREATION_MONTH_TEXT_ABBREVIATED}}-{{CANDIDATE_CREATION_DAY_NUMBER}}",
            );
        } else if (value.toLowerCase().includes("job")) {
            setFormat("job-{{JOB_NAME}}-{{JOB_POST_DATE}}");
        }
    };

    const isSameDayOrTimeCondition = (condition: string) =>
        condition === "same";

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600">
                    Create Hiring Room
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[95vh] min-w-[95vw] overflow-y-auto bg-white dark:bg-gray-800">
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
                            Create Hiring Room
                        </h2>
                        <DialogDescription className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Get started by filling in the basics.
                        </DialogDescription>
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-gray-500 dark:text-gray-400"></DialogDescription>
                </DialogHeader>

                <div className="space-y-8 px-8 py-6">
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        {/* General Settings Section */}
                        <div className="flex gap-10">
                            <div className="w-1/3">
                                <Label className="text-xl font-semibold text-gray-800 dark:text-gray-300">
                                    General
                                </Label>
                                <p className="mt-2 text-sm text-gray-500">
                                    Configure the general settings of the hiring
                                    room.
                                </p>
                            </div>
                            <div className="flex-1 space-y-6">
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
                                        className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 dark:border-gray-600"
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
                                        onValueChange={(value) => {
                                            handleSelectChange(
                                                value,
                                                "",
                                                "objectField",
                                            );
                                            handleTypeChange(value);
                                        }}
                                    >
                                        <SelectTrigger className="w-full rounded-lg border-gray-300 shadow-sm">
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

                        <hr className="border-gray-300 dark:border-gray-700" />

                        {/* Alert Type Section */}
                        <div className="flex gap-10">
                            <div className="w-1/3">
                                <Label className="text-xl font-semibold text-gray-800 dark:text-gray-300">
                                    Alert Type
                                </Label>
                                <p className="mt-2 text-sm text-gray-500">
                                    Select the type of alert for this hiring
                                    room.
                                </p>
                            </div>
                            <div className="flex-1 space-y-6">
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
                                    className="flex flex-wrap gap-4"
                                >
                                    {alertTypeOptions.map((option) => (
                                        <div
                                            key={option.value}
                                            className={`flex-1 rounded-lg border p-4 shadow-sm transition ${
                                                selectedAlertType ===
                                                option.value
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                        >
                                            <RadioGroupItem
                                                value={option.value}
                                                id={option.value}
                                                className="hidden"
                                                disabled={
                                                    option.value ===
                                                        "stuck-in-stage" &&
                                                    !isCandidateSelected
                                                }
                                            />
                                            <Label
                                                htmlFor={option.value}
                                                className="text-center"
                                            >
                                                {option.label}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        </div>

                        <hr className="border-gray-300 dark:border-gray-700" />

                        {/* Conditions Section */}
                        <div className="flex gap-10">
                            <div className="w-1/3">
                                <Label className="text-xl font-semibold text-gray-800 dark:text-gray-300">
                                    Conditions
                                </Label>
                                <p className="mt-2 text-sm text-gray-500">
                                    Specify conditions for triggering the hiring
                                    room.
                                </p>
                            </div>
                            <div className="flex-1 space-y-6">
                                {/* Time-Based Conditions */}
                                {selectedAlertType === "timebased" && (
                                    <div className="space-y-4 rounded-lg border border-gray-300 bg-gray-50 p-4">
                                        <div className="flex gap-6">
                                            <div className="w-1/2">
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
                                                    <SelectTrigger className="w-full rounded-lg border-gray-300">
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

                                            <div className="w-1/2">
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
                                                    <SelectTrigger className="w-full rounded-lg border-gray-300">
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
                                        </div>

                                        <div className="flex gap-6">
                                            <div className="w-1/2">
                                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Value
                                                </Label>
                                                <Input
                                                    placeholder="Enter Value"
                                                    className="w-full rounded-lg border-gray-300"
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
                                            <div className="w-1/2">
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
                                                    <SelectTrigger className="w-full rounded-lg border-gray-300">
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
                                    </div>
                                )}

                                {/* Stuck-in-Stage Conditions */}
                                {selectedAlertType === "stuck-in-stage" && (
                                    <div className="space-y-4 rounded-lg border border-gray-300 bg-gray-50 p-4">
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
                                        <div className="flex items-center gap-6">
                                            <h1 className="text-gray-700 dark:text-gray-300">
                                                For
                                            </h1>
                                            <div className="w-1/2">
                                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Days
                                                </Label>
                                                <Input
                                                    placeholder="Enter Days"
                                                    className="w-full rounded-lg border-gray-300"
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
                                    </div>
                                )}

                                {/* Additional Conditions */}
                                {conditions.map((condition, index) => (
                                    <div key={index} className="space-y-4">
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
                                            <div className="text-center font-medium text-gray-600">
                                                AND
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Add Condition Button */}
                                <Button
                                    variant="outline"
                                    className="w-full rounded-lg border-blue-600 text-blue-600 hover:bg-blue-50"
                                    onClick={addCondition}
                                    type="button"
                                >
                                    + Add Condition
                                </Button>
                            </div>
                        </div>

                        <hr className="border-gray-300 dark:border-gray-700" />

                        {/* Slack Channel Format Section */}
                        <div className="flex gap-10">
                            <div className="w-1/3">
                                <Label className="text-xl font-semibold text-gray-800 dark:text-gray-300">
                                    Slack Channel Format
                                </Label>
                                <p className="mt-2 text-sm text-gray-500">
                                    Specify the format of the Slack channel name
                                    for the hiring room.
                                </p>
                            </div>
                            <div className="flex-1">
                                <SlackChannelNameFormat
                                    format={format}
                                    setFormat={setFormat}
                                    selectedType={selectedValue}
                                />
                            </div>
                        </div>

                        <hr className="border-gray-300 dark:border-gray-700" />

                        {/* Recipient Section */}
                        <div className="flex gap-10">
                            <div className="w-1/3">
                                <Label className="text-xl font-semibold text-gray-800 dark:text-gray-300">
                                    Recipient
                                </Label>
                                <p className="mt-2 text-sm text-gray-500">
                                    Specify the recipient of the alert.
                                </p>
                            </div>
                            <div className="flex-1">
                                <SlackHiringroom
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
                                    }
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6">
                            <Button
                                type="submit"
                                disabled={isMutatePending}
                                className="rounded-lg bg-blue-600 px-6 py-3 text-white shadow-md hover:bg-blue-700"
                            >
                                Submit Hiring Room
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default CreateHiringroomSheet;
