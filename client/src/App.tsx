import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { MainLayout } from './components/layout/MainLayout';

// Auth Screens (1-4)
import { LoginScreen } from './screens/auth/LoginScreen';
import { RegisterScreen } from './screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from './screens/auth/ForgotPasswordScreen';
import { OnboardingScreen } from './screens/auth/OnboardingScreen';

// Home & Workouts (5-11)
import { HomeScreen } from './screens/dashboard/HomeScreen';
import { WorkoutDashboardScreen } from './screens/workouts/WorkoutDashboardScreen';
import { ExerciseLibraryScreen } from './screens/workouts/ExerciseLibraryScreen';
import { ExerciseDetailsScreen } from './screens/workouts/ExerciseDetailsScreen';
import { WorkoutProgramsScreen } from './screens/workouts/WorkoutProgramsScreen';
import { WorkoutPlayerScreen } from './screens/workouts/WorkoutPlayerScreen';
import { WorkoutHistoryScreen } from './screens/workouts/WorkoutHistoryScreen';

// Nutrition (12-14)
import { NutritionDashboardScreen } from './screens/nutrition/NutritionDashboardScreen';
import { MealPlannerScreen } from './screens/nutrition/MealPlannerScreen';
import { FoodLoggingScreen } from './screens/nutrition/FoodLoggingScreen';

// AI Coach (15)
import { AiCoachScreen } from './screens/ai/AiCoachScreen';

// Progress & Body (16-22)
import { ProgressDashboardScreen } from './screens/progress/ProgressDashboardScreen';
import { BodyMeasurementsScreen } from './screens/progress/BodyMeasurementsScreen';
import { ProgressPhotosScreen } from './screens/progress/ProgressPhotosScreen';
import { FitnessChallengesScreen } from './screens/challenges/FitnessChallengesScreen';
import { AchievementsScreen } from './screens/challenges/AchievementsScreen';
import { ProfileScreen } from './screens/profile/ProfileScreen';
import { BodyVisualizerScreen } from './screens/progress/BodyVisualizerScreen';

// Gym & Community (23-30)
import { GymDashboardScreen } from './screens/gym/GymDashboardScreen';
import { GymRegistrationScreen } from './screens/gym/GymRegistrationScreen';
import { GymManagementScreen } from './screens/gym/GymManagementScreen';
import { GymMemberManagementScreen } from './screens/gym/GymMemberManagementScreen';
import { GymTrainerManagementScreen } from './screens/gym/GymTrainerManagementScreen';
import { GymCompetitionsScreen } from './screens/gym/GymCompetitionsScreen';
import { LeaderboardsScreen } from './screens/gym/LeaderboardsScreen';
import { GymCommunityScreen } from './screens/gym/GymCommunityScreen';
import { GymBillingScreen } from './screens/gym/GymBillingScreen';
import { GymFinancialsScreen } from './screens/gym/GymFinancialsScreen';
import { GymOperationsScreen } from './screens/gym/GymOperationsScreen';
import { GymPersonalTrainingScreen } from './screens/gym/GymPersonalTrainingScreen';
import { GymBrandingScreen } from './screens/gym/GymBrandingScreen';
import { GymWhatsAppCommunicationScreen } from './screens/gym/GymWhatsAppCommunicationScreen';

// Trainer Dashboard
import { TrainerDashboardScreen } from './screens/trainer/TrainerDashboardScreen';

// Subscriptions & Payments (30-31)
import { SubscriptionPlansScreen } from './screens/subscriptions/SubscriptionPlansScreen';
import { PaymentHistoryScreen } from './screens/subscriptions/PaymentHistoryScreen';

// Settings & Notifications (32-34)
import { NotificationsScreen } from './screens/settings/NotificationsScreen';
import { AccountSettingsScreen } from './screens/settings/AccountSettingsScreen';
import { PrivacySecurityScreen } from './screens/settings/PrivacySecurityScreen';

