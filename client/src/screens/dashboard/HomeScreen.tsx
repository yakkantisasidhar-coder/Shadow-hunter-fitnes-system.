import React, { useEffect, useState } from 'react';
import { 
  Flame, 
  Droplet, 
  Dumbbell, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  ChevronRight, 
  Award, 
  Play, 
  Scale, 
  Crown,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [nutrition, setNutrition] = useState<any>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [waterAmount, setWaterAmount] = useState<number>(2250);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nutrRes, workRes] = await Promise.all([
          api.getTodayNutrition(),
          api.getWorkoutHistory()
        ]);
        setNutrition(nutrRes);
        setWaterAmount(nutrRes.totals?.waterMl || 2000);
        setRecentWorkouts(workRes.history || []);
      } catch (err) {
        console.warn('Dashboard fetch fallback:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleQuickAddWater = async (amount: number) => {
    try {
      const res = await api.logWater(amount, 'add');
      setWaterAmount(res.waterCurrentMl);
    } catch (err) {
      setWaterAmount(prev => prev + amount);
    }
  };

  const caloriesBurnedToday = 480;
  const calorieGoal = 2500;
  const caloriesConsumed = nutrition?.totals?.calories || 1750;
  const currentWeight = user?.currentWeight || 84.0;
  const targetWeight = user?.targetWeight || 80.0;
  const weightDifference = (currentWeight - targetWeight).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-[#6c48c7] to-[#8d6ee6] text-white p-6 md:p-8 shadow-xl shadow-primary/20">
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase mb-2">
              <Crown size={12} className="text-amber-300" />
              <span>{user?.subscriptionTier ? `${user.subscriptionTier.toUpperCase()} MEMBER` : 'ACTIVE ATHLETE'}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Athlete'}!
            </h2>
            <p className="text-xs md:text-sm text-white/80 mt-1 max-w-xl">
              Consistency is your competitive advantage. You are only {weightDifference} kg away from your target goal.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('workout-player')}
              className="px-5 py-3 rounded-2xl bg-white text-primary font-bold text-xs md:text-sm flex items-center space-x-2 hover:bg-white/90 shadow-lg active:scale-95 transition-all"
            >
              <Play size={16} fill="currentColor" />
              <span>Start Today's Workout</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Quick Action Dock */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Start Workout', icon: Dumbbell, screen: 'workout-player', color: 'text-primary' },
          { label: 'Log Food', icon: Plus, screen: 'food-log', color: 'text-emerald-500' },
          { label: 'Record Weight', icon: Scale, screen: 'measurements', color: 'text-blue-500' },
          { label: 'View Progress', icon: TrendingUp, screen: 'progress', color: 'text-purple-500' },
          { label: 'Ask AI Coach', icon: Sparkles, screen: 'ai-coach', color: 'text-amber-500' }
        ].map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={() => onNavigate(action.screen)}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary/50 flex flex-col items-center justify-center space-y-1.5 shadow-sm active:scale-95 transition-all text-center group"
            >
              <div className={`p-2 rounded-xl bg-surface-light dark:bg-[#1b1926] group-hover:bg-primary/10 transition-colors ${action.color}`}>
                <Icon size={18} />
              </div>
              <span className="text-[11px] font-bold text-textPrimary-light dark:text-textPrimary-dark">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Core Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark uppercase tracking-wider">
              Calorie Balance
            </span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
              <Flame size={16} />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
              {caloriesConsumed} <span className="text-xs font-normal text-surface-mutedLight dark:text-surface-mutedDark">/ {calorieGoal} kcal</span>
            </div>
            <div className="w-full bg-surface-light dark:bg-[#1b1926] h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-orange-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (caloriesConsumed / calorieGoal) * 100)}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
            Burned ~{caloriesBurnedToday} kcal in physical output
          </p>
        </div>

        {/* Water Tracker Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark uppercase tracking-wider">
              Hydration Intake
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Droplet size={16} />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
              {(waterAmount / 1000).toFixed(2)} <span className="text-xs font-normal text-surface-mutedLight dark:text-surface-mutedDark">/ 3.00 L</span>
            </div>
            <div className="w-full bg-surface-light dark:bg-[#1b1926] h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-blue-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (waterAmount / 3000) * 100)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleQuickAddWater(250)}
              className="flex-1 py-1 text-[11px] font-bold rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
            >
              +250 ml
            </button>
            <button
              onClick={() => handleQuickAddWater(500)}
              className="flex-1 py-1 text-[11px] font-bold rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
            >
              +500 ml
            </button>
          </div>
        </div>

        {/* Body Weight Progress Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark uppercase tracking-wider">
              Current Weight
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Scale size={16} />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
              {currentWeight} <span className="text-xs font-normal text-surface-mutedLight dark:text-surface-mutedDark">kg</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-500 font-bold mt-1">
              <span>Target: {targetWeight} kg</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10">On Track</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('measurements')}
            className="text-[11px] font-bold text-primary dark:text-primary-light hover:underline text-left"
          >
            Update Body Metrics &rarr;
          </button>
        </div>

        {/* Weekly Training Consistency */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark uppercase tracking-wider">
              Weekly Activity
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
              4 of 5 <span className="text-xs font-normal text-surface-mutedLight dark:text-surface-mutedDark">Sessions</span>
            </div>
            <div className="flex justify-between space-x-1 mt-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                    i < 4
                      ? 'bg-primary text-white'
                      : i === 4
                      ? 'border border-primary text-primary dark:text-primary-light'
                      : 'bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark'
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
            Next: Upper Body Hypertrophy Split
          </p>
        </div>
      </div>

      {/* Today's Workout Feature Card & Upcoming Challenges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Workout Module */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-primary dark:text-primary-light uppercase">
                Scheduled Today
              </span>
              <h3 className="text-lg font-black text-textPrimary-light dark:text-textPrimary-dark">
                Upper / Lower Hypertrophy Split
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary dark:text-primary-light">
              45 Mins • 5 Exercises
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { name: 'Barbell Flat Bench Press', sets: '4 Sets', reps: '8 Reps', muscle: 'Chest' },
              { name: 'Bent-Over Barbell Row', sets: '4 Sets', reps: '8 Reps', muscle: 'Back' },
              { name: 'Incline Dumbbell Press (30°)', sets: '3 Sets', reps: '10 Reps', muscle: 'Upper Chest' },
              { name: 'Standing Barbell Bicep Curl', sets: '3 Sets', reps: '12 Reps', muscle: 'Biceps' }
            ].map((ex, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-surface-light dark:bg-[#1b1926] flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-lg bg-primary/20 text-primary dark:text-primary-light text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark">{ex.name}</h4>
                    <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">{ex.muscle}</span>
                  </div>
                </div>
                <div className="text-right text-xs font-semibold text-surface-mutedLight dark:text-surface-mutedDark">
                  {ex.sets} &bull; {ex.reps}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('workout-player')}
            className="w-full mt-4 py-3 rounded-2xl gradient-btn-primary text-white text-xs font-bold flex items-center justify-center space-x-2"
          >
            <Play size={16} fill="currentColor" />
            <span>Launch Interactive Workout Player</span>
          </button>
        </div>

        {/* Active Challenges & Connected Gym */}
        <div className="space-y-4">
          {/* Active Challenge */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
                Active Challenge
              </h4>
              <Award size={18} className="text-amber-500" />
            </div>
            <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
              30-Day Training Streak
            </h3>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
              Log 20 verified sessions this month. Earn the Iron Consistency badge.
            </p>
            <div className="mt-3">
              <div className="flex justify-between text-[11px] font-bold mb-1">
                <span>Progress: 13/20 Days</span>
                <span className="text-primary dark:text-primary-light">65%</span>
              </div>
              <div className="w-full bg-surface-light dark:bg-[#1b1926] h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
            <button
              onClick={() => onNavigate('challenges')}
              className="mt-4 w-full py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              View All Challenges
            </button>
          </div>

          {/* Connected Gym Quick Status */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark mb-2">
              Facility Affiliation
            </h4>
            <div className="p-3 rounded-2xl bg-surface-light dark:bg-[#1b1926] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark">
                  {user?.gymName || 'Apex Performance Club'}
                </p>
                <p className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">
                  Status: Verified Member
                </p>
              </div>
              <button
                onClick={() => onNavigate('gym')}
                className="px-3 py-1.5 rounded-xl bg-primary text-white text-[11px] font-bold"
              >
                Gym Hub
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
