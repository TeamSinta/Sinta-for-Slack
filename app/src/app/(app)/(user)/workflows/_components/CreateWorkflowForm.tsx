import React, { useState } from 'react';
import WorkflowForm from './WorkflowForm';

const CreateWorkflowForm = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <WorkflowForm
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            mode="create"
        />
    );
};

export default CreateWorkflowForm;
