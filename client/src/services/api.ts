const API_BASE = '/api';

class ApiService {
  private token: string | null = null;
  private currentUserId: string | null = null;

  constructor() {
    this.token = localStorage.getItem('shadow_token');
    this.currentUserId = localStorage.getItem('shadow_user_id');
  }

  public setToken(token: string | null, userId?: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('shadow_token', token);
    } else {
      localStorage.removeItem('shadow_token');
    }

    if (userId) {
      this.currentUserId = userId;
      localStorage.setItem('shadow_user_id', userId);
    } else if (userId === null) {
      this.currentUserId = null;
      localStorage.removeItem('shadow_user_id');
    }
  }

  public getToken() {
    return this.token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (this.currentUserId) {
      headers['x-user-id'] = this.currentUserId;
    }
    return headers;
  }

  public async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = { ...this.getHeaders(), ...(options.headers as any) };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorData.message || errorMsg;
      } catch (e) {
        // use default error message
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  // Auth
  public login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  public register(payload: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  public getMe() {
    return this.request('/auth/me');
  }

  public updateProfile(data: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public switchAccount(targetRole: string) {
    return this.request('/auth/switch-account', {
      method: 'POST',
      body: JSON.stringify({ targetRole })
    });
  }

  // Workouts
  public getExercises(params?: { muscleGroup?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.muscleGroup) query.append('muscleGroup', params.muscleGroup);
    if (params?.search) query.append('search', params.search);
    return this.request(`/workouts/exercises?${query.toString()}`);
  }

  public getExercise(id: string) {
    return this.request(`/workouts/exercises/${id}`);
  }

  public getPrograms(category?: string) {
    const q = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.request(`/workouts/programs${q}`);
  }

  public getProgram(id: string) {
    return this.request(`/workouts/programs/${id}`);
  }

  public logWorkout(payload: any) {
    return this.request('/workouts/history', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public getWorkoutHistory() {
    return this.request('/workouts/history');
  }

  // Nutrition
  public getTodayNutrition() {
    return this.request('/nutrition/today');
  }

  public logFood(payload: any) {
    return this.request('/nutrition/log-food', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public logWater(amountMl: number, action: 'add' | 'set' = 'add') {
    return this.request('/nutrition/water', {
      method: 'POST',
      body: JSON.stringify({ amountMl, action })
    });
  }

  public getFoodDatabase(query?: string) {
    const q = query ? `?query=${encodeURIComponent(query)}` : '';
    return this.request(`/nutrition/food-database${q}`);
  }

  // AI
  public getChatHistory() {
    return this.request('/ai/history');
  }

  public sendChatMessage(message: string) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }

  // Progress
  public getMeasurements() {
    return this.request('/progress/measurements');
  }

  public logMeasurement(payload: any) {
    return this.request('/progress/measurements', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public getProgressPhotos() {
    return this.request('/progress/photos');
  }

  public logProgressPhoto(payload: any) {
    return this.request('/progress/photos', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public getProgressAnalytics() {
    return this.request('/progress/analytics');
  }

  // Challenges
  public getChallenges() {
    return this.request('/challenges');
  }

  public joinChallenge(id: string) {
    return this.request(`/challenges/${id}/join`, { method: 'POST' });
  }

  public getAchievements() {
    return this.request('/challenges/achievements');
  }

  // Gyms
  public getGyms() {
    return this.request('/gyms');
  }

  public registerGym(payload: any) {
    return this.request('/gyms/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public joinGymByCode(joinCode: string) {
    return this.request('/gyms/join-by-code', {
      method: 'POST',
      body: JSON.stringify({ joinCode })
    });
  }

  public getGymDetails(id: string) {
    return this.request(`/gyms/${id}`);
  }

  public getGymMembers(gymId: string, status?: string, search?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const q = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/gyms/${gymId}/members${q}`);
  }

  public getGymMemberDetails(gymId: string, memberId: string) {
    return this.request(`/gyms/${gymId}/members/${memberId}`);
  }

  public addGymMember(gymId: string, payload: any) {
    return this.request(`/gyms/${gymId}/members`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public updateGymMember(gymId: string, memberId: string, payload: any) {
    return this.request(`/gyms/${gymId}/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  public setGymMemberStatus(gymId: string, memberId: string, status: string) {
    return this.request(`/gyms/${gymId}/members/${memberId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  }

  // Monthly Billing Management
  public getGymInvoices(gymId: string, status?: string, month?: string, search?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (month) params.append('month', month);
    if (search) params.append('search', search);
    const q = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/gyms/${gymId}/invoices${q}`);
  }

  public generateMonthlyBills(gymId: string, billingMonth: string, dueDate?: string) {
    return this.request(`/gyms/${gymId}/invoices/generate-monthly`, {
      method: 'POST',
      body: JSON.stringify({ billingMonth, dueDate })
    });
  }

  public createGymInvoice(gymId: string, payload: any) {
    return this.request(`/gyms/${gymId}/invoices`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public recordInvoicePayment(gymId: string, invoiceId: string, payload: {
    amount?: number;
    paymentMethod: 'cash' | 'upi' | 'online';
    transactionRef?: string;
    notes?: string;
  }) {
    return this.request(`/gyms/${gymId}/invoices/${invoiceId}/record-payment`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public sendPaymentReminder(gymId: string, invoiceId: string) {
    return this.request(`/gyms/${gymId}/invoices/${invoiceId}/remind`, {
      method: 'POST'
    });
  }

  public getGymPayments(gymId: string, method?: string, search?: string) {
    const params = new URLSearchParams();
    if (method) params.append('method', method);
    if (search) params.append('search', search);
    const q = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/gyms/${gymId}/payments${q}`);
  }

  // Financial Analytics & Expenses
  public getGymFinancials(gymId: string) {
    return this.request(`/gyms/${gymId}/financials`);
  }

  public getGymExpenses(gymId: string) {
    return this.request(`/gyms/${gymId}/expenses`);
  }

  public addGymExpense(gymId: string, payload: any) {
    return this.request(`/gyms/${gymId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Operations: Plans, Attendance, Profile
  public getGymPlans(gymId: string) {
    return this.request(`/gyms/${gymId}/plans`);
  }

  public createGymPlan(gymId: string, payload: any) {
    return this.request(`/gyms/${gymId}/plans`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public getGymAttendance(gymId: string, date?: string) {
    const q = date ? `?date=${encodeURIComponent(date)}` : '';
    return this.request(`/gyms/${gymId}/attendance${q}`);
  }

  public checkInMember(gymId: string, memberId: string) {
    return this.request(`/gyms/${gymId}/attendance/check-in`, {
      method: 'POST',
      body: JSON.stringify({ memberId })
    });
  }

  public checkOutMember(gymId: string, attendanceId: string) {
    return this.request(`/gyms/${gymId}/attendance/check-out`, {
      method: 'POST',
      body: JSON.stringify({ attendanceId })
    });
  }

  public updateGymProfile(gymId: string, payload: any) {
    return this.request(`/gyms/${gymId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  public handleGymMemberAction(gymId: string, memberId: string, action: 'approve' | 'reject', trainerId?: string) {
    return this.request(`/gyms/${gymId}/members/${memberId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, assignedTrainerId: trainerId })
    });
  }

  public addGymTrainer(gymId: string, payload: any) {
    return this.request(`/gyms/${gymId}/trainers`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public addGymAnnouncement(gymId: string, payload: any) {
    return this.request(`/gyms/${gymId}/announcements`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public getGymMessages(gymId: string, channel?: 'community' | 'trainer_qa') {
    const q = channel ? `?channel=${channel}` : '';
    return this.request(`/gyms/${gymId}/messages${q}`);
  }

  public postGymMessage(gymId: string, payload: {
    content: string;
    channel?: 'community' | 'trainer_qa';
    targetTrainerId?: string;
    targetTrainerName?: string;
  }) {
    return this.request(`/gyms/${gymId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Subscriptions & Payments
  public getSubscriptionPlans() {
    return this.request('/subscriptions/plans');
  }

  public verifyDiscountCode(code: string, planId: string) {
    return this.request('/subscriptions/verify-discount-code', {
      method: 'POST',
      body: JSON.stringify({ code, planId })
    });
  }

  public createPaymentOrder(planId: string, gymDiscountCode?: string) {
    return this.request('/subscriptions/create-order', {
      method: 'POST',
      body: JSON.stringify({ planId, gymDiscountCode })
    });
  }

  public verifyPayment(payload: any) {
    return this.request('/subscriptions/verify-payment', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public getPaymentHistory() {
    return this.request('/subscriptions/payment-history');
  }

  // Notifications
  public getNotifications() {
    return this.request('/notifications');
  }

  public markNotificationRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: 'POST' });
  }

  public markAllNotificationsRead() {
    return this.request('/notifications/mark-all-read', { method: 'POST' });
  }

  // Super Admin
  public getAdminMetrics() {
    return this.request('/admin/metrics');
  }

  public getAdminUsers(params?: { search?: string; role?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.role) query.append('role', params.role);
    return this.request(`/admin/users?${query.toString()}`);
  }

  public suspendUser(userId: string, suspend: boolean) {
    return this.request(`/admin/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ suspend })
    });
  }

  public assignUserRole(userId: string, payload: { role: string; subRoles?: string[]; gymId?: string }) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public getAdminGyms() {
    return this.request('/admin/gyms');
  }

  public setGymStatus(gymId: string, status: 'approved' | 'suspended' | 'pending') {
    return this.request(`/admin/gyms/${gymId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  }

  public getAdminAuditLogs() {
    return this.request('/admin/audit-logs');
  }

  public getAdminAnalytics() {
    return this.request('/admin/analytics');
  }

  // Super Host: Gym Owner Access Control
  public getGymAccessUsers(search?: string) {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/admin/gym-access/users${q}`);
  }

  public grantGymAccess(payload: {
    userId: string;
    gymIds: string[];
    permissions?: string[];
    role?: 'gym_owner' | 'gym_staff';
  }) {
    return this.request('/admin/gym-access/grant', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public revokeGymAccess(userId: string, gymId: string) {
    return this.request('/admin/gym-access/revoke', {
      method: 'POST',
      body: JSON.stringify({ userId, gymId })
    });
  }

  public toggleGymAccessStatus(userId: string, gymId: string, status: 'active' | 'suspended') {
    return this.request('/admin/gym-access/status', {
      method: 'POST',
      body: JSON.stringify({ userId, gymId, status })
    });
  }

  public updateGymAccessPermissions(userId: string, gymId: string, permissions: string[]) {
    return this.request('/admin/gym-access/permissions', {
      method: 'POST',
      body: JSON.stringify({ userId, gymId, permissions })
    });
  }

  public getGymAccessHistory() {
    return this.request('/admin/gym-access/history');
  }

  // ==========================================
  // PERSONAL TRAINING MODULE
  // ==========================================
  public getPtPackages(gymId: string) {
    return this.request(`/gyms/${gymId}/pt/packages`);
  }

  public createPtPackage(gymId: string, payload: any) {
    return this.request(`/gyms/${gymId}/pt/packages`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public updatePtPackage(gymId: string, pkgId: string, payload: any) {
    return this.request(`/gyms/${gymId}/pt/packages/${pkgId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  public getPtSessions(gymId: string, params?: { trainerId?: string; memberId?: string; status?: string }) {
    const q = new URLSearchParams();
    if (params?.trainerId) q.append('trainerId', params.trainerId);
    if (params?.memberId) q.append('memberId', params.memberId);
    if (params?.status) q.append('status', params.status);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return this.request(`/gyms/${gymId}/pt/sessions${qs}`);
  }

  public schedulePtSession(gymId: string, payload: any) {
    return this.request(`/gyms/${gymId}/pt/sessions`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public completePtSession(gymId: string, sessId: string, notes?: string) {
    return this.request(`/gyms/${gymId}/pt/sessions/${sessId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ sessionNotes: notes })
    });
  }

  public cancelPtSession(gymId: string, sessId: string) {
    return this.request(`/gyms/${gymId}/pt/sessions/${sessId}/cancel`, {
      method: 'POST'
    });
  }

  public getPtTrainers(gymId: string) {
    return this.request(`/gyms/${gymId}/pt/trainers`);
  }

  public updateTrainerAvailability(gymId: string, trainerId: string, payload: any) {
    return this.request(`/gyms/${gymId}/pt/trainers/${trainerId}/availability`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public assignPtTrainer(gymId: string, payload: { memberId: string; trainerId: string; packageId?: string }) {
    return this.request(`/gyms/${gymId}/pt/assign-trainer`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public generatePtInvoice(gymId: string, payload: { memberId: string; packageId: string; dueDate?: string }) {
    return this.request(`/gyms/${gymId}/pt/invoices/generate`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public getPtReports(gymId: string) {
    return this.request(`/gyms/${gymId}/pt/reports`);
  }

  // ==========================================
  // GYM CLAIMS & SUPER ADMIN GYM NETWORK
  // ==========================================
  public claimGym(gymId: string, payload: any) {
    return this.request(`/gyms/${gymId}/claim`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public getAdminGymNetwork() {
    return this.request('/admin/gym-network');
  }

  public getAdminClaims() {
    return this.request('/admin/claims');
  }

  public reviewGymClaim(claimId: string, payload: { status: 'approved' | 'rejected' | 'under_review'; reviewNotes?: string }) {
    return this.request(`/admin/claims/${claimId}/review`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public setGymOwnership(gymId: string, payload: { newOwnerUserId?: string; revokeOnly?: boolean; notes?: string }) {
    return this.request(`/admin/gym-network/${gymId}/ownership`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public getGymOwnershipHistory(gymId: string) {
    return this.request(`/admin/gym-network/${gymId}/history`);
  }

  // ==========================================
  // SUPER ADMIN – MY TEAM
  // ==========================================
  public getAdminTeam() {
    return this.request('/admin/team');
  }

  public inviteTeamMember(payload: any) {
    return this.request('/admin/team/invite', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public updateTeamMemberPermissions(memberId: string, payload: any) {
    return this.request(`/admin/team/${memberId}/permissions`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public setTeamMemberStatus(memberId: string, status: 'active' | 'suspended' | 'revoked') {
    return this.request(`/admin/team/${memberId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  }

  public removeTeamMember(memberId: string) {
    return this.request(`/admin/team/${memberId}`, {
      method: 'DELETE'
    });
  }

  public getTeamAuditLogs() {
    return this.request('/admin/team/audit');
  }

  // ==========================================
  // WHITE-LABEL BRANDING & GALLERY
  // ==========================================
  public getGymBranding(gymId: string) {
    return this.request(`/gyms/${gymId}/branding`);
  }

  public updateGymBranding(gymId: string, payload: any) {
    return this.request(`/gyms/${gymId}/branding`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  public getGymGallery(gymId: string) {
    return this.request(`/gyms/${gymId}/gallery`);
  }

  public addGymGalleryImage(gymId: string, payload: { imageUrl: string; caption?: string }) {
    return this.request(`/gyms/${gymId}/gallery`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public deleteGymGalleryImage(gymId: string, imageId: string) {
    return this.request(`/gyms/${gymId}/gallery/${imageId}`, {
      method: 'DELETE'
    });
  }

  public reorderGymGallery(gymId: string, orderedImageIds: string[]) {
    return this.request(`/gyms/${gymId}/gallery/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ orderedImageIds })
    });
  }

  // ==========================================
  // PERFORMANCE LEADERBOARDS
  // ==========================================
  public getGymLeaderboards(period: 'monthly' | 'quarterly' | 'yearly' = 'monthly') {
    return this.request(`/leaderboards/gyms?period=${period}`);
  }

  public getMemberLeaderboards(params?: { gymId?: string; search?: string }) {
    const q = new URLSearchParams();
    if (params?.gymId) q.append('gymId', params.gymId);
    if (params?.search) q.append('search', params.search);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return this.request(`/leaderboards/members${qs}`);
  }

  // ==========================================
  // WHATSAPP COMMUNICATION & FOLLOW-UPS
  // ==========================================

  public getGymWhatsAppStatus(gymId: string) {
    return this.request(`/gyms/whatsapp/${gymId}/status`);
  }

  public connectGymWhatsApp(gymId: string, payload: any) {
    return this.request(`/gyms/whatsapp/${gymId}/connect`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public disconnectGymWhatsApp(gymId: string) {
    return this.request(`/gyms/whatsapp/${gymId}/disconnect`, {
      method: 'POST'
    });
  }

  public getGymWhatsAppTemplates(gymId: string) {
    return this.request(`/gyms/whatsapp/${gymId}/templates`);
  }

  public createGymWhatsAppTemplate(gymId: string, payload: any) {
    return this.request(`/gyms/whatsapp/${gymId}/templates`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public getGymWhatsAppCampaigns(gymId: string) {
    return this.request(`/gyms/whatsapp/${gymId}/campaigns`);
  }

  public previewGymWhatsAppCampaign(gymId: string, payload: any) {
    return this.request(`/gyms/whatsapp/${gymId}/campaigns/preview`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public dispatchGymWhatsAppCampaign(gymId: string, payload: any) {
    return this.request(`/gyms/whatsapp/${gymId}/campaigns/dispatch`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public getGymWhatsAppAutomations(gymId: string) {
    return this.request(`/gyms/whatsapp/${gymId}/automations`);
  }

  public updateGymWhatsAppAutomations(gymId: string, payload: any) {
    return this.request(`/gyms/whatsapp/${gymId}/automations`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  public getGymWhatsAppPosters(gymId: string) {
    return this.request(`/gyms/whatsapp/${gymId}/posters`);
  }

  public saveGymWhatsAppPoster(gymId: string, payload: any) {
    return this.request(`/gyms/whatsapp/${gymId}/posters`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public generateAiGymPoster(gymId: string, payload: { prompt: string; category?: string; subCategory?: string }) {
    return this.request(`/gyms/whatsapp/${gymId}/posters/ai-generate`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public getGymWhatsAppHistory(gymId: string, params?: { category?: string; status?: string; search?: string }) {
    const q = new URLSearchParams();
    if (params?.category) q.append('category', params.category);
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return this.request(`/gyms/whatsapp/${gymId}/history${qs}`);
  }

  public updateMemberWhatsAppConsent(gymId: string, payload: any) {
    return this.request(`/gyms/whatsapp/${gymId}/consent`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public getSuperAdminWhatsAppHealth() {
    return this.request('/admin/whatsapp-health');
  }

  // ==========================================
  // PUBLIC PROFILES & EXPANDED LEADERBOARDS
  // ==========================================

  public getPublicGym(id: string) {
    return this.request(`/public/gyms/${id}`);
  }

  public getPublicTrainer(id: string) {
    return this.request(`/public/trainers/${id}`);
  }

  public getPublicMember(id: string) {
    return this.request(`/public/members/${id}`);
  }

  public getGymLeaderboard(params?: { period?: string; scope?: string; state?: string; district?: string }) {
    const q = new URLSearchParams();
    if (params?.period) q.append('period', params.period);
    if (params?.scope) q.append('scope', params.scope);
    if (params?.state) q.append('state', params.state);
    if (params?.district) q.append('district', params.district);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return this.request(`/leaderboards/gyms${qs}`);
  }

  public getMemberLeaderboard(params?: { gymId?: string; search?: string; scope?: string; state?: string; district?: string }) {
    const q = new URLSearchParams();
    if (params?.gymId) q.append('gymId', params.gymId);
    if (params?.search) q.append('search', params.search);
    if (params?.scope) q.append('scope', params.scope);
    if (params?.state) q.append('state', params.state);
    if (params?.district) q.append('district', params.district);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return this.request(`/leaderboards/members${qs}`);
  }

  public getTrainerLeaderboard(params?: { gymId?: string; search?: string; scope?: string; state?: string; district?: string }) {
    const q = new URLSearchParams();
    if (params?.gymId) q.append('gymId', params.gymId);
    if (params?.search) q.append('search', params.search);
    if (params?.scope) q.append('scope', params.scope);
    if (params?.state) q.append('state', params.state);
    if (params?.district) q.append('district', params.district);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return this.request(`/leaderboards/trainers${qs}`);
  }

  public updateGymPublicProfile(gymId: string, payload: any) {
    return this.request(`/gyms/${gymId}/public-profile`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  public updateMemberPrivacySettings(payload: any) {
    return this.request('/auth/privacy-settings', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  public verifyGymWebsite(payload: { gymId: string; action: 'verify' | 'flag' | 'unverify'; reviewNotes?: string }) {
    return this.request('/admin/verify-gym-website', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public verifyTrainerCertification(payload: { trainerId: string; certName: string; verified: boolean }) {
    return this.request('/admin/verify-trainer-certification', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}

export const api = new ApiService();
