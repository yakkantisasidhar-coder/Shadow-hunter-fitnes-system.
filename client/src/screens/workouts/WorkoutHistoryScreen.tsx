import React, { useEffect, useState } from 'react';
import { History, Flame, Clock, Dumbbell, Calendar, ArrowRight, Award } from 'lucide-react';
import { api } from '../../services/api';
import { WorkoutHistoryItem } from '../../types';

interface WorkoutHistoryScreenProps {
  onNavigate: (screen: string) => void;
}

export const WorkoutHistoryScreen: React.FC<WorkoutHistoryScreenProps> = ({ onNavigate }) => {
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [summary, setSummary] = useState<any>({
    totalWorkouts: 0,
    totalMinutes: 0,
    totalCalories: 0,
    totalVolume: 0
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.getWorkoutHistory();
        setHistory(res.history || []);
        if (res.summary) setSummary(res.summary);
      } catch (err) {
        console.error('Failed to load workout history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Training Session History
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Permanent, verifiable record of all completed workouts, total volume tonnage, and duration.
          </p>
        </div>

        <button
          onClick={() => onNavigate('workout-player')}
          className="px-4 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold"
        >
          + Log New Workout
        </button>
      </div>

      {/* Aggregate Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
            Total Sessions
          </span>
          <span className="text-2xl font-black text-primary dark:text-primary-light mt-1 block">
            {summary.totalWorkouts} Workouts
          </span>
          <span className="text-[11px] text-emerald-500 font-semibold mt-1 block">
            Consistent active cadence
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
            Time Under Tension
          </span>
          <span className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark mt-1 block">
            {summary.totalMinutes} Mins
          </span>
          <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark block mt-1">
            ~{(summary.totalMinutes / 60).toFixed(1)} Cumulative hours
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
            Estimated Calorie Burn
          </span>
          <span className="text-2xl font-black text-orange-500 mt-1 block">
            {summary.totalCalories} kcal
          </span>
          <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark block mt-1">
            Metabolic energy output
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
            Total Cumulative Volume
          </span>
          <span className="text-2xl font-black text-indigo-500 mt-1 block">
            {summary.totalVolume.toLocaleString()} kg
          </span>
          <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark block mt-1">
            Mass moved in compound sets
          </span>
        </div>
      </div>

      {/* History Log List */}
      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
          Completed Sessions
        </h3>

        {loading ? (
          <div className="text-center py-8 text-xs">Loading training logs...</div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold">
            No completed sessions recorded yet. Launch the player to start your first workout!
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-primary/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-primary dark:text-primary-light uppercase tracking-wider">
                    {new Date(item.completedAt).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">
                    &bull; {new Date(item.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h4 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                  {item.programTitle}
                </h4>
                <div className="flex items-center space-x-3 text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                  <span>{item.exercisesCount} Exercises</span>
                  <span>&bull;</span>
                  <span>{item.totalSets} Working Sets</span>
                  <span>&bull;</span>
                  <span>{item.totalVolumeKg.toLocaleString()} kg Volume</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 border-t md:border-t-0 pt-3 md:pt-0 border-surface-borderLight dark:border-surface-borderDark">
                <div className="text-right">
                  <div className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                    {item.durationMinutes} Mins
                  </div>
                  <div className="text-xs text-orange-500 font-bold">
                    ~{item.caloriesBurned} kcal
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary dark:text-primary-light flex items-center justify-center">
                  <Award size={18} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
