import React, { useEffect, useState } from 'react';
import { Award, Flame, Dumbbell, Zap, Trophy, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import { AchievementBadge } from '../../types';

interface AchievementsScreenProps {
  onNavigate: (screen: string) => void;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ onNavigate }) => {
  const [achievements, setAchievements] = useState<AchievementBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await api.getAchievements();
        setAchievements(res.achievements || []);
      } catch (err) {
        console.error('Failed to load achievements:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return Flame;
      case 'Dumbbell': return Dumbbell;
      case 'Zap': return Zap;
      default: return Trophy;
    }
  };

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <button
            onClick={() => onNavigate('challenges')}
            className="flex items-center space-x-1.5 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Challenges</span>
          </button>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Verified Athletic Achievements
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Certified honors awarded exclusively for real-world physical training compliance and volume milestones.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary dark:text-primary-light text-xs font-black">
          {unlockedCount} of {achievements.length} Badges Unlocked
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {achievements.map((badge) => {
          const Icon = getIcon(badge.icon);
          return (
            <div
              key={badge.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                badge.isUnlocked
                  ? 'bg-white dark:bg-[#252330] border-surface-borderLight dark:border-surface-borderDark shadow-sm'
                  : 'bg-surface-light/50 dark:bg-[#1a1824]/50 border-dashed border-surface-borderLight dark:border-surface-borderDark opacity-60'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      badge.isUnlocked
                        ? 'bg-gradient-to-tr from-primary to-secondary text-white shadow-lg shadow-primary/25'
                        : 'bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark'
                    }`}
                  >
                    <Icon size={24} />
                  </div>
                  {badge.isUnlocked ? (
                    <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-500">
                      <CheckCircle2 size={16} />
                    </span>
                  ) : (
                    <Lock size={16} className="text-surface-mutedLight dark:text-surface-mutedDark" />
                  )}
                </div>

                <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                  {badge.title}
                </h4>
                <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-borderLight dark:border-surface-borderDark text-[10px] font-bold">
                {badge.isUnlocked ? (
                  <span className="text-emerald-500">
                    Unlocked on {new Date(badge.unlockedAt || '').toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-surface-mutedLight dark:text-surface-mutedDark">
                    In Progress &bull; Requirements Not Met
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
