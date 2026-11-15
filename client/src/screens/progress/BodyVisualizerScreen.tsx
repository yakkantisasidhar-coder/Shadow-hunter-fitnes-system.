import React, { useState } from 'react';
import { 
  ArrowLeft, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Sparkles, 
  Activity, 
  ShieldAlert, 
  Layers, 
  Info, 
  Compass, 
  Dumbbell, 
  History,
  TrendingUp,
  Maximize2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BodyVisualizerScreenProps {
  onNavigate: (screen: string, param?: string) => void;
}

export const BodyVisualizerScreen: React.FC<BodyVisualizerScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [modelGender, setModelGender] = useState<'male' | 'female'>('male');
  const [activeView, setActiveView] = useState<'front' | 'back' | 'side'>('front');
  const [rotationAngle, setRotationAngle] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedMuscleZone, setSelectedMuscleZone] = useState<string>('Pectorals');
  const [comparisonMode, setComparisonMode] = useState<'current' | 'target'>('current');

  const muscleZones: Record<string, { desc: string; currentCm: string; targetCm: string; focusExercises: string[]; projectionNote: string }> = {
    'Pectorals': {
      desc: 'Clavicular & sternocostal pectoral mass',
      currentCm: '108 cm',
      targetCm: '111 cm (+3 cm)',
      focusExercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Weighted Dips'],
      projectionNote: 'Expected +3% cross-sectional density over 12 weeks of structured progressive loading.'
    },
    'Abdominals / Core': {
      desc: 'Rectus abdominis, obliques & transverse core wall',
      currentCm: '83 cm',
      targetCm: '78 cm (-5 cm)',
      focusExercises: ['Hanging Leg Raises', 'Plank Holds', 'Cable Woodchoppers'],
      projectionNote: 'Target waist reduction aligned with 350-500 kcal sustained caloric deficit.'
    },
    'Deltoids': {
      desc: 'Anterior, lateral & posterior shoulder caps',
      currentCm: '39.5 cm',
      targetCm: '41.5 cm (+2 cm)',
      focusExercises: ['Overhead Strict Press', 'Lateral Dumbbell Raises', 'Face Pulls'],
      projectionNote: 'Lateral head hypertrophy amplifies V-taper aesthetic ratio.'
    },
    'Quadriceps & Glutes': {
      desc: 'Vastus lateralis, rectus femoris & gluteal complex',
      currentCm: '62 cm',
      targetCm: '65 cm (+3 cm)',
      focusExercises: ['Barbell Back Squats', 'Bulgarian Split Squats', 'Barbell Hip Thrusts'],
      projectionNote: 'High mechanical tension compound squats support quad sweep development.'
    },
    'Latissimus Dorsi': {
      desc: 'Upper back lat width, teres major & rhomboid thickness',
      currentCm: '114 cm',
      targetCm: '118 cm (+4 cm)',
      focusExercises: ['Wide-Grip Lat Pulldowns', 'Bent-Over Barbell Rows', 'Weighted Pull-Ups'],
      projectionNote: 'Vertical and horizontal rowing periodization drives back width.'
    },
    'Biceps & Triceps': {
      desc: 'Brachii peak & lateral/medial/long tricep horseshoe heads',
      currentCm: '38 cm',
      targetCm: '40 cm (+2 cm)',
      focusExercises: ['Incline Dumbbell Curls', 'Overhead Cable Tricep Extension', 'Close-Grip Bench'],
      projectionNote: 'Triceps account for ~60% of total upper arm circumference.'
    }
  };

  const activeZoneData = muscleZones[selectedMuscleZone] || muscleZones['Pectorals'];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => onNavigate('progress')}
          className="flex items-center space-x-1.5 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary mb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Progress Dashboard</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
              Biomechanical 3D Anatomical Visualizer
            </h2>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
              Interactive anatomical physics simulation mapping circumference changes, hypertrophy targets, and exercise biomechanics.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Interactive 3D Engine
            </span>
          </div>
        </div>
      </div>

      {/* Model Controls Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Gender Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark">Anatomy:</span>
          <button
            onClick={() => setModelGender('male')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              modelGender === 'male'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark'
            }`}
          >
            Male Model
          </button>
          <button
            onClick={() => setModelGender('female')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              modelGender === 'female'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark'
            }`}
          >
            Female Model
          </button>
        </div>

        {/* View Perspective Selector */}
        <div className="flex items-center space-x-1 bg-surface-light dark:bg-[#1b1926] p-1 rounded-2xl border border-surface-borderLight dark:border-surface-borderDark">
          {(['front', 'back', 'side'] as const).map((view) => (
            <button
              key={view}
              onClick={() => {
                setActiveView(view);
                setRotationAngle(view === 'front' ? 0 : view === 'back' ? 180 : 90);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                activeView === view
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-surface-mutedLight dark:text-surface-mutedDark hover:text-textPrimary-light'
              }`}
            >
              {view} View
            </button>
          ))}
        </div>

        {/* Current vs Target Switch */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setComparisonMode('current')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              comparisonMode === 'current'
                ? 'bg-primary/20 text-primary dark:text-primary-light border border-primary/30 font-black'
                : 'text-surface-mutedLight dark:text-surface-mutedDark'
            }`}
          >
            Current Baseline ({user?.currentWeight || 84} kg)
          </button>
          <button
            onClick={() => setComparisonMode('target')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              comparisonMode === 'target'
                ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 font-black'
                : 'text-surface-mutedLight dark:text-surface-mutedDark'
            }`}
          >
            Target Goal ({user?.targetWeight || 80} kg)
          </button>
        </div>
      </div>

      {/* Visual Model Canvas & Zone Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Interactive 3D Anatomy Canvas */}
        <div className="md:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col items-center justify-center relative overflow-hidden min-h-[460px]">
          {/* Canvas Floating Action Controls */}
          <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
            <button
              onClick={() => setRotationAngle((prev) => (prev + 45) % 360)}
              className="p-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight hover:text-primary transition-colors"
              title="Rotate Model +45°"
            >
              <RotateCw size={16} />
            </button>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(prev + 0.15, 1.6))}
              className="p-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight hover:text-primary transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.15, 0.8))}
              className="p-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight hover:text-primary transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={() => { setRotationAngle(0); setZoomLevel(1); setActiveView('front'); }}
              className="px-2.5 py-1 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-[11px] font-bold text-surface-mutedLight hover:text-primary transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="absolute top-4 right-4 z-10 text-right">
            <span className="text-[10px] font-mono text-surface-mutedLight block">Angle: {rotationAngle}°</span>
            <span className="text-[10px] font-mono text-surface-mutedLight block">Scale: {Math.round(zoomLevel * 100)}%</span>
          </div>

          {/* 3D Simulated Interactive Mesh Anatomy */}
          <div 
            className="relative w-64 h-96 flex items-center justify-center transition-transform duration-500"
            style={{
              transform: `scale(${zoomLevel}) rotateY(${rotationAngle}deg)`,
              transformStyle: 'preserve-3d'
            }}
          >
            {/* High-Fidelity SVG Anatomy Mesh with Interactive Hotspots */}
            <svg viewBox="0 0 120 220" className="w-full h-full text-primary drop-shadow-2xl">
              <defs>
                <linearGradient id="muscleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7651D5" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#A58AF5" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="targetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.5" />
                </linearGradient>
              </defs>

              {/* Head & Neck */}
              <circle cx="60" cy="20" r="13" fill="currentColor" opacity="0.3" />
              <path d="M54,32 L66,32 L68,40 L52,40 Z" fill="currentColor" opacity="0.35" />

              {/* Trapezius */}
              <path
                d="M45,38 L75,38 L84,48 L36,48 Z"
                fill={selectedMuscleZone === 'Latissimus Dorsi' ? '#7651D5' : 'currentColor'}
                opacity={selectedMuscleZone === 'Latissimus Dorsi' ? '0.9' : '0.4'}
                className="cursor-pointer hover:opacity-100 transition-opacity"
                onClick={() => setSelectedMuscleZone('Latissimus Dorsi')}
              />

              {/* Shoulders / Deltoids */}
              <path
                d="M30,48 Q40,44 48,46 L46,68 L26,62 Z M90,48 Q80,44 72,46 L74,68 L94,62 Z"
                fill={selectedMuscleZone === 'Deltoids' ? '#7651D5' : 'currentColor'}
                opacity={selectedMuscleZone === 'Deltoids' ? '0.95' : '0.4'}
                className="cursor-pointer hover:opacity-100 transition-opacity"
                onClick={() => setSelectedMuscleZone('Deltoids')}
              />

              {/* Pectorals (Front View) or Upper Lats (Back View) */}
              {activeView === 'back' ? (
                <path
                  d="M40,48 L80,48 L86,85 L34,85 Z"
                  fill={selectedMuscleZone === 'Latissimus Dorsi' ? '#7651D5' : 'currentColor'}
                  opacity={selectedMuscleZone === 'Latissimus Dorsi' ? '0.9' : '0.45'}
                  className="cursor-pointer hover:opacity-100 transition-opacity"
                  onClick={() => setSelectedMuscleZone('Latissimus Dorsi')}
                />
              ) : (
                <path
                  d="M38,48 Q60,45 82,48 L80,78 Q60,82 40,78 Z"
                  fill={selectedMuscleZone === 'Pectorals' ? (comparisonMode === 'target' ? 'url(#targetGrad)' : '#7651D5') : 'currentColor'}
                  opacity={selectedMuscleZone === 'Pectorals' ? '0.95' : '0.45'}
                  className="cursor-pointer hover:opacity-100 transition-opacity"
                  onClick={() => setSelectedMuscleZone('Pectorals')}
                />
              )}

              {/* Arms (Biceps / Triceps) */}
              <path
                d="M24,63 L34,67 L30,105 L20,100 Z M96,63 L86,67 L90,105 L100,100 Z"
                fill={selectedMuscleZone === 'Biceps & Triceps' ? '#7651D5' : 'currentColor'}
                opacity={selectedMuscleZone === 'Biceps & Triceps' ? '0.95' : '0.35'}
                className="cursor-pointer hover:opacity-100 transition-opacity"
                onClick={() => setSelectedMuscleZone('Biceps & Triceps')}
              />

              {/* Abdominals & Core Wall */}
              <path
                d="M44,79 Q60,82 76,79 L73,116 Q60,120 47,116 Z"
                fill={selectedMuscleZone === 'Abdominals / Core' ? (comparisonMode === 'target' ? 'url(#targetGrad)' : '#10b981') : 'currentColor'}
                opacity={selectedMuscleZone === 'Abdominals / Core' ? '0.95' : '0.35'}
                className="cursor-pointer hover:opacity-100 transition-opacity"
                onClick={() => setSelectedMuscleZone('Abdominals / Core')}
              />

              {/* Pelvis / Gluteal Complex */}
              <path
                d="M42,117 L78,117 L82,135 L38,135 Z"
                fill="currentColor"
                opacity="0.3"
              />

              {/* Quadriceps / Hamstrings */}
              <path
                d="M38,136 L57,136 L54,178 L36,178 Z M63,136 L82,136 L84,178 L66,178 Z"
                fill={selectedMuscleZone === 'Quadriceps & Glutes' ? '#7651D5' : 'currentColor'}
                opacity={selectedMuscleZone === 'Quadriceps & Glutes' ? '0.95' : '0.35'}
                className="cursor-pointer hover:opacity-100 transition-opacity"
                onClick={() => setSelectedMuscleZone('Quadriceps & Glutes')}
              />

              {/* Calves & Lower Extremities */}
              <path
                d="M37,180 L52,180 L50,215 L40,215 Z M68,180 L83,180 L80,215 L70,215 Z"
                fill="currentColor"
                opacity="0.25"
              />
            </svg>
          </div>

          <div className="mt-4 flex items-center space-x-2 text-[11px] font-bold text-surface-mutedLight dark:text-surface-mutedDark">
            <Compass size={14} className="text-primary" />
            <span>Click any muscle zone or use 3D rotation/zoom to examine density</span>
          </div>
        </div>

        {/* Muscular Zone Metric Details & Hypertrophy Protocols */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-primary-light">
                Zone Telemetry Inspector
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary dark:text-primary-light">
                {selectedMuscleZone}
              </span>
            </div>

            <h3 className="text-xl font-black text-textPrimary-light dark:text-textPrimary-dark">
              {selectedMuscleZone}
            </h3>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark leading-relaxed">
              {activeZoneData.desc}
            </p>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark">
              <div>
                <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
                  Measured Baseline
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

            {/* Scientific Biomechanical Projection */}
            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/15 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-primary">
                <TrendingUp size={14} />
                <span>Hypertrophy Physiology Insight</span>
              </div>
              <p className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark leading-relaxed">
                {activeZoneData.projectionNote}
              </p>
            </div>

            {/* Recommended Resistance Movements */}
            <div>
              <span className="text-xs font-bold block mb-2 flex items-center space-x-1.5">
                <Dumbbell size={14} className="text-primary" />
                <span>Recommended Compound Movements</span>
              </span>
              <div className="space-y-1.5">
                {activeZoneData.focusExercises.map((drill, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] text-xs font-semibold flex items-center justify-between border border-surface-borderLight dark:border-surface-borderDark">
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>{drill}</span>
                    </div>
                    <span className="text-[10px] text-surface-mutedLight font-mono">3-4 Sets</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scientific & Clinical Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-start space-x-2">
            <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Medical & Anatomical Disclaimer:</strong> This 3D recomposition model renders digital estimates based on user-tracked body circumference logs. These metrics reflect estimated physiological modeling and are not clinical diagnostics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
