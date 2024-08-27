import React from "react";
import Image from "next/image";
import { type WorkflowData } from "./columns"; // Adjust to your actual import
import greenhouseLogo from "../../../../../../public/greenhouselogo.png";
import slackLogo from "../../../../../../public/slack-logo.png";
import filterIcon from "../../../../../../public/filter.png";

type IntegrationsCellProps = {
  workflow: WorkflowData;
};

const IntegrationsCell: React.FC<IntegrationsCellProps> = ({ workflow }) => {
  const conditionIcons = Array(workflow.conditions.length).fill(null).map((_, index) => (
    <React.Fragment key={index}>
      <Image src={filterIcon} alt="Condition" width={20} height={20} />
      {index < workflow.conditions.length - 1 && <span className="mx-1">→</span>}
    </React.Fragment>
  ));

  return (
    <div className="flex items-center space-x-1">
      <Image src={greenhouseLogo} alt="Trigger" width={20} height={20} />
      <span className="mx-1">→</span>
      {conditionIcons}
      <span className="mx-1">→</span>
      <Image src={slackLogo} alt="Action" width={20} height={20} />
    </div>
  );
};

export default IntegrationsCell;
