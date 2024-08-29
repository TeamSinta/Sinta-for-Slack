"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoadingSpinner from "./loadingSprinner";
import { WorkflowBuilder } from "./workflow-builder";

export default function WorkflowLoader({
    workflowId,
    edit,
}: {
    workflowId: string;
    edit: boolean;
}) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000); // Simulate loading delay

        return () => clearTimeout(timer); // Cleanup timeout
    }, []);

    return (
        <AnimatePresence
            mode="wait"
            initial={false}
            onExitComplete={() => window.scrollTo(0, 0)}
        >
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
                    <div className="flex flex-col items-center justify-center">
                        <WorkflowBuilder workflowId={workflowId} edit={edit} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
