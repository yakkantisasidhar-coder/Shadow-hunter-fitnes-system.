import React, { useEffect, useState } from 'react';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  Dumbbell,
  CalendarPlus,
  ClipboardCheck,
  Settings2,
  ChevronRight,
  User,
  Timer,
  XCircle,
  Star,
  IndianRupee,
  Activity,
  CalendarDays,
  Sun,
  Moon
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PersonalTrainingSession } from '../../types';

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */

interface TrainerClient {
  id: string;
  name: string;
  membershipType: string;
  nextSession: string | null;
  progressPercent: number;
  avatarInitial: string;
  goal: string;
}

interface ScheduleEntry {
  id: string;
  time: string;
  clientName: string;
  type: '1-on-1' | 'Group';
  status: 'scheduled' | 'completed' | 'cancelled';
  durationMinutes: number;
}

interface SessionHistoryItem {
  id: string;
  date: string;
  clientName: string;
  durationMinutes: number;
  notes: string;
}

interface AvailabilitySlot {
  day: string;
  slots: string[];
}

/* ────────────────────────────────────────────
   Props
   ──────────────────────────────────────────── */

interface TrainerDashboardScreenProps {
  onNavigate: (screen: string) => void;
}

/* ────────────────────────────────────────────
   Component
   ──────────────────────────────────────────── */

