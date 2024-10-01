//@ts-nocheck

import React, { useState, useEffect, useCallback } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Clock, PlugZap } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import greenhouseLogo from "../../../../../../../public/greenhouseLogo.png";
import { Separator } from "@/components/ui/separator";
import JobsDropdown from "../../_components/job-select";
import { customFetchTester } from "@/utils/fetch";
import TestResult from "./testResults";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import GenericDropdown from "../../_components/generic-dropdown";
import GenericInput from "../../_components/generic-input";

import { fetchStagesForJob } from "@/server/greenhouse/core";
import { cleanObject } from "@/lib/utils";

const localStorageKey = "workflowTriggers";

const saveTriggerData = (data) => {
    localStorage.setItem(localStorageKey, JSON.stringify(data));
};

const getTriggerData = () => {
    return JSON.parse(localStorage.getItem(localStorageKey)) || {};
};

const fetchers = {
    stage: async (jobId) => await fetchStagesForJob(jobId),
    // candidates: async () => await fetchCandidates(),
    time: async () =>
        await [
            { id: "before", name: "Before" },
            { id: "after", name: "After" },
        ],
};

const TriggersComponent = ({ onSaveTrigger }) => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);

    const [selectedEventData, setSelectedEventData] = useState({});
    const [activeTab, setActiveTab] = useState("event");
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [showFullData, setShowFullData] = useState(false);
    const [pollingInterval, setPollingInterval] = useState("");
    const [pollingTimeUnit, setPollingTimeUnit] = useState("minutes");
    const handleFieldChange = (fieldKey, value) => {
        setSelectedEventData((prev) => ({
            ...prev,
            [fieldKey]: value,
        }));
    };

    const events = [
        {
            title: "Interview Scheduled",
            description: "Triggered when an interview is scheduled.",
            apiUrl: "https://harvest.greenhouse.io/v1/scheduled_interviews",
            objectField: "Scheduled Interviews",
            alertType: "Create/Update",
            triggers: [
                "Notify Interviewers",
                "Prepare Interview Kit",
                "Schedule Reminder",
            ],
        },
        {
            title: "Offer Request Created ",
            description:
                "Triggered when an approval request is sent for a job offer for a candidate.",
            objectField: "Approvals",
            apiUrl: "https://harvest.greenhouse.io/v1/approvals",
            alertType: "Create/Update",
            triggers: [
                "Send Approval Request",
                "Notify Approvers in Slack",
                "Track Approval Status",
            ],
        },
        {
            title: "Candidates",
            description: "Triggered for working with Candidates Object",
            objectField: "Candidates",
            apiUrl: ["https://harvest.greenhouse.io/v1/candidates"],
            alertType: "timebased",
            triggers: [
                "Send Referral SLA Reminder to Recruiter",
                "Send Active Candidates Reminder to Recruiter",
                "Notify Recruiter via Slack",
                "Take Action on Active Candidates in Closed Roles",
            ],
        },
        {
            title: "Stuck in Pipeline",
            objectField: "Candidates",
            description: "Triggered when a candidate is stuck in a stage.",
            apiUrl: "https://harvest.greenhouse.io/v1/candidates",
            alertType: "stuck-in-stage",
            triggers: [],
            fields: [
                {
                    label: "Stage",
                    value: "stage",
                    type: "dropdown",
                },
                {
                    label: "Days",
                    value: "days",
                    type: "input",
                    suffix: "days",
                    dataType: "number",
                },
            ],
        },
        {
            title: "Interview Reminders",
            objectField: "Interviews",
            description:
                "Triggered a specified time before or after an interview.",
            apiUrl: "https://harvest.greenhouse.io/v1/scheduled_interviews",
            alertType: "timebased",
            triggers: [
                "Send a Reminder Before an Interview",
                "Send a Reminder After an  Interview",
            ],
            fields: [
                {
                    label: "Time",
                    caption:
                        "Trigger this event before or after the interview.",
                    value: "time",
                    type: "dropdown",
                },
                {
                    label: "Days",
                    value: "days",
                    type: "input",
                    suffix: "days",
                    dataType: "number",
                },
                {
                    label: "Hours",
                    value: "hours",
                    type: "input",
                    suffix: "hours",
                    dataType: "number",
                },
            ],
        },
        // Add more events as needed and update setSelectedEventData to handle the new fields
    ];

    useEffect(() => {
        const workflowData = getTriggerData();
        console.log(workflowData);
        if (workflowData && Object.keys(workflowData).length > 0) {
            const matchedEvent = events.find(
                (event) =>
                    event.objectField === workflowData.objectField &&
                    event.alertType === workflowData.alertType,
            );
            setSelectedEvent(matchedEvent || null); // If no match, set to null
            setSelectedJob(
                (workflowData.triggerConfig?.processor as string) ?? null,
            );
            setSelectedEventData((prevState) => ({
                ...workflowData?.mainCondition,
            }));
        } else {
            setSelectedEvent(null); // Set to null if no workflowData
        }
    }, []);

    const handleEventChange = (eventTitle) => {
        const selected = events.find((event) => event.title === eventTitle);
        setSelectedEvent(selected);
        setSelectedJob(null);
        setSelectedEventData({});
    };

    const handleJobChange = (jobId: string) => {
        setSelectedJob(jobId);
        setSelectedEventData({});
    };

    const handleContinue = () => {
        if (activeTab === "event") {
            setActiveTab("trigger");
        } else if (activeTab === "trigger") {
            setActiveTab("test");
        } else if (activeTab === "test") {
            handleSave();
        }
    };

    const handlePollingIntervalChange = (e) => {
        setPollingInterval(e.target.value);
    };

    const handleSave = () => {
        if (selectedEvent) {
            let triggerDescription = `${selectedEvent.title}`;
            if (
                selectedEvent.title === "Stuck in Pipeline" &&
                selectedJob &&
                selectedEventData.stageLabel
            ) {
                triggerDescription += ` for ${selectedJob} in ${selectedEventData.stageLabel}`;
            }

            const triggerData = {
                event: selectedEvent.title,
                apiUrl: selectedEvent.apiUrl,
                objectField: selectedEvent.objectField,
                alertType: selectedEvent.alertType,
                pollingInterval,
                pollingTimeUnit,
                description: triggerDescription,
                triggerConfig: {
                    processor: selectedJob,
                    apiUrl: selectedEvent.apiUrl,
                },
                processor: selectedJob,
                mainCondition: cleanObject(selectedEventData),
            };
            saveTriggerData(triggerData);
            onSaveTrigger(triggerData);
        }
    };

    const handleTest = async () => {
        setIsTesting(true);
        setTestResult(null);
        setShowFullData(false);

        try {
            const response = await customFetchTester(selectedEvent.apiUrl);

            if (response.status !== 200) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            setTestResult({
                success: true,
                status: response.status,
                message: `Status Code: ${response.status}`,
                data: response.data.length ? response.data[0] : response.data,
            });
        } catch (error) {
            setTestResult({
                success: false,
                status: error.message.includes("HTTP error!")
                    ? "N/A"
                    : `Status: ${error.response?.status || "N/A"}`,
                message: error.message.includes("HTTP error!")
                    ? error.message
                    : `Error: ${error.message}`,
                data: error.response?.data
                    ? Array.isArray(error.response.data)
                        ? error.response.data[0]
                        : error.response.data
                    : null,
            });
        } finally {
            setIsTesting(false);
        }
    };

    const previewData = testResult?.data
        ? JSON.stringify(testResult.data, null, 2)
        : null;

    const getTabIcon = (tab) => {
        const iconSize = 16;

        if (tab === "event") {
            return selectedEvent ? (
                <CheckCircle className="text-green-500" size={iconSize} />
            ) : (
                <AlertTriangle className="text-gray-500" size={iconSize} />
            );
        }
        if (tab === "trigger") {
            if (!selectedEvent)
                return <Clock className="text-gray-300" size={iconSize} />;
            return selectedEventData.stageId && selectedEventData.days ? (
                <CheckCircle className="text-green-500" size={iconSize} />
            ) : (
                <AlertTriangle className="text-gray-500" size={iconSize} />
            );
        }
        if (tab === "test") {
            return <Clock className="text-gray-300" size={iconSize} />;
        }
    };

    const isTimeBasedEventSelected =
        selectedEvent &&
        (selectedEvent.alertType === "timebased" ||
            selectedEvent.alertType === "stuck-in-stage");

    return (
        <div className="conditions-sidebar flex h-full flex-col justify-between p-2">
            <div>
                <div className="pt-2">
                    <div className="mb-4 flex items-center">
                        <div className="mb-2 flex items-center">
                            <Image
                                src={greenhouseLogo}
                                alt="slack-logo"
                                width={40}
                                height={40}
                                className="mx-2"
                            />
                            <h2 className="text-xl font-semibold">Trigger</h2>
                        </div>
                    </div>
                </div>
                <p className="text-sm text-gray-500">
                    Set up the events and conditions that will trigger specific
                    actions.
                </p>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full pt-3"
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger
                            value="event"
                            className="flex items-center space-x-2"
                        >
                            <span>Event</span>
                            {getTabIcon("event")}
                        </TabsTrigger>
                        <TabsTrigger
                            value="trigger"
                            disabled={!selectedEvent}
                            className="flex items-center space-x-2"
                        >
                            <span>Trigger</span>
                            {getTabIcon("trigger")}
                        </TabsTrigger>
                        <TabsTrigger
                            value="test"
                            disabled={
                                !selectedEvent ||
                                selectedEvent?.fields?.some(
                                    (field) => !selectedEventData[field.value],
                                )
                            }
                            className="flex items-center space-x-2"
                        >
                            <span>Test</span>
                            {getTabIcon("test")}
                        </TabsTrigger>
                    </TabsList>

                    {/* Event Tab */}
                    <TabsContent value="event" className="mt-4 py-1">
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle>Select Event</CardTitle>
                                <CardDescription>
                                    Choose an event that will interact with the
                                    Greenhouse API.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedEvent && (
                                    <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
                                        <div className="flex items-center space-x-2">
                                            <PlugZap />
                                            <h3 className="text-lg font-semibold">
                                                {selectedEvent.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {selectedEvent.description}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            API URL: {selectedEvent.apiUrl}
                                        </p>
                                    </div>
                                )}

                                {/* Combined Select for Real-Time and Time-Based Events */}
                                <Select
                                    onValueChange={handleEventChange}
                                    value={
                                        selectedEvent?.title ||
                                        "Choose an event"
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue>
                                            {selectedEvent
                                                ? selectedEvent.title
                                                : "Choose an event"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="space-y-2 rounded-sm p-2">
                                        {/* Real-Time Events Sub-Title */}
                                        <div className="px-2 py-1 text-xs font-semibold uppercase text-gray-500">
                                            Real-Time Events
                                        </div>
                                        {events
                                            .filter(
                                                (event) =>
                                                    event.alertType ===
                                                    "Create/Update",
                                            )
                                            .map((event) => (
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

                                        {/* Divider */}
                                        <div className="my-2 border-t border-gray-300"></div>

                                        {/* Time-Based Events Sub-Title */}
                                        <div className="px-2 py-1 text-xs font-semibold uppercase text-gray-500">
                                            Time-Based Events
                                        </div>
                                        {events
                                            .filter(
                                                (event) =>
                                                    event.alertType !=
                                                    "Create/Update",
                                            )
                                            .map((event) => (
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
                            </CardContent>
                        </Card>
                        {/* Conditionally render the polling interval input if the event is time-based */}
                        {isTimeBasedEventSelected && (
                            <Card className="mt-6 border border-gray-300 bg-gray-50 shadow-lg">
                                <CardHeader className="rounded-t-lg bg-gray-100 p-4">
                                    <CardTitle>Polling Interval</CardTitle>
                                    <CardDescription>
                                        Set the interval for how often this
                                        event should check for updates.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <div className="space-y-4">
                                        <Label>Polling Interval</Label>
                                        <div className="flex space-x-4">
                                            <Input
                                                type="number"
                                                placeholder="Polling interval"
                                                value={pollingInterval}
                                                onChange={
                                                    handlePollingIntervalChange
                                                }
                                                className="w-1/2 rounded-sm border-gray-300 bg-white shadow-inner"
                                            />
                                            <Select
                                                value={pollingTimeUnit}
                                                onValueChange={
                                                    setPollingTimeUnit
                                                }
                                            >
                                                <SelectTrigger className="w-full rounded-sm border-gray-300 bg-white shadow-inner">
                                                    <SelectValue>
                                                        {pollingTimeUnit}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="minutes">
                                                        Minutes
                                                    </SelectItem>
                                                    <SelectItem value="hours">
                                                        Hours
                                                    </SelectItem>
                                                    <SelectItem value="days">
                                                        Days
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {/* Helper Text */}
                                        <p className="mt-2 text-xs text-gray-500">
                                            The polling interval determines how
                                            frequently this time-based event
                                            checks for new data. Choose a
                                            suitable interval depending on how
                                            often you expect updates.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Trigger Tab */}
                    <TabsContent value="trigger" className="mt-4 py-1">
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle>
                                    {selectedEvent?.title ===
                                    "Stuck in Pipeline"
                                        ? "Select Job and Stage"
                                        : "Select Job"}
                                </CardTitle>
                                <CardDescription>
                                    {selectedEvent?.title ===
                                    "Stuck in Pipeline"
                                        ? "Select a job and then a stage to trigger the workflow."
                                        : "Select a job to trigger the workflow based on the selected event."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Show JobsDropdown for all events */}
                                <JobsDropdown
                                    onJobSelect={handleJobChange}
                                    selectedJob={selectedJob}
                                />

                                {/* Additional StagesDropdown for "Stuck in Pipeline" */}
                                {selectedEvent?.fields?.map((field, index) => {
                                    const fetcher = fetchers[field.value];
                                    if (field.type === "dropdown") {
                                        return (
                                            <GenericDropdown
                                                key={index}
                                                fetcher={
                                                    fetcher
                                                        ? () =>
                                                              fetcher(
                                                                  selectedJob,
                                                              )
                                                        : null
                                                }
                                                onItemSelect={(value) =>
                                                    handleFieldChange(
                                                        field.value,
                                                        value,
                                                    )
                                                }
                                                selectedItem={
                                                    selectedEventData[
                                                        field.value
                                                    ]
                                                }
                                                label={field.label}
                                                caption={field.caption}
                                            />
                                        );
                                    } else if (field.type === "input") {
                                        return (
                                            <GenericInput
                                                key={index}
                                                label={field.label}
                                                value={
                                                    selectedEventData[
                                                        field.value
                                                    ]
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        field.value,
                                                        value,
                                                    )
                                                }
                                                placeholder={field.placeholder}
                                                suffix={field.suffix}
                                                type={field.dataType}
                                            />
                                        );
                                    }
                                })}
                                {/* {selectedEvent?.title === "Stuck in Pipeline" &&
                                    selectedJob && (
                                        <>
                                            <GenericDropdown
                                                fetcher={async () =>
                                                    await fetchStagesForJob(
                                                        selectedJob,
                                                    )
                                                }
                                                onItemSelect={handleStageChange}
                                                selectedItem={
                                                    selectedEventData.stageId
                                                }
                                                label="Stage"
                                            />

                                            {selectedEventData.stageId && (
                                                <GenericInput
                                                    label="For"
                                                    value={
                                                        selectedEventData.days
                                                    }
                                                    onChange={handleDaysChange}
                                                    placeholder="Enter number of days"
                                                    suffix="Days"
                                                    type="number"
                                                />
                                            )}
                                        </>)} */}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Test Tab */}
                    <TabsContent value="test" className="mt-4 py-1">
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle>Test Configuration</CardTitle>
                                <CardDescription>
                                    Use this tab to test your API and trigger to
                                    see if you get a success response.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <motion.div
                                    animate={
                                        isTesting
                                            ? { opacity: 0.5 }
                                            : { opacity: 1 }
                                    }
                                    transition={{ duration: 0.5 }}
                                >
                                    <Button
                                        variant="outline"
                                        className={`mt-4 rounded border-green-600 text-green-600 hover:bg-green-100 hover:text-green-600`}
                                        onClick={handleTest}
                                        disabled={isTesting}
                                    >
                                        {isTesting
                                            ? "Running Test..."
                                            : "Run Test"}
                                    </Button>
                                </motion.div>

                                {/* Test Result Display */}
                                {testResult && (
                                    <TestResult
                                        {...testResult}
                                        data={previewData}
                                        showFullData={showFullData}
                                        setShowFullData={setShowFullData}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            {/* Continue or Save Button */}
            <div>
                <Separator />
                <div className="p-6">
                    <Button
                        disabled={
                            (activeTab === "event" && !selectedEvent) ||
                            (activeTab === "trigger" &&
                                selectedEvent?.fields?.some(
                                    (field) => !selectedEventData[field.value],
                                ))
                        }
                        onClick={handleContinue}
                        className="w-full bg-blue-600 text-white"
                    >
                        {activeTab === "test" ? "Save" : "Continue"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TriggersComponent;
