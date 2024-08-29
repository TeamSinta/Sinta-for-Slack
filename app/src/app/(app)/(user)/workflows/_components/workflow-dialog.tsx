"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Check } from "lucide-react";
import { useState } from "react";

export function WorkflowDialog() {
    const router = useRouter();
    const [selectedTemplate, setSelectedTemplate] = useState(
        "Candidate Sourcing Pipeline",
    );

    const handleCreateFromScratch = () => {
        router.push("/workflows/new");
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600">
                    Create Workflow
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Create a workflow
                    </DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="create">
                    <TabsList className="mb-4 rounded bg-[#f1f5f9]">
                        <TabsTrigger value="create" className="rounded">
                            Create from a template
                        </TabsTrigger>
                        <TabsTrigger value="duplicate" className="rounded">
                            Duplicate a workflow
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="create">
                        <hr />
                        <Command>
                            <CommandList>
                                <CommandGroup>
                                    {[
                                        "Candidate Sourcing Pipeline",
                                        "Interview Scheduling Automation",
                                        "Offer Management Process",
                                        "New Hire Onboarding Tracker",
                                    ].map((template) => (
                                        <CommandItem
                                            key={template}
                                            className={`flex cursor-pointer items-center justify-between p-4 hover:bg-[#f1f5f9] ${
                                                selectedTemplate === template
                                                    ? "bg-[#f1f5f9]"
                                                    : ""
                                            }`}
                                            onSelect={() =>
                                                setSelectedTemplate(template)
                                            }
                                        >
                                            <div className="flex items-center">
                                                {selectedTemplate ===
                                                    template && (
                                                    <Check className="mr-2 h-4 w-4" />
                                                )}
                                                <div className="flex flex-col">
                                                    <span>{template}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {template ===
                                                            "Candidate Sourcing Pipeline" &&
                                                            "Streamline candidate sourcing by tracking leads and automating follow-ups."}
                                                        {template ===
                                                            "Interview Scheduling Automation" &&
                                                            "Automate interview scheduling and reminders with Greenhouse integration."}
                                                        {template ===
                                                            "Offer Management Process" &&
                                                            "Manage and track offer stages and approvals through automated workflows."}
                                                        {template ===
                                                            "New Hire Onboarding Tracker" &&
                                                            "Track onboarding tasks and ensure a smooth transition for new hires."}
                                                    </span>
                                                </div>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </TabsContent>
                    <TabsContent value="duplicate">
                        <DialogDescription className="text-sm text-muted-foreground">
                            Here you can duplicate an existing workflow.
                        </DialogDescription>
                    </TabsContent>
                </Tabs>
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        className="border-indigo-600 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-600"
                        onClick={handleCreateFromScratch}
                    >
                        Create from scratch
                    </Button>

                    <div className="flex space-x-2">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button className="bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600">
                            Create workflow
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
