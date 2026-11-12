import { Router, Response } from 'express';
import { dbStore } from '../db/store.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { DailyNutritionLog, MealItem } from '../types.js';

export const nutritionRouter = Router();

const DEFAULT_FOOD_LIBRARY = [
  { name: 'Grilled Chicken Breast', calories: 165, proteinGrams: 31, carbsGrams: 0, fatGrams: 3.6, servingSize: '100g' },
  { name: 'Brown Rice (Cooked)', calories: 216, proteinGrams: 5, carbsGrams: 45, fatGrams: 1.8, servingSize: '1 cup (195g)' },
  { name: 'Whole Large Egg', calories: 72, proteinGrams: 6.3, carbsGrams: 0.4, fatGrams: 4.8, servingSize: '1 egg (50g)' },
  { name: 'Egg Whites', calories: 17, proteinGrams: 3.6, carbsGrams: 0.2, fatGrams: 0.1, servingSize: '1 egg white (33g)' },
  { name: 'Rolled Oats (Raw)', calories: 379, proteinGrams: 13, carbsGrams: 68, fatGrams: 6.5, servingSize: '100g' },
  { name: 'Whey Protein Isolate (1 Scoop)', calories: 120, proteinGrams: 25, carbsGrams: 2, fatGrams: 1, servingSize: '30g scoop' },
  { name: 'Atlantic Salmon Fillet', calories: 206, proteinGrams: 22, carbsGrams: 0, fatGrams: 12, servingSize: '100g' },
  { name: 'Sweet Potato (Baked)', calories: 90, proteinGrams: 2, carbsGrams: 21, fatGrams: 0.2, servingSize: '100g' },
  { name: 'Greek Yogurt 0% Fat', calories: 59, proteinGrams: 10, carbsGrams: 3.6, fatGrams: 0.4, servingSize: '100g' },
  { name: 'Raw Almonds', calories: 164, proteinGrams: 6, carbsGrams: 6, fatGrams: 14, servingSize: '28g (approx 23 nuts)' },
  { name: 'Peanut Butter Natural', calories: 190, proteinGrams: 8, carbsGrams: 7, fatGrams: 16, servingSize: '2 tbsp (32g)' },
  { name: 'Fresh Banana', calories: 105, proteinGrams: 1.3, carbsGrams: 27, fatGrams: 0.3, servingSize: '1 medium (118g)' },
  { name: 'Avocado', calories: 160, proteinGrams: 2, carbsGrams: 9, fatGrams: 15, servingSize: '100g' },
  { name: 'Steamed Broccoli', calories: 35, proteinGrams: 2.4, carbsGrams: 7, fatGrams: 0.4, servingSize: '100g' }
];

// Search Food Database
nutritionRouter.get('/food-database', (req, res) => {
  const { query } = req.query;
  if (!query) return res.json({ foods: DEFAULT_FOOD_LIBRARY });
  const q = (query as string).toLowerCase();
  const filtered = DEFAULT_FOOD_LIBRARY.filter(f => f.name.toLowerCase().includes(q));
  res.json({ foods: filtered });
});

// Get Today's Log
nutritionRouter.get('/today', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const todayStr = new Date().toISOString().split('T')[0];
  let log = dbStore.getData().nutritionLogs.find(l => l.userId === req.user?.id && l.date === todayStr);

  if (!log) {
    // Determine target based on profile or standard 2400 kcal
    const profile = dbStore.getUserProfile(req.user.id);
    let target = 2400;
    if (profile?.fitnessGoal === 'weight_loss') target = 2000;
    if (profile?.fitnessGoal === 'muscle_building') target = 2800;

    log = {
      id: `nutr-${Date.now()}`,
      userId: req.user.id,
      date: todayStr,
      calorieTarget: target,
      waterTargetMl: 3000,
      waterCurrentMl: 0,
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      }
    };
    dbStore.getData().nutritionLogs.push(log);
    dbStore.save();
  }

  // Calculate totals
  const allMeals = [
    ...log.meals.breakfast,
    ...log.meals.lunch,
    ...log.meals.dinner,
    ...log.meals.snacks
  ];

  const totalCalories = allMeals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = allMeals.reduce((s, m) => s + m.proteinGrams, 0);
  const totalCarbs = allMeals.reduce((s, m) => s + m.carbsGrams, 0);
  const totalFat = allMeals.reduce((s, m) => s + m.fatGrams, 0);

  res.json({
    log,
    totals: {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      waterMl: log.waterCurrentMl
    }
  });
});

// Log Food Item
nutritionRouter.post('/log-food', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { mealType, name, calories, proteinGrams, carbsGrams, fatGrams, servingSize } = req.body;
  if (!mealType || !name || calories === undefined) {
    return res.status(400).json({ error: 'Meal category, food name, and calories are required' });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  let log = dbStore.getData().nutritionLogs.find(l => l.userId === req.user?.id && l.date === todayStr);

  if (!log) {
    log = {
      id: `nutr-${Date.now()}`,
      userId: req.user.id,
      date: todayStr,
      calorieTarget: 2400,
      waterTargetMl: 3000,
      waterCurrentMl: 0,
      meals: { breakfast: [], lunch: [], dinner: [], snacks: [] }
    };
    dbStore.getData().nutritionLogs.push(log);
  }

  const newMealItem: MealItem = {
    id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name,
    calories: Number(calories),
    proteinGrams: Number(proteinGrams) || 0,
    carbsGrams: Number(carbsGrams) || 0,
    fatGrams: Number(fatGrams) || 0,
    servingSize: servingSize || '1 serving'
  };

  const cat = mealType as 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  if (!log.meals[cat]) {
    log.meals[cat] = [];
  }
  log.meals[cat].push(newMealItem);
  dbStore.save();

  res.status(201).json({ mealItem: newMealItem, log });
});

// Update Water Intake
nutritionRouter.post('/water', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { amountMl, action = 'add' } = req.body;
  const todayStr = new Date().toISOString().split('T')[0];
  let log = dbStore.getData().nutritionLogs.find(l => l.userId === req.user?.id && l.date === todayStr);

  if (!log) {
    log = {
      id: `nutr-${Date.now()}`,
      userId: req.user.id,
      date: todayStr,
      calorieTarget: 2400,
      waterTargetMl: 3000,
      waterCurrentMl: 0,
      meals: { breakfast: [], lunch: [], dinner: [], snacks: [] }
    };
    dbStore.getData().nutritionLogs.push(log);
  }

  if (action === 'set') {
    log.waterCurrentMl = Math.max(0, Number(amountMl));
  } else {
    log.waterCurrentMl = Math.max(0, log.waterCurrentMl + Number(amountMl));
  }
  dbStore.save();

  res.json({ waterCurrentMl: log.waterCurrentMl, waterTargetMl: log.waterTargetMl });
});
