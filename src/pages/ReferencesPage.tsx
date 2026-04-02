import { useState } from 'react';
import {
  Plus,
  Trash2,
  Users,
  Building2,
  Briefcase,
  Mail,
  Phone,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useReferences } from '../hooks/useFirestore';
import Toast from '../components/layout/Toast';
import { SkeletonGrid } from '../components/ui/Skeleton';

export default function ReferencesPage() {
  const { references, loading, addReference, updateReference, deleteReference } = useReferences();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [relationship, setRelationship] = useState('');
  const [projects, setProjects] = useState('');
  const [notes, setNotes] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const resetForm = () => {
    setName('');
    setRole('');
    setCompany('');
    setRelationship('');
    setProjects('');
    setNotes('');
    setEmail('');
    setPhone('');
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setToast({ message: 'Name is required', type: 'error' });
      return;
    }
    try {
      if (editingId) {
        await updateReference(editingId, {
          name: name.trim(),
          role: role.trim(),
          company: company.trim(),
          relationship: relationship.trim(),
          projects: projects.trim(),
          notes: notes.trim(),
          email: email.trim(),
          phone: phone.trim(),
        });
        setToast({ message: 'Reference updated', type: 'success' });
      } else {
        await addReference({
          name: name.trim(),
          role: role.trim(),
          company: company.trim(),
          relationship: relationship.trim(),
          projects: projects.trim(),
          notes: notes.trim(),
          email: email.trim(),
          phone: phone.trim(),
        });
        setToast({ message: 'Reference added', type: 'success' });
      }
      resetForm();
    } catch {
      setToast({ message: 'Failed to save reference', type: 'error' });
    }
  };

  const handleEdit = (ref: typeof references[0]) => {
    setEditingId(ref.id);
    setName(ref.name);
    setRole(ref.role);
    setCompany(ref.company);
    setRelationship(ref.relationship);
    setProjects(ref.projects);
    setNotes(ref.notes);
    setEmail(ref.email);
    setPhone(ref.phone);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReference(id);
      setToast({ message: 'Reference removed', type: 'success' });
    } catch {
      setToast({ message: 'Failed to delete', type: 'error' });
    }
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">References</h1>
            <p className="text-sm text-text-secondary-dark mt-0.5">Loading...</p>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">References</h1>
          <p className="text-sm text-text-secondary-dark mt-0.5">
            Manage your professional references. The app recommends the best fit for each opportunity.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors text-sm font-medium cursor-pointer"
        >
          <Plus size={16} />
          Add Reference
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-surface-card-dark border border-border-dark rounded-xl p-5 mb-6 space-y-4">
          <h3 className="text-sm font-semibold">
            {editingId ? 'Edit Reference' : 'New Reference'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name *"
              className="bg-transparent border border-border-dark rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors text-text-primary-dark"
            />
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Their role (e.g., VP of Product)"
              className="bg-transparent border border-border-dark rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors text-text-primary-dark"
            />
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company"
              className="bg-transparent border border-border-dark rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors text-text-primary-dark"
            />
            <input
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="Relationship (e.g., Direct manager, Peer)"
              className="bg-transparent border border-border-dark rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors text-text-primary-dark"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="bg-transparent border border-border-dark rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors text-text-primary-dark"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className="bg-transparent border border-border-dark rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors text-text-primary-dark"
            />
          </div>
          <textarea
            value={projects}
            onChange={(e) => setProjects(e.target.value)}
            rows={2}
            placeholder="Key projects you worked on together..."
            className="w-full bg-transparent border border-border-dark rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors resize-none text-text-primary-dark leading-relaxed"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Additional context — what they know you best for, strengths they'd highlight..."
            className="w-full bg-transparent border border-border-dark rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors resize-none text-text-primary-dark leading-relaxed"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors text-sm font-medium cursor-pointer"
            >
              {editingId ? 'Save Changes' : 'Add Reference'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2.5 text-text-secondary-dark hover:bg-white/5 rounded-xl transition-colors text-sm cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reference Cards */}
      {references.length === 0 && !showForm ? (
        <div className="text-center py-16 text-text-secondary-dark border border-dashed border-border-dark rounded-xl">
          <Users size={40} className="mx-auto mb-4 opacity-40" />
          <p className="text-base">No references yet.</p>
          <p className="text-sm mt-1">Add your professional references to get role-specific recommendations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {references.map((ref) => (
            <div
              key={ref.id}
              className="bg-surface-card-dark border border-border-dark rounded-xl p-5 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold">{ref.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {ref.role && (
                      <span className="flex items-center gap-1 text-xs text-text-secondary-dark">
                        <Briefcase size={11} />
                        {ref.role}
                      </span>
                    )}
                    {ref.company && (
                      <span className="flex items-center gap-1 text-xs text-text-secondary-dark">
                        <Building2 size={11} />
                        {ref.company}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(ref)}
                    className="px-2 py-1 rounded-lg hover:bg-white/10 text-text-secondary-dark text-xs cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ref.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-secondary-dark hover:text-red-400 transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {ref.relationship && (
                <p className="text-xs text-accent bg-accent/10 px-2 py-1 rounded w-fit mb-2">
                  {ref.relationship}
                </p>
              )}

              {ref.projects && (
                <p className="text-sm text-text-secondary-dark leading-relaxed mb-2">
                  <span className="font-medium text-text-primary-dark">Projects:</span> {ref.projects}
                </p>
              )}

              {ref.notes && (
                <p className="text-sm text-text-secondary-dark leading-relaxed line-clamp-2">
                  {ref.notes}
                </p>
              )}

              {(ref.email || ref.phone) && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border-dark">
                  {ref.email && (
                    <span className="flex items-center gap-1 text-xs text-text-secondary-dark">
                      <Mail size={11} />
                      {ref.email}
                    </span>
                  )}
                  {ref.phone && (
                    <span className="flex items-center gap-1 text-xs text-text-secondary-dark">
                      <Phone size={11} />
                      {ref.phone}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </motion.div>
  );
}
