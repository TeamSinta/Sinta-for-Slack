"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { Eye, EyeOff, Info, CheckCircle } from "lucide-react";
import { addSecretKeyToOrg } from "@/server/actions/greenhouse/mutations"; // Import the secret key generation function
import { siteUrls } from "@/config/urls"; // Import site URLs for building the webhook URL
import {
    getOrganizations,
    getOrganizationWebhooks,
} from "@/server/actions/organization/queries"; // To get the org ID
import { checkIfSecretKeyExists } from "@/server/actions/greenhouse/query";
import { OrganizationWebhook } from "@/server/db/schema";
import { index } from "drizzle-orm/mysql-core";
import { CrossCircledIcon } from "@radix-ui/react-icons";

const allWebhooks = [
    "Offer Approved",
    "Offer Created",
    "Job Post Created",
    "Job Created",
    "Job Approved",
    "Candidate has changed stage",
];
export default function GreenhouseConfig() {
    const [secretKey, setSecretKey] = useState<string | null>(null);
    const [webhookUrl, setWebhookUrl] = useState<string | null>(null); // State to store generated webhook URL
    const [buttonVisible, setButtonVisible] = useState(true); // Button visibility state
    const [secretVisible, setSecretVisible] = useState(false); // For toggling secret visibility
    const [validated, setValidated] = useState(false); // Webhook validation status
    const [activeWebhooks, setActiveWebhooks] = useState<OrganizationWebhook[]>(
        [],
    );

    // Check if a secret key exists when the component loads
    useEffect(() => {
        const fetchServerData = async () => {
            try {
                const webhooks = (await getOrganizationWebhooks()) ?? [];
                setActiveWebhooks(webhooks);
                const { currentOrg } = await getOrganizations();
                const orgID = currentOrg.id;

                // Call the backend to check if a secret key already exists
                const response = await checkIfSecretKeyExists(orgID);
                if (response.exists) {
                    if (response.secretKey) {
                        setSecretKey(response.secretKey); // Load the existing secret key
                        const generatedWebhookUrl = `${siteUrls.teamsinta}api/webhooks/${orgID}`;
                        setWebhookUrl(generatedWebhookUrl); // Set the webhook URL
                    }
                    setButtonVisible(false); // Hide the button if the key exists
                }
            } catch (error) {
                console.error("Error checking secret key status", error);
            }
        };

        fetchServerData();
    }, []); // Empty dependency array ensures this runs only on mount

    // Generate the secret key and dynamically generate the webhook URL (frontend only)
    const handleGenerateKeyAndUrl = async () => {
        try {
            // Fetch the organization ID
            const { currentOrg } = await getOrganizations();
            const orgID = currentOrg.id;

            // Dynamically create the webhook URL using the org ID
            const generatedWebhookUrl = `${siteUrls.teamsinta}api/webhooks/${orgID}`;
            setWebhookUrl(generatedWebhookUrl);

            // Call the backend to generate and store the secret key
            const response = await addSecretKeyToOrg();
            if (response.status === "OK" && response.secretKey) {
                setSecretKey(response.secretKey);
                setButtonVisible(false); // Hide the button once the key is generated
                toast.success("Secret Key Generated and Saved!");
            } else {
                toast.error("Failed to generate secret key.");
            }
        } catch (error) {
            console.error("Error generating secret key or webhook URL", error);
            toast.error(
                "Something went wrong while generating the secret key and webhook URL.",
            );
        }
    };

    return (
        <AppPageShell
            title="Configure Greenhouse Webhooks"
            description="Set up and manage your Greenhouse webhooks."
        >
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Left Side: Webhook Configuration Form */}
                <div className="space-y-6">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-md font-regular">
                                Your Webhook URL & Secret
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6">
                            {/* Webhook URL */}
                            <div className="mb-4">
                                <label className="mb-1 block text-sm">
                                    Webhook URL
                                </label>
                                <div className="break-all rounded-md bg-gray-100 p-3 text-xs text-gray-700">
                                    {webhookUrl || "URL not generated yet."}
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Copy this URL to Greenhouse's webhook
                                    settings.
                                </p>
                            </div>

                            {/* Secret Key */}
                            <div className="mb-4">
                                <label className="mb-1 block text-sm">
                                    Secret Key
                                </label>
                                <div className="flex items-center rounded-md bg-gray-100 p-3 text-sm text-gray-700">
                                    <span className="flex-1">
                                        {secretVisible
                                            ? secretKey ||
                                              "Secret key not generated yet."
                                            : "************"}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setSecretVisible(!secretVisible)
                                        }
                                    >
                                        {secretVisible ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Use this secret key to validate requests
                                    from Greenhouse.
                                </p>
                            </div>

                            {/* Generate Secret Key and Webhook URL Button */}
                            {buttonVisible && (
                                <Button
                                    variant="secondary"
                                    onClick={handleGenerateKeyAndUrl}
                                    className="mt-4"
                                >
                                    Generate Secret Key and Webhook URL
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Custom Webhook URL & Secret Key Card */}
                    <Card className="rounded-lg shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-md text-center font-medium">
                                Webhook Setup Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 px-6">
                            {/* Webhook Status List */}
                            <div className="space-y-4">
                                {allWebhooks.map((webhook, index) => (
                                    <div
                                        className="flex items-center justify-between"
                                        key={index}
                                    >
                                        <span className="text-base text-sm text-gray-700">
                                            Webhook type
                                        </span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-medium text-gray-900">
                                                {webhook}
                                            </span>
                                            {activeWebhooks.find(
                                                (item) =>
                                                    item.webhookEvent ===
                                                    webhook,
                                            ) ? (
                                                <div className="flex items-center text-green-600">
                                                    <CheckCircle className="mr-1 h-5 w-5" />
                                                    <span className="text-xs">
                                                        Configured
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-gray-400">
                                                    <CrossCircledIcon className="mr-1 h-5 w-5" />
                                                    <span className="text-xs">
                                                        Missing Configuration
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* <div className="flex justify-end">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="rounded border-blue-600 bg-blue-100 px-6 py-2 text-blue-500 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                                        onClick={() => setValidated(true)} // Simulate validation
                                    >
                                        Validate
                                    </Button>
                                </div> */}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side: Information Box */}
                <Card className="rounded-lg bg-gray-50 p-6 shadow-lg">
                    <CardHeader className="flex items-center space-x-2 pb-2">
                        <Info className="h-6 w-6 text-indigo-500" />
                        <CardTitle className="text-lg font-medium">
                            Need Help?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-700">
                            To configure webhooks, you need to provide the
                            correct endpoints for each event type:
                        </p>
                        <ul className="list-inside list-disc space-y-2 text-sm text-gray-700">
                            <li>
                                <strong>Candidate has changed stage:</strong>{" "}
                                This webhook triggers when a candidate moves to
                                a different stage in the hiring process.
                            </li>
                            <li>
                                <strong>Application updated:</strong> This
                                webhook fires when there is an update to a
                                candidate's application.
                            </li>

                            <li>
                                <strong>Offer updated:</strong> This webhook
                                triggers whenever an offer is updated.
                            </li>
                        </ul>
                        <p className="text-sm text-gray-700">
                            Make sure your secret key is securely stored and
                            matches the one configured in Greenhouse to ensure
                            webhook security.
                        </p>
                        <p className="text-sm text-gray-700">
                            If you encounter any issues, feel free to consult
                            the{" "}
                            <a
                                href="https://support.greenhouse.io/hc/en-us/articles/360005574531-Create-a-webhook"
                                className="text-blue-600 underline"
                            >
                                Greenhouse Integration Guide
                            </a>
                            .
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppPageShell>
    );
}
