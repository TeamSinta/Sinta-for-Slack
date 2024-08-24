"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoadingSpinner from "./loadingSprinner";
import { WorkflowBuilder } from "./workflow-builder";

export default function WorkflowLoader() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate a loading delay (e.g., fetching data or loading resources)
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000); // 6 seconds delay to match the message rotation

        return () => clearTimeout(timer); // Clean up the timeout
    }, []);

    return (
        <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
            {isLoading ? (
                <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <LoadingSpinner />
                </motion.div>
            ) : (
                <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-col items-center justify-center ">
                       <WorkflowBuilder/>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
