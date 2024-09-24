'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Briefcase, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

// Form validation schema using zod
const FormSchema = z.object({
  roomType: z.enum(["job", "candidate"], {
    required_error: "You need to select a room type.",
  }),
  name: z.string().nonempty("Name is required"),
});

export default function DetailsStep({ onDataSubmit }) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      roomType: "",
      name: "",
    },
  });

  const [selectedRoomType, setSelectedRoomType] = useState(""); // Track selected room type

  const handleRoomSelect = (roomType) => {
    setSelectedRoomType(roomType); // Update selected room type
    form.setValue("roomType", roomType); // Update the form state
  };

  function handleSubmit(data) {
    onDataSubmit(data); // Send the data to parent on submit
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                className={`cursor-pointer flex items-center border-2 p-8 rounded-md transition-all ${
                  selectedRoomType === "job" ? "border-blue-500" : "border-gray-200"
                }`}
                onClick={() => handleRoomSelect("job")}
              >
                {/* Circle that acts as a radio button */}
                <div
                  className={`h-5 w-5 rounded-full border-2 ${
                    selectedRoomType === "job" ? "border-blue-500" : "border-gray-400"
                  } flex items-center justify-center`}
                >
                  {selectedRoomType === "job" && (
                    <div className="h-3 w-3 bg-blue-500 rounded-full" />
                  )}
                </div>

                {/* Job Room Content */}
                <Briefcase className="h-8 w-8 text-blue-500 ml-4" />
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">Job Rooms</h3>
                  <p className="text-sm text-gray-500">
                    Users can view it on the catalog and subscribe.
                  </p>
                </div>
              </div>

              {/* Candidate Room Card */}
              <div
                className={`cursor-pointer flex items-center border-2 p-8 rounded-md transition-all ${
                  selectedRoomType === "candidate" ? "border-blue-500" : "border-gray-200"
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
                    <div className="h-3 w-3 bg-blue-500 rounded-full" />
                  )}
                </div>

                {/* Candidate Room Content */}
                <Users className="h-8 w-8 text-green-500 ml-4" />
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">Candidate Rooms</h3>
                  <p className="text-sm text-gray-500">
                    Users cannot view it on the catalog and need an invitation to subscribe.
                  </p>
                </div>
              </div>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button
            type="button"
            variant="secondary"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={!form.formState.isValid} // Disable until the form is valid
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-md hover:bg-blue-700 transition-all"
          >
            Continue
            <ArrowRight className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
