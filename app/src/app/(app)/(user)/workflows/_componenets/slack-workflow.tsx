import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FancyMultiSelect } from '@/components/ui/fancy-multi-select';
import { FancyBox } from '@/components/ui/fancy.box';

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

interface MessageButton {
    label: string;
    action: string;
}

function SlackWorkflow() {
    const [openingText, setOpeningText] = useState('');
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [buttons, setButtons] = useState<MessageButton[]>([]);
    const [deliveryOption, setDeliveryOption] = useState('DM or Channel');

    const fieldsOptions = [
      { value: 'full_name', label: 'Full name' },
      { value: 'email', label: 'Email' },
      { value: 'website', label: 'Website' },
      { value: 'lead_source', label: 'Lead source' },
      { value: 'owner_name', label: "Owner's name" }
    ];

    const deliveryOptions = ['Group DM', 'Direct Message', 'Channels'];

    const addButton = () => setButtons([...buttons, { label: '', action: '' }]);

    const handleButtonChange = (idx: number, key: keyof MessageButton, value: string) => {
        const newButtons = [...buttons];
        const button = newButtons[idx];

        if (button) {
            button[key] = value;
            setButtons(newButtons);
        }
    };


    return (
        <div className="workflow-container mt-4">
            <Label className="text-lg font-bold">Configure Sinta Alert</Label>

            {/* Opening Text */}
            <div className="my-4">
                <Label>Opening Text</Label>
                <Input
                    value={openingText}
                    onChange={(e) => setOpeningText(e.target.value)}
                    placeholder="Enter opening text..."
                />
            </div>

            {/* Message Fields */}
            <div className="my-4">
        <Label>Select Message Fields</Label>
        <FancyBox fields={fieldsOptions} />
      </div>


            {/* Message Buttons */}
            <div className="my-4 flex flex-col">
                <Label>Message Buttons</Label>
                {buttons.map((button, idx) => (
                    <div key={idx} className="flex gap-2 items-center mt-4">
                        <Input
                            value={button.label}
                            onChange={(e) => handleButtonChange(idx, 'label', e.target.value)}
                            placeholder="Button label"
                        />
                        <Input
                            value={button.action}
                            onChange={(e) => handleButtonChange(idx, 'action', e.target.value)}
                            placeholder="Link To"
                        />
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                const newButtons = buttons.filter((_, i) => i !== idx);
                                setButtons(newButtons);
                            }}
                        >
                            Remove
                        </Button>
                    </div>
                ))}
                <Button
                    variant="outline"
                    size="sm"
                    type='button'
                    onClick={addButton}
                    className='my-4'
                >
                    + Add button
                </Button>
            </div>

            {/* Message Delivery */}
            <div className="my-4">
                <Label>Message Delivery</Label>
                <RadioGroup
                    value={deliveryOption}
                    onValueChange={setDeliveryOption}
                    className="flex flex-col gap-4 mt-3"
                >
                    {deliveryOptions.map((option, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <RadioGroupItem value={option} id={`delivery-${option}`} />
                            <Label htmlFor={`delivery-${option}`}>{option}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            {/* Multi-Select for Recipients */}
            <div className="my-4">
                <Label>Recipients</Label>
                <FancyMultiSelect options={recipientOptions} />
            </div>
        </div>
    );
}

export default SlackWorkflow;
