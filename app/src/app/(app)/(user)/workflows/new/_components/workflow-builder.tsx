import React, { useState } from 'react';
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
import { Archive, CopyCheck, MoveLeft, PlusCircleIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';

export function WorkflowBuilder() {
  const [steps, setSteps] = useState([
    { id: 1, type: 'Trigger', name: 'Form Submission', status: 'valid', description: 'Client submits a form', icon: '📄', label: 'Trigger 1' },
    { id: 2, type: 'Action', name: 'Time Delay', status: 'valid', description: 'Time Delay 20 Seconds', icon: '⏰', label: 'Action 2' },
    { id: 3, type: 'Action', name: 'Twilio', status: 'valid', description: 'Send Text Message', icon: '📱', label: 'Action 3' },
    { id: 4, type: 'Action', name: 'Slack', status: 'invalid', description: 'Send Message to Slack Channel', icon: '💬', label: 'Action 4', error: 'Invalid Slack Channel' },
  ]);

  const [selectedElement, setSelectedElement] = useState(null);

  const addStep = (type) => {
    const newStep = {
      id: steps.length + 1,
      type: type,
      name: `New ${type}`,
      status: 'valid',
      description: 'New step description',
      icon: type === 'Action' ? '🔧' : '🚀',
      label: `${type} ${steps.length + 1}`
    };
    setSteps([...steps, newStep]);
  };

  const handleElementClick = (element) => {
    setSelectedElement(element);
  };

  return (
    <>
      {/* Top Bar */}
      <header className="w-[114%] ml-[130px] rounded p-4 bg-white border-b border-border shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/workflows">
              <MoveLeft />
            </Link>
            <h1 className="font-heading text-lg font-bold">Remind team to close out stale candidates</h1>
            <span className="ml-4 px-2 py-1 text-sm font-medium text-white bg-red-500 rounded">FAILED</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-500 text-xs">All changes saved</span>
            <button className="text-gray-600"><CopyCheck className='w-4 h-4'/></button>
            <button className="text-gray-600"><Archive className='w-4 h-4'/></button>
            <button className="text-gray-600"><Trash2 className='w-4 h-4'/></button>
            <Button variant="outline"
            className="text-indigo-600 border-indigo-600 rounded hover:bg-indigo-100 hover:text-indigo-600">Run test</Button>
            <div className="flex items-center space-x-1">
              <Switch className="data-[state=checked]:bg-green-500"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex w-[114%] ml-[130px] h-screen">
        {/* Canvas Area */}
        <div className="flex-grow bg-gray-50 shadow p-6 relative">
          {/* Dot Background */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          {/* Step Elements */}
          <div className="relative flex flex-col items-center space-y-2">
            <AnimatePresence>
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className="flex flex-col items-center space-y-2 w-full relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step Card */}
                  <motion.div
                    className={`relative w-full max-w-xl bg-white shadow p-4 rounded-lg flex justify-between items-center cursor-pointer border-l-4 ${step.status === 'valid' ? 'border-green-500' : 'border-red-500'}`}
                    onClick={() => handleElementClick(step)}
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Top Left Label */}
                    <div className={`absolute top-0 left-0 -mt-4 -ml-2 bg-indigo-100 text-black px-3 py-1 rounded-tl-md rounded-br-md`}>
                      <span className="text-xs font-semibold">{step.label}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-2xl mr-4">{step.icon}</span>
                      <div>
                        <span className="font-semibold">{step.name}</span>
                        <p className="text-sm text-gray-500">{step.description}</p>
                        {step.error && <p className="text-sm text-red-500">{step.error}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm ${step.status === 'valid' ? 'text-green-500' : 'text-red-500'}`}>{step.status === 'valid' ? '✔️' : '❌'}</span>
                    </div>
                  </motion.div>
                  {/* Popover to Add Step */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-indigo-500 mt-2">
                        <PlusCircleIcon className="h-6 w-6" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-4 shadow-lg rounded-lg">
                      <Select onValueChange={addStep}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Add Step" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Action">Add Action</SelectItem>
                          <SelectItem value="Trigger">Add Trigger</SelectItem>
                        </SelectContent>
                      </Select>
                    </PopoverContent>
                  </Popover>
                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div className="w-px h-12 bg-indigo-300"></div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {selectedElement && (
            <motion.div
              className="w-[400px] bg-white shadow-lg h-screen p-6"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold">{selectedElement.name}</h2>
              <p className="text-gray-600">{selectedElement.type}</p>
              {/* Add more fields and configurations here */}
              <Button variant="outline" className="mt-4" onClick={() => setSelectedElement(null)}>Close</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
