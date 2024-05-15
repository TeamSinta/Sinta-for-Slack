"use client";

import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FancyMultiSelect } from "@/components/ui/fancy-multi-select";
import { FancyBox } from '@/components/ui/fancy.box';
import { getOrganizations } from '@/server/actions/organization/queries';
import { getActiveUsers, getChannels } from '@/server/slack/core';
import { getMockGreenhouseData } from '@/server/greenhouse/core';



const deliveryOptions = ["Group DM", "Direct Message", "Channels"];

const fields = [
  { value: "name", label: "Candidate Name", color: '' },
  { value: "title", label: "Job Title", color: '' },
  { value: "company", label: "Company", color: '' },
  { value: "email", label: "Email Address", color: '' }, // Assuming you will parse to get primary email
  { value: "phone", label: "Phone Number", color: '' }, // Assuming parsing for primary phone
  { value: "social_media", label: "Social Media", color: '' }, // Need to handle parsing
  { value: "recruiter_name", label: "Recruiter Name", color: '' },
  { value: "coordinator_name", label: "Coordinator Name", color: '' }
];

interface MessageButton {
    label: string;
    action: string;
}

type Option = {
  value: string;
  label: string;
  source: 'slack' | 'greenhouse'; // Define possible sources here
};

interface SlackWorkflowProps {
    onOpeningTextChange: (text: string) => void;
    onFieldsSelect: (fields: string[]) => void;
    onButtonsChange: (buttons: MessageButton[]) => void;
    onDeliveryOptionChange: (option: string) => void;
    onRecipientsChange: (recipients: Option[]) => void;
}

const SlackWorkflow: React.FC<SlackWorkflowProps> = ({
    onOpeningTextChange,
    onFieldsSelect,
    onButtonsChange,
    onDeliveryOptionChange,
    onRecipientsChange
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [openingText, setOpeningText] = useState("");
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [buttons, setButtons] = useState<MessageButton[]>([]);
    const [deliveryOption, setDeliveryOption] = useState("");
    const [selectedRecipients, setSelectedRecipients] = useState<Option[]>([]);
    const [options, setOptions] = useState<{ value: string; label: string }[]>([]);


    const handleOpeningTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOpeningText(e.target.value);
        onOpeningTextChange(e.target.value);
    };

    const handleFieldsSelect = (selectedOptions: string[]) => {
        setSelectedFields(selectedOptions);
        onFieldsSelect(selectedOptions);
    };

    const handleButtonsChange = (newButtons: MessageButton[]) => {
        setButtons(newButtons);
        onButtonsChange(newButtons);
    };

    const handleDeliveryOptionChange = (option: string) => {
        setDeliveryOption(option);
        onDeliveryOptionChange(option);
    };

    const handleRecipientsChange = (selectedOptions: Option[]) => {
      setSelectedRecipients(selectedOptions);
      onRecipientsChange(selectedOptions); // Directly passing the array of objects
  };
    const addButton = () => {
        const newButtons = [...buttons, { label: "", action: "" }];
        handleButtonsChange(newButtons);
    };

    const updateButton = (index: number, key: keyof MessageButton, value: string) => {
        const newButtons = [...buttons];
        newButtons[index][key] = value;
        handleButtonsChange(newButtons);
    };

    const removeButton = (index: number) => {
        const newButtons = buttons.filter((_, i) => i !== index);
        handleButtonsChange(newButtons);
    };

    useEffect(() => {
      setIsLoading(true);
      const fetchData = async () => {
          try {
              // Fetch both sets of data in parallel
              const [channelsData, usersData, greenhouseData] = await Promise.all([
                  getChannels(),
                  getActiveUsers(),
                  getMockGreenhouseData()
              ]);

              // Combine the data into a single array, incorporating greenhouseData
              const combinedOptions = [
                ...channelsData.map(channel => ({ ...channel, source: 'slack' })),
                ...usersData.map(user => ({ ...user, source: 'slack' })),
                { label: ` ${greenhouseData.recruiter}`, value: greenhouseData.recruiter, source: 'greenhouse' },
                { label: ` ${greenhouseData.coordinator}`, value: greenhouseData.coordinator, source: 'greenhouse' },
                { label: ` ${greenhouseData.hiringTeam}`, value: greenhouseData.hiringTeam, source: 'greenhouse' },
                { label: ` ${greenhouseData.admin}`, value: greenhouseData.admin, source: 'greenhouse' },
                { label: ` ${greenhouseData.owner}`, value: greenhouseData.owner, source: 'greenhouse' }
              ];
              setOptions(combinedOptions);

          } catch (error) {
              console.error('Failed to fetch data:', error);
          }
          setIsLoading(false);
      };

      fetchData();
    }, []);



    return (
        <div className="workflow-container mt-4">
            <Label className="text-lg font-bold">Configure Slack Alert</Label>

            {/* Opening Text */}
            <div className="my-4">
                <Label>Opening Text</Label>
                <Input
                    value={openingText}
                    onChange={handleOpeningTextChange}
                    placeholder="Enter opening text..."
                />
            </div>

            {/* Message Fields */}
            <div className="my-4">
                <Label>Select Message Fields</Label>
                <FancyBox
                    selectedOptions={selectedFields}
                    onOptionChange={handleFieldsSelect}
                    fields={fields}
                />
            </div>

            {/* Message Buttons */}
            <div className="my-4 flex flex-col">
                <Label>Message Buttons</Label>
                {buttons.map((button, idx) => (
                    <div key={idx} className="mt-4 flex items-center gap-2">
                        <Input
                            value={button.label}
                            onChange={(e) => updateButton(idx, "label", e.target.value)}
                            placeholder="Button label"
                        />
                        <Input
                            value={button.action}
                            onChange={(e) => updateButton(idx, "action", e.target.value)}
                            placeholder="Link To"
                        />
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeButton(idx)}
                        >
                            Remove
                        </Button>
                    </div>
                ))}
                <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={addButton}
                    className="my-4"
                >
                    + Add button
                </Button>
            </div>

            {/* Message Delivery */}
            <div className="my-4">
                <Label>Message Delivery</Label>
                <RadioGroup
                    value={deliveryOption}
                    onValueChange={handleDeliveryOptionChange}
                    className="mt-3 flex flex-col gap-4"
                >
                  {deliveryOptions.map((option, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <RadioGroupItem
                                value={option}
                                id={`delivery-${option}`}
                            />
                            <Label htmlFor={`delivery-${option}`}>
                                {option}
                            </Label>
                        </div>
                      ))}
                </RadioGroup>
            </div>

            {/* Multi-Select for Recipients */}
            <div className="my-4">
                <Label>Recipients</Label>
                <FancyMultiSelect
                    selectedOptions={selectedRecipients}
                    onOptionChange={handleRecipientsChange}
                    options={options}
                    loading={isLoading}

                />
            </div>
        </div>
    );
}

export default SlackWorkflow;
