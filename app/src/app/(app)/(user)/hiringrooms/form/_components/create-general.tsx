import { useState, useEffect } from "react";
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
        apiUrl: z.string().nullable().optional(),
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
    initialData, // Add initialData for pre-filling
}: {
    onDataSubmit: (data: any) => void;
    initialData: any;
}) {
    const form = useForm({
        resolver: zodResolver(FormSchema),
        mode: "onChange", // Trigger validation on input change
        defaultValues: {
            objectField: initialData.objectField || "",
            name: initialData.name || "",
            triggerConfig: {
                apiUrl: initialData.triggerConfig?.apiUrl || "",
                processor: initialData.triggerConfig?.processor || "",
            },
        },
    });

    const [selectedRoomType, setSelectedRoomType] = useState<string>(initialData.objectField || "");
    const { watch, formState, setValue, handleSubmit } = form;

    // Watch the inputs to detect changes in real-time
    const watchedName = watch("name");
    const watchedObjectField = watch("objectField");

    // Enable button based on validation and if fields are filled
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

    useEffect(() => {
        // Re-check the validity whenever the watched values change
        setIsSubmitDisabled(!(watchedName && watchedObjectField && formState.isValid));
    }, [watchedName, watchedObjectField, formState.isValid]);

    const handleRoomSelect = (roomType: string) => {
        setSelectedRoomType(roomType);
        setValue("objectField", roomType, { shouldValidate: true });

        const selectedConfig = objectFieldOptions.find(option => option.name.toLowerCase() === roomType);
        if (selectedConfig) {
            setValue("triggerConfig", {
                apiUrl: selectedConfig.apiUrl,
                processor: "",
            });
        }
    };

    const onSubmit = (data: any) => {
        onDataSubmit(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Input */}
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

                {/* Room Type Selector */}
                <FormField
                    control={form.control}
                    name="objectField"
                    render={() => (
                        <FormItem className="space-y-4">
                            <FormLabel>Select a Room Type</FormLabel>

                            {/* Job Room Card */}
                            <div
                                className={`flex cursor-pointer items-center rounded-md border-2 p-8 transition-all ${
                                    selectedRoomType === "jobs"
                                        ? "border-blue-500"
                                        : "border-gray-200"
                                }`}
                                onClick={() => handleRoomSelect("jobs")}
                            >
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

                                <Briefcase className="ml-4 h-8 w-8 text-blue-500" />
                                <div className="ml-4">
                                    <h3 className="font-semibold text-gray-900">
                                        Job Rooms
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Users can view it on the catalog and subscribe.
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

                                <Users className="ml-4 h-8 w-8 text-green-500" />
                                <div className="ml-4">
                                    <h3 className="font-semibold text-gray-900">
                                        Candidate Rooms
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Users cannot view it on the catalog and need an invitation to subscribe.
                                    </p>
                                </div>
                            </div>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Submit Button */}
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
                        disabled={isSubmitDisabled} // Disable if form is not valid or fields are empty
                        className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition-all ${
                            isSubmitDisabled ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        Continue
                        <ArrowRight className="mr-2 h-4 w-4" />
                    </Button>
                </div>
            </form>
        </Form>
    );
}
