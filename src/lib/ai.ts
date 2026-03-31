import type { ResumeContent, OutreachAudience, OutreachMedium } from '../types';

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
