import React, { useEffect, useState } from 'react';
import { Dumbbell, Library, Flame, History, Play, ArrowRight, Clock, Target } from 'lucide-react';
import { api } from '../../services/api';
import { WorkoutProgram, Exercise } from '../../types';

interface WorkoutDashboardScreenProps {
  onNavigate: (screen: string, param?: string) => void;
}

export const WorkoutDashboardScreen: React.FC<WorkoutDashboardScreenProps> = ({ onNavigate }) => {
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [progRes, exRes] = await Promise.all([
          api.getPrograms(),
          api.getExercises()
        ]);
        setPrograms(progRes.programs || []);
        setExercises(exRes.exercises || []);
      } catch (err) {
        console.error('Failed to load workouts data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Workout Training Hub
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Personalized periodized training splits, interactive exercise demonstrations, and session tracking.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('workout-player')}
            className="px-4 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center space-x-1.5"
          >
            <Play size={15} fill="currentColor" />
            <span>Launch Player</span>
          </button>
        </div>
      </div>

      {/* Module Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('exercises')}
          className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary cursor-pointer transition-all shadow-sm group"
        >
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary dark:text-primary-light flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Library size={20} />
          </div>
          <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
            Exercise Library
          </h3>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Browse {exercises.length}+ muscle-targeted exercises with form cues and safety tips.
          </p>
        </div>

        <div
          onClick={() => onNavigate('programs')}
          className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary cursor-pointer transition-all shadow-sm group"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Flame size={20} />
          </div>
          <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
            Training Programs
          </h3>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Structured 4 to 12-week splits for Hypertrophy, Strength, and Fat Loss.
          </p>
        </div>

        <div
          onClick={() => onNavigate('workout-history')}
          className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary cursor-pointer transition-all shadow-sm group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <History size={20} />
          </div>
          <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
            Workout History
          </h3>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Review completed workouts, tonnage volume, and duration trends.
          </p>
        </div>
      </div>

      {/* Featured Programs Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
            Recommended Programs
          </h3>
          <button
            onClick={() => onNavigate('programs')}
            className="text-xs font-bold text-primary dark:text-primary-light hover:underline flex items-center space-x-1"
          >
            <span>View All Programs</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.slice(0, 3).map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary dark:text-primary-light uppercase">
                    {p.category}
                  </span>
                  <span className="text-[11px] font-semibold text-surface-mutedLight dark:text-surface-mutedDark">
                    {p.durationWeeks} Weeks
                  </span>
                </div>
                <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                  {p.title}
                </h4>
                <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1 line-clamp-2">
                  {p.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between">
                <span className="text-[11px] font-bold text-surface-mutedLight dark:text-surface-mutedDark">
                  {p.daysPerWeek} Days / Week
                </span>
                <button
                  onClick={() => onNavigate('workout-player')}
                  className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors"
                >
                  Start Routine
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
