import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserIcon, FileTextIcon, CheckCircleIcon, XCircleIcon, SlackIcon, CalendarIcon, InfoIcon, ZapIcon, ClockIcon, SearchIcon, HandIcon,  ClipboardIcon, LinkIcon, TagIcon, WebhookIcon, TimerIcon, UploadIcon, CalendarIcon as SchedulerIcon, GitBranchIcon, MoveLeft, PencilIcon, GripVertical, MailIcon } from "lucide-react"; // Icons
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { Sidebar } from "./sidebar";
import WorkflowPublishModal from "./workflow-modal";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import greenhouseIcon from "../../../../../../../public/greenhouseLogo.png";
import slackIcon from "../../../../../../../public/slack-logo.png";
import apolloIcon from "../../../../../../../public/apolloio.png";

export function MockWorkflowBuilder({
    workflowId,
    edit,
}: {
    workflowId?: string;
    edit: boolean;
}) {
    const [steps, setSteps] = useState([
        {
            id: 1,
            type: "Trigger",
            name: "Application Submission",
            status: "valid",
            description: "Form submitted by candidate.",
            icon: <Image src={greenhouseIcon} alt="r" className="h-8 w-8" />,
            label: "Trigger",
        },
        {
            id: 2,
            type: "Action",
            name: "Enrich with Apollo",
            status: "valid",
            description: "Enrich candidate data using Apollo.",
            icon: <Image src={apolloIcon} alt="r" className="h-8 w-8 rounded" />,
            label: "Action",
        },
        {
            id: 3,
            type: "Condition",
            name: "Candidate Qualification",
            status: "valid",
            description: "Condition:",
            icon: <CheckCircleIcon className="text-green-500" />,
            label: "Condition",
        },
        {
            id: 4,
            type: "Action",
            name: "Reject Candidate",
            status: "valid",
            description: "Reject the candidate via Greenhouse.",
            icon: <Image src={greenhouseIcon} alt="r" className="h-8 w-8" />,
            label: "Action",
        },
        {
            id: 5,
            type: "Action",
            name: "Send Slack Message",
            status: "valid",
            description: "Notify the hiring channel: ",
            icon: <Image src={slackIcon} alt="r" className="h-4 w-4" />,
            label: "Action",
        },
        {
            id: 6,
            type: "Action",
            name: "Interview Scheduling",
            status: "valid",
            description: "Send an interview scheduling request via Calendly.",
            icon: <CalendarIcon className="text-blue-500" />,
            label: "Action",
        },
        {
          id: 7,
          type: "Action",
          name: "Email Candidate",
          status: "valid",
          description: "Notify and email rejection to candidate.",
          icon: <MailIcon className="text-red-500" />,
          label: "Action",
      },
    ]);

    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
      setSidebarOpen(!sidebarOpen);
  };


    const handleElementClick = (element) => {
        console.log("Selected Element:", element);
    };

    return (
        <>
            {/* Header */}
            <header className=" flex-none border-b border-border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                            <MoveLeft className="text-gray-500 dark:text-gray-300" />

                        <div
                            className="flex items-center space-x-2"
                        >

                                <h3 className="font-heading text-lg font-bold dark:text-gray-100">
                                    Recruitment Inbound Workflow
                                </h3>
                                <PencilIcon size={16} />

                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500 dark:text-gray-300">
                            All changes saved
                        </span>
                        <WorkflowPublishModal

                        />
                        <div className="flex items-center space-x-1">
                            <Switch
                                className="data-[state=checked]:bg-indigo-500"

                            />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex h-[calc(92vh-64px)] relative">
                {/* Workflow builder */}
                <div className="relative flex-grow overflow-y-auto bg-gray-50 p-6 shadow-inner dark:bg-gray-900 dark:shadow-inner">
                    <div
                        className="absolute inset-0 dark:bg-gray-800"
                        style={{
                            backgroundImage:
                                "radial-gradient(#e5e7eb 1px, transparent 1px)",
                            backgroundSize: "20px 20px",
                        }}
                    ></div>

                    <div className="relative mr-[20px] mt-8 flex flex-col items-center space-y-14 mr-64">
                        <AnimatePresence>
                        {steps.slice(0, 3).map((step, index) => (
        <div key={step.id} className="relative flex w-full max-w-xl flex-col items-center">
            {/* Workflow card */}
            <motion.div
                key={step.id}
                className={`relative flex flex-col w-[346px] justify-around cursor-pointer items-center  rounded-lg border-2 p-4 border-l-4  ${
                    step.type === "Trigger"
                        ? "border-l-4 border-blue-500 bg-white shadow"
                        : step.type === "Action"
                        ? "border-l-4  bg-white shadow"
                        : "border-l-4 bg-white shadow"
                }`}
                onClick={() => handleElementClick(step)}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                style={{ height: "130px", borderRadius: "12px" }} // Adjust height for uniformity
            >
                {/* Top Label */}
                <div
                    className={`absolute left-2 top-[-16px] ${
                        step.type === "Trigger"
                            ? "bg-blue-500"
                            : step.type === "Action"
                            ? "bg-purple-500"
                            : "bg-green-500"
                    } text-white text-xs font-bold px-2 py-1 rounded-md`}
                    style={{ borderRadius: "6px" }}
                >
                    {step.label}
                </div>

                {/* Main Card Content */}
                <div className="flex w-full items-center">
                    {step.icon}
                    <div className="ml-4">
                        <span className="font-semibold text-gray-700">{step.name}</span>
                    </div>
                </div>

                {/* Divider */}
                <hr className="my-2 border-t border-gray-300 w-full" />

                {/* Description on its own Row */}
                <div className="w-full flex justify-start items-start">
                <p className="text-sm text-gray-500 ">{step.description}</p>

                    {/* Custom badge for each card */}
                    {step.id === 1 && (
                        <span className="ml-2 px-2 w-[110px] py-1 text-xs font-semibold text-blue-500 bg-blue-100 rounded">
                          L2 Ops Form
                        </span>
                    )}

                    {step.id === 3 && (
                        <span className="ml-2 px-2  py-1 text-xs font-semibold text-blue-500 bg-blue-100 rounded">
                            3 Conditions
                        </span>
                    )}
                </div>

                {/* Optional 3-Dot Menu */}
                <div className="absolute top-0 right-2 text-sm">
                <GripVertical className="h-4 w-4 mt-4" />
                </div>
            </motion.div>

                                    {/* Arrow connecting lines */}

                                </div>
                            ))}

                            {/* Conditional paths rendering */}
                            <div className="flex w-full mt-0 justify-around">





                                {/* Is True Path */}
                                <div className="flex flex-col items-center space-y-10">
                {steps.slice(4, 6).map((step) => (
                    <motion.div
                        key={step.id}
                        className="relative flex flex-col w-[346px] justify-around cursor-pointer items-center  rounded-lg border-2 p-4 border-l-4 bg-white shadow"
                        onClick={() => handleElementClick(step)}
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.2 }}
                        style={{ height: "130px", borderRadius: "12px" }} // Adjust height and border-radius for rounded corners
                    >
                        {/* Top Label */}
                        <div
                            className="absolute left-2 top-[-16px] bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-md"
                            style={{ borderRadius: "6px" }}
                        >
                            {step.label}
                        </div>

                        {/* Main Card Content */}
                        <div className="flex w-full items-center">
                            {step.icon}
                            <div className="ml-4">
                                <span className="font-semibold text-gray-700">{step.name}</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <hr className="my-2 border-t border-gray-300 w-full" />

                        {/* Description on its own Row */}
                        <div className="w-full flex">
                            <p className="text-sm text-gray-500">{step.description}</p>
                            {step.id === 5 && (
                        <span className="ml-2 px-2  py-1 text-xs font-semibold text-blue-500 bg-blue-100 rounded">
                         #Hire-Ops
                        </span>
                    )}

                        </div>

                        {/* Optional 3-Dot Menu */}
                        <div className="absolute top-0 right-2 text-sm">
                        <GripVertical className="h-4 w-4 mt-4" />
                        </div>
                    </motion.div>
                ))}
            </div>

                                {/* Is False Path */}
                                <div className="flex flex-col items-center">
    <motion.div
        key={steps[3].id}
        className="relative flex flex-col w-[346px] cursor-pointer items-center justify-between rounded-lg border-2 p-4 border-gray-200 bg-white shadow"
        onClick={() => handleElementClick(steps[3])}
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.2 }}
        style={{ height: "130px", borderRadius: "12px", }} // Adjust height and border-radius for rounded corners
    >
        {/* Top Label (Condition) */}
        <div
            className="absolute left-2 top-[-16px] bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md"
            style={{ borderRadius: "6px" }}
        >
            {steps[3].label}
        </div>

        {/* Main Card Content */}
        <div className="flex w-full items-center">
            {/* Icon and Title on the Same Row */}
            {steps[3].icon}
            <div className="ml-4">
                <span className="font-semibold text-gray-700">
                    {steps[3].name}
                </span>
            </div>
        </div>

        {/* Divider */}
        <hr className="my-2 border-t border-gray-300 w-full" />

        {/* Description on its own Row */}
        <div className="w-full flex">
            <p className="text-sm text-gray-500 w-3/4">
                {steps[3].description}
            </p>
            <span className="ml-2 px-2 h-[28px] py-1 text-xs font-semibold text-blue-500 bg-blue-100 rounded">
    CandidateID
