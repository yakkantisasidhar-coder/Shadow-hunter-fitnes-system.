import React, { useEffect, useState } from 'react';
import { 
  User, 
  Award, 
  ShieldCheck, 
  Flame, 
  Trophy, 
  Dumbbell, 
  Building2, 
  MapPin, 
  ArrowLeft, 
  CheckCircle,
  Lock,
  EyeOff,
  Sparkles,
  Timer
} from 'lucide-react';
import { api } from '../../services/api';

interface PublicMemberProfileScreenProps {
  memberId: string;
  onNavigate: (screen: string, param?: string) => void;
}

export const PublicMemberProfileScreen: React.FC<PublicMemberProfileScreenProps> = ({ memberId, onNavigate }) => {
  const [member, setMember] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        const res = await api.getPublicMember(memberId);
        setMember(res.member);
      } catch (err: any) {
        if (err.message?.includes('private') || err.message?.includes('403')) {
          setIsPrivate(true);
        } else {
          setError(err.message || 'Failed to load athlete profile.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [memberId]);

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary animate-pulse" />
        <p className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark uppercase tracking-widest">
          Loading Athlete Record...
        </p>
      </div>
    );
  }

  if (isPrivate) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <EyeOff size={32} />
        </div>
        <h3 className="text-lg font-black text-textPrimary-light dark:text-textPrimary-dark">
          Private Athlete Profile
        </h3>
        <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark leading-relaxed">
          This athlete has designated their fitness metrics, badges, and workout history as private. In accordance with Shadow Hunter privacy safeguards, confidential biometrics and records are protected.
        </p>
        <button
          onClick={() => onNavigate('leaderboards')}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold inline-flex items-center space-x-1.5"
        >
          <ArrowLeft size={16} />
          <span>Return to Performance Rankings</span>
        </button>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-center space-y-4">
        <User className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-black text-textPrimary-light dark:text-textPrimary-dark">Athlete Not Found</h3>
        <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
          {error || 'Unable to load public profile for this member.'}
        </p>
        <button
          onClick={() => onNavigate('leaderboards')}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold inline-flex items-center space-x-1.5"
        >
          <ArrowLeft size={16} />
          <span>Return to Leaderboards</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('leaderboards')}
          className="flex items-center space-x-2 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Rankings</span>
        </button>

        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center space-x-1">
          <ShieldCheck size={12} />
          <span>Verified Athlete Profile</span>
        </span>
      </div>

      {/* Member Card Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
            <img
              src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={member.displayName}
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-primary/30 shadow-2xl"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-textPrimary-light dark:text-textPrimary-dark">
                  {member.displayName}
                </h1>
                <CheckCircle className="text-primary fill-primary/20 w-6 h-6" />
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-primary text-white font-extrabold text-[10px] uppercase">
                  {member.fitnessLevel}
                </span>
                <span className="text-surface-mutedLight dark:text-surface-mutedDark">
                  Goal: {member.fitnessGoal}
                </span>
              </div>

              {/* Affiliated Gym Link */}
              {member.gymName && (
                <div className="pt-1">
                  <button
                    onClick={() => member.gymId && onNavigate('public-gym', member.gymId)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark hover:border-primary transition-colors"
                  >
                    <Building2 size={13} className="text-primary" />
                    <span>{member.gymName}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="text-center md:text-right text-xs text-surface-mutedLight dark:text-surface-mutedDark space-y-1">
            <span className="block font-bold text-textPrimary-light dark:text-textPrimary-dark">Regional Base</span>
            <span>{member.district}, {member.state}</span>
          </div>
        </div>

        {/* Public Bio */}
        {member.bio && (
          <div className="p-4 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs text-surface-mutedLight dark:text-surface-mutedDark leading-relaxed">
            "{member.bio}"
          </div>
        )}

        {/* Triple Ranking Ribbon */}
        {member.districtRank !== null && (
          <div className="pt-4 border-t border-surface-borderLight dark:border-surface-borderDark grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">District Rank</span>
              <span className="text-xl font-black text-primary dark:text-primary-light">#{member.districtRank}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">State Rank</span>
              <span className="text-xl font-black text-indigo-500">#{member.stateRank}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">National Rank</span>
              <span className="text-xl font-black text-amber-500">#{member.nationalRank}</span>
            </div>
          </div>
        )}
      </div>

      {/* Verified Consistency & Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workout Consistency */}
        {member.workoutConsistency && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
            <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark uppercase tracking-wider flex items-center space-x-2">
              <Flame className="text-amber-500 w-4 h-4" />
              <span>Verified Training Consistency</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark">
                <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">Sessions Completed</span>
                <span className="text-lg font-black text-primary dark:text-primary-light">{member.workoutConsistency.totalWorkouts}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark">
                <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">Active Streak</span>
                <span className="text-lg font-black text-amber-500">{member.workoutConsistency.streakDays} Days</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark">
                <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">Physical Volume</span>
                <span className="text-lg font-black text-indigo-500">{member.workoutConsistency.totalVolumeKg.toLocaleString()} kg</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark">
                <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">Training Time</span>
                <span className="text-lg font-black text-emerald-500">{member.workoutConsistency.totalTrainingMinutes} Mins</span>
              </div>
            </div>
          </div>
        )}

        {/* Public Badges */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
          <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark uppercase tracking-wider flex items-center space-x-2">
            <Trophy className="text-primary w-4 h-4" />
            <span>Showcased Badges</span>
          </h3>

          <div className="space-y-2.5">
            {(member.badges && member.badges.length > 0) ? (
              member.badges.map((b: any) => (
                <div
                  key={b.id}
                  className="p-3 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark flex items-center space-x-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    🏆
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark">
                      {b.title}
                    </h4>
                    <p className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">
                      {b.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark text-center py-4">
                No badges selected for public display.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Anti-Leak Privacy Guarantee Notice */}
      <div className="p-4 rounded-2xl bg-surface-light/70 dark:bg-[#1b1926]/70 border border-surface-borderLight dark:border-surface-borderDark text-[11px] text-surface-mutedLight dark:text-surface-mutedDark flex items-center space-x-2">
        <Lock size={14} className="text-primary flex-shrink-0" />
        <span>
          Privacy Standard: Personal contact numbers, email addresses, private body fat measurements, weight history, progress photos, and billing details are strictly concealed.
        </span>
      </div>
    </div>
  );
};
