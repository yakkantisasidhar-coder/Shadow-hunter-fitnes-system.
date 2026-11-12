import React, { useEffect, useState } from 'react';
import { Search, Filter, Dumbbell, ChevronRight, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { Exercise, MuscleGroup } from '../../types';

interface ExerciseLibraryScreenProps {
  onNavigate: (screen: string, exerciseId?: string) => void;
}

export const ExerciseLibraryScreen: React.FC<ExerciseLibraryScreenProps> = ({ onNavigate }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const muscleGroups: string[] = [
    'All',
    'Chest',
    'Back',
    'Shoulders',
    'Biceps',
    'Triceps',
    'Legs',
    'Abs',
    'Glutes',
    'Cardio',
    'Stretching'
  ];

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const res = await api.getExercises({
          muscleGroup: selectedMuscle !== 'All' ? selectedMuscle : undefined,
          search: search || undefined
        });
        setExercises(res.exercises || []);
      } catch (err) {
        console.error('Error fetching exercises:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, [selectedMuscle, search]);

  return (
    <div className="space-y-6">
      {/* Search & Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Exercise Library
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Master exercise technique with biomechanical cues, target muscle breakdowns, and safety tips.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[280px]">
          <Search className="absolute left-3 top-2.5 text-surface-mutedLight dark:text-surface-mutedDark" size={17} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercise, muscle, equipment..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      {/* Muscle Group Horizontal Pill Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {muscleGroups.map((muscle) => {
          const isSelected = selectedMuscle === muscle;
          return (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105'
                  : 'bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark hover:border-primary/40'
              }`}
            >
              {muscle}
            </button>
          );
        })}
      </div>

      {/* Exercises Grid */}
      {loading ? (
        <div className="text-center py-12 text-surface-mutedLight dark:text-surface-mutedDark text-xs">
          Loading exercise catalogue...
        </div>
      ) : exercises.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark">
          <Dumbbell className="mx-auto mb-2 text-surface-mutedLight dark:text-surface-mutedDark" size={32} />
          <p className="text-xs font-bold">No exercises found matching your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              onClick={() => onNavigate('exercise-details', ex.id)}
              className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary/60 cursor-pointer transition-all shadow-sm flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary dark:text-primary-light uppercase">
                    {ex.muscleGroup}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                    ex.difficulty === 'Beginner' ? 'text-emerald-500 bg-emerald-500/10' :
                    ex.difficulty === 'Intermediate' ? 'text-amber-500 bg-amber-500/10' :
                    'text-rose-500 bg-rose-500/10'
                  }`}>
                    {ex.difficulty}
                  </span>
                </div>

                <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark group-hover:text-primary transition-colors">
                  {ex.name}
                </h4>
                <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1 line-clamp-2">
                  {ex.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark">
                    {ex.equipment}
                  </span>
                  {ex.secondaryMuscles?.slice(0, 2).map((m, i) => (
                    <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark">
                      +{m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between text-xs text-primary dark:text-primary-light font-bold">
                <span>{ex.defaultSets} Sets &bull; {ex.defaultReps} Reps</span>
                <div className="flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                  <span>View Technique</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
