import fs from 'fs';

const LOCAL_URL = 'http://localhost:5000';
const RENDER_URL = 'https://shadow-hunter-fitnes-system-kzca.onrender.com';

const TARGET_URL = process.env.TEST_TARGET === 'render' ? RENDER_URL : LOCAL_URL;

console.log(`========================================================================`);
console.log(`SHADOW HUNTER FITNESS SYSTEM - AUTOMATED QA TEST HARNESS`);
console.log(`Target Environment: ${TARGET_URL}`);
console.log(`Execution Time: ${new Date().toISOString()}`);
console.log(`========================================================================\n`);

let passedTests = 0;
let failedTests = 0;
const results = [];

function assert(condition, testName, details = '') {
  if (condition) {
    passedTests++;
    results.push({ name: testName, status: 'PASSED', details });
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    results.push({ name: testName, status: 'FAILED', details });
    console.log(`  [FAIL] ${testName} - ${details}`);
  }
}

async function request(endpoint, options = {}, token = null, customHeaders = {}) {
  const url = `${TARGET_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });
    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    return { status: 0, ok: false, error: err.message };
  }
}

async function runTestSuite() {
  console.log(`--- SUITE 1: API HEALTH & SYSTEM READINESS ---`);
  const health = await request('/api/health');
  assert(health.status === 200 && health.data?.status === 'operational', 'Health Check Endpoint (/api/health)');

  console.log(`\n--- SUITE 2: AUTHENTICATION & PERSONA CLEARANCE ---`);
  
  // 1. Athlete Login
  const athleteLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'alex@shadowhunter.com', password: 'athlete123' })
  });
  assert(athleteLogin.status === 200 && athleteLogin.data?.token, 'Individual Athlete Login (alex@shadowhunter.com)');
  const athleteToken = athleteLogin.data?.token;

  // 2. Gym Member Login
  const memberLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'member@apexfitness.com', password: 'member123' })
  });
  assert(memberLogin.status === 200 && memberLogin.data?.token, 'Gym Member Login (member@apexfitness.com)');
  const memberToken = memberLogin.data?.token;

  // 3. Gym Owner Login
  const ownerLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'owner@apexfitness.com', password: 'owner123' })
  });
  assert(ownerLogin.status === 200 && ownerLogin.data?.token, 'Gym Owner Login (owner@apexfitness.com)');
  const ownerToken = ownerLogin.data?.token;

  // 4. Super Admin Login
  const adminLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@shadowhunter.com', password: 'admin123' })
  });
  assert(adminLogin.status === 200 && adminLogin.data?.token, 'Super Admin Login (admin@shadowhunter.com)');
  const adminToken = adminLogin.data?.token;

  // 5. Invalid credentials rejection
  const invalidLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'alex@shadowhunter.com', password: 'wrongpassword' })
  });
  assert(invalidLogin.status === 401, 'Invalid Password Rejection (401 Unauthorized)');

  // 6. Nonexistent user rejection
  const nonExistent = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'ghost@shadowhunter.com', password: 'test' })
  });
  assert(nonExistent.status === 401, 'Nonexistent User Login Rejection (401 Unauthorized)');

  // 7. Verify /api/auth/me profile retrieval
  const meRes = await request('/api/auth/me', {}, athleteToken);
  assert(meRes.status === 200 && meRes.data?.user?.email === 'alex@shadowhunter.com', 'Get Authenticated Profile (/api/auth/me)');

  console.log(`\n--- SUITE 3: WORKOUTS & EXERCISES ---`);
  
  // Exercises list
  const exercises = await request('/api/workouts/exercises', {}, athleteToken);
  assert(exercises.status === 200 && Array.isArray(exercises.data?.exercises) && exercises.data.exercises.length > 0, 
    `Exercise Library Discovery (Found ${exercises.data?.exercises?.length || 0} exercises)`);

  // Workout programs
  const programs = await request('/api/workouts/programs', {}, athleteToken);
  assert(programs.status === 200 && Array.isArray(programs.data?.programs) && programs.data.programs.length > 0, 
    `Workout Programs Discovery (Found ${programs.data?.programs?.length || 0} programs)`);

  // Log a test workout
  const logWorkout = await request('/api/workouts/log', {
    method: 'POST',
    body: JSON.stringify({
      programId: 'prog-hypertrophy-1',
      programTitle: 'Automated QA Hypertrophy Validation',
      durationMinutes: 45,
      caloriesBurned: 350,
      notes: 'Automated Test Run'
    })
  }, athleteToken);
  assert(logWorkout.status === 200 || logWorkout.status === 201, 'Log Workout Session (/api/workouts/log)');

  // Fetch workout history
  const history = await request('/api/workouts/history', {}, athleteToken);
  assert(history.status === 200 && Array.isArray(history.data?.history), 'Fetch Workout History (/api/workouts/history)');

  console.log(`\n--- SUITE 4: NUTRITION & MACROS ---`);

  // Get daily nutrition
  const nutritionToday = await request('/api/nutrition/today', {}, athleteToken);
  assert(nutritionToday.status === 200 && nutritionToday.data?.log, 'Fetch Daily Nutrition Log (/api/nutrition/today)');

  // Log food meal
  const logMeal = await request('/api/nutrition/log-meal', {
    method: 'POST',
    body: JSON.stringify({
      mealType: 'lunch',
      name: 'Grilled Salmon with Quinoa & Asparagus',
      calories: 550,
      protein: 45,
      carbs: 40,
      fat: 18
    })
  }, athleteToken);
  assert(logMeal.status === 200 || logMeal.status === 201, 'Log Food / Meal (/api/nutrition/log-meal)');

  console.log(`\n--- SUITE 5: AI FITNESS COACH ---`);

  // Get AI history
  const aiHistory = await request('/api/ai/history', {}, athleteToken);
  assert(aiHistory.status === 200 && Array.isArray(aiHistory.data?.history), 'Fetch AI Chat History (/api/ai/history)');

  // Post prompt to AI coach
  const aiPrompt = await request('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message: 'Recommend an optimal pre-workout carbohydrate meal timing.' })
  }, athleteToken);
  assert(aiPrompt.status === 200 && aiPrompt.data?.reply?.content?.length > 10, 'AI Coach Intelligent Response Generation');

  console.log(`\n--- SUITE 6: PROGRESS, BODY MEASUREMENTS & BADGES ---`);

  // Log body measurements
  const logMeasurements = await request('/api/progress/measurements', {
    method: 'POST',
    body: JSON.stringify({
      weightKg: 78.5,
      chestCm: 104,
      waistCm: 81,
      armsCm: 39,
      bodyFatPercentage: 14.5
    })
  }, athleteToken);
  assert(logMeasurements.status === 200 || logMeasurements.status === 201, 'Log Body Measurements (/api/progress/measurements)');

  // Fetch progress stats
  const progressStats = await request('/api/progress/stats', {}, athleteToken);
  assert(progressStats.status === 200, 'Fetch Progress Dashboard Stats (/api/progress/stats)');

  // Fetch challenges
  const challenges = await request('/api/challenges', {}, athleteToken);
  assert(challenges.status === 200 && Array.isArray(challenges.data?.challenges), 'Fetch Fitness Challenges (/api/challenges)');

  // Fetch achievements
  const achievements = await request('/api/challenges/achievements', {}, athleteToken);
  assert(achievements.status === 200 && Array.isArray(achievements.data?.achievements), 'Fetch Achievements & Badges (/api/challenges/achievements)');

  console.log(`\n--- SUITE 7: CONNECTED GYM PORTAL & OPERATIONS ---`);

  // List public gyms
  const gymList = await request('/api/gyms', {}, athleteToken);
  assert(gymList.status === 200 && Array.isArray(gymList.data?.gyms) && gymList.data.gyms.length > 0, 
    `Gym Directory Discovery (Found ${gymList.data?.gyms?.length || 0} gyms)`);

  const apexGymId = 'gym-apex-1';

  // Gym Owner accessing member roster
  const ownerMembers = await request(`/api/gyms/${apexGymId}/members`, {}, ownerToken);
  assert(ownerMembers.status === 200 && Array.isArray(ownerMembers.data?.members), 'Gym Owner Member Roster Clearance (/api/gyms/:id/members)');

  // Gym Financials
  const gymFinancials = await request(`/api/gyms/${apexGymId}/financials`, {}, ownerToken);
  assert(gymFinancials.status === 200, 'Gym Owner Financials Access (/api/gyms/:id/financials)');

  // Personal Training Packages
  const ptPackages = await request(`/api/gyms/${apexGymId}/pt-packages`, {}, ownerToken);
  assert(ptPackages.status === 200, 'Gym Personal Training Packages Access');

  // WhatsApp Templates
  const waTemplates = await request(`/api/gyms/whatsapp/${apexGymId}/templates`, {}, ownerToken);
  assert(waTemplates.status === 200, 'Gym WhatsApp Communication Hub Templates');

  console.log(`\n--- SUITE 8: SECURITY, RBAC & AUTHORIZATION ENFORCEMENT ---`);

  // Security Test 1: Athlete attempting to access Admin Metrics
  const athleteAdminAccess = await request('/api/admin/metrics', {}, athleteToken);
  assert(athleteAdminAccess.status === 403, 'Privilege Escalation Protection: Athlete calling /api/admin/metrics blocked (403)');

  // Security Test 2: Gym Owner attempting to access Super Admin
  const ownerAdminAccess = await request('/api/admin/metrics', {}, ownerToken);
  assert(ownerAdminAccess.status === 403, 'Privilege Escalation Protection: Gym Owner calling /api/admin/metrics blocked (403)');

  // Security Test 3: Unauthenticated user accessing Admin Metrics
  const unauthAdminAccess = await request('/api/admin/metrics', {});
  assert(unauthAdminAccess.status === 401, 'Unauthenticated Admin Call Blocked (401)');

  // Security Test 4: Super Admin authorized access
  const adminMetrics = await request('/api/admin/metrics', {}, adminToken);
  assert(adminMetrics.status === 200 && adminMetrics.data?.totalUsers !== undefined, 'Super Admin Clearance Granted for /api/admin/metrics');

  // Security Test 5: Super Admin Audit Logs
  const auditLogs = await request('/api/admin/audit-logs', {}, adminToken);
  assert(auditLogs.status === 200 && Array.isArray(auditLogs.data?.auditLogs), 'Super Admin Audit Logs Retrieval');

  // Security Test 6: Cross-Gym Isolation - Athlete accessing Gym Owner private roster
  const athleteRosterAccess = await request(`/api/gyms/${apexGymId}/members`, {}, athleteToken);
  assert(athleteRosterAccess.status === 403, 'Cross-Gym Isolation: Athlete blocked from private member roster (403)');

  // Security Vulnerability Probe 7: x-user-id Header Forgery Probe
  const headerBypassProbe = await request('/api/admin/metrics', {}, null, { 'x-user-id': 'user-admin-1' });
  if (headerBypassProbe.status === 200) {
    console.log(`  [SECURITY ALERT] x-user-id forgery bypass ACTIVE! Received 200 with forged header.`);
    assert(false, 'Header Forgery Vulnerability Check', 'Server accepts unauthenticated x-user-id header to bypass auth!');
  } else {
    assert(true, 'Header Forgery Vulnerability Check', `Server rejected header bypass with status ${headerBypassProbe.status}`);
  }

  console.log(`\n========================================================================`);
  console.log(`TEST EXECUTION SUMMARY:`);
  console.log(`Total Tests Run: ${results.length}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Pass Rate: ${((passedTests / results.length) * 100).toFixed(1)}%`);
  console.log(`========================================================================\n`);

  fs.writeFileSync(
    `qa-test-results-${process.env.TEST_TARGET === 'render' ? 'render' : 'localhost'}.json`, 
    JSON.stringify({ timestamp: new Date().toISOString(), target: TARGET_URL, passedTests, failedTests, results }, null, 2)
  );

  return { passedTests, failedTests, total: results.length };
}

runTestSuite().catch(console.error);
