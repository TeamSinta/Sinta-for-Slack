import React, { useState } from 'react';
import WorkflowForm from './new-workflowForm';

interface EditWorkflowFormProps {
    workflowId: string;
}

const EditWorkflowForm: React.FC<EditWorkflowFormProps> = ({ workflowId }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <WorkflowForm
            // isOpen={isOpen}
            // setIsOpen={setIsOpen}
            mode="edit"
            workflowId={workflowId}
        />
    );
};

export default EditWorkflowForm;
