import { useState } from 'react';
import {
  Sparkles,
  Loader,
  Users,
  Star,
  ChevronRight,
  Building2,
  Briefcase,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Reference } from '../../types';
import { recommendReferences, type ReferenceRecommendation } from '../../lib/ai';

interface ReferenceRecommendationsProps {
  references: Reference[];
  jobDescription: string;
  company: string;
  role: string;
}

const strengthColors = {
  strong: 'text-green-400 bg-green-400/10',
  good: 'text-amber-400 bg-amber-400/10',
  possible: 'text-text-secondary-dark bg-white/5',
};

const strengthLabels = {
  strong: 'Strong match',
  good: 'Good match',
  possible: 'Possible',
};

export default function ReferenceRecommendations({
  references,
  jobDescription,
  company,
  role,
}: ReferenceRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ReferenceRecommendation[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const results = await recommendReferences(references, jobDescription, company, role);
      setRecommendations(results);
      setGenerated(true);
    } finally {
      setGenerating(false);
    }
  };

  if (references.length === 0) {
    return (
      <div className="border border-dashed border-border-dark rounded-xl p-6 text-center">
        <Users size={28} className="mx-auto mb-2 opacity-40 text-text-secondary-dark" />
        <p className="text-sm text-text-secondary-dark">No references added yet.</p>
        <Link
          to="/references"
          className="inline-flex items-center gap-1 text-sm text-accent mt-2 hover:underline"
        >
          Add references
          <ChevronRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-secondary-dark flex items-center gap-2">
          <Star size={16} />
          Recommended References
        </h3>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
        >
          {generating ? <Loader size={13} className="animate-spin" /> : <Sparkles size={13} />}
          {generated ? 'Refresh' : 'Get Recommendations'}
        </button>
      </div>

      {!generated && !generating && (
        <p className="text-xs text-text-secondary-dark">
          Generate AI recommendations to see which of your {references.length} reference{references.length !== 1 ? 's' : ''} best fit this role.
        </p>
      )}

      {generated && recommendations.length > 0 && (
        <div className="space-y-2.5">
          {recommendations.map((rec) => {
            const ref = references.find((r) => r.id === rec.referenceId);
            if (!ref) return null;
            return (
              <div
                key={rec.referenceId}
                className="bg-surface-card-dark border border-border-dark rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold">{ref.name}</p>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${strengthColors[rec.strength]}`}>
                        {strengthLabels[rec.strength]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {ref.role && (
                        <span className="flex items-center gap-1 text-xs text-text-secondary-dark">
                          <Briefcase size={10} />
                          {ref.role}
                        </span>
                      )}
                      {ref.company && (
                        <span className="flex items-center gap-1 text-xs text-text-secondary-dark">
                          <Building2 size={10} />
                          {ref.company}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary-dark leading-relaxed">{rec.reason}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {generated && (
        <p className="text-xs text-text-secondary-dark">
          <Link to="/references" className="text-accent hover:underline">Manage references</Link>
          {' '}to improve recommendations.
        </p>
      )}
    </div>
  );
}
