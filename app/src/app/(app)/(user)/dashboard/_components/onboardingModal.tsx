'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // Your custom button
import { ChevronLeft, ChevronRight, CheckCircle, Circle } from "lucide-react"; // Lucide icons
import { useState } from "react";
import startCard from "../../../../../../public/startcard.png";

const OnboardingModal = () => {
  const [currentStep, setCurrentStep] = useState(0); // 0 is the intro screen

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full">
          Start Onboarding
        </Button>
      </DialogTrigger>

      <DialogContent
        className={`${
          currentStep === 0 ? 'max-w-3xl' : 'max-w-6xl h-[700px]' // Dynamic width and height
        } mx-auto p-8 rounded shadow-lg bg-white transition-all duration-300 ease-in-out`}
      >

        {currentStep === 0 ? (
          // Intro Screen
          <div className="max-w-3xl">
            <div className="text-center">
              <DialogHeader className="text-center items-center">
                <DialogTitle className="font-heading text-3xl mb-3 text-center font-bold text-gray-900">
                  Welcome to Sinta!
                </DialogTitle>
                <p className="text-black mt-6 text-center w-2/3 mx-auto">
                  Before you start, let us help you understand how Sinta can optimize your hiring process using Slack automation.
                </p>
              </DialogHeader>

              <div className="mt-3 flex gap-4 justify-between relative bg-gray-200 shadow-lg p-6 rounded-sm text-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Get started</h2>
                  <p className="text-gray-600 mb-4">
                    Learn how to set up Sinta and automate your hiring process in 4 quick steps.
                  </p>
                  <Button
                    onClick={handleNext}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full"
                  >
                    Start now
                  </Button>
                </div>
                {/* Background Image */}
                <div
                  className="rounded w-[33rem] h-30 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${startCard.src})`, // replace with the correct path to your image
                  }}
                ></div>
              </div>

              <p className="text-blue-600 mt-6 cursor-pointer">Browse Sinta Features</p>
            </div>
          </div>
        ) : (
          // Step-by-Step Flow
          <div className="flex w-full h-full">
            <div className="flex flex-col gap-3 w-full ">
              <p className="text-2xl p-0 font-bold text-gray-900 font-heading">Get started!</p>
              <div className="flex w-full h-full justify-between">
                {/* Sidebar with Beige Background */}
                <div className="w-1/4 pr-2 h-full">
                  <div className="bg-[#f5f1eb] h-full w-full rounded-lg p-6 flex flex-col justify-between">
                    <div>
                    <ul className="space-y-8 w-full">
                      <li className="relative flex items-center text-lg">
                        {currentStep > 1 ? (
                          <CheckCircle className="mr-2 text-green-600 z-10 relative" />
                        ) : (
                          <Circle className="mr-2 text-gray-400 z-10 relative" />
                        )}
                        <span className={`${currentStep > 1 ? 'text-green-600' : currentStep === 1 ? 'font-semibold text-black' : 'text-gray-600'}`}>
                          1. Welcome & Account Setup
                        </span>
                        {currentStep > 1 && (
                          <span className="absolute left-3 top-10 h-[calc(100%-10px)] border-l-2 border-gray-200 z-0"></span>
                        )}
                      </li>
                      <li className="relative flex items-center text-lg">
                        {currentStep > 2 ? (
                          <CheckCircle className="mr-2 text-green-600 z-10 relative" />
                        ) : currentStep === 2 ? (
                          <Circle className="mr-2 text-blue-600 z-10 relative" />
                        ) : (
                          <Circle className="mr-2 text-gray-400 z-10 relative" />
                        )}
                        <span className={`${currentStep > 2 ? 'text-green-600' : currentStep === 2 ? 'font-semibold text-black' : 'text-gray-600'}`}>
                          2. Customize Dashboard
                        </span>
                        {currentStep > 2 && (
                          <span className="absolute left-3 top-10 h-[calc(100%-10px)] border-l-2 border-gray-200 z-0"></span>
                        )}
                      </li>
                      <li className="relative flex items-center text-lg">
                        {currentStep > 3 ? (
                          <CheckCircle className="mr-2 text-green-600 z-10 relative" />
                        ) : currentStep === 3 ? (
                          <Circle className="mr-2 text-blue-600 z-10 relative" />
                        ) : (
                          <Circle className="mr-2 text-gray-400 z-10 relative" />
                        )}
                        <span className={`${currentStep > 3 ? 'text-green-600' : currentStep === 3 ? 'font-semibold text-black' : 'text-gray-600'}`}>
                          3. Setup Hiring Rooms
                        </span>
                        {currentStep > 3 && (
                          <span className="absolute left-3 top-10 h-[calc(100%-10px)] border-l-2 border-gray-200 z-0"></span>
                        )}
                      </li>
                      <li className="relative flex items-center text-lg">
                        {currentStep === 4 ? (
                          <Circle className="mr-2 text-blue-600 z-10 relative" />
                        ) : (
                          <Circle className="mr-2 text-gray-400 z-10 relative" />
                        )}
                        <span className={`${currentStep === 4 ? 'font-semibold text-black' : 'text-gray-600'}`}>
                          4. Automate Workflows
                        </span>
                      </li>
                    </ul>
                    </div>
                    {/* Navigation Buttons under the sidebar */}
                    <div className="flex justify-between items-center mt-8 space-x-4">
                      {currentStep > 1 && (
                        <Button
                          onClick={handlePrev}
                          variant="ghost"
                          className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-400 text-blue-500"
                        >
                          <ChevronLeft className="w-24 h-24" />
                        </Button>
                      )}
                      <Button
                        onClick={handleNext}
                        className="flex-grow bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full"
                      >
                        {currentStep < 4 ? 'Next' : 'Finish Setup 🎉'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="w-3/4 pl-6">
                  {currentStep === 1 && (
                    <div>
                      <h2 className="text-2xl font-heading font-bold mb-4">1. Welcome & Account Setup</h2>
                      <p className="text-gray-600 mb-4">
                        Set up your account by providing basic information such as your company name and employee count.
                        You will also connect your Slack workspace and Greenhouse API to begin syncing your hiring data.
                      </p>
                      <div className="bg-gray-200 rounded-lg h-96 mb-4 flex items-center justify-center">
                        <span className="text-gray-500">Insert Video/GIF Here</span>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div>
                      <h2 className="text-2xl font-heading font-bold mb-4">2. Customize Dashboard</h2>
                      <p className="text-gray-600 mb-4">
                        Personalize your Sinta dashboard based on your role. You can configure widgets that display
                        information relevant to recruiters, hiring managers, or interviewers.
                      </p>
                      <div className="bg-gray-200 rounded-lg h-96 mb-4 flex items-center justify-center">
                        <span className="text-gray-500">Insert Video/GIF Here</span>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div>
                      <h2 className="text-2xl font-heading font-bold mb-4">3. Setup Hiring Rooms</h2>
                      <p className="text-gray-600 mb-4">
                        Set up your first hiring room where you can collaborate with your team, monitor candidate progress,
                        and manage interview scorecards.
                      </p>
                      <div className="bg-gray-200 rounded-lg h-96 mb-4 flex items-center justify-center">
                        <span className="text-gray-500">Insert Video/GIF Here</span>
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div>
                      <h2 className="text-2xl font-heading font-bold mb-4">4. Automate Workflows</h2>
                      <p className="text-gray-600 mb-4">
                        Configure and test your first workflow, automating repetitive tasks such as interview reminders,
                        feedback requests, and candidate updates directly in Slack.
                      </p>
                      <div className="bg-gray-200 rounded-lg h-96 mb-4 flex items-center justify-center">
                        <span className="text-gray-500">Insert Video/GIF Here</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
