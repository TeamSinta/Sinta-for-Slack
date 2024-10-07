import React, { useEffect, useState } from "react";
import Image from "next/image";
import slackLogo from "../../../../../../../public/slack-logo.png";
import sintaLogo from "../../../../../../../public/sintalogo.png";
import { Button } from "@/components/ui/button";
import { ButtonAction, ButtonType, UpdateActionType } from "../../_components/message-buttons";
import parse from "html-react-parser";

// Function to replace custom variables like {{Interviewer}} with blue badges
const replaceCustomVariables = (htmlContent: string) => {
  const customVariablePattern = /{{(.*?)}}/g;
  return htmlContent.replace(customVariablePattern, (match, variable) => {
    return `<span class="inline-block mx-1 rounded border border-blue-400 bg-blue-50 px-2 py-1 text-sm font-semibold text-blue-500">${variable}</span>`;
  });
};

// Slack message box in view-only mode
const ViewSlackMessageBox: React.FC<{
  customMessageBody: string;
  buttons: ButtonAction[];
}> = ({ customMessageBody, buttons }) => {
  const [messageContent, setMessageContent] = useState(customMessageBody);
  const [messageButtons, setMessageButtons] = useState<ButtonAction[]>(buttons || []);

  useEffect(() => {
    setMessageContent(customMessageBody);
    setMessageButtons(buttons || []); // Ensure messageButtons is an array
  }, [customMessageBody, buttons]);

  // Convert markdown and custom variables into displayable content
  const displayContent = parse(replaceCustomVariables(messageContent));

  const getButtonStyle = (button: ButtonAction) => {
    switch (button.type) {
      case ButtonType.AcknowledgeButton:
      case ButtonType.LinkButton:
        return "bg-white text-black border border-gray-300";
      case ButtonType.UpdateButton:
        return button.updateType === UpdateActionType.MoveToNextStage
          ? "bg-green-600 text-white"
          : "bg-red-600 text-white";
      default:
        return "bg-gray-200 text-black border border-gray-300";
    }
  };

  return (
    <div className="mt-4">
      <div className="rounded-md border bg-white shadow-sm">
        <div className="flex items-center justify-between rounded-t-md bg-fuchsia-950 p-3">
          <div className="flex items-center space-x-2">
            <Image src={slackLogo} alt="Slack Logo" className="h-6 w-6" />
            <span className="text-sm font-semibold text-white">Hiring Room</span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start">
            <Image src={sintaLogo} alt="User Avatar" className="h-10 w-10 rounded" />
            <div className="ml-4 flex-1">
              <div className="flex items-center font-semibold text-gray-700">
                Sinta
                <span className="ml-1 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-500">
                  APP
                </span>
              </div>
              <div className="text-xs text-gray-500">3:53 PM</div>

              {/* Display the message content */}
              <div className="mt-2 text-sm text-gray-700">
                {displayContent}

                {/* Render buttons in final display */}
                <div className="mt-6 mb-2 flex space-x-2">
                  {messageButtons.map((button, index) => (
                    <Button key={index} className={getButtonStyle(button)}>
                      {button.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSlackMessageBox;
