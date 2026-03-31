import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, ChevronRight, Trash2, Loader } from 'lucide-react';
import { useOpportunities, useArchetypes } from '../hooks/useFirestore';
import type { OpportunityStatus } from '../types';
import Toast from '../components/layout/Toast';

const statusColors: Record<OpportunityStatus, string> = {
  discovered: 'bg-blue-500/10 text-blue-400',
  applied: 'bg-purple-500/10 text-purple-400',
  outreach_sent: 'bg-yellow-500/10 text-yellow-400',
  interviewing: 'bg-orange-500/10 text-orange-400',
  offer: 'bg-green-500/10 text-green-400',
  closed: 'bg-gray-500/10 text-gray-400',
};

const statusLabels: Record<OpportunityStatus, string> = {
  discovered: 'Discovered',
  applied: 'Applied',
  outreach_sent: 'Outreach Sent',
  interviewing: 'Interviewing',
  offer: 'Offer',
  closed: 'Closed',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { opportunities, loading, deleteOpportunity } = useOpportunities();
  const { archetypes } = useArchetypes();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New opportunity form
  const [showForm, setShowForm] = useState(false);
  const { addOpportunity } = useOpportunities();
  const [form, setForm] = useState({ title: '', company: '', archetypeId: '', jdText: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.company) return;
    setSubmitting(true);
    try {
      const id = await addOpportunity({
        title: form.title,
        company: form.company,
        archetypeId: form.archetypeId,
        jdText: form.jdText,
        status: 'discovered',
        notes: '',
      });
      setShowForm(false);
      setForm({ title: '', company: '', archetypeId: '', jdText: '' });
      setToast({ message: 'Opportunity created', type: 'success' });
      navigate(`/opportunity/${id}`);
    } catch {
      setToast({ message: 'Failed to create opportunity', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteOpportunity(id);
      setToast({ message: 'Opportunity deleted', type: 'success' });
    } catch {
      setToast({ message: 'Failed to delete opportunity', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-text-secondary-dark text-sm mt-1">
            {opportunities.length} {opportunities.length === 1 ? 'opportunity' : 'opportunities'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors text-sm font-medium cursor-pointer"
        >
          <Plus size={16} />
          New Opportunity
        </button>
      </div>

      {/* New Opportunity Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative bg-surface-card-dark border border-border-dark rounded-2xl p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">New Opportunity</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Role Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. VP of Corporate Development"
                  className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors text-text-primary-dark"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Company</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g. Stripe"
                  className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors text-text-primary-dark"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Resume Archetype</label>
                <select
                  value={form.archetypeId}
                  onChange={(e) => setForm({ ...form, archetypeId: e.target.value })}
                  className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors text-text-primary-dark"
                >
                  <option value="">Select an archetype...</option>
                  {archetypes.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Job Description</label>
                <textarea
                  value={form.jdText}
                  onChange={(e) => setForm({ ...form, jdText: e.target.value })}
                  placeholder="Paste the full job description..."
                  rows={6}
                  className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors resize-none text-text-primary-dark"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 border border-border-dark rounded-xl text-sm hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Opportunities Grid */}
      {opportunities.length === 0 ? (
        <div className="text-center py-16 text-text-secondary-dark">
          <FileText size={40} className="mx-auto mb-4 opacity-40" />
          <p className="text-base">No opportunities yet.</p>
          <p className="text-sm mt-1">Create your first opportunity to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp) => (
            <Link
              key={opp.id}
              to={`/opportunity/${opp.id}`}
              className="block bg-surface-card-dark border border-border-dark rounded-xl p-5 hover:border-accent/30 transition-colors no-underline text-inherit group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold truncate">{opp.title}</h3>
                  <p className="text-sm text-text-secondary-dark mt-0.5">{opp.company}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={(e) => handleDelete(opp.id, e)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-text-secondary-dark hover:text-red-400 transition-all cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                  <ChevronRight size={16} className="text-text-secondary-dark" />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[opp.status]}`}>
                  {statusLabels[opp.status]}
                </span>
                <span className="text-xs text-text-secondary-dark">
                  {opp.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
