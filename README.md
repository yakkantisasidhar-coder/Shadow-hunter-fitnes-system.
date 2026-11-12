# SHADOW HUNTER FITNESS SYSTEM
Enterprise Commercial Fitness & Athletic Performance Platform

The **SHADOW HUNTER FITNESS SYSTEM** is a full-stack, production-oriented commercial fitness application built with React 18, TypeScript, Tailwind CSS, and a Node.js Express backend. It features a complete 40-screen architecture supporting individual athletes, connected gym members, commercial gym owners, and central platform super administrators.

> [!NOTE]
> Strictly professional commercial fitness standards: No gaming, RPG, anime, fantasy, or fictional virtual economy mechanics. Styled in modern violet (`#7651D5` Primary, `#A58AF5` Secondary, `#17151F` Dark Surface, `#F6F5F9` Light Surface).

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# In the root folder:
npm run install:all
```

### 2. Build for Production
```bash
# Compile both client and server:
npm run build:client
npm run build:server
```

### 3. Run the Unified Production Server
```bash
cd server
npm start
```
The application will be live at: **`http://localhost:5000`** (serving both the REST API and the complete React PWA application).

### 4. Running Development Servers (Hot Reload)
```bash
# Start backend API (Port 5000)
npm run dev:server

# In a separate terminal, start frontend dev server (Port 5173 with API proxy)
npm run dev:client
```

---

## 👥 Pre-Configured Test Persona Accounts

You can log in or use the **One-Click Persona Switcher** on the top navigation bar to evaluate each account clearance level:

| Role Persona | Email Address | Password | Features / Clearance |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@shadowhunter.com` | `admin123` | Platform oversight, user suspension, gym approvals, RBAC matrix, audit security logs. |
| **Gym Owner** | `owner@apexfitness.com` | `owner123` | Apex Performance Club owner portal, member approvals, trainer management, announcements. |
| **Gym Member** | `member@apexfitness.com` | `member123` | Connected gym dashboard, trainer info, facility tournaments, 50% member discount. |
| **Individual Athlete** | `alex@shadowhunter.com` | `athlete123` | Personalized workout routines, interactive player, macro logging, AI fitness coach. |

---

## 📱 Complete 40-Screen Inventory

1. **Login**: `/login`
2. **Registration**: `/register`
3. **Forgot Password**: `/forgot-password`
4. **Onboarding Assessment**: `/onboarding`
5. **Home Dashboard**: `/home`
6. **Workout Hub**: `/workouts`
7. **Exercise Library**: `/exercises`
8. **Exercise Details**: `/exercise-details`
9. **Workout Programs**: `/programs`
10. **Workout Player**: `/workout-player`
11. **Workout History**: `/workout-history`
12. **Nutrition Dashboard**: `/nutrition`
13. **Meal Planner**: `/meal-planner`
14. **Food Logging**: `/food-log`
15. **AI Fitness Assistant**: `/ai-coach`
16. **Progress Dashboard**: `/progress`
17. **Body Measurements**: `/measurements`
18. **Progress Photos**: `/progress-photos`
19. **Fitness Challenges**: `/challenges`
20. **Achievements**: `/achievements`
21. **Personal Profile**: `/profile`
22. **Body Visualization**: `/body-visualizer`
23. **Gym Dashboard**: `/gym`
24. **Gym Registration**: `/gym-register`
25. **Gym Management**: `/gym-manage`
26. **Gym Member Management**: `/gym-members`
27. **Gym Trainer Management**: `/gym-trainers`
28. **Gym Competitions**: `/gym-competitions`
29. **Leaderboards**: `/leaderboards`
30. **Subscription Plans**: `/subscriptions`
31. **Payment History**: `/payment-history`
32. **Notifications**: `/notifications`
33. **Account Settings**: `/settings`
34. **Privacy & Security**: `/privacy-security`
35. **Super Admin Dashboard**: `/admin`
36. **User Administration**: `/admin-users`
37. **Gym Administration**: `/admin-gyms`
38. **Permission Management**: `/admin-permissions`
39. **Platform Analytics**: `/admin-analytics`
40. **Audit Logs**: `/admin-audit-logs`

---

## 🔒 Security & Data Architecture
- **JWT Authorization**: Bearer tokens with server-side role validation middleware.
- **Data Isolation**: Multi-tenant gym data segregation so members cannot view unauthorized facility data.
- **Payment Verification**: Server-side HMAC SHA256 signature verification for Razorpay transactions.
- **Audit Logging**: Immutable chronological ledger of administrative interventions and role updates.
