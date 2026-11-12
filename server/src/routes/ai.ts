import { Router, Response } from 'express';
import { dbStore } from '../db/store.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { ChatMessage } from '../types.js';

export const aiRouter = Router();

// Get Conversation History
aiRouter.get('/history', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const history = dbStore.getData().chatMessages[req.user.id] || [
    {
      id: 'chat-init',
      role: 'assistant',
      content: 'Welcome! I am your SHADOW HUNTER AI Performance Coach. How can I optimize your workout routine, macro nutrition, or recovery protocols today?',
      timestamp: new Date().toISOString()
    }
  ];

  res.json({ history });
});

// Chat with Gemini Fitness Assistant
aiRouter.post('/chat', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'A valid text prompt is required' });
  }

  const userId = req.user.id;
  const profile = dbStore.getUserProfile(userId);

  if (!dbStore.getData().chatMessages[userId]) {
    dbStore.getData().chatMessages[userId] = [];
  }

  // Record user message
  const userMsg: ChatMessage = {
    id: `msg-${Date.now()}-u`,
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  };
  dbStore.getData().chatMessages[userId].push(userMsg);

  // AI Context Injection
  const userContext = `
User Profile:
- Full Name: ${profile?.fullName || 'Athlete'}
- Current Weight: ${profile?.currentWeight || 80} kg
- Target Weight: ${profile?.targetWeight || 75} kg
- Fitness Goal: ${profile?.fitnessGoal || 'General Fitness'}
- Experience Level: ${profile?.fitnessExperience || 'Intermediate'}
- Workout Location: ${profile?.workoutLocation || 'Gym'}
- Daily Workout Time: ${profile?.availableWorkoutTime || 45} minutes
- Dietary Preferences: ${profile?.dietaryPreferences?.join(', ') || 'Standard balanced'}
`;

  let assistantReply = '';
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      // Call Google Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `System: You are SHADOW HUNTER AI, a world-class certified fitness coach, sports nutritionist, and exercise physiologist.
Maintain a high-performance, scientific, encouraging, and professional tone.
CRITICAL RULES:
- Never use RPG, gaming, fantasy, anime, or Solo leveling themes.
- Provide general exercise and nutritional education, never clinical medical diagnoses.
- Keep answers structured with clear bullet points, sets/reps, or actionable macro suggestions.
${userContext}

User Question: ${message}`
                  }
                ]
              }
            ]
          })
        }
      );

      if (response.ok) {
        const data: any = await response.json();
        assistantReply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    } catch (err) {
      console.error('Gemini API call failed, falling back to intelligent fitness engine:', err);
    }
  }

  // Fallback intelligent fitness engine if no key or error
  if (!assistantReply) {
    assistantReply = generateContextualFitnessAdvice(message, profile);
  }

  const assistantMsg: ChatMessage = {
    id: `msg-${Date.now()}-a`,
    role: 'assistant',
    content: assistantReply,
    timestamp: new Date().toISOString()
  };

  dbStore.getData().chatMessages[userId].push(assistantMsg);
  dbStore.save();

  res.json({ reply: assistantMsg });
});

function generateContextualFitnessAdvice(query: string, profile?: any): string {
  const q = query.toLowerCase();

  if (q.includes('protein') || q.includes('macro') || q.includes('diet') || q.includes('eat')) {
    const targetProtein = Math.round((profile?.currentWeight || 75) * 2.0);
    return `### Personalized Nutrition & Macro Strategy
Based on your weight of **${profile?.currentWeight || 75} kg** and your goal of **${(profile?.fitnessGoal || 'fitness').replace('_', ' ')}**:

- **Target Protein**: Approximately **${targetProtein}g daily** (2.0g per kg of bodyweight) to maximize muscle protein synthesis and recovery.
- **Macronutrient Split**:
  - Protein: 30% (${targetProtein}g)
  - Carbohydrates: 45% (Fuel high-intensity sessions with sweet potatoes, oats, brown rice)
  - Healthy Fats: 25% (Omega-3s from salmon, avocado, almonds for hormonal balance)
- **Hydration**: Aim for 3.0 to 3.5 Liters of water daily to maintain cellular volume.

*Note: General fitness guidance only. Consult a sports dietitian for specific clinical dietary needs.*`;
  }

  if (q.includes('chest') || q.includes('bench') || q.includes('push')) {
    return `### Progressive Chest & Push Architecture
To stimulate maximal pectoral hypertrophy while safeguarding the rotator cuffs:

1. **Barbell Flat Bench Press**: 4 sets x 6-8 reps (Focus on a 2-second eccentric lowering phase and scapular retraction).
2. **Incline Dumbbell Press (30°)**: 3 sets x 8-10 reps (Emphasizes the clavicular head).
3. **Parallel Bar Dips or Cable Flyes**: 3 sets x 12-15 reps (Peak squeeze contraction).

**Rest Time**: 90-120 seconds on heavy compounds. Focus on progressive overload by adding 1-2.5 kg once you complete all target reps with pristine form.`;
  }

  if (q.includes('lose weight') || q.includes('fat') || q.includes('cut')) {
    return `### Scientific Fat Loss Protocol
To sustain fat loss without sacrificing lean muscle mass:

1. **Caloric Deficit**: Target a moderate 350-500 kcal deficit below your maintenance TDEE.
2. **Resistance Training**: Train 4 days per week focusing on compound lifts to signal your body to preserve muscle tissue.
3. **NEAT (Daily Steps)**: Maintain 8,000 - 10,000 steps daily to elevate non-exercise thermogenesis.
4. **Protein Priority**: Keep protein elevated to 2.2g/kg to increase satiety and TEF (Thermic Effect of Food).`;
  }

  return `### Strategic Fitness Insight
For your current focus on **${(profile?.fitnessGoal || 'General Fitness').replace('_', ' ')}**:

- **Progression Pillar**: Ensure every training session has a tracked variable—either adding one rep, increasing the load by 1 kg, or improving time-under-tension.
- **Sleep & Recovery**: The neuromuscular system recovers predominantly during Stage 3/4 slow-wave sleep. Target 7.5 to 8.5 hours in a cool, dark environment.
- **Session Duration**: With your available time of **${profile?.availableWorkoutTime || 45} minutes**, prioritize 3-4 multi-joint compound movements over excessive single-joint isolation.

How else can I assist with your split or nutrition today?`;
}
