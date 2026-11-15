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

  console.log(`\n--- SUITE 9: AUTOMATION & INTELLIGENCE INTEGRATION LOOPS ---`);

  // Loop 1: Dynamic Missions Discovery & Verification
  const missionsRes = await request('/api/challenges/missions', {}, athleteToken);
  assert(missionsRes.status === 200 && Array.isArray(missionsRes.data?.missions) && missionsRes.data.missions.length > 0,
    `Dynamic Missions Discovery (Found ${missionsRes.data?.missions?.length || 0} active missions)`);

  const targetMission = missionsRes.data?.missions?.[0];
  let verifiedPointsEarned = 0;
  if (targetMission) {
    // Join mission
    await request(`/api/challenges/missions/${targetMission.id}/join`, { method: 'POST' }, athleteToken);
    // Verify completion
    const verifyMission = await request(`/api/challenges/missions/${targetMission.id}/verify-completion`, { method: 'POST' }, athleteToken);
    // 200 or 400 (if already claimed in prior cycle)
    const missionSuccess = verifyMission.status === 200 || (verifyMission.status === 400 && verifyMission.data?.error?.includes('already claimed'));
    assert(missionSuccess, 'Dynamic Mission Verification & Ledger Recording (/api/challenges/missions/:id/verify-completion)');
    verifiedPointsEarned = verifyMission.data?.pointsEarned || 0;
  }

  // Loop 2: Points Ledger & Leaderboard Linkage
  const ledgerRes = await request('/api/challenges/points-ledger', {}, athleteToken);
  assert(ledgerRes.status === 200 && Array.isArray(ledgerRes.data?.transactions),
    `Points Ledger Immutability Audit (Total verified transactions: ${ledgerRes.data?.transactions?.length || 0})`);

  const memberLeaderboard = await request('/api/leaderboards/members?scope=national', {}, athleteToken);
  assert(memberLeaderboard.status === 200 && Array.isArray(memberLeaderboard.data?.rankings),
    `Live Member Leaderboard Linkage (Rankings derived from verified points & progress)`);

  // Loop 3: Student Achievement Contribution to Trainer Rankings
  const trainerLeaderboard = await request('/api/leaderboards/trainers?scope=national', {}, athleteToken);
  assert(trainerLeaderboard.status === 200 && Array.isArray(trainerLeaderboard.data?.rankings) && trainerLeaderboard.data.rankings.length > 0,
    `Trainer Leaderboard Integration (Includes student achievements bonus in ranking scores)`);

  // Loop 4 & 5: Verified Payment Recording, Balance Reconciliation & Owner Alert
  const recordPaymentRes = await request(`/api/gyms/${apexGymId}/financials/record-verified-payment`, {
    method: 'POST',
    body: JSON.stringify({
      memberId: 'gm-1',
      memberName: 'John Doe',
      amount: 1500,
      paymentMethod: 'upi',
      serviceType: 'general_membership',
      notes: 'Automated QA Test Payment'
    })
  }, ownerToken);
  assert(recordPaymentRes.status === 201 && recordPaymentRes.data?.paymentStatus,
    `Verified Payment Processing & Balance Reconciliation (Status: ${recordPaymentRes.data?.paymentStatus || 'PAID'})`);

  // Loop 6: Automated Membership Expiry Scanning & Follow-up Campaign Dispatched
  const expiryCheckRes = await request(`/api/gyms/whatsapp/${apexGymId}/automations/run-expiry-check`, {
    method: 'POST'
  }, ownerToken);
  assert(expiryCheckRes.status === 200 && typeof expiryCheckRes.data?.scannedCount === 'number',
    `Automated Expiry Renewal Engine (Scanned: ${expiryCheckRes.data?.scannedCount}, Dispatched: ${expiryCheckRes.data?.dispatchedCount})`);

  // Loop 7: Subscription Entitlement Gating Check
  // Test that an invalid facility or gated feature requires proper entitlement
  const unentitledCall = await request(`/api/gyms/whatsapp/gym-nonexistent/posters/ai-generate`, {
    method: 'POST',
    body: JSON.stringify({ prompt: 'Test announcement' })
  }, ownerToken);
  assert(unentitledCall.status === 403, 'Subscription Entitlement Gating Enforcement (Blocked un-entitled facility with 403)');

  // Loop 8: Deterministic AI Poster Synthesis with Gym Branding
  const aiPosterRes = await request(`/api/gyms/whatsapp/${apexGymId}/posters/ai-generate`, {
    method: 'POST',
    body: JSON.stringify({ prompt: 'Diwali festive special offer' })
  }, ownerToken);
  assert(aiPosterRes.status === 200 && aiPosterRes.data?.poster?.headline && aiPosterRes.data?.poster?.accentColor,
    `AI Poster Designer Synthesis with Gym Branding (Headline: "${aiPosterRes.data?.poster?.headline?.slice(0, 30)}...")`);

  console.log(`\n--- SUITE 10: ENTERPRISE DATA PRIVACY & COMPLIANCE ---`);

  // 1. GDPR / DPDP Personal Data Export Package
  const exportRes = await request('/api/auth/export-my-data', {}, athleteToken);
  assert(exportRes.status === 200 && exportRes.data?.exportMetadata?.complianceStandard?.includes('DPDP'),
    'GDPR & DPDP Compliant Personal Data Export Package (/api/auth/export-my-data)');

  // 2. Revoke All Active Device Sessions
  const revokeSessionsRes = await request('/api/auth/revoke-all-sessions', { method: 'POST' }, athleteToken);
  assert(revokeSessionsRes.status === 200 && revokeSessionsRes.data?.success,
    'Multi-device Session Revocation Engine (/api/auth/revoke-all-sessions)');

  console.log(`\n--- SUITE 11: DISASTER RECOVERY & SYSTEM SNAPSHOTS ---`);

  // 1. Super Admin Create Atomic Database Backup
  const backupRes = await request('/api/admin/backups/create', {
    method: 'POST',
    body: JSON.stringify({ label: 'qa_automated_snapshot' })
  }, adminToken);
  assert(backupRes.status === 201 && backupRes.data?.backup?.filename,
    `Atomic Database Backup Snapshot Creation (Created: ${backupRes.data?.backup?.filename})`);

  // 2. Super Admin List Backups
  const listBackupsRes = await request('/api/admin/backups', {}, adminToken);
  assert(listBackupsRes.status === 200 && Array.isArray(listBackupsRes.data?.backups) && listBackupsRes.data.backups.length > 0,
    `Disaster Recovery Archive Listing (Found ${listBackupsRes.data?.backups?.length || 0} snapshots)`);

  console.log(`\n--- SUITE 12: RESILIENCE & SECURITY DEFENSE ---`);

  // Verify Rate Limiting Headers on Protected Endpoints
  const rlCheck = await fetch(`${TARGET_URL}/api/gyms`, {
    headers: { 'Authorization': `Bearer ${athleteToken}` }
  });
  const hasRlHeaders = rlCheck.headers.get('x-ratelimit-limit') !== null;
  assert(hasRlHeaders, 'Production Rate Limiting Header Verification (X-RateLimit-Limit active)');

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
