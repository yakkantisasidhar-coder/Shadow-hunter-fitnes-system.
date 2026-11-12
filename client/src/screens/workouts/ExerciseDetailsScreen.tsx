import React, { useEffect, useState } from 'react';
import { ArrowLeft, Play, ShieldAlert, CheckCircle2, Dumbbell, Clock, Flame } from 'lucide-react';
import { api } from '../../services/api';
import { Exercise } from '../../types';

interface ExerciseDetailsScreenProps {
  exerciseId?: string;
  onNavigate: (screen: string) => void;
}

export const ExerciseDetailsScreen: React.FC<ExerciseDetailsScreenProps> = ({ exerciseId, onNavigate }) => {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const id = exerciseId || 'ex-barbell-bench-press';
        const res = await api.getExercise(id);
        setExercise(res.exercise);
      } catch (err) {
        console.error('Failed to load exercise details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [exerciseId]);

  if (loading) {
    return <div className="text-center py-12 text-xs">Loading exercise details...</div>;
  }

  if (!exercise) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-xs">Exercise not found.</p>
        <button onClick={() => onNavigate('exercises')} className="text-xs font-bold text-primary">
          Back to Library
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top back navigation */}
      <button
        onClick={() => onNavigate('exercises')}
        className="flex items-center space-x-1.5 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Return to Exercise Library</span>
      </button>

      {/* Hero Visual Demo Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e1a2f] to-[#121019] text-white p-6 md:p-8 border border-primary/20 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white uppercase tracking-wider">
                {exercise.muscleGroup}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/90">
                {exercise.difficulty}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black">{exercise.name}</h2>
            <p className="text-xs md:text-sm text-white/80 max-w-xl">{exercise.description}</p>
          </div>

          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <Dumbbell size={48} className="text-primary-light mb-2 animate-bounce" />
            <span className="text-xs font-bold tracking-wider text-white uppercase">Form Demonstration</span>
            <span className="text-[10px] text-white/60">Biomechanical Path Vector</span>
          </div>
        </div>

        {/* Quick Parameters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <span className="text-[10px] text-white/60 uppercase block">Default Sets</span>
            <span className="text-base font-extrabold">{exercise.defaultSets} Working Sets</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <span className="text-[10px] text-white/60 uppercase block">Rep Target</span>
            <span className="text-base font-extrabold">{exercise.defaultReps} Repetitions</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <span className="text-[10px] text-white/60 uppercase block">Rest Interval</span>
            <span className="text-base font-extrabold">{exercise.defaultRestSeconds} Seconds</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <span className="text-[10px] text-white/60 uppercase block">Equipment</span>
            <span className="text-base font-extrabold">{exercise.equipment}</span>
          </div>
        </div>
      </div>

      {/* Step by Step Execution & Safety Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step Instructions */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
          <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
            Step-by-Step Movement Execution
          </h3>
          <div className="space-y-3">
            {exercise.instructions.map((inst, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3 rounded-2xl bg-surface-light dark:bg-[#1b1926]">
                <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs text-textPrimary-light dark:text-textPrimary-dark font-medium leading-relaxed">
                  {inst}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <button
              onClick={() => onNavigate('workout-player')}
              className="w-full py-3 rounded-2xl gradient-btn-primary text-white text-xs font-bold flex items-center justify-center space-x-2"
            >
              <Play size={16} fill="currentColor" />
              <span>Practice in Live Workout Player</span>
            </button>
          </div>
        </div>

        {/* Muscular Focus & Safety Guidelines */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
              Target Muscle Focus
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <span className="text-[10px] uppercase font-bold text-primary dark:text-primary-light block">Primary Driver</span>
                <span className="text-xs font-black text-textPrimary-light dark:text-textPrimary-dark">{exercise.muscleGroup}</span>
              </div>
              {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                <div className="p-3 rounded-xl bg-surface-light dark:bg-[#1b1926]">
                  <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">Synergist / Secondary</span>
                  <span className="text-xs font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                    {exercise.secondaryMuscles.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-rose-500">
              <ShieldAlert size={18} />
              <h4 className="text-xs font-black uppercase tracking-wider">
                Safety & Injury Prevention
              </h4>
            </div>
            <ul className="space-y-2">
              {exercise.safetyTips.map((tip, idx) => (
                <li key={idx} className="text-xs text-surface-mutedLight dark:text-surface-mutedDark flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">&bull;</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
