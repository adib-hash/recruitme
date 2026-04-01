**RECRUITME**

recruitme.ihsan.build

Product Requirements Document

  --------------------- ---------------------------------------------------
  **Author**            Adib

  **Version**           1.0 --- Draft

  **Date**              March 31, 2026

  **Status**            Brainstorm → PRD

  **Target Platform**   Web (responsive: desktop + mobile)

  **Stack**             React + Tailwind / Supabase / Vercel / Claude API
  --------------------- ---------------------------------------------------

*CONFIDENTIAL --- FOR PERSONAL USE*

1\. Overview

RecruitMe is a personal job-seeking command center that automates resume tailoring and outreach messaging. It is organized around individual job opportunities, with AI-powered content generation and a conversational editing interface. The app lives at recruitme.ihsan.build and is designed to feel seamless across desktop and mobile.

1.1 Problem Statement

Job seekers targeting multiple role types (M&A, tech, AI strategy, operations/chief of staff) must manually tailor resumes and outreach for each application. The current workflow involves editing Google Docs, exporting to PDF, managing multiple file versions, switching between devices, and crafting bespoke outreach messages for different audiences and mediums. This process is slow, fragmented, and error-prone.

1.2 Core Thesis

A job seeker should be able to go from discovering a role to having a tailored resume PDF and audience-specific outreach messages in under 10 minutes, entirely from their phone or desktop.

1.3 User

Primary user: the author (Adib), an experienced professional in active career transition targeting roles across investing, AI strategy, and operations. Future possibility of extending to other job seekers, but all v1 decisions optimize for a single-user experience.

2\. Core Concepts & Data Model

The app is organized around three primary objects:

2.1 Resume Archetypes

A set of 4--5 base resume templates representing distinct role categories. Each archetype contains the full resume content (sections, bullets, ordering) tailored for that category. Archetypes are long-lived and evolve over time. They serve as the starting point for any job-specific tailoring.

-   M&A / Corporate Development

-   AI Strategy / Transformation

-   Chief of Staff / Operations

-   Tech / Product (Growth-Stage)

-   Generalist / Investor

2.2 Opportunities

An Opportunity is the core unit of work. It represents a single job application and bundles together everything related to that application:

-   **Job Description:** pasted text, uploaded PDF, or a URL the app can fetch (v2)

-   **Research dump:** screenshots, notes, and context the user brings (LinkedIn posts, hiring manager background, company info)

-   **Tailored resume:** generated from the closest archetype, refined via chat

-   **Outreach messages:** one or more messages tailored to audience and medium

-   **Status tracker:** simple pipeline (Discovered → Applied → Outreach Sent → Interviewing → Offer → Closed)

-   **Notes:** freeform scratchpad for the user's own thoughts

2.3 Outreach Messages

Each opportunity can have multiple outreach messages. Messages are defined by two axes:

-   **Audience:** warm contact (friend at company), recruiter, hiring manager, cold connection

-   **Medium:** text message, email, LinkedIn message

The AI generates drafts appropriate to both dimensions. The user can generate multiple variants per audience/medium combination and pick their favorite. Message tracking (response rates, A/B analytics) is explicitly out of scope for v1.

3\. Feature Requirements

3.1 v1 Feature Matrix

  ----------------------- -------------------------------------------------------------------------------- ---------------------
  **Feature**             **Description**                                                                  **Priority**

  Resume Archetypes       Create, edit, and manage 4--5 base resume templates with full content editing    P0 --- Must Have

  Opportunity Creation    Create an opportunity, paste/upload job description, select closest archetype    P0 --- Must Have

  AI Resume Tailoring     AI generates a tailored resume from archetype + job description + user context   P0 --- Must Have

  Chat Sidebar            Freeform conversational interface to iterate on resume and outreach drafts       P0 --- Must Have

  PDF Export              One-tap export of tailored resume as a clean, formatted PDF                      P0 --- Must Have

  Resume Templates        2--3 visual layout templates (typography, spacing, section styling)              P0 --- Must Have

  Outreach Generation     AI-generated outreach messages by audience type and medium                       P1 --- Should Have

  Research Dump           Upload screenshots, paste text, attach files as context for the AI               P1 --- Should Have

  Status Tracker          Simple pipeline status per opportunity (Discovered through Closed)               P1 --- Should Have

  Notes                   Freeform text notes per opportunity                                              P2 --- Nice to Have

  Opportunity Dashboard   List view of all opportunities with status, date, and quick actions              P1 --- Should Have

  Interview Prep          Add interviewer info (name, role, notes, files/screenshots), generate            P1 --- Should Have
                          personalized prep advice: areas to focus, questions to ask, experience
                          to emphasize, and additional coaching

  References              Global reference bank with contact info, role, company, relationship,           P1 --- Should Have
                          projects, and notes. AI recommends the best references for each
                          opportunity based on role context and relevance.
  ----------------------- -------------------------------------------------------------------------------- ---------------------

