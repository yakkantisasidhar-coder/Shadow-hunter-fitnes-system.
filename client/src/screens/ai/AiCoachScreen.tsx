import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, Bot, AlertCircle, RefreshCw, ThumbsUp } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ChatMessage } from '../../types';

interface AiCoachScreenProps {
  onNavigate: (screen: string) => void;
}

export const AiCoachScreen: React.FC<AiCoachScreenProps> = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'How much daily protein do I need for muscle building?',
    'Explain how to safely progressively overload barbell squats',
    'Design an express 30-minute high-intensity chest and back workout',
    'What should I eat 60 minutes before training?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.getChatHistory();
        setMessages(res.history || []);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    fetchHistory();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await api.sendChatMessage(prompt);
      setMessages(prev => [...prev, res.reply]);
    } catch (err: any) {
      setError(err.message || 'Failed to receive coach response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col space-y-3">
      {/* Header Info Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/25">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
              SHADOW HUNTER AI Performance Coach
            </h3>
            <p className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">
              Calibrated to: {user?.fitnessGoal?.replace('_', ' ').toUpperCase() || 'FITNESS'} • {user?.currentWeight || 80} kg
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
          Gemini 1.5 Active
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark space-y-4 shadow-sm">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-primary text-white'
                    : 'bg-primary/10 text-primary dark:text-primary-light ring-1 ring-primary/30'
                }`}
              >
                {isUser ? <User size={15} /> : <Bot size={15} />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-surface-light dark:bg-[#1b1926] text-textPrimary-light dark:text-textPrimary-dark rounded-tl-none border border-surface-borderLight dark:border-surface-borderDark'
                }`}
              >
                <div className="whitespace-pre-wrap font-medium">
                  {msg.content}
                </div>
                <span className={`block text-[9px] mt-2 opacity-60 text-right ${isUser ? 'text-white' : ''}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Bot size={15} />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-surface-light dark:bg-[#1b1926] rounded-tl-none flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center space-x-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Strip */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {suggestedPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about workout splits, macro targets, progressive overload..."
          className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-3 rounded-2xl gradient-btn-primary text-white disabled:opacity-40 transition-transform active:scale-95 shadow-md shadow-primary/20"
        >
          <Send size={16} />
        </button>
      </form>

      {/* Health Disclaimer */}
      <p className="text-[10px] text-center text-surface-mutedLight dark:text-surface-mutedDark opacity-75">
        Educational fitness and sports nutrition guidance only. Not medical diagnosis or prescription.
      </p>
    </div>
  );
};
