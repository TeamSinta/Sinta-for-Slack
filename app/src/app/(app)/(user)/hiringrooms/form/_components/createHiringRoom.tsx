"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import DetailsStep from "./create-general"; // This is the details step
import SlackConfigurationStep from "./create-slackConfig";
import ConditionsStep from "./create-conditons";
import TriggerActionsComponent from "./create-triggerActions";
import Image2 from "./shoot.png"
import Image from "next/image";
import { RecipientsStep } from "./create-receipients";
import SummaryStep from "./view-summary";
import { Condition } from "../../_components/new-hiringroomForm";


interface FormValues {
    name: string;
    objectField: string;
    alertType: string;
    recipient: {
        openingText: string;
        messageFields: string[]; // Define the correct type for message fields
        messageButtons: {
            label: string;
            type: string;
            action: string;
        }[]; // Define the correct structure for message buttons
        messageDelivery: string;
        recipients: {
            label: string;
            value: string;
            source: string;
        }[]; // Define the structure for recipients
        customMessageBody: string;
    };
    conditions: Condition[]; // Ensure conditions is of type Condition[]
    organizationId: string;
    slackChannelFormat: string;
    triggerConfig: {
        apiUrl: string;
        processor: string;
    };
}



export default function CreateHiringRoom() {
    const [currentStep, setCurrentStep] = useState("Details");
    const [formData, setFormData] = useState<FormValues>({
      name: "",
      objectField: "",
      alertType: "timebased",
      recipient: {
          openingText: "",
          messageFields: [],
          messageButtons: [],
          messageDelivery: "",
          recipients: [],
          customMessageBody: "",
      }, // Set default recipient config
      conditions: [], // Empty conditions array
      organizationId: "",
      slackChannelFormat: "", // Set default slack channel format
      triggerConfig: {
          apiUrl: "",
          processor: "",
      },
  });

    const steps = [
        { label: "Details", step: "Details" },
        { label: "Conditions", step: "Conditions" },
        { label: "Slack Configuration", step: "Slack Configuration" },
        { label: "Recipients", step: "Recipients" },
        { label: "Automated Actions", step: "Automated Actions" },
        { label: "Summary", step: "Summary" },
    ];

    const handleDataSubmit = (data: FormValues) => {
      setFormData((prevData) => ({
          ...prevData,
          ...data,
          triggerConfig: {
              apiUrl: data.triggerConfig.apiUrl,
              processor: data.triggerConfig.processor,
          },
      }));
      setCurrentStep("Conditions"); // Move to the Conditions step after submission
  };

  // Handle data submission from the Conditions step
  const handleConditionsSubmit = (conditionsData: Condition[], eventData: { alertType: string }) => {
    setFormData((prevData) => ({
        ...prevData,
        conditions: conditionsData,
        alertType: eventData.alertType, // Save the selected event's alert type
    }));
    setCurrentStep("Slack Configuration"); // Proceed to the next step
};
  // Handle Slack configuration submission
  const handleSlackConfigSubmit = (slackConfigData: {
    channelFormat: string;
    fields: any[];
    buttons: any[];
    customMessageBody: string;
}) => {
    setFormData((prevData) => ({
        ...prevData,
        slackChannelFormat: slackConfigData.channelFormat, // Only slackChannelFormat stays here
        recipient: {
            ...prevData.recipient, // Update the recipient object with Slack config data
            fields: slackConfigData.fields,
            messageButtons: slackConfigData.buttons,
            customMessageBody: slackConfigData.customMessageBody,
        },
    }));
    setCurrentStep("Recipients"); // Proceed to the Automated Actions step
};


  // Handle automated actions data submission
  const handleAutomatedActionsSubmit = (actionsData: any) => {
      setFormData((prevData) => ({
          ...prevData,
          automatedActions: actionsData,
      }));
      setCurrentStep("Summary"); // Proceed to the next step (Recipients)
  };

  // Handle recipients submission
  const handleRecipientsSubmit = (recipientsData: any) => {
    setFormData((prevData) => ({
        ...prevData,
        recipient: {
            ...prevData.recipient,
            recipients: recipientsData, // Only save recipients here
        },
    }));
    setCurrentStep("Automated Actions"); // Proceed to the Summary step
};



    const renderStepComponent = () => {
        switch (currentStep) {
            case "Details":
                return <DetailsStep onDataSubmit={handleDataSubmit} initialData={formData} />;
            case "Conditions":
                return (
<ConditionsStep
    onSaveConditions={handleConditionsSubmit}
    initialConditions={formData.conditions}
    initialEvent={{ alertType: formData.alertType }}
    objectField={formData.objectField}
/>            );
            case "Slack Configuration":
                return (
                  <SlackConfigurationStep
                  onSaveConfig={handleSlackConfigSubmit}
                  initialData={{
                      channelFormat: formData.slackChannelFormat,
                      fields: formData.recipient.messageFields,
                      buttons: formData.recipient.messageButtons,
                      customMessageBody: formData.recipient.customMessageBody,
                      objectField: formData.objectField,
                  }}
              />
                );
            case "Automated Actions":
                return (
                    <TriggerActionsComponent
                        onSaveAutomatedActions={handleAutomatedActionsSubmit}
                    />
                );
                case "Recipients":
                  return (
                    <RecipientsStep
          onSaveRecipients={handleRecipientsSubmit}
          onBack={() => setCurrentStep("Slack Configuration")}
          initialRecipients={formData.recipient.recipients} // Pass the previously selected recipients
      />

                  );
              // Summary...
            // Add other steps as needed
            case "Summary":
              case "Summary":
                return (<SummaryStep formData={formData} />);
            default:
                return null;
        }
    };

    // Dynamic Title Based on Current Step
    const renderTitle = () => {
        switch (currentStep) {
            case "Details":
                return (
                    <>
                        <div className="mb-6">
                            <div className="flex items-center">
                                <h2 className="font-heading text-xl font-semibold">
                                    Hire Room Details
                                </h2>
                            </div>
                            <p className="mt-2 text-xs font-medium text-gray-500">
                                Provide basic information for your hire room.
                            </p>
                        </div>
                    </>
                );
            case "Conditions":
                return (
                    <>
                        <div className="mb-6">
                            <div className="flex items-center">
                                <h2 className="font-heading text-xl font-semibold">
                                    Filter Conditions
                                </h2>
                            </div>
                            <p className="mt-2 text-xs font-medium text-gray-500">
                                Set up rules to refine your workflow based on
                                specific conditions.
                            </p>
                        </div>
                    </>
                );
            case "Slack Configuration":
                return (
                    <>
                        <div className="mb-2">
                            <div className="flex items-center">
                                <h2 className="font-heading text-xl font-semibold">
                                    Slack Configuration
                                </h2>
                            </div>
                            <p className="mt-2 text-xs font-medium text-gray-500">
                                Configure Slack notifications and channels.
                            </p>
                        </div>
                    </>
                );
            case "Automated Actions":
                return (
                    <>
                        <div className="mb-6">
                            <div className="flex items-center">
                                <h2 className="font-heading text-xl font-semibold">
                                    Automated Actions
                                </h2>
                            </div>
                            <p className="mt-2 text-xs font-medium text-gray-500">
                                Set up automated actions for your hire room.
                            </p>
                        </div>
                    </>
                );
            case "Recipients":
                return (
                    <>
                        <div className="mb-6">
                            <div className="flex items-center">
                                <h2 className="font-heading text-xl font-semibold">
                                    Recipients
                                </h2>
                            </div>
                            <p className="mt-2 text-xs font-medium text-gray-500">
                                Set up who will be invited to your hire room.
                            </p>
                        </div>
                    </>
                );
            case "Summary":
                return (
                    <>
                        <div className="mb-6">
                            <div className="flex items-center">
                                <h2 className="font-heading text-xl font-semibold">
                                    Summary
                                </h2>
                            </div>
                            <p className="mt-2 text-xs font-medium text-gray-500">
                                Review and confirm the details of your hire room.
                            </p>
                        </div>
                    </>
                );
            default:
                return "";
        }
    };

    return (
        <motion.div
            className="flex min-h-screen flex-col bg-gray-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Main Content Box */}
            <div className="mx-10 mb-6 mt-6 flex  flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                {/* Sidebar and Product Details Combined */}
                <div className="flex flex-1 flex-col">
                    {/* Top Toolbar with Exit Button */}
                    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                        <Link href="/hiringrooms">
                            <button className="text-gray-400 hover:text-gray-600">
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    ></path>
                                </svg>
                            </button>
                        </Link>
                        <div className="text-sm font-medium text-gray-700">
                            Add a new room
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="container flex flex-1">
                        {/* Sidebar */}
                        <motion.div
                            className="w-1/4 border-gray-200 bg-white p-6"
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.6 }}
                        >
                            <nav className="relative space-y-6">
                                {/* Vertical gray line */}
                                <div className="absolute left-0 top-0 h-full w-[2px] bg-gray-300"></div>

                                {steps.map((step, index) => (
                                    <a
                                        key={index}
                                        onClick={() =>
                                            setCurrentStep(step.step)
                                        } // Make steps clickable
                                        className={`relative flex cursor-pointer items-center space-x-3 pl-4 text-sm font-medium transition-all ${
                                            currentStep === step.step
                                                ? "font-semibold text-blue-500"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {/* Vertical line with blue highlight on active step */}
                                        <div
                                            className={`absolute left-0 h-full w-[2px] transition-all ${
                                                currentStep === step.step
                                                    ? "bg-blue-500"
                                                    : "bg-transparent"
                                            }`}
                                        ></div>
                                        <span>{step.label}</span>
                                    </a>
                                ))}
                            </nav>
                        </motion.div>

                        {/* Main Content - Changing Title Based on Step */}
                        <motion.div
                            className="flex-1 bg-white p-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.7 }}
                        >
                            <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                                {renderTitle()} {/* Dynamic title */}
                            </h2>

                            {/* Render the current step component */}
                            {renderStepComponent()}
                        </motion.div>
                    </div>
                </div>

                {/* Right Panel (Help Section) */}
                <motion.div
                    className="w-1/4 border-l border-gray-200 bg-gray-50 p-6"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="space-y-2">
                        {/* Video Help Section */}
                        <h3 className="pt-4 text-sm font-semibold text-gray-900">
                            Check out our help video?
                        </h3>
                        <div className="aspect-w-12 aspect-h-9 w-3/4">
                            {/* <iframe
                                className="h-full w-full rounded-sm shadow-md"
                                src="https://www.youtube.com/watch?v=4_Gm2RKMzdo"
                                title="Product details help video"
                                frameBorder="0"
                                allowFullScreen
                            /> */}
                            <Image alt="me" className="h-full w-full rounded-sm shadow-md" src={Image2}/>
                        </div>
                        <div className="border-b border-gray-200 py-4"> </div>

                        {/* Help Text */}
                        <div>
                            <h3 className="pb-2 pt-6 text-sm font-bold text-gray-900">
                                What is a Hire Room?
                            </h3>
                            <p className="py-2 text-sm text-gray-600">
                            A Hiring Room is an automated Slack channel
                            that centralizes discussions, updates, and
                            debriefs for streamlined recruitment collaboration.
                            Use our step by step builder to get started.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
