"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { createHiringroomMutation } from "@/server/actions/hiringrooms/mutations";
import { toast } from "sonner";
import { siteUrls } from "@/config/urls";
import { useRouter } from "next/navigation";

const SummaryStep = ({ formData }: { formData: any }) => {
  const router = useRouter();

  // Mutation for creating the hiring room
  const { mutateAsync, isPending: isMutatePending, reset } = useMutation({
      mutationFn: createHiringroomMutation,
      onSuccess: () => {
          // On success, refresh the router and redirect to the hiring rooms page
          reset();
          toast.success("Hiring room created successfully");

          // Redirect to the hiring rooms table page after success
          router.push(siteUrls.hiringrooms.home);
          router.refresh();

      },
      onError: (error) => {
          // Handle errors during mutation
          const errorMsg = error?.message ?? "Failed to submit Hiring room";
          toast.error(errorMsg);
      },
  });

  // Handles the submission of the form data
  const handleSubmit = async () => {
      try {
          console.log("Submitting Form Data:", formData);

          // Trigger mutation to create the hiring room
          await mutateAsync(formData);
      } catch (error) {
          console.error("Error during form submission:", error);
      }
  };


    return (
        <div className="">
            {/* Main Summary Header */}

            {/* Section 1: Hiring Room Details */}
            <Card className="mb-6 border border-gray-200">
                <div className="flex justify-between items-center p-6">
                    <h3 className="font-heading text-lg font-semibold">Hiring Room Details</h3>
                </div>
                <div className="bg-gray-50 p-6 text-sm text-gray-700 rounded-lg">
                    <p className="font-medium">Name: {formData.name}</p>
                    <p className="pt-2 font-medium">Room Type: {formData.objectField}</p>
                </div>
            </Card>

            {/* Section 2: Slack Configuration */}
            <Card className="mb-6 border border-gray-200">
                <div className="flex justify-between items-center p-6">
                    <h3 className="font-heading text-lg font-semibold">Slack Configuration</h3>
                </div>
                <div className="bg-gray-50 p-6 text-sm text-gray-700 rounded-lg">
                    <p className="font-medium">Channel Format: {formData.slackChannelFormat}</p>
                    <p className="pt-2 font-medium">Custom Message Body:</p>
                    <pre className="mt-2 whitespace-pre-line">{formData.recipient.customMessageBody}</pre>
                    <p className="pt-2 font-medium">Buttons:</p>
                    <ul>
                        {formData.recipient.messageButtons.map((button: any, index: number) => (
                            <li key={index}>{button.label}</li>
                        ))}
                    </ul>
                </div>
            </Card>

            {/* Section 3: Recipients */}
            <Card className="mb-6 border border-gray-200">
                <div className="flex justify-between items-center p-6">
                    <h3 className="font-heading text-lg font-semibold">Recipients</h3>
                </div>
                <div className="bg-gray-50 p-6 text-sm text-gray-700 rounded-lg">
                    {formData.recipient.recipients && formData.recipient.recipients.length > 0 ? (
                        <ul>
                            {formData.recipient.recipients.map((recipient: any, index: number) => (
                                <li key={index}>
                                    {recipient.label} ({recipient.value})
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No recipients specified.</p>
                    )}
                </div>
            </Card>

            {/* Section 4: Conditions */}
            <Card className="mb-6 border border-gray-200">
                <div className="flex justify-between items-center p-6">
                    <h3 className="font-heading text-lg font-semibold">Conditions</h3>
                </div>
                <div className="bg-gray-50 p-6 text-sm text-gray-700 rounded-lg">
                    {formData.conditions && formData.conditions.length > 0 ? (
                        <ul>
                            {formData.conditions.map((condition: any, index: number) => (
                                <li key={index}>
                                    {condition.field.label} is {condition.condition} {condition.value} {condition.unit}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No conditions specified.</p>
                    )}
                </div>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
                <Button
                    className="rounded-md bg-blue-600 px-4 py-2 text-white"
                    onClick={handleSubmit}
                    disabled={isMutatePending}
                >
                    {isMutatePending ? "Submitting..." : "Submit Workflow"}
                </Button>
            </div>
        </div>
    );
};

export default SummaryStep;
