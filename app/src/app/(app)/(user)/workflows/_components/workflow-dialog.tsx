"use client";

import { useRouter } from 'next/navigation';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  const [selectedTemplate, setSelectedTemplate] = useState("Template 2");

  const handleCreateFromScratch = () => {
    router.push('/workflows/new');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create Workflow</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl rounded">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Create a workflow
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="create">
          <TabsList className="mb-4 bg-[#f1f5f9] rounded">
            <TabsTrigger value="create" className="rounded">Create from a template</TabsTrigger>
            <TabsTrigger value="duplicate" className="rounded">Duplicate a workflow</TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <hr />
            <Command>
              <CommandList>
                <CommandGroup>
                  {["Template 1", "Template 2", "Template 3", "Chosen Template"].map(template => (
                    <CommandItem
                      key={template}
                      className={`flex items-center justify-between p-4 cursor-pointer hover:bg-[#f1f5f9] ${
                        selectedTemplate === template ? 'bg-[#f1f5f9]' : ''
                      }`}
                      onSelect={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-center">
                        {selectedTemplate === template && (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        <div className="flex flex-col">
                          <span>{template}</span>
                          <span className="text-sm text-muted-foreground">
                            A description of the template, try to keep it to a single sentence.
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
            className="text-indigo-600 border-indigo-600 hover:bg-indigo-100 hover:text-indigo-600"
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
