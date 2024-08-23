"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const messages = [
    "Loading Workflow",
    "Connecting Integrations",
    "Fetching Data",
    "Preparing Environment"
];

export default function LoadingSpinner() {
    const [currentMessage, setCurrentMessage] = useState(0);
    const [showInitialMessage, setShowInitialMessage] = useState(true);

    useEffect(() => {
        const initialTimer = setTimeout(() => {
            setShowInitialMessage(false); // Hide the initial message after it has shown
        }, 1500); // Show initial message for 1.5 seconds

        const interval = setInterval(() => {
            setCurrentMessage((prev) => (prev + 1) % messages.length);
        }, 1500); // Change message every 1.5 seconds after the initial message

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        }; // Cleanup interval on component unmount
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="relative w-16 h-16">
                <div
                    className="absolute inset-0 rounded-full animate-spin"
                    style={{
                        background: "conic-gradient(from 90deg, #4F46E5, #4F46E5, #C7D2FE, #C7D2FE, #FFFFFF)",
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        mask: "radial-gradient(circle, transparent 40%, black 41%)",
                    }}
                ></div>
            </div>
            {showInitialMessage ? (
                <p className="mt-4 text-lg font-medium text-gray-700">
                    Loading Workflow
                </p>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.p
                        key={currentMessage}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="mt-4 text-lg font-medium text-gray-700"
                    >
                        {messages[currentMessage]}
                    </motion.p>
                </AnimatePresence>
            )}
        </div>
    );
}
