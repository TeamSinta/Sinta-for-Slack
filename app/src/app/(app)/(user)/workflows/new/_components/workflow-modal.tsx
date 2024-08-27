import React, { useState, useEffect } from 'react';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CircleCheck, Loader2Icon, CircleX, Check } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createWorkflowMutation, updateWorkflowMutation } from '@/server/actions/workflows/mutations';
import { getActionData, getConditionsData, getTriggerData } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const WorkflowPublishModal = ({ edit = false, workflowId }: { edit?: boolean; workflowId?: string }) => {
  const [steps, setSteps] = useState([]);
  const [stepStatus, setStepStatus] = useState({});
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const router = useRouter();

  const triggerData = getTriggerData();
  const actionData = getActionData();
  const conditionsData = getConditionsData();

  const { mutateAsync, isPending: isMutatePending, reset } = useMutation({
    mutationFn: edit ? updateWorkflowMutation : createWorkflowMutation,
    onSuccess: () => {
      router.refresh();
      reset();
      clearLocalStorage();
      setStepStatus({});
      setErrorMessage(''); // Clear any previous error messages
      toast.success(edit ? 'Workflow updated successfully' : 'Workflow created successfully');
      router.push('/workflows');
    },
    onError: (error) => {
      const errorMsg = (error?.message) ?? 'Failed to submit Workflow';
      setErrorMessage(formatErrorMessage(errorMsg)); // Set error message for the alert
    },
  });

  const formatErrorMessage = (message) => {
    return message.replace(/[\[\]{}"]/g, ' ').trim();
  };

  const validateData = () => {
    const isTriggerValid = triggerData && triggerData.event && triggerData.description;
    const isActionValid = actionData && actionData.recipients && actionData.customMessageBody;
    setIsButtonDisabled(!(isTriggerValid && isActionValid));
  };

  useEffect(() => {
    validateData(); // Validate data whenever the modal opens
  }, [triggerData, actionData]);

  const handleOpenModal = () => {
    const combinedSteps = [
      {
        id: 1,
        type: 'Trigger',
        ...triggerData,
        description: triggerData.description ? `Trigger: ${triggerData.description}` : 'Missing trigger data',
      },
      ...conditionsData.map((condition, index) => ({
        id: index + 2,
        type: 'Condition',
        field: condition.field,
        condition: condition.condition,
        value: condition.value.name || condition.value,
        description: `${condition.field} ${condition.condition} ${condition.value.name || condition.value}`,
      })),
      {
        id: conditionsData.length + 2,
        type: 'Action',
        ...actionData,
        description: actionData.customMessageBody
          ? `Alert: ${actionData.customMessageBody.substring(0, 50)}...`
          : 'Missing action data',
      }
    ];

    setSteps(combinedSteps);
    validateData(); // Validate data when the modal opens
  };

  const handlePublish = async () => {
    setIsRunningTest(true);
    setStepStatus({});
    setErrorMessage(''); // Clear any previous error messages

    let hasError = false;

    for (const step of steps) {
      setStepStatus((prev) => ({ ...prev, [step.id]: 'loading' }));
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock delay to simulate API call
        setStepStatus((prev) => ({ ...prev, [step.id]: 'success' }));
      } catch {
        setStepStatus((prev) => ({ ...prev, [step.id]: 'error' }));
        setErrorMessage(`Error in ${step.type}. Please check and try again.`);
        hasError = true;
        break; // Stop after the first error
      }
    }

    setIsRunningTest(false);

    if (!hasError) {
      try {
        await mutateAsync({
          id: workflowId, // Include the workflowId when updating
          name: triggerData.event,
          objectField: triggerData.event, // You can adjust this as needed
          alertType: 'time-based', // Adjust this as needed
          conditions: conditionsData,
          triggerConfig: {
            apiUrl: triggerData.description,
            processor: triggerData.triggerData,
          },
          recipient: actionData,
          status: 'active',
          organizationId: 'your-organization-id', // Adjust this as needed
        });
      } catch (error) {
        setStepStatus((prev) => ({
          ...prev,
          [steps.length]: 'error',
        }));
        setErrorMessage(formatErrorMessage(error.message)); // Set error message for the alert
      }
    } else {
      toast.error('There was an error in one of the steps. Please check and try again.');
    }
  };

  return (
    <Dialog onOpenChange={handleOpenModal}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-indigo-600 border-indigo-600 rounded hover:bg-indigo-100 hover:text-indigo-600">
          {edit ? 'Update Workflow' : 'Publish Workflow'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <h2 className="text-xl font-semibold mb-4">{edit ? 'Update Workflow' : 'Prepare to Publish Workflow'}</h2>
        {errorMessage && (
          <Alert variant="destructive" className='rounded-lg'>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className='text-xs'>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center justify-between p-3 bg-gray-50 border rounded ${stepStatus[step.id] === 'error' ? 'border-red-500' : ''}`}
            >
              <div className="flex items-center space-x-2">
                {stepStatus[step.id] === 'loading' && <Loader2Icon className="animate-spin text-blue-500" />}
                {stepStatus[step.id] === 'success' && <CircleCheck className="text-green-500" />}
                {stepStatus[step.id] === 'error' ? <CircleX className="text-red-500" /> : <Check className="text-gray-400" />}
                <div>
                  <h3 className="font-semibold">{step.type}</h3>
                  <p className="text-sm text-gray-500">
                    {step.description?.split(/({{[^}]+}})/g).map((text, index) =>
                      text.startsWith('{{') && text.endsWith('}}') ? (
                        <span key={index} className="text-purple-500">{text}</span>
                      ) : (
                        text
                      )
                    ) || 'No description available'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handlePublish} disabled={isButtonDisabled || isMutatePending || isRunningTest} className="text-white bg-indigo-600 rounded hover:bg-indigo-700">
            {isRunningTest ? 'Running Test...' : isMutatePending ? (edit ? 'Updating...' : 'Publishing...') : (edit ? 'Update' : 'Publish')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Function to clear the local storage after submission
const clearLocalStorage = () => {
  localStorage.removeItem('workflowTriggers');
  localStorage.removeItem('workflowActions');
  localStorage.removeItem('workflowConditions');
};

export default WorkflowPublishModal;
