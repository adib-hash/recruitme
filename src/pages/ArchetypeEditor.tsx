import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Check, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { useArchetype, useArchetypes } from '../hooks/useFirestore';
import ResumePreview from '../components/resume/ResumePreview';
import Toast from '../components/layout/Toast';
import { Skeleton } from '../components/ui/Skeleton';
import type { ResumeContent } from '../types';

export default function ArchetypeEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { archetype, loading } = useArchetype(id);
  const { updateArchetype } = useArchetypes();
  const [content, setContent] = useState<ResumeContent | null>(null);
  const [template, setTemplate] = useState<'classic' | 'modern' | 'minimal'>('classic');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [dragState, setDragState] = useState<{ sectionId: string; bulletId: string } | null>(null);

  // Auto-save debounce
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef(content);
  const templateRef = useRef(template);
  contentRef.current = content;
  templateRef.current = template;

  useEffect(() => {
    if (archetype) {
      setContent(archetype.contentJson);
      setTemplate(archetype.visualTemplate);
    }
  }, [archetype]);

  const triggerAutoSave = useCallback(() => {
    setSaveStatus('unsaved');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!id || !contentRef.current) return;
      setSaveStatus('saving');
      try {
        await updateArchetype(id, { contentJson: contentRef.current, visualTemplate: templateRef.current });
        setSaveStatus('saved');
      } catch {
        setSaveStatus('unsaved');
      }
    }, 2000);
  }, [id, updateArchetype]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const updateContent = (newContent: ResumeContent) => {
    setContent(newContent);
    triggerAutoSave();
  };

  const updateHeader = (field: string, value: string) => {
    if (!content) return;
    updateContent({ ...content, header: { ...content.header, [field]: value } });
  };

  const updateSummary = (value: string) => {
    if (!content) return;
    updateContent({ ...content, summary: value });
  };

  const handleTemplateChange = (t: 'classic' | 'modern' | 'minimal') => {
    setTemplate(t);
    triggerAutoSave();
  };

  const addSection = () => {
    if (!content) return;
    updateContent({
      ...content,
      sections: [
        ...content.sections,
        { id: crypto.randomUUID(), title: 'New Section', items: [{ id: crypto.randomUUID(), text: '' }] },
      ],
    });
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    if (!content) return;
    updateContent({
      ...content,
      sections: content.sections.map((s) => (s.id === sectionId ? { ...s, title } : s)),
    });
  };

  const deleteSection = (sectionId: string) => {
    if (!content) return;
    updateContent({ ...content, sections: content.sections.filter((s) => s.id !== sectionId) });
  };

  const moveSectionUp = (index: number) => {
    if (!content || index === 0) return;
    const sections = [...content.sections];
    [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]];
    updateContent({ ...content, sections });
  };

  const moveSectionDown = (index: number) => {
    if (!content || index >= content.sections.length - 1) return;
    const sections = [...content.sections];
    [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
    updateContent({ ...content, sections });
  };

  const addBullet = (sectionId: string) => {
    if (!content) return;
    updateContent({
      ...content,
      sections: content.sections.map((s) =>
        s.id === sectionId ? { ...s, items: [...s.items, { id: crypto.randomUUID(), text: '' }] } : s
      ),
    });
  };

  const updateBullet = (sectionId: string, bulletId: string, text: string) => {
    if (!content) return;
    updateContent({
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
    updateContent({
      ...content,
      sections: content.sections.map((s) =>
        s.id === sectionId ? { ...s, items: s.items.filter((b) => b.id !== bulletId) } : s
      ),
    });
  };

  const moveBulletUp = (sectionId: string, bulletIndex: number) => {
    if (!content || bulletIndex === 0) return;
    updateContent({
      ...content,
      sections: content.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const items = [...s.items];
        [items[bulletIndex - 1], items[bulletIndex]] = [items[bulletIndex], items[bulletIndex - 1]];
        return { ...s, items };
      }),
    });
  };

  const moveBulletDown = (sectionId: string, bulletIndex: number) => {
    if (!content) return;
    const section = content.sections.find((s) => s.id === sectionId);
    if (!section || bulletIndex >= section.items.length - 1) return;
    updateContent({
      ...content,
      sections: content.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const items = [...s.items];
        [items[bulletIndex], items[bulletIndex + 1]] = [items[bulletIndex + 1], items[bulletIndex]];
        return { ...s, items };
      }),
    });
  };

  // Native HTML5 drag-and-drop for bullets
  const handleBulletDragStart = (sectionId: string, bulletId: string) => {
    setDragState({ sectionId, bulletId });
  };

  const handleBulletDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleBulletDrop = (targetSectionId: string, targetBulletId: string) => {
    if (!content || !dragState) return;
    if (dragState.sectionId === targetSectionId && dragState.bulletId === targetBulletId) {
      setDragState(null);
      return;
    }

    const section = content.sections.find((s) => s.id === targetSectionId);
    if (!section || dragState.sectionId !== targetSectionId) {
      setDragState(null);
      return;
    }

    const items = [...section.items];
    const fromIndex = items.findIndex((b) => b.id === dragState.bulletId);
    const toIndex = items.findIndex((b) => b.id === targetBulletId);
    if (fromIndex === -1 || toIndex === -1) {
      setDragState(null);
      return;
    }

    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);

    updateContent({
      ...content,
      sections: content.sections.map((s) =>
        s.id === targetSectionId ? { ...s, items } : s
      ),
    });
    setDragState(null);
  };

  // Manual save (Cmd+S / button)
  const handleManualSave = async () => {
    if (!id || !content) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus('saving');
    try {
      await updateArchetype(id, { contentJson: content, visualTemplate: template });
      setSaveStatus('saved');
      setToast({ message: 'Archetype saved', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save', type: 'error' });
      setSaveStatus('unsaved');
    }
  };

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div>
              <Skeleton className="h-6 w-40 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/archetypes')}
            className="p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{archetype.name}</h1>
            <p className="text-xs text-text-secondary-dark mt-0.5">
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-1">
                  <Loader size={10} className="animate-spin" />
                  Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1">
                  <Check size={10} className="text-green-400" />
                  Saved
                </span>
              )}
              {saveStatus === 'unsaved' && (
                <span className="text-yellow-400">Unsaved changes</span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={handleManualSave}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors text-sm font-medium cursor-pointer"
        >
          Save
        </button>
      </div>

      {/* Mobile tab toggle */}
      <div className="flex gap-2 mb-4 lg:hidden">
        <button
          onClick={() => setTab('edit')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            tab === 'edit' ? 'bg-accent text-white' : 'bg-white/5 text-text-secondary-dark'
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setTab('preview')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
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
                  onClick={() => handleTemplateChange(t)}
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
          {content.sections.map((section, sectionIndex) => (
            <div key={section.id} className="bg-surface-card-dark border border-border-dark rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                  className="bg-transparent text-sm font-semibold outline-none border-b border-transparent focus:border-accent transition-colors text-text-primary-dark"
                />
                <div className="flex items-center gap-1">
                  {/* Section reorder buttons */}
                  <button
                    onClick={() => moveSectionUp(sectionIndex)}
                    disabled={sectionIndex === 0}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary-dark disabled:opacity-20 transition-all cursor-pointer"
                    title="Move section up"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => moveSectionDown(sectionIndex)}
                    disabled={sectionIndex >= content.sections.length - 1}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary-dark disabled:opacity-20 transition-all cursor-pointer"
                    title="Move section down"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    onClick={() => deleteSection(section.id)}
                    className="p-2.5 rounded-lg hover:bg-red-500/10 text-text-secondary-dark hover:text-red-400 transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {section.items.map((bullet, bulletIndex) => (
                  <div
                    key={bullet.id}
                    className="flex items-start gap-2"
                    draggable
                    onDragStart={() => handleBulletDragStart(section.id, bullet.id)}
                    onDragOver={handleBulletDragOver}
                    onDrop={() => handleBulletDrop(section.id, bullet.id)}
                  >
                    {/* Drag handle — hidden on mobile, arrow buttons shown instead */}
                    <GripVertical size={14} className="mt-2.5 text-text-secondary-dark/40 shrink-0 cursor-grab hidden lg:block" />
                    {/* Mobile: arrow buttons */}
                    <div className="flex flex-col gap-0.5 lg:hidden shrink-0 mt-1">
                      <button
                        onClick={() => moveBulletUp(section.id, bulletIndex)}
                        disabled={bulletIndex === 0}
                        className="p-0.5 rounded text-text-secondary-dark/40 disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        onClick={() => moveBulletDown(section.id, bulletIndex)}
                        disabled={bulletIndex >= section.items.length - 1}
                        className="p-0.5 rounded text-text-secondary-dark/40 disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronDown size={12} />
                      </button>
                    </div>
                    <textarea
                      value={bullet.text}
                      onChange={(e) => updateBullet(section.id, bullet.id, e.target.value)}
                      rows={2}
                      placeholder="Bullet point..."
                      className="flex-1 bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition-colors resize-none text-text-primary-dark"
                    />
                    <button
                      onClick={() => deleteBullet(section.id, bullet.id)}
                      className="p-2.5 mt-0.5 rounded-lg hover:bg-red-500/10 text-text-secondary-dark hover:text-red-400 transition-all cursor-pointer shrink-0"
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
    </motion.div>
  );
}
