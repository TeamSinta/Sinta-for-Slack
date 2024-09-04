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
        <Button variant="outline" className="bg-indigo-500 text-white px-4 py-2 rounded-md shadow hover:text-white hover:bg-indigo-600">
         New Hiring Map
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900 mb-4">Choose a Stage</DialogTitle>
          <DialogDescription className="text-gray-500">
            Select the stage of the hiring process you want to focus on. Each stage has specific tasks and objectives.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-6 mt-6">
          {/* Sourcing Option */}
          <div
            onClick={() => handleSelection('Sourcing')}
            className="flex items-center space-x-4 p-4 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-all"
          >
            <Briefcase className="h-12 w-12 text-blue-500" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Sourcing</h3>
              <p className="text-sm text-gray-500">Identify and attract top candidates for your open roles.</p>
            </div>
          </div>

          {/* Interviewing Option */}
          <div
            onClick={() => handleSelection('Interviewing')}
            className="flex items-center space-x-4 p-4 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-all"
          >
            <Users className="h-12 w-12 text-green-500" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Interviewing</h3>
              <p className="text-sm text-gray-500">Evaluate candidates to ensure they meet your hiring needs.</p>
            </div>
          </div>

          {/* Onboarding Option */}
          <div
            onClick={() => handleSelection('Onboarding')}
            className="flex items-center space-x-4 p-4 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-all"
          >
            <ClipboardCheck className="h-12 w-12 text-purple-500" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Onboarding</h3>
              <p className="text-sm text-gray-500">Seamlessly integrate new hires into your organization.</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => alert('Cancel clicked')} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg shadow hover:bg-gray-400">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
