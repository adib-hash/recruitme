import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, GripVertical, Loader, Save } from 'lucide-react';
import { useArchetype, useArchetypes } from '../hooks/useFirestore';
import ResumePreview from '../components/resume/ResumePreview';
import Toast from '../components/layout/Toast';
import type { ResumeContent, ResumeSection, ResumeBullet } from '../types';

export default function ArchetypeEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { archetype, loading } = useArchetype(id);
  const { updateArchetype } = useArchetypes();
  const [content, setContent] = useState<ResumeContent | null>(null);
  const [template, setTemplate] = useState<'classic' | 'modern' | 'minimal'>('classic');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (archetype) {
      setContent(archetype.contentJson);
      setTemplate(archetype.visualTemplate);
    }
  }, [archetype]);

  const handleSave = async () => {
    if (!id || !content) return;
    setSaving(true);
    try {
      await updateArchetype(id, { contentJson: content, visualTemplate: template });
      setToast({ message: 'Archetype saved', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const updateHeader = (field: string, value: string) => {
    if (!content) return;
    setContent({ ...content, header: { ...content.header, [field]: value } });
  };

  const updateSummary = (value: string) => {
    if (!content) return;
    setContent({ ...content, summary: value });
  };

  const addSection = () => {
    if (!content) return;
    setContent({
      ...content,
      sections: [
        ...content.sections,
        { id: crypto.randomUUID(), title: 'New Section', items: [{ id: crypto.randomUUID(), text: '' }] },
      ],
    });
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    if (!content) return;
    setContent({
      ...content,
      sections: content.sections.map((s) => (s.id === sectionId ? { ...s, title } : s)),
    });
  };

  const deleteSection = (sectionId: string) => {
    if (!content) return;
    setContent({ ...content, sections: content.sections.filter((s) => s.id !== sectionId) });
  };

  const addBullet = (sectionId: string) => {
    if (!content) return;
    setContent({
      ...content,
      sections: content.sections.map((s) =>
        s.id === sectionId ? { ...s, items: [...s.items, { id: crypto.randomUUID(), text: '' }] } : s
      ),
    });
  };

  const updateBullet = (sectionId: string, bulletId: string, text: string) => {
    if (!content) return;
    setContent({
      ...content,
      sections: content.sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.map((b) => (b.id === bulletId ? { ...b, text } : b)) }
          : s
      ),
    });
  };

  const deleteBullet = (sectionId: string, bulletId: string) => {
    if (!content) return;
    setContent({
      ...content,
      sections: content.sections.map((s) =>
        s.id === sectionId ? { ...s, items: s.items.filter((b) => b.id !== bulletId) } : s
      ),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  if (!archetype || !content) {
    return (
      <div className="text-center py-16 text-text-secondary-dark">
        Archetype not found.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/archetypes')}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{archetype.name}</h1>
            <p className="text-xs text-text-secondary-dark mt-0.5">Editing archetype</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover disabled:opacity-50 transition-colors text-sm font-medium cursor-pointer"
        >
          {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
          Save
        </button>
      </div>

      {/* Mobile tab toggle */}
      <div className="flex gap-2 mb-4 lg:hidden">
        <button
          onClick={() => setTab('edit')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            tab === 'edit' ? 'bg-accent text-white' : 'bg-white/5 text-text-secondary-dark'
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setTab('preview')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            tab === 'preview' ? 'bg-accent text-white' : 'bg-white/5 text-text-secondary-dark'
          }`}
        >
          Preview
        </button>
      </div>

      <div className="flex gap-6">
        {/* Editor */}
        <div className={`flex-1 space-y-5 ${tab === 'preview' ? 'hidden lg:block' : ''}`}>
          {/* Template selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Visual Template</label>
            <div className="flex gap-2">
              {(['classic', 'modern', 'minimal'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm capitalize border transition-colors cursor-pointer ${
                    template === t
                      ? 'bg-accent text-white border-accent'
                      : 'bg-transparent text-text-secondary-dark border-border-dark hover:border-accent/40'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Header fields */}
          <div className="bg-surface-card-dark border border-border-dark rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold">Header</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['name', 'title', 'email', 'phone', 'location', 'linkedin'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-xs text-text-secondary-dark mb-1 capitalize">{field}</label>
                  <input
                    type="text"
                    value={content.header[field] || ''}
                    onChange={(e) => updateHeader(field, e.target.value)}
                    className="w-full bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition-colors text-text-primary-dark"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-surface-card-dark border border-border-dark rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2">Summary</h3>
            <textarea
              value={content.summary || ''}
              onChange={(e) => updateSummary(e.target.value)}
              rows={3}
              placeholder="Professional summary..."
              className="w-full bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition-colors resize-none text-text-primary-dark"
            />
          </div>

          {/* Sections */}
          {content.sections.map((section) => (
            <div key={section.id} className="bg-surface-card-dark border border-border-dark rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                  className="bg-transparent text-sm font-semibold outline-none border-b border-transparent focus:border-accent transition-colors text-text-primary-dark"
                />
                <button
                  onClick={() => deleteSection(section.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-secondary-dark hover:text-red-400 transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="space-y-2">
                {section.items.map((bullet) => (
                  <div key={bullet.id} className="flex items-start gap-2">
                    <GripVertical size={14} className="mt-2.5 text-text-secondary-dark/40 shrink-0" />
                    <textarea
                      value={bullet.text}
                      onChange={(e) => updateBullet(section.id, bullet.id, e.target.value)}
                      rows={2}
                      placeholder="Bullet point..."
                      className="flex-1 bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition-colors resize-none text-text-primary-dark"
                    />
                    <button
                      onClick={() => deleteBullet(section.id, bullet.id)}
                      className="p-1.5 mt-1 rounded-lg hover:bg-red-500/10 text-text-secondary-dark hover:text-red-400 transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addBullet(section.id)}
                  className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors cursor-pointer mt-1"
                >
                  <Plus size={12} />
                  Add bullet
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addSection}
            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border-dark rounded-xl text-sm text-text-secondary-dark hover:border-accent/40 hover:text-accent transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Add Section
          </button>
        </div>

        {/* Preview */}
        <div className={`flex-1 ${tab === 'edit' ? 'hidden lg:block' : ''}`}>
          <div className="sticky top-8">
            <h3 className="text-sm font-semibold mb-3 text-text-secondary-dark">Live Preview</h3>
            <div className="overflow-auto max-h-[80vh] rounded-xl border border-border-dark">
              <ResumePreview content={content} template={template} />
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