</span>
        </div>

        {/* Optional 3-Dot Menu */}
        <div className="absolute top-0 right-2 text-sm">
        <GripVertical className="h-4 w-4 mt-4" />
        </div>
    </motion.div>
    <motion.div
        key={steps[6].id}
        className="relative flex flex-col w-[346px] mt-10 cursor-pointer items-center justify-between rounded-lg border-2 p-4 border-gray-200 bg-white shadow"
        onClick={() => handleElementClick(steps[3])}
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.2 }}
        style={{ height: "130px", borderRadius: "12px", }} // Adjust height and border-radius for rounded corners
    >
        {/* Top Label (Condition) */}
        <div
            className="absolute left-2 top-[-16px] bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md"
            style={{ borderRadius: "6px" }}
        >
            {steps[6].label}
        </div>

        {/* Main Card Content */}
        <div className="flex w-full items-center">
            {/* Icon and Title on the Same Row */}
            {steps[6].icon}
            <div className="ml-4">
                <span className="font-semibold text-gray-700">
                    {steps[6].name}
                </span>
            </div>
        </div>

        {/* Divider */}
        <hr className="my-2 border-t border-gray-300 w-full" />

        {/* Description on its own Row */}
        <div className="w-full">
            <p className="text-sm text-gray-500 w-3/4">
                {steps[6].description}
            </p>

        </div>

        {/* Optional 3-Dot Menu */}
        <div className="absolute top-0 right-2 text-sm">
        <GripVertical className="h-4 w-4 mt-4" />
        </div>
    </motion.div>
</div>

                            </div>
                        </AnimatePresence>
                    </div>
                </div>

                <Sidebar sidebarOpen={sidebarOpen} />


                {/* Tooltip bar like in the second image */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-white p-2 rounded-lg border shadow">
                    <button className="p-2 rounded-md hover:bg-gray-700">
                        <SearchIcon className="h-5 w-5 text-black" />
                    </button>
                    <button className="p-2 rounded-md hover:bg-gray-700">
                        <HandIcon className="h-5 w-5 text-black" />
                    </button>
                    <button className="p-2 rounded-md hover:bg-gray-700">
                        <PaperPlaneIcon className="h-5 w-5 text-blue-500" />
                    </button>
                    <button className="p-2 rounded-md hover:bg-gray-700">
                        <ClipboardIcon onClick={toggleSidebar} className="h-5 w-5 text-black" />

                    </button>
                    <button className="p-2 rounded-md hover:bg-gray-700">
                        <GitBranchIcon className="h-5 w-5 text-black" />
                    </button>
                </div>
            </div>
        </>
    );
}
