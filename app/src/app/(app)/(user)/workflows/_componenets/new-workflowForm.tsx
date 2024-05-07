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
import { getOrganizations } from "@/server/actions/organization/queries";
import { RadioGroupItem, RadioGroup } from "@/components/ui/radio-group";
import SlackWorkflow from "./slack-workflow";

// Define the form schema using Zod
const workflowFormSchema = z.object({
  name: z.string(),
  objectField: z.string(),
  alertType: z.string(),
  conditions: z.string(),
  receipient: z.string(), // Ensure this matches everywhere it's used
  status: z.string(),
  organizationId: z.string(),
});

const createFeedbackFormSchema = workflowFormSchema.omit({
  // Assuming 'status' is the only field not to be included if necessary
});

interface Organization {
  name: string;
  id: string;
  createdAt: Date;
  ownerId: string;
  image: string | null;
  slack_team_id: string | null;
  access_token: string | null;
  slack_access_token: string | null;
  incoming_webhook_url: string | null;
}

interface Condition {
  field: string;
  condition: string;
  value: string;
  timeUnit: 'closed' | 'open';
}

function CreateWorkflowSheet() {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [selectedAlertType, setSelectedAlertType] = useState("create/update");

  const conditionOptions = [
    { value: 'equal', label: 'Equal To' },
    { value: 'notEqual', label: 'Not equal To' },
    { value: 'one', label: 'Is one of' },
    { value: 'notOne', label: 'Is not one of' },
    { value: 'notBlank', label: 'Is not blank' },
    { value: 'blank', label: 'Is blank ' },
  ];

  const timeConditionOptions = [
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
    { value: 'same', label: 'Same Day' },
  ];

  useEffect(() => {
    // Set default conditions based on selected alert type
    if (selectedAlertType === "timebased") {
      setConditions([{ field: '', condition: '', value: '', timeUnit: 'hours' }]);
    } else if (selectedAlertType === "stuck-in-stage") {
      setConditions([{ field: 'when stuck-in-stage in', condition: '', value: 'for', timeUnit: 'days' }]);
    } else {
      // For other alert types, reset the conditions
      setConditions([]);
    }
  }, [selectedAlertType]);

  const handleConditionChange = (index: number, key: keyof Condition, value: string) => {
    const newConditions = [...conditions];
    const condition = newConditions[index];
    if (!condition) return;
    if (key === 'timeUnit' && (value === 'open' || value === 'closed')) {
      condition[key] = value;
    } else if (key !== 'timeUnit') {
      condition[key] = value;
    }
    setConditions(newConditions);
  };

  const addCondition = () => {
    setConditions([...conditions, { field: '', condition: '', value: '', timeUnit: 'hours' }]);
  };

  const removeCondition = (index: number) => {
    const newConditions = conditions.filter((_, i) => i !== index);
    setConditions(newConditions);
  };

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("");

  const handleOrganizationChange = (value: string) => {
    setSelectedOrganization(value);
    form.setValue("organizationId", value);
  };

  const handleRecipientChange = (value: string) => {
    setSelectedRecipient(value);
    form.setValue("receipient", value);
  };

  const handleSelectChange = (value: string) => {
    setSelectedValue(value);
    form.setValue("objectField", value); // Assuming 'objectField' is the name in the form
  };

  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const { userOrgs } = await getOrganizations();
      setOrganizations(userOrgs);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setOrganizations([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchOrganizations();
    };
    fetchData().catch((error) => {
      console.error("Unhandled error during fetchOrganizations:", error);
    });
  }, []);

  const form = useForm({
    resolver: zodResolver(createFeedbackFormSchema),
    defaultValues: {
      name: "",
      objectField: "",
      alertType: "",
      receipient: "",
      conditions: "",
      status: "Active",
      organizationId: "",
      triggerConfig: "",
    },
  });

  const {
    isPending: isMutatePending,
    mutateAsync,
    reset,
  } = useMutation({
    mutationFn: () => createWorkflowMutation(form.getValues()),
  });

  const [, startAwaitableTransition] = useAwaitableTransition();

  const onSubmit = async () => {
    try {
      await mutateAsync();
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
  const dateFieldOptions = [
    "Created at",
    "Closed at ",
    "Updated at",
    "Last activity"
  ];

  const objectFieldOptions = [
    "Activity Feed",
    "Applications",
    "Approvals",
    "Candidates",
    "Close Reasons",
    "Custom Fields",
    "Demographic Data",
    "Departments",
    "Education",
    "EEOC",
    "Email Templates",
    "Job Openings",
    "Job Posts",
    "Job Stages",
    "Jobs",
    "Offers",
    "Offices",
    "Prospect Pools",
    "Rejection Reasons",
    "Scheduled Interviews",
    "Scorecards",
    "Sources",
    "Tags",
    "Tracking Links",
    "Users",
    "User Permissions",
    "User Roles",
  ];


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600">
          Create Workflow
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] min-w-[90vw] bg-white dark:bg-gray-800 overflow-y-auto">
        <DialogHeader className="flex flex-row justify-between">
          <img
            src="https://assets-global.website-files.com/6457f112b965721ffc2b0777/653e865d87d06c306e2b5147_Group%201321316944.png"
            alt="Logo_sinta"
            className="h-12 w-12"
          />
          <DialogTitle className=" dark:text-white flex flex-col items-center">
            <h2 className="text-xl font-semibold">Create Workflow</h2>
            <DialogDescription className="mt-1 font-medium text-sm text-gray-500 dark:text-gray-400">
              Get started by filling in the basics.
            </DialogDescription>
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          </DialogDescription>
        </DialogHeader>
        <hr className="border-gray-300 dark:border-gray-700 mt-2 mb-6" />

        <div className="h-full overflow-y-auto flex flex-col gap-6 px-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* General */}
            <div className="flex items-start gap-8">
              <div className="w-1/3">
                <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300">General</Label>
                <p className="text-sm text-gray-500 mt-2">Configure the general settings of the workflow.</p>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</Label>
                  <Input
                    {...form.register("name")}
                    placeholder="Enter name"
                    className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 dark:border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="objectField" className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Greenhouse Object</Label>
                  <Select value={selectedValue} onValueChange={handleSelectChange}>
                    <SelectTrigger className="w-full border-gray-300">
                      <SelectValue placeholder="Select Greenhouse Object" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {objectFieldOptions.map((option) => (
                          <SelectItem key={option} value={option.toString()}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <hr className="border-gray-300 dark:border-gray-700 my-2" />

            {/* Alert Type */}
            <div className="flex items-start gap-8">
              <div className="w-1/3">
                <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300">Alert Type</Label>
                <p className="text-sm text-gray-500 mt-2">Select the type of alert for this workflow.</p>
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Alert Type Options</Label>
                <RadioGroup
                  defaultValue={selectedAlertType}
                  onValueChange={setSelectedAlertType}
                  className="flex flex-row space-x-4"
                >
                  {alertTypeOptions.map((option) => (
                    <div key={option.value} className="flex items-center gap-3 w-full">
                      <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
                      <Label
                        htmlFor={option.value}
                        className={`flex flex-col items-center justify-center rounded-md border border-gray-300 bg-popover p-4 w-full ${
                          selectedAlertType === option.value ? "bg-indigo-500 text-white" : "hover:bg-indigo-100 hover:text-indigo-800"
                        }`}
                        style={{ height: "40px" }}
                      >
                        <h2 className="mb-0">{option.label}</h2>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
            <hr className="border-gray-300 dark:border-gray-700 my-2" />

            {/* Conditions */}
            <div className="flex items-start gap-8">
  <div className="w-1/3">
    <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300">Conditions</Label>
    <p className="text-sm text-gray-500 mt-2">Specify conditions for triggering the workflow.</p>
  </div>
  <div className="flex-1 space-y-4">
    {selectedAlertType === "timebased" && (
      <div className="mb-4 p-4 rounded-lg border border-gray-300 bg-gray-100 flex gap-4">
        <div className="flex-1">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Field</Label>
          <Select onValueChange={(value) => handleConditionChange(0, "field", value)}>
            <SelectTrigger className="w-full bg-white border border-gray-300">
              <SelectValue placeholder="Select Date Field" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {dateFieldOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Condition</Label>
          <Select onValueChange={(value) => handleConditionChange(0, "condition", value)}>
            <SelectTrigger className="w-full bg-white border border-gray-300">
              <SelectValue placeholder="Select Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {timeConditionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Value</Label>
          <Input
            placeholder="Enter Value"
            className="w-full bg-white border border-gray-300"
            onChange={(e) => handleConditionChange(0, "value", e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Day/Hours</Label>
          <Select onValueChange={(value) => handleConditionChange(0, "timeUnit", value)}>
            <SelectTrigger className="w-full bg-white border border-gray-300">
              <SelectValue placeholder="Select Time Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    )}
    {selectedAlertType === "stuck-in-stage" && (
      <div className="mb-4 p-4 rounded-lg border border-gray-300 bg-gray-100 flex gap-4">
        <div className="flex-1">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">When Stuck-in-Stage In</Label>
          <Select onValueChange={(value) => handleConditionChange(0, "field", value)}>
            <SelectTrigger className="w-full bg-white border border-gray-300">
              <SelectValue placeholder="Select Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {objectFieldOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <h1 className="self-center mt-4 text-gray-700 dark:text-gray-300">For</h1>
        <div className="flex-1">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Days</Label>
          <Input
            placeholder="Enter Days"
            className="w-full bg-white border border-gray-300"
            onChange={(e) => handleConditionChange(0, "value", e.target.value)}
          />
        </div>
      </div>
    )}
    {/* Existing conditions will appear below */}
    {conditions.slice(1).map((condition, index) => (
      <div key={index + 1}>
        {index > 0 && (
          <div className="flex justify-center my-2">
            <span className="text-gray-500">AND</span>
          </div>
        )}
        <div className="mb-4 p-4 rounded-lg border border-gray-300 bg-gray-100 flex flex-col gap-2">
          <div className="flex flex-row gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Field</Label>
              <Select value={condition.field} onValueChange={(value) => handleConditionChange(index + 1, "field", value)}>
                <SelectTrigger className="w-full bg-white border border-gray-300">
                  <SelectValue placeholder="Select Field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {objectFieldOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Condition</Label>
              <Select value={condition.condition} onValueChange={(value) => handleConditionChange(index + 1, "condition", value)}>
                <SelectTrigger className="w-full bg-white border border-gray-300">
                  <SelectValue placeholder="Select Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {conditionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Value</Label>
              <Select value={condition.timeUnit} onValueChange={(value) => handleConditionChange(index + 1, "timeUnit", value)}>
                <SelectTrigger className="w-full bg-white border border-gray-300">
                  <SelectValue placeholder="Select Time Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeCondition(index + 1)}
              type="button"
              className="self-end"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    ))}
    <Button variant="outline" className="mt-2 w-full hover:bg-indigo-100 hover:text-indigo-800" onClick={addCondition} type="button">
      + Add condition
    </Button>
  </div>
</div>



            <hr className="border-gray-300 dark:border-gray-700 my-2" />

            {/* Recipient */}
            <div className="flex items-start gap-8">
              <div className="w-1/3">
                <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300">Recipient</Label>
                <p className="text-sm text-gray-500 mt-2">Specify the recipient of the alert.</p>
              </div>
              <div className="flex-1">
                <SlackWorkflow />
              </div>
            </div>

            {/* Additional fields as required... */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isMutatePending} className="bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600">
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
