"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import interviewer from "../../../../../public/interviewer.png";
import recruiterimage from "../../../../../public/recruiter.png";
import hiringmanagerimage from "../../../../../public/hiring_manager.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react"; // Icon for the remove button

export default function CustomizeDashboard() {
  const [selectedRole, setSelectedRole] = useState<string | null>("Interviewer");
  const [resourcesEnabled, setResourcesEnabled] = useState<boolean>(false);
  const [upcomingInterviews, setUpcomingInterviews] = useState<boolean>(true);
  const [pendingFeedback, setPendingFeedback] = useState<boolean>(true);
  const [meetingLink, setMeetingLink] = useState<boolean>(true);

  // State to manage the list of resource buttons
  const [resourceLinks, setResourceLinks] = useState<{ label: string; link: string }[]>([]);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleResourceChange = (index: number, field: "label" | "link", value: string) => {
    const updatedLinks = [...resourceLinks];
    updatedLinks[index][field] = value;
    setResourceLinks(updatedLinks);
  };

  const handleAddResource = () => {
    setResourceLinks([...resourceLinks, { label: "", link: "" }]);
  };

  const handleRemoveResource = (index: number) => {
    const updatedLinks = [...resourceLinks];
    updatedLinks.splice(index, 1);
    setResourceLinks(updatedLinks);
  };

  const handleUpdate = () => {
    alert(`${selectedRole} Dashboard updated!`);
    console.log({
      upcomingInterviews,
      pendingFeedback,
      resourcesEnabled,
      resourceLinks,
    });
  };

  return (
    <div className="w-full space-y-8 pl-8">
      <header className="flex w-full flex-col gap-1 border-border pt-6">
        <h1 className="font-heading text-2xl font-bold">Customize User Dashboard</h1>
        <p className="max-w-xl text-muted-foreground">Customize content displayed user's Slack dashboard.</p>
      </header>

      {/* Role Selection Section */}
      <Card className="mb-6">
        <CardHeader className="border-b py-7">
          <CardTitle>Select User Dashboard</CardTitle>
          <p className="max-w-xl text-muted-foreground text-sm">
            Choose which dashboard you want to customize.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-6 justify-center pt-4">
            {[
              { role: "Interviewer", image: interviewer },
              { role: "Recruiter", image: recruiterimage },
              { role: "Hiring Manager", image: hiringmanagerimage },
            ].map(({ role, image }) => (
              <div
                key={role}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => handleRoleSelect(role)}
              >
<div
  className={`relative border-2 rounded-lg mb-2 flex justify-center items-center ${
    selectedRole === role ? "border-indigo-500" : "border-transparent"
  }`}
  style={{ width: 200, height: 200, overflow: 'hidden' }}
>
  <Image
    src={image}
    alt={role}
    layout="fill"
    objectFit="contain"
    className="rounded-lg"
  />
</div>
                <p className="text-center font-semibold">{role}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customization Options based on Selected Role */}
      {selectedRole && (
        <Card className="mb-6">
          <CardHeader className="border-b py-7">
            <CardTitle>Customize {selectedRole} Elements</CardTitle>
            <p className="max-w-xl text-muted-foreground text-sm">
              Select what elements you want to display on the {selectedRole} dashboard.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4  pt-8">
              <div className="flex items-center justify-between">
                <p className="text-md ">Upcoming Interviews</p>
                <Switch
                  className="data-[state=checked]:bg-indigo-500 "
                  checked={upcomingInterviews}
                  onCheckedChange={setUpcomingInterviews}
                />
              </div>
              <div className="flex items-center justify-between">
             < p className="text-md font-regular ">Pending Feedback</p>
                <Switch
                  className="data-[state=checked]:bg-indigo-500 "
                  checked={pendingFeedback}
                  onCheckedChange={setPendingFeedback}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-md ">Video Conference Link</p>
                <Switch
                  className="data-[state=checked]:bg-indigo-500 "
                  checked={meetingLink}
                  onCheckedChange={setMeetingLink}
                />
              </div>
            </div>
          </CardContent>
          <div className="flex justify-end p-4">
            <Button className="ml-2  bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700" onClick={handleUpdate}>Update</Button>
          </div>
        </Card>
      )}

      {/* Resources Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Resources</CardTitle>
              <p className="max-w-xl text-muted-foreground text-sm">
                Add buttons that link to important resources.
              </p>
            </div>
            <Switch
              className="data-[state=checked]:bg-indigo-500 "
              checked={resourcesEnabled}
              onCheckedChange={() => setResourcesEnabled(!resourcesEnabled)}
            />
          </div>
        </CardHeader>
        {resourcesEnabled && (
          <>
            <CardContent>
              <div className="space-y-4">
                {resourceLinks.map((resource, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 border p-4 rounded-md"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <label className="w-20">Label:</label>
                        <Input
                          type="text"
                          placeholder="Button Label"
                          value={resource.label}
                          onChange={(e) => handleResourceChange(index, "label", e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <label className="w-20">Link:</label>
                        <Input
                          type="text"
                          placeholder="https://example.com"
                          value={resource.link}
                          onChange={(e) => handleResourceChange(index, "link", e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveResource(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={handleAddResource}>
                  Add Resource
                </Button>
              </div>
            </CardContent>
            <div className="flex justify-end p-4">
              <Button className="ml-2 bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700" onClick={handleUpdate}>Update</Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
