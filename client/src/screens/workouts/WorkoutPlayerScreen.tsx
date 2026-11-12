import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Check, 
  RotateCcw, 
  Flame, 
  Dumbbell, 
  Trophy, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  ArrowLeft 
} from 'lucide-react';
import { api } from '../../services/api';
import { Exercise } from '../../types';

interface WorkoutPlayerScreenProps {
  onNavigate: (screen: string) => void;
  programId?: string;
}

export const WorkoutPlayerScreen: React.FC<WorkoutPlayerScreenProps> = ({ onNavigate }) => {
  // Demo Workout Routine
  const workoutRoutine = [
    {
      name: 'Barbell Flat Bench Press',
      muscle: 'Chest',
      sets: 4,
      reps: 8,
      restSeconds: 60,
      equipment: 'Barbell, Bench',
      cue: 'Scapular retraction, drive through palms, lower with control.'
    },
    {
      name: 'Bent-Over Barbell Row',
      muscle: 'Back',
      sets: 4,
      reps: 8,
      restSeconds: 60,
      equipment: 'Barbell',
      cue: 'Hinge hips 45 degrees, pull barbell to lower ribcage.'
    },
    {
      name: 'Incline Dumbbell Press (30°)',
      muscle: 'Upper Chest',
      sets: 3,
      reps: 10,
      restSeconds: 60,
      equipment: 'Dumbbells, Bench',
      cue: 'Press in slight inward arc, stretch clavicular fibers at the bottom.'
    },
    {
      name: 'Standing Barbell Bicep Curl',
      muscle: 'Biceps',
      sets: 3,
      reps: 12,
      restSeconds: 45,
      equipment: 'EZ-Bar / Barbell',
      cue: 'Pin elbows to sides, full contraction at top without hip swing.'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(60);
  const [workoutSeconds, setWorkoutSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});

  const currentExercise = workoutRoutine[currentIndex];

  // Beep Sound Synthesizer via Web Audio API (zero external asset dependency!)
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 chime
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      // Audio context fallback
    }
  };

  // Workout Session Stopwatch Timer
  useEffect(() => {
    let interval: any = null;
    if (!isPaused && !isCompleted) {
      interval = setInterval(() => {
        setWorkoutSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, isCompleted]);

  // Rest Timer Interval
  useEffect(() => {
    let interval: any = null;
    if (isResting && !isPaused && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => prev - 1);
      }, 1000);
    } else if (isResting && restTimer === 0) {
      setIsResting(false);
      playChime();
    }
    return () => clearInterval(interval);
  }, [isResting, isPaused, restTimer]);

  const handleCompleteSet = () => {
    const key = `${currentIndex}-${currentSet}`;
    setCompletedSets(prev => ({ ...prev, [key]: true }));

    if (currentSet < currentExercise.sets) {
      setCurrentSet(prev => prev + 1);
      setRestTimer(currentExercise.restSeconds);
      setIsResting(true);
      playChime();
    } else {
      // Completed all sets for this exercise
      if (currentIndex < workoutRoutine.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setCurrentSet(1);
        setRestTimer(currentExercise.restSeconds);
        setIsResting(true);
        playChime();
      } else {
        handleFinishWorkout();
      }
    }
  };

  const handleNextExercise = () => {
    if (currentIndex < workoutRoutine.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentSet(1);
      setIsResting(false);
    }
  };

  const handlePrevExercise = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setCurrentSet(1);
      setIsResting(false);
    }
  };

  const handleFinishWorkout = async () => {
    setIsCompleted(true);
    const durationMin = Math.max(1, Math.round(workoutSeconds / 60));
    try {
      await api.logWorkout({
        programTitle: 'Upper / Lower Hypertrophy Split',
        durationMinutes: durationMin,
        caloriesBurned: Math.round(durationMin * 8.5),
        exercisesCount: workoutRoutine.length,
        totalSets: 14,
        totalVolumeKg: 3840
      });
    } catch (err) {
      console.error('Error logging workout history:', err);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isCompleted) {
    const totalMins = Math.max(1, Math.round(workoutSeconds / 60));
    return (
      <div className="max-w-lg mx-auto py-8 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white mx-auto shadow-2xl shadow-primary/40 animate-bounce">
          <Trophy size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Session Completed!
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Excellent effort. Your training metrics have been permanently recorded to your athlete profile.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <div>
            <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark uppercase font-bold block">
              Active Time
            </span>
            <span className="text-lg font-black text-primary dark:text-primary-light">
              {formatTime(workoutSeconds)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark uppercase font-bold block">
              Calories Burned
            </span>
            <span className="text-lg font-black text-orange-500">
              ~{Math.round(totalMins * 8.5)} kcal
            </span>
          </div>
          <div>
            <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark uppercase font-bold block">
              Drills Done
            </span>
            <span className="text-lg font-black text-emerald-500">
              {workoutRoutine.length} / {workoutRoutine.length}
            </span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => onNavigate('workout-history')}
            className="flex-1 py-3 rounded-2xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
          >
            Review History
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="flex-1 py-3 rounded-2xl gradient-btn-primary text-white text-xs font-bold"
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Top Session Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('workouts')}
          className="flex items-center space-x-1 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Exit Player</span>
        </button>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary"
            title={soundEnabled ? 'Mute Chimes' : 'Unmute Chimes'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <div className="text-sm font-black font-mono px-3 py-1 rounded-xl bg-surface-light dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-primary dark:text-primary-light">
            {formatTime(workoutSeconds)}
          </div>
        </div>
      </div>

      {/* Main Exercise Card */}
      <div className="rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark p-6 md:p-8 shadow-sm space-y-6">
        {/* Progress Dots */}
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-wider text-primary dark:text-primary-light">
            Exercise {currentIndex + 1} of {workoutRoutine.length}
          </span>
          <div className="flex space-x-1.5">
            {workoutRoutine.map((_, idx) => (
              <div
                key={idx}
                className={`w-2.5 h-2.5 rounded-full ${
                  idx === currentIndex
                    ? 'bg-primary ring-2 ring-primary/40'
                    : idx < currentIndex
                    ? 'bg-emerald-500'
                    : 'bg-surface-borderLight dark:bg-surface-borderDark'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Exercise Title and Demonstration Visual */}
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary dark:text-primary-light uppercase">
            {currentExercise.muscle}
          </span>
          <h2 className="text-xl md:text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark mt-1">
            {currentExercise.name}
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            {currentExercise.cue}
          </p>
        </div>

        {/* Visual Animation Simulator */}
        <div className="h-44 rounded-2xl bg-gradient-to-b from-surface-light dark:from-[#1b1926] to-transparent border border-surface-borderLight dark:border-surface-borderDark flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <Dumbbell
            size={52}
            className={`text-primary transition-all duration-700 ${
              !isPaused ? 'animate-pulse scale-110' : 'opacity-50'
            }`}
          />
          <span className="text-[11px] font-bold uppercase tracking-widest text-surface-mutedLight dark:text-surface-mutedDark mt-3">
            Reps In Motion • Tempo: 2-0-1-0
          </span>
        </div>

        {/* Set Matrix */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark mb-1">
            <span>Current Working Set</span>
            <span>Target: {currentExercise.reps} Reps</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: currentExercise.sets }).map((_, sIdx) => {
              const setNum = sIdx + 1;
              const isDone = completedSets[`${currentIndex}-${setNum}`];
              const isCurrent = setNum === currentSet;

              return (
                <div
                  key={sIdx}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                      : isCurrent
                      ? 'border-primary bg-primary/10 text-primary dark:text-primary-light font-black shadow-sm'
                      : 'border-surface-borderLight dark:border-surface-borderDark opacity-50'
                  }`}
                >
                  <span className="text-[10px] block uppercase font-bold">Set {setNum}</span>
                  <span className="text-sm font-black">
                    {isDone ? 'Done' : `${currentExercise.reps} Reps`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rest Timer Overlay / Callout */}
        {isResting && (
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between animate-pulse">
            <div>
              <span className="text-xs font-bold text-blue-500 block uppercase">Rest Interval</span>
              <span className="text-2xl font-black font-mono text-blue-500">{restTimer}s</span>
            </div>
            <button
              onClick={() => setIsResting(false)}
              className="px-3 py-1.5 rounded-xl bg-blue-500 text-white text-xs font-bold"
            >
              Skip Rest
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleCompleteSet}
            className="w-full py-3.5 rounded-2xl gradient-btn-primary text-white font-bold text-sm flex items-center justify-center space-x-2 transition-transform active:scale-95 shadow-lg shadow-primary/25"
          >
            <Check size={18} strokeWidth={3} />
            <span>Complete Set {currentSet} of {currentExercise.sets}</span>
          </button>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrevExercise}
              disabled={currentIndex === 0}
              className="flex-1 py-2.5 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold flex items-center justify-center space-x-1.5 disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <SkipBack size={15} />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-4 py-2.5 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5"
            >
              {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} />}
            </button>

            <button
              onClick={handleNextExercise}
              disabled={currentIndex === workoutRoutine.length - 1}
              className="flex-1 py-2.5 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold flex items-center justify-center space-x-1.5 disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span>Next Drill</span>
              <SkipForward size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
