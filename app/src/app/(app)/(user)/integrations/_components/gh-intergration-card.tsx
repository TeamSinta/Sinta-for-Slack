"use client";

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setGreenhouseToken } from '@/server/actions/greenhouse/mutations';

import { useAwaitableTransition } from "@/hooks/use-awaitable-transition";
import { useRouter } from "next/navigation";
import { toast } from 'sonner';


interface GreenhouseIntegrationCardProps {
    name: string;
    imageUrl: string;
    buttonText: string;
    isConnected?: boolean;
    lastModified?: string;
}

export const GreenhouseIntegrationCard: React.FC<GreenhouseIntegrationCardProps> = ({
    name,
    imageUrl,
    buttonText,
    isConnected,
    lastModified,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [token, setToken] = useState("");
    const router = useRouter();
    const [isPending, startAwaitableTransition] = useAwaitableTransition();


    const handleTokenSubmit = async () => {
        const response = await setGreenhouseToken(token);
        if (response === "OK") {
            // Handle successful connection here, e.g., show a success message or update state

            setIsModalOpen(false);
            toast.success("API key successfully connected");
            await startAwaitableTransition(() => {
              router.refresh();
          });


        } else {
            // Handle failure here, e.g., show an error message
        }
    };

    return (
        <>
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
                    <Button
                        className="ml-2 rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                        onClick={() => setIsModalOpen(true)}
                    >
                        {buttonText}
                    </Button>
                </div>
            </Card>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Enter Greenhouse API Token</DialogTitle>
                        <DialogDescription>
                            Please enter your Greenhouse API token to connect your account.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="token" className="text-right">
                                API Token
                            </Label>
                            <Input
                                id="token"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" onClick={handleTokenSubmit}>Submit</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