3.2 v2+ Roadmap (Out of Scope for v1)

-   Outreach response tracking and A/B analytics

-   AI-assisted research (auto-fetch company pages, LinkedIn profiles, job boards)

-   URL-based job description import (paste a link, app scrapes the JD)

-   Multiple users / team features

-   Email integration (send outreach directly from the app)

-   Calendar integration for interview scheduling

2.4 Interview Prep

An Interview Prep is an optional layer on top of an Opportunity. When the user is scheduled for an interview, they can add one or more interviewers with:

-   **Name and role:** who they're meeting with and their title

-   **Free text notes:** LinkedIn bio, recent posts, mutual connections, background research

-   **Attached files:** screenshots, PDFs, or documents with relevant context

The AI uses this information along with the job description to generate personalized prep advice organized into four categories:

-   **Areas to Focus:** what to research and be prepared to discuss

-   **Questions to Ask:** tailored questions that show thoughtfulness and interest

-   **Experience to Emphasize:** which parts of the user's background to highlight

-   **Additional Advice:** rapport-building tips and general coaching

2.5 References

References are a global resource — they belong to the user, not a specific opportunity. Each reference stores:

-   **Name, role, and company:** who they are professionally

-   **Relationship:** how the user knows them (direct manager, peer, mentee, etc.)

-   **Projects:** key work they did together

-   **Notes:** what this person knows the user best for, strengths they'd highlight

-   **Contact info:** email and phone for quick access

When viewing an opportunity, the AI can recommend which references are the strongest fit based on the job description, company, and role context. Recommendations are ranked by relevance (strong match, good match, or possible) with an explanation for each.

4\. Key User Flows

4.1 New Opportunity Flow

**Trigger:** User discovers a job they want to apply to.

1.  1\. User taps \"New Opportunity\" from the dashboard

2.  2\. Pastes the job description (or uploads as PDF)

3.  3\. Adds a title (role + company) and selects the closest resume archetype

4.  4\. Optionally uploads research materials (screenshots, notes)

5.  5\. Optionally pastes relevant context from their career docs

6.  6\. Taps \"Generate\" --- AI produces a tailored resume draft

7.  7\. User reviews the draft in a live preview pane

