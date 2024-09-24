'use client';

import { getHiringRoomById, getSlackChannelsById } from "@/server/actions/hiringrooms/queries";
import { useEffect, useState } from "react";
import { EditButton } from "./editButton";
import { Briefcase, Users, Slack, ClipboardList, Edit, ToggleLeft, MoreHorizontal } from "lucide-react"; // Icons from Lucide
import slackLogo from "../../../../../../../public/slack-logo.png";
import Image from "next/image";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { format } from "date-fns";
import SlackChannelNameFormat from "../../_components/SlackChannelNameFormat";
import SlackHiringroom from "../../_components/slack-hiringroom";

export default function EditHireRoom({ roomId }: { roomId: string }) {
    const [hiringRoom, setHiringRoom] = useState(null);
    const [slackChannels, setSlackChannels] = useState([]);
    const [isActive, setIsActive] = useState(true);
    useEffect(() => {
        async function fetchRoomData() {
            if (roomId) {
                const roomData = await getHiringRoomById(roomId);
                setHiringRoom(roomData);
                const slackData = await getSlackChannelsById(roomId);
                setSlackChannels(slackData);
            }
        }
        fetchRoomData();
    }, [roomId]);

    const handleStatusChange = async () => {
      // Toggle the status
      const newStatus = isActive ? "Inactive" : "Active";
      setIsActive(!isActive);

      // Perform an API call or state update to persist the change
      // For example:
      // await updateWorkflowStatus(row.original.id, newStatus);
  };

    console.log(slackChannels, "slackChannels");

    if (!hiringRoom) return <div>Loading...</div>;

    return (
      <div className="w-full max-w-7xl mx-auto p-6 bg-white">
      {/* Breadcrumb Navigation */}
      <div className="text-sm text-gray-500 mb-4 border-b pb-6">
      <Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/hiringrooms">Rooms</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>{hiringRoom.name}</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
      </div>

      {/* Main Header */}
      <div className="flex justify-between items-center pb-8">
          <div className="space-y-1">
              <div className="flex items-center space-x-2">
                  <Briefcase size={20} className="text-indigo-600" />
                  <h1 className="text-2xl font-semibold font-heading">{hiringRoom.name}</h1>
              </div>
              {/* Stats and Extra Info */}
              <div className="text-xs text-gray-500 flex space-x-4">
                  <span>{hiringRoom.status === "Public" ? "Public" : "Private"}</span>
                  <span>0 Subscribers</span>
                  <span>{hiringRoom.id}</span>
              </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-6">
              {/* Toggle Switch */}
              <div className="flex items-center">
                  <Switch
                    className="data-[state=checked]:bg-indigo-500"
                    checked={isActive}
                    onCheckedChange={handleStatusChange}
                />
              </div>

              {/* Status Badge */}
              <span className={`px-3 py-1 text-xs font-semibold rounded ${
                  hiringRoom.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
              }`}>
                  {hiringRoom.status}
              </span>

              {/* More Options */}
              <button className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100 transition">
                  <MoreHorizontal size={20} />
              </button>
          </div>
      </div>

            {/* Details Section */}
            <div className=" border rounded-sm border-gray-200 mb-6">
            <div className="flex p-6  justify-between items-center">
                    <h2 className="text-lg font-semibold font-heading">Details</h2>
                    <EditButton onClick={() => console.log("Edit API Source Clicked")} />
                </div>
                <div className="bg-gray-50 p-6 text-gray-700 text-sm space-y-1">
                    <p className="font-medium ">Name:</p> <p>{hiringRoom.name}</p>
                    <p className="font-medium pt-2 ">Room Type:</p> <p>{hiringRoom.objectField}</p>

                    <p className="font-medium pt-2">Created At:</p>  <p>{new Date(hiringRoom.createdAt).toLocaleString()}</p>
                </div>
            </div>

            {/* Pricing Model Section */}


            {/* Conditions Section */}
            <div className=" border rounded-sm border-gray-200 mb-6">
            <div className="flex p-6   justify-between items-center">
                    <h2 className="text-lg font-semibold  font-heading">Conditions</h2>
                    <EditButton onClick={() => console.log("Edit Conditions Clicked")} />
                </div>

                {hiringRoom.conditions.length > 0 ? (

                    <ul className="mt-2 space-y-1 text-gray-700">
                        {hiringRoom.conditions.map((condition, index) => (
                <div className="bg-gray-50 p-6 text-gray-700 text-sm">

                            <li key={index}>
                                {condition.field.label} is {condition.condition} {condition.value} {condition.unit}
                            </li>
                            </div>

                        ))}
                    </ul>


                )
                 : (
                  <div className="bg-gray-50 p-6 text-gray-700 text-sm">

                    <p className="text-gray-500 mt-2">No conditions set</p>
                    </div>

                )}

            </div>

            <div className=" border rounded-sm border-gray-200 mb-6">
                <div className="flex p-6  justify-between items-center">
                    <h2 className="text-lg font-semibold  font-heading">Automated Actions</h2>
                    <EditButton onClick={() => console.log("Edit Pricing Model Clicked")} />
                </div>
                <div className="bg-gray-50 p-6 text-gray-700 text-sm">
                    <p>Type: Free - Recurring</p>
                    <p>Unit: Call</p>
                    <p>Call limit per month: 100</p>
                    <p>Throttling limit: 100</p>
                </div>
            </div>


            <div className="border rounded-sm border-gray-200 mb-6">
                <div className="flex p-6 justify-between items-center">
                    <h2 className="text-lg font-semibold font-heading">Slack Configuration</h2>
                    <EditButton onClick={() => console.log("Edit Custom Message Clicked")} />
                </div>
                <div className="bg-gray-50 p-6 text-gray-700">
                    <p className="mt-2 text-gray-700 whitespace-pre-line text-sm">
                        {hiringRoom.recipient.customMessageBody}
                    </p>
                </div>
            </div>

            {/* Slack Channel Format Section */}
            <div className="border rounded-sm border-gray-200 mb-6">
                <div className="flex p-6 justify-between items-center">
                    <h2 className="text-lg font-semibold font-heading">Slack Channel Format</h2>
                    <EditButton onClick={() => console.log("Edit Channel Format Clicked")} />
                </div>
                <div className="bg-gray-50 p-6 text-gray-700">
                    <p className="mt-1 text-sm text-gray-600">
                        Specify the format of the Slack channel name for the hiring room.
                    </p>
                    {/* Slack Channel Format Component */}
                    <SlackChannelNameFormat

                    />
                </div>
            </div>


            {/* Recipient Section */}
            <div className="border rounded-sm border-gray-200 mb-6">
                <div className="flex p-6 justify-between items-center">
                    <h2 className="text-lg font-semibold font-heading">Slack Recipients</h2>
                    <EditButton onClick={() => console.log("Edit Recipients Clicked")} />
                </div>
                <div className="bg-gray-50 p-6 text-gray-700">
                    {/* SlackHiringroom Component for Configuring Recipients */}
                    <SlackHiringroom

                    />
                </div>
            </div>










            {/* Slack Channels Section */}
            <div className=" border rounded-sm border-gray-200 mb-6">
                <div className="flex p-6  justify-between items-center">
                    <h2 className="text-lg font-semibold  font-heading">Rooms Created</h2>
                </div>
                {slackChannels.length > 0 ? (



 <div className="bg-gray-50 p-6 text-gray-700 text-sm">

                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-3">
</h4>
<ul className="space-y-2">
{slackChannels.map((channel) => (
    <li key={channel.id} className="flex items-center space-x-3">
        {/* Slack logo next to each channel */}
        <Image src={slackLogo} alt="Slack logo" className="h-4 w-4" />
        <div>
            {/* Channel name with improved typography */}
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {channel.name}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
                Created: {format(new Date(channel.createdAt), "PPP")}
            </p>
        </div>
    </li>
))}
</ul>
      </div>
                ) : (
                  <div className="bg-gray-50 p-6 text-gray-700 text-sm">

                    <p className="text-gray-500 mt-2">No channels created yet</p>
                    </div>
                )}
            </div>



        </div>
    );
}
