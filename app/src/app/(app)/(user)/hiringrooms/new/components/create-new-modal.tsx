"use client";

import React from "react";
import { useRouter } from "next/navigation";
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
import { Briefcase, Users, ClipboardCheck } from "lucide-react";

export function StageSelectionModal() {
    const router = useRouter();

    const handleSelection = (stage) => {
        router.push(`/hiringrooms/new?stage=${stage}`);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="rounded-md bg-indigo-500 px-4 py-2 text-white shadow hover:bg-indigo-600 hover:text-white"
                >
                    New Hiring Map
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-xl p-6 sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="mb-4 text-2xl font-semibold text-gray-900">
                        Choose a Stage
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Select the stage of the hiring process you want to focus
                        on. Each stage has specific tasks and objectives.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 flex flex-col space-y-6">
                    {/* Sourcing Option */}
                    <div
                        onClick={() => handleSelection("Sourcing")}
                        className="flex cursor-pointer items-center space-x-4 rounded-lg bg-gray-100 p-4 transition-all hover:bg-gray-200"
                    >
                        <Briefcase className="h-12 w-12 text-blue-500" />
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                Sourcing
                            </h3>
                            <p className="text-sm text-gray-500">
                                Identify and attract top candidates for your
                                open roles.
                            </p>
                        </div>
                    </div>

                    {/* Interviewing Option */}
                    <div
                        onClick={() => handleSelection("Interviewing")}
                        className="flex cursor-pointer items-center space-x-4 rounded-lg bg-gray-100 p-4 transition-all hover:bg-gray-200"
                    >
                        <Users className="h-12 w-12 text-green-500" />
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                Interviewing
                            </h3>
                            <p className="text-sm text-gray-500">
                                Evaluate candidates to ensure they meet your
                                hiring needs.
                            </p>
                        </div>
                    </div>

                    {/* Onboarding Option */}
                    <div
                        onClick={() => handleSelection("Onboarding")}
                        className="flex cursor-pointer items-center space-x-4 rounded-lg bg-gray-100 p-4 transition-all hover:bg-gray-200"
                    >
                        <ClipboardCheck className="h-12 w-12 text-purple-500" />
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                Onboarding
                            </h3>
                            <p className="text-sm text-gray-500">
                                Seamlessly integrate new hires into your
                                organization.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={() => alert("Cancel clicked")}
                        className="rounded-lg bg-gray-300 px-4 py-2 text-gray-800 shadow hover:bg-gray-400"
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
