import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type {
  Archetype,
  Opportunity,
  TailoredResume,
  OutreachMessage,
  ChatMessage,
  ResearchFile,
  ResumeContent,
  InterviewerInfo,
  InterviewPrepResult,
} from '../types';

function toDate(val: unknown): Date {
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  return new Date();
}

function parseArchetype(id: string, data: DocumentData): Archetype {
  return {
    id,
    name: data.name || '',
    contentJson: data.contentJson || { header: { name: '', title: '', email: '', phone: '', location: '' }, sections: [] },
    visualTemplate: data.visualTemplate || 'classic',
    updatedAt: toDate(data.updatedAt),
  };
}

function parseOpportunity(id: string, data: DocumentData): Opportunity {
  return {
    id,
    title: data.title || '',
    company: data.company || '',
    archetypeId: data.archetypeId || '',
    jdText: data.jdText || '',
    status: data.status || 'discovered',
    notes: data.notes || '',
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

// Archetypes
export function useArchetypes() {
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'archetypes'), orderBy('updatedAt', 'desc')),
      (snap) => {
        setArchetypes(snap.docs.map((d) => parseArchetype(d.id, d.data())));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const addArchetype = useCallback(async (data: Omit<Archetype, 'id' | 'updatedAt'>) => {
    const ref = await addDoc(collection(db, 'archetypes'), {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return ref.id;
  }, []);

  const updateArchetype = useCallback(async (id: string, data: Partial<Archetype>) => {
    const { id: _, ...rest } = data as Record<string, unknown>;
    await updateDoc(doc(db, 'archetypes', id), { ...rest, updatedAt: Timestamp.now() });
  }, []);

  const deleteArchetype = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'archetypes', id));
  }, []);

  return { archetypes, loading, error, addArchetype, updateArchetype, deleteArchetype };
}

// Single Archetype
export function useArchetype(id: string | undefined) {
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const unsub = onSnapshot(doc(db, 'archetypes', id), (snap) => {
      if (snap.exists()) {
        setArchetype(parseArchetype(snap.id, snap.data()));
      }
      setLoading(false);
    });
    return unsub;
  }, [id]);

  return { archetype, loading };
}

// Opportunities
export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'opportunities'), orderBy('createdAt', 'desc')),
      (snap) => {
        setOpportunities(snap.docs.map((d) => parseOpportunity(d.id, d.data())));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const addOpportunity = useCallback(async (data: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>) => {
    const ref = await addDoc(collection(db, 'opportunities'), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return ref.id;
  }, []);

  const updateOpportunity = useCallback(async (id: string, data: Partial<Opportunity>) => {
    const { id: _, ...rest } = data as Record<string, unknown>;
    await updateDoc(doc(db, 'opportunities', id), { ...rest, updatedAt: Timestamp.now() });
  }, []);

  const deleteOpportunity = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'opportunities', id));
  }, []);

  return { opportunities, loading, error, addOpportunity, updateOpportunity, deleteOpportunity };
}

// Single Opportunity
export function useOpportunity(id: string | undefined) {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const unsub = onSnapshot(doc(db, 'opportunities', id), (snap) => {
      if (snap.exists()) {
        setOpportunity(parseOpportunity(snap.id, snap.data()));
      }
      setLoading(false);
    });
    return unsub;
  }, [id]);

  return { opportunity, loading };
}

// Tailored Resumes
export function useTailoredResumes(opportunityId: string | undefined) {
  const [resumes, setResumes] = useState<TailoredResume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!opportunityId) { setLoading(false); return; }
    const unsub = onSnapshot(
      query(
        collection(db, 'tailoredResumes'),
        where('opportunityId', '==', opportunityId),
        orderBy('version', 'desc')
      ),
      (snap) => {
        setResumes(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              opportunityId: data.opportunityId,
              contentJson: data.contentJson,
              version: data.version || 1,
              createdAt: toDate(data.createdAt),
            };
          })
        );
        setLoading(false);
      }
    );
    return unsub;
  }, [opportunityId]);

  const addTailoredResume = useCallback(
    async (opportunityId: string, contentJson: ResumeContent, version: number) => {
      const ref = await addDoc(collection(db, 'tailoredResumes'), {
        opportunityId,
        contentJson,
        version,
        createdAt: Timestamp.now(),
      });
      return ref.id;
    },
    []
  );

  const updateTailoredResume = useCallback(async (id: string, contentJson: ResumeContent) => {
    await updateDoc(doc(db, 'tailoredResumes', id), { contentJson });
  }, []);

  return { resumes, loading, addTailoredResume, updateTailoredResume };
}

// Chat History
export function useChatHistory(opportunityId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!opportunityId) { setLoading(false); return; }
    const unsub = onSnapshot(
      query(
        collection(db, 'chatHistory'),
        where('opportunityId', '==', opportunityId),
        orderBy('createdAt', 'asc')
      ),
      (snap) => {
        setMessages(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              opportunityId: data.opportunityId,
              role: data.role,
              content: data.content,
              createdAt: toDate(data.createdAt),
            };
          })
        );
        setLoading(false);
      }
    );
    return unsub;
  }, [opportunityId]);

  const addMessage = useCallback(async (opportunityId: string, role: 'user' | 'assistant', content: string) => {
    await addDoc(collection(db, 'chatHistory'), {
      opportunityId,
      role,
      content,
      createdAt: Timestamp.now(),
    });
  }, []);

  return { messages, loading, addMessage };
}

