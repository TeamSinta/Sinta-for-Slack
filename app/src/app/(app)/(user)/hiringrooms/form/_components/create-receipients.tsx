import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FancyMultiSelect } from "@/components/ui/fancy-multi-select";
import { getMockGreenhouseData } from "@/server/greenhouse/core";
import { getActiveUsers } from "@/server/slack/core";
import { useState, useEffect } from "react";

type SourceType = 'slack' | 'greenhouse';

interface Option {
    value: string;
    label: string;
    source: SourceType; // Must be of type SourceType
}

export const RecipientsStep = ({ onSaveRecipients, onBack }: any) => {
    const [selectedRecipients, setSelectedRecipients] = useState<Option[]>([]);
    const [options, setOptions] = useState<Option[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch data for recipients (users, greenhouse data)
    useEffect(() => {
        setIsLoading(true);
        const fetchData = async () => {
            try {
                const [usersData, greenhouseData] =
                    await Promise.all([
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
        console.log(selectedRecipients)// Pass selected recipients to the parent component
    };

    return (
        <div className="recipients-step">
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>Select Recipients</CardTitle>
                    <CardDescription>
                        Choose your hiring team from your Slack or Greenhouse recipients.
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
