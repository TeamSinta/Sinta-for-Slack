"use client";

import { SetStateAction, useState } from "react";
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
    roomType: z.enum(["job", "candidate"], {
        required_error: "You need to select a room type.",
    }),
    name: z.string().nonempty("Name is required"),
});

export default function DetailsStep({
    onDataSubmit,
}: {
    onDataSubmit: (data: any) => void;
}) {
    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            roomType: "",
            name: "",
        },
    });

    const [selectedRoomType, setSelectedRoomType] = useState(""); // Track selected room type

    const handleRoomSelect = (roomType: string) => {
        setSelectedRoomType(roomType); // Update selected room type
        form.setValue("roomType", roomType); // Update the form state
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
                    name="roomType"
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
                                onClick={() => handleRoomSelect("job")}
                            >
                                {/* Circle that acts as a radio button */}
                                <div
                                    className={`h-5 w-5 rounded-full border-2 ${
                                        selectedRoomType === "job"
                                            ? "border-blue-500"
                                            : "border-gray-400"
                                    } flex items-center justify-center`}
                                >
                                    {selectedRoomType === "job" && (
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
                                    selectedRoomType === "candidate"
                                        ? "border-blue-500"
                                        : "border-gray-200"
                                }`}
                                onClick={() => handleRoomSelect("candidate")}
                            >
                                {/* Circle that acts as a radio button */}
                                <div
                                    className={`h-5 w-5 rounded-full border-2 ${
                                        selectedRoomType === "candidate"
                                            ? "border-blue-500"
                                            : "border-gray-400"
                                    } flex items-center justify-center`}
                                >
                                    {selectedRoomType === "candidate" && (
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
