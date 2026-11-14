import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  Flame, 
  Users, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Sparkles,
  Plus,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { FitnessChallenge } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface FitnessChallengesScreenProps {
  onNavigate: (screen: string, param?: string) => void;
}

export const FitnessChallengesScreen: React.FC<FitnessChallengesScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [missions, setMissions] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'special_event'>('all');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    discipline: 'Strength',
    difficulty: 'Intermediate',
    xpPoints: 150,
    badgeName: '',
    verificationMethod: 'workout_record'
  });

  const fetchMissionData = async () => {
    try {
      setLoading(true);
      const [resMissions, resLedger] = await Promise.all([
        api.getDynamicMissions(),
        api.getPointsLedger()
      ]);
      setMissions(resMissions.missions || []);
      setLedger(resLedger.transactions || []);
      setTotalPoints(resLedger.totalPoints || 0);
    } catch (err) {
      console.error('Failed to load dynamic missions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissionData();
  }, []);

  const handleJoin = async (id: string) => {
    try {
      await api.joinDynamicMission(id);
      fetchMissionData();
    } catch (err: any) {
      alert(err.message || 'Error joining mission');
    }
  };

  const handleVerify = async (id: string) => {
    try {
      setVerifyingId(id);
      const res = await api.verifyMissionCompletion(id);
      alert(`Success! Verified & claimed +${res.pointsEarned} XP!`);
      fetchMissionData();
    } catch (err: any) {
      alert(err.message || 'Verification could not be established');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createDynamicMission(newMission);
      setCreateModalOpen(false);
      setNewMission({
        title: '',
        description: '',
        frequency: 'daily',
        discipline: 'Strength',
        difficulty: 'Intermediate',
        xpPoints: 150,
        badgeName: '',
        verificationMethod: 'workout_record'
      });
      fetchMissionData();
    } catch (err: any) {
      alert(err.message || 'Failed to create challenge');
    }
  };

  const filtered = selectedFilter === 'all'
    ? missions
    : missions.filter(m => m.frequency === selectedFilter);

  const canCreate = user?.role === 'super_admin' || user?.role === 'gym_owner';

  return (
    <div className="space-y-6">
      {/* Title & Points Summary */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
              Dynamic Missions & Quest Engine
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Live Verified
            </span>
          </div>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Certified daily routines, weekly consistency trials, and monthly volume crusades verified through real workout telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center space-x-2">
            <Zap size={16} className="text-amber-500 fill-amber-500" />
            <div>
              <span className="text-[10px] font-bold text-surface-mutedLight dark:text-surface-mutedDark block leading-none">Verified Honor Points</span>
              <span className="text-sm font-black text-amber-500">{totalPoints.toLocaleString()} XP</span>
            </div>
          </div>

          {canCreate && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
            >
              <Plus size={15} />
              <span>Create Quest</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('achievements')}
            className="px-4 py-2.5 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold flex items-center space-x-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Award size={16} />
            <span>Badges</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {(['all', 'daily', 'weekly', 'monthly', 'special_event'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
              selectedFilter === cat
                ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105'
                : 'bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark hover:border-primary/40'
            }`}
          >
            {cat === 'all' ? 'All Missions' : cat.replace('_', ' ') + ' Quests'}
          </button>
        ))}
      </div>

      {/* Grid of Missions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((m) => {
          const isClaimed = m.userStatus === 'claimed';
          const isInProgress = m.userStatus === 'in_progress';

          return (
            <div
              key={m.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    m.frequency === 'daily' ? 'bg-blue-500/10 text-blue-500' :
                    m.frequency === 'weekly' ? 'bg-purple-500/10 text-purple-500' :
                    m.frequency === 'monthly' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-rose-500/10 text-rose-500'
                  }`}>
                    {m.frequency.replace('_', ' ')} • {m.discipline}
                  </span>
                  <span className="text-[11px] font-bold text-surface-mutedLight dark:text-surface-mutedDark flex items-center space-x-1">
                    <Users size={12} />
                    <span>{m.participantsCount || 0}</span>
                  </span>
                </div>

                <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                  {m.title}
                </h3>
                <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1 leading-relaxed">
                  {m.description}
                </p>

                <div className="mt-4 p-3 rounded-2xl bg-surface-light dark:bg-[#1b1926] flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">Verification Protocol</span>
                    <span className="font-extrabold text-textPrimary-light dark:text-textPrimary-dark capitalize">
                      {m.verificationMethod.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">Reward Bounty</span>
                    <span className="font-black text-amber-500">+{m.xpPoints} XP</span>
                  </div>
                </div>

                {isInProgress && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span>Telemetry Verification Progress</span>
                      <span className="text-primary dark:text-primary-light">{m.userProgressPercent || 0}%</span>
                    </div>
                    <div className="w-full bg-surface-light dark:bg-[#1b1926] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all"
                        style={{ width: `${m.userProgressPercent || 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {isClaimed ? (
                <div className="py-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center justify-center space-x-1.5 border border-emerald-500/20">
                  <CheckCircle2 size={15} />
                  <span>Verified & Claimed</span>
                </div>
              ) : isInProgress ? (
                <button
                  onClick={() => handleVerify(m.id)}
                  disabled={verifyingId === m.id}
                  className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                >
                  <ShieldCheck size={15} />
                  <span>{verifyingId === m.id ? 'Validating Telemetry...' : 'Verify & Claim Reward'}</span>
                </button>
              ) : (
                <button
                  onClick={() => handleJoin(m.id)}
                  className="w-full py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold transition-transform active:scale-95"
                >
                  Accept Mission Challenge
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Ledger Audit Trail */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
        <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark flex items-center space-x-2">
          <ShieldCheck size={16} className="text-primary" />
          <span>Immutable Points & Mission Verification Ledger</span>
        </h3>
        <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
          Every reward point is calculated and verified server-side with unique cryptographically indexed audit references.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark">
                <th className="pb-2 font-bold">Transaction Reference</th>
                <th className="pb-2 font-bold">Mission / Reason</th>
                <th className="pb-2 font-bold">Points</th>
                <th className="pb-2 font-bold">Verification Engine</th>
                <th className="pb-2 font-bold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
              {ledger.map((tx) => (
                <tr key={tx.id} className="text-textPrimary-light dark:text-textPrimary-dark">
                  <td className="py-2.5 font-mono text-[11px] text-primary">{tx.transactionRef}</td>
                  <td className="py-2.5 font-medium">{tx.reason}</td>
                  <td className="py-2.5 font-black text-amber-500">+{tx.pointsEarned} XP</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                      {tx.verificationStatus}
                    </span>
                  </td>
                  <td className="py-2.5 text-surface-mutedLight dark:text-surface-mutedDark">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
              {ledger.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-surface-mutedLight dark:text-surface-mutedDark">
                    No reward transactions recorded yet. Complete your first mission above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl p-6 max-w-lg w-full space-y-4 border border-surface-borderLight dark:border-surface-borderDark shadow-xl">
            <h3 className="text-lg font-black text-textPrimary-light dark:text-textPrimary-dark">
              Create Dynamic Challenge Quest
            </h3>
            <form onSubmit={handleCreateMission} className="space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1">Quest Title</label>
                <input
                  type="text"
                  required
                  value={newMission.title}
                  onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                  placeholder="e.g. Iron Fortress Calisthenics Mastery"
                  className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  value={newMission.description}
                  onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
                  placeholder="Requirements and execution guidelines..."
                  className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Cadence Frequency</label>
                  <select
                    value={newMission.frequency}
                    onChange={(e) => setNewMission({ ...newMission, frequency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-medium"
                  >
                    <option value="daily">Daily Challenge</option>
                    <option value="weekly">Weekly Consistency</option>
                    <option value="monthly">Monthly Volume</option>
                    <option value="special_event">Special Athletic Event</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Discipline</label>
                  <select
                    value={newMission.discipline}
                    onChange={(e) => setNewMission({ ...newMission, discipline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-medium"
                  >
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Consistency">Consistency</option>
                    <option value="Endurance">Endurance</option>
                    <option value="Personal Training">Personal Training</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Reward Points (XP)</label>
                  <input
                    type="number"
                    required
                    min={50}
                    max={5000}
                    value={newMission.xpPoints}
                    onChange={(e) => setNewMission({ ...newMission, xpPoints: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Verification Method</label>
                  <select
                    value={newMission.verificationMethod}
                    onChange={(e) => setNewMission({ ...newMission, verificationMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-medium"
                  >
                    <option value="workout_record">Workout History Telemetry</option>
                    <option value="attendance_checkin">Gym Attendance Check-in</option>
                    <option value="trainer_confirmation">Trainer Sign-off</option>
                    <option value="backend_calculation">Cumulative Calculation</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-surface-borderLight dark:border-surface-borderDark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white"
                >
                  Deploy Quest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
