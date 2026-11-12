import React, { useEffect, useState } from 'react';
import { Flame, Play, Clock, Calendar, Dumbbell } from 'lucide-react';
import { api } from '../../services/api';
import { WorkoutProgram } from '../../types';

interface WorkoutProgramsScreenProps {
  onNavigate: (screen: string, programId?: string) => void;
}

export const WorkoutProgramsScreen: React.FC<WorkoutProgramsScreenProps> = ({ onNavigate }) => {
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);

  const categories = [
    'All',
    'Beginner',
    'Intermediate',
    'Advanced',
    'Muscle Building',
    'Weight Loss',
    'Home',
    'Full Body'
  ];

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      try {
        const res = await api.getPrograms(selectedCategory !== 'All' ? selectedCategory : undefined);
        setPrograms(res.programs || []);
      } catch (err) {
        console.error('Failed to load programs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, [selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
          Periodized Training Programs
        </h2>
        <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
          Scientifically calibrated multi-week workout splits tailored for hypertrophy, strength, or metabolic conditioning.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105'
                  : 'bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark hover:border-primary/40'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Programs List */}
      {loading ? (
        <div className="text-center py-12 text-xs">Loading training programs...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog) => (
            <div
              key={prog.id}
              className="rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm overflow-hidden flex flex-col justify-between group"
            >
              {/* Program Cover Card Header */}
              <div className={`p-6 bg-gradient-to-tr ${prog.coverGradient} text-white`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white/20 backdrop-blur-md uppercase tracking-wider">
                    {prog.category}
                  </span>
                  <span className="text-xs font-bold bg-black/20 px-2 py-0.5 rounded backdrop-blur-sm">
                    {prog.difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-black leading-tight mt-1">{prog.title}</h3>
              </div>

              {/* Body Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark leading-relaxed">
                  {prog.description}
                </p>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-surface-borderLight dark:border-surface-borderDark text-center">
                  <div>
                    <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark uppercase block">Duration</span>
                    <span className="text-xs font-black">{prog.durationWeeks} Weeks</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark uppercase block">Frequency</span>
                    <span className="text-xs font-black">{prog.daysPerWeek} Days/Wk</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark uppercase block">Exercises</span>
                    <span className="text-xs font-black">{prog.exercises.length} Drills</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('workout-player', prog.id)}
                  className="w-full py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-transform active:scale-95"
                >
                  <Play size={14} fill="currentColor" />
                  <span>Start Routine in Player</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
