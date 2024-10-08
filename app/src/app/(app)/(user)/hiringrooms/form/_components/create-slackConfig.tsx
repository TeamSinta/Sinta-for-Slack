import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SlackMessageBox from "./slack-messageBox";
import { TokenSelect } from "@/components/ui/token-multi-select";
import { ButtonAction, ButtonType } from "../../_components/message-buttons";

// Function to replace tokens with real examples
const replaceTokensWithExamples = (format: string): string => {
    return format
        .replace("{{CANDIDATE_NAME}}", "John Doe")
        .replace("{{CANDIDATE_LAST_NAME}}", "Doe")
        .replace("{{CANDIDATE_FIRST_NAME}}", "John")
        .replace("{{CANDIDATE_CREATION_DATE}}", "2023-09-24")
        .replace("{{JOB_NAME}}", "Software Engineer")
        .replace("{{JOB_POST_DATE}}", "2023-09-20");
};

// Function to format the final Slack channel name without invalid characters for Slack
const formatSlackChannelName = (name: string): string => {
    return name
        .replace(/\s+/g, "") // Remove spaces
        .replace(/[^a-zA-Z0-9-_]/g, ""); // Remove invalid characters
};

const SlackChannelNameFormat: React.FC<{
    selectedType: "Candidates" | "Jobs";
    format: string;
    setFormat: (format: string) => void;
}> = ({ selectedType, format, setFormat }) => {
    useEffect(() => {
        setFormat(format); // Ensure format is updated when initial data changes
    }, [format]);

    const handleTokensChange = (format: string) => {
        let finalFormat = replaceTokensWithExamples(format);
        finalFormat += format.replace(/{{.*?}}/g, ""); // Ensure custom variables are kept
        finalFormat = formatSlackChannelName(finalFormat);
        setFormat(finalFormat);
    };

    return (
        <div className="w-full ">
            <TokenSelect
                selectedType={selectedType}
                onTokensChange={handleTokensChange}
            />
            {format && (
                <div className="mt-6">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Generated Slack Channel Name:
                    </label>
                    <div className="rounded-lg border border-gray-300 bg-gray-100 p-4 shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-blue-600">
                                #{format}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            This is your Slack channel name preview.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

interface SlackConfigData {
    channelFormat: string;
    fields: any[]; // Add this to the definition
    buttons: any[];
    customMessageBody: string;
}

interface SlackConfigurationStepProps {
    onSaveConfig: (slackConfigData: SlackConfigData) => void;
    initialData?: SlackConfigData; // Optional initial data for pre-filling
}

const SlackConfigurationStep: React.FC<SlackConfigurationStepProps> = ({
    onSaveConfig,
    initialData,
}) => {
    const [channelFormat, setChannelFormat] = useState(
        initialData?.channelFormat || "",
    );
    const [selectedType] = useState<"Candidates" | "Jobs">("Candidates");
    const [fields, setFields] = useState<any[]>(initialData?.fields || []);
    const [customMessageBody, setCustomMessageBody] = useState(
        initialData?.customMessageBody ||
            "Hi Team 👋 \n\nWelcome to the {{role_name}} Hiring Channel! This will be our hub for communication and collaboration. Let's kick things off with a few key resources and tasks.",
    );
    const [buttons, setButtons] = useState<ButtonAction[]>(
        initialData?.buttons || [
            {
                label: "Acknowledge",
                action: "",
                type: ButtonType.AcknowledgeButton,
            },
        ],
    );

    const handleCustomMessageBodyChange = (messageBody: string) =>
        setCustomMessageBody(messageBody);
    const handleButtonsChange = (updatedButtons: ButtonAction[]) =>
        setButtons(updatedButtons);

    // Handle form submission
    const handleSubmit = () => {
        const slackConfigData = {
            channelFormat,
            customMessageBody,
            buttons,
            fields, // Make sure to pass fields
        };
        onSaveConfig(slackConfigData); // Pass data to the parent component
    };

    return (
        <div className="space-y-10">
            {/* Slack Channel Name Format Section */}
            <section className="space-y-2">
                <header className="flex items-center justify-between pb-2 pt-6 text-sm font-medium">
                    Channel Name Format
                </header>
                <Card className="rounded-lg bg-white py-6 shadow-none">
                    <CardContent>
                        <SlackChannelNameFormat
                            format={channelFormat}
                            setFormat={setChannelFormat}
                            selectedType={selectedType}
                        />
                    </CardContent>
                </Card>
            </section>

            {/* Slack Hiring Room Section */}
            <section className="space-y-4">
                <div className="text-sm font-medium">Opening Message</div>
                <SlackMessageBox
                    customMessageBody={customMessageBody}
                    buttons={buttons}
                    onSave={(message, buttons) => {
                        handleCustomMessageBodyChange(message);
                        handleButtonsChange(buttons);
                    }}
                />
            </section>

            {/* Back and Continue Buttons */}
            <div className="flex items-end justify-end space-x-4">
                <Button
                    variant="secondary"
                    onClick={() => console.log("Back to previous step")}
                    className="rounded-md bg-gray-200 px-4 py-2 text-gray-700"
                >
                    Back
                </Button>
                <Button
                    onClick={handleSubmit}
                    className="rounded-md bg-blue-600 px-4 py-2 text-white"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
};

export default SlackConfigurationStep;
