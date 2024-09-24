'use client';

import { motion } from "framer-motion";
import { ArrowRightIcon, Briefcase, Filter } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import DetailsStep from "./create-general"; // This is the details step
import ConditionsStep from "./create-conditons";

export default function CreateHiringRoom() {
    const [currentStep, setCurrentStep] = useState("Details");
    const [formData, setFormData] = useState({
        name: '',
        roomType: '',
        conditions: [], // Adding conditions field for the new ConditionsStep
    });

    const steps = [
        { label: "Details", step: "Details" },
        { label: "Conditions", step: "Conditions" },
        { label: "Slack Configuration", step: "Slack Configuration" },
        { label: "Automated Actions", step: "Automated Actions" },
        { label: "Receipents", step: "Receipents" },
        { label: "Summary", step: "Summary" },
    ];

    // Handle data submission from the Details step
    const handleDataSubmit = (data: { name: string; roomType: string; conditions: never[]; }) => {
        setFormData((prevData) => ({
            ...prevData,
            ...data,
        }));
        setCurrentStep("Conditions"); // Move to the Conditions step after submission
    };

    // Handle data submission from the Conditions step
    const handleConditionsSubmit = (conditionsData: any) => {
        setFormData((prevData) => ({
            ...prevData,
            conditions: conditionsData,
        }));
        setCurrentStep("Automated Actions"); // Proceed to the next step (or change as needed)
    };

    const renderStepComponent = () => {
        switch (currentStep) {
            case "Details":
                return <DetailsStep onDataSubmit={handleDataSubmit} />;
            case "Conditions":
                return <ConditionsStep onSaveConditions={handleConditionsSubmit} />;
            // Add other steps as needed
            case "Summary":
                return (
                    <div>
                        <h2>Summary</h2>
                        <pre>{JSON.stringify(formData, null, 2)}</pre>
                        <button onClick={() => console.log("Final Submission", formData)}>
                            Submit Workflow
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    // Dynamic Title Based on Current Step
    const renderTitle = () => {
        switch (currentStep) {
            case "Details":
                return <>
                <div className="mb-6">
             <div className="flex items-center">
                 {/* <Briefcase className="mr-2 text-gray-700" size={24} /> */}
                 <h2 className="text-xl font-semibold font-heading">Hire Room Details</h2>
             </div>
             <p className="mt-2 text-xs font-medium text-gray-500">Set up rules to refine your workflow based on specific conditions.</p>
         </div>
             </>;
            case "Conditions":
                return <>
                   <div className="mb-6">
                <div className="flex items-center">
                    {/* <Filter className="mr-2 text-gray-700" size={24} /> */}
                    <h2 className="text-xl font-semibold font-heading">Filter Conditions</h2>
                </div>
                <p className="mt-2 text-xs font-medium text-gray-500">Set up rules to refine your workflow based on specific conditions.</p>
            </div>
                </>;
            case "Automated Actions":
                return "Automated Actions";
            case "Slack Configuration":
                return "Slack Configuration";
            case "Receipents":
                return "Receipents";
            case "Summary":
                return "Summary";
            default:
                return "";
        }
    };

    return (
        <motion.div
            className="min-h-screen bg-gray-50 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Main Content Box */}
            <div className="flex flex-1 bg-white shadow-lg  border border-gray-200 rounded-lg overflow-hidden mx-10 mt-6 mb-6">
                {/* Sidebar and Product Details Combined */}
                <div className="flex-1 flex flex-col">
                    {/* Top Toolbar with Exit Button */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
                        <Link href="/hiringrooms">
                            <button className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </Link>
                        <div className="text-sm font-medium text-gray-700">Add a new room</div>
                    </div>

                    {/* Main Content */}
                    <div className="flex flex-1 container">
                        {/* Sidebar */}
                        <motion.div
                            className="w-1/4 bg-white p-6 border-gray-200"
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.6 }}
                        >
                            <nav className="space-y-6 relative">
                                {/* Vertical gray line */}
                                <div className="absolute left-0 top-0 h-full w-[2px] bg-gray-300"></div>

                                {steps.map((step, index) => (
                                    <a
                                        key={index}
                                        onClick={() => setCurrentStep(step.step)} // Make steps clickable
                                        className={`flex items-center space-x-3 text-sm font-medium transition-all pl-4 relative cursor-pointer ${
                                            currentStep === step.step
                                                ? "text-blue-500 font-semibold"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {/* Vertical line with blue highlight on active step */}
                                        <div
                                            className={`absolute left-0 h-full w-[2px] transition-all ${
                                                currentStep === step.step
                                                    ? "bg-blue-500"
                                                    : "bg-transparent"
                                            }`}
                                        ></div>
                                        <span>{step.label}</span>
                                    </a>
                                ))}
                            </nav>
                        </motion.div>

                        {/* Main Content - Changing Title Based on Step */}
                        <motion.div
                            className="flex-1 p-10 bg-white"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.7 }}
                        >
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                {renderTitle()} {/* Dynamic title */}
                            </h2>

                            {/* Render the current step component */}
                            {renderStepComponent()}
                        </motion.div>
                    </div>
                </div>

                {/* Right Panel (Help Section) */}
                <motion.div
                    className="w-1/4 bg-gray-50 p-6 border-l border-gray-200"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="space-y-2">
                        {/* Video Help Section */}
                        <h3 className="text-sm font-semibold text-gray-900 pt-4">
                            Check out our help video?
                        </h3>
                        <div className="aspect-w-12 aspect-h-9 w-3/4">
                            <iframe
                                className="w-full h-full rounded-sm shadow-md"
                                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                                title="Product details help video"
                                frameBorder="0"
                                allowFullScreen
                            />
                        </div>
                        <div className="border-b border-gray-200 py-4"></div>

                        {/* Help Text */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 pt-6 pb-2">
                                What is a Product?
                            </h3>
                            <p className="text-sm text-gray-600 py-2">
                                A product is a small version of your API that
                                corresponds to a specific use-case. After selecting
                                which endpoints to include in your product, you'll
                                define its access rules and business model.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
