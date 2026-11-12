import React, { useEffect, useState } from 'react';
import { Building2, Users, UserCheck, Trophy, Bell, Key, Plus, ArrowRight, Check, DollarSign, TrendingUp, Clock, Layers, Dumbbell, Palette, MessageSquare } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Gym, GymAnnouncement } from '../../types';

interface GymManagementScreenProps {
  onNavigate: (screen: string) => void;
}

export const GymManagementScreen: React.FC<GymManagementScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [gym, setGym] = useState<Gym | null>(null);
  const [announcements, setAnnouncements] = useState<GymAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  // Announcement Form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'normal' | 'high'>('normal');
  const [annPosting, setAnnPosting] = useState(false);

  const fetchGymData = async () => {
    try {
      const gymId = user?.gymId || 'gym-apex-1';
      const res = await api.getGymDetails(gymId);
      setGym(res.gym);
      setAnnouncements(res.announcements || []);
    } catch (err) {
      console.error('Failed to load gym management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGymData();
  }, [user]);

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent || !gym) return;

    setAnnPosting(true);
    try {
      await api.addGymAnnouncement(gym.id, {
        title: annTitle,
        content: annContent,
        priority: annPriority
      });
      setAnnTitle('');
      setAnnContent('');
      fetchGymData();
    } catch (err) {
      console.error('Failed to post announcement:', err);
    } finally {
      setAnnPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Gym Administration Portal
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Manage facility operations for {gym?.name || 'Apex Performance Athletic Club'}.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('gym-members')}
            className="px-4 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold"
          >
            Review Member Applications
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
            Active Members
          </span>
          <span className="text-2xl font-black text-primary dark:text-primary-light mt-1 block">
            {gym?.memberCount || 88} Athletes
          </span>
          <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark mt-0.5 block">
            Capacity: {gym?.capacity || 250} ({Math.round(((gym?.memberCount || 88) / (gym?.capacity || 250)) * 100)}%)
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
            Join Code Voucher
          </span>
          <span className="text-xl font-black tracking-widest text-textPrimary-light dark:text-textPrimary-dark mt-1 block">
            {gym?.joinCode || 'APEX50'}
          </span>
          <span className="text-[11px] text-emerald-500 font-bold mt-0.5 block">
            50% Partner Discount Live
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
            Staff Trainers
          </span>
          <span className="text-2xl font-black text-indigo-500 mt-1 block">
            2 CSCS Coaches
          </span>
          <button onClick={() => onNavigate('gym-trainers')} className="text-[11px] text-primary hover:underline font-bold mt-0.5 block">
            Manage Staff &rarr;
          </button>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
            Facility Status
          </span>
          <span className="text-base font-black uppercase text-emerald-500 mt-1 block">
            {gym?.status || 'Approved'}
          </span>
          <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark mt-0.5 block">
            Tier: {gym?.partnershipTier}
          </span>
        </div>
      </div>

      {/* Module Shortcuts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('gym-members')}
          className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary cursor-pointer transition-all shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary dark:text-primary-light flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                Member Management
              </h4>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                Profiles, start/expiries & progress
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-primary dark:text-primary-light" />
        </div>

        <div
          onClick={() => onNavigate('gym-billing')}
          className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary cursor-pointer transition-all shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                Monthly Billing Management
              </h4>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                Invoices, Cash/UPI receipts & dues
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-primary dark:text-primary-light" />
        </div>

        <div
          onClick={() => onNavigate('gym-financials')}
          className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary cursor-pointer transition-all shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                Financial Analytics
              </h4>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                Revenue, collections & expenses CSV
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-primary dark:text-primary-light" />
        </div>

        <div
          onClick={() => onNavigate('gym-operations')}
          className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary cursor-pointer transition-all shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Layers size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                Gym Operations Suite
              </h4>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                Profile, attendance logs & plans
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-primary dark:text-primary-light" />
        </div>

        <div
          onClick={() => onNavigate('gym-trainers')}
          className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary cursor-pointer transition-all shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <UserCheck size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                Trainer Roster Management
              </h4>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                Staff coaches and client assignments
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-primary dark:text-primary-light" />
        </div>

        <div
          onClick={() => onNavigate('gym-competitions')}
          className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary cursor-pointer transition-all shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Trophy size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                Gym Tournaments & Challenges
              </h4>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                Inter-gym competitions and verified boards
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-primary dark:text-primary-light" />
        </div>

        <div
          onClick={() => onNavigate('gym-pt')}
          className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary cursor-pointer transition-all shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Dumbbell size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                Personal Training Module
              </h4>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                PT packages, sessions & trainer management
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-primary dark:text-primary-light" />
        </div>

        <div
          onClick={() => onNavigate('gym-branding')}
          className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary cursor-pointer transition-all shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <Palette size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                Gym Branding & Gallery
              </h4>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                White-label colors, logo & photo gallery
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-primary dark:text-primary-light" />
        </div>

        <div
          onClick={() => onNavigate('gym-whatsapp')}
          className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark hover:border-emerald-500 cursor-pointer transition-all shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                WhatsApp Communication & Follow-ups
              </h4>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                Meta Cloud API, AI posters & festival campaigns
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-emerald-500" />
        </div>
      </div>

      {/* Broadcast Announcement Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handlePostAnnouncement} className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Bell size={18} className="text-primary" />
            <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
              Broadcast Facility Announcement
            </h3>
          </div>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
            Deliver an official notice to all connected members' home dashboards.
          </p>

          <div>
            <label className="block text-xs font-bold mb-1">Announcement Subject</label>
            <input
              type="text"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="e.g., Scheduled Maintenance on Squat Racks"
              className="w-full px-4 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Notice Content</label>
            <textarea
              rows={3}
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              placeholder="Describe the update, timeline, or instruction..."
              className="w-full px-4 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs"
              required
            />
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={annPriority === 'high'}
                onChange={(e) => setAnnPriority(e.target.checked ? 'high' : 'normal')}
                className="accent-primary"
              />
              <span>Flag as High Priority / Urgent Alert</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={annPosting || !annTitle || !annContent}
            className="w-full py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <Check size={16} />
            <span>{annPosting ? 'Publishing...' : 'Publish Announcement'}</span>
          </button>
        </form>

        {/* Existing Announcements List */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-3">
          <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
            Recent Facility Broadcasts
          </h3>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-3.5 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark space-y-1"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark">
                    {ann.title}
                  </h4>
                  <span className="text-[9px] text-surface-mutedLight dark:text-surface-mutedDark">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark line-clamp-2">
                  {ann.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
