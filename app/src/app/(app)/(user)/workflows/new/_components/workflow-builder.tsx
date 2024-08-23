import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MoveLeft, PlusCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';

export function WorkflowBuilder() {
  const [steps, setSteps] = useState([
    { id: 1, type: 'Trigger', name: 'Form Submission', status: 'valid', description: 'Client submits a form', icon: '📄' },
    { id: 2, type: 'Action', name: 'Time Delay', status: 'valid', description: 'Time Delay 20 Seconds', icon: '⏰' },
    { id: 3, type: 'Action', name: 'Twilio', status: 'valid', description: 'Send Text Message', icon: '📱' },
    { id: 4, type: 'Action', name: 'Slack', status: 'invalid', description: 'Send Message to Slack Channel', icon: '💬', error: 'Invalid Slack Channel' },
  ]);

  const [selectedElement, setSelectedElement] = useState(null);

  const addStep = (type) => {
    const newStep = {
      id: steps.length + 1,
      type: type,
      name: `New ${type}`,
      status: 'valid',
      description: 'New step description',
      icon: type === 'Action' ? '🔧' : '🚀'
    };
    setSteps([...steps, newStep]);
  };

  const handleElementClick = (element) => {
    setSelectedElement(element);
  };

  return (
    <>
      {/* Top Bar */}
      <header className="w-full p-4 bg-white border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/workflows">
              <MoveLeft />
            </Link>
            <h1 className="font-heading text-lg font-bold">Prepare offer with updated pricing</h1>
            <span className="ml-4 px-2 py-1 text-sm font-medium text-white bg-red-500 rounded">FAILED</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-500 text-xs">All changes saved</span>
            <button className="text-gray-500">📂</button>
            <button className="text-gray-500">🖨️</button>
            <button className="text-gray-500">⏰</button>
            <Button variant="outline">Run test</Button>
            <div className="flex items-center space-x-1">
              <span>Off</span>
              <Switch className='bg-purple-400' />
            </div>
          </div>
        </div>
      </header>

      <div className="flex w-[115%] ml-[130px] h-screen">
        {/* Canvas Area */}
        <div className="flex-grow bg-gray-50 shadow-xl p-6 relative">
          {/* Dot Background */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="relative flex flex-col items-center space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center space-y-2 w-full">
                <div className={`w-full max-w-xl bg-white shadow-md p-4 rounded-lg flex justify-between items-center cursor-pointer border-l-4 ${step.status === 'valid' ? 'border-green-500' : 'border-red-500'}`} onClick={() => handleElementClick(step)}>
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">{step.icon}</span>
                    <div>
                      <span className="font-semibold">{step.name}</span>
                      <p className="text-sm text-gray-500">{step.description}</p>
                      {step.error && <p className="text-sm text-red-500">{step.error}</p>}
                    </div>
                  </div>
                  <span className={`text-sm ${step.status === 'valid' ? 'text-green-500' : 'text-red-500'}`}>{step.status === 'valid' ? '✔️' : '❌'}</span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-blue-500 mt-2">
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
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        {selectedElement && (
          <div className="w-[400px] bg-white shadow-lg h-screen p-6">
            <h2 className="text-xl font-semibold">{selectedElement.name}</h2>
            <p className="text-gray-600">{selectedElement.type}</p>
            {/* Add more fields and configurations here */}
            <Button variant="outline" className="mt-4" onClick={() => setSelectedElement(null)}>Close</Button>
          </div>
        )}
      </div>
    </>
  );
}
