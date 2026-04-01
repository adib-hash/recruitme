import type { ResumeContent, OutreachAudience, OutreachMedium, InterviewPrepResult, Reference } from '../types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateTailoredResume(
  archetype: ResumeContent,
  jobDescription: string,
  _researchContext?: string
): Promise<ResumeContent> {
  await delay(1500);

  const companyMatch = jobDescription.match(/(?:at|for|join)\s+([A-Z][a-zA-Z\s&]+)/);
  const company = companyMatch ? companyMatch[1].trim() : 'the company';

  return {
    header: { ...archetype.header },
    summary: `Results-driven professional with deep expertise tailored for ${company}. ${archetype.summary || 'Proven track record of driving strategic initiatives and delivering measurable impact across complex organizations.'}`,
    sections: archetype.sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        text: item.text,
      })),
    })),
  };
}

export async function generateChatResponse(
  messages: { role: string; content: string }[],
  resumeContent: ResumeContent
): Promise<string> {
  await delay(1000);

  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';

  if (lastMessage.includes('shorter') || lastMessage.includes('concise') || lastMessage.includes('cut')) {
    return "I've tightened up the bullets and removed redundant phrasing. The resume now reads more concisely while preserving the key impact metrics. Take a look at the updated version.";
  }
  if (lastMessage.includes('technical') || lastMessage.includes('tech')) {
    return "I've adjusted the tone to emphasize technical depth — added specifics around tools, frameworks, and methodologies. The language now reads more like a senior IC than a generalist.";
  }
  if (lastMessage.includes('leadership') || lastMessage.includes('management')) {
    return "I've shifted the framing to highlight leadership and team impact — managing cross-functional teams, driving org-level decisions, and mentoring. The bullet structure now leads with scope and outcomes.";
  }

  return `I've updated the resume based on your feedback. The ${resumeContent.sections.length} sections have been refined to better align with the role requirements. Let me know if you'd like further adjustments to any specific section.`;
}

export async function generateOutreachMessages(
  audience: OutreachAudience,
  medium: OutreachMedium,
  _resumeContent: ResumeContent,
  _jobDescription: string,
  company: string,
  role: string
): Promise<string[]> {
  await delay(1200);

  const audienceLabels: Record<OutreachAudience, string> = {
    warm_contact: 'warm contact',
    recruiter: 'recruiter',
    hiring_manager: 'hiring manager',
    cold_connection: 'cold connection',
  };

  const audienceLabel = audienceLabels[audience];

  if (medium === 'text') {
    return [
      `Hey! Hope you're doing well. I saw ${company} is hiring for a ${role} — would love to chat about it if you have a few minutes this week. No pressure at all.`,
      `Hi! Quick one — I'm really interested in the ${role} position at ${company}. I know you're connected there. Would you be open to a quick intro or any advice? Appreciate it either way!`,
    ];
  }

  if (medium === 'linkedin') {
    return [
      `Hi — I came across the ${role} opening at ${company} and was immediately drawn to the team's work. As a ${audienceLabel}, I'd love to connect and learn more about the opportunity. I bring a strong background in [relevant area] and would welcome the chance to discuss how I might contribute.`,
      `Hello! I'm reaching out regarding the ${role} position at ${company}. I've been following the company's trajectory and believe my experience in [relevant area] could be a strong fit. Would you be open to a brief conversation?`,
    ];
  }

  // email
  return [
    `Subject: ${role} Opportunity at ${company}\n\nHi,\n\nI'm writing to express my strong interest in the ${role} position at ${company}. With my background in strategic operations and a track record of driving cross-functional initiatives, I believe I could make a meaningful contribution to your team.\n\nI'd welcome the opportunity to discuss how my experience aligns with what you're looking for. Would you have 15 minutes for a call this week?\n\nBest regards`,
    `Subject: Interested in ${role} at ${company}\n\nHi,\n\nI recently came across the ${role} opening and was excited by the alignment with my background. I've spent the last several years driving [relevant outcomes] and am eager to bring that experience to ${company}.\n\nI'd love to connect if you're open to it. Happy to work around your schedule.\n\nBest`,
  ];
}

