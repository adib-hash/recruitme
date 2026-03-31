import { useState } from 'react';
import { Copy, Check, Loader, Sparkles } from 'lucide-react';
import type { OutreachAudience, OutreachMedium, OutreachMessage, ResumeContent } from '../../types';
import { generateOutreachMessages } from '../../lib/ai';

const audiences: { key: OutreachAudience; label: string }[] = [
  { key: 'warm_contact', label: 'Warm Contact' },
  { key: 'recruiter', label: 'Recruiter' },
  { key: 'hiring_manager', label: 'Hiring Manager' },
  { key: 'cold_connection', label: 'Cold Connection' },
];

const mediums: { key: OutreachMedium; label: string }[] = [
  { key: 'text', label: 'Text Message' },
  { key: 'email', label: 'Email' },
  { key: 'linkedin', label: 'LinkedIn' },
];

interface OutreachGeneratorProps {
  messages: OutreachMessage[];
  resumeContent: ResumeContent | null;
  jobDescription: string;
  company: string;
  role: string;
  onGenerate: (audience: string, medium: string, bodies: string[]) => void;
}

export default function OutreachGenerator({
  messages,
  resumeContent,
  jobDescription,
  company,
  role,
  onGenerate,
}: OutreachGeneratorProps) {
  const [audience, setAudience] = useState<OutreachAudience>('warm_contact');
  const [medium, setMedium] = useState<OutreachMedium>('text');
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const bodies = await generateOutreachMessages(
        audience,
        medium,
        resumeContent || { header: { name: '', title: '', email: '', phone: '', location: '' }, sections: [] },
        jobDescription,
        company,
        role
      );
      onGenerate(audience, medium, bodies);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMessages = messages.filter((m) => m.audience === audience && m.medium === medium);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Audience</label>
          <div className="flex flex-wrap gap-2">
            {audiences.map((a) => (
              <button
                key={a.key}
                onClick={() => setAudience(a.key)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors cursor-pointer ${
                  audience === a.key
                    ? 'bg-accent text-white border-accent'
                    : 'bg-transparent text-text-secondary-dark border-border-dark hover:border-accent/40'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Medium</label>
          <div className="flex flex-wrap gap-2">
            {mediums.map((m) => (
              <button
                key={m.key}
                onClick={() => setMedium(m.key)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors cursor-pointer ${
                  medium === m.key
                    ? 'bg-accent text-white border-accent'
                    : 'bg-transparent text-text-secondary-dark border-border-dark hover:border-accent/40'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover disabled:opacity-50 transition-colors cursor-pointer text-sm font-medium"
        >
          {generating ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {generating ? 'Generating...' : 'Generate Messages'}
        </button>
      </div>

      {filteredMessages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-text-secondary-dark">
            {audiences.find((a) => a.key === audience)?.label} via {mediums.find((m) => m.key === medium)?.label}
          </h4>
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="relative bg-surface-card-dark border border-border-dark rounded-xl p-4 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="text-xs text-text-secondary-dark mb-2 block">Variant {msg.variantNumber}</span>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                </div>
                <button
                  onClick={() => handleCopy(msg.id, msg.body)}
                  className="shrink-0 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  title="Copy to clipboard"
                >
                  {copiedId === msg.id ? (
                    <Check size={16} className="text-green-400" />
                  ) : (
                    <Copy size={16} className="text-text-secondary-dark" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
