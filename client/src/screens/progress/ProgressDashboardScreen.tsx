import React, { useEffect, useState } from 'react';
import { TrendingUp, Scale, Flame, Activity, Calendar, ArrowRight, Award } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface ProgressDashboardScreenProps {
  onNavigate: (screen: string) => void;
}

export const ProgressDashboardScreen: React.FC<ProgressDashboardScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const [anRes, measRes] = await Promise.all([
          api.getProgressAnalytics(),
          api.getMeasurements()
        ]);
        setAnalytics(anRes);
        setMeasurements(measRes.measurements || []);
      } catch (err) {
        console.error('Failed to load progress analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, []);

  const currentWeight = user?.currentWeight || 84.0;
  const targetWeight = user?.targetWeight || 80.0;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Progress Analytics & Performance
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Visual trends across bodyweight changes, muscular measurements, and weekly workout volume.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('body-visualizer')}
            className="px-4 py-2.5 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Body Visualizer Model
          </button>
          <button
            onClick={() => onNavigate('measurements')}
            className="px-4 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold"
          >
            + Log Body Metrics
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
            Weight Trajectory
          </span>
          <div className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark mt-1">
            {currentWeight} kg
          </div>
          <p className="text-xs text-emerald-500 font-bold mt-1">
            &darr; -2.2 kg over last 4 weeks (Target: {targetWeight} kg)
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
            Circumference Recomposition
          </span>
          <div className="text-2xl font-black text-primary dark:text-primary-light mt-1">
            Waist -3.0 cm
          </div>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark font-semibold mt-1">
            Chest +2.0 cm &bull; Arms +1.0 cm
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
            Adherence Consistency
          </span>
          <div className="text-2xl font-black text-indigo-500 mt-1">
            91% Adherence
          </div>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark font-semibold mt-1">
            18 workouts logged in last 30 days
          </p>
        </div>
      </div>

      {/* Interactive SVG Weight Trend Chart */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
              Bodyweight Progression (kg)
            </h3>
            <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">
              Consistent downward trend aligning with metabolic target
            </span>
          </div>
          <span className="text-xs font-bold text-primary dark:text-primary-light">
            Last 30 Days
          </span>
        </div>

        {/* Clean Responsive SVG Line Graph */}
        <div className="h-56 w-full pt-4">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160">
            {/* Grid Lines */}
            <line x1="0" y1="20" x2="600" y2="20" stroke="currentColor" className="text-black/5 dark:text-white/5" strokeDasharray="4 4" />
            <line x1="0" y1="70" x2="600" y2="70" stroke="currentColor" className="text-black/5 dark:text-white/5" strokeDasharray="4 4" />
            <line x1="0" y1="120" x2="600" y2="120" stroke="currentColor" className="text-black/5 dark:text-white/5" strokeDasharray="4 4" />

            {/* Target Line */}
            <line x1="0" y1="140" x2="600" y2="140" stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 6" />
            <text x="520" y="135" fill="#10b981" fontSize="10" fontWeight="bold">Target (80kg)</text>

            {/* Trend Polyline */}
            <polyline
              fill="none"
              stroke="#7651D5"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points="40,30 160,55 300,75 450,105 560,118"
            />

            {/* Data Points */}
            {[
              { x: 40, y: 30, val: '86.2' },
              { x: 160, y: 55, val: '85.5' },
              { x: 300, y: 75, val: '85.1' },
              { x: 450, y: 105, val: '84.4' },
              { x: 560, y: 118, val: '84.0' }
            ].map((pt, i) => (
              <g key={i}>
                <circle cx={pt.x} cy={pt.y} r="5" fill="#7651D5" stroke="#FFFFFF" strokeWidth="2" />
                <text x={pt.x - 12} y={pt.y - 10} fill="currentColor" fontSize="11" fontWeight="bold" className="text-textPrimary-light dark:text-textPrimary-dark">
                  {pt.val} kg
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Shortcuts to Photos & Measurements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => onNavigate('measurements')}
          className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary cursor-pointer transition-colors shadow-sm flex items-center justify-between"
        >
          <div>
            <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
              Body Circumference Log
            </h4>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">
              Review chest, waist, bicep, and thigh measurement history.
            </p>
          </div>
          <ArrowRight size={18} className="text-primary dark:text-primary-light" />
        </div>

        <div
          onClick={() => onNavigate('progress-photos')}
          className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary cursor-pointer transition-colors shadow-sm flex items-center justify-between"
        >
          <div>
            <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
              Side-by-Side Progress Photos
            </h4>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">
              Compare visual physical transformation across training months.
            </p>
          </div>
          <ArrowRight size={18} className="text-primary dark:text-primary-light" />
        </div>
      </div>
    </div>
  );
};
