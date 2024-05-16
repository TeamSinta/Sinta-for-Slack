// Interfaces for Greenhouse API responses
export interface Interviewer {
    id: number;
    name: string;
    email: string;
    scorecard_id: number | null;
}

export interface ScheduledInterview {
    id: number;
    start: { date_time: string };
    end: { date_time: string };
    interviewers: Interviewer[];
}

export interface ScorecardAttribute {
    name: string;
    type: string;
    note: string | null;
    rating: string;
}

type ScorecardRatings = Record<string, string[]>; // Correct usage of Record for dynamic keys

export interface Scorecard {
    id: number;
    updated_at: string;
    created_at: string;
    interview: string;
    interview_step: {
        id: number;
        name: string;
    };
    candidate_id: number;
    application_id: number;
    interviewed_at: string;
    submitted_by: Person;
    interviewer: Person;
    submitted_at: string;
    overall_recommendation: string;
    attributes: ScorecardAttribute[];
    ratings: ScorecardRatings;
    questions: Question[];
}

export interface Person {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    employee_id: string;
}

export interface Question {
    id: number | null;
    question: string;
    answer: string;
}

// Correct usage of Record
export type Scorecards = Record<string, Scorecard>;

export type ScorecardContainer = Record<string, Scorecard>;

// Interfaces for Slack Block Kit
export interface Block {
    type: string;
    text?: TextElement;
    elements?: BlockElement[];
    accessory?: Accessory;
}

export interface TextElement {
    type: string;
    text: string;
    emoji?: boolean;
}

export interface BlockElement {
    value?: string;
    url?: string;
    action_id?: string;
}

export interface Accessory {
    value?: string;
    url?: string;
    action_id?: string;
}

export interface SlackMessage {
    blocks: Block[];
}

export interface Candidate {
    id: number;
    first_name: string;
    last_name: string;
    company: string;
    title: string;
    recruiter: {
        id: number;
        first_name: string;
        last_name: string;
        name: string;
        employee_id: number | null;
    };
    coordinator: {
        id: number;
        first_name: string;
        last_name: string;
        name: string;
        employee_id: number | null;
    };
    [key: string]: any; // To handle dynamic properties like custom fields
}
