/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

// @ts-nocheck

"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import SlackHiringroom from "../../_components/slack-hiringroom";
import ConditionComponent from "../../_components/conditions";
import {
    fetchJobsFromGreenhouse,
    fetchAllGreenhouseJobsFromGreenhouse,
    fetchAllGreenhouseUsers,
    fetchCandidates,
} from "@/server/greenhouse/core";
import SlackChannelNameFormat from "../../_components/SlackChannelNameFormat";
import { toast } from "sonner";
import { motion } from "framer-motion";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle } from "lucide-react";
import TriggerActionsComponent from "../../_components/trigger-actions";
import { Condition, hiringroomFormSchema, TimeBasedCondition } from "../../_components/new-hiringroomForm";


const createFeedbackFormSchema = hiringroomFormSchema.omit({
    status: true,
    recipient: true,
    triggerConfig: true,
});


interface DateFieldOption {
    value: string;
    label: string;
}

interface Job {
    id: number;
    name: string;
}


function HiringroomFormPage() {
    // State and logic related to fetching data, form state, conditions, etc.
    const [, setCoordinators] = useState([]);
    const [, setRecruiters] = useState([]);
    const [, setJobNames] = useState([]);
    const [completedTabs, setCompletedTabs] = useState({
        general: false,
        alertType: false,
        conditions: false,
        slackFormat: false,
        recipient: false,
    });

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
        console.log("go bucks in use effect fetch all suers");
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
            console.log(
                "tmpConditionTypesWithOperators ",
                tmpConditionTypesWithOperators,
            );
            console.log("jobNamesList ", jobNamesList);
            setConditionTypesWithOperators(tmpConditionTypesWithOperators);
            console.log(
                "conditionTypesWithOperators ",
                conditionTypesWithOperators,
            );
            console.log(
                "tmpConditionTypesWithOperators ",
                tmpConditionTypesWithOperators,
            );
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
            console.log("hiringroomvalue - ", hiringroomValue);
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
        {
            name: "Candidates",
            description: "Create Slack rooms for specific candidates.",
            apiUrl: "https://harvest.greenhouse.io/v1/candidates",
        },
        {
            name: "Jobs",
            description: "Create Slack rooms for specific roles.",
            apiUrl: "https://harvest.greenhouse.io/v1/jobs",
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
    const handleTypeChange = (value: string) => {
        if (value.toLowerCase().includes("candidate")) {
            setFormat(
                "intw-{{CANDIDATE_NAME}}-{{CANDIDATE_CREATION_MONTH_TEXT_ABBREVIATED}}-{{CANDIDATE_CREATION_DAY_NUMBER}}",
            );
        } else if (value.toLowerCase().includes("job")) {
            setFormat("job-{{JOB_NAME}}-{{JOB_POST_DATE}}");
        }
    };

    return (
        <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="relative min-h-screen min-w-[74vw] bg-slate-50"
        >
            {/* Sidebar Border */}
            <div className="absolute left-0 top-0 h-full w-[2px] bg-gray-300"></div>

            {/* Main Content */}
            <div className="mb-6 ml-[1px] flex  justify-between overflow-y-scroll p-6">
                {/* Left Side: Cards and Form */}
                <div className="w-2/3">
                    {/* Header */}
                    <header className="pb-4">
                        <div className="flex items-center gap-2 font-heading text-3xl font-semibold">
                            <span>Hire Room</span>
                            <span className="text-gray-400"> &gt; </span>
                            <span className="text-gray-400">New Room</span>
                            <span className="ml-2 inline-block rounded bg-yellow-100 px-2 py-1 text-sm  font-medium">
                                Draft
                            </span>
                        </div>
                    </header>

                    {/* Tabs Structure */}
                    <Tabs defaultValue="trigger" className="space-y-4">
                        {/* Tabs List with Reduced Width */}
                        <TabsList className="mt-2 flex w-1/2 gap-4 rounded-sm bg-slate-200 shadow">
                            <TabsTrigger
                                value="trigger"
                                className="flex w-full items-center gap-2 rounded-sm"
                            >
                                <CheckCircle
                                    className={`h-5 w-5 ${completedTabs.trigger ? "text-green-500" : "text-gray-400"}`}
                                />
                                Setup
                            </TabsTrigger>
                            <TabsTrigger
                                value="slack"
                                className="flex w-full items-center gap-2 rounded-sm"
                            >
                                <CheckCircle
                                    className={`h-5 w-5 ${completedTabs.slack ? "text-green-500" : "text-gray-400"}`}
                                />
                                Customization
                            </TabsTrigger>
                        </TabsList>
                        <div className="my mb-4 border-t border-gray-300"></div>

                        {/* Remaining Content (Forms, Conditions, etc.) */}
                        <TabsContent value="trigger">
                            <form
                                id="hiring-room-form"
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                {/* General Settings Section */}
                                <Card className="rounded-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-semibold text-gray-700">
                                            General
                                        </CardTitle>
                                        <CardDescription className="mt-1 text-sm text-gray-600">
                                            Configure the general settings of
                                            the hiring room.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label
                                                htmlFor="name"
                                                className="text-sm font-medium text-gray-700"
                                            >
                                                Name
                                            </Label>
                                            <Input
                                                {...form.register("name")}
                                                placeholder="Enter name"
                                                className="mt-1 h-12 w-full rounded-sm border-gray-300 text-base shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                            />
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor="objectField"
                                                className="text-sm font-medium text-gray-700"
                                            >
                                                Select Slack Channel Type
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
                                                <SelectTrigger className="mt-1 h-12 w-full rounded-sm border-gray-300 text-base shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
                                                    <SelectValue placeholder="Select Room Type" />
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
                                                                    <p className="text-base">
                                                                        {
                                                                            option.name
                                                                        }
                                                                    </p>
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Conditions Section */}
                                <Card className="rounded-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-semibold text-gray-800">
                                            Conditions
                                        </CardTitle>
                                        <CardDescription className="mt-2 text-sm text-gray-600">
                                            Specify conditions for triggering
                                            the hiring room.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {selectedAlertType === "timebased" && (
                                            <div className="rounded-lg bg-gray-50 p-4">
                                                <div className="space-y-4">
                                                    <div className="flex gap-6">
                                                        <div className="w-1/2">
                                                            <Label className="text-sm font-medium text-gray-700">
                                                                Date Property
                                                            </Label>
                                                            <Select
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
                                                                    handleConditionChangeTimeBased(
                                                                        0,
                                                                        "field",
                                                                        {
                                                                            value,
                                                                            label:
                                                                                dateFieldOptions.find(
                                                                                    (
                                                                                        opt,
                                                                                    ) =>
                                                                                        opt.value ===
                                                                                        value,
                                                                                )
                                                                                    ?.label ??
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
                                                                            (
                                                                                option,
                                                                            ) => (
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
                                                            <Label className="text-sm font-medium text-gray-700">
                                                                Operator
                                                            </Label>
                                                            <Select
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
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
                                                                            (
                                                                                option,
                                                                            ) => (
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
                                                            <Label className="text-sm font-medium text-gray-700">
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
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div className="w-1/2">
                                                            <Label className="text-sm font-medium text-gray-700">
                                                                Time Unit
                                                            </Label>
                                                            <Select
                                                                value={
                                                                    timeBasedConditions[0]
                                                                        ?.unit ??
                                                                    "Days"
                                                                }
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
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
                                            </div>
                                        )}

                                        {conditions.map((condition, index) => (
                                            <div
                                                key={index}
                                                className="space-y-4"
                                            >
                                                <ConditionComponent
                                                    index={index}
                                                    condition={condition}
                                                    onChange={
                                                        handleConditionChange
                                                    }
                                                    onRemove={removeCondition}
                                                    conditionTypesWithOperators={
                                                        conditionTypesWithOperators
                                                    }
                                                />
                                                {index <
                                                    conditions.length - 1 && (
                                                    <div className="text-center font-medium text-gray-600">
                                                        AND
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        <Button
                                            variant="outline"
                                            className="w-full rounded-lg border-blue-600 text-blue-600 hover:bg-blue-50"
                                            onClick={addCondition}
                                            type="button"
                                        >
                                            + Add Condition
                                        </Button>
                                    </CardContent>
                                </Card>

                                <TriggerActionsComponent />
                            </form>
                        </TabsContent>

                        {/* Slack Tab */}
                        <TabsContent value="slack">
                            <form
                                id="hiring-room-form"
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                {/* Slack Channel Format Section */}
                                <Card className="rounded-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-semibold text-gray-700">
                                            Slack Channel Format
                                        </CardTitle>
                                        <CardDescription className="mt-1 text-sm text-gray-600">
                                            Specify the format of the Slack
                                            channel name for the hiring room.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <SlackChannelNameFormat
                                            format={format}
                                            setFormat={setFormat}
                                            selectedType={selectedValue}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Recipient Section */}
                                <Card className="rounded-sm">
                                    <CardContent className="space-y-4">
                                        <SlackHiringroom
                                            onOpeningTextChange={
                                                handleOpeningTextChange
                                            }
                                            onFieldsSelect={handleFieldsSelect}
                                            onButtonsChange={
                                                handleButtonsChange
                                            }
                                            onDeliveryOptionChange={
                                                handleDeliveryOptionChange
                                            }
                                            onRecipientsChange={
                                                handleRecipientsChange
                                            }
                                            onCustomMessageBodyChange={
                                                handleCustomMessageBodyChange
                                            }
                                        />
                                    </CardContent>
                                </Card>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Side: Help/Info Text */}
                <div className="mt-32 w-1/3 pl-8">
                    <div className="rounded-sm bg-white p-4 shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700">
                            Helpful Tips
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Hiring Rooms are Slack channels dedicated to
                            managing the hiring process. By configuring the
                            right team and automating actions, you can
                            streamline communication and collaboration.
                        </p>
                        <ul className="mt-4 list-inside list-disc text-sm text-gray-600">
                            <li>
                                Add key team members like recruiters,
                                interviewers, and hiring managers.
                            </li>
                            <li>
                                Set up automated notifications for candidate
                                updates and interview reminders.
                            </li>
                            <li>
                                Define specific triggers to auto-archive
                                channels based on candidate stages.
                            </li>
                            <li>
                                Customize workflows to notify the right people
                                at the right time.
                            </li>
                        </ul>
                        <a
                            href="#"
                            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
                        >
                            Learn more about automating hiring rooms
                        </a>
                    </div>
                </div>
            </div>

            {/* Hover Bottom Bar */}
            <motion.div
                initial={{ y: 100, opacity: 0 }} // Start below the screen with no opacity
                animate={{ y: 0, opacity: 1 }} // Slide up to its final position and fade in
                exit={{ y: 100, opacity: 0 }} // Slide back down and fade out when exiting
                transition={{
                    type: "tween",
                    duration: 3,
                    ease: "easeInOut", // Smooth easing for a natural slide effect
                }}
                className="fixed bottom-0 right-0 z-50 mb-4 mr-4" // Ensure it's fixed at the bottom with a higher z-index
            >
                <motion.div
                    whileHover={{ scale: 1.05, transition: { duration: 0.3 } }} // Slight scale effect on hover
                    className="rounded bg-gray-900 p-3 text-white shadow-xl transition-all ease-in-out hover:bg-gray-800"
                >
                    <div className="flex items-center gap-2 px-4">
                        <p className="text-sm">Unsaved changes</p>
                        <Button
                            variant="outline"
                            className="rounded  border-gray-500  bg-gray-500 text-white  hover:bg-gray-400"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="secondary"
                            className="rounded bg-white text-black transition-colors hover:bg-gray-400"
                        >
                            Save Draft
                        </Button>
                        <Button className="rounded rounded-md bg-indigo-500 px-4  py-2 text-white shadow-lg transition-colors hover:bg-indigo-600">
                            Publish
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

export default HiringroomFormPage;