8.  8\. User iterates via chat sidebar (\"make tone more technical\", \"cut the ASG bullets to 3\")

9.  9\. When satisfied, user taps \"Export PDF\" and receives a formatted resume

4.2 Outreach Flow

**Trigger:** User wants to send a message about this opportunity.

10. 1\. Within an opportunity, user navigates to the Outreach tab

11. 2\. Selects audience type (warm contact, recruiter, hiring manager)

12. 3\. Selects medium (text, email, LinkedIn)

13. 4\. AI generates 2--3 draft variants

14. 5\. User picks a favorite or iterates via chat (\"warmer tone\", \"shorter\")

15. 6\. User copies the final message to clipboard (one tap) for sending via the actual platform

4.3 Interview Prep Flow

**Trigger:** User has an upcoming interview for an opportunity.

1.  1\. Within an opportunity, user navigates to the Interview Prep tab

2.  2\. Taps "Add" to add an interviewer — enters name, role, and pastes any background info

3.  3\. Optionally attaches screenshots or files (LinkedIn profile, company page, etc.)

4.  4\. Repeats for additional interviewers if meeting multiple people

5.  5\. Taps "Generate Interview Prep" — AI produces personalized prep advice

6.  6\. User reviews prep organized into: Areas to Focus, Questions to Ask, Experience to Emphasize, and Additional Advice

7.  7\. User can regenerate prep as they add more context or interviewers

4.4 Reference Management & Recommendations

**Trigger:** User wants to manage references or see which ones fit a specific role.

**Management (via References page in sidebar):**

1.  1\. User navigates to References from the sidebar

2.  2\. Taps "Add Reference" and enters name, role, company, relationship, projects, notes, and contact info

3.  3\. References persist globally and are available for recommendations across all opportunities

**Recommendations (via Interview Prep tab on Opportunity):**

1.  1\. Within an opportunity, user navigates to the Interview Prep tab

2.  2\. Scrolls to the "Recommended References" section

3.  3\. Taps "Get Recommendations" — AI ranks all references by fit for this specific role

4.  4\. Each recommendation shows the reference name, match strength (strong/good/possible), and a reason explaining the relevance

4.5 Resume Archetype Management

**Trigger:** User wants to update a base template (e.g., new project to add, bullet rewording).

16. 1\. User navigates to the Archetypes section

17. 2\. Opens the relevant archetype

18. 3\. Edits content directly (sections, bullets, ordering)

19. 4\. Changes propagate as the new baseline for future opportunities using this archetype

***Note:** Existing tailored resumes are not retroactively updated. Each opportunity's resume is a snapshot.*

5\. Architecture & Technical Stack

5.1 High-Level Architecture

RecruitMe is a standard modern web app with three layers:

5.1.1 Frontend

-   **Framework:** React (Vite)

-   **Styling:** Tailwind CSS

-   **Deployment:** Vercel (recruitme.ihsan.build)

-   **Responsiveness:** Mobile-first design. Full functionality on all screen sizes. Touch-optimized controls, bottom navigation on mobile, collapsible sidebar on desktop.

-   **PDF Generation:** Client-side or serverless. Options include react-pdf (@react-pdf/renderer) for template-based rendering, or a serverless function that uses Puppeteer/Playwright to render HTML-to-PDF. The HTML-to-PDF approach offers more layout control and is recommended.

5.1.2 Backend & Database

-   **Database:** Supabase (Postgres). Stores archetypes, opportunities, messages, research attachments (metadata), and chat history.

-   **File Storage:** Supabase Storage for uploaded research materials (screenshots, PDFs).

-   **Auth:** Supabase Auth. Single-user for v1, but building with auth from the start keeps the door open for multi-user later.

-   **API Layer:** Vercel serverless functions (Edge or Node) to proxy LLM calls and handle PDF generation.

5.1.3 AI Layer

-   **LLM:** Anthropic Claude API (claude-sonnet-4-20250514 for speed/cost, with option to upgrade to Opus for complex tailoring).

-   **Integration pattern:** Vercel serverless function proxies requests to the Claude API. The frontend sends the job description, archetype content, user context, and chat history. The serverless function constructs the prompt and streams the response back.

-   **Prompt architecture:** System prompt defines the resume-tailoring task and formatting rules. User messages include the JD, archetype, and any research context. The chat sidebar maintains a conversation thread so the AI has full context of prior edits.

-   **Structured output:** The AI returns resume content as structured JSON (sections, bullets, metadata) so the frontend can render it in the chosen visual template and generate a consistent PDF.

5.2 Data Schema (Simplified)

  ------------------- ---------------------------------------------------------------------- ---------------------------------------------------
  **Table**           **Key Fields**                                                         **Notes**

  archetypes          id, name, content_json, visual_template, updated_at                    4--5 rows; content is structured sections/bullets

  opportunities       id, title, company, archetype_id, jd_text, status, notes, created_at   Core unit of work

  tailored_resumes    id, opportunity_id, content_json, version, created_at                  Snapshot per generation; supports version history

  outreach_messages   id, opportunity_id, audience, medium, body, variant_number             Multiple variants per audience/medium combo

  research_files      id, opportunity_id, file_url, file_type, caption                       References to Supabase Storage objects

  chat_history        id, opportunity_id, role, content, created_at                          Full conversation thread for AI context

  interviewer_info    id, opportunity_id, name, role, notes, file_urls, file_names           Context about each interviewer for prep generation

  interview_prep      id, opportunity_id, areas_to_focus, questions_to_ask,                  AI-generated prep advice per opportunity
                      experience_to_emphasize, additional_advice, created_at

  references          id, name, role, company, relationship, projects, notes,               Global reference bank; not scoped to opportunity
                      email, phone, created_at, updated_at
  ------------------- ---------------------------------------------------------------------- ---------------------------------------------------

6\. Design Direction

6.1 What It Should Look Like

The visual language should feel professional and confident without being corporate. Think: a personal tool built by someone with taste, not a SaaS product trying to convert free users.

-   **Color palette:** Dark navy primary (#1B2A4A), blue accent (#3B82F6), warm white backgrounds, subtle gray borders. Consistent with the ihsan.build ecosystem.

-   **Typography:** Clean sans-serif for UI (Inter or similar). The resume templates themselves may use more traditional fonts (Garamond, Cambria) depending on the template chosen.

-   **Layout:** On desktop, a two-panel layout: content on the left (resume preview or outreach drafts), chat sidebar on the right. On mobile, these stack vertically with a tab-based toggle between preview and chat.

-   **Dashboard:** Clean card-based grid showing opportunities with status badges, company name, role title, and last-modified date. Quick actions: open, export PDF, copy outreach.

-   **Density:** Comfortable spacing. Not cramped, not wasteful. Optimized for scanning and quick action.

6.2 What It Should Feel Like

The experience should feel like having a sharp, fast career advisor sitting next to you. Key emotional qualities:

-   **Fast:** AI responses stream in. PDF export is near-instant. No loading spinners that last more than a second.

-   **Seamless:** Moving between desktop and mobile should feel like picking up where you left off. Same data, same state, same interface adapted to the screen.

-   **In control:** The user is always in the driver's seat. The AI proposes; the user disposes. No black-box magic. You can see exactly what changed and why.

-   **Low friction:** One tap to export. One tap to copy. No unnecessary modals, confirmations, or steps between intention and action.

-   **Calm:** Job searching is stressful. The app should feel like a steady, organized workspace. No gamification, no urgency cues, no notification spam.

6.3 Key UI Components

-   **Resume Preview Pane:** Live-rendered view of the tailored resume in the selected visual template. Changes from the chat sidebar reflect in real time. Scrollable, zoomable on mobile.

-   **Chat Sidebar:** Persistent conversation thread scoped to the current opportunity. Supports freeform text input. Shows AI responses inline with clear visual distinction.

-   **Outreach Cards:** Each message variant displayed as a card with audience badge, medium badge, and one-tap copy button. Swipeable on mobile.

-   **Status Pipeline:** Horizontal pill-based tracker at the top of each opportunity. Tap to advance status.

-   **Archetype Selector:** Visual cards showing archetype name and a content preview snippet. Used during opportunity creation.

7\. Technical Considerations & Open Questions

7.1 PDF Generation

This is the most technically complex piece. Two viable approaches:

-   **Option A --- HTML-to-PDF via serverless (recommended):** Render the resume as HTML/CSS using the chosen template, then convert to PDF via Puppeteer in a Vercel serverless function. Pros: full layout control, consistent output, supports complex typography. Cons: serverless cold starts, Puppeteer binary size.

-   **Option B --- Client-side with \@react-pdf/renderer:** Generate the PDF entirely in the browser using React components. Pros: no server dependency, instant. Cons: limited CSS support, harder to match professional resume formatting, font handling is tricky.

**Recommendation:** Start with Option A. The quality ceiling is much higher, and Vercel's serverless functions handle Puppeteer well with the \@sparticuz/chromium package.

7.2 AI Prompt Design

The prompt architecture is critical to output quality. Key design decisions:

-   The system prompt should define the persona (expert career coach / resume writer) and output format (structured JSON with sections and bullets).

-   The job description, archetype content, and any research context are sent as user messages with clear delimiters.

-   Chat history is maintained in full so the AI understands prior edits. For long conversations, older messages may need summarization to stay within context limits.

-   Outreach prompts are separate from resume prompts. They should receive the tailored resume content as additional context so the outreach is consistent with the resume narrative.

7.3 Open Questions

-   How to handle archetype versioning: if the user updates an archetype, should existing opportunities be flagged as based on an older version?

-   Should the chat sidebar support image/screenshot input (for sending research context mid-conversation), or only text?

-   PDF template selection: should this be per-archetype (always use Template A for M&A roles) or per-opportunity?

-   Offline support: is there a meaningful offline use case, or is this always-online acceptable?

-   Cost management: Claude API calls per opportunity could add up. Should the app show estimated token usage or implement rate limiting?

8\. Success Criteria

For v1, success is defined by personal utility:

-   Time from discovering a role to having a tailored PDF resume: under 10 minutes

-   Time to generate audience-specific outreach messages: under 3 minutes

-   Full functionality on mobile Safari/Chrome without compromise

-   Resume PDF output quality matches or exceeds manually formatted Google Docs export

-   The app replaces the current Google Docs + Claude + file management workflow entirely

9\. Implementation Phases

Phase 1: Foundation (Week 1--2)

-   Supabase project setup (database schema, auth, storage)

-   Vercel project with React + Tailwind scaffold

-   Archetype CRUD (create, edit, view base resume templates)

-   Basic opportunity creation (title, company, JD paste)

-   Claude API integration via serverless function

Phase 2: Core AI Loop (Week 3--4)

-   AI resume tailoring: archetype + JD → tailored resume (structured JSON)

-   Chat sidebar with streaming AI responses

-   Resume preview pane rendering structured content

-   Iterative editing via chat (tone changes, bullet edits, section reordering)

Phase 3: PDF & Polish (Week 5--6)

-   2--3 visual resume templates (HTML/CSS)

-   PDF generation via Puppeteer serverless function

-   One-tap PDF export and download

-   Mobile-first responsive design pass

Phase 4: Outreach & Dashboard (Week 7--8)

-   Outreach message generation (audience × medium matrix)

-   One-tap copy to clipboard

-   Opportunity dashboard with status tracking

-   Research file upload (screenshots, PDFs to Supabase Storage)

-   Notes field per opportunity

**End of document.** *This PRD is a living document and will evolve as development progresses.*
