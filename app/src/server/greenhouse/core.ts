interface Condition {
  field: string;
  condition: string;
  value: string;
}

export function mapWebhookActionToObjectField(action: string): string {
  switch (action) {
    case 'application_updated':
      return 'Application';
    case 'candidate_hired':
      return 'Candidate';
    case 'candidate_unhired':
      return 'Candidate';
    case 'candidate_changed_stage':
      return 'Candidate Stage';
    case 'candidate_submitted_application':
      return 'Application Submission';
    case 'candidate_rejected':
    case 'prospect_rejected':
      return 'Rejection';
    case 'candidate_unrejected':
    case 'prospect_unrejected':
      return 'Unrejection';
    case 'candidate_updated':
    case 'prospect_updated':
      return 'Candidate Update';
    case 'delete_candidate':
      return 'Candidate Deletion';
    case 'interview_deleted':
      return 'Interview Deletion';
    case 'job_interview_stage_deleted':
      return 'Job Interview Stage Deletion';
    case 'prospect_created':
      return 'Prospect Creation';
    // Add more cases for other actions as needed
    default:
      return '';
  }
}

export async function fetchData(apiUrl: string): Promise<any> {
  try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }
      return await response.json();
  } catch (error) {
      console.error('Error fetching data:', error);
      throw new Error('Failed to fetch data');
  }
}

// Function to process data based on the provided processor
export function processData(data: any[], processor: string): any[] {
  if (!data.length) {
      throw new Error(`Data is empty.`);
  }
  if (!(processor in data[0])) {
      throw new Error(`Processor field "${processor}" not found in the data.`);
  }

  const processedData = data.filter((item: any) => {
      const field = processor.toLowerCase();
      if (typeof item[field] === 'string') {

          return item[field].toLowerCase().includes('your_filter_value');
      }
      return false;
  });
  const filteredData = processedData.map((item: any) => {
      return { [processor]: item[processor] };
  });

  return filteredData;
}


export function filterDataWithConditions(data: any[], conditions: Condition[]): any[] {
  return data.filter(candidate => {
      return conditions.every(condition => {
          const { field, condition: cond, value } = condition;
          const candidateFieldValue = getField(candidate, field);
          return evaluateCondition(candidateFieldValue, cond, value);
      });
  });
}

function getField(candidate: any, field: string): any {
  const fields = field.split('.');
  let value = candidate;
  for (const f of fields) {
      if (value && value.hasOwnProperty(f)) {
          value = value[f];
      } else {
          return undefined;
      }
  }
  return value;
}

function evaluateCondition(candidateFieldValue: any, condition: string, value: string): boolean {
  switch (condition) {
      case 'equal':
          return candidateFieldValue === value;
      case 'notEqual':
          return candidateFieldValue !== value;
      case 'one':
          return Array.isArray(candidateFieldValue) && candidateFieldValue.includes(value);
      case 'notOne':
          return !(Array.isArray(candidateFieldValue) && candidateFieldValue.includes(value));
      case 'notBlank':
          return candidateFieldValue !== '';
      case 'blank':
          return candidateFieldValue === '';
      default:
          // Handle other conditions if needed
          return false;
  }
}



// Function to send a Slack notification
export async function sendSlackNotification(data: any, recipient: any): Promise<void> {
  // Implement Slack notification sending logic
  // Use the recipient information to send the notification
  // Example: Send Slack message to recipient using Slack API
  console.log('Sending Slack notification to:', recipient);
  console.log('Notification Data:', data);
  // Placeholder, replace with actual logic
}

// Function to filter processed data before sending Slack notification
export function filterProcessedData(processedData: any): any {
  // Implement data filtering logic here
  // Return filtered data prepared for Slack notification
  return processedData; // Placeholder, replace with actual logic
}
