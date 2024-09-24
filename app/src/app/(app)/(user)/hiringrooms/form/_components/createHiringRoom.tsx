'use client';

import { motion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export default function CreatHiringRoom() {
    let currentStep: string = "Details"; // Now it's a variable string, not a constant literal

    const steps = [
        { label: "Details", active: currentStep === "Details" },
        { label: "Conditions", active: currentStep === "Conditions" },
        { label: "Automated Actions", active: currentStep === "Content" },
        { label: "Slack Configuration", active: currentStep === "Pricing model" },
        { label: "Receipents", active: currentStep === "Workflow" },
        { label: "Summary", active: currentStep === "Summary" },
    ];

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
                        <div className="text-sm font-medium text-gray-700">Add a product</div>

                    </div>

                    {/* Main Content */}
                    <div className="flex flex-1 container">
                        {/* Sidebar */}
                        <motion.div
                            className="w-1/4 bg-white p-6  border-gray-200"
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
                                        href="#"
                                        className={`flex items-center space-x-3 text-sm font-medium transition-all pl-4 relative ${
                                            step.active
                                                ? "text-blue-500 font-semibold"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {/* Vertical line with blue highlight on active step */}
                                        <div
                                            className={`absolute left-0 h-full w-[2px] transition-all ${
                                                step.active
                                                    ? "bg-blue-500"
                                                    : "bg-transparent"
                                            }`}
                                        ></div>
                                        <span>{step.label}</span>
                                    </a>
                                ))}
                            </nav>
                        </motion.div>

                        {/* Product Details */}
                        <motion.div
                            className="flex-1 p-10 bg-white"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.7 }}
                        >
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                Product details
                            </h2>

                            <div className="space-y-6">
                                {/* Form Input for Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Form Input for API Source */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        API Source
                                    </label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Continue Button */}
                                <div>
                                    <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-md hover:bg-blue-700 transition-all">
                                        Continue
                                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                                    </button>
                                </div>
                            </div>
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
