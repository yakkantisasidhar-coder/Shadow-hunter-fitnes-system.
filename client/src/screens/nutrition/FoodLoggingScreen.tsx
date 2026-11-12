import React, { useState, useEffect } from 'react';
import { Search, Plus, CheckCircle2, ArrowLeft, Apple } from 'lucide-react';
import { api } from '../../services/api';

interface FoodLoggingScreenProps {
  onNavigate: (screen: string) => void;
}

export const FoodLoggingScreen: React.FC<FoodLoggingScreenProps> = ({ onNavigate }) => {
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('lunch');
  const [search, setSearch] = useState('');
  const [foodDb, setFoodDb] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Manual Form State
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState<number | ''>('');
  const [protein, setProtein] = useState<number | ''>('');
  const [carbs, setCarbs] = useState<number | ''>('');
  const [fat, setFat] = useState<number | ''>('');
  const [servingSize, setServingSize] = useState('1 serving');

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await api.getFoodDatabase(search);
        setFoodDb(res.foods || []);
      } catch (err) {
        console.error('Failed to load food database:', err);
      }
    };
    fetchFoods();
  }, [search]);

  const handleSelectPredefined = (food: any) => {
    setFoodName(food.name);
    setCalories(food.calories);
    setProtein(food.proteinGrams);
    setCarbs(food.carbsGrams);
    setFat(food.fatGrams);
    setServingSize(food.servingSize);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || calories === '') return;

    setLoading(true);
    try {
      await api.logFood({
        mealType,
        name: foodName,
        calories: Number(calories),
        proteinGrams: Number(protein) || 0,
        carbsGrams: Number(carbs) || 0,
        fatGrams: Number(fat) || 0,
        servingSize
      });
      setSuccessMsg(`Successfully logged "${foodName}" to ${mealType.toUpperCase()}!`);
      // Clear inputs
      setFoodName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setTimeout(() => {
        onNavigate('nutrition');
      }, 1200);
    } catch (err) {
      console.error('Error logging food:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('nutrition')}
          className="flex items-center space-x-1.5 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Nutrition Tracker</span>
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
          Log Food & Nutrition
        </h2>
        <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
          Select from the certified nutritional index or enter custom meal macros manually.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Meal Category Toggle */}
      <div>
        <label className="block text-xs font-bold mb-2">Meal Category</label>
        <div className="grid grid-cols-4 gap-2">
          {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMealType(m)}
              className={`py-2.5 rounded-xl text-xs font-bold capitalize border transition-all ${
                mealType === m
                  ? 'border-primary bg-primary text-white shadow-sm'
                  : 'border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark hover:border-primary/40'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Predefined Food Database Quick Selector */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
            Verified Nutrition Database
          </h3>
          <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">
            Click item to auto-populate
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-surface-mutedLight dark:text-surface-mutedDark" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search whole foods, chicken, oats, eggs..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
          {foodDb.slice(0, 8).map((f, i) => (
            <div
              key={i}
              onClick={() => handleSelectPredefined(f)}
              className="p-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] hover:border hover:border-primary/40 cursor-pointer flex justify-between items-center text-xs transition-colors"
            >
              <div>
                <span className="font-bold text-textPrimary-light dark:text-textPrimary-dark block">
                  {f.name}
                </span>
                <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">
                  {f.servingSize} &bull; P: {f.proteinGrams}g, C: {f.carbsGrams}g, F: {f.fatGrams}g
                </span>
              </div>
              <span className="font-bold text-orange-500">{f.calories} kcal</span>
            </div>
          ))}
        </div>
      </div>

      {/* Manual / Custom Food Entry Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
          Food Entry Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1">Food / Meal Item Name</label>
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="e.g., Grilled Chicken Breast"
              className="w-full px-4 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Serving Size / Weight</label>
            <input
              type="text"
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
              placeholder="e.g., 200 grams, 1 plate"
              className="w-full px-4 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1 text-orange-500">Calories (kcal)</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 text-primary dark:text-primary-light">Protein (g)</label>
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 text-indigo-400">Carbs (g)</label>
            <input
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 text-amber-500">Fat (g)</label>
            <input
              type="number"
              value={fat}
              onChange={(e) => setFat(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !foodName || calories === ''}
          className="w-full py-3 rounded-xl gradient-btn-primary text-white font-bold text-xs flex items-center justify-center space-x-1.5 disabled:opacity-50 transition-transform active:scale-95"
        >
          <Plus size={16} />
          <span>{loading ? 'Logging Entry...' : `Add to ${mealType.toUpperCase()}`}</span>
        </button>
      </form>
    </div>
  );
};
