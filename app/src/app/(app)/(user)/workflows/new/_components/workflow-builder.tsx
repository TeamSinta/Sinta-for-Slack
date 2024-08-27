import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MoveLeft, PlusCircleIcon, MoveHorizontal, Filter } from 'lucide-react'; // Grip icon for dragging
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import greenhouselogo from '../../../../../../../public/greenhouselogo.png';
import slacklogo from '../../../../../../../public/slack-logo.png';
import filterIcon from '../../../../../../../public/filter.png'; // Placeholder for the condition icon
import Actions from './actions'; // Import your Actions component
import TriggersComponent from './triggers';
import ConditionsComponent from './conditons';

// Local storage keys
const localStorageKeyTriggers = 'workflowTriggers';
const localStorageKeyActions = 'workflowActions';
const localStorageKeyConditions = 'workflowConditions';

export function WorkflowBuilder() {
  const [steps, setSteps] = useState([
    { id: 1, type: 'Trigger', name: '', status: 'skeleton', description: '', icon: greenhouselogo, label: 'Trigger' },
    { id: 2, type: 'Action', name: '', status: 'skeleton', description: '', icon: slacklogo, label: 'Action' },
  ]);

  const [selectedElement, setSelectedElement] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(500); // Default width set wider when first opened
  const minSidebarWidth = 400; // Minimum width of the sidebar
  const maxSidebarWidth = 800; // Maximum width of the sidebar

  useEffect(() => {
    // Load data from localStorage when component mounts
    const loadStepsFromLocalStorage = () => {
      const triggerData = JSON.parse(localStorage.getItem(localStorageKeyTriggers)) || {};
      const actionData = JSON.parse(localStorage.getItem(localStorageKeyActions)) || {};
      const conditionsData = JSON.parse(localStorage.getItem(localStorageKeyConditions)) || [];

      const newSteps = [];

      // Add trigger step
      if (triggerData.event) {
        newSteps.push({
          id: 1,
          type: 'Trigger',
          name: "Greenhouse Trigger",
          status: 'valid',
          description: `${triggerData.event} - ${triggerData.trigger}`,
          icon: greenhouselogo,
          label: 'Trigger'
        });
      } else {
        newSteps.push({
          id: 1,
          type: 'Trigger',
          name: '',
          status: 'skeleton',
          description: '',
          icon: greenhouselogo,
          label: 'Trigger'
        });
      }

      // Add condition steps
      conditionsData.forEach((condition, index) => {
        newSteps.push({
          id: newSteps.length + 1,
          type: 'Condition',
          name: `Condition: ${condition.field}`,
          status: 'valid',
          description: `${condition.field} ${condition.condition} ${typeof condition.value === 'object' ? condition.value.name : condition.value}`,
          icon: filterIcon,
          label: `Condition`,
        });
      });

      // Add action step
      if (actionData.recipients) {
        newSteps.push({
          id: newSteps.length + 1,
          type: 'Action',
          name: "Slack Action",
          status: 'valid',
          description: `Alert: ${actionData.customMessageBody.substring(0, 50)}...`,
          icon: slacklogo,
          label: 'Action'
        });
      } else {
        newSteps.push({
          id: newSteps.length + 1,
          type: 'Action',
          name: '',
          status: 'skeleton',
          description: '',
          icon: slacklogo,
          label: 'Action'
        });
      }

      setSteps(newSteps);
    };

    loadStepsFromLocalStorage();
  }, []);

  const handleElementClick = (element) => {
    setSelectedElement(element);
  };

  const saveStep = (id, data) => {
    const updatedSteps = steps.map(step =>
      step.id === id
        ? { ...step, ...data, status: 'valid' }
        : step
    );
    setSteps(updatedSteps);
    setSelectedElement(null);
  };

  const addConditionStep = (index, data) => {
    const newConditionStep = {
      id: steps.length + 1,
      type: 'Condition',
      name: data?.name || '',
      status: data ? 'valid' : 'skeleton',
      description: data?.description || '',
      icon: filterIcon,
      label: `Condition`,
    };
    setSteps((prevSteps) => {
      const validSteps = prevSteps.filter(step => step.status !== 'skeleton' || step.type !== 'Condition');
      return [
        ...validSteps.slice(0, index + 1),
        newConditionStep,
        ...validSteps.slice(index + 1),
      ];
    });
  };

  const startResizing = (e) => {
    e.preventDefault(); // Prevent text selection during drag
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const doDrag = (event) => {
      const newWidth = startWidth + startX - event.clientX;
      setSidebarWidth(Math.min(Math.max(newWidth, minSidebarWidth), maxSidebarWidth));
    };

    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  const handleSaveActions = (data) => {
    // Find the index where the action should be inserted (after the last condition)
    const lastConditionIndex = steps.map(step => step.type).lastIndexOf('Condition');

    const actionIndex = lastConditionIndex + 1; // Action should follow the last condition

    // Check if the action step already exists in the steps array
    const actionExists = steps.some(step => step.type === 'Action' && step.status === 'valid');

    if (actionExists) {
        // Update the existing action step
        saveStep(actionIndex, {
            name: "Slack Action",
            description: `Alert: ${data.customMessageBody.substring(0, 50)}...`,
        });
    } else {
        // Insert a new action step after the last condition step
        const newActionStep = {
            id: steps.length + 1,
            type: 'Action',
            name: "Slack Action",
            status: 'valid',
            description: `Alert: ${data.customMessageBody.substring(0, 50)}...`,
            icon: slacklogo,
            label: 'Action',
        };

        setSteps(prevSteps => {
            const updatedSteps = [...prevSteps];
            updatedSteps.splice(actionIndex, 1, newActionStep);
            return updatedSteps;
        });
    }

    setSelectedElement(null); // Close the sidebar after saving
};
  const handleSaveTriggers = (data) => {
    // Save to localStorage
    localStorage.setItem(localStorageKeyTriggers, JSON.stringify(data));

    // Save the trigger step
    saveStep(1, {
      name: "Greenhouse Trigger",
      description: `Trigger: ${data.description.substring(0, 50)}...`,
    });

    // Reload conditions and actions based on the trigger being saved
    const actionData = JSON.parse(localStorage.getItem(localStorageKeyActions)) || {};
    const conditionsData = JSON.parse(localStorage.getItem(localStorageKeyConditions)) || [];

    const triggerIndex = steps.findIndex(step => step.type === 'Trigger');
    const newSteps = steps.filter(step => step.type !== 'Condition');

    // Add conditions after the trigger
    conditionsData.forEach((condition, index) => {
      newSteps.splice(triggerIndex + 1 + index, 0, {
        id: newSteps.length + 1,
        type: 'Condition',
        name: `Condition: ${condition.field}`,
        status: 'valid',
        description: `${condition.field} ${condition.condition} ${typeof condition.value === 'object' ? condition.value.name : condition.value}`,
        icon: filterIcon,
        label: `Condition`,
      });
    });

    // Add action step at the end
    newSteps.push({
      id: newSteps.length + 1,
      type: 'Action',
      name: "Slack Action",
      status: 'valid',
      description: `Alert: ${actionData.customMessageBody.substring(0, 50)}...`,
      icon: slacklogo,
      label: 'Action'
    });

    setSteps(newSteps);
  };

  const handleSaveConditions = (data) => {
    // Save to localStorage
    localStorage.setItem(localStorageKeyConditions, JSON.stringify(data));

    // Find the index where the conditions should be inserted (between triggers and actions)
    const triggerIndex = steps.findIndex(step => step.type === 'Trigger');

    // Remove any existing skeleton condition steps
    setSteps((prevSteps) => prevSteps.filter(step => step.type !== 'Condition' || step.status !== 'skeleton'));

    // Save each condition as a separate step
    data.forEach((condition, index) => {
      addConditionStep(triggerIndex + 1 + index, {
        name: `Condition: ${condition.field}`,
        description: `${condition.field} ${condition.condition} ${typeof condition.value === 'object' ? condition.value.name : condition.value}`,
      });
    });
  };

  return (
    <>
      {/* Top Bar */}
      <header className="w-[112%] ml-[50px] flex-none p-4 bg-white border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/workflows">
              <MoveLeft />
            </Link>
            <h1 className="font-heading text-lg font-bold">New Workflow</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-500 text-xs">All changes saved</span>
            <Button variant="outline" className="text-indigo-600 border-indigo-600 rounded hover:bg-indigo-100 hover:text-indigo-600">Run test</Button>
            <div className="flex items-center space-x-1">
              <Switch className="data-[state=checked]:bg-green-500" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)] w-[112%] ml-[50px]">
        {/* Canvas Area */}
        <div className={`flex-grow bg-gray-50 shadow-inner overflow-y-auto p-6 relative ${selectedElement ? 'pr-0' : 'pr-8'}`}>
          {/* Dot Background */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          {/* Step Elements */}
          <div className="relative flex flex-col items-center space-y-3 mt-8 mr-[20px]">
            <AnimatePresence>
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <motion.div
                    className="flex flex-col items-center w-full relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Step Card */}
                    <motion.div
                      className={`relative w-full max-w-xl p-4 rounded-lg flex justify-between items-center cursor-pointer border-2 ${
                        step.status === 'skeleton' ? 'border-dashed border-gray-300 bg-gray-100' : 'border-l-4 border-green-500 bg-white shadow'
                      }`}
                      onClick={() => handleElementClick(step)}
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.2 }}
                      style={{ height: '80px' }}
                    >
                      {/* Top Left Label */}
                      <div className={`absolute top-0 left-0 -mt-4 -ml-2 ${step.status === 'skeleton' ? 'bg-gray-200 text-gray-500' : 'bg-indigo-100 text-black'} px-3 py-1 rounded-tl-md rounded-br-md`}>
                        <span className="text-xs font-semibold">{step.label}</span>
                      </div>
                      {/* Skeleton or Filled Card */}
                      {step.status === 'skeleton' ? (
                        <div className="flex items-center">
                          <Image src={step.icon} alt={`${step.type} Icon`} width={20} height={20} className="mr-4 text-gray-400" />
                          <div>
                            <span className="font-semibold text-gray-400">Click to add {step.type.toLowerCase()} details</span>
                            <p className="text-sm text-gray-400">Enter details here...</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Image src={step.icon} alt={`${step.type} Icon`} width={30} height={30} className="mr-4" />
                          <div>
                            <span className="font-semibold">{step.name}</span>
                            <p className="text-sm text-gray-500">{step.description}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                  {/* Plus Button with Lines */}
                  {index < steps.length - 1 && (
                    <div className="flex flex-col items-center ">
                      <div className="w-px h-4 mb-1 bg-indigo-300"></div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="text-indigo-500">
                            <PlusCircleIcon className="h-6 w-6" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-4 shadow-lg rounded-lg">
                          <Select onValueChange={(value) => value === 'Condition' && addConditionStep(index)}>
                            <SelectTrigger className="w-full flex items-center space-x-2">
                              <PlusCircleIcon className="h-5 w-5 text-gray-500" />
                              <SelectValue placeholder="Add Step" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Condition">
                                <div className="flex items-start">
                                  <Filter className="h-5 w-5 text-gray-600 mr-2" />
                                  <div>
                                    <p className="font-medium">Add Condition</p>
                                    <p className="text-sm text-gray-500">Set up a rule to refine your workflow</p>
                                  </div>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </PopoverContent>
                      </Popover>
                      <div className="w-px h-4 mt-1 bg-indigo-300"></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {selectedElement && (
            <motion.div
              className="bg-white shadow-lg h-full p-6 relative flex overflow-y-auto"
              style={{ width: sidebarWidth }}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
            >
              {/* Left side for dragging with hover effect */}
              <div
                className="absolute left-0 top-0 h-full w-1 cursor-ew-resize hover:bg-indigo-500"
                onMouseDown={startResizing}
              />
              <div
                className="absolute left-[-13px] top-1/2 transform -translate-y-1/2 z-10 flex justify-center items-center"
              >
                <div className="bg-gray-200 p-1 rounded-full shadow cursor-ew-resize" onMouseDown={startResizing}>
                  <MoveHorizontal className="text-gray-600" size={16} />
                </div>
              </div>
              <div className="flex-grow">

                {selectedElement.type === 'Trigger' && <TriggersComponent onSaveTrigger={handleSaveTriggers} />}
                {selectedElement.type === 'Action' && <Actions onSaveActions={handleSaveActions} />}

                {selectedElement.type === 'Condition' && <ConditionsComponent onSaveConditions={handleSaveConditions} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
