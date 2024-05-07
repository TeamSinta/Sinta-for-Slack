import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface IntegrationCardProps {
    name: string;
    imageUrl: string;
    integrationUrl: string;
    buttonText: string;
}

export const IntegrationCard = ({
    name,
    imageUrl,
    integrationUrl,
    buttonText,
    isConnected,
    lastModified,
}: IntegrationCardProps & { isConnected?: string; lastModified?: string }) => (
    <Card className="flex w-full items-center justify-between p-6">
        <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
                <AvatarImage src={imageUrl} />
                <AvatarFallback>{name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="text-lg font-medium leading-none">{name}</p>
                {isConnected && (
                    <div className="mt-1 flex items-center">
                        <div className="mr-2 rounded bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-200 dark:text-green-900">
                            Connected
                        </div>
                        <span className="text-sm text-gray-500">
                            Last modified: {lastModified}
                        </span>
                    </div>
                )}
            </div>
        </div>
        <div className="flex items-center">
            {isConnected ? (
                <Button className="ml-2 rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
                    <Link href={integrationUrl}>Resync</Link>
                </Button>
            ) : (
                <Button className="ml-2 rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
                    <Link href={integrationUrl}>{buttonText}</Link>
                </Button>
            )}
        </div>
    </Card>
);
