// @ts-nocheck

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
import greenhouseLogo from "../../../../../../../public/greenhouseLogo.png";
import slacklogo from "../../../../../../../public/slack-logo.png";
import filterIcon from "../../../../../../../public/filter.png";
import Actions from "./actions";
import TriggersComponent from "./triggers";
import ConditionsComponent from "./conditons";
import WorkflowPublishModal from "./workflow-modal";
import {
    updateWorkflowStatusMutation,
    updateWorkflowNameMutation,
    updateWorkflowMutation,
} from "@/server/actions/workflows/mutations";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getWorkflowById } from "@/server/actions/workflows/queries";
import useGetCookie from "@/hooks/use-get-cookie";
import { orgConfig } from "@/config/organization";

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
            icon: greenhouseLogo,
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
    const orgCookie = useGetCookie(orgConfig.cookieName);
    const minSidebarWidth = 400; // Minimum width of the sidebar
    const maxSidebarWidth = 800; // Maximum width of the sidebar
    const [isActive, setIsActive] = useState(false); // State to track switch status
    const [workflowName, setWorkflowName] = useState("New Workflow");
    const [isEditingName, setIsEditingName] = useState(false);
    const [mainCondition, setMainCondition] = useState(null);
    const [selectValue, setSelectValue] = useState(undefined);
    const [openPopoverIndex, setOpenPopoverIndex] = useState(null);

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

    const { mutateAsync: updateWorkflowMutate } = useMutation({
        mutationFn: updateWorkflowMutation, // Add your update name mutation function here
        onSuccess: () => {
            toast.success("Changes have been saved.");
        },
        onError: () => {
            toast.error("Failed to save changes.");
        },
    });

    async function updateDbData() {
        // If user is creating a new workflow, don't store anything in the DB
        // Storing is done when the Publish button is clicked
        if (!edit) {
            return;
        }
        const workflowTriggers = JSON.parse(
            localStorage.getItem(localStorageKeyTriggers),
        );
        const recipient = JSON.parse(
            localStorage.getItem(localStorageKeyActions),
        );
        const conditions = JSON.parse(
            localStorage.getItem(localStorageKeyConditions),
        );
        const trimmedConditions = conditions.reduce(
            (acc, { id, field, condition, value }) => {
                if (field?.length && condition?.length) {
                    acc.push({ id, field, condition, value });
                }
                return acc;
            },
            [],
        );

        const newDbData = {
            id: workflowId[0],
            name: workflowName,
            objectField: workflowTriggers?.objectField,
            alertType: workflowTriggers?.alertType,
            organizationId: orgCookie,
            triggerConfig: {
                apiUrl: workflowTriggers?.apiUrl,
                processor: workflowTriggers?.processor,
            },
            recipient: recipient,
            conditions: [
                ...workflowTriggers?.mainCondition,
                ...trimmedConditions,
            ],
            status: isActive ? "Active" : "Inactive",
        };
        await updateWorkflowMutate(newDbData);
    }

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
                    processor: workflow?.triggerConfig?.processor,
                    apiUrl: workflow?.triggerConfig?.apiUrl,
                    alertType: workflow.alertType,
                    mainCondition: workflow.conditions.filter((condition) => {
                        return typeof condition.field === "object";
                    }),
                };
                const workflowActions = {
                    recipients: workflow.recipient?.recipients,
                    customMessageBody: workflow?.recipient.customMessageBody,
                    messageButtons: workflow?.recipient.messageButtons,
                    messageDelivery: workflow?.recipient.messageDelivery,
                    messageFields: workflow?.recipient.messageFields,
                    openingText: workflow?.recipient.openingText,
                };
                const workflowConditions = workflow.conditions
                    .filter((condition) => {
                        return typeof condition.field !== "object";
                    })
                    .map((item, index) => ({ ...item, id: index }));

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
                    icon: greenhouseLogo,
                    label: "Trigger",
                });
            } else {
                newSteps.push({
                    id: 1,
                    type: "Trigger",
                    name: "",
                    status: "skeleton",
                    description: "",
                    icon: greenhouseLogo,
                    label: "Trigger",
                });
            }

            // Add condition steps without duplicates
            conditionsData.forEach((condition, index) => {
                const conditionDescription = `${typeof condition.field === "object" ? condition.field.label : condition.field} ${condition.condition} ${typeof condition.value === "object" ? condition.value.name : condition.value}`;

                const conditionExists = newSteps.some(
                    (step) =>
                        step.type === "Condition" &&
                        step.description === conditionDescription,
                );

                if (!conditionExists && typeof condition.field !== "object") {
                    newSteps.push({
                        id: index,
                        type: "Condition",
                        name: `Condition: ${condition.field}`,
                        status: "valid",
                        description: conditionDescription,
                        icon: filterIcon,
                        label: "Condition",
                    });
                } else if (
                    !mainCondition &&
                    typeof condition.field === "object"
                )
                    setMainCondition(condition);
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
        const highestConditionId = Math.max(
            ...steps
                .filter((item) => item.type === "Condition")
                .map((item) => item.id),
            -1,
        );
        const newConditionStep = {
            id: highestConditionId + 1,
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

        // Add the new condition to local storage
        const conditions = JSON.parse(
            localStorage.getItem(localStorageKeyConditions),
        );
        localStorage.setItem(
            localStorageKeyConditions,
            JSON.stringify([...conditions, newConditionStep]),
        );
        moveActionStepToEnd();
        setSelectValue(undefined);
        setOpenPopoverIndex(null);
        setSelectedElement(newConditionStep);
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

    const handleSaveActions = async (data) => {
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
            const newSteps = steps.map((item) => {
                if (item.type === "Action")
                    return {
                        ...item,
                        name: "Slack Action",
                        description: `Alert: ${data.customMessageBody.substring(0, 50)}...`,
                        status: "valid",
                    };

                return item;
            });
            setSteps(newSteps);
            await updateDbData();
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

    const handleSaveTriggers = async (data) => {
        const newSteps = steps.map((item) => {
            if (item.type === "Trigger")
                return {
                    ...item,
                    name: "Greenhouse Trigger",
                    description: `Trigger: ${data.description.substring(0, 50)}...`,
                    status: "valid",
                };

            return item;
        });
        setSteps(newSteps);
        setSelectedElement(null);
        await updateDbData();
    };

    const handleSaveConditions = async (data) => {
        // Retrieve existing conditions from local storage
        const existingConditions =
            JSON.parse(localStorage.getItem(localStorageKeyConditions)) || [];

        // Get conditions rendered in steps
        const filteredSteps = steps.filter((step) => step.type !== "Condition");

        // Add new conditions as separate steps
        const newSteps = existingConditions.map((condition, index) => ({
            id: condition.id,
            type: "Condition",
            name: `Condition: ${condition.field}`,
            status: "valid",
            description: `${condition.field} ${condition.condition} ${typeof condition.value === "object" ? condition.value.name : condition.value}`,
            icon: filterIcon,
            label: "Condition",
        }));

        newSteps.forEach((condition, index) => {
            newSteps[index].id = index;
        });

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
        await updateDbData();
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
            <header className="ml-[50px] w-[112%] flex-none border-b border-border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex w-[70%] items-center space-x-2">
                        <Link href="/workflows">
                            <MoveLeft className="text-gray-500 dark:text-gray-300" />
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
                                    className="w-full rounded border border-gray-300 p-1 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
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
                                <h3 className="font-heading text-lg font-bold dark:text-gray-100">
                                    {workflowName}
                                </h3>
                            )}
                            {!isEditingName && (
                                <button
                                    className="rounded-full p-1 text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-300 dark:hover:text-gray-100"
                                    onClick={handleDoubleClick} // Trigger edit mode on button click
                                >
                                    <PencilIcon size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500 dark:text-gray-300">
                            All changes saved
                        </span>
                        <WorkflowPublishModal
                            edit={edit}
                            workflowId={workflowId}
                            steps={steps}
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
                    className={`relative flex-grow overflow-y-auto bg-gray-50 p-6 shadow-inner dark:bg-gray-900  dark:shadow-inner ${selectedElement ? "pr-0" : "pr-8"}`}
                >
                    <div
                        className="absolute inset-0 dark:bg-gray-800"
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
                                                    ? "border-dashed border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800"
                                                    : "border-l-4 border-green-500 bg-white shadow dark:bg-gray-700"
                                            }`}
                                            onClick={() =>
                                                handleElementClick(step)
                                            }
                                            whileHover={{ scale: 1.03 }}
                                            transition={{ duration: 0.2 }}
                                            style={{ height: "80px" }}
                                        >
                                            <div
                                                className={`absolute left-0 top-0 -ml-2 -mt-4 ${step.status === "skeleton" ? "dark:bg-black-600 bg-gray-200 text-gray-500 dark:text-gray-300" : "bg-indigo-100 text-black dark:bg-indigo-700"} rounded-br-md rounded-tl-md px-3 py-1`}
                                            >
                                                <span className="text-xs font-semibold dark:text-white">
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
                                                        className="mr-4 text-gray-400 dark:text-gray-500"
                                                    />
                                                    <div>
                                                        <span className="font-semibold text-gray-400 dark:text-gray-300">
                                                            Click to add{" "}
                                                            {step.type.toLowerCase()}{" "}
                                                            details
                                                        </span>
                                                        <p className="text-sm text-gray-400 dark:text-gray-300">
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
                                                        <span className="font-semibold dark:text-gray-100">
                                                            {step.name}
                                                        </span>
                                                        <p className="text-sm text-gray-500 dark:text-gray-300">
                                                            {step.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    </motion.div>
                                    {index < steps.length - 1 && (
                                        <div className="flex flex-col items-center">
                                            <div className="mb-1 h-4 w-px bg-indigo-300 dark:bg-indigo-500"></div>
                                            <Popover
                                                open={
                                                    openPopoverIndex === index
                                                }
                                                onOpenChange={(open) => {
                                                    if (open === true)
                                                        setOpenPopoverIndex(
                                                            index,
                                                        );
                                                    else
                                                        setOpenPopoverIndex(
                                                            false,
                                                        );
                                                }}
                                            >
                                                <PopoverTrigger asChild>
                                                    <button
                                                        className="text-indigo-500 dark:text-indigo-300"
                                                        onClick={() =>
                                                            setOpenPopoverIndex(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        <PlusCircleIcon className="h-6 w-6" />
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="rounded-lg p-4 shadow-lg dark:bg-gray-800 dark:text-gray-200">
                                                    <Select
                                                        value={setSelectValue}
                                                        onValueChange={(
                                                            value,
                                                        ) => {
                                                            // If there is already an incomplete condition step, don't add another
                                                            if (
                                                                steps.some(
                                                                    (
                                                                        item,
                                                                        index,
                                                                    ) =>
                                                                        item.type ===
                                                                            "Condition" &&
                                                                        item.status ===
                                                                            "skeleton",
                                                                )
                                                            ) {
                                                                setOpenPopoverIndex(
                                                                    undefined,
                                                                );
                                                                setSelectedElement(
                                                                    steps.at(
                                                                        steps.findIndex(
                                                                            (
                                                                                item,
                                                                                index,
                                                                            ) =>
                                                                                item.type ===
                                                                                    "Condition" &&
                                                                                item.status ===
                                                                                    "skeleton",
                                                                        ),
                                                                    ),
                                                                );
                                                            } else {
                                                                value ===
                                                                    "Condition" &&
                                                                    addConditionStep(
                                                                        index,
                                                                    );
                                                            }
                                                            setSelectValue(
                                                                value,
                                                            );
                                                        }}
                                                    >
                                                        <SelectTrigger className="flex w-full items-center space-x-2 dark:bg-gray-700">
                                                            <PlusCircleIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                                                            <div>Add Step</div>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Condition">
                                                                <div className="flex items-start">
                                                                    <Filter className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                                    <div>
                                                                        <p className="font-medium dark:text-gray-200">
                                                                            Add
                                                                            Condition
                                                                        </p>
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
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
                                            <div className="mt-1 h-4 w-px bg-indigo-300 dark:bg-indigo-500"></div>
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
                            className="relative flex h-full overflow-y-auto bg-white p-6 shadow-lg dark:bg-gray-800"
                            style={{ width: sidebarWidth }}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div
                                className="absolute left-0 top-0 h-full w-1 cursor-ew-resize hover:bg-indigo-500 dark:hover:bg-indigo-300"
                                onMouseDown={startResizing}
                            />
                            <div className="absolute left-[-13px] top-1/2 z-10 flex -translate-y-1/2 transform items-center justify-center">
                                <div
                                    className="cursor-ew-resize rounded-full bg-gray-200 p-1 shadow dark:bg-gray-600"
                                    onMouseDown={startResizing}
                                >
                                    <MoveHorizontal
                                        className="text-gray-600 dark:text-gray-300"
                                        size={16}
                                    />
                                </div>
                            </div>
                            <div className="flex-grow">
                                <button
                                    className="absolute right-2 top-2 rounded-full p-1 text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-300 dark:hover:text-gray-100"
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
                                        selectedElementId={selectedElement.id}
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