export async function generateInterviewPrep(
  jobDescription: string,
  company: string,
  role: string,
  interviewerName: string,
  interviewerRole: string,
  interviewerNotes: string
): Promise<Omit<InterviewPrepResult, 'id' | 'opportunityId' | 'createdAt'>> {
  await delay(1500);

  const isTechnical = /engineer|technical|cto|architect/i.test(interviewerRole);
  const isSeniorLeader = /director|vp|head|chief|president|ceo|partner/i.test(interviewerRole);
  const interviewer = interviewerName || 'the interviewer';
  const interviewerCtx = interviewerRole ? `${interviewer} (${interviewerRole})` : interviewer;

  let interviewerAnalysis = '';
  if (interviewerNotes) {
    interviewerAnalysis = `\n\n## What This Means for You\n\n`;
    if (isSeniorLeader) {
      interviewerAnalysis += `* As a senior leader, ${interviewer} is likely evaluating strategic thinking, leadership trajectory, and cultural alignment — not just technical execution. Lead with judgment and impact, not just process.\n\n`;
      interviewerAnalysis += `* With their seniority, they probably have significant influence on the hiring decision. This conversation is about trust and fit as much as it is about skills.\n\n`;
      interviewerAnalysis += `* Demonstrate that you understand the business context, not just the role requirements. Show you can think at their level while executing at the ground level.`;
    } else if (isTechnical) {
      interviewerAnalysis += `* ${interviewer}'s technical background means they'll appreciate concrete details — specific tools, frameworks, methodologies, and data-driven examples.\n\n`;
      interviewerAnalysis += `* Don't over-explain basic concepts; instead, show depth and nuance in your technical understanding.\n\n`;
      interviewerAnalysis += `* If you have any hands-on building experience (side projects, tools you've built, technical initiatives you've led), this is a strong differentiator.`;
    } else {
      interviewerAnalysis += `* ${interviewer} will be evaluating how you'd work cross-functionally and whether you can communicate clearly across teams.\n\n`;
      interviewerAnalysis += `* Focus on collaborative examples — times you've partnered with different functions to drive outcomes.\n\n`;
      interviewerAnalysis += `* Show genuine curiosity about their perspective and how the role intersects with their work.`;
    }
  }

  const briefMarkdown = `**INTERVIEW PREP BRIEF**

**${company} — ${role}**

*Interview with ${interviewerCtx}*

# The Company & The Interviewer

**${company}** is hiring for the **${role}** position. ${jobDescription ? `Based on the job description, the team is looking for someone who can drive impact across ${jobDescription.length > 200 ? 'multiple dimensions of the business' : 'key initiatives'}. Review the full JD carefully before the interview — be ready to connect your experience to their specific needs and language.` : 'Research the company thoroughly before the interview — understand their market position, recent news, team structure, and strategic priorities.'}

**Your interviewer** is ${interviewerCtx}.${interviewerNotes ? ` ${interviewerNotes}` : ' Research them on LinkedIn before the interview — understand their background, tenure at the company, and any shared connections or interests.'}${interviewerAnalysis}

# What to Emphasize

* **Relevant domain experience.** Draw direct parallels between your background and what ${company} does. The more specific you can be about industry overlap, similar challenges, or transferable skills, the stronger your case.

* **Measurable impact.** Every claim should have a number or outcome attached. Revenue grown, teams scaled, processes built, efficiency gained. ${isSeniorLeader ? 'Senior leaders think in outcomes, not activities.' : 'Concrete results are more memorable than abstract descriptions.'}

* **Cross-functional leadership.** Show that you can work across teams, influence without authority, and drive alignment. ${company} likely needs someone who can operate in ambiguity and bring structure.

* **Genuine curiosity about the role.** Don't just answer questions — show that you've thought deeply about what this role entails, what the challenges are, and why you're the right person to tackle them.${isTechnical ? '\n\n* **Technical fluency.** With a technical interviewer, don\'t shy away from specifics. Mention tools, frameworks, data approaches, and any hands-on building you\'ve done. This differentiates you from candidates who can only speak at a high level.' : ''}

# What to De-Emphasize

* **Irrelevant experience.** If you have roles or projects that don't connect to this opportunity, mention them briefly for context but don't dwell. Pivot quickly to what's relevant.

* **Title or seniority for its own sake.** Lead with what you did and learned, not the title. The risk of overemphasizing seniority is seeming overqualified or inflexible.

* **Complaints about previous roles.** Frame transitions positively — what you learned, what you're moving toward, not what you're running from.

# Your "Why ${company}" Narrative

*Core narrative (practice this in 60-90 seconds):*

"I've spent my career building skills in [your core domain] — from [earliest relevant role] through [most recent relevant experience]. What excites me about ${company} is [specific aspect of the company — mission, product, team, market position]. The ${role} sits at the intersection of [2-3 things you're good at], which is exactly where I do my best work. I'm not looking for just any next step — I'm looking for a place where my specific experience in [key differentiator] creates outsized value, and everything I've learned about ${company} tells me this is that place."

# Questions to Anticipate

1. **"Walk me through your background."** Use the narrative above. 90 seconds max. Hit the highlights, connect the dots, and land on why you're here. Don't recite your resume — tell a story with a through-line.

2. **"Why ${company}?"** Be specific. Reference something real — a product decision, a company value, a market thesis, a person you've spoken to. Generic answers like "I love the mission" fall flat. Show you've done your homework.

3. **"Why this role?"** Connect your skills and interests to the specific responsibilities. Explain why this is the right role at the right time in your career — not just a lateral move, but a deliberate step.

4. **"Tell me about a time you [faced a challenge / led a team / drove results]."** Have 2-3 STAR stories ready. Pick situations that mirror the challenges this role likely faces. Be specific about your actions and the outcome.

5. **"What's your biggest weakness / area for growth?"** Pick something real but not disqualifying. Frame it as self-awareness plus active improvement. ${isSeniorLeader ? 'Senior leaders respect honesty over polish here.' : ''}

6. **"Where do you see yourself in 3-5 years?"** Align your answer with growing within ${company}'s trajectory. Show ambition that serves their goals, not just yours.

7. **"Do you have any questions for me?"** Always say yes. Your questions below are your chance to demonstrate depth of thought and genuine interest.

# Questions to Ask ${interviewer}

* "What does success look like for the ${role} in the first 6-12 months? What would make you confident this was the right hire?"

* "What's the biggest challenge the team is facing right now that this person would help solve?"

* "How does this role collaborate with ${interviewerRole ? `your team (${interviewerRole})` : 'other functions'} on a day-to-day basis?"

* "What's something about working at ${company} that surprised you — something you didn't expect before joining?"

* "How does ${company} think about professional growth and development for someone in this role?"

* "What would you want me to know about the team culture that I wouldn't get from the job description?"`;

  return {
    briefMarkdown,
  };
}