export const TrainerDashboardScreen: React.FC<TrainerDashboardScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const gymId = user?.gymId || 'gym-apex-1';

  /* ── State ── */
  const [loading, setLoading] = useState(true);
  const [ptSessions, setPtSessions] = useState<PersonalTrainingSession[]>([]);
  const [clients, setClients] = useState<TrainerClient[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<ScheduleEntry[]>([]);
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);

  /* ── Derived KPIs ── */
  const assignedClientsCount = clients.length;
  const upcomingToday = todaySchedule.filter((s) => s.status === 'scheduled').length;
  const completedThisMonth = sessionHistory.length + todaySchedule.filter((s) => s.status === 'completed').length;
  const revenueGenerated = completedThisMonth * 1500; // avg session rate placeholder

  /* ── Fetch ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try fetching real PT sessions for this trainer
        const sessRes = await api.getPtSessions(gymId);
        const sessions: PersonalTrainingSession[] = sessRes.sessions ?? sessRes ?? [];
        setPtSessions(sessions);
      } catch {
        // API not available — fall through to placeholder data
      }

      // Build well-structured placeholder data for the full trainer experience
      setClients([
        {
          id: 'c1',
          name: 'Arjun Reddy',
          membershipType: 'Personal Training - Gold',
          nextSession: '2026-11-12T09:00:00',
          progressPercent: 72,
          avatarInitial: 'A',
          goal: 'Muscle Building'
        },
        {
          id: 'c2',
          name: 'Sneha Patel',
          membershipType: 'Personal Training - Silver',
          nextSession: '2026-11-12T11:00:00',
          progressPercent: 45,
          avatarInitial: 'S',
          goal: 'Weight Loss'
        },
        {
          id: 'c3',
          name: 'Vikram Sharma',
          membershipType: 'Group Training',
          nextSession: '2026-11-13T07:30:00',
          progressPercent: 88,
          avatarInitial: 'V',
          goal: 'Strength Improvement'
        },
        {
          id: 'c4',
          name: 'Priya Deshmukh',
          membershipType: 'Personal Training - Gold',
          nextSession: '2026-11-12T16:00:00',
          progressPercent: 60,
          avatarInitial: 'P',
          goal: 'General Fitness'
        },
        {
          id: 'c5',
          name: 'Rohan Kulkarni',
          membershipType: 'Personal Training - Silver',
          nextSession: null,
          progressPercent: 33,
          avatarInitial: 'R',
          goal: 'Endurance'
        }
      ]);

      setTodaySchedule([
        { id: 's1', time: '06:30 AM', clientName: 'Arjun Reddy', type: '1-on-1', status: 'completed', durationMinutes: 60 },
        { id: 's2', time: '08:00 AM', clientName: 'Sneha Patel', type: '1-on-1', status: 'completed', durationMinutes: 45 },
        { id: 's3', time: '10:00 AM', clientName: 'Morning Batch', type: 'Group', status: 'scheduled', durationMinutes: 60 },
        { id: 's4', time: '04:00 PM', clientName: 'Priya Deshmukh', type: '1-on-1', status: 'scheduled', durationMinutes: 60 },
        { id: 's5', time: '06:00 PM', clientName: 'Evening Batch', type: 'Group', status: 'scheduled', durationMinutes: 45 },
        { id: 's6', time: '07:30 PM', clientName: 'Vikram Sharma', type: '1-on-1', status: 'cancelled', durationMinutes: 60 }
      ]);

      setSessionHistory([
        { id: 'h1', date: '2026-11-10', clientName: 'Arjun Reddy', durationMinutes: 60, notes: 'Upper body focus – increased bench press to 80kg. Good form maintained.' },
        { id: 'h2', date: '2026-11-10', clientName: 'Sneha Patel', durationMinutes: 45, notes: 'Cardio + core circuit. Heart rate stayed in target zone throughout.' },
        { id: 'h3', date: '2026-11-09', clientName: 'Vikram Sharma', durationMinutes: 60, notes: 'Leg day – squat PR at 120kg. Added Bulgarian split squats.' },
        { id: 'h4', date: '2026-11-09', clientName: 'Priya Deshmukh', durationMinutes: 50, notes: 'Full body HIIT. Improved endurance — reduced rest periods by 10s.' },
        { id: 'h5', date: '2026-11-08', clientName: 'Rohan Kulkarni', durationMinutes: 55, notes: 'Running form drills + tempo run. Pace improving steadily.' },
        { id: 'h6', date: '2026-11-07', clientName: 'Morning Batch', durationMinutes: 60, notes: 'Group bootcamp – 12 participants. High energy.' }
      ]);

      setAvailability([
        { day: 'Monday', slots: ['6:00 AM – 9:00 AM', '4:00 PM – 8:00 PM'] },
        { day: 'Tuesday', slots: ['6:00 AM – 9:00 AM', '4:00 PM – 8:00 PM'] },
        { day: 'Wednesday', slots: ['6:00 AM – 9:00 AM', '4:00 PM – 8:00 PM'] },
        { day: 'Thursday', slots: ['6:00 AM – 9:00 AM', '4:00 PM – 8:00 PM'] },
        { day: 'Friday', slots: ['6:00 AM – 9:00 AM', '4:00 PM – 7:00 PM'] },
        { day: 'Saturday', slots: ['7:00 AM – 12:00 PM'] },
        { day: 'Sunday', slots: [] }
      ]);

      setLoading(false);
    };

    fetchData();
  }, [gymId]);

  /* ── Helpers ── */
  const trainerName = user?.fullName || 'Coach';
  const gymName = user?.gymName || 'Apex Performance Athletic Club';

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/15 text-emerald-400';
      case 'scheduled':
        return 'bg-blue-500/15 text-blue-400';
      case 'cancelled':
        return 'bg-red-500/15 text-red-400';
      default:
        return 'bg-gray-500/15 text-gray-400';
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={13} />;
      case 'scheduled':
        return <Clock size={13} />;
      case 'cancelled':
        return <XCircle size={13} />;
      default:
        return <Clock size={13} />;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatSessionDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not scheduled';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
      ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark">
            Loading your dashboard…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════
          HEADER BANNER
         ═══════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#1e1b2e] to-primary p-6 md:p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZyIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNMCAyMGg0ME0yMCAwdjQwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+')] opacity-40" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider mb-2">
              <Dumbbell size={12} className="text-primary-light" />
              <span>Trainer Portal</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black">
              Trainer Dashboard
            </h2>
            <p className="text-xs text-white/80 mt-1">
              Welcome back, <strong className="text-primary-light">{trainerName}</strong> &bull; {gymName}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md text-center">
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Today</p>
              <p className="text-sm font-black text-white">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 backdrop-blur-md text-center">
              <p className="text-[10px] text-emerald-300/80 font-bold uppercase tracking-wider">Sessions</p>
              <p className="text-sm font-black text-emerald-300">{todaySchedule.length} Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          KPI CARDS ROW
         ═══════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Assigned Clients',
            value: assignedClientsCount,
            icon: <Users size={18} />,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10'
          },
          {
            label: 'Sessions Today',
            value: upcomingToday,
            icon: <Calendar size={18} />,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10'
          },
          {
            label: 'Completed This Month',
            value: completedThisMonth,
            icon: <CheckCircle2 size={18} />,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10'
          },
          {
            label: 'Revenue Generated',
            value: `₹${(revenueGenerated / 1000).toFixed(0)}K`,
            icon: <IndianRupee size={18} />,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10'
          }
        ].map((kpi, idx) => (
          <div
            key={idx}
            className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm"
          >
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${kpi.bg} ${kpi.color} mb-3`}>
              {kpi.icon}
            </div>
            <p className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
              {kpi.value}
            </p>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark font-semibold mt-0.5">
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════
          QUICK ACTION BUTTONS
         ═══════════════════════════════════════ */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onNavigate('gym-pt')}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl gradient-btn-primary text-white text-xs font-bold shadow-lg hover:shadow-xl transition-shadow"
        >
          <CalendarPlus size={14} />
          <span>Schedule Session</span>
        </button>
        <button
          onClick={() => onNavigate('gym-pt')}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-textPrimary-light dark:text-textPrimary-dark text-xs font-bold hover:border-primary transition-colors"
        >
          <ClipboardCheck size={14} />
          <span>Log Completed Session</span>
        </button>
        <button
          onClick={() => onNavigate('gym-pt')}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-textPrimary-light dark:text-textPrimary-dark text-xs font-bold hover:border-primary transition-colors"
        >
          <Settings2 size={14} />
          <span>Update Availability</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════
          MY CLIENTS + TODAY'S SCHEDULE (Side by Side)
         ═══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── My Clients ── */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Users size={18} className="text-primary" />
              <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                My Clients
              </h3>
            </div>
            <span className="text-[10px] font-bold text-surface-mutedLight dark:text-surface-mutedDark">
              {clients.length} Assigned
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {clients.map((client) => (
              <div
                key={client.id}
                className="p-4 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary/40 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-black text-sm">
                      {client.avatarInitial}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-textPrimary-light dark:text-textPrimary-dark">
                        {client.name}
                      </h4>
                      <p className="text-[10px] text-primary dark:text-primary-light font-bold">
                        {client.membershipType}
                      </p>
                      <p className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">
                        Goal: {client.goal}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-surface-mutedLight dark:text-surface-mutedDark opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-borderLight dark:border-surface-borderDark">
                  <div className="flex items-center space-x-1.5 text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">
                    <Calendar size={11} />
                    <span>{formatSessionDate(client.nextSession)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-1.5 rounded-full bg-surface-borderLight dark:bg-surface-borderDark overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all"
                        style={{ width: `${client.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-primary dark:text-primary-light">
                      {client.progressPercent}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Today's Schedule ── */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <CalendarDays size={18} className="text-primary" />
              <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                Today's Schedule
              </h3>
            </div>
            <span className="text-[10px] font-bold text-surface-mutedLight dark:text-surface-mutedDark">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {todaySchedule.map((entry) => (
              <div
                key={entry.id}
                className={`p-4 rounded-2xl border transition-colors ${
                  entry.status === 'completed'
                    ? 'bg-emerald-500/5 border-emerald-500/20 dark:bg-emerald-900/10 dark:border-emerald-500/15'
                    : entry.status === 'cancelled'
                    ? 'bg-red-500/5 border-red-500/20 dark:bg-red-900/10 dark:border-red-500/15'
                    : 'bg-surface-light dark:bg-[#1b1926] border-surface-borderLight dark:border-surface-borderDark'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-center min-w-[50px]">
                      <p className="text-xs font-black text-textPrimary-light dark:text-textPrimary-dark">
                        {entry.time}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-surface-borderLight dark:bg-surface-borderDark" />
                    <div>
                      <h4 className="text-xs font-black text-textPrimary-light dark:text-textPrimary-dark">
                        {entry.clientName}
                      </h4>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-bold ${
                          entry.type === '1-on-1' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                        }`}>
                          {entry.type === '1-on-1' ? <User size={9} /> : <Users size={9} />}
                          <span>{entry.type}</span>
                        </span>
                        <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">
                          {entry.durationMinutes} min
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusColor(entry.status)}`}>
                    {statusIcon(entry.status)}
                    <span className="capitalize">{entry.status}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          SESSION HISTORY
         ═══════════════════════════════════════ */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Activity size={18} className="text-primary" />
            <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
              Session History
            </h3>
          </div>
          <span className="text-[10px] font-bold text-surface-mutedLight dark:text-surface-mutedDark">
            Recent Completed Sessions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-borderLight dark:border-surface-borderDark">
                <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
                  Date
                </th>
                <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
                  Client
                </th>
                <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
                  Duration
                </th>
                <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
                  Session Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {sessionHistory.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-surface-borderLight/50 dark:border-surface-borderDark/50 last:border-0"
                >
                  <td className="py-3 pr-4">
                    <span className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark">
                      {formatDate(item.date)}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs font-bold text-primary dark:text-primary-light">
                      {item.clientName}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="inline-flex items-center space-x-1 text-xs text-textPrimary-light dark:text-textPrimary-dark">
                      <Timer size={12} />
                      <span className="font-bold">{item.durationMinutes} min</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <p className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark max-w-md leading-relaxed line-clamp-2">
                      {item.notes}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          MY AVAILABILITY
         ═══════════════════════════════════════ */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Clock size={18} className="text-primary" />
            <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
              My Availability
            </h3>
          </div>
          <button
            onClick={() => onNavigate('gym-pt')}
            className="text-[10px] font-bold text-primary dark:text-primary-light hover:underline"
          >
            Edit Schedule →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {availability.map((day) => {
            const isOff = day.slots.length === 0;
            return (
              <div
                key={day.day}
                className={`p-3 rounded-2xl border text-center transition-colors ${
                  isOff
                    ? 'bg-red-500/5 border-red-500/15 dark:bg-red-900/10 dark:border-red-500/10'
                    : 'bg-surface-light dark:bg-[#1b1926] border-surface-borderLight dark:border-surface-borderDark'
                }`}
              >
                <p className={`text-xs font-black mb-2 ${
                  isOff
                    ? 'text-red-400'
                    : 'text-textPrimary-light dark:text-textPrimary-dark'
                }`}>
                  {day.day.slice(0, 3)}
                </p>
                {isOff ? (
                  <p className="text-[10px] font-bold text-red-400/70">Day Off</p>
                ) : (
                  <div className="space-y-1.5">
                    {day.slots.map((slot, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-center space-x-1 text-[9px] font-bold text-surface-mutedLight dark:text-surface-mutedDark"
                      >
                        {idx === 0 ? <Sun size={9} className="text-amber-400" /> : <Moon size={9} className="text-blue-400" />}
                        <span>{slot}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          PERFORMANCE SNAPSHOT (bonus)
         ═══════════════════════════════════════ */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1e1b2e] to-[#252330] border border-surface-borderDark shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp size={18} className="text-primary-light" />
          <h3 className="text-sm font-black text-white">
            Performance Snapshot
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Client Retention', value: '92%', icon: <Star size={14} />, color: 'text-amber-400' },
            { label: 'Avg Session Rating', value: '4.8', icon: <Star size={14} />, color: 'text-emerald-400' },
            { label: 'Sessions This Week', value: '18', icon: <Dumbbell size={14} />, color: 'text-blue-400' },
            { label: 'Total Hours Trained', value: '156', icon: <Timer size={14} />, color: 'text-purple-400' }
          ].map((stat, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 ${stat.color} mb-2`}>
                {stat.icon}
              </div>
              <p className="text-xl font-black text-white">{stat.value}</p>
              <p className="text-[10px] text-white/50 font-bold mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
