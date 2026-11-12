import React, { useEffect, useState } from 'react';
import { Apple, Plus, Droplet, Flame, ArrowRight, Utensils, PlusCircle } from 'lucide-react';
import { api } from '../../services/api';
import { DailyNutritionLog, MealItem } from '../../types';

interface NutritionDashboardScreenProps {
  onNavigate: (screen: string) => void;
}

export const NutritionDashboardScreen: React.FC<NutritionDashboardScreenProps> = ({ onNavigate }) => {
  const [data, setData] = useState<{ log: DailyNutritionLog; totals: any } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNutrition = async () => {
    try {
      const res = await api.getTodayNutrition();
      setData(res);
    } catch (err) {
      console.error('Failed to load nutrition:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutrition();
  }, []);

  const handleAddWater = async (amount: number) => {
    try {
      const res = await api.logWater(amount, 'add');
      if (data) {
        setData({
          ...data,
          totals: {
            ...data.totals,
            waterMl: res.waterCurrentMl
          }
        });
      }
    } catch (e) {
      console.error('Error logging water:', e);
    }
  };

  const calorieTarget = data?.log?.calorieTarget || 2400;
  const currentCalories = data?.totals?.calories || 0;
  const proteinGrams = data?.totals?.protein || 0;
  const carbsGrams = data?.totals?.carbs || 0;
  const fatGrams = data?.totals?.fat || 0;
  const waterCurrentMl = data?.totals?.waterMl || 0;
  const waterTargetMl = data?.log?.waterTargetMl || 3000;

  // Recommended Macro targets (30% Protein, 45% Carbs, 25% Fat)
  const proteinTargetGrams = Math.round((calorieTarget * 0.3) / 4);
  const carbsTargetGrams = Math.round((calorieTarget * 0.45) / 4);
  const fatTargetGrams = Math.round((calorieTarget * 0.25) / 9);

  const mealCategories: { key: keyof DailyNutritionLog['meals']; label: string }[] = [
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'dinner', label: 'Dinner' },
    { key: 'snacks', label: 'Snacks' }
  ];

  return (
    <div className="space-y-6">
      {/* Title & Quick Action */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Daily Nutrition & Macros
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Track macronutrient compliance, caloric balance, and cellular hydration.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('meal-planner')}
            className="px-4 py-2.5 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Meal Planner
          </button>
          <button
            onClick={() => onNavigate('food-log')}
            className="px-4 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center space-x-1.5"
          >
            <Plus size={15} />
            <span>Log Meal Food</span>
          </button>
        </div>
      </div>

      {/* Macro Breakdown Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Calories Ring */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-surface-mutedLight dark:text-surface-mutedDark uppercase tracking-wider">
              Calorie Target
            </span>
            <Flame size={16} className="text-orange-500" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
              {currentCalories} <span className="text-xs font-normal text-surface-mutedLight dark:text-surface-mutedDark">/ {calorieTarget} kcal</span>
            </div>
            <div className="w-full bg-surface-light dark:bg-[#1b1926] h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-orange-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (currentCalories / calorieTarget) * 100)}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
            {calorieTarget - currentCalories > 0 ? `${calorieTarget - currentCalories} kcal remaining` : 'Calorie target reached'}
          </span>
        </div>

        {/* Protein */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-surface-mutedLight dark:text-surface-mutedDark uppercase tracking-wider">
              Protein (30%)
            </span>
            <span className="text-[10px] font-bold text-primary dark:text-primary-light">Muscle Recovery</span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-primary dark:text-primary-light">
              {proteinGrams}g <span className="text-xs font-normal text-surface-mutedLight dark:text-surface-mutedDark">/ {proteinTargetGrams}g</span>
            </div>
            <div className="w-full bg-surface-light dark:bg-[#1b1926] h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (proteinGrams / proteinTargetGrams) * 100)}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
            4 kcal / gram
          </span>
        </div>

        {/* Carbs */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-surface-mutedLight dark:text-surface-mutedDark uppercase tracking-wider">
              Carbohydrates (45%)
            </span>
            <span className="text-[10px] font-bold text-indigo-400">Energy Fuel</span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-indigo-500">
              {carbsGrams}g <span className="text-xs font-normal text-surface-mutedLight dark:text-surface-mutedDark">/ {carbsTargetGrams}g</span>
            </div>
            <div className="w-full bg-surface-light dark:bg-[#1b1926] h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (carbsGrams / carbsTargetGrams) * 100)}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
            4 kcal / gram
          </span>
        </div>

        {/* Fats */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-surface-mutedLight dark:text-surface-mutedDark uppercase tracking-wider">
              Healthy Fats (25%)
            </span>
            <span className="text-[10px] font-bold text-amber-500">Hormonal Health</span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-amber-500">
              {fatGrams}g <span className="text-xs font-normal text-surface-mutedLight dark:text-surface-mutedDark">/ {fatTargetGrams}g</span>
            </div>
            <div className="w-full bg-surface-light dark:bg-[#1b1926] h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (fatGrams / fatTargetGrams) * 100)}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
            9 kcal / gram
          </span>
        </div>
      </div>

      {/* Water Tracker Integration */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
            <Droplet size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
              Hydration Volume
            </h4>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
              Logged: {waterCurrentMl} ml / {waterTargetMl} ml
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleAddWater(250)}
            className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-500 text-xs font-bold hover:bg-blue-500/20 transition-colors"
          >
            +250 ml (Glass)
          </button>
          <button
            onClick={() => handleAddWater(500)}
            className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-500 text-xs font-bold hover:bg-blue-500/20 transition-colors"
          >
            +500 ml (Bottle)
          </button>
        </div>
      </div>

      {/* Meals Log Breakdown */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
          Today's Meals
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mealCategories.map(({ key, label }) => {
            const items: MealItem[] = data?.log?.meals?.[key] || [];
            const mealCals = items.reduce((s, i) => s + i.calories, 0);

            return (
              <div
                key={key}
                className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                        {label}
                      </h4>
                      <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">
                        {items.length} items logged
                      </span>
                    </div>
                    <span className="text-xs font-bold text-orange-500">
                      {mealCals} kcal
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark italic py-2">
                      No foods logged for {label.toLowerCase()} yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {items.map((food) => (
                        <div
                          key={food.id}
                          className="p-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] flex justify-between items-center text-xs"
                        >
                          <div>
                            <span className="font-bold text-textPrimary-light dark:text-textPrimary-dark block">
                              {food.name}
                            </span>
                            <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">
                              {food.servingSize} &bull; P: {food.proteinGrams}g, C: {food.carbsGrams}g, F: {food.fatGrams}g
                            </span>
                          </div>
                          <span className="font-extrabold text-orange-500">{food.calories} kcal</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onNavigate('food-log')}
                  className="mt-4 pt-3 border-t border-surface-borderLight dark:border-surface-borderDark text-xs font-bold text-primary dark:text-primary-light hover:underline flex items-center justify-between"
                >
                  <span>+ Add food to {label}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