// Super Admin (35-41)
import { SuperAdminDashboardScreen } from './screens/admin/SuperAdminDashboardScreen';
import { UserAdministrationScreen } from './screens/admin/UserAdministrationScreen';
import { GymAdministrationScreen } from './screens/admin/GymAdministrationScreen';
import { PermissionManagementScreen } from './screens/admin/PermissionManagementScreen';
import { PlatformAnalyticsScreen } from './screens/admin/PlatformAnalyticsScreen';
import { AuditLogsScreen } from './screens/admin/AuditLogsScreen';
import { GymAccessControlScreen } from './screens/admin/GymAccessControlScreen';
import { AdminGymNetworkScreen } from './screens/admin/AdminGymNetworkScreen';
import { AdminMyTeamScreen } from './screens/admin/AdminMyTeamScreen';
import { SuperHostSubscriptionCentreScreen } from './screens/admin/SuperHostSubscriptionCentreScreen';

// Public Profiles
import { PublicGymProfileScreen } from './screens/public/PublicGymProfileScreen';
import { PublicTrainerProfileScreen } from './screens/public/PublicTrainerProfileScreen';
import { PublicMemberProfileScreen } from './screens/public/PublicMemberProfileScreen';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [screenParam, setScreenParam] = useState<string | undefined>(undefined);

  const navigate = (screen: string, param?: string) => {
    setCurrentScreen(screen);
    setScreenParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-surface-light dark:bg-surface-dark space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-xl font-black shadow-xl animate-pulse">
          SH
        </div>
        <p className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark uppercase tracking-widest">
          Calibrating Shadow Hunter Fitness System...
        </p>
      </div>
    );
  }

  // Standalone Fullscreen Auth Routes (Screens 1 to 4)
  if (currentScreen === 'login') {
    return <LoginScreen onNavigate={navigate} />;
  }
  if (currentScreen === 'register') {
    return <RegisterScreen onNavigate={navigate} />;
  }
  if (currentScreen === 'forgot-password') {
    return <ForgotPasswordScreen onNavigate={navigate} />;
  }
  if (currentScreen === 'onboarding') {
    return <OnboardingScreen onNavigate={navigate} />;
  }

  // Active Screen Switcher for Main App
  const renderScreen = () => {
    switch (currentScreen) {
      // Training & Workouts
      case 'home':
        return <HomeScreen onNavigate={navigate} />;
      case 'workouts':
        return <WorkoutDashboardScreen onNavigate={navigate} />;
      case 'exercises':
        return <ExerciseLibraryScreen onNavigate={navigate} />;
      case 'exercise-details':
        return <ExerciseDetailsScreen exerciseId={screenParam} onNavigate={navigate} />;
      case 'programs':
        return <WorkoutProgramsScreen onNavigate={navigate} />;
      case 'workout-player':
        return <WorkoutPlayerScreen programId={screenParam} onNavigate={navigate} />;
      case 'workout-history':
        return <WorkoutHistoryScreen onNavigate={navigate} />;

      // Nutrition
      case 'nutrition':
        return <NutritionDashboardScreen onNavigate={navigate} />;
      case 'meal-planner':
        return <MealPlannerScreen onNavigate={navigate} />;
      case 'food-log':
        return <FoodLoggingScreen onNavigate={navigate} />;

      // AI Coach
      case 'ai-coach':
        return <AiCoachScreen onNavigate={navigate} />;

      // Progress & Body
      case 'progress':
        return <ProgressDashboardScreen onNavigate={navigate} />;
      case 'measurements':
        return <BodyMeasurementsScreen onNavigate={navigate} />;
      case 'progress-photos':
        return <ProgressPhotosScreen onNavigate={navigate} />;
      case 'body-visualizer':
        return <BodyVisualizerScreen onNavigate={navigate} />;

      // Challenges & Achievements
      case 'challenges':
        return <FitnessChallengesScreen onNavigate={navigate} />;
      case 'achievements':
        return <AchievementsScreen onNavigate={navigate} />;
      case 'profile':
        return <ProfileScreen onNavigate={navigate} />;

      // Gym & Community
      case 'gym':
        return <GymDashboardScreen onNavigate={navigate} />;
      case 'gym-register':
        return <GymRegistrationScreen onNavigate={navigate} />;
      case 'gym-manage':
        return <GymManagementScreen onNavigate={navigate} />;
      case 'gym-members':
        return <GymMemberManagementScreen onNavigate={navigate} />;
      case 'gym-billing':
        return <GymBillingScreen onNavigate={navigate} />;
      case 'gym-financials':
        return <GymFinancialsScreen onNavigate={navigate} />;
      case 'gym-operations':
        return <GymOperationsScreen onNavigate={navigate} />;
      case 'gym-pt':
        return <GymPersonalTrainingScreen onNavigate={navigate} />;
      case 'gym-branding':
        return <GymBrandingScreen onNavigate={navigate} />;
      case 'gym-whatsapp':
        return <GymWhatsAppCommunicationScreen onNavigate={navigate} />;
      case 'gym-trainers':
        return <GymTrainerManagementScreen onNavigate={navigate} />;
      case 'gym-competitions':
        return <GymCompetitionsScreen onNavigate={navigate} />;
      case 'gym-community':
        return <GymCommunityScreen onNavigate={navigate} />;
      case 'leaderboards':
        return <LeaderboardsScreen onNavigate={navigate} />;

      // Public Profiles
      case 'public-gym':
        return <PublicGymProfileScreen gymId={screenParam || 'gym-apex-1'} onNavigate={navigate} />;
      case 'public-trainer':
        return <PublicTrainerProfileScreen trainerId={screenParam || 'trainer-1'} onNavigate={navigate} />;
      case 'public-member':
        return <PublicMemberProfileScreen memberId={screenParam || 'user-athlete-1'} onNavigate={navigate} />;

      // Trainer Dashboard
      case 'trainer-dashboard':
        return <TrainerDashboardScreen onNavigate={navigate} />;

      // Subscriptions & Payments
      case 'subscriptions':
        return <SubscriptionPlansScreen onNavigate={navigate} />;
      case 'payment-history':
        return <PaymentHistoryScreen onNavigate={navigate} />;

      // Settings & Notifications
      case 'notifications':
        return <NotificationsScreen onNavigate={navigate} />;
      case 'settings':
        return <AccountSettingsScreen onNavigate={navigate} />;
      case 'privacy-security':
        return <PrivacySecurityScreen onNavigate={navigate} />;

      // Super Admin Control Panel
      case 'admin':
        return <SuperAdminDashboardScreen onNavigate={navigate} />;
      case 'admin-users':
        return <UserAdministrationScreen onNavigate={navigate} />;
      case 'admin-gyms':
        return <GymAdministrationScreen onNavigate={navigate} />;
      case 'admin-permissions':
        return <PermissionManagementScreen onNavigate={navigate} />;
      case 'admin-gym-access':
        return <GymAccessControlScreen onNavigate={navigate} />;
      case 'admin-analytics':
        return <PlatformAnalyticsScreen onNavigate={navigate} />;
      case 'admin-audit-logs':
        return <AuditLogsScreen onNavigate={navigate} />;
      case 'admin-gym-network':
        return <AdminGymNetworkScreen onNavigate={navigate} />;
      case 'admin-team':
        return <AdminMyTeamScreen onNavigate={navigate} />;
      case 'admin-subscription-centre':
        return <SuperHostSubscriptionCentreScreen onNavigate={navigate} />;

      default:
        return <HomeScreen onNavigate={navigate} />;
    }
  };

  return (
    <MainLayout currentScreen={currentScreen} onNavigate={navigate}>
      {renderScreen()}
    </MainLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
