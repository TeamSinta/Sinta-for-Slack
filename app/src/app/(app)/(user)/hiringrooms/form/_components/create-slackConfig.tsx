import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SlackMessageBox from "./slack-messageBox";
import { TokenSelect } from "@/components/ui/token-multi-select";
import { ButtonAction, ButtonType } from "../../_components/message-buttons";
import { formatSlackChannelName, replaceTokensWithExamples } from "@/utils/formating";



const SlackChannelNameFormat: React.FC<{
  selectedType: "Candidates" | "Jobs";
  format: string;
  setFormat: (format: string) => void;
}> = ({ selectedType, format, setFormat }) => {

  // Ensure format is updated when initial data changes
  useEffect(() => {
      setFormat(format); // Set tokenized format for saving
  }, [format, setFormat]);

  // Function to handle token changes, saving tokenized format but showing example preview
  const handleTokensChange = (tokenizedFormat: string) => {
      // Save the tokenized format, e.g. {{CANDIDATE_FIRST_NAME}} into state
      setFormat(tokenizedFormat);

      // For preview, show example replacements while keeping tokens intact for saving
      let previewFormat = replaceTokensWithExamples(tokenizedFormat); // Example: "John Doe" for {{CANDIDATE_FIRST_NAME}}

      // Format the final preview to match Slack's channel naming conventions (removing spaces and invalid characters)
      previewFormat = formatSlackChannelName(previewFormat);
  };

  // Preview for displaying with example values replaced
  const previewFormat = formatSlackChannelName(replaceTokensWithExamples(format)); // For displaying examples in preview

  return (
    <div className="w-full">
      <TokenSelect selectedType={selectedType} onTokensChange={handleTokensChange} />
      {format && (
        <div className="mt-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Generated Slack Channel Name:
          </label>
          <div className="p-4 rounded-lg shadow-md bg-gray-100 border border-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-blue-600">
                #{previewFormat} {/* This shows example values like "John Doe" */}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
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
  objectField: string;
}


interface SlackConfigurationStepProps {
    onSaveConfig: (slackConfigData: SlackConfigData) => void;
    initialData?: SlackConfigData; // Optional initial data for pre-filling
}

const SlackConfigurationStep: React.FC<SlackConfigurationStepProps> = ({ onSaveConfig, initialData }) => {
  const [channelFormat, setChannelFormat] = useState(initialData?.channelFormat || ""); // Tokenized format
  const [selectedType] = useState<"Candidates" | "Jobs">(
      initialData?.objectField === "Jobs" ? "Jobs" : "Candidates"
  );
  const [fields, setFields] = useState<any[]>(initialData?.fields || []);
  const [customMessageBody, setCustomMessageBody] = useState(
      initialData?.customMessageBody || "Hi Team 👋 \n\nWelcome to the {{role_name}} Hiring Channel! This will be our hub for communication and collaboration. Let's kick things off with a few key resources and tasks."
  );
  const [buttons, setButtons] = useState<ButtonAction[]>(
      initialData?.buttons || [
          { label: "Acknowledge", action: "", type: ButtonType.AcknowledgeButton },
      ]
  );

  const handleCustomMessageBodyChange = (messageBody: string) => setCustomMessageBody(messageBody);
  const handleButtonsChange = (updatedButtons: ButtonAction[]) => setButtons(updatedButtons);

  // Handle form submission
  const handleSubmit = () => {
      const slackConfigData = {
          channelFormat, // Save the tokenized format here
          customMessageBody,
          buttons,
          fields, // Make sure to pass fields
          objectField: selectedType, // Make sure to pass objectField
      };
      onSaveConfig(slackConfigData); // Pass data to the parent component
  };

  return (
      <div className="space-y-10">
          {/* Slack Channel Name Format Section */}
          <section className="space-y-2">
              <header className="flex items-center text-sm font-medium justify-between pt-6 pb-2">
                  Channel Name Format
              </header>
              <Card className="rounded-lg bg-white py-6 shadow-none">
                  <CardContent>
                      <SlackChannelNameFormat
                          format={channelFormat} // Pass tokenized format
                          setFormat={setChannelFormat} // Ensure tokenized format is saved
                          selectedType={selectedType} // Pass the selectedType
                      />
                  </CardContent>
              </Card>
          </section>

          {/* Slack Hiring Room Section */}
          <section className="space-y-4">
              <div className="text-sm font-medium">Opening Message</div>
              <SlackMessageBox
                  customMessageBody={customMessageBody}
                  onCustomMessageBodyChange={handleCustomMessageBodyChange}
                  buttons={buttons}
                  onButtonsChange={handleButtonsChange}
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
              <Button onClick={handleSubmit} className="rounded-md bg-blue-600 px-4 py-2 text-white">
                  Continue
              </Button>
          </div>
      </div>
  );
};

export default SlackConfigurationStep;
