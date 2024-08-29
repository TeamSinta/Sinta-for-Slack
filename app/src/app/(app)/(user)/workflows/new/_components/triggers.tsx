// @ts-nocheck

import React, { useState, useEffect } from "react";
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
import { CheckCircle, AlertTriangle, Clock } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import greenhouseLogo from "../../../../../../../public/greenhouseLogo.png";
import { Separator } from "@/components/ui/separator";
import JobsDropdown from "../../_components/job-select";
import StagesDropdown from "../../_components/stages-dropdown";
import { customFetchTester } from "@/utils/fetch";

const localStorageKey = "workflowTriggers";

const saveTriggerData = (data) => {
    const storedData = JSON.parse(localStorage.getItem(localStorageKey)) || {};
    const updatedData = { ...storedData, ...data };
    localStorage.setItem(localStorageKey, JSON.stringify(updatedData));
};

const TriggersComponent = ({ workflowData, onSaveTrigger }) => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedStage, setSelectedStage] = useState(null);
    const [selectedTrigger, setSelectedTrigger] = useState(null);
    const [days, setDays] = useState("");
    const [activeTab, setActiveTab] = useState("event");
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [showFullData, setShowFullData] = useState(false);

    const events = [
        {
            title: "Candidate Hired",
            description: "Triggered when a candidate is marked as hired.",
            objectField: "Candidates",
            apiUrl: "/api/greenhouse/candidate_hired",
            alertType: "Create/Update",
            triggers: [
                "Onboarding Setup",
                "Send Welcome Email",
                "Assign Buddy",
            ],
        },
        {
            title: "Interview Scheduled",
            description: "Triggered when an interview is scheduled.",
            apiUrl: "https://harvest.greenhouse.io/v1/scheduled_interviews",
            objectField: "Scheduled Interviews",
            alertType: "timebased",
            triggers: [
                "Notify Interviewers",
                "Prepare Interview Kit",
                "Schedule Reminder",
            ],
        },
        {
            title: "Job Post Approved",
            description: "Triggered when a job post is approved.",
            objectField: "Jobs",
            apiUrl: "/api/greenhouse/job_post_approved",
            alertType: "Create/Update",
            triggers: ["Publish Job Post", "Notify Team"],
        },
        {
            title: "Stuck in Pipeline",
            objectField: "Candidates",
            description: "Triggered when a candidate is stuck in a stage.",
            apiUrl: "https://harvest.greenhouse.io/v1/candidates",
            alertType: "stuck-in-stage",
            triggers: [],
        },
        // Add more events as needed
    ];

    useEffect(() => {
        if (workflowData) {
            const matchedEvent = events.find(
                (event) =>
                    event.objectField === workflowData.objectField &&
                    event.alertType === workflowData.alertType,
            );
            setSelectedEvent(matchedEvent || null); // If no match, set to null
        } else {
            setSelectedEvent(null); // Set to null if no workflowData
        }
    }, [workflowData]);

    const handleEventChange = (eventTitle) => {
        const selected = events.find((event) => event.title === eventTitle);
        setSelectedEvent(selected);
        setSelectedJob(null);
        setSelectedStage(null);
        setSelectedTrigger(null);
    };

    const handleJobChange = (jobId) => {
        setSelectedJob(jobId);
        setSelectedStage(null);
    };

    const handleStageChange = (stageId, stageLabel) => {
        setSelectedStage({ id: stageId, label: stageLabel });
    };

    const handleDaysChange = (e) => {
        setDays(e.target.value);
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

    const handleTriggerChange = (trigger) => {
        setSelectedTrigger(trigger);
    };

    const handleSave = () => {
        if (selectedEvent) {
            let triggerDescription = `${selectedEvent.title}`;
            if (
                selectedEvent.title === "Stuck in Pipeline" &&
                selectedJob &&
                selectedStage
            ) {
                triggerDescription += ` for ${selectedJob} in ${selectedStage.label}`;
            }

            const triggerData = {
                event: selectedEvent.title,
                trigger: selectedStage ? selectedStage.label : selectedTrigger,
                apiUrl: selectedEvent.apiUrl,
                objectField: selectedEvent.objectField,
                alertType: selectedEvent.alertType,
                description: triggerDescription,
                processor: selectedJob,
                mainCondition:
                    selectedStage && days
                        ? [
                              {
                                  field: {
                                      label: selectedStage.label,
                                      value: selectedStage.id,
                                  },
                                  value: days,
                                  condition: "greaterThan",
                              },
                          ]
                        : [],
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
                throw new Error(
                    `HTTP error! Status: ${response.status}, Body: ${JSON.stringify(response.data)}`,
                );
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
                    ? error.message
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
            return selectedStage && days ? (
                <CheckCircle className="text-green-500" size={iconSize} />
            ) : (
                <AlertTriangle className="text-gray-500" size={iconSize} />
            );
        }
        if (tab === "test") {
            if (!selectedStage)
                return <Clock className="text-gray-300" size={iconSize} />;
            return <Clock className="text-gray-300" size={iconSize} />;
        }
    };

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
                                (selectedEvent?.title === "Stuck in Pipeline" &&
                                    (!selectedStage || !days))
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
                                    <div className="rounded-lg border bg-gray-50 p-4">
                                        <h3 className="text-lg font-semibold">
                                            {selectedEvent.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {selectedEvent.description}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            API URL: {selectedEvent.apiUrl}
                                        </p>
                                    </div>
                                )}
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
                                    <SelectContent className="space-y-2 p-2">
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
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Trigger Tab */}
                    <TabsContent value="trigger" className="mt-4 py-1">
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle>
                                    {selectedEvent?.title ===
                                    "Stuck in Pipeline"
                                        ? "Select Job and Stage"
                                        : "Select Trigger"}
                                </CardTitle>
                                <CardDescription>
                                    {selectedEvent?.title ===
                                    "Stuck in Pipeline"
                                        ? "Select a job and then a stage to trigger the workflow."
                                        : "Choose a trigger condition related to the selected event."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedEvent?.title ===
                                "Stuck in Pipeline" ? (
                                    <>
                                        <JobsDropdown
                                            onJobSelect={handleJobChange}
                                        />

                                        {selectedJob && (
                                            <StagesDropdown
                                                jobId={selectedJob}
                                                onStageSelect={
                                                    handleStageChange
                                                }
                                            />
                                        )}

                                        {selectedStage && (
                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    For
                                                </label>
                                                <div className="flex items-center">
                                                    <input
                                                        type="number"
                                                        value={days}
                                                        onChange={
                                                            handleDaysChange
                                                        }
                                                        className="mt-1 block rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        placeholder="Enter number of days"
                                                    />
                                                    <span className="ml-2 text-sm text-black">
                                                        Days
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {selectedEvent?.triggers.length > 0 && (
                                            <Select
                                                onValueChange={
                                                    handleTriggerChange
                                                }
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue>
                                                        {selectedTrigger ||
                                                            "Choose a trigger"}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent className="space-y-2 p-2">
                                                    {selectedEvent.triggers.map(
                                                        (trigger, index) => (
                                                            <SelectItem
                                                                key={index}
                                                                value={trigger}
                                                            >
                                                                <div className="p-2">
                                                                    {trigger}
                                                                </div>
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </>
                                )}
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
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.5,
                                            ease: "easeOut",
                                        }}
                                        className={`mt-4 rounded-lg p-6 shadow-md ${
                                            testResult.success
                                                ? "border-l-4 border-green-400 bg-green-50 text-green-800"
                                                : "border-l-4 border-red-400 bg-red-50 text-red-800"
                                        }`}
                                        style={{
                                            maxWidth: "100%",
                                            wordWrap: "break-word",
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-bold">
                                                {testResult.success
                                                    ? "Test Successful"
                                                    : "Test Failed"}
                                            </h3>
                                            <span className="font-semibold">
                                                Status Code: {testResult.status}
                                            </span>
                                        </div>
                                        <div className="mt-2">
                                            <p className="font-medium">
                                                Response Data:
                                            </p>
                                            <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded bg-gray-100 p-2 text-sm">
                                                {previewData &&
                                                previewData.length > 300
                                                    ? `${previewData.slice(0, 300)}...`
                                                    : previewData ||
                                                      "No data available"}
                                            </pre>
                                            {previewData &&
                                                previewData.length > 300 && (
                                                    <button
                                                        onClick={() =>
                                                            setShowFullData(
                                                                !showFullData,
                                                            )
                                                        }
                                                        className="mt-2 text-sm text-blue-500 hover:underline"
                                                    >
                                                        {showFullData
                                                            ? "Show Less"
                                                            : "Show More"}
                                                    </button>
                                                )}
                                            {showFullData && previewData && (
                                                <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded bg-gray-100 p-2 text-sm">
                                                    {JSON.stringify(
                                                        testResult.data,
                                                        null,
                                                        2,
                                                    )}
                                                </pre>
                                            )}
                                        </div>
                                        <div className="mt-2">
                                            <p className="font-medium">
                                                Message:
                                            </p>
                                            <p>{testResult.message}</p>
                                        </div>
                                    </motion.div>
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
                                selectedEvent?.title === "Stuck in Pipeline" &&
                                (!selectedStage || !days))
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
