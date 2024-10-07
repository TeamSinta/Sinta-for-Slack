"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Briefcase, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";

// Form validation schema using zod
const FormSchema = z.object({
  objectField: z.enum(["jobs", "candidates"], {
      required_error: "You need to select a room type.",
  }),
  name: z.string().nonempty("Name is required"),
  triggerConfig: z.object({
      apiUrl:  z.string().nullable().optional(),
      processor: z.string().nullable().optional(), // Allows processor to be optional and null
  }),
});


// Options for trigger config based on room type
const objectFieldOptions = [
    {
        name: "Candidates",
        apiUrl: "https://harvest.greenhouse.io/v1/candidates",
    },
    {
        name: "Jobs",
        apiUrl: "https://harvest.greenhouse.io/v1/jobs",
    },
];

export default function DetailsStep({
    onDataSubmit,
}: {
    onDataSubmit: (data: any) => void;
}) {
    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            objectField: "",
            name: "",
            triggerConfig:{
              apiUrl:"",
              processor:"",
            }
        },
    });

    const [selectedRoomType, setSelectedRoomType] = useState<string>(""); // Track selected room type

    const handleRoomSelect = (roomType: string) => {
        setSelectedRoomType(roomType); // Update selected room type
        form.setValue("objectField", roomType); // Update the form state for room type

        // Apply the correct trigger configuration based on the selected room type
        const selectedConfig = objectFieldOptions.find(option => option.name.toLowerCase() === roomType);
        if (selectedConfig) {
            form.setValue("triggerConfig", {
                apiUrl: selectedConfig.apiUrl,
                processor: "", // Example processor, adjust as needed
            });
            console.log(`Trigger config applied: ${selectedConfig.apiUrl}`);
        }
    };

    function handleSubmit(data: any) {
        onDataSubmit(data); // Send the data to parent on submit
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
            >
                {/* Form Input for Name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <input
                                    type="text"
                                    {...field}
                                    className="mt-1 block w-full rounded-sm border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Custom Card Selection for Room Type */}
                <FormField
                    control={form.control}
                    name="objectField"
                    render={() => (
                        <FormItem className="space-y-4">
                            <FormLabel>Select a Room Type</FormLabel>

                            {/* Job Room Card */}
                            <div
                                className={`flex cursor-pointer items-center rounded-md border-2 p-8 transition-all ${
                                    selectedRoomType === "job"
                                        ? "border-blue-500"
                                        : "border-gray-200"
                                }`}
                                onClick={() => handleRoomSelect("jobs")}
                            >
                                {/* Circle that acts as a radio button */}
                                <div
                                    className={`h-5 w-5 rounded-full border-2 ${
                                        selectedRoomType === "jobs"
                                            ? "border-blue-500"
                                            : "border-gray-400"
                                    } flex items-center justify-center`}
                                >
                                    {selectedRoomType === "jobs" && (
                                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                                    )}
                                </div>

                                {/* Job Room Content */}
                                <Briefcase className="ml-4 h-8 w-8 text-blue-500" />
                                <div className="ml-4">
                                    <h3 className="font-semibold text-gray-900">
                                        Job Rooms
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Users can view it on the catalog and
                                        subscribe.
                                    </p>
                                </div>
                            </div>

                            {/* Candidate Room Card */}
                            <div
                                className={`flex cursor-pointer items-center rounded-md border-2 p-8 transition-all ${
                                    selectedRoomType === "candidates"
                                        ? "border-blue-500"
                                        : "border-gray-200"
                                }`}
                                onClick={() => handleRoomSelect("candidates")}
                            >
                                {/* Circle that acts as a radio button */}
                                <div
                                    className={`h-5 w-5 rounded-full border-2 ${
                                        selectedRoomType === "candidates"
                                            ? "border-blue-500"
                                            : "border-gray-400"
                                    } flex items-center justify-center`}
                                >
                                    {selectedRoomType === "candidates" && (
                                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                                    )}
                                </div>

                                {/* Candidate Room Content */}
                                <Users className="ml-4 h-8 w-8 text-green-500" />
                                <div className="ml-4">
                                    <h3 className="font-semibold text-gray-900">
                                        Candidate Rooms
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Users cannot view it on the catalog and
                                        need an invitation to subscribe.
                                    </p>
                                </div>
                            </div>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Buttons */}
                <div className="mt-6 flex items-center justify-between">
                    <Button
                        type="button"
                        variant="secondary"
                        className="rounded-md bg-gray-200 px-4 py-2 text-gray-700"
                    >
                        Back
                    </Button>
                    <Button
                        type="submit"
                        disabled={!form.formState.isValid} // Disable until the form is valid
                        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700"
                    >
                        Continue
                        <ArrowRight className="mr-2 h-4 w-4" />
                    </Button>
                </div>
            </form>
        </Form>
    );
}
