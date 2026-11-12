import { Exercise, WorkoutProgram, SubscriptionPlan } from '../types.js';

export const SEED_EXERCISES: Exercise[] = [
  // CHEST
  {
    id: 'ex-barbell-bench-press',
    name: 'Barbell Flat Bench Press',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Triceps', 'Anterior Deltoids'],
    equipment: 'Barbell, Flat Bench',
    difficulty: 'Intermediate',
    description: 'The cornerstone compound movement for building pectoral mass and upper body pushing power.',
    instructions: [
      'Lie back on the flat bench with eyes directly under the racked bar.',
      'Grip the bar slightly wider than shoulder-width with a firm, locked thumb grip.',
      'Retract and depress your scapulae, planting your feet firmly on the floor.',
      'Unrack the bar and lower it under control to your mid-chest line.',
      'Drive powerfully through your palms back to lockout, maintaining tension on the chest.'
    ],
    safetyTips: [
      'Never bounce the barbell off your sternum.',
      'Always utilize safety pins or spotters on heavy sets.'
    ],
    defaultSets: 4,
    defaultReps: 8,
    defaultRestSeconds: 90,
    estimatedCaloriesPerMin: 8,
    animationSvgKey: 'bench-press'
  },
  {
    id: 'ex-incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Upper Chest', 'Anterior Deltoid', 'Triceps'],
    equipment: 'Dumbbells, Incline Bench (30°)',
    difficulty: 'Intermediate',
    description: 'Targets the clavicular head of the pectoralis major for upper chest fullness.',
    instructions: [
      'Set bench angle to approximately 30 degrees.',
      'Kick dumbbells up to shoulder height using your knees as you lie back.',
      'Press dumbbells upwards in an arc until arms are extended above your upper chest.',
      'Lower under strict control until a deep stretch is felt in the upper chest.'
    ],
    safetyTips: [
      'Avoid setting bench angle too high (greater than 45°) to prevent excessive front delt takeover.'
    ],
    defaultSets: 3,
    defaultReps: 10,
    defaultRestSeconds: 75,
    estimatedCaloriesPerMin: 7,
    animationSvgKey: 'incline-press'
  },
  {
    id: 'ex-pushups',
    name: 'Standard Push-Up',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Core', 'Triceps', 'Shoulders'],
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    description: 'Fundamental bodyweight pressing exercise developing pectoral strength and core stability.',
    instructions: [
      'Assume a high plank position with hands slightly wider than shoulder-width.',
      'Maintain a rigid straight line from crown of the head through the heels.',
      'Lower your torso until your chest is approximately 2 inches off the ground.',
      'Push the ground away to return to top plank position.'
    ],
    safetyTips: ['Do not allow hips to sag or hike into the air.'],
    defaultSets: 3,
    defaultReps: 15,
    defaultRestSeconds: 60,
    estimatedCaloriesPerMin: 6,
    animationSvgKey: 'pushup'
  },

  // BACK
  {
    id: 'ex-barbell-deadlift',
    name: 'Conventional Barbell Deadlift',
    muscleGroup: 'Back',
    secondaryMuscles: ['Hamstrings', 'Glutes', 'Traps', 'Forearms'],
    equipment: 'Barbell, Olympic Plates',
    difficulty: 'Advanced',
    description: 'The supreme test of posterior chain kinetic chain power and spinal erector strength.',
    instructions: [
      'Stand with midfoot under the barbell, feet hip-width apart.',
      'Hinge hips back, grasp the bar just outside your knees with double overhand or mixed grip.',
      'Pull chest up, engage lats, take out the barbell slack.',
      'Drive through your heels, extending hips and knees simultaneously to stand tall.'
    ],
    safetyTips: ['Never round your lumbar spine under heavy loads.'],
    defaultSets: 4,
    defaultReps: 5,
    defaultRestSeconds: 120,
    estimatedCaloriesPerMin: 10,
    animationSvgKey: 'deadlift'
  },
  {
    id: 'ex-lat-pulldown',
    name: 'Wide-Grip Lat Pulldown',
    muscleGroup: 'Back',
    secondaryMuscles: ['Biceps', 'Rhomboids', 'Rear Delts'],
    equipment: 'Cable Pulldown Machine',
    difficulty: 'Beginner',
    description: 'Builds latissimus dorsi width and upper back definition.',
    instructions: [
      'Adjust thigh pad snugly over your thighs.',
      'Grip the wide bar with palms facing away from you.',
      'Lean back slightly (10-15 degrees) and draw the bar down to your upper chest.',
      'Squeeze the lats at the bottom, then slowly resist the cable back to full extension.'
    ],
    safetyTips: ['Do not yank or lean excessively back to pull the weight.'],
    defaultSets: 3,
    defaultReps: 12,
    defaultRestSeconds: 60,
    estimatedCaloriesPerMin: 7,
    animationSvgKey: 'pulldown'
  },
  {
    id: 'ex-bent-over-row',
    name: 'Bent-Over Barbell Row',
    muscleGroup: 'Back',
    secondaryMuscles: ['Lats', 'Rhomboids', 'Rear Deltoids', 'Biceps'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: 'Essential compound movement for developing back thickness and postural strength.',
    instructions: [
      'Hinge forward at the hips with knees slightly bent until torso is roughly 45 degrees.',
      'Grip bar overhand, pull bar towards the lower ribcage/navel.',
      'Retract shoulder blades hard at the peak of the contraction.'
    ],
    safetyTips: ['Keep core braced throughout each rep to protect lower back.'],
    defaultSets: 4,
    defaultReps: 8,
    defaultRestSeconds: 90,
    estimatedCaloriesPerMin: 8,
    animationSvgKey: 'row'
  },

  // SHOULDERS
  {
    id: 'ex-overhead-press',
    name: 'Standing Barbell Overhead Press',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Triceps', 'Upper Trapezius', 'Core'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: 'Strict vertical press for shoulder mass and overhead stability.',
    instructions: [
      'Rest barbell across front delts and clavicles.',
      'Brace glutes and core, press bar vertically clearing your forehead.',
      'Lock out overhead with arms aligned over midfoot.'
    ],
    safetyTips: ['Do not hyperextend lumbar spine to cheat the bar up.'],
    defaultSets: 4,
    defaultReps: 6,
    defaultRestSeconds: 90,
    estimatedCaloriesPerMin: 8,
    animationSvgKey: 'overhead-press'
  },
  {
    id: 'ex-lateral-raises',
    name: 'Dumbbell Lateral Raise',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Lateral Deltoid'],
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    description: 'Isolated lateral deltoid developer for wider shoulder silhouette.',
    instructions: [
      'Stand tall holding dumbbells at sides with slight forward lean.',
      'Raise dumbbells out to sides until parallel to the ground, leading with elbows.',
      'Pause for a beat at parallel and lower smoothly under control.'
    ],
    safetyTips: ['Do not use body momentum or swing the dumbbells.'],
    defaultSets: 4,
    defaultReps: 15,
    defaultRestSeconds: 60,
    estimatedCaloriesPerMin: 5,
    animationSvgKey: 'lateral-raise'
  },

  // ARMS (BICEPS / TRICEPS)
  {
    id: 'ex-barbell-curl',
    name: 'Standing Barbell Bicep Curl',
    muscleGroup: 'Biceps',
    secondaryMuscles: ['Brachialis', 'Forearms'],
    equipment: 'Barbell or EZ-Bar',
    difficulty: 'Beginner',
    description: 'Classic mass builder for bicep peaks and arm thickness.',
    instructions: [
      'Grip bar shoulder-width with underhand grip.',
      'Keep elbows pinned to your sides, curl bar upward until biceps are fully contracted.',
      'Lower bar slowly over a 2-3 second count.'
    ],
    safetyTips: ['Keep elbows stationary; avoid swinging hips.'],
    defaultSets: 3,
    defaultReps: 10,
    defaultRestSeconds: 60,
    estimatedCaloriesPerMin: 6,
    animationSvgKey: 'bicep-curl'
  },
  {
    id: 'ex-tricep-dips',
    name: 'Parallel Bar Triceps Dips',
    muscleGroup: 'Triceps',
    secondaryMuscles: ['Chest', 'Anterior Deltoids'],
    equipment: 'Dip Station',
    difficulty: 'Intermediate',
    description: 'Bodyweight powerhouse for horseshoe triceps and pushing power.',
    instructions: [
      'Support bodyweight on parallel bars with arms locked.',
      'Maintain an upright torso to bias triceps, lower until elbows reach 90 degrees.',
      'Press down through palms to full lockout.'
    ],
    safetyTips: ['Do not descend past 90 degrees if you experience shoulder discomfort.'],
    defaultSets: 3,
    defaultReps: 10,
    defaultRestSeconds: 75,
    estimatedCaloriesPerMin: 7,
    animationSvgKey: 'dips'
  },

  // LEGS & GLUTES
  {
    id: 'ex-barbell-squat',
    name: 'Barbell Back Squat',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Calves', 'Core'],
    equipment: 'Squat Rack, Barbell',
    difficulty: 'Advanced',
    description: 'The premier lower body compound exercise for hypertrophy and athletic performance.',
    instructions: [
      'Place barbell across upper traps, take two steps back from the rack.',
      'Set stance slightly wider than shoulder-width with toes angled outward 15-30°.',
      'Descend by pushing hips back and bending knees until hip crease is below parallel.',
      'Explode upward driving through the entire foot back to starting position.'
    ],
    safetyTips: ['Ensure knees track over toes, do not allow knees to cave inward.'],
    defaultSets: 4,
    defaultReps: 8,
    defaultRestSeconds: 120,
    estimatedCaloriesPerMin: 11,
    animationSvgKey: 'squat'
  },
  {
    id: 'ex-bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Glutes', 'Quadriceps', 'Core'],
    equipment: 'Dumbbells, Flat Bench',
    difficulty: 'Intermediate',
    description: 'Unilateral leg exercise addressing muscle imbalances and building quad/glute density.',
    instructions: [
      'Rest top of rear foot on bench behind you.',
      'Lower hips straight down until front thigh is parallel to the floor.',
      'Drive through front heel to return to top.'
    ],
    safetyTips: ['Keep front knee stable and chest upright.'],
    defaultSets: 3,
    defaultReps: 10,
    defaultRestSeconds: 60,
    estimatedCaloriesPerMin: 8,
    animationSvgKey: 'split-squat'
  },
  {
    id: 'ex-barbell-hip-thrust',
    name: 'Barbell Hip Thrust',
    muscleGroup: 'Glutes',
    secondaryMuscles: ['Hamstrings', 'Lower Back'],
    equipment: 'Barbell, Bench, Pad',
    difficulty: 'Intermediate',
    description: 'Maximum gluteal activation and posterior chain hip extension developer.',
    instructions: [
      'Sit on floor with upper back against bench and padded bar across hips.',
      'Plant feet flat, drive hips up to full extension squeezing glutes at the top.',
      'Pause for 1 second in bridge position before lowering.'
    ],
    safetyTips: ['Tuck chin and avoid excessive arching in lower back.'],
    defaultSets: 4,
    defaultReps: 10,
    defaultRestSeconds: 90,
    estimatedCaloriesPerMin: 8,
    animationSvgKey: 'hip-thrust'
  },

  // ABS & CORE
  {
    id: 'ex-hanging-leg-raise',
    name: 'Hanging Leg Raise',
    muscleGroup: 'Abs',
    secondaryMuscles: ['Hip Flexors', 'Forearm Grip'],
    equipment: 'Pull-Up Bar',
    difficulty: 'Intermediate',
    description: 'High-intensity core exercise targeting lower rectus abdominis.',
    instructions: [
      'Hang from pull-up bar with overhand grip and legs straight.',
      'Raise legs by flexing the spine until toes reach parallel or bar level.',
      'Lower legs smoothly without swinging back.'
    ],
    safetyTips: ['Do not use momentum or kip.'],
    defaultSets: 3,
    defaultReps: 12,
    defaultRestSeconds: 60,
    estimatedCaloriesPerMin: 6,
    animationSvgKey: 'leg-raise'
  },
  {
    id: 'ex-plank-hold',
    name: 'Standard Forearm Plank',
    muscleGroup: 'Abs',
    secondaryMuscles: ['Transverse Abdominis', 'Shoulders', 'Glutes'],
    equipment: 'Yoga Mat',
    difficulty: 'Beginner',
    description: 'Isometric core stabilization exercise for spinal integrity and endurance.',
    instructions: [
      'Place forearms on mat with elbows under shoulders.',
      'Extend legs behind you, tuck pelvis slightly and brace abdominal wall.',
      'Hold position rigidly for target duration without dropping hips.'
    ],
    safetyTips: ['Breathe evenly; do not hold breath during isometric hold.'],
    defaultSets: 3,
    defaultReps: 60, // seconds
    defaultRestSeconds: 45,
    estimatedCaloriesPerMin: 5,
    animationSvgKey: 'plank'
  },

  // CARDIO & MOBILITY
  {
    id: 'ex-hiit-burpees',
    name: 'High Intensity Burpee',
    muscleGroup: 'Cardio',
    secondaryMuscles: ['Chest', 'Legs', 'Core'],
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    description: 'Metabolic conditioning exercise elevating heart rate and burning maximum calories.',
    instructions: [
      'From standing, drop into squat, place hands on floor and kick feet back to plank.',
      'Perform a rapid pushup, jump feet forward and explode vertically with hands overhead.'
    ],
    safetyTips: ['Land softly on balls of feet to protect joints.'],
    defaultSets: 4,
    defaultReps: 15,
    defaultRestSeconds: 45,
    estimatedCaloriesPerMin: 14,
    animationSvgKey: 'burpee'
  },
  {
    id: 'ex-full-body-mobility',
    name: 'World’s Greatest Stretch',
    muscleGroup: 'Stretching',
    secondaryMuscles: ['Hip Flexors', 'Hamstrings', 'Thoracic Spine'],
    equipment: 'Mat',
    difficulty: 'Beginner',
    description: 'Comprehensive mobility sequence unlocking hips, thoracic spine and ankles.',
    instructions: [
      'Step forward into a deep lunge with back leg extended.',
      'Place inside hand on the ground and rotate the opposite arm towards the ceiling.',
      'Hold rotation for 3 seconds, return to center and shift back to stretch front hamstring.'
    ],
    safetyTips: ['Move smoothly within pain-free active range of motion.'],
    defaultSets: 2,
    defaultReps: 8,
    defaultRestSeconds: 30,
    estimatedCaloriesPerMin: 4,
    animationSvgKey: 'stretch'
  }
];

