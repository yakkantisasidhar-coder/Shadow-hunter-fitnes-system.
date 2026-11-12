import React, { useState } from 'react';
import { ArrowLeft, User, Sparkles, Activity, ShieldAlert, Sliders } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BodyVisualizerScreenProps {
  onNavigate: (screen: string) => void;
}

export const BodyVisualizerScreen: React.FC<BodyVisualizerScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [modelGender, setModelGender] = useState<'male' | 'female'>('male');
  const [selectedMuscleZone, setSelectedMuscleZone] = useState<string>('Pectorals');
  const [comparisonMode, setComparisonMode] = useState<'current' | 'target'>('current');

  const muscleZones: Record<string, { desc: string; currentCm: string; targetCm: string; focusExercises: string[] }> = {
    'Pectorals': {
      desc: 'Clavicular & sternocostal pectoral mass',
      currentCm: '108 cm',
      targetCm: '111 cm (+3 cm)',
      focusExercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Weighted Dips']
    },
    'Abdominals / Core': {
      desc: 'Rectus abdominis & transverse core wall',
      currentCm: '83 cm',
      targetCm: '79 cm (-4 cm)',
      focusExercises: ['Hanging Leg Raises', 'Plank Holds', 'Cable Woodchoppers']
    },
    'Deltoids': {
      desc: 'Anterior, lateral & posterior shoulder caps',
      currentCm: '39.5 cm',
      targetCm: '41 cm (+1.5 cm)',
      focusExercises: ['Overhead Strict Press', 'Lateral Dumbbell Raises', 'Face Pulls']
    },
    'Quadriceps & Glutes': {
      desc: 'Vastus lateralis, rectus femoris & gluteal complex',
      currentCm: '62 cm',
      targetCm: '64 cm (+2 cm)',
      focusExercises: ['Barbell Back Squats', 'Bulgarian Split Squats', 'Barbell Hip Thrusts']
    },
    'Latissimus Dorsi': {
      desc: 'Upper back V-taper lat width & thickness',
      currentCm: 'Wide V-Taper',
      targetCm: 'Enhanced Width',
      focusExercises: ['Wide-Grip Lat Pulldowns', 'Bent-Over Barbell Rows', 'Pull-Ups']
    }
  };

  const activeZoneData = muscleZones[selectedMuscleZone] || muscleZones['Pectorals'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => onNavigate('progress')}
          className="flex items-center space-x-1.5 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary mb-2 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Progress Dashboard</span>
        </button>
        <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
          Biomechanical Body Recomposition Visualizer
        </h2>
        <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
          Approximate digital representation of anatomical muscular density and target waist-to-shoulder ratios.
        </p>
      </div>

      {/* Model Controls Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        {/* Gender Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark">Anatomy Model:</span>
          <button
            onClick={() => setModelGender('male')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              modelGender === 'male'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark'
            }`}
          >
            Male Physique
          </button>
          <button
            onClick={() => setModelGender('female')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              modelGender === 'female'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark'
            }`}
          >
            Female Physique
          </button>
        </div>

        {/* Current vs Target Switch */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setComparisonMode('current')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              comparisonMode === 'current'
                ? 'bg-primary/20 text-primary dark:text-primary-light border border-primary/30'
                : 'text-surface-mutedLight dark:text-surface-mutedDark'
            }`}
          >
            Current State ({user?.currentWeight || 84} kg)
          </button>
          <button
            onClick={() => setComparisonMode('target')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              comparisonMode === 'target'
                ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                : 'text-surface-mutedLight dark:text-surface-mutedDark'
            }`}
          >
            Target Goal ({user?.targetWeight || 80} kg)
          </button>
        </div>
      </div>

      {/* Visual Model Canvas & Zone Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interactive Anatomy Canvas */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col items-center justify-center relative overflow-hidden min-h-[380px]">
          {/* Stylized Vector Silhouette */}
          <div className="relative w-48 h-80 flex items-center justify-center">
            {/* SVG Human Figure Schematic */}
            <svg viewBox="0 0 100 200" className="w-full h-full text-primary drop-shadow-lg">
              {/* Head */}
              <circle cx="50" cy="20" r="12" fill="currentColor" opacity="0.3" />
              {/* Shoulders */}
              <path
                d="M26,38 Q50,33 74,38 L80,60 L68,62 L60,45 L40,45 L32,62 L20,60 Z"
                fill={selectedMuscleZone === 'Deltoids' ? '#7651D5' : 'currentColor'}
                opacity={selectedMuscleZone === 'Deltoids' ? '0.9' : '0.4'}
                className="cursor-pointer hover:opacity-100 transition-opacity"
                onClick={() => setSelectedMuscleZone('Deltoids')}
              />
              {/* Chest */}
              <path
                d="M32,45 Q50,42 68,45 L65,72 Q50,75 35,72 Z"
                fill={selectedMuscleZone === 'Pectorals' ? '#7651D5' : 'currentColor'}
                opacity={selectedMuscleZone === 'Pectorals' ? '0.9' : '0.4'}
                className="cursor-pointer hover:opacity-100 transition-opacity"
                onClick={() => setSelectedMuscleZone('Pectorals')}
              />
              {/* Core / Abs */}
              <path
                d="M36,73 Q50,75 64,73 L62,105 Q50,108 38,105 Z"
                fill={selectedMuscleZone === 'Abdominals / Core' ? '#10b981' : 'currentColor'}
                opacity={selectedMuscleZone === 'Abdominals / Core' ? '0.9' : '0.35'}
                className="cursor-pointer hover:opacity-100 transition-opacity"
                onClick={() => setSelectedMuscleZone('Abdominals / Core')}
              />
              {/* Upper Legs / Quads */}
              <path
                d="M32,108 L48,108 L45,160 L32,160 Z M52,108 L68,108 L68,160 L55,160 Z"
                fill={selectedMuscleZone === 'Quadriceps & Glutes' ? '#7651D5' : 'currentColor'}
                opacity={selectedMuscleZone === 'Quadriceps & Glutes' ? '0.9' : '0.35'}
                className="cursor-pointer hover:opacity-100 transition-opacity"
                onClick={() => setSelectedMuscleZone('Quadriceps & Glutes')}
              />
              {/* Calves */}
              <path d="M33,162 L44,162 L42,195 L34,195 Z M56,162 L67,162 L66,195 L58,195 Z" fill="currentColor" opacity="0.25" />
            </svg>
          </div>

          <span className="text-[11px] font-bold text-surface-mutedLight dark:text-surface-mutedDark mt-2">
            Click any anatomical zone to inspect muscular metrics
          </span>
        </div>

        {/* Muscular Zone Metric Details */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-primary-light">
                Zone Inspector
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary dark:text-primary-light">
                {selectedMuscleZone}
              </span>
            </div>

            <h3 className="text-xl font-black text-textPrimary-light dark:text-textPrimary-dark">
              {selectedMuscleZone}
            </h3>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
              {activeZoneData.desc}
            </p>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-surface-light dark:bg-[#1b1926]">
              <div>
                <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
                  Current Circumference
                </span>
                <span className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                  {activeZoneData.currentCm}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-500 block">
                  Target Projection
                </span>
                <span className="text-base font-black text-emerald-500">
                  {activeZoneData.targetCm}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold block mb-2">Prime Compound Movements</span>
              <div className="space-y-1.5">
                {activeZoneData.focusExercises.map((drill, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-surface-light dark:bg-[#1b1926] text-xs font-semibold flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{drill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scientific Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-start space-x-2">
            <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Medical & Anatomical Disclaimer:</strong> This body model visualizes approximate physical changes based on tracked centimeter metrics. It is an approximation and not a clinical diagnosis or medical prediction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
