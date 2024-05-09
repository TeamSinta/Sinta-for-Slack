import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FancyMultiSelect } from "@/components/ui/fancy-multi-select";
import { FancyBox } from "@/components/ui/fancy.box";

const recipientOptions = [
    { value: "general", label: "#general" },
    { value: "random", label: "#random" },
    { value: "hr", label: "#hr" },
    { value: "it_support", label: "#it_support" },
    { value: "marketing", label: "#marketing" },
    { value: "sales", label: "#sales-hiring-team" },
    { value: "dev_ops", label: "#dev_ops" },
    { value: "product", label: "#product" },
    { value: "customer_support", label: "#customer_support" },
    { value: "finance", label: "#finance" },
    { value: "john_doe", label: "@Chris Wu" },
    { value: "jane_smith", label: "@Jane Smith" },
    { value: "alice_johnson", label: "@Alice Johnson" },
    { value: "bob_brown", label: "@Bob Brown" },
    { value: "natalie_white", label: "@Natalie White" },
    { value: "david_wilson", label: "@David Wilson" },
    { value: "emma_taylor", label: "@Emma Taylor" },
];
const deliveryOptions = ["Group DM", "Direct Message", "Channels"];

interface RecipientOption {
    value: string;
    label: string;
}

interface MessageButton {
    label: string;
    action: string;
}

interface SlackWorkflowProps {
    onOpeningTextChange: (text: string) => void;
    onFieldsSelect: (fields: string[]) => void;
    onButtonsChange: (buttons: MessageButton[]) => void;
    onDeliveryOptionChange: (option: string) => void;
    onRecipientsChange: (recipients: string[]) => void;
}

const SlackWorkflow: React.FC<SlackWorkflowProps> = ({
    onOpeningTextChange,
    onFieldsSelect,
    onButtonsChange,
    onDeliveryOptionChange,
    onRecipientsChange,
}) => {
    const [openingText, setOpeningText] = useState("");
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [buttons, setButtons] = useState<MessageButton[]>([]);
    const [deliveryOption, setDeliveryOption] = useState("");
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

    const handleOpeningTextChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
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

    const handleRecipientsChange = (selectedOptions: string[]) => {
        setSelectedRecipients(selectedOptions);
        onRecipientsChange(selectedOptions);
    };

    const addButton = () => {
        const newButtons = [...buttons, { label: "", action: "" }];
        handleButtonsChange(newButtons);
    };

    const updateButton = (
        index: number,
        key: keyof MessageButton,
        value: string,
    ) => {
        const newButtons = [...buttons];
        newButtons[index][key] = value;
        handleButtonsChange(newButtons);
    };

    const removeButton = (index: number) => {
        const newButtons = buttons.filter((_, i) => i !== index);
        handleButtonsChange(newButtons);
    };

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
                    fields={[
                        { value: "full_name", label: "Full name", color: "" },
                        { value: "email", label: "Email", color: "" },
                        {
                            value: "website",
                            label: "Website",
                            color: "",
                        },
                        {
                            value: "lead_source",
                            label: "Lead source",
                            color: "",
                        },
                        {
                            value: "owner_name",
                            label: "Owner's name",
                            color: "",
                        },
                    ]}
                />
            </div>

            {/* Message Buttons */}
            <div className="my-4 flex flex-col">
                <Label>Message Buttons</Label>
                {buttons.map((button, idx) => (
                    <div key={idx} className="mt-4 flex items-center gap-2">
                        <Input
                            value={button.label}
                            onChange={(e) =>
                                updateButton(idx, "label", e.target.value)
                            }
                            placeholder="Button label"
                        />
                        <Input
                            value={button.action}
                            onChange={(e) =>
                                updateButton(idx, "action", e.target.value)
                            }
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
                    options={recipientOptions}
                />
            </div>
        </div>
    );
};

export default SlackWorkflow;
