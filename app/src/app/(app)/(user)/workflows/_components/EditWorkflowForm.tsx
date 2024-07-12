import React, { useState } from 'react';
import WorkflowForm from './WorkflowForm';

interface EditWorkflowFormProps {
    workflowId: string;
}

const EditWorkflowForm: React.FC<EditWorkflowFormProps> = ({ workflowId }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <WorkflowForm
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            mode="edit"
            workflowId={workflowId}
        />
    );
};

export default EditWorkflowForm;
