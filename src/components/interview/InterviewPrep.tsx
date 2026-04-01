import { useState } from 'react';
import {
  UserCircle,
  Plus,
  Sparkles,
  Loader,
  Trash2,
  Upload,
  ChevronDown,
  ChevronUp,
  Target,
  HelpCircle,
  Briefcase,
  Lightbulb,
  X,
  FileText,
} from 'lucide-react';
import type { InterviewerInfo, InterviewPrepResult } from '../../types';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';

interface InterviewPrepProps {
  opportunityId: string;
  company: string;
  role: string;
  jobDescription: string;
  interviewers: InterviewerInfo[];
  prepResults: InterviewPrepResult[];
  onAddInterviewer: (data: Omit<InterviewerInfo, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  onUpdateInterviewer: (id: string, data: Partial<InterviewerInfo>) => Promise<void>;
  onDeleteInterviewer: (id: string) => Promise<void>;
  onGeneratePrep: () => Promise<void>;
  onDeletePrep: (id: string) => Promise<void>;
  generating: boolean;
  onToast: (message: string, type: 'success' | 'error') => void;
}

export default function InterviewPrep({
  opportunityId,
  company,
  role,
  interviewers,
  prepResults,
  onAddInterviewer,
  onUpdateInterviewer,
  onDeleteInterviewer,
  onGeneratePrep,
  onDeletePrep,
  generating,
  onToast,
}: InterviewPrepProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [interviewerRole, setInterviewerRole] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<{ url: string; name: string }[]>([]);
  const [expandedPrep, setExpandedPrep] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `interview/${opportunityId}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPendingFiles((prev) => [...prev, { url, name: file.name }]);
      onToast('File uploaded', 'success');
    } catch {
      onToast('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleAddInterviewer = async () => {
    if (!name.trim()) {
      onToast('Interviewer name is required', 'error');
      return;
    }
    try {
      await onAddInterviewer({
        opportunityId,
        name: name.trim(),
        role: interviewerRole.trim(),
        notes: notes.trim(),
        fileUrls: pendingFiles.map((f) => f.url),
        fileNames: pendingFiles.map((f) => f.name),
      });
      setName('');
      setInterviewerRole('');
      setNotes('');
      setPendingFiles([]);
      setShowAddForm(false);
      onToast('Interviewer added', 'success');
    } catch {
      onToast('Failed to add interviewer', 'error');
    }
  };

  const handleStartEdit = (interviewer: InterviewerInfo) => {
    setEditingId(interviewer.id);
    setEditName(interviewer.name);
    setEditRole(interviewer.role);
    setEditNotes(interviewer.notes);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await onUpdateInterviewer(id, {
        name: editName.trim(),
        role: editRole.trim(),
        notes: editNotes.trim(),
      });
      setEditingId(null);
      onToast('Interviewer updated', 'success');
    } catch {
      onToast('Failed to update', 'error');
    }
  };

  const latestPrep = prepResults[0] || null;

  // Auto-expand the latest prep result
  if (latestPrep && expandedPrep === null) {
    setExpandedPrep(latestPrep.id);
  }

  return (
    <div className="space-y-6">
      {/* Interviewers Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-secondary-dark flex items-center gap-2">
            <UserCircle size={16} />
            Interviewers
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/10 rounded-lg transition-colors cursor-pointer"
          >
            <Plus size={14} />
            Add
          </button>
        </div>

        {/* Add Interviewer Form */}
        {showAddForm && (
          <div className="bg-surface-card-dark border border-border-dark rounded-xl p-4 mb-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Interviewer name"
                className="bg-transparent border border-border-dark rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition-colors text-text-primary-dark"
              />
              <input
                type="text"
                value={interviewerRole}
                onChange={(e) => setInterviewerRole(e.target.value)}
                placeholder="Their role (e.g., VP of Engineering)"
                className="bg-transparent border border-border-dark rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition-colors text-text-primary-dark"
              />
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Paste any info about this interviewer — LinkedIn summary, recent posts, background notes, mutual connections, anything that might be useful..."
              className="w-full bg-transparent border border-border-dark rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition-colors resize-none text-text-primary-dark leading-relaxed"
            />

            {/* File uploads */}
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border-dark rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                {uploading ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? 'Uploading...' : 'Attach file'}
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
              </label>
              {pendingFiles.map((f, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white/5 rounded-lg text-text-secondary-dark"
                >
                  <FileText size={12} />
                  {f.name}
                  <button
                    onClick={() => setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="hover:text-red-400 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddInterviewer}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium cursor-pointer"
              >
                Save Interviewer
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setName('');
                  setInterviewerRole('');
                  setNotes('');
                  setPendingFiles([]);
                }}
                className="px-4 py-2 text-text-secondary-dark hover:bg-white/5 rounded-lg transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Interviewer Cards */}
        {interviewers.length === 0 && !showAddForm ? (
          <div className="text-center py-10 text-text-secondary-dark border border-dashed border-border-dark rounded-xl">
            <UserCircle size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No interviewers added yet.</p>
            <p className="text-xs mt-1">Add interviewer details to get personalized prep advice.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {interviewers.map((interviewer) => (
              <div
                key={interviewer.id}
                className="bg-surface-card-dark border border-border-dark rounded-xl p-4 group"
              >
                {editingId === interviewer.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-transparent border border-border-dark rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition-colors text-text-primary-dark"
                      />
                      <input
                        type="text"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="bg-transparent border border-border-dark rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition-colors text-text-primary-dark"
                      />
                    </div>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={3}
                      className="w-full bg-transparent border border-border-dark rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition-colors resize-none text-text-primary-dark leading-relaxed"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(interviewer.id)}
                        className="px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-text-secondary-dark hover:bg-white/5 rounded-lg text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                      <UserCircle size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{interviewer.name}</p>
                        {interviewer.role && (
                          <span className="text-xs text-text-secondary-dark bg-white/5 px-2 py-0.5 rounded">
                            {interviewer.role}
                          </span>
                        )}
                      </div>
                      {interviewer.notes && (
                        <p className="text-xs text-text-secondary-dark mt-1 line-clamp-2 leading-relaxed">
                          {interviewer.notes}
                        </p>
                      )}
                      {interviewer.fileNames.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {interviewer.fileNames.map((fname, i) => (
                            <a
                              key={i}
                              href={interviewer.fileUrls[i]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-2 py-0.5 text-xs bg-white/5 rounded text-accent hover:bg-accent/10 transition-colors"
                            >
                              <FileText size={10} />
                              {fname}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleStartEdit(interviewer)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary-dark cursor-pointer text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteInterviewer(interviewer.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-secondary-dark hover:text-red-400 transition-all cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Prep Button */}
      <button
        onClick={onGeneratePrep}
        disabled={generating || interviewers.length === 0}
        className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover disabled:opacity-50 transition-colors text-sm font-medium cursor-pointer w-fit"
      >
        {generating ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
        {latestPrep ? 'Regenerate Prep' : 'Generate Interview Prep'}
      </button>
      {interviewers.length === 0 && (
        <p className="text-xs text-text-secondary-dark -mt-4">Add at least one interviewer to generate prep advice.</p>
      )}

      {/* Prep Results */}
      {prepResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-secondary-dark flex items-center gap-2">
            <Lightbulb size={16} />
            Prep Advice
          </h3>

          {prepResults.map((prep) => {
            const isExpanded = expandedPrep === prep.id;
            return (
              <div
                key={prep.id}
                className="bg-surface-card-dark border border-border-dark rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedPrep(isExpanded ? null : prep.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-medium">
                    Prep — {prep.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePrep(prep.id);
                      }}
                      className="p-1 rounded hover:bg-red-500/10 text-text-secondary-dark hover:text-red-400 transition-all cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-5">
                    {/* Areas to Focus */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-accent flex items-center gap-1.5 mb-2">
                        <Target size={14} />
                        Areas to Focus
                      </h4>
                      <ul className="space-y-2">
                        {prep.areasToFocus.map((area, i) => (
                          <li key={i} className="text-sm leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-accent/60">
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Questions to Ask */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-green-400 flex items-center gap-1.5 mb-2">
                        <HelpCircle size={14} />
                        Questions to Ask
                      </h4>
                      <ul className="space-y-2">
                        {prep.questionsToAsk.map((q, i) => (
                          <li key={i} className="text-sm leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-green-400/60">
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Experience to Emphasize */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                        <Briefcase size={14} />
                        Experience to Emphasize
                      </h4>
                      <ul className="space-y-2">
                        {prep.experienceToEmphasize.map((exp, i) => (
                          <li key={i} className="text-sm leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-amber-400/60">
                            {exp}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Additional Advice */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-2">
                        <Lightbulb size={14} />
                        Additional Advice
                      </h4>
                      <p className="text-sm leading-relaxed text-text-secondary-dark">
                        {prep.additionalAdvice}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