export interface ReferenceRecommendation {
  referenceId: string;
  reason: string;
  strength: 'strong' | 'good' | 'possible';
}

export async function recommendReferences(
  references: Reference[],
  jobDescription: string,
  company: string,
  role: string
): Promise<ReferenceRecommendation[]> {
  await delay(1200);

  if (references.length === 0) return [];

  const jdLower = jobDescription.toLowerCase();
  const roleLower = role.toLowerCase();

  return references.map((ref) => {
    const refContext = `${ref.role} ${ref.company} ${ref.relationship} ${ref.projects} ${ref.notes}`.toLowerCase();

    let strength: 'strong' | 'good' | 'possible' = 'possible';
    let reason = `${ref.name} can speak to your general professional capabilities and work ethic.`;

    // Check for industry/company overlap
    if (refContext.includes(company.toLowerCase())) {
      strength = 'strong';
      reason = `${ref.name} has direct experience at ${company} and can provide insider context on your fit for the team and culture.`;
    }
    // Check for role-type overlap
    else if (
      (roleLower.includes('strategy') && refContext.includes('strategy')) ||
      (roleLower.includes('operations') && refContext.includes('operations')) ||
      (roleLower.includes('engineering') && refContext.includes('engineering')) ||
      (roleLower.includes('product') && refContext.includes('product'))
    ) {
      strength = 'strong';
      reason = `${ref.name}'s experience in ${ref.role} at ${ref.company} aligns closely with this role. They can speak directly to your relevant skills and impact.`;
    }
    // Check for leadership/management overlap
    else if (
      (jdLower.includes('leadership') || jdLower.includes('management')) &&
      (refContext.includes('direct report') || refContext.includes('managed') || refContext.includes('led'))
    ) {
      strength = 'good';
      reason = `${ref.name} can attest to your leadership style and team management — relevant for the leadership aspects of this role.`;
    }
    // Check for project overlap
    else if (ref.projects && ref.projects.length > 10) {
      strength = 'good';
      reason = `${ref.name} collaborated with you on key projects and can speak to your execution, collaboration, and impact.`;
    }

    return {
      referenceId: ref.id,
      reason,
      strength,
    };
  }).sort((a, b) => {
    const order = { strong: 0, good: 1, possible: 2 };
    return order[a.strength] - order[b.strength];
  });
}
