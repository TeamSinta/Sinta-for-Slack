import React, { useState, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CircleCheck, Loader2Icon, CircleX } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    createWorkflowMutation,
    updateWorkflowMutation,
} from "@/server/actions/workflows/mutations";
import {
    getActionData,
    getConditionsData,
    getTriggerData,
    getWorkflowName,
} from "@/lib/utils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const WorkflowPublishModal = ({
    edit = false,
    workflowId,
}: {
    edit?: boolean;
    workflowId?: string;
}) => {
    const [steps, setSteps] = useState([]);
    const [stepStatus, setStepStatus] = useState({});
    const [isRunningTest, setIsRunningTest] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const router = useRouter();

    const triggerData = getTriggerData();
    const actionData = getActionData();
    const conditionsData = getConditionsData();
    const workflowName = getWorkflowName() || triggerData.event;

    const {
        mutateAsync,
        isPending: isMutatePending,
        reset,
    } = useMutation({
        mutationFn: edit ? updateWorkflowMutation : createWorkflowMutation,
        onSuccess: () => {
            router.refresh();
            reset();
            clearLocalStorage();
            setStepStatus({});
            setErrorMessage(""); // Clear any previous error messages
            toast.success(
                edit
                    ? "Workflow updated successfully"
                    : "Workflow created successfully",
            );
            router.push("/workflows");
        },
        onError: (error) => {
            const errorMsg = error?.message ?? "Failed to submit Workflow";
            setErrorMessage(formatErrorMessage(errorMsg)); // Set error message for the alert
        },
    });

    const formatErrorMessage = (message) => {
        return message.replace(/[\[\]{}"]/g, " ").trim();
    };

    const validateData = () => {
        const isTriggerValid =
            triggerData && triggerData.event && triggerData.description;
        const isActionValid =
            actionData && actionData.recipients && actionData.customMessageBody;
        setIsButtonDisabled(!(isTriggerValid && isActionValid));
    };

    useEffect(() => {
        validateData(); // Validate data whenever the modal opens
    }, [triggerData, actionData]);

    const handleOpenModal = () => {
        const combinedSteps = [
            {
                id: 1,
                type: "Trigger",
                ...triggerData,
                description: triggerData.description
                    ? `Trigger: ${triggerData.description}`
                    : "Missing trigger data",
            },
            ...conditionsData.map((condition, index) => ({
                id: index + 2,
                type: "Condition",
                field: condition.field,
                condition: condition.condition,
                value: condition.value.name || condition.value,
                description: `${condition.field} ${condition.condition} ${condition.value.name || condition.value}`,
            })),
            {
                id: conditionsData.length + 2,
                type: "Action",
                ...actionData,
                description: actionData.customMessageBody
                    ? `Alert: ${actionData.customMessageBody.substring(0, 50)}...`
                    : "Missing action data",
            },
        ];

        setSteps(combinedSteps);
        validateData(); // Validate data when the modal opens
    };

    const sortTriggerData = (data) => {
        const sortedData = {
            alertType: data.alertType,
            apiUrl: data.apiUrl,
            description: data.description,
            event: data.event,
            objectField: data.objectField,
            processor: data.processor,
            trigger: data.trigger,
            mainCondition:
                data.mainCondition &&
                data.mainCondition.sort((a, b) =>
                    a.field.label.localeCompare(b.field.label),
                ),
        };
        return sortedData;
    };

    const handlePublish = async () => {
        setIsRunningTest(true);
        setStepStatus({});
        setErrorMessage(""); // Clear any previous error messages

        let hasError = false;

        for (const step of steps) {
            setStepStatus((prev) => ({ ...prev, [step.id]: "loading" }));
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock delay to simulate API call
                setStepStatus((prev) => ({ ...prev, [step.id]: "success" }));
            } catch {
                setStepStatus((prev) => ({ ...prev, [step.id]: "error" }));
                setErrorMessage(
                    `Error in ${step.type}. Please check and try again.`,
                );
                hasError = true;
                break; // Stop after the first error
            }
        }

        setIsRunningTest(false);

        if (!hasError) {
            try {
                // Combine conditionsData with triggerData.mainCondition
                const combinedConditions = [
                    ...conditionsData,
                    ...(triggerData.mainCondition || []),
                ];

                await mutateAsync({
                    id: workflowId, // Include the workflowId when updating
                    name: workflowName, // Use the name from local storage or fallback to event name
                    objectField: triggerData.objectField, // Use sorted trigger data's object field
                    alertType: triggerData.alertType, // Adjust this as needed
                    conditions: combinedConditions, // Send combined conditions
                    triggerConfig: {
                        apiUrl: triggerData.apiUrl,
                        processor: triggerData.processor,
                    },
                    recipient: actionData,
                    status: "active",
                    organizationId: "your-organization-id", // Adjust this as needed
                });
            } catch (error) {
                setStepStatus((prev) => ({
                    ...prev,
                    [steps.length]: "error",
                }));
                setErrorMessage(formatErrorMessage(error.message)); // Set error message for the alert
            }
        } else {
            toast.error(
                "There was an error in one of the steps. Please check and try again.",
            );
        }
    };

    return (
        <Dialog onOpenChange={handleOpenModal}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="rounded border-indigo-600 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-600"
                >
                    {edit ? "Update" : "Publish"}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <h2 className="mb-4 text-xl font-semibold">
                    {edit ? "Update Workflow" : "Prepare to Publish Workflow"}
                </h2>
                {errorMessage && (
                    <Alert variant="destructive" className="rounded-lg">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription className="text-xs">
                            {errorMessage}
                        </AlertDescription>
                    </Alert>
                )}
                <div className="space-y-2">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`flex items-center justify-between rounded border bg-gray-50 p-3 ${stepStatus[step.id] === "error" ? "border-red-500" : ""}`}
                        >
                            <div className="flex items-center space-x-2">
                                {stepStatus[step.id] === "loading" ? (
                                    <Loader2Icon className="animate-spin text-blue-500" />
                                ) : stepStatus[step.id] === "success" ? (
                                    <CircleCheck className="text-green-500" />
                                ) : stepStatus[step.id] === "error" ? (
                                    <CircleX className="text-red-500" />
                                ) : (
                                    <CircleCheck className="text-gray-400" />
                                )}
                                <div>
                                    <h3 className="font-semibold">
                                        {step.type}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {step.description
                                            ?.split(/({{[^}]+}})/g)
                                            .map((text, index) =>
                                                text.startsWith("{{") &&
                                                text.endsWith("}}") ? (
                                                    <span
                                                        key={index}
                                                        className="text-purple-500"
                                                    >
                                                        {text}
                                                    </span>
                                                ) : (
                                                    text
                                                ),
                                            ) || "No description available"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-end">
                    <Button
                        onClick={handlePublish}
                        disabled={
                            isButtonDisabled || isMutatePending || isRunningTest
                        }
                        className="rounded bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                        {isRunningTest
                            ? "Running Test..."
                            : isMutatePending
                              ? edit
                                  ? "Updating..."
                                  : "Publishing..."
                              : edit
                                ? "Update"
                                : "Publish"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Function to clear the local storage after submission
const clearLocalStorage = () => {
    localStorage.removeItem("workflowTriggers");
    localStorage.removeItem("workflowActions");
    localStorage.removeItem("workflowConditions");
    localStorage.removeItem("Workflow name"); // Clear the workflow name from local storage as well
};

export default WorkflowPublishModal;