export const SEED_WORKOUT_PROGRAMS: WorkoutProgram[] = [
  {
    id: 'prog-full-body-ignition',
    title: 'Full Body Functional Ignition',
    description: 'A 4-week foundational routine designed to increase metabolic rate, build lean muscle, and master essential movement patterns.',
    category: 'Beginner',
    durationWeeks: 4,
    daysPerWeek: 3,
    difficulty: 'Beginner',
    coverGradient: 'from-purple-600 to-indigo-700',
    exercises: [
      { exerciseId: 'ex-pushups', sets: 3, reps: 12, restSeconds: 60 },
      { exerciseId: 'ex-lat-pulldown', sets: 3, reps: 12, restSeconds: 60 },
      { exerciseId: 'ex-barbell-squat', sets: 3, reps: 10, restSeconds: 90 },
      { exerciseId: 'ex-plank-hold', sets: 3, reps: 45, restSeconds: 45 }
    ]
  },
  {
    id: 'prog-hypertrophy-split',
    title: 'Upper / Lower Hypertrophy Split',
    description: 'Targeted muscular hypertrophy program balancing mechanical tension, volume, and progressive overload for intermediate lifters.',
    category: 'Muscle Building',
    durationWeeks: 8,
    daysPerWeek: 4,
    difficulty: 'Intermediate',
    coverGradient: 'from-violet-700 to-purple-900',
    exercises: [
      { exerciseId: 'ex-barbell-bench-press', sets: 4, reps: 8, restSeconds: 90 },
      { exerciseId: 'ex-bent-over-row', sets: 4, reps: 8, restSeconds: 90 },
      { exerciseId: 'ex-incline-dumbbell-press', sets: 3, reps: 10, restSeconds: 75 },
      { exerciseId: 'ex-barbell-curl', sets: 3, reps: 12, restSeconds: 60 },
      { exerciseId: 'ex-tricep-dips', sets: 3, reps: 10, restSeconds: 75 }
    ]
  },
  {
    id: 'prog-strength-mastery',
    title: 'Commercial Gym Strength Mastery',
    description: 'Advanced compound training system focused on deadlifts, squats, bench press, and structural upper body development.',
    category: 'Advanced',
    durationWeeks: 12,
    daysPerWeek: 5,
    difficulty: 'Advanced',
    coverGradient: 'from-indigo-800 to-slate-900',
    exercises: [
      { exerciseId: 'ex-barbell-deadlift', sets: 4, reps: 5, restSeconds: 120 },
      { exerciseId: 'ex-barbell-squat', sets: 4, reps: 6, restSeconds: 120 },
      { exerciseId: 'ex-overhead-press', sets: 4, reps: 6, restSeconds: 90 },
      { exerciseId: 'ex-barbell-hip-thrust', sets: 4, reps: 8, restSeconds: 90 }
    ]
  },
  {
    id: 'prog-fat-loss-conditioning',
    title: 'Metabolic Fat Loss & Conditioning',
    description: 'High-energy conditioning circuit pairing resistance exercises with cardiovascular intervals to optimize caloric expenditure.',
    category: 'Weight Loss',
    durationWeeks: 6,
    daysPerWeek: 4,
    difficulty: 'Intermediate',
    coverGradient: 'from-violet-600 to-fuchsia-700',
    exercises: [
      { exerciseId: 'ex-hiit-burpees', sets: 4, reps: 15, restSeconds: 45 },
      { exerciseId: 'ex-bulgarian-split-squat', sets: 3, reps: 10, restSeconds: 60 },
      { exerciseId: 'ex-hanging-leg-raise', sets: 3, reps: 12, restSeconds: 60 },
      { exerciseId: 'ex-lateral-raises', sets: 4, reps: 15, restSeconds: 45 }
    ]
  },
  {
    id: 'prog-home-calisthenics',
    title: 'Minimal Equipment Home Athlete',
    description: 'Zero excuse home conditioning program requiring only bodyweight and a mat, perfect for travel or busy schedules.',
    category: 'Home',
    durationWeeks: 4,
    daysPerWeek: 3,
    difficulty: 'Beginner',
    coverGradient: 'from-purple-800 to-violet-950',
    exercises: [
      { exerciseId: 'ex-pushups', sets: 4, reps: 15, restSeconds: 60 },
      { exerciseId: 'ex-plank-hold', sets: 3, reps: 60, restSeconds: 45 },
      { exerciseId: 'ex-hiit-burpees', sets: 3, reps: 12, restSeconds: 60 },
      { exerciseId: 'ex-full-body-mobility', sets: 2, reps: 8, restSeconds: 30 }
    ]
  }
];

