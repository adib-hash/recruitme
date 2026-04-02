import { useState, useRef } from 'react';
import { Copy, Check, Loader, Sparkles } from 'lucide-react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
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

function SwipeableOutreachCard({
  msg,
  copiedId,
  onCopy,
}: {
  msg: OutreachMessage;
  copiedId: string | null;
  onCopy: (id: string, text: string) => void;
}) {
  const x = useMotionValue(0);
  const copyOpacity = useTransform(x, [-80, -40], [1, 0]);
  const copyScale = useTransform(x, [-80, -40], [1, 0.8]);
  const touchStartRef = useRef<{ x: number; y: number; locked: 'x' | 'y' | null }>({ x: 0, y: 0, locked: null });

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, locked: null };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    // Lock direction after ~10px of movement
    if (!touchStartRef.current.locked) {
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        touchStartRef.current.locked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
    }

    if (touchStartRef.current.locked === 'x' && dx < 0) {
      e.preventDefault();
      x.set(Math.max(dx, -100));
    }
  };

  const handleTouchEnd = () => {
    if (x.get() < -60) {
      onCopy(msg.id, msg.body);
    }
    x.set(0);
    touchStartRef.current.locked = null;
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Swipe reveal background */}
      <motion.div
        className="absolute inset-y-0 right-0 w-20 flex items-center justify-center bg-accent/20 rounded-r-xl"
        style={{ opacity: copyOpacity, scale: copyScale }}
      >
        <Copy size={18} className="text-accent" />
      </motion.div>

      <motion.div
        className="relative bg-surface-card-dark border border-border-dark rounded-xl p-4 group"
        style={{ x }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <span className="text-xs text-text-secondary-dark mb-2 block">Variant {msg.variantNumber}</span>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
          </div>
          <button
            onClick={() => onCopy(msg.id, msg.body)}
            className="shrink-0 p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            title="Copy to clipboard"
          >
            {copiedId === msg.id ? (
              <Check size={16} className="text-green-400" />
            ) : (
              <Copy size={16} className="text-text-secondary-dark" />
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
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

      <AnimatePresence mode="popLayout">
        {filteredMessages.length > 0 && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <h4 className="text-sm font-medium text-text-secondary-dark">
              {audiences.find((a) => a.key === audience)?.label} via {mediums.find((m) => m.key === medium)?.label}
            </h4>
            {filteredMessages.map((msg) => (
              <SwipeableOutreachCard
                key={msg.id}
                msg={msg}
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
