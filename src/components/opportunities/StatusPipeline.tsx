import type { OpportunityStatus } from '../../types';

const statuses: { key: OpportunityStatus; label: string }[] = [
  { key: 'discovered', label: 'Discovered' },
  { key: 'applied', label: 'Applied' },
  { key: 'outreach_sent', label: 'Outreach Sent' },
  { key: 'interviewing', label: 'Interviewing' },
  { key: 'offer', label: 'Offer' },
  { key: 'closed', label: 'Closed' },
];

interface StatusPipelineProps {
  current: OpportunityStatus;
  onChange: (status: OpportunityStatus) => void;
}

export default function StatusPipeline({ current, onChange }: StatusPipelineProps) {
  const currentIndex = statuses.findIndex((s) => s.key === current);

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((s, i) => {
        const isActive = s.key === current;
        const isPast = i < currentIndex;
        return (
          <button
            key={s.key}
            onClick={() => onChange(s.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer border ${
              isActive
                ? 'bg-accent text-white border-accent'
                : isPast
                ? 'bg-accent/10 text-accent border-accent/20'
                : 'bg-transparent text-text-secondary-dark border-border-dark hover:border-accent/40'
            }`}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
