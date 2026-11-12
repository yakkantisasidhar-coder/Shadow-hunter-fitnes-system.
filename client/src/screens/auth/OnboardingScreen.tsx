import React, { useState } from 'react';
import { Check, ArrowRight, ArrowLeft, Target, Heart, Scale, Clock, MapPin, Dumbbell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { FitnessGoal, FitnessExperience, WorkoutLocation, ActivityLevel } from '../../types';

interface OnboardingScreenProps {
  onNavigate: (screen: string) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onNavigate }) => {
  const { user, updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form State
  const [age, setAge] = useState<number>(user?.age || 28);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [height, setHeight] = useState<number>(user?.height || 178);
  const [currentWeight, setCurrentWeight] = useState<number>(user?.currentWeight || 82);
  const [targetWeight, setTargetWeight] = useState<number>(user?.targetWeight || 78);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(user?.fitnessGoal || 'muscle_building');
  const [fitnessExperience, setFitnessExperience] = useState<FitnessExperience>(user?.fitnessExperience || 'intermediate');
  const [workoutLocation, setWorkoutLocation] = useState<WorkoutLocation>(user?.workoutLocation || 'gym');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(user?.activityLevel || 'moderately_active');
  const [availableWorkoutTime, setAvailableWorkoutTime] = useState<number>(user?.availableWorkoutTime || 45);
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>(['High-Protein']);

  const goalsList: { id: FitnessGoal; label: string; desc: string }[] = [
    { id: 'muscle_building', label: 'Muscle Building', desc: 'Hypertrophy and lean mass development' },
    { id: 'weight_loss', label: 'Weight Loss', desc: 'Caloric burn and metabolic fat reduction' },
    { id: 'strength_improvement', label: 'Strength Improvement', desc: 'Maximal compound pushing & pulling power' },
    { id: 'general_fitness', label: 'General Fitness', desc: 'Overall health, mobility and stamina' },
    { id: 'endurance', label: 'Endurance & Stamina', desc: 'Cardiovascular efficiency and stamina' },
    { id: 'flexibility', label: 'Flexibility & Mobility', desc: 'Joint health and full functional range' },
    { id: 'weight_maintenance', label: 'Weight Maintenance', desc: 'Sustaining balanced body composition' }
  ];

  const toggleDietPref = (pref: string) => {
    if (dietaryPrefs.includes(pref)) {
      setDietaryPrefs(dietaryPrefs.filter(p => p !== pref));
    } else {
      setDietaryPrefs([...dietaryPrefs, pref]);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await updateProfile({
        age,
        gender,
        height,
        currentWeight,
        targetWeight,
        fitnessGoal,
        fitnessExperience,
        workoutLocation,
        activityLevel,
        availableWorkoutTime,
        dietaryPreferences: dietaryPrefs
      });
      onNavigate('home');
    } catch (err) {
      console.error('Error saving onboarding data:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4">
      {/* Step Indicator Header */}
      <div className="mb-8 text-center">
        <span className="text-[10px] font-bold tracking-widest text-primary dark:text-primary-light uppercase">
          Step {step} of 4 • Personal Calibration
        </span>
        <h2 className="text-2xl font-black mt-1 text-textPrimary-light dark:text-textPrimary-dark">
          {step === 1 && 'Biometrics & Body Baseline'}
          {step === 2 && 'Primary Fitness Objectives'}
          {step === 3 && 'Training Location & Experience'}
          {step === 4 && 'Time & Nutrition Calibration'}
        </h2>
        <div className="flex justify-center space-x-2 mt-4">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-10 bg-primary'
                  : s < step
                  ? 'w-6 bg-primary/40'
                  : 'w-6 bg-surface-borderLight dark:bg-surface-borderDark'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#252330] rounded-3xl p-6 md:p-8 shadow-sm border border-surface-borderLight dark:border-surface-borderDark">
        {/* STEP 1: Biometrics */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold mb-2">Gender Category</label>
              <div className="grid grid-cols-3 gap-3">
                {(['male', 'female', 'other'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-3 rounded-2xl text-xs font-bold capitalize border transition-all ${
                      gender === g
                        ? 'border-primary bg-primary/10 text-primary dark:text-primary-light'
                        : 'border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">Age (Years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={e => setHeight(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">Current Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={currentWeight}
                  onChange={e => setCurrentWeight(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Target Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={targetWeight}
                  onChange={e => setTargetWeight(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Fitness Goals */}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mb-2">
              Select your primary fitness objective to calibrate your workout programming and daily nutritional targets:
            </p>
            <div className="grid grid-cols-1 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
              {goalsList.map(g => (
                <div
                  key={g.id}
                  onClick={() => setFitnessGoal(g.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    fitnessGoal === g.id
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-surface-borderLight dark:border-surface-borderDark hover:border-primary/50'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark">
                      {g.label}
                    </h4>
                    <p className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">
                      {g.desc}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      fitnessGoal === g.id
                        ? 'border-primary bg-primary text-white'
                        : 'border-surface-borderLight dark:border-surface-borderDark'
                    }`}
                  >
                    {fitnessGoal === g.id && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Experience & Location */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold mb-2">Fitness Experience</label>
              <div className="grid grid-cols-3 gap-3">
                {(['beginner', 'intermediate', 'advanced'] as const).map(exp => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => setFitnessExperience(exp)}
                    className={`py-3 px-2 rounded-2xl text-xs font-bold capitalize border text-center transition-all ${
                      fitnessExperience === exp
                        ? 'border-primary bg-primary/10 text-primary dark:text-primary-light'
                        : 'border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark'
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-2">Primary Training Location</label>
              <div className="grid grid-cols-3 gap-3">
                {(['home', 'gym', 'hybrid'] as const).map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setWorkoutLocation(loc)}
                    className={`py-3 px-2 rounded-2xl text-xs font-bold capitalize border text-center transition-all ${
                      workoutLocation === loc
                        ? 'border-primary bg-primary/10 text-primary dark:text-primary-light'
                        : 'border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark'
                    }`}
                  >
                    {loc === 'hybrid' ? 'Home & Gym' : `${loc} Workouts`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-2">Daily Physical Activity Level</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, minimal daily movement' },
                  { id: 'lightly_active', label: 'Lightly Active', desc: '1-3 light sessions / week' },
                  { id: 'moderately_active', label: 'Moderately Active', desc: '3-5 dedicated sessions / week' },
                  { id: 'very_active', label: 'Very Active', desc: '6+ hard sessions or physical job' }
                ].map(act => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setActivityLevel(act.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      activityLevel === act.id
                        ? 'border-primary bg-primary/10 text-primary dark:text-primary-light font-bold'
                        : 'border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark'
                    }`}
                  >
                    <div className="font-bold text-xs">{act.label}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{act.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Available Time & Dietary Preferences */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold">Target Workout Duration</label>
                <span className="text-xs font-extrabold text-primary dark:text-primary-light">
                  {availableWorkoutTime} Minutes / Session
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="90"
                step="5"
                value={availableWorkoutTime}
                onChange={e => setAvailableWorkoutTime(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-surface-mutedLight dark:text-surface-mutedDark mt-1">
                <span>20 min (Express)</span>
                <span>45 min (Standard)</span>
                <span>90 min (Extended)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-2">Dietary Preferences (Optional)</label>
              <div className="flex flex-wrap gap-2">
                {['High-Protein', 'Low-Carb', 'Keto', 'Vegetarian', 'Vegan', 'Intermittent Fasting', 'Mediterranean', 'Gluten-Free'].map(pref => {
                  const selected = dietaryPrefs.includes(pref);
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => toggleDietPref(pref)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        selected
                          ? 'border-primary bg-primary text-white shadow-sm'
                          : 'border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark hover:border-primary/50'
                      }`}
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-surface-borderLight dark:border-surface-borderDark">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold flex items-center space-x-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center space-x-1.5 transition-transform active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={handleFinish}
              className="px-8 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center space-x-1.5 transition-transform active:scale-95 disabled:opacity-50"
            >
              <span>{saving ? 'Calibrating Plan...' : 'Complete Profile'}</span>
              <Check size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
