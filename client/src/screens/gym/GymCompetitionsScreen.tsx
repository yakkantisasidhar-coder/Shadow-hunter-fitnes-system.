import React, { useEffect, useState } from 'react';
import { Trophy, Award, Calendar, ArrowLeft, Users, Flame } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { GymCompetition } from '../../types';

interface GymCompetitionsScreenProps {
  onNavigate: (screen: string) => void;
}

export const GymCompetitionsScreen: React.FC<GymCompetitionsScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState<GymCompetition[]>([]);
  const [loading, setLoading] = useState(true);

  const gymId = user?.gymId || 'gym-apex-1';

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const res = await api.getGymDetails(gymId);
        setCompetitions(res.competitions || []);
      } catch (err) {
        console.error('Failed to load gym competitions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompetitions();
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <button
            onClick={() => onNavigate('gym')}
            className="flex items-center space-x-1.5 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Gym Hub</span>
          </button>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Gym Competitions & Tournaments
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Fair competitive rankings based on verified workout attendance, time under tension, and cumulative compound volume.
          </p>
        </div>

        <button
          onClick={() => onNavigate('leaderboards')}
          className="px-4 py-2.5 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          Global Leaderboards
        </button>
      </div>

      {/* Competitions Grid */}
      <div className="grid grid-cols-1 gap-6">
        {competitions.map((comp) => (
          <div
            key={comp.id}
            className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-6"
          >
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 uppercase tracking-wider">
                    Active Tournament
                  </span>
                  <span className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                    Ends Nov 30, 2026
                  </span>
                </div>
                <h3 className="text-xl font-black text-textPrimary-light dark:text-textPrimary-dark mt-1">
                  {comp.title}
                </h3>
                <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">
                  {comp.description}
                </p>
              </div>

              <span className="px-4 py-2 rounded-2xl bg-primary/10 text-primary dark:text-primary-light text-xs font-bold">
                Metric: Verified Training Minutes
              </span>
            </div>

            {/* Standings Table */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark mb-3">
                Tournament Standings
              </h4>
              <div className="divide-y divide-surface-borderLight dark:divide-surface-borderDark bg-surface-light dark:bg-[#1b1926] rounded-2xl overflow-hidden border border-surface-borderLight dark:border-surface-borderDark">
                {comp.participants.map((p) => (
                  <div key={p.userId} className="p-4 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black ${
                          p.rank === 1
                            ? 'bg-amber-500 text-white'
                            : p.rank === 2
                            ? 'bg-slate-400 text-white'
                            : p.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-black/10 dark:bg-white/10 text-surface-mutedLight dark:text-surface-mutedDark'
                        }`}
                      >
                        {p.rank}
                      </span>
                      <span className="font-bold text-textPrimary-light dark:text-textPrimary-dark">
                        {p.userName}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-primary dark:text-primary-light text-sm">
                        {p.score} Mins
                      </span>
                      <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark block">
                        Verified Attendance
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
