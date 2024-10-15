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
    /* eslint-disable @typescript-eslint/no-explicit-any */
    [key: string]: any; // To handle dynamic properties like custom fields
}

export interface Department {
    id: number;
    name: string;
    parent_id?: number;
    child_ids?: number[];
    external_id?: string;
}

export interface OfficeLocation {
    name: string;
}

export interface Office {
    id: number;
    name: string;
    location: OfficeLocation;
    primary_contact_user_id: number;
    parent_id?: number;
    child_ids?: number[];
    external_id?: string;
}

export interface CustomField {
    employment_type?: string;
    maximum_budget?: string;
    salary_range?: {
        min_value: number;
        max_value: number;
        unit: string;
    };
}

export interface KeyedCustomFieldValue {
    name: string;
    type: string;
    value: any;
}

export interface KeyedCustomFields {
    employment_type?: KeyedCustomFieldValue;
    budget?: KeyedCustomFieldValue;
    salary_range?: KeyedCustomFieldValue;
}

export interface TeamMember {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    employee_id: string;
    responsible?: boolean;
}

export interface HiringTeam {
    hiring_managers: TeamMember[];
    recruiters: TeamMember[];
    coordinators: TeamMember[];
    sourcers: TeamMember[];
}

export interface CloseReason {
    id: number;
    name: string;
}

export interface Opening {
    id: number;
    opening_id?: string | null;
    status: "open" | "closed";
    opened_at: string;
    closed_at?: string | null;
    application_id?: number | null;
    close_reason?: CloseReason | null;
}

export interface GreenhouseJob {
    id: number;
    name: string;
    requisition_id: string;
    notes?: string;
    confidential: boolean;
    status: "open" | "closed" | "draft";
    created_at: string;
    opened_at: string;
    closed_at?: string;
    updated_at: string;
    is_template?: boolean | null;
    copied_from_id?: number | null;
    departments: Department[];
    offices: Office[];
    custom_fields: CustomField;
    keyed_custom_fields: KeyedCustomFields;
    hiring_team: HiringTeam;
    openings: Opening[];
}
