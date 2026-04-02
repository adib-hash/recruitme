import { useState, useMemo } from 'react';
import { useScrollLock } from '../hooks/useScrollLock';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, ChevronRight, Trash2, Search, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useOpportunities, useArchetypes } from '../hooks/useFirestore';
import type { OpportunityStatus } from '../types';
import Toast from '../components/layout/Toast';
import { SkeletonGrid } from '../components/ui/Skeleton';

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

const allStatuses: OpportunityStatus[] = ['discovered', 'applied', 'outreach_sent', 'interviewing', 'offer', 'closed'];

type SortOption = 'newest' | 'alphabetical';

export default function Dashboard() {
  const navigate = useNavigate();
  const { opportunities, loading, deleteOpportunity } = useOpportunities();
  const { archetypes } = useArchetypes();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filter / sort / search state
  const [activeFilters, setActiveFilters] = useState<Set<OpportunityStatus>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // New opportunity form
  const [showForm, setShowForm] = useState(false);
  const { addOpportunity } = useOpportunities();
  const [form, setForm] = useState({ title: '', company: '', archetypeId: '', jdText: '' });
  const [submitting, setSubmitting] = useState(false);

  useScrollLock(showForm);

  const archetypeMap = useMemo(() => {
    const map: Record<string, string> = {};
    archetypes.forEach((a) => { map[a.id] = a.name; });
    return map;
  }, [archetypes]);

  const filteredOpportunities = useMemo(() => {
    let filtered = opportunities;

    // Status filter
    if (activeFilters.size > 0) {
      filtered = filtered.filter((opp) => activeFilters.has(opp.status));
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (opp) =>
          opp.title.toLowerCase().includes(q) ||
          opp.company.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'newest') {
      filtered = [...filtered].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [opportunities, activeFilters, searchQuery, sortBy]);

  const toggleFilter = (status: OpportunityStatus) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-text-secondary-dark text-sm mt-1">Loading...</p>
          </div>
        </div>
        <SkeletonGrid count={4} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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

      {/* Search + Sort bar */}
      {opportunities.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-dark" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role or company..."
              className="w-full bg-surface-card-dark border border-border-dark rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-accent transition-colors text-text-primary-dark"
            />
          </div>
          <button
            onClick={() => setSortBy(sortBy === 'newest' ? 'alphabetical' : 'newest')}
            className="flex items-center gap-2 px-4 py-2.5 border border-border-dark rounded-xl text-sm text-text-secondary-dark hover:bg-white/5 transition-colors cursor-pointer shrink-0"
          >
            <ArrowUpDown size={14} />
            {sortBy === 'newest' ? 'Newest first' : 'A-Z'}
          </button>
        </div>
      )}

      {/* Status filter pills */}
      {opportunities.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {allStatuses.map((status) => {
            const count = opportunities.filter((o) => o.status === status).length;
            if (count === 0) return null;
            const isActive = activeFilters.has(status);
            return (
              <button
                key={status}
                onClick={() => toggleFilter(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? statusColors[status]
                    : 'bg-white/5 text-text-secondary-dark hover:bg-white/10'
                }`}
              >
                {statusLabels[status]} ({count})
              </button>
            );
          })}
          {activeFilters.size > 0 && (
            <button
              onClick={() => setActiveFilters(new Set())}
              className="px-3 py-1.5 rounded-full text-xs text-text-secondary-dark hover:text-text-primary-dark transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* New Opportunity Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setShowForm(false)}
          >
            <div className="absolute inset-0 bg-black/60" />
            <motion.div
              className="relative bg-surface-card-dark border border-border-dark rounded-2xl p-6 w-full max-w-lg"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Opportunities Grid */}
      {opportunities.length === 0 ? (
        <div className="text-center py-16 text-text-secondary-dark">
          <FileText size={40} className="mx-auto mb-4 opacity-40" />
          <p className="text-base">No opportunities yet.</p>
          <p className="text-sm mt-1">Create your first opportunity to get started.</p>
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <div className="text-center py-16 text-text-secondary-dark">
          <Search size={32} className="mx-auto mb-4 opacity-40" />
          <p className="text-base">No matching opportunities.</p>
          <p className="text-sm mt-1">Try adjusting your filters or search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredOpportunities.map((opp) => (
              <motion.div
                key={opp.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
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
                        className="p-2.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-text-secondary-dark hover:text-red-400 transition-all cursor-pointer"
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
                    {opp.archetypeId && archetypeMap[opp.archetypeId] && (
                      <span className="text-xs text-text-secondary-dark bg-white/5 px-2 py-0.5 rounded">
                        {archetypeMap[opp.archetypeId]}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-text-secondary-dark">
                      Created {formatDistanceToNow(opp.createdAt, { addSuffix: true })}
                    </span>
                    {opp.updatedAt && opp.updatedAt.getTime() !== opp.createdAt.getTime() && (
                      <span className="text-xs text-text-secondary-dark/60">
                        Updated {formatDistanceToNow(opp.updatedAt, { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </motion.div>
  );
}
