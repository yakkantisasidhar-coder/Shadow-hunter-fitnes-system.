import React, { useState } from 'react';
import { Trophy, Award, Flame, Users, ShieldCheck, ArrowRight } from 'lucide-react';

interface LeaderboardsScreenProps {
  onNavigate: (screen: string) => void;
}

export const LeaderboardsScreen: React.FC<LeaderboardsScreenProps> = ({ onNavigate }) => {
  const [boardType, setBoardType] = useState<'athletes' | 'gyms'>('athletes');
  const [timeframe, setTimeframe] = useState<'month' | 'allTime'>('month');

  const athleteLeaderboard = [
    { rank: 1, name: 'Sarah Jenkins', gym: 'Apex Performance', workouts: 22, volumeKg: 34500, minutes: 1140 },
    { rank: 2, name: 'Alex Reynolds', gym: 'Apex Performance', workouts: 20, volumeKg: 46200, minutes: 1080 },
    { rank: 3, name: 'Michael Chang', gym: 'Titan Commercial', workouts: 19, volumeKg: 28400, minutes: 990 },
    { rank: 4, name: 'Elena Rostova', gym: 'Titan Commercial', workouts: 18, volumeKg: 24100, minutes: 920 },
    { rank: 5, name: 'Jordan Hayes', gym: 'Metro Athletics', workouts: 17, volumeKg: 31000, minutes: 890 }
  ];

  const gymLeaderboard = [
    { rank: 1, name: 'Apex Performance Athletic Club', city: 'Metropolis', avgWorkoutMinutesPerMember: 680, activeAthletes: 88, complianceRate: '94%' },
    { rank: 2, name: 'Titan Commercial Health Club', city: 'Metropolis', avgWorkoutMinutesPerMember: 610, activeAthletes: 164, complianceRate: '89%' },
    { rank: 3, name: 'Metro Athletics & Iron', city: 'Highline', avgWorkoutMinutesPerMember: 540, activeAthletes: 95, complianceRate: '86%' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Verified Performance Leaderboards
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Fair competitive rankings derived from verified session timestamps and legitimate physical volume.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark">
          <button
            onClick={() => setBoardType('athletes')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              boardType === 'athletes'
                ? 'bg-primary text-white shadow-sm'
                : 'text-surface-mutedLight dark:text-surface-mutedDark'
            }`}
          >
            Individual Athletes
          </button>
          <button
            onClick={() => setBoardType('gyms')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              boardType === 'gyms'
                ? 'bg-primary text-white shadow-sm'
                : 'text-surface-mutedLight dark:text-surface-mutedDark'
            }`}
          >
            Commercial Gyms
          </button>
        </div>
      </div>

      {/* Fair Ranking Integrity Notice */}
      <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-primary dark:text-primary-light flex items-center space-x-2 font-medium">
        <ShieldCheck size={16} className="flex-shrink-0" />
        <span>Anti-Abuse Verification: Gym rankings are normalized by active workout density, not arbitrary headcounts.</span>
      </div>

      {/* Board Content */}
      <div className="rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm overflow-hidden">
        {boardType === 'athletes' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark font-bold uppercase text-[10px]">
                  <th className="py-3 px-4 w-12 text-center">Rank</th>
                  <th className="py-3 px-4">Athlete</th>
                  <th className="py-3 px-4">Affiliated Gym</th>
                  <th className="py-3 px-4 text-center">Sessions Logged</th>
                  <th className="py-3 px-4 text-center">Total Volume</th>
                  <th className="py-3 px-4 text-right">Training Minutes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
                {athleteLeaderboard.map((ath) => (
                  <tr key={ath.rank} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 text-center font-black">
                      <span
                        className={`inline-flex w-6 h-6 rounded-lg items-center justify-center text-xs ${
                          ath.rank === 1
                            ? 'bg-amber-500 text-white'
                            : ath.rank === 2
                            ? 'bg-slate-400 text-white'
                            : ath.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'text-surface-mutedLight dark:text-surface-mutedDark'
                        }`}
                      >
                        {ath.rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-textPrimary-light dark:text-textPrimary-dark">
                      {ath.name}
                    </td>
                    <td className="py-3.5 px-4 text-surface-mutedLight dark:text-surface-mutedDark">
                      {ath.gym}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold">
                      {ath.workouts}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-indigo-500">
                      {ath.volumeKg.toLocaleString()} kg
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-primary dark:text-primary-light">
                      {ath.minutes} Mins
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark font-bold uppercase text-[10px]">
                  <th className="py-3 px-4 w-12 text-center">Rank</th>
                  <th className="py-3 px-4">Gym Facility</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Active Athletes</th>
                  <th className="py-3 px-4 text-center">Avg Session Time</th>
                  <th className="py-3 px-4 text-right">Member Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
                {gymLeaderboard.map((g) => (
                  <tr key={g.rank} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 text-center font-black">
                      <span
                        className={`inline-flex w-6 h-6 rounded-lg items-center justify-center text-xs ${
                          g.rank === 1 ? 'bg-amber-500 text-white' : 'text-surface-mutedLight dark:text-surface-mutedDark'
                        }`}
                      >
                        {g.rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-textPrimary-light dark:text-textPrimary-dark">
                      {g.name}
                    </td>
                    <td className="py-3.5 px-4 text-surface-mutedLight dark:text-surface-mutedDark">
                      {g.city}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold">
                      {g.activeAthletes}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-primary dark:text-primary-light">
                      {g.avgWorkoutMinutesPerMember} Mins / Member
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-500">
                      {g.complianceRate}
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
