import { useState, useRef, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';
import type { ChatMessage as ChatMessageType, ResumeContent } from '../../types';
import { generateChatResponse } from '../../lib/ai';

interface ChatSidebarProps {
  messages: ChatMessageType[];
  resumeContent: ResumeContent | null;
  onSendMessage: (role: 'user' | 'assistant', content: string) => void;
  loading?: boolean;
}

export default function ChatSidebar({ messages, resumeContent, onSendMessage, loading }: ChatSidebarProps) {
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || generating) return;
    const userMsg = input.trim();
    setInput('');
    onSendMessage('user', userMsg);

    setGenerating(true);
    try {
      const history = [...messages.map((m) => ({ role: m.role, content: m.content })), { role: 'user', content: userMsg }];
      const response = await generateChatResponse(
        history,
        resumeContent || { header: { name: '', title: '', email: '', phone: '', location: '' }, sections: [] }
      );
      onSendMessage('assistant', response);
    } catch {
      onSendMessage('assistant', 'Sorry, something went wrong. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border-dark">
        <h3 className="text-sm font-semibold">Chat</h3>
        <p className="text-xs text-text-secondary-dark mt-0.5">Iterate on your resume with AI</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="text-center text-text-secondary-dark text-sm py-8">
            Start a conversation to refine your resume. Try things like "make the tone more technical" or "cut the summary to 2 sentences".
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent text-white rounded-br-md'
                  : 'bg-surface-card-dark text-text-primary-dark rounded-bl-md'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {generating && (
          <div className="flex justify-start">
            <div className="bg-surface-card-dark text-text-secondary-dark px-3.5 py-2.5 rounded-2xl rounded-bl-md">
              <Loader size={16} className="animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-3 border-t border-border-dark">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask the AI to refine your resume..."
            className="flex-1 bg-surface-card-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-primary-dark placeholder:text-text-secondary-dark/50 outline-none focus:border-accent transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || generating}
            className="p-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
