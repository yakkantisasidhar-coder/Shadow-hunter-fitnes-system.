import React, { useEffect, useState } from 'react';
import { Building2, Users, Trophy, Bell, UserCheck, Key, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Gym, GymTrainer, GymAnnouncement, GymCompetition } from '../../types';

interface GymDashboardScreenProps {
  onNavigate: (screen: string) => void;
}

export const GymDashboardScreen: React.FC<GymDashboardScreenProps> = ({ onNavigate }) => {
  const { user, refreshUser } = useAuth();
  const [gymData, setGymData] = useState<{
    gym: Gym;
    trainers: GymTrainer[];
    announcements: GymAnnouncement[];
    competitions: GymCompetition[];
  } | null>(null);

  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinStatus, setJoinStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchGym = async () => {
    try {
      const gymId = user?.gymId || 'gym-apex-1';
      const res = await api.getGymDetails(gymId);
      setGymData(res);
    } catch (err) {
      console.error('Failed to load gym details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGym();
  }, [user]);

  const handleJoinGym = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    try {
      const res = await api.joinGymByCode(joinCodeInput.trim());
      setJoinStatus(res.message);
      setJoinCodeInput('');
      await refreshUser();
      fetchGym();
    } catch (err: any) {
      setJoinStatus(`Error: ${err.message}`);
    }
  };

  const gym = gymData?.gym;
  const isApprovedMember = user?.gymStatus === 'approved';

  return (
    <div className="space-y-6">
      {/* Gym Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#1e1b2e] to-primary p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider mb-2">
              <Building2 size={12} className="text-primary-light" />
              <span>{gym?.partnershipTier === 'premium_collaboration' ? 'PREMIUM COLLABORATION PARTNER' : 'AFFILIATED FACILITY'}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black">
              {gym?.name || 'Apex Performance Athletic Club'}
            </h2>
            <p className="text-xs text-white/80 mt-1">
              {gym?.address}, {gym?.city} &bull; Join Code: <strong className="text-primary-light">{gym?.joinCode}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('gym-community')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors backdrop-blur-md"
            >
              Member & Trainer Chat
            </button>
            {user?.role === 'gym_owner' || user?.role === 'super_admin' ? (
              <button
                onClick={() => onNavigate('gym-manage')}
                className="px-5 py-2.5 rounded-2xl bg-white text-primary font-bold text-xs hover:bg-white/90 transition-colors shadow-lg"
              >
                Owner Portal
              </button>
            ) : (
              <span className={`px-4 py-2 rounded-2xl text-xs font-bold ${
                isApprovedMember ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {isApprovedMember ? 'Verified Gym Member' : 'Application Pending'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Join Code Module if not connected or pending */}
      {(!user?.gymId || user.gymStatus !== 'approved') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <Key size={18} className="text-primary" />
            <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
              Connect to Your Commercial Gym
            </h3>
          </div>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
            Enter the unique 6-character gym collaboration joining code provided by your front desk to link your membership and unlock the 50% subscription discount.
          </p>

          <form onSubmit={handleJoinGym} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value)}
              placeholder="e.g. APEX50"
              className="flex-1 px-4 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold uppercase"
              required
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-xl gradient-btn-primary text-white text-xs font-bold"
            >
              Submit Code
            </button>
          </form>

          {joinStatus && (
            <p className="text-xs font-bold text-primary dark:text-primary-light">{joinStatus}</p>
          )}
        </div>
      )}

      {/* Announcements & Facility Trainers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gym Announcements */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bell size={18} className="text-primary" />
              <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                Official Gym Announcements
              </h3>
            </div>
            <span className="text-[10px] font-bold text-surface-mutedLight dark:text-surface-mutedDark">
              Verified Broadcasts
            </span>
          </div>

          <div className="space-y-3">
            {gymData?.announcements?.map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark space-y-1.5"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-textPrimary-light dark:text-textPrimary-dark">
                    {ann.title}
                  </h4>
                  {ann.priority === 'high' && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500">
                      Important
                    </span>
                  )}
                </div>
                <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark leading-relaxed">
                  {ann.content}
                </p>
                <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark block pt-1">
                  Posted by {ann.author} &bull; {new Date(ann.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Certified Trainers */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <UserCheck size={18} className="text-primary" />
              <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                Facility Coaching Staff
              </h3>
            </div>
            <span className="text-[10px] font-bold text-surface-mutedLight dark:text-surface-mutedDark">
              {gymData?.trainers?.length || 0} Trainers
            </span>
          </div>

          <div className="space-y-3">
            {gymData?.trainers?.map((trainer) => (
              <div
                key={trainer.id}
                className="p-4 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-black text-textPrimary-light dark:text-textPrimary-dark">
                    Coach {trainer.name}
                  </h4>
                  <span className="text-[11px] font-bold text-primary dark:text-primary-light block">
                    {trainer.specialty}
                  </span>
                  <p className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark mt-0.5 line-clamp-1">
                    {trainer.bio}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-surface-borderLight dark:bg-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark whitespace-nowrap">
                  {trainer.experienceYears} Yrs Exp
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Facilities Strip */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
        <h4 className="text-xs font-black uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark mb-3">
          Available Facility Amenities
        </h4>
        <div className="flex flex-wrap gap-2">
          {gym?.facilities?.map((fac, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-semibold text-textPrimary-light dark:text-textPrimary-dark"
            >
              &bull; {fac}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
