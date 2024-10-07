import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { createHiringroomMutation } from "@/server/actions/hiringrooms/mutations";
import { toast } from "sonner";
import { siteUrls } from "@/config/urls";
import { useRouter } from "next/navigation";
import SlackMessageBox from "./slack-messageBox"; // Import the updated view-only SlackMessageBox
import ViewSlackMessageBox from "./view-slack-messagebox";

const SummaryStep = ({ formData }: { formData: any }) => {
  const router = useRouter();

  const { mutateAsync, isPending: isMutatePending, reset } = useMutation({
    mutationFn: createHiringroomMutation,
    onSuccess: () => {
      reset();
      toast.success("Hiring room created successfully");
      router.push(siteUrls.hiringrooms.home);
      router.refresh();
    },
    onError: (error) => {
      const errorMsg = error?.message ?? "Failed to submit Hiring room";
      toast.error(errorMsg);
    },
  });

  const handleSubmit = async () => {
    try {
      await mutateAsync(formData);
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  };

  return (
    <div className="">
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
        <div className="bg-gray-50 px-6 pt-2 pb-6 text-sm text-gray-700 rounded-lg">
          {/* Slack Channel Name */}
          <div className="mt-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Generated Slack Channel Name:
            </label>
            <div className="p-4 rounded-lg shadow-md bg-gray-100 border border-gray-300">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-blue-600">
                  #{formData.slackChannelFormat}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                This is your Slack channel name preview.
              </p>
            </div>
          </div>

          {/* Slack Message Box */}
          <p className="pt-4 font-medium">Custom Message Body:</p>
          <ViewSlackMessageBox
            customMessageBody={formData.recipient.customMessageBody}
            buttons={formData.recipient.messageButtons}
          />
        </div>
      </Card>

      {/* Section 3: Recipients */}
      <Card className="mb-6 border border-gray-200">
        <div className="flex justify-between items-center p-6">
          <h3 className="font-heading text-lg font-semibold">Recipients</h3>
        </div>
        <div className="bg-gray-50 p-6 text-sm text-gray-700 rounded-lg">
          {formData.recipient.recipients.length > 0 ? (
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