// Outreach Messages
export function useOutreachMessages(opportunityId: string | undefined) {
  const [messages, setMessages] = useState<OutreachMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!opportunityId) { setLoading(false); return; }
    const unsub = onSnapshot(
      query(
        collection(db, 'outreachMessages'),
        where('opportunityId', '==', opportunityId),
        orderBy('createdAt', 'desc')
      ),
      (snap) => {
        setMessages(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              opportunityId: data.opportunityId,
              audience: data.audience,
              medium: data.medium,
              body: data.body,
              variantNumber: data.variantNumber || 1,
              createdAt: toDate(data.createdAt),
            };
          })
        );
        setLoading(false);
      }
    );
    return unsub;
  }, [opportunityId]);

  const addMessages = useCallback(
    async (opportunityId: string, audience: string, medium: string, bodies: string[]) => {
      for (let i = 0; i < bodies.length; i++) {
        await addDoc(collection(db, 'outreachMessages'), {
          opportunityId,
          audience,
          medium,
          body: bodies[i],
          variantNumber: i + 1,
          createdAt: Timestamp.now(),
        });
      }
    },
    []
  );

  return { messages, loading, addMessages };
}

// Research Files
export function useResearchFiles(opportunityId: string | undefined) {
  const [files, setFiles] = useState<ResearchFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!opportunityId) { setLoading(false); return; }
    const q = query(
      collection(db, 'researchFiles'),
      where('opportunityId', '==', opportunityId)
    );
    getDocs(q).then((snap) => {
      setFiles(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            opportunityId: data.opportunityId,
            fileUrl: data.fileUrl,
            fileType: data.fileType,
            fileName: data.fileName,
            caption: data.caption || '',
            createdAt: toDate(data.createdAt),
          };
        })
      );
      setLoading(false);
    });
  }, [opportunityId]);

  const addFile = useCallback(
    async (data: Omit<ResearchFile, 'id' | 'createdAt'>) => {
      const ref = await addDoc(collection(db, 'researchFiles'), {
        ...data,
        createdAt: Timestamp.now(),
      });
      return ref.id;
    },
    []
  );

  const deleteFile = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'researchFiles', id));
  }, []);

  return { files, loading, addFile, deleteFile };
}

// Interviewer Info
export function useInterviewerInfo(opportunityId: string | undefined) {
  const [interviewers, setInterviewers] = useState<InterviewerInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!opportunityId) { setLoading(false); return; }
    const unsub = onSnapshot(
      query(
        collection(db, 'interviewerInfo'),
        where('opportunityId', '==', opportunityId),
        orderBy('createdAt', 'desc')
      ),
      (snap) => {
        setInterviewers(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              opportunityId: data.opportunityId,
              name: data.name || '',
              role: data.role || '',
              notes: data.notes || '',
              fileUrls: data.fileUrls || [],
              fileNames: data.fileNames || [],
              createdAt: toDate(data.createdAt),
              updatedAt: toDate(data.updatedAt),
            };
          })
        );
        setLoading(false);
      }
    );
    return unsub;
  }, [opportunityId]);

  const addInterviewer = useCallback(
    async (data: Omit<InterviewerInfo, 'id' | 'createdAt' | 'updatedAt'>) => {
      const ref = await addDoc(collection(db, 'interviewerInfo'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return ref.id;
    },
    []
  );

  const updateInterviewer = useCallback(async (id: string, data: Partial<InterviewerInfo>) => {
    const { id: _, ...rest } = data as Record<string, unknown>;
    await updateDoc(doc(db, 'interviewerInfo', id), { ...rest, updatedAt: Timestamp.now() });
  }, []);

  const deleteInterviewer = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'interviewerInfo', id));
  }, []);

  return { interviewers, loading, addInterviewer, updateInterviewer, deleteInterviewer };
}

// Interview Prep Results
export function useInterviewPrep(opportunityId: string | undefined) {
  const [prepResults, setPrepResults] = useState<InterviewPrepResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!opportunityId) { setLoading(false); return; }
    const unsub = onSnapshot(
      query(
        collection(db, 'interviewPrep'),
        where('opportunityId', '==', opportunityId),
        orderBy('createdAt', 'desc')
      ),
      (snap) => {
        setPrepResults(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              opportunityId: data.opportunityId,
              areasToFocus: data.areasToFocus || [],
              questionsToAsk: data.questionsToAsk || [],
              experienceToEmphasize: data.experienceToEmphasize || [],
              additionalAdvice: data.additionalAdvice || '',
              createdAt: toDate(data.createdAt),
            };
          })
        );
        setLoading(false);
      }
    );
    return unsub;
  }, [opportunityId]);

  const addPrepResult = useCallback(
    async (data: Omit<InterviewPrepResult, 'id' | 'createdAt'>) => {
      const ref = await addDoc(collection(db, 'interviewPrep'), {
        ...data,
        createdAt: Timestamp.now(),
      });
      return ref.id;
    },
    []
  );

  const deletePrepResult = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'interviewPrep', id));
  }, []);

  return { prepResults, loading, addPrepResult, deletePrepResult };
}
