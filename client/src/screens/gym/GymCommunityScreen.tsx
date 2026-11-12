import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, UserCheck, Send, Sparkles, Building2, HelpCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { GymMessage, GymTrainer } from '../../types';

interface GymCommunityScreenProps {
  onNavigate: (screen: string) => void;
}

export const GymCommunityScreen: React.FC<GymCommunityScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GymMessage[]>([]);
  const [trainers, setTrainers] = useState<GymTrainer[]>([]);
  const [activeChannel, setActiveChannel] = useState<'community' | 'trainer_qa'>('community');
  const [content, setContent] = useState('');
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const gymId = user?.gymId || 'gym-apex-1';

  const loadData = async () => {
    try {
      setLoading(true);
      const [msgRes, gymRes] = await Promise.all([
        api.getGymMessages(gymId, activeChannel),
        api.getGymDetails(gymId)
      ]);
      setMessages(msgRes.messages || []);
      setTrainers(gymRes.trainers || []);
      if (gymRes.trainers && gymRes.trainers.length > 0 && !selectedTrainerId) {
        setSelectedTrainerId(gymRes.trainers[0].id);
      }
    } catch (err) {
      console.error('Failed to load community data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [gymId, activeChannel]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || posting) return;

    try {
      setPosting(true);
      const chosenTrainer = trainers.find(t => t.id === selectedTrainerId);

      const res = await api.postGymMessage(gymId, {
        content: content.trim(),
        channel: activeChannel,
        targetTrainerId: activeChannel === 'trainer_qa' ? selectedTrainerId : undefined,
        targetTrainerName: activeChannel === 'trainer_qa' ? chosenTrainer?.name : undefined
      });

      if (res.message) {
        setMessages(prev => [...prev, res.message]);
        setContent('');
      }
    } catch (err: any) {
      alert(`Failed to send message: ${err.message}`);
    } finally {
      setPosting(false);
    }
  };

  const getRoleBadge = (role: string, senderName: string) => {
    if (senderName.includes('Coach')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary dark:text-primary-light">
          Certified Coach
        </span>
      );
    }
    if (role === 'gym_owner') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400">
          Gym Director
        </span>
      );
    }
    if (role === 'super_admin') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
          Super Admin
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-borderLight dark:bg-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark">
        Verified Member
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#1e1b2e] to-primary text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider mb-2">
            <Building2 size={12} className="text-primary-light" />
            <span>Facility Community Portal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">
            Gym Member & Trainer Network
          </h1>
          <p className="text-xs text-white/80 mt-1 max-w-xl">
            Communicate directly with certified gym coaching staff, exchange performance strategies, and coordinate workouts with fellow members.
          </p>
        </div>

        <button
          onClick={() => onNavigate('gym')}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
        >
          Back to Gym Hub
        </button>
      </div>

      {/* Channel Switcher */}
      <div className="flex border-b border-surface-borderLight dark:border-surface-borderDark gap-4">
        <button
          onClick={() => setActiveChannel('community')}
          className={`flex items-center space-x-2 pb-3 px-2 text-sm font-bold border-b-2 transition-all ${
            activeChannel === 'community'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-surface-mutedLight dark:text-surface-mutedDark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
          }`}
        >
          <Users size={16} />
          <span>Member Community Feed</span>
        </button>
        <button
          onClick={() => setActiveChannel('trainer_qa')}
          className={`flex items-center space-x-2 pb-3 px-2 text-sm font-bold border-b-2 transition-all ${
            activeChannel === 'trainer_qa'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-surface-mutedLight dark:text-surface-mutedDark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
          }`}
        >
          <UserCheck size={16} />
          <span>Trainer Q&A & Coaching Inquiries</span>
        </button>
      </div>

      {/* Message Feed Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-surface-borderLight dark:border-surface-borderDark">
          <div className="flex items-center space-x-2">
            <MessageSquare size={16} className="text-primary" />
            <h3 className="text-xs font-black uppercase tracking-wider text-textPrimary-light dark:text-textPrimary-dark">
              {activeChannel === 'community' ? 'Facility Discussion Feed' : 'Direct Trainer Guidance Thread'}
            </h3>
          </div>
          <span className="text-[10px] font-bold text-surface-mutedLight dark:text-surface-mutedDark">
            {messages.length} Messages Logged
          </span>
        </div>

        {/* Messages List */}
        <div className="space-y-4 min-h-[280px] max-h-[480px] overflow-y-auto pr-2">
          {loading ? (
            <div className="flex justify-center py-12 text-surface-mutedLight dark:text-surface-mutedDark text-xs font-semibold">
              Loading communication records...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <HelpCircle className="mx-auto text-surface-mutedLight dark:text-surface-mutedDark" size={32} />
              <p className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark">
                No inquiries or community updates in this channel yet.
              </p>
              <p className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
                Be the first to post a fitness topic or ask our coaching staff a question below.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="p-4 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark space-y-2 transition-all hover:border-primary/30"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-xs font-black">
                      {msg.senderName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-textPrimary-light dark:text-textPrimary-dark">
                          {msg.senderName}
                        </span>
                        {getRoleBadge(msg.senderRole, msg.senderName)}
                      </div>
                      {msg.targetTrainerName && (
                        <span className="text-[10px] text-primary dark:text-primary-light font-medium block">
                          Addressed to Coach {msg.targetTrainerName}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-textPrimary-light dark:text-textPrimary-dark leading-relaxed pl-10">
                  {msg.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Message Input Dock */}
        <form onSubmit={handleSendMessage} className="pt-4 border-t border-surface-borderLight dark:border-surface-borderDark space-y-3">
          {activeChannel === 'trainer_qa' && trainers.length > 0 && (
            <div className="flex items-center space-x-3 text-xs">
              <label className="font-bold text-surface-mutedLight dark:text-surface-mutedDark">
                Consult With Trainer:
              </label>
              <select
                value={selectedTrainerId}
                onChange={(e) => setSelectedTrainerId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    Coach {t.name} ({t.specialty})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                activeChannel === 'trainer_qa'
                  ? 'Ask a question about lifting technique, split recovery, or programming...'
                  : 'Share workout milestones, facility tips, or training plans with gym members...'
              }
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={posting}
            />
            <button
              type="submit"
              disabled={posting || !content.trim()}
              className="px-5 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center space-x-1.5 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send size={14} />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
