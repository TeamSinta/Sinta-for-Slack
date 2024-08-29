import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    MoveLeft,
    PlusCircleIcon,
    MoveHorizontal,
    Filter,
    XIcon,
    PencilIcon,
} from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import greenhouselogo from "../../../../../../../public/greenhouselogo.png";
import slacklogo from "../../../../../../../public/slack-logo.png";
import filterIcon from "../../../../../../../public/filter.png";
import Actions from "./actions";
import TriggersComponent from "./triggers";
import ConditionsComponent from "./conditons";
import WorkflowPublishModal from "./workflow-modal";
import {
    updateWorkflowStatusMutation,
    updateWorkflowNameMutation,
} from "@/server/actions/workflows/mutations";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getWorkflowById } from "@/server/actions/workflows/queries";

const localStorageKeyTriggers = "workflowTriggers";
const localStorageKeyActions = "workflowActions";
const localStorageKeyConditions = "workflowConditions";
const localStorageKeyName = "Workflow name";

export function WorkflowBuilder({
    workflowId,
    edit,
}: {
    workflowId?: string;
    edit: boolean;
}) {
    const [steps, setSteps] = useState([
        {
            id: 1,
            type: "Trigger",
            name: "",
            status: "skeleton",
            description: "",
            icon: greenhouselogo,
            label: "Trigger",
        },
        {
            id: 2,
            type: "Action",
            name: "",
            status: "skeleton",
            description: "",
            icon: slacklogo,
            label: "Action",
        },
    ]);

    const [selectedElement, setSelectedElement] = useState(null);
    const [sidebarWidth, setSidebarWidth] = useState(500); // Default width set wider when first opened
    const minSidebarWidth = 400; // Minimum width of the sidebar
    const maxSidebarWidth = 800; // Maximum width of the sidebar
    const [isActive, setIsActive] = useState(false); // State to track switch status
    const [workflowName, setWorkflowName] = useState("New Workflow");
    const [isEditingName, setIsEditingName] = useState(false);

    const { mutateAsync: updateStatusMutate, isPending: isUpdatingStatus } =
        useMutation({
            mutationFn: updateWorkflowStatusMutation,
            onSuccess: () => {
                toast.success(
                    `Workflow ${isActive ? "activated" : "deactivated"} successfully`,
                );
            },
            onError: () => {
                toast.error("Failed to update workflow status.");
            },
        });

    const { mutateAsync: updateNameMutate } = useMutation({
        mutationFn: updateWorkflowNameMutation, // Add your update name mutation function here
        onSuccess: () => {
            toast.success("Workflow name updated successfully");
        },
        onError: () => {
            toast.error("Failed to update workflow name.");
        },
    });

    useEffect(() => {
        const clearSpecificLocalStorageKeys = () => {
            localStorage.removeItem(localStorageKeyTriggers);
            localStorage.removeItem(localStorageKeyActions);
            localStorage.removeItem(localStorageKeyConditions);
            localStorage.removeItem(localStorageKeyName);
        };

        const loadWorkflowData = async (workflowId: string) => {
            try {
                const workflow = await getWorkflowById(workflowId);

                // Set switch status based on workflow data
                setIsActive(workflow.status === "Active");
                setWorkflowName(workflow.name || "Edit Workflow");
                localStorage.setItem(
                    localStorageKeyName,
                    workflow.name || "Edit Workflow",
                );

                // Split the workflow data into the necessary parts
                const workflowTriggers = {
                    objectField: workflow.objectField,
                    triggerConfig: workflow.triggerConfig,
                    alertType: workflow.alertType,
                };
                const workflowActions = {
                    recipients: workflow.recipient.recipients,
                };
                const workflowConditions = workflow.conditions;

                // Store these parts into local storage
                localStorage.setItem(
                    localStorageKeyTriggers,
                    JSON.stringify(workflowTriggers),
                );
                localStorage.setItem(
                    localStorageKeyActions,
                    JSON.stringify(workflowActions),
                );
                localStorage.setItem(
                    localStorageKeyConditions,
                    JSON.stringify(workflowConditions),
                );

                // Load steps from local storage now that it's populated
                loadStepsFromLocalStorage();
            } catch (error) {
                console.error("Error loading workflow data:", error);
            }
        };

        const loadStepsFromLocalStorage = () => {
            const triggerData =
                JSON.parse(localStorage.getItem(localStorageKeyTriggers)) || {};
            const actionData =
                JSON.parse(localStorage.getItem(localStorageKeyActions)) || {};
            const conditionsData =
                JSON.parse(localStorage.getItem(localStorageKeyConditions)) ||
                [];
            const storedName =
                localStorage.getItem(localStorageKeyName) || "New Workflow";

            setWorkflowName(storedName);

            const newSteps = [];

            // Add trigger step
            if (triggerData.objectField && triggerData.triggerConfig) {
                newSteps.push({
                    id: 1,
                    type: "Trigger",
                    name: "Greenhouse Trigger",
                    status: "valid",
                    description: `${triggerData.objectField} - ${triggerData.triggerConfig.apiUrl}`,
                    icon: greenhouselogo,
                    label: "Trigger",
                });
            } else {
                newSteps.push({
                    id: 1,
                    type: "Trigger",
                    name: "",
                    status: "skeleton",
                    description: "",
                    icon: greenhouselogo,
                    label: "Trigger",
                });
            }

            // Add condition steps without duplicates
            conditionsData.forEach((condition) => {
                const conditionDescription = `${condition.field} ${condition.condition} ${typeof condition.value === "object" ? condition.value.name : condition.value}`;

                const conditionExists = newSteps.some(
                    (step) =>
                        step.type === "Condition" &&
                        step.description === conditionDescription,
                );

                if (!conditionExists) {
                    newSteps.push({
                        id: newSteps.length + 1,
                        type: "Condition",
                        name: `Condition: ${condition.field}`,
                        status: "valid",
                        description: conditionDescription,
                        icon: filterIcon,
                        label: "Condition",
                    });
                }
            });

            // Add action step at the end
            if (actionData.recipients) {
                newSteps.push({
                    id: newSteps.length + 1,
                    type: "Action",
                    name: "Slack Action",
                    status: "valid",
                    description: `Alert: ${actionData.recipients.length} recipients`,
                    icon: slacklogo,
                    label: "Action",
                });
            } else {
                newSteps.push({
                    id: newSteps.length + 1,
                    type: "Action",
                    name: "",
                    status: "skeleton",
                    description: "",
                    icon: slacklogo,
                    label: "Action",
                });
            }

            setSteps(newSteps);
        };

        if (!edit) {
            clearSpecificLocalStorageKeys(); // Clear local storage if not in edit mode
        }

        if (edit && workflowId) {
            // If in edit mode, load the workflow data
            loadWorkflowData(workflowId);
        } else {
            // Otherwise, load steps from local storage for new workflows
            loadStepsFromLocalStorage();
        }
    }, [workflowId, edit]);

    const handleSwitchToggle = async () => {
        const newStatus = isActive ? "Inactive" : "Active";
        setIsActive(!isActive);
        const extractedId = Array.isArray(workflowId)
            ? workflowId[0]
            : workflowId;

        try {
            await updateStatusMutate({
                id: extractedId, // Make sure workflowId is a string
                status: newStatus,
            });
        } catch (error) {
            console.error("Error updating workflow status:", error);
            setIsActive(isActive); // Revert the change on error
        }
    };

    const handleElementClick = (element) => {
        setSelectedElement(element);
    };

    const saveStep = (id, data) => {
        const updatedSteps = steps.map((step) =>
            step.id === id ? { ...step, ...data, status: "valid" } : step,
        );
        setSteps(updatedSteps);
        setSelectedElement(null);
    };

    const addConditionStep = () => {
        const newConditionStep = {
            id: steps.length + 1,
            type: "Condition",
            name: "",
            status: "skeleton",
            description: "",
            icon: filterIcon,
            label: "Condition",
        };

        // Insert the new blank condition before the action step
        setSteps((prevSteps) => {
            const actionStepIndex = prevSteps.findIndex(
                (step) => step.type === "Action",
            );
            const stepsBeforeAction = prevSteps.slice(0, actionStepIndex);
            const stepsAfterAction = prevSteps.slice(actionStepIndex);

            return [
                ...stepsBeforeAction,
                newConditionStep,
                ...stepsAfterAction,
            ];
        });
        moveActionStepToEnd();
    };

    const moveActionStepToEnd = () => {
        setSteps((prevSteps) => {
            const actionStep = prevSteps.find((step) => step.type === "Action");
            const otherSteps = prevSteps.filter(
                (step) => step.type !== "Action",
            );

            return [...otherSteps, actionStep];
        });
    };

    const startResizing = (e) => {
        e.preventDefault(); // Prevent text selection during drag
        const startX = e.clientX;
        const startWidth = sidebarWidth;

        const doDrag = (event) => {
            const newWidth = startWidth + startX - event.clientX;
            setSidebarWidth(
                Math.min(Math.max(newWidth, minSidebarWidth), maxSidebarWidth),
            );
        };

        const stopDrag = () => {
            document.removeEventListener("mousemove", doDrag);
            document.removeEventListener("mouseup", stopDrag);
        };

        document.addEventListener("mousemove", doDrag);
        document.addEventListener("mouseup", stopDrag);
    };

    const handleSaveActions = (data) => {
        const lastConditionIndex = steps
            .map((step) => step.type)
            .lastIndexOf("Condition");
        const actionIndex =
            lastConditionIndex !== -1
                ? lastConditionIndex + 1
                : steps.length - 1;

        const actionExists = steps.some(
            (step) => step.type === "Action" && step.status === "valid",
        );

        if (actionExists) {
            saveStep(actionIndex, {
                name: "Slack Action",
                description: `Alert: ${data.customMessageBody.substring(0, 50)}...`,
            });
        } else {
            const newActionStep = {
                id: steps.length,
                type: "Action",
                name: "Slack Action",
                status: "valid",
                description: `Alert: ${data.customMessageBody.substring(0, 50)}...`,
                icon: slacklogo,
                label: "Action",
            };

            setSteps((prevSteps) => {
                const updatedSteps = [...prevSteps];
                updatedSteps[updatedSteps.length - 1] = newActionStep;
                return updatedSteps;
            });
        }

        setSelectedElement(null);
    };

    const handleSaveTriggers = (data) => {
        localStorage.setItem(localStorageKeyTriggers, JSON.stringify(data));

        saveStep(1, {
            name: "Greenhouse Trigger",
            description: `Trigger: ${data.description.substring(0, 50)}...`,
        });
        setSelectedElement(null);
    };

    const handleSaveConditions = (data) => {
        // Retrieve existing conditions from local storage
        const existingConditions =
            JSON.parse(localStorage.getItem(localStorageKeyConditions)) || [];

        // Filter out duplicates from the steps array
        const filteredSteps = steps.filter((step) => step.type !== "Condition");

        // Add new conditions as separate steps
        const newSteps = existingConditions.map((condition, index) => ({
            id: index + 1, // Adjust the ID as necessary
            type: "Condition",
            name: `Condition: ${condition.field}`,
            status: "valid",
            description: `${condition.field} ${condition.condition} ${typeof condition.value === "object" ? condition.value.name : condition.value}`,
            icon: filterIcon,
            label: "Condition",
        }));

        // Reorder steps to ensure that conditions come before actions
        const triggerStep = filteredSteps.find(
            (step) => step.type === "Trigger",
        );
        const actionStep = filteredSteps.find((step) => step.type === "Action");

        // Combine steps in the correct order
        const finalSteps = [triggerStep, ...newSteps, actionStep].filter(
            Boolean,
        ); // Filter out any undefined steps

        setSteps(finalSteps);
        setSelectedElement(null);
    };

    const handleCloseSidebar = () => {
        setSelectedElement(null);
    };

    const handleDoubleClick = () => {
        setIsEditingName(true);
    };

    const handleNameChange = (e) => {
        setWorkflowName(e.target.value);
        localStorage.setItem(localStorageKeyName, e.target.value);
    };

    const handleNameBlur = async () => {
        setIsEditingName(false);

        if (edit && workflowId) {
            const extractedId = Array.isArray(workflowId)
                ? workflowId[0]
                : workflowId;

            try {
                await updateNameMutate({
                    id: extractedId,
                    name: workflowName,
                });
            } catch (error) {
                console.error("Error updating workflow name:", error);
            }
        }
    };

    return (
        <>
            <header className="ml-[50px] w-[112%] flex-none border-b border-border bg-white p-4">
                <div className="flex items-center justify-between">
                    <div className="flex w-[70%] items-center space-x-2">
                        <Link href="/workflows">
                            <MoveLeft />
                        </Link>
                        <div
                            className="flex w-[70%] items-center space-x-2"
                            onDoubleClick={handleDoubleClick}
                        >
                            {isEditingName ? (
                                <input
                                    type="text"
                                    value={workflowName}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 50) {
                                            handleNameChange(e);
                                        }
                                    }}
                                    onBlur={handleNameBlur}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleNameBlur(); // Submit on Enter key press
                                        }
                                    }}
                                    className="w-full rounded border border-gray-300 p-1 focus:outline-none"
                                    autoFocus
                                    style={{
                                        fontSize: "1.05rem", // Equivalent to h3 font size
                                        fontWeight: "bold", // Equivalent to h3 font weight
                                        lineHeight: "1.75rem", // Adjust line-height similar to h3
                                        width: "100%",
                                        maxWidth: "500px",
                                    }}
                                />
                            ) : (
                                <h3 className="font-heading text-lg font-bold">
                                    {workflowName}
                                </h3>
                            )}
                            {!isEditingName && (
                                <button
                                    className="rounded-full p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    onClick={handleDoubleClick} // Trigger edit mode on button click
                                >
                                    <PencilIcon size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500">
                            All changes saved
                        </span>
                        <WorkflowPublishModal
                            edit={edit}
                            workflowId={workflowId}
                        />
                        <div className="flex items-center space-x-1">
                            <Switch
                                className="data-[state=checked]:bg-indigo-500"
                                checked={isActive}
                                onCheckedChange={handleSwitchToggle}
                                disabled={isUpdatingStatus || !workflowId}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <div className="ml-[50px] flex h-[calc(100vh-64px)] w-[112%]">
                <div
                    className={`relative flex-grow overflow-y-auto bg-gray-50 p-6 shadow-inner ${selectedElement ? "pr-0" : "pr-8"}`}
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage:
                                "radial-gradient(#e5e7eb 1px, transparent 1px)",
                            backgroundSize: "20px 20px",
                        }}
                    ></div>

                    <div className="relative mr-[20px] mt-8 flex flex-col items-center space-y-3">
                        <AnimatePresence>
                            {steps.map((step, index) => (
                                <React.Fragment key={step.id}>
                                    <motion.div
                                        className="relative flex w-full flex-col items-center"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <motion.div
                                            className={`relative flex w-full max-w-xl cursor-pointer items-center justify-between rounded-lg border-2 p-4 ${
                                                step.status === "skeleton"
                                                    ? "border-dashed border-gray-300 bg-gray-100"
                                                    : "border-l-4 border-green-500 bg-white shadow"
                                            }`}
                                            onClick={() =>
                                                handleElementClick(step)
                                            }
                                            whileHover={{ scale: 1.03 }}
                                            transition={{ duration: 0.2 }}
                                            style={{ height: "80px" }}
                                        >
                                            <div
                                                className={`absolute left-0 top-0 -ml-2 -mt-4 ${step.status === "skeleton" ? "bg-gray-200 text-gray-500" : "bg-indigo-100 text-black"} rounded-br-md rounded-tl-md px-3 py-1`}
                                            >
                                                <span className="text-xs font-semibold">
                                                    {step.label}
                                                </span>
                                            </div>
                                            {step.status === "skeleton" ? (
                                                <div className="flex items-center">
                                                    <Image
                                                        src={step.icon}
                                                        alt={`${step.type} Icon`}
                                                        width={20}
                                                        height={20}
                                                        className="mr-4 text-gray-400"
                                                    />
                                                    <div>
                                                        <span className="font-semibold text-gray-400">
                                                            Click to add{" "}
                                                            {step.type.toLowerCase()}{" "}
                                                            details
                                                        </span>
                                                        <p className="text-sm text-gray-400">
                                                            Enter details
                                                            here...
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <Image
                                                        src={step.icon}
                                                        alt={`${step.type} Icon`}
                                                        width={30}
                                                        height={30}
                                                        className="mr-4"
                                                    />
                                                    <div>
                                                        <span className="font-semibold">
                                                            {step.name}
                                                        </span>
                                                        <p className="text-sm text-gray-500">
                                                            {step.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    </motion.div>
                                    {index < steps.length - 1 && (
                                        <div className="flex flex-col items-center ">
                                            <div className="mb-1 h-4 w-px bg-indigo-300"></div>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button className="text-indigo-500">
                                                        <PlusCircleIcon className="h-6 w-6" />
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="rounded-lg p-4 shadow-lg">
                                                    <Select
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            value ===
                                                                "Condition" &&
                                                            addConditionStep(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="flex w-full items-center space-x-2">
                                                            <PlusCircleIcon className="h-5 w-5 text-gray-500" />
                                                            <SelectValue placeholder="Add Step" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Condition">
                                                                <div className="flex items-start">
                                                                    <Filter className="mr-2 h-5 w-5 text-gray-600" />
                                                                    <div>
                                                                        <p className="font-medium">
                                                                            Add
                                                                            Condition
                                                                        </p>
                                                                        <p className="text-sm text-gray-500">
                                                                            Set
                                                                            up a
                                                                            rule
                                                                            to
                                                                            refine
                                                                            your
                                                                            workflow
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </PopoverContent>
                                            </Popover>
                                            <div className="mt-1 h-4 w-px bg-indigo-300"></div>
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                <AnimatePresence>
                    {selectedElement && (
                        <motion.div
                            className="relative flex h-full overflow-y-auto bg-white p-6 shadow-lg"
                            style={{ width: sidebarWidth }}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div
                                className="absolute left-0 top-0 h-full w-1 cursor-ew-resize hover:bg-indigo-500"
                                onMouseDown={startResizing}
                            />
                            <div className="absolute left-[-13px] top-1/2 z-10 flex -translate-y-1/2 transform items-center justify-center">
                                <div
                                    className="cursor-ew-resize rounded-full bg-gray-200 p-1 shadow"
                                    onMouseDown={startResizing}
                                >
                                    <MoveHorizontal
                                        className="text-gray-600"
                                        size={16}
                                    />
                                </div>
                            </div>
                            <div className="flex-grow">
                                <button
                                    className="absolute right-2 top-2 rounded-full p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    onClick={handleCloseSidebar}
                                >
                                    <XIcon size={20} />
                                </button>

                                {selectedElement.type === "Trigger" && (
                                    <TriggersComponent
                                        onSaveTrigger={handleSaveTriggers}
                                        workflowData={
                                            edit
                                                ? JSON.parse(
                                                      localStorage.getItem(
                                                          localStorageKeyTriggers,
                                                      ),
                                                  )
                                                : null
                                        }
                                    />
                                )}
                                {selectedElement.type === "Action" && (
                                    <Actions
                                        onSaveActions={handleSaveActions}
                                        workflowData={
                                            edit
                                                ? JSON.parse(
                                                      localStorage.getItem(
                                                          localStorageKeyActions,
                                                      ),
                                                  )
                                                : null
                                        }
                                    />
                                )}
                                {selectedElement.type === "Condition" && (
                                    <ConditionsComponent
                                        onSaveConditions={handleSaveConditions}
                                        workflowData={
                                            edit
                                                ? JSON.parse(
                                                      localStorage.getItem(
                                                          localStorageKeyConditions,
                                                      ),
                                                  )
                                                : null
                                        }
                                    />
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
