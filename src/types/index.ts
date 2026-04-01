export interface ResumeSection {
  id: string;
  title: string;
  items: ResumeBullet[];
}

export interface ResumeBullet {
  id: string;
  text: string;
  subItems?: string[];
}

export interface ResumeContent {
  header: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
  };
  summary?: string;
  sections: ResumeSection[];
}

export interface Archetype {
  id: string;
  name: string;
  contentJson: ResumeContent;
  visualTemplate: 'classic' | 'modern' | 'minimal';
  updatedAt: Date;
}

export type OpportunityStatus =
  | 'discovered'
  | 'applied'
  | 'outreach_sent'
  | 'interviewing'
  | 'offer'
  | 'closed';

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  archetypeId: string;
  jdText: string;
  status: OpportunityStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TailoredResume {
  id: string;
  opportunityId: string;
  contentJson: ResumeContent;
  version: number;
  createdAt: Date;
}

export type OutreachAudience = 'warm_contact' | 'recruiter' | 'hiring_manager' | 'cold_connection';
export type OutreachMedium = 'text' | 'email' | 'linkedin';

export interface OutreachMessage {
  id: string;
  opportunityId: string;
  audience: OutreachAudience;
  medium: OutreachMedium;
  body: string;
  variantNumber: number;
  createdAt: Date;
}

export interface ResearchFile {
  id: string;
  opportunityId: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  caption: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  opportunityId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface InterviewerInfo {
  id: string;
  opportunityId: string;
  name: string;
  role: string;
  notes: string;
  fileUrls: string[];
  fileNames: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Reference {
  id: string;
  name: string;
  role: string;
  company: string;
  relationship: string;
  projects: string;
  notes: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewPrepResult {
  id: string;
  opportunityId: string;
  // Legacy structured fields (optional for backward compat)
  areasToFocus?: string[];
  questionsToAsk?: string[];
  experienceToEmphasize?: string[];
  additionalAdvice?: string;
  // Rich brief format
  briefMarkdown?: string;
  scratchpad?: string;
  createdAt: Date;
}
