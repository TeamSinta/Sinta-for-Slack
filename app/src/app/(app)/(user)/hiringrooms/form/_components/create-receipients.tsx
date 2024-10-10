import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { FancyMultiSelect } from "@/components/ui/fancy-multi-select";
import { getMockGreenhouseData } from "@/server/greenhouse/core";
import { getActiveUsers } from "@/server/slack/core";
import { useState, useEffect } from "react";

type SourceType = "slack" | "greenhouse";

interface Option {
    value: string;
    label: string;
    source: SourceType; // Must be of type SourceType
}

interface RecipientsStepProps {
    onSaveRecipients: (recipients: Option[]) => void;
    onBack: () => void;
    initialRecipients?: { value: string; label: string; source: string }[]; // Initial data may come in as `string` type for `source`
}

export const RecipientsStep: React.FC<RecipientsStepProps> = ({
    onSaveRecipients,
    onBack,
    initialRecipients = [], // Default to an empty array if no initial data is passed
}) => {
    // Map initial recipients to ensure `source` is typed as `SourceType`
    const mappedRecipients: Option[] = initialRecipients.map((recipient) => ({
        ...recipient,
        source: recipient.source as SourceType, // Assert that `source` is of type SourceType
    }));

    const [selectedRecipients, setSelectedRecipients] =
        useState<Option[]>(mappedRecipients);
    const [options, setOptions] = useState<Option[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch data for recipients (users, greenhouse data)
    useEffect(() => {
        setIsLoading(true);
        const fetchData = async () => {
            try {
                const [usersData, greenhouseData] = await Promise.all([
                    getActiveUsers(),
                    getMockGreenhouseData(),
                ]);

                const combinedOptions: Option[] = [
                    ...usersData.map((user) => ({
                        value: user.value, // `value` from getActiveUsers()
                        label: user.label, // `label` from getActiveUsers()
                        source: "slack" as SourceType, // Explicitly assign the source as 'slack'
                    })),
                    {
                        label: ` ${greenhouseData.recruiter}`,
                        value: greenhouseData.recruiter,
                        source: "greenhouse" as SourceType,
                    },
                    {
                        label: ` ${greenhouseData.coordinator}`,
                        value: greenhouseData.coordinator,
                        source: "greenhouse" as SourceType,
                    },
                    {
                        label: ` ${greenhouseData.hiringTeam}`,
                        value: greenhouseData.hiringTeam,
                        source: "greenhouse" as SourceType,
                    },
                    {
                        label: ` ${greenhouseData.admin}`,
                        value: greenhouseData.admin,
                        source: "greenhouse" as SourceType,
                    },
                    {
                        label: ` ${greenhouseData.interviewer}`,
                        value: greenhouseData.interviewer,
                        source: "greenhouse" as SourceType,
                    },
                ];

                setOptions(combinedOptions);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
            setIsLoading(false);
        };

        fetchData();
    }, []);

    // Handle option change
    const handleRecipientsChange = (selected: Option[]) => {
        setSelectedRecipients(selected);
    };

    // Handle submit
    const handleSubmit = () => {
        onSaveRecipients(selectedRecipients);
    };

    return (
        <div className="recipients-step">
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>Select Recipients</CardTitle>
                    <CardDescription>
                        Choose your hiring team from your Slack or Greenhouse
                        recipients.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FancyMultiSelect
                        selectedOptions={selectedRecipients}
                        onOptionChange={handleRecipientsChange}
                        options={options}
                        loading={isLoading}
                    />
                </CardContent>
            </Card>

            {/* Custom Buttons */}
            <div className="flex items-end justify-end space-x-4">
                <Button
                    variant="secondary"
                    onClick={onBack}
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
