import React, { useState } from "react";
import WorkflowForm from "./new-workflowForm";

const CreateWorkflowForm = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <WorkflowForm
            // isOpen={isOpen}
            // setIsOpen={setIsOpen}'
            workflowId=""
            mode="create"
        />
    );
};

export default CreateWorkflowForm;
