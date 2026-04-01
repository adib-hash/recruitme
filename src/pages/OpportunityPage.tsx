import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Download, Loader, Upload, Trash2, FileText, Paperclip } from 'lucide-react';
import {
  useOpportunity,
  useOpportunities,
  useArchetype,
  useTailoredResumes,
  useChatHistory,
  useOutreachMessages,
  useResearchFiles,
  useInterviewerInfo,
  useInterviewPrep,
  useReferences,
} from '../hooks/useFirestore';
import StatusPipeline from '../components/opportunities/StatusPipeline';
import ResumePreview from '../components/resume/ResumePreview';
import ChatSidebar from '../components/chat/ChatSidebar';
import OutreachGenerator from '../components/outreach/OutreachGenerator';
import InterviewPrep from '../components/interview/InterviewPrep';
import ReferenceRecommendations from '../components/references/ReferenceRecommendations';
import Toast from '../components/layout/Toast';
import { generateTailoredResume, generateInterviewPrep } from '../lib/ai';
import { exportResumePDF } from '../lib/pdf';
import type { OpportunityStatus, ResumeContent } from '../types';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

type Tab = 'resume' | 'outreach' | 'research' | 'interview' | 'notes';

export default function OpportunityPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { opportunity, loading } = useOpportunity(id);
  const { updateOpportunity } = useOpportunities();
  const { archetype } = useArchetype(opportunity?.archetypeId);
  const { resumes, addTailoredResume, updateTailoredResume } = useTailoredResumes(id);
  const { messages: chatMessages, addMessage: addChatMessage } = useChatHistory(id);
  const { messages: outreachMessages, addMessages: addOutreachMessages } = useOutreachMessages(id);
  const { files: researchFiles, addFile: addResearchFile, deleteFile: deleteResearchFile } = useResearchFiles(id);
  const { interviewers, addInterviewer, updateInterviewer, deleteInterviewer } = useInterviewerInfo(id);
  const { prepResults, addPrepResult, deletePrepResult } = useInterviewPrep(id);
  const { references } = useReferences();

  const [activeTab, setActiveTab] = useState<Tab>('resume');
  const [generating, setGenerating] = useState(false);
  const [generatingPrep, setGeneratingPrep] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notes, setNotes] = useState('');
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showChat, setShowChat] = useState(false);

  // Load notes from opportunity
  if (opportunity && !notesLoaded) {
    setNotes(opportunity.notes || '');
    setNotesLoaded(true);
  }

  const currentResume = resumes[0] || null;

  const handleGenerate = async () => {
    if (!opportunity || !archetype) {
      setToast({ message: 'Select an archetype first', type: 'error' });
      return;
    }
    setGenerating(true);
    try {
      const tailored = await generateTailoredResume(archetype.contentJson, opportunity.jdText);
      const version = resumes.length + 1;
      await addTailoredResume(opportunity.id, tailored, version);
      setToast({ message: 'Resume generated', type: 'success' });
    } catch {
      setToast({ message: 'Generation failed', type: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!currentResume) return;
    setExporting(true);
    try {
      await exportResumePDF(currentResume.contentJson, archetype?.visualTemplate || 'classic');
      setToast({ message: 'PDF exported', type: 'success' });
    } catch {
      setToast({ message: 'Export failed', type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const handleStatusChange = async (status: OpportunityStatus) => {
    if (!id) return;
    try {
      await updateOpportunity(id, { status });
    } catch {
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  const handleSaveNotes = async () => {
    if (!id) return;
    try {
      await updateOpportunity(id, { notes });
      setToast({ message: 'Notes saved', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save notes', type: 'error' });
    }
  };

  const handleChatMessage = useCallback(
    (role: 'user' | 'assistant', content: string) => {
      if (!id) return;
      addChatMessage(id, role, content);
    },
    [id, addChatMessage]
  );

  const handleOutreachGenerate = useCallback(
    (audience: string, medium: string, bodies: string[]) => {
      if (!id) return;
      addOutreachMessages(id, audience, medium, bodies);
    },
    [id, addOutreachMessages]
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `research/${id}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await addResearchFile({
        opportunityId: id,
        fileUrl: url,
        fileType: file.type,
        fileName: file.name,
        caption: '',
      });
      setToast({ message: 'File uploaded', type: 'success' });
    } catch {
      setToast({ message: 'Upload failed', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleGeneratePrep = async () => {
    if (!opportunity || interviewers.length === 0) return;
    setGeneratingPrep(true);
    try {
      const primaryInterviewer = interviewers[0];
      const allNotes = interviewers.map((i) => `${i.name} (${i.role}): ${i.notes}`).join('\n\n');
      const result = await generateInterviewPrep(
        opportunity.jdText,
        opportunity.company,
        opportunity.title,
        primaryInterviewer.name,
        primaryInterviewer.role,
        allNotes
      );
      await addPrepResult({
        opportunityId: opportunity.id,
        ...result,
      });
      setToast({ message: 'Interview prep generated', type: 'success' });
    } catch {
      setToast({ message: 'Failed to generate prep', type: 'error' });
    } finally {
      setGeneratingPrep(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="text-center py-16 text-text-secondary-dark">
        Opportunity not found.
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'resume', label: 'Resume' },
    { key: 'outreach', label: 'Outreach' },
    { key: 'research', label: 'Research' },
    { key: 'interview', label: 'Interview Prep' },
    { key: 'notes', label: 'Notes' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold tracking-tight truncate">{opportunity.title}</h1>
          <p className="text-sm text-text-secondary-dark">{opportunity.company}</p>
        </div>
      </div>

      {/* Status Pipeline */}
      <div className="mb-6">
        <StatusPipeline current={opportunity.status} onChange={handleStatusChange} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === t.key
                ? 'bg-accent text-white'
                : 'text-text-secondary-dark hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {activeTab === 'resume' && (
            <div>
              {/* Actions */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover disabled:opacity-50 transition-colors text-sm font-medium cursor-pointer"
                >
                  {generating ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {currentResume ? 'Regenerate' : 'Generate Resume'}
                </button>
                {currentResume && (
                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex items-center gap-2 px-4 py-2.5 border border-border-dark rounded-xl hover:bg-white/5 transition-colors text-sm cursor-pointer"
                  >
                    {exporting ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
                    Export PDF
                  </button>
                )}
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-border-dark rounded-xl hover:bg-white/5 transition-colors text-sm cursor-pointer lg:hidden"
                >
                  Chat
                </button>
              </div>

              {/* Resume Preview */}
              {currentResume ? (
                <div className="overflow-auto rounded-xl border border-border-dark">
                  <ResumePreview
                    content={currentResume.contentJson}
                    template={archetype?.visualTemplate || 'classic'}
                  />
                </div>
              ) : (
                <div className="text-center py-16 text-text-secondary-dark border border-dashed border-border-dark rounded-xl">
                  <FileText size={40} className="mx-auto mb-4 opacity-40" />
                  <p className="text-base">No resume generated yet.</p>
                  <p className="text-sm mt-1">
                    {archetype
                      ? 'Click "Generate Resume" to create a tailored version.'
                      : 'Select an archetype first to generate a tailored resume.'}
                  </p>
                </div>
              )}

              {/* Job Description */}
              {opportunity.jdText && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-2 text-text-secondary-dark">Job Description</h3>
                  <div className="bg-surface-card-dark border border-border-dark rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {opportunity.jdText}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'outreach' && (
            <OutreachGenerator
              messages={outreachMessages}
              resumeContent={currentResume?.contentJson || null}
              jobDescription={opportunity.jdText}
              company={opportunity.company}
              role={opportunity.title}
              onGenerate={handleOutreachGenerate}
            />
          )}

          {activeTab === 'research' && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors text-sm font-medium cursor-pointer w-fit">
                  {uploading ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
                  {uploading ? 'Uploading...' : 'Upload File'}
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                </label>
              </div>

              {researchFiles.length === 0 ? (
                <div className="text-center py-12 text-text-secondary-dark border border-dashed border-border-dark rounded-xl">
                  <Paperclip size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No research files yet.</p>
                  <p className="text-xs mt-1">Upload screenshots, PDFs, or notes as context for AI.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {researchFiles.map((file) => (
                    <div
                      key={file.id}
                      className="bg-surface-card-dark border border-border-dark rounded-xl p-4 flex items-start gap-3 group"
                    >
                      {file.fileType.startsWith('image/') ? (
                        <img
                          src={file.fileUrl}
                          alt={file.fileName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center">
                          <FileText size={24} className="text-text-secondary-dark" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.fileName}</p>
                        <p className="text-xs text-text-secondary-dark">{file.fileType}</p>
                      </div>
                      <button
                        onClick={() => deleteResearchFile(file.id)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-text-secondary-dark hover:text-red-400 transition-all cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'interview' && (
            <div className="space-y-8">
              <InterviewPrep
                opportunityId={opportunity.id}
                company={opportunity.company}
                role={opportunity.title}
                jobDescription={opportunity.jdText}
                interviewers={interviewers}
                prepResults={prepResults}
                onAddInterviewer={addInterviewer}
                onUpdateInterviewer={updateInterviewer}
                onDeleteInterviewer={deleteInterviewer}
                onGeneratePrep={handleGeneratePrep}
                onDeletePrep={deletePrepResult}
                generating={generatingPrep}
                onToast={(message, type) => setToast({ message, type })}
              />

              <div className="border-t border-border-dark pt-6">
                <ReferenceRecommendations
                  references={references}
                  jobDescription={opportunity.jdText}
                  company={opportunity.company}
                  role={opportunity.title}
                />
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={12}
                placeholder="Your notes about this opportunity..."
                className="w-full bg-surface-card-dark border border-border-dark rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors resize-none text-text-primary-dark leading-relaxed"
              />
              <button
                onClick={handleSaveNotes}
                className="px-4 py-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors text-sm font-medium cursor-pointer"
              >
                Save Notes
              </button>
            </div>
          )}
        </div>

        {/* Chat Sidebar - Desktop */}
        {activeTab === 'resume' && (
          <div className={`w-80 shrink-0 border border-border-dark rounded-xl overflow-hidden h-[calc(100vh-200px)] hidden lg:block`}>
            <ChatSidebar
              messages={chatMessages}
              resumeContent={currentResume?.contentJson || null}
              onSendMessage={handleChatMessage}
            />
          </div>
        )}
      </div>

      {/* Chat Sidebar - Mobile Overlay */}
      {showChat && activeTab === 'resume' && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setShowChat(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-surface-dark border-t border-border-dark rounded-t-2xl h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1" />
            <ChatSidebar
              messages={chatMessages}
              resumeContent={currentResume?.contentJson || null}
              onSendMessage={handleChatMessage}
            />
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