export const SEED_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-free',
    name: 'Free Starter',
    type: 'individual',
    billingCycle: 'monthly',
    priceInr: 0,
    features: [
      'Access to 20+ core exercises',
      'Basic workout logging',
      'Daily calorie tracker',
      'Community leaderboard view'
    ]
  },
  {
    id: 'plan-monthly',
    name: 'Monthly Premium Athlete',
    type: 'individual',
    billingCycle: 'monthly',
    priceInr: 999,
    originalPriceInr: 1299,
    discountPercentage: 23,
    features: [
      'Full 50+ exercise library with HD demos',
      'All beginner to advanced workout programs',
      'Interactive Workout Player with chime & timers',
      'Unlimited Gemini AI fitness coach queries',
      'Full body measurement & photo comparison',
      'Macro & micronutrient breakdown'
    ]
  },
  {
    id: 'plan-quarterly',
    name: 'Quarterly Peak Performer',
    type: 'individual',
    billingCycle: 'quarterly',
    priceInr: 2499,
    originalPriceInr: 3897,
    discountPercentage: 35,
    popular: true,
    features: [
      'Everything in Monthly Premium',
      'Priority Gemini AI response pipeline',
      'Personalized body visualization tracker',
      'Quarterly performance progress reports',
      'Eligible for verified leaderboard prizes'
    ]
  },
  {
    id: 'plan-annual',
    name: 'Annual Elite Champion',
    type: 'individual',
    billingCycle: 'annual',
    priceInr: 7999,
    originalPriceInr: 15588,
    discountPercentage: 48,
    features: [
      'Everything in Quarterly Performer',
      'Best value (under ₹670/month)',
      'VIP badge across community and leaderboards',
      'Personalized goal adjustment analysis',
      'Direct trainer consultation portal'
    ]
  },
  {
    id: 'plan-gym-standard',
    name: 'Gym Partnership Standard',
    type: 'gym_collaboration',
    billingCycle: 'monthly',
    priceInr: 4999,
    features: [
      'Up to 150 active gym members',
      'Gym member management & approvals',
      'Unique gym collaboration joining code',
      'Gym announcements & trainer rosters',
      'Standard member progress analytics'
    ]
  },
  {
    id: 'plan-gym-premium',
    name: 'Gym Partnership Enterprise Pro',
    type: 'gym_collaboration',
    billingCycle: 'annual',
    priceInr: 39999,
    originalPriceInr: 59988,
    features: [
      'Unlimited gym members',
      'Multi-trainer assignment matrix',
      'Inter-gym challenge tournaments',
      'Custom branded member experience',
      'Dedicated facility account manager',
      'Enables 50% member collaboration discount'
    ]
  }
];
