import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { createHiringroomMutation } from "@/server/actions/hiringrooms/mutations";
import { toast } from "sonner";
import { siteUrls } from "@/config/urls";
import { useRouter } from "next/navigation";
import ViewSlackMessageBox from "./view-slack-messagebox";
import { Badge } from "@/components/ui/badge";
import slackLogo from "../../../../../../../public/slack-logo.png";
import greenhouseLogo from "../../../../../../../public/greenhouselogo.png";
import Image, { StaticImageData } from "next/image";

type SourceType = "slack" | "greenhouse";

interface Recipient {
  label: string;
  value: string;
  source: SourceType;
}

const logoMap: Record<SourceType, StaticImageData> = {
  slack: slackLogo,
  greenhouse: greenhouseLogo,
};

const badgeStyle = (variable: string, color: string = "blue") => {
  return `<span class="inline-block mx-1 rounded border border-${color}-400 bg-${color}-50 px-2 py-1 text-sm font-semibold text-${color}-500">${variable}</span>`;
};

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
          {/* Name */}
          <p className="font-medium flex gap-2">
            Name:
            <h3 className="font-heading text-md font-bold"> {formData.name}</h3>
          </p>
          {/* Room Type */}
          <p className="pt-2 font-medium">
            Room Type:{" "}
            <span
              dangerouslySetInnerHTML={{
                __html: badgeStyle(formData.objectField),
              }}
            />
          </p>
          {/* Event Type */}
          <p className="pt-2 font-medium">
            Event Type:{" "}
            <span
              dangerouslySetInnerHTML={{
                __html: badgeStyle(formData.alertType),
              }}
            />
          </p>
          {/* Conditions */}
          {formData.conditions.length > 0 ? (
            <div className="mt-4">
              <h4 className="font-medium">Conditions:</h4>
              <ul className="list-disc list-inside mt-2">
                {formData.conditions.map((condition: any, index: number) => (
                  <li key={index} className="flex items-center">
                    <Badge  variant="secondary" className="flex items-center bg-white hover:bg-white-200 border-blue-300 text-blue-600 space-x-2 py-2 shadow rounded ">
                    <Image
                      src={greenhouseLogo}
                      alt="greenhouse-logo"
                      className="mr-2 h-4 w-4"
                    />
                    {condition.field}
                    </Badge>
                    <span className="mx-1 font-medium">{condition.condition}</span>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: badgeStyle(condition.value),
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No conditions specified.</p>
          )}
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
            <div className="flex flex-wrap gap-2">
              {formData.recipient.recipients.map(
                (recipient: Recipient, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex bg-white items-center space-x-2 py-2 shadow rounded-md"
                  >
                    <Image
                      src={logoMap[recipient.source]} // Dynamically load the correct logo based on source
                      alt={`${recipient.source}-logo`}
                      className="mr-1 h-4 w-4"
                    />
                    {recipient.label}
                  </Badge>
                )
              )}
            </div>
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
