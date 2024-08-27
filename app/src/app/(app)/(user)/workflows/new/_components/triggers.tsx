import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import Image from 'next/image';
import greenhouselogo from '../../../../../../../public/greenhouselogo.png';
import { Separator } from '@/components/ui/separator';


const localStorageKey = 'workflowTriggers';

const saveTriggerData = (data) => {
    const storedData = JSON.parse(localStorage.getItem(localStorageKey)) || {};
    const updatedData = { ...storedData, ...data };
    localStorage.setItem(localStorageKey, JSON.stringify(updatedData));
};

const getTriggerData = () => {
    return JSON.parse(localStorage.getItem(localStorageKey)) || {};
};

const TriggersComponent = ({ onSaveTrigger }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTrigger, setSelectedTrigger] = useState(null);
  const [activeTab, setActiveTab] = useState("event");

  const events = [
    {
      title: "Candidate Hired",
      description: "Triggered when a candidate is marked as hired.",
      apiUrl: "/api/greenhouse/candidate_hired",
      triggers: [
        "Onboarding Setup",
        "Send Welcome Email",
        "Assign Buddy",
      ],
    },
    {
      title: "Interview Scheduled",
      description: "Triggered when an interview is scheduled.",
      apiUrl: "/api/greenhouse/interview_scheduled",
      triggers: [
        "Notify Interviewers",
        "Prepare Interview Kit",
        "Schedule Reminder",
      ],
    },
    {
      title: "Job Post Approved",
      description: "Triggered when a job post is approved.",
      apiUrl: "/api/greenhouse/job_post_approved",
      triggers: [
        "Publish Job Post",
        "Notify Team",
      ],
    },
    // Add more events as needed
  ];

  const handleEventChange = (eventTitle) => {
    const selected = events.find(event => event.title === eventTitle);
    setSelectedEvent(selected);
    setSelectedTrigger(null); // Reset trigger when a new event is selected
  };

  const handleTriggerChange = (trigger) => {
    setSelectedTrigger(trigger);
  };

  const handleContinue = () => {
    if (activeTab === "event") {
      setActiveTab("trigger");
    } else if (activeTab === "trigger") {
      setActiveTab("test");
    } else if (activeTab === "test") {
      handleSave(); // Call save function on the last step
    }
  };

  const handleSave = () => {
    if (selectedEvent && selectedTrigger) {
      const triggerData = {
        event: selectedEvent.title,
        trigger: selectedTrigger,
        description: `${selectedEvent.title} - ${selectedTrigger}`,
      };

      // Save to local storage
      saveTriggerData(triggerData);

      onSaveTrigger(triggerData); // Call the original save handler
    }
  };


  const getTabIcon = (tab) => {
    const iconSize = 16; // Adjust this value to make the icons smaller

    if (tab === "event") {
      return selectedEvent ? <CheckCircle className="text-green-500" size={iconSize} /> : <AlertTriangle className="text-gray-500" size={iconSize} />;
    }
    if (tab === "trigger") {
      if (!selectedEvent) return <Clock className="text-gray-300" size={iconSize} />;
      return selectedTrigger ? <CheckCircle className="text-green-500" size={iconSize} /> : <AlertTriangle className="text-gray-500" size={iconSize} />;
    }
    if (tab === "test") {
      if (!selectedTrigger) return <Clock className="text-gray-300" size={iconSize} />;
      return <Clock className="text-gray-300" size={iconSize} />;
    }
  };

  return (
    <div className="conditions-sidebar p-2 flex flex-col justify-between h-full">
    <div>
      {/* Title and Subtitle */}
      <div className=" pt-2">
        <div className="flex items-center mb-4">
          <div className="flex items-center mb-2">
            <Image src={greenhouselogo} alt="slack-logo" width={40} height={40} className="mx-2"/>
            <h2 className="text-xl font-semibold">Trigger</h2>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-500">Set up the events and conditions that will trigger specific actions.</p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full pt-3">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="event" className="flex items-center space-x-2">
            <span>Event</span>
            {getTabIcon("event")}
          </TabsTrigger>
          <TabsTrigger value="trigger" disabled={!selectedEvent} className="flex items-center space-x-2">
            <span>Trigger</span>
            {getTabIcon("trigger")}
          </TabsTrigger>
          <TabsTrigger value="test" disabled={!selectedTrigger} className="flex items-center space-x-2">
            <span>Test</span>
            {getTabIcon("test")}
          </TabsTrigger>
        </TabsList>

        {/* Event Tab */}
        <TabsContent value="event" className="mt-4 py-1">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Select Event</CardTitle>
              <CardDescription>
                Choose an event that will interact with the Greenhouse API.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedEvent && (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
                  <p className="text-sm text-gray-500">{selectedEvent.description}</p>
                  <p className="text-xs text-gray-400">API URL: {selectedEvent.apiUrl}</p>
                </div>
              )}
              <Select onValueChange={handleEventChange}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {selectedEvent ? selectedEvent.title : "Choose an event"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="p-2 space-y-2">
                  {events.map((event) => (
                    <SelectItem key={event.title} value={event.title}>
                      <div className="p-2">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-500">{event.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trigger Tab */}
        <TabsContent value="trigger" className="mt-4 py-1">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Select Trigger</CardTitle>
              <CardDescription>
                Choose a trigger condition related to the selected event.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTrigger && (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold">Selected Trigger</h3>
                  <p className="text-sm text-gray-500">{selectedTrigger}</p>
                </div>
              )}
              {selectedEvent && (
                <Select onValueChange={handleTriggerChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {selectedTrigger ? selectedTrigger : "Choose a trigger"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="p-2 space-y-2">
                    {selectedEvent.triggers.map((trigger, index) => (
                      <SelectItem key={index} value={trigger}>
                        <div className="p-2">{trigger}</div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test" className="mt-4 py-1">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>
                Use this tab to test your API and trigger to see if you get a success response.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="mt-4 text-green-600 border-green-600 rounded hover:bg-green-100 hover:text-green-600">
                Run Test
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    {/* Continue or Save Button */}
    <div>
      <Separator />
      <div className="p-6">
        <Button
          disabled={
            (activeTab === "event" && !selectedEvent) ||
            (activeTab === "trigger" && !selectedTrigger)
          }
          onClick={handleContinue}
          className="w-full bg-blue-600 text-white"
        >
          {activeTab === "test" ? "Save" : "Continue"}
        </Button>
      </div>
    </div>
  </div>
);
};

export default TriggersComponent
