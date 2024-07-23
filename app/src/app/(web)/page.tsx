"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import screenshot from "../../../public/screenhotSlack.jpg";
import BackgroundGradient from "./_components/background-gradiant";

// Assuming you have similar Tailwind CSS classes defined or use Tailwind's utility classes
interface FallInPlaceProps {
    children: React.ReactNode; // This type covers anything that can be rendered: numbers, strings, elements or an array (or fragment) containing these types.
    delay?: number; // Optional with a default value, hence marked as optional
}

const FallInPlace: React.FC<FallInPlaceProps> = ({ children, delay = 0.2 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }} // Initial state before animation
        animate={{ opacity: 1, y: 0 }} // Target state after animation
        exit={{ opacity: 0 }} // Optional: state when component unmounts
        transition={{ type: "tween", ease: "easeOut", duration: 2, delay }}
    >
        {children}
    </motion.div>
);
const HeroSection = () => {
    return (
        <div className="relative overflow-hidden ">
            {/* Background Gradient Placeholder */}
            <BackgroundGradient />

            {/* <div className="absolute inset-0 z-[-4] h-full bg-gradient-to-r from-blue-500 to-blue-800"></div> */}

            <div className="max-w-9xl container mx-auto px-8 pb-40 pt-40 lg:pt-60">
                <div className="flex flex-col items-center lg:flex-row">
                    <div>
                        <FallInPlace>
                            <h1 className="white:text-black text-6xl font-bold dark:text-white">
                                Streamline hiring
                                <br /> workflows in Slack
                            </h1>
                        </FallInPlace>
                        <FallInPlace delay={0.4}>
                            <p className="white:text-white mt-4 text-lg font-medium dark:text-gray-300">
                                Design your perfect hiring strategy and bring it{" "}
                                <br />
                                to life with real-time automations—simplify your
                                process <br /> and cut through the chaos, all
                                within your <em> favourite messaging app</em>
                            </p>
                        </FallInPlace>
                        <FallInPlace delay={0.8}>
                            <div className="mt-4 flex space-x-4">
                                <button className="rounded-md bg-indigo-600 px-4 py-2 text-white">
                                    Sign Up
                                </button>
                                <button className="flex items-center rounded-lg border border-white bg-transparent px-4 py-2 text-white">
                                    View demo{" "}
                                    <span className="ml-2 transition-transform duration-300 hover:translate-x-1">
                                        →
                                    </span>
                                </button>
                            </div>
                        </FallInPlace>
                    </div>
                    <div className="xl:left-3/5 mt-12 w-11/12 lg:absolute lg:left-1/2 lg:mt-0 lg:w-auto">
                        <FallInPlace delay={1}>
                            <div className="relative ml-auto h-[600px] max-w-[1200px] rounded-lg shadow-xl lg:w-[80vw]">
                                <div className="absolute right-0 top-0 h-full w-[100%] rounded-lg">
                                    <Image
                                        src={screenshot}
                                        layout="fill"
                                        objectFit="fill"
                                        alt="Screenshot of a ListPage in Saas UI Pro"
                                        quality={75}
                                        priority
                                        className="rounded-lg object-right " // Ensure the right part of the image stays visible
                                    />
                                </div>
                            </div>
                        </FallInPlace>
                    </div>
                </div>
            </div>

            {/* Placeholder for features */}
            <div className="container mx-auto pt-20">
                {/* Imagine similar implementation for features */}
            </div>
        </div>
    );
};

export default HeroSection;
