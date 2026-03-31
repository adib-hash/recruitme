import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Trash2, Loader } from 'lucide-react';
import { useArchetypes } from '../hooks/useFirestore';
import Toast from '../components/layout/Toast';

export default function ArchetypesPage() {
  const { archetypes, loading, addArchetype, deleteArchetype } = useArchetypes();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await addArchetype({
        name: name.trim(),
        contentJson: {
          header: { name: 'Your Name', title: '', email: '', phone: '', location: '' },
          summary: '',
          sections: [
            {
              id: crypto.randomUUID(),
              title: 'Experience',
              items: [{ id: crypto.randomUUID(), text: '' }],
            },
            {
              id: crypto.randomUUID(),
              title: 'Education',
              items: [{ id: crypto.randomUUID(), text: '' }],
            },
          ],
        },
        visualTemplate: 'classic',
      });
      setName('');
      setShowForm(false);
      setToast({ message: 'Archetype created', type: 'success' });
    } catch {
      setToast({ message: 'Failed to create archetype', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteArchetype(id);
      setToast({ message: 'Archetype deleted', type: 'success' });
    } catch {
      setToast({ message: 'Failed to delete archetype', type: 'error' });
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
          <h1 className="text-2xl font-semibold tracking-tight">Resume Archetypes</h1>
          <p className="text-text-secondary-dark text-sm mt-1">
            Base resume templates for different role categories
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors text-sm font-medium cursor-pointer"
        >
          <Plus size={16} />
          New Archetype
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-surface-card-dark border border-border-dark rounded-xl p-5 mb-6">
          <form onSubmit={handleCreate} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1.5">Archetype Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. M&A / Corporate Development"
                className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors text-text-primary-dark"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setName(''); }}
              className="px-5 py-2.5 border border-border-dark rounded-xl text-sm hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Archetypes List */}
      {archetypes.length === 0 ? (
        <div className="text-center py-16 text-text-secondary-dark">
          <FileText size={40} className="mx-auto mb-4 opacity-40" />
          <p className="text-base">No archetypes yet.</p>
          <p className="text-sm mt-1">Create your first resume archetype to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {archetypes.map((arch) => (
            <div
              key={arch.id}
              className="bg-surface-card-dark border border-border-dark rounded-xl p-5 hover:border-accent/30 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold">{arch.name}</h3>
                <button
                  onClick={() => handleDelete(arch.id)}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-text-secondary-dark hover:text-red-400 transition-all cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-sm text-text-secondary-dark mb-1">
                {arch.contentJson.sections.length} sections
              </p>
              <p className="text-xs text-text-secondary-dark/60">
                Template: {arch.visualTemplate}
              </p>
              <p className="text-xs text-text-secondary-dark/60 mt-1">
                Updated {arch.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <Link
                to={`/archetypes/${arch.id}`}
                className="mt-4 block text-center px-4 py-2 bg-white/5 rounded-xl text-sm text-accent hover:bg-white/10 transition-colors no-underline"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
