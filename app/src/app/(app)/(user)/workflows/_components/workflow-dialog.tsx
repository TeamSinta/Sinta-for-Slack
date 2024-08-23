"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  const [selectedTemplate, setSelectedTemplate] = useState("Template 2");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create Workflow</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl !rounded">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
          <h3 className="font-heading text-2xl font-bold">Create a workflow</h3>

          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="create">
          <TabsList className="mb-4 py-2 bg-[#f1f5f9] rounded">
            <TabsTrigger value="create" className="py-1 rounded">Create from a template</TabsTrigger>
            <TabsTrigger value="duplicate" className="py-1 rounded">Duplicate a workflow</TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <hr />
            <Command>
              <CommandList>
                <CommandGroup>
                  {["Template 1", "Template 2", "Template 3", "Chosen Template"].map(template => (
                    <CommandItem
                      key={template}
                      className={`flex items-center justify-between p-4 cursor-pointer rounded hover:bg-[#f1f5f9] ${
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
                          <span className="text-xs text-muted-foreground text-gray-400	 ">
                            A description of the template, try to keep it to a single sentence. Always have one Template pre-selected.
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
            className="text-indigo-600 border-indigo-600 hover:bg-indigo-100 rounded-md hover:text-indigo-600"
          >
            Create from scratch
          </Button>

          <div className="flex space-x-2">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-md">Cancel</Button>
            </DialogClose>
            <Button className="bg-indigo-500 px-4 py-2 text-white rounded-md hover:bg-indigo-600">
              Create workflow from Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
