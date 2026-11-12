import React, { useState } from 'react';
import { Calendar, Plus, ChevronRight, Apple, Check, Sparkles } from 'lucide-react';

interface MealPlannerScreenProps {
  onNavigate: (screen: string) => void;
}

export const MealPlannerScreen: React.FC<MealPlannerScreenProps> = ({ onNavigate }) => {
  const [selectedDay, setSelectedDay] = useState('Today');

  const days = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const samplePlannedMeals = {
    breakfast: {
      name: 'Power Protein Oats Bowl',
      cals: 520,
      protein: 38,
      carbs: 65,
      fat: 11,
      items: ['Rolled Oats (80g)', 'Whey Isolate Vanilla (30g)', 'Fresh Blueberries (50g)', 'Chia Seeds (10g)']
    },
    lunch: {
      name: 'Mediterranean Salmon & Quinoa',
      cals: 680,
      protein: 48,
      carbs: 62,
      fat: 22,
      items: ['Baked Atlantic Salmon (180g)', 'Cooked Quinoa (150g)', 'Steamed Asparagus', 'Extra Virgin Olive Oil']
    },
    dinner: {
      name: 'Grilled Herb Chicken & Sweet Potato',
      cals: 620,
      protein: 54,
      carbs: 58,
      fat: 14,
      items: ['Grilled Chicken Breast (220g)', 'Roasted Sweet Potato (200g)', 'Steamed Broccoli & Garlic']
    },
    snacks: {
      name: 'High-Protein Greek Yogurt Parfait',
      cals: 280,
      protein: 26,
      carbs: 22,
      fat: 7,
      items: ['Greek Yogurt 0% (200g)', 'Crushed Raw Almonds (15g)', 'Raw Honey (1 tsp)']
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Weekly Meal Planner
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Structured meal prep strategy to hit exact protein, carbohydrate, and caloric budgets.
          </p>
        </div>

        <button
          onClick={() => onNavigate('food-log')}
          className="px-4 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold"
        >
          + Log Active Food
        </button>
      </div>

      {/* Day Selector */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {days.map((day) => {
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105'
                  : 'bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark hover:border-primary/40'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Planned Meals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(samplePlannedMeals).map(([catKey, meal]) => (
          <div
            key={catKey}
            className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary dark:text-primary-light uppercase">
                  {catKey}
                </span>
                <span className="text-xs font-bold text-orange-500">
                  {meal.cals} kcal
                </span>
              </div>

              <h4 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                {meal.name}
              </h4>

              <div className="flex items-center space-x-3 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark mt-1">
                <span>P: {meal.protein}g</span>
                <span>&bull;</span>
                <span>C: {meal.carbs}g</span>
                <span>&bull;</span>
                <span>F: {meal.fat}g</span>
              </div>

              <div className="mt-3 p-3 rounded-2xl bg-surface-light dark:bg-[#1b1926] space-y-1">
                <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
                  Ingredients / Portions:
                </span>
                {meal.items.map((item, idx) => (
                  <div key={idx} className="text-xs text-textPrimary-light dark:text-textPrimary-dark flex items-center space-x-1.5">
                    <span className="text-primary font-bold">&bull;</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-surface-borderLight dark:border-surface-borderDark flex justify-between items-center">
              <span className="text-[11px] font-semibold text-emerald-500 flex items-center space-x-1">
                <Check size={14} />
                <span>Macro Aligned</span>
              </span>
              <button
                onClick={() => onNavigate('food-log')}
                className="text-xs font-bold text-primary dark:text-primary-light hover:underline"
              >
                Log This Meal &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
