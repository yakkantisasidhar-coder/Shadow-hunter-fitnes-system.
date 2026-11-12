import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Award, 
  Flame, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  MapPin, 
  Building2, 
  User, 
  Star, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Globe,
  Filter
} from 'lucide-react';
import { api } from '../../services/api';
import { RankingScope } from '../../types';

interface LeaderboardsScreenProps {
  onNavigate: (screen: string, param?: string) => void;
}

export const LeaderboardsScreen: React.FC<LeaderboardsScreenProps> = ({ onNavigate }) => {
  // 1. Category: Gyms, Members, Trainers
  const [category, setCategory] = useState<'gyms' | 'members' | 'trainers'>('gyms');
  
  // 2. Scope: District, State, National
  const [scope, setScope] = useState<RankingScope>('district');
  
  // 3. Regional Selectors
  const [selectedState, setSelectedState] = useState<string>('Telangana');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Hyderabad');
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  // Data states
  const [gymRankings, setGymRankings] = useState<any[]>([]);
  const [memberRankings, setMemberRankings] = useState<any[]>([]);
  const [trainerRankings, setTrainerRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Available states & districts in system
  const availableStates = ['Telangana', 'Karnataka', 'Maharashtra', 'Delhi NCR', 'California'];
  const availableDistricts = ['Hyderabad', 'Rangareddy', 'Medchal', 'Bangalore Urban', 'Mumbai Suburban', 'San Francisco'];

  useEffect(() => {
    fetchLeaderboardData();
  }, [category, scope, selectedState, selectedDistrict, timeframe]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      if (category === 'gyms') {
        const res = await api.getGymLeaderboard({
          period: timeframe,
          scope,
          state: selectedState,
          district: selectedDistrict
        });
        setGymRankings(res.rankings || []);
      } else if (category === 'members') {
        const res = await api.getMemberLeaderboard({
          scope,
          state: selectedState,
          district: selectedDistrict
        });
        setMemberRankings(res.rankings || []);
      } else if (category === 'trainers') {
        const res = await api.getTrainerLeaderboard({
          scope,
          state: selectedState,
          district: selectedDistrict
        });
        setTrainerRankings(res.rankings || []);
      }
    } catch (err) {
      console.error('Failed to load leaderboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenExternalWebsite = (e: React.MouseEvent, url?: string) => {
    e.stopPropagation();
    if (!url) return;
    const ok = window.confirm(`Navigate to external official website:\n\n${url}\n\nProceed safely?`);
    if (ok) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Shadow Hunter Performance Rankings
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Verified competitive leaderboards with dedicated public profiles across Gyms, Members, and Trainers.
          </p>
        </div>

        {/* 3-Category Tabs */}
        <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <button
            onClick={() => setCategory('gyms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              category === 'gyms'
                ? 'bg-primary text-white shadow-md'
                : 'text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary'
            }`}
          >
            <Building2 size={14} />
            <span>Commercial Gyms</span>
          </button>
          <button
            onClick={() => setCategory('members')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              category === 'members'
                ? 'bg-primary text-white shadow-md'
                : 'text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary'
            }`}
          >
            <Users size={14} />
            <span>Athletes & Members</span>
          </button>
          <button
            onClick={() => setCategory('trainers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              category === 'trainers'
                ? 'bg-primary text-white shadow-md'
                : 'text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary'
            }`}
          >
            <Award size={14} />
            <span>Certified Trainers</span>
          </button>
        </div>
      </div>

      {/* Regional Scope & Filter Bar (District / State / National) */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Scope Selector: District, State, National */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark mr-1">
            Regional Scope:
          </span>
          <button
            onClick={() => setScope('district')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              scope === 'district'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark'
            }`}
          >
            District
          </button>
          <button
            onClick={() => setScope('state')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              scope === 'state'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark'
            }`}
          >
            State
          </button>
          <button
            onClick={() => setScope('national')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              scope === 'national'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark'
            }`}
          >
            National
          </button>
        </div>

        {/* Dynamic District / State Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {scope === 'district' && (
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-bold text-surface-mutedLight dark:text-surface-mutedDark">District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark"
              >
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {(scope === 'district' || scope === 'state') && (
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-bold text-surface-mutedLight dark:text-surface-mutedDark">State:</span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark"
              >
                {availableStates.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {category === 'gyms' && (
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-bold text-surface-mutedLight dark:text-surface-mutedDark">Cycle:</span>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark"
              >
                <option value="monthly">Monthly Cycle</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly Championship</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Integrity & Verified Profile Notice */}
      <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-primary dark:text-primary-light flex items-center justify-between font-medium">
        <div className="flex items-center space-x-2">
          <ShieldCheck size={16} className="flex-shrink-0" />
          <span>Click any entry to view their verified public profile, official credentials, ratings, and facilities.</span>
        </div>
        <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-primary text-white hidden sm:inline-block">
          Anti-Abuse Standard
        </span>
      </div>

      {/* Leaderboard Table Content */}
      <div className="rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark">
            Calibrating regional performance rankings...
          </div>
        ) : category === 'gyms' ? (
          /* =========================================================
             1. GYMS LEADERBOARD
             ========================================================= */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4 w-12 text-center">Rank</th>
                  <th className="py-3.5 px-4">Gym Facility</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4 text-center">Verified Rating</th>
                  <th className="py-3.5 px-4 text-center">Active Athletes</th>
                  <th className="py-3.5 px-4 text-center">Official Website</th>
                  <th className="py-3.5 px-4 text-right">Profile Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
                {gymRankings.map((g) => (
                  <tr
                    key={g.gymId}
                    onClick={() => onNavigate('public-gym', g.gymId)}
                    className="hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-4 text-center font-black">
                      <span
                        className={`inline-flex w-7 h-7 rounded-xl items-center justify-center text-xs shadow-sm ${
                          g.rank === 1
                            ? 'bg-amber-500 text-white'
                            : g.rank === 2
                            ? 'bg-slate-400 text-white'
                            : g.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark'
                        }`}
                      >
                        {g.rank}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={g.logoUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=100&q=80'}
                          alt={g.gymName}
                          className="w-10 h-10 rounded-2xl object-cover ring-2 ring-primary/20 group-hover:ring-primary transition-all"
                        />
                        <div>
                          <div className="font-black text-textPrimary-light dark:text-textPrimary-dark group-hover:text-primary transition-colors flex items-center space-x-1.5">
                            <span>{g.gymName}</span>
                          </div>
                          <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark block">
                            Score: {g.score.toLocaleString()} pts &bull; Compliance: {g.complianceRate}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-surface-mutedLight dark:text-surface-mutedDark font-medium">
                      {g.city}, {g.district}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center space-x-1 font-bold text-amber-500">
                        <Star size={13} className="fill-amber-500" />
                        <span>{g.verifiedRating || 4.9}</span>
                        <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">({g.reviewCount || 120})</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-primary dark:text-primary-light">
                      {g.activeAthletes} Athletes
                    </td>
                    <td className="py-4 px-4 text-center">
                      {g.websiteUrl ? (
                        <button
                          onClick={(e) => handleOpenExternalWebsite(e, g.websiteUrl)}
                          className="inline-flex items-center space-x-1 text-[11px] font-bold text-indigo-500 hover:text-indigo-400 hover:underline"
                        >
                          <Globe size={13} />
                          <span>Website</span>
                          <ExternalLink size={11} />
                        </button>
                      ) : (
                        <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">None</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('public-gym', g.gymId);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all text-xs font-bold inline-flex items-center space-x-1"
                      >
                        <span>View Profile</span>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : category === 'members' ? (
          /* =========================================================
             2. MEMBERS LEADERBOARD
             ========================================================= */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4 w-12 text-center">Rank</th>
                  <th className="py-3.5 px-4">Athlete</th>
                  <th className="py-3.5 px-4">Affiliated Gym</th>
                  <th className="py-3.5 px-4 text-center">Sessions Logged</th>
                  <th className="py-3.5 px-4 text-center">Physical Volume</th>
                  <th className="py-3.5 px-4 text-center">Progress Score</th>
                  <th className="py-3.5 px-4 text-right">Profile Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
                {memberRankings.map((m) => (
                  <tr
                    key={m.userId}
                    onClick={() => onNavigate('public-member', m.userId)}
                    className="hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-4 text-center font-black">
                      <span
                        className={`inline-flex w-7 h-7 rounded-xl items-center justify-center text-xs shadow-sm ${
                          m.rank === 1
                            ? 'bg-amber-500 text-white'
                            : m.rank === 2
                            ? 'bg-slate-400 text-white'
                            : m.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark'
                        }`}
                      >
                        {m.rank}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={m.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={m.username}
                          className="w-10 h-10 rounded-2xl object-cover ring-2 ring-primary/20 group-hover:ring-primary transition-all"
                        />
                        <div>
                          <div className="font-black text-textPrimary-light dark:text-textPrimary-dark group-hover:text-primary transition-colors">
                            {m.username}
                          </div>
                          <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark block uppercase font-bold">
                            Level: {m.fitnessLevel}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-surface-mutedLight dark:text-surface-mutedDark">
                      {m.gymName}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-primary dark:text-primary-light">
                      {m.workoutsCount} Workouts
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-indigo-500">
                      {m.volumeKg.toLocaleString()} kg
                    </td>
                    <td className="py-4 px-4 text-center font-black text-emerald-500">
                      {m.progressScore.toLocaleString()} pts
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('public-member', m.userId);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all text-xs font-bold inline-flex items-center space-x-1"
                      >
                        <span>View Profile</span>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* =========================================================
             3. TRAINERS LEADERBOARD
             ========================================================= */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4 w-12 text-center">Rank</th>
                  <th className="py-3.5 px-4">Coach / Trainer</th>
                  <th className="py-3.5 px-4">Specialization</th>
                  <th className="py-3.5 px-4">Associated Gym</th>
                  <th className="py-3.5 px-4 text-center">Student Rating</th>
                  <th className="py-3.5 px-4 text-center">Coaching Score</th>
                  <th className="py-3.5 px-4 text-right">Profile Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
                {trainerRankings.map((t) => (
                  <tr
                    key={t.trainerId}
                    onClick={() => onNavigate('public-trainer', t.trainerId)}
                    className="hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-4 text-center font-black">
                      <span
                        className={`inline-flex w-7 h-7 rounded-xl items-center justify-center text-xs shadow-sm ${
                          t.rank === 1
                            ? 'bg-amber-500 text-white'
                            : t.rank === 2
                            ? 'bg-slate-400 text-white'
                            : t.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark'
                        }`}
                      >
                        {t.rank}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={t.avatarUrl || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=100&q=80'}
                          alt={t.name}
                          className="w-10 h-10 rounded-2xl object-cover ring-2 ring-primary/20 group-hover:ring-primary transition-all"
                        />
                        <div>
                          <div className="font-black text-textPrimary-light dark:text-textPrimary-dark group-hover:text-primary transition-colors">
                            {t.name}
                          </div>
                          <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark block font-medium">
                            {t.experienceYears} Years Exp &bull; {t.verifiedCertificationsCount} Accredited Certs
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-primary dark:text-primary-light">
                      {t.specialty}
                    </td>
                    <td className="py-4 px-4 font-medium text-surface-mutedLight dark:text-surface-mutedDark">
                      {t.gymName}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center space-x-1 font-bold text-amber-500">
                        <Star size={13} className="fill-amber-500" />
                        <span>{t.averageRating}</span>
                        <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">({t.reviewCount})</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-black text-emerald-500">
                      {t.score.toLocaleString()} pts
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('public-trainer', t.trainerId);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all text-xs font-bold inline-flex items-center space-x-1"
                      >
                        <span>View Profile</span>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
