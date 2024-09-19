// @ts-nocheck

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
import mixpanel from "mixpanel-browser";
import { useSession } from "next-auth/react";
import { orgConfig } from "@/config/organization";
import useGetCookie from "@/hooks/use-get-cookie";

export const WorkflowPublishModal = ({
    edit = false,
    workflowId,
    steps,
}: {
    edit?: boolean;
    workflowId?: string;
    steps: any;
}) => {
    const [stepStatus, setStepStatus] = useState([]);
    const [isRunningTest, setIsRunningTest] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const router = useRouter();
    const session = useSession();
    const orgCookie = useGetCookie(orgConfig.cookieName);
    const triggerData = getTriggerData();
    const actionData = getActionData();
    const conditionsData = getConditionsData();
    const workflowName = getWorkflowName() || triggerData.event;

    function handleSuccessfulPublish() {
        clearLocalStorage();
        setStepStatus([]);
        setErrorMessage(""); // Clear any previous error messages
        toast.success(
            edit
                ? "Workflow updated successfully"
                : "Workflow created successfully",
        );
        router.push("/workflows");
    }
    const {
        mutateAsync,
        isPending: isMutatePending,
        reset,
    } = useMutation({
        mutationFn: edit ? updateWorkflowMutation : createWorkflowMutation,
        onSuccess: () => {
            router.refresh();
            reset();
            handleSuccessfulPublish();
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
            triggerData?.objectField &&
            (triggerData?.apiUrl || triggerData?.triggerConfig?.apiUrl);
        const isActionValid =
            actionData?.recipients && actionData.customMessageBody;
        setIsButtonDisabled(!(isTriggerValid && isActionValid));
    };

    useEffect(() => {
        validateData(); // Validate data whenever the modal opens
    }, [triggerData, actionData]);

    function trackModalEvent(open: boolean) {
        mixpanel.track(open ? "Modal Shown" : "Modal Dismissed", {
            distinct_id: session.data?.user?.id,
            modal_name: "Workflow Modal",
            modal_page: "/workflows",
            modal_shown_at: new Date().toISOString(),
            user_id: session.data?.user?.id,
            organization_id: orgCookie,
        });
    }

    const handleOpenModal = (open: boolean) => {
        trackModalEvent(open);
        setStepStatus([]);
        validateData(); // Validate data when the modal opens
    };

    const handlePublish = async () => {
        setIsRunningTest(true);
        setStepStatus([]);
        setErrorMessage(""); // Clear any previous error messages

        let hasError = false;

        for (const step in steps) {
            setStepStatus((prev) => [...prev, "loading"]);
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock delay to simulate API call

                if (!(steps[step].name && steps[step].status === "valid"))
                    throw Error("Invalid Step");
                setStepStatus((prev) => {
                    const res = prev;
                    res[step] = "success";
                    return res;
                });
            } catch {
                setStepStatus((prev) => {
                    const res = prev;
                    res[step] = "error";
                    return res;
                });
                setErrorMessage(
                    `Error in ${steps[step].type}. Please check and try again.`,
                );
                hasError = true;
                break; // Stop after the first error
            }
        }

        setIsRunningTest(false);

        if (!hasError) {
            try {
                if (!edit) {
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
                } else handleSuccessfulPublish();
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
                    {steps.map((step, index: number) => (
                        <div
                            key={index}
                            className={`flex items-center justify-between rounded border bg-gray-50 p-3 ${stepStatus[index] === "error" ? "border-red-500" : ""}`}
                        >
                            <div className="flex items-center space-x-2">
                                {stepStatus[index] === "loading" ? (
                                    <Loader2Icon className="animate-spin text-blue-500" />
                                ) : stepStatus[index] === "success" ? (
                                    <CircleCheck className="text-green-500" />
                                ) : stepStatus[index] === "error" ? (
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
