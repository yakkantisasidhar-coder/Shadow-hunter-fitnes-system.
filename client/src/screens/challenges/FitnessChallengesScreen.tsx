import React, { useEffect, useState } from 'react';
import { Trophy, Award, CheckCircle2, Flame, Users, Calendar, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { FitnessChallenge } from '../../types';

interface FitnessChallengesScreenProps {
  onNavigate: (screen: string) => void;
}

export const FitnessChallengesScreen: React.FC<FitnessChallengesScreenProps> = ({ onNavigate }) => {
  const [challenges, setChallenges] = useState<FitnessChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');

  const fetchChallenges = async () => {
    try {
      const res = await api.getChallenges();
      setChallenges(res.challenges || []);
    } catch (err) {
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleJoin = async (id: string) => {
    try {
      await api.joinChallenge(id);
      fetchChallenges();
    } catch (err) {
      console.error('Error joining challenge:', err);
    }
  };

  const filtered = selectedFilter === 'all'
    ? challenges
    : challenges.filter(c => c.category === selectedFilter);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Fitness Challenges & Milestones
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Test your physical discipline across daily consistency, weekly volume thresholds, and monthly goals.
          </p>
        </div>

        <button
          onClick={() => onNavigate('achievements')}
          className="px-4 py-2.5 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold flex items-center space-x-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <Award size={16} />
          <span>View Unlocked Badges</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2">
        {(['all', 'daily', 'weekly', 'monthly'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
              selectedFilter === cat
                ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105'
                : 'bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark hover:border-primary/40'
            }`}
          >
            {cat} Challenges
          </button>
        ))}
      </div>

      {/* Challenges Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((chal) => (
          <div
            key={chal.id}
            className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary dark:text-primary-light">
                  {chal.category}
                </span>
                <span className="text-[11px] font-bold text-surface-mutedLight dark:text-surface-mutedDark flex items-center space-x-1">
                  <Users size={12} />
                  <span>{chal.participantsCount} Athletes</span>
                </span>
              </div>

              <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                {chal.title}
              </h3>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1 leading-relaxed">
                {chal.description}
              </p>

              <div className="mt-4 p-3 rounded-2xl bg-surface-light dark:bg-[#1b1926] flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">Target Objective</span>
                  <span className="font-extrabold text-textPrimary-light dark:text-textPrimary-dark">{chal.targetGoal}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">Honor Reward</span>
                  <span className="font-extrabold text-amber-500">{chal.badgeName}</span>
                </div>
              </div>

              {chal.joined && (
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span>Progress</span>
                    <span className="text-primary dark:text-primary-light">{chal.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-surface-light dark:bg-[#1b1926] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${chal.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {chal.joined ? (
              <div className="py-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center justify-center space-x-1.5">
                <CheckCircle2 size={15} />
                <span>Active & Competing</span>
              </div>
            ) : (
              <button
                onClick={() => handleJoin(chal.id)}
                className="w-full py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold transition-transform active:scale-95"
              >
                Join Challenge
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
