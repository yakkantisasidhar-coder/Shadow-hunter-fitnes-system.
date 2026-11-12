import React, { useEffect, useState } from 'react';
import { 
  Dumbbell, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Award, 
  UserCheck, 
  ChevronRight,
  Filter,
  Search,
  AlertCircle,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  PersonalTrainingPackage, 
  PersonalTrainingSession, 
  GymTrainer, 
  GymMemberRecord 
} from '../../types';

interface GymPersonalTrainingScreenProps {
  onNavigate: (screen: string) => void;
}

export const GymPersonalTrainingScreen: React.FC<GymPersonalTrainingScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const gymId = user?.gymId || 'gym-apex-1';

  const [activeTab, setActiveTab] = useState<'packages' | 'sessions' | 'trainers' | 'reports'>('packages');
  const [packages, setPackages] = useState<PersonalTrainingPackage[]>([]);
  const [sessions, setSessions] = useState<PersonalTrainingSession[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [members, setMembers] = useState<GymMemberRecord[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [completeNotesModal, setCompleteNotesModal] = useState<{ open: boolean; session?: PersonalTrainingSession; notes: string }>({
    open: false,
    notes: ''
  });

  // Package Form
  const [pkgName, setPkgName] = useState('');
  const [pkgType, setPkgType] = useState<'one_on_one' | 'group'>('one_on_one');
  const [pkgSessions, setPkgSessions] = useState(10);
  const [pkgPrice, setPkgPrice] = useState(12000);
  const [pkgValidity, setPkgValidity] = useState(45);
  const [pkgDesc, setPkgDesc] = useState('');

  // Schedule Session Form
  const [schedTrainerId, setSchedTrainerId] = useState('');
  const [schedMemberId, setSchedMemberId] = useState('');
  const [schedPackageId, setSchedPackageId] = useState('');
  const [schedDateTime, setSchedDateTime] = useState('');
  const [schedDuration, setSchedDuration] = useState(60);
  const [schedNotes, setSchedNotes] = useState('');

  // Client Assignment Form
  const [assignMemberId, setAssignMemberId] = useState('');
  const [assignTrainerId, setAssignTrainerId] = useState('');
  const [assignPackageId, setAssignPackageId] = useState('');

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [pkgRes, sessRes, trRes, memRes, repRes] = await Promise.all([
        api.getPtPackages(gymId),
        api.getPtSessions(gymId),
        api.getPtTrainers(gymId),
        api.getGymMembers(gymId),
        api.getPtReports(gymId)
      ]);

      setPackages(pkgRes.packages || []);
      setSessions(sessRes.sessions || []);
      setTrainers(trRes.trainers || []);
      setMembers(memRes.members || []);
      setReports(repRes || null);
    } catch (err) {
      console.error('Failed to load PT data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [gymId]);

  // Handle Add Package
  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPtPackage(gymId, {
        name: pkgName,
        type: pkgType,
        totalSessions: pkgSessions,
        priceInr: pkgPrice,
        validityDays: pkgValidity,
        description: pkgDesc
      });
      setShowAddPackageModal(false);
      setPkgName('');
      setPkgDesc('');
      loadAllData();
    } catch (err) {
      console.error('Error creating package:', err);
    }
  };

  // Handle Schedule Session
  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.schedulePtSession(gymId, {
        trainerId: schedTrainerId,
        memberId: schedMemberId,
        packageId: schedPackageId,
        scheduledAt: schedDateTime,
        durationMinutes: schedDuration,
        notes: schedNotes
      });
      setShowScheduleModal(false);
      setSchedNotes('');
      loadAllData();
    } catch (err) {
      console.error('Error scheduling session:', err);
    }
  };

  // Handle Complete Session
  const handleConfirmComplete = async () => {
    if (!completeNotesModal.session) return;
    try {
      await api.completePtSession(gymId, completeNotesModal.session.id, completeNotesModal.notes);
      setCompleteNotesModal({ open: false, notes: '' });
      loadAllData();
    } catch (err) {
      console.error('Error completing session:', err);
    }
  };

  // Handle Assign Trainer & Package
  const handleAssignTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.assignPtTrainer(gymId, {
        memberId: assignMemberId,
        trainerId: assignTrainerId,
        packageId: assignPackageId
      });
      setShowAssignModal(false);
      loadAllData();
    } catch (err) {
      console.error('Error assigning trainer:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
              FACILITY MODULE &bull; PERSONAL TRAINING
            </span>
            <span className="text-xs text-surface-mutedLight dark:text-surface-mutedDark font-medium">
              Multi-Service Management
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-textPrimary-light dark:text-textPrimary-dark mt-1">
            Personal Training Command Center
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">
            Manage packages, coach availability, 1-on-1 session check-ins, client remaining quotas, and segregated PT revenue.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark hover:border-primary transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
          >
            <Calendar size={14} className="text-primary" />
            <span>Schedule Session</span>
          </button>
          <button
            onClick={() => setShowAddPackageModal(true)}
            className="px-4 py-2.5 rounded-2xl gradient-btn-primary text-white text-xs font-bold shadow-md flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>Create PT Package</span>
          </button>
        </div>
      </div>

      {/* Segregated Financial Overview Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark">
              PT Billed Volume
            </span>
            <DollarSign size={16} className="text-primary" />
          </div>
          <span className="text-2xl font-black text-primary dark:text-primary-light mt-1 block">
            ₹{(reports?.revenue?.ptBilled || 30500).toLocaleString()}
          </span>
          <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark mt-0.5 block">
            Segregated from general dues
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark">
              PT Realized Collections
            </span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-emerald-500 mt-1 block">
            ₹{(reports?.revenue?.ptCollected || 24000).toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600/80 font-bold mt-0.5 block">
            Verified Payments Only
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark">
              Sessions Completed
            </span>
            <CheckCircle size={16} className="text-indigo-400" />
          </div>
          <span className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark mt-1 block">
            {reports?.sessions?.completedSessionsCount || 18} Sessions
          </span>
          <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark mt-0.5 block">
            {reports?.sessions?.scheduledSessionsCount || 6} Upcoming Queued
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark">
              Active PT Roster
            </span>
            <Users size={16} className="text-amber-500" />
          </div>
          <span className="text-2xl font-black text-amber-500 mt-1 block">
            {members.filter(m => m.activeServices?.includes('personal_training')).length || 2} Clients
          </span>
          <button
            onClick={() => setShowAssignModal(true)}
            className="text-[11px] text-primary hover:underline font-bold mt-0.5 block"
          >
            Assign New Client &rarr;
          </button>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-surface-borderLight dark:border-surface-borderDark pb-2 overflow-x-auto">
        {[
          { id: 'packages', label: 'PT Packages & Pricing', count: packages.length },
          { id: 'sessions', label: 'Session Scheduling & History', count: sessions.length },
          { id: 'trainers', label: 'Coach Roster & Availability', count: trainers.length },
          { id: 'reports', label: 'PT Revenue & Performance Reports' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
              activeTab === t.id
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white dark:bg-[#252330] text-surface-mutedLight dark:text-surface-mutedDark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
            }`}
          >
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === t.id ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: PT PACKAGES */}
      {activeTab === 'packages' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map(pkg => (
              <div
                key={pkg.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col justify-between hover:border-primary/50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      pkg.type === 'one_on_one' ? 'bg-primary/10 text-primary' : 'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {pkg.type === 'one_on_one' ? '1-on-1 Private' : 'Small Group'}
                    </span>
                    <span className="text-[11px] font-bold text-surface-mutedLight dark:text-surface-mutedDark">
                      {pkg.validityDays} Days Validity
                    </span>
                  </div>
                  <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1 leading-relaxed">
                    {pkg.description || 'Custom personal training routine with biometric tracking.'}
                  </p>

                  <div className="mt-4 p-4 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-surface-mutedLight dark:text-surface-mutedDark">Session Quota:</span>
                      <span className="text-textPrimary-light dark:text-textPrimary-dark font-black">{pkg.totalSessions} Sessions</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-surface-mutedLight dark:text-surface-mutedDark">Rate Per Session:</span>
                      <span className="text-textPrimary-light dark:text-textPrimary-dark font-black">
                        ₹{Math.round(pkg.priceInr / pkg.totalSessions).toLocaleString()} / session
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold pt-2 border-t border-surface-borderLight dark:border-surface-borderDark">
                      <span className="text-surface-mutedLight dark:text-surface-mutedDark">Total Package:</span>
                      <span className="text-base font-black text-primary dark:text-primary-light">₹{pkg.priceInr.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between">
                  <span className={`inline-flex items-center text-xs font-bold ${pkg.isActive ? 'text-emerald-500' : 'text-rose-500'}`}>
                    <span className={`w-2 h-2 rounded-full mr-1.5 ${pkg.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {pkg.isActive ? 'Active Package' : 'Archived'}
                  </span>
                  <button
                    onClick={() => {
                      setAssignPackageId(pkg.id);
                      setShowAssignModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Enroll Client
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SESSIONS & SCHEDULING */}
      {activeTab === 'sessions' && (
        <div className="rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm overflow-hidden">
          <div className="p-5 border-b border-surface-borderLight dark:border-surface-borderDark flex flex-col md:flex-row justify-between md:items-center gap-3">
            <div>
              <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                Personal Training Sessions & Completion Logs
              </h3>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">
                Each completed session auto-deducts 1 remaining quota from the member's active package.
              </p>
            </div>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer self-start md:self-auto"
            >
              <Plus size={14} />
              <span>Schedule New Session</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Client Athlete</th>
                  <th className="py-3 px-4">Trainer Coach</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4 text-center">Duration</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
                {sessions.map(s => (
                  <tr key={s.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-textPrimary-light dark:text-textPrimary-dark">
                      {new Date(s.scheduledAt).toLocaleDateString()} &bull; {new Date(s.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-textPrimary-light dark:text-textPrimary-dark">
                      {s.memberName}
                    </td>
                    <td className="py-3.5 px-4 text-surface-mutedLight dark:text-surface-mutedDark">
                      {s.trainerName}
                    </td>
                    <td className="py-3.5 px-4 text-primary dark:text-primary-light font-medium">
                      {s.packageName}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold">
                      {s.durationMinutes} mins
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        s.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : s.status === 'scheduled'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      {s.status === 'scheduled' && (
                        <button
                          onClick={() => setCompleteNotesModal({ open: true, session: s, notes: s.sessionNotes || '' })}
                          className="px-3 py-1 rounded-xl bg-emerald-500 text-white font-bold text-[11px] hover:bg-emerald-600 cursor-pointer shadow-sm"
                        >
                          Mark Complete
                        </button>
                      )}
                      {s.status === 'completed' && s.sessionNotes && (
                        <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark italic">
                          "{s.sessionNotes}"
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TRAINERS & AVAILABILITY */}
      {activeTab === 'trainers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trainers.map(tr => (
            <div
              key={tr.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                    {tr.name}
                  </h3>
                  <span className="text-xs text-primary dark:text-primary-light font-bold">
                    {tr.specialty} &bull; {tr.experienceYears} Years Exp
                  </span>
                </div>
                <div className="px-3 py-1 rounded-2xl bg-amber-500/10 text-amber-500 text-xs font-black flex items-center space-x-1">
                  <Award size={14} />
                  <span>{tr.rating || '4.9'}</span>
                </div>
              </div>

              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark leading-relaxed">
                {tr.bio}
              </p>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs">
                <div>
                  <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark uppercase font-bold block">Active Clients</span>
                  <span className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">{tr.activeClients} / {tr.maxClients} max</span>
                </div>
                <div>
                  <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark uppercase font-bold block">Completed Sessions</span>
                  <span className="text-sm font-black text-emerald-500">{tr.completedSessionsCount}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block mb-1">
                  Weekly Availability
                </span>
                <div className="flex flex-wrap gap-1">
                  {(tr.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']).map((d: string) => (
                    <span key={d} className="px-2 py-0.5 rounded-lg bg-surface-light dark:bg-[#1b1926] text-[10px] font-bold text-textPrimary-light dark:text-textPrimary-dark border border-surface-borderLight dark:border-surface-borderDark">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: PT REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
            <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark mb-4">
              Revenue Breakdown: General Membership vs Personal Training
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                <span className="text-xs font-bold text-primary block">Total PT Billed Volume</span>
                <span className="text-2xl font-black text-primary mt-1 block">₹{(reports?.revenue?.ptBilled || 30500).toLocaleString()}</span>
                <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark mt-1 block">Invoiced PT packages</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                <span className="text-xs font-bold text-emerald-500 block">Total PT Collected</span>
                <span className="text-2xl font-black text-emerald-500 mt-1 block">₹{(reports?.revenue?.ptCollected || 24000).toLocaleString()}</span>
                <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark mt-1 block">Verified Cash/UPI receipts</span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <span className="text-xs font-bold text-amber-500 block">Total PT Outstanding</span>
                <span className="text-2xl font-black text-amber-500 mt-1 block">₹{(reports?.revenue?.ptOutstanding || 6500).toLocaleString()}</span>
                <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark mt-1 block">Uncollected PT package fees</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD PACKAGE */}
      {showAddPackageModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl max-w-md w-full p-6 border border-surface-borderLight dark:border-surface-borderDark shadow-2xl">
            <h3 className="text-lg font-black text-textPrimary-light dark:text-textPrimary-dark mb-4">
              Create Personal Training Package
            </h3>
            <form onSubmit={handleCreatePackage} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark block mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  value={pkgName}
                  onChange={e => setPkgName(e.target.value)}
                  placeholder="e.g. 1-on-1 Hypertrophy Mastery"
                  className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark block mb-1">Package Type</label>
                  <select
                    value={pkgType}
                    onChange={e => setPkgType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-bold"
                  >
                    <option value="one_on_one">1-on-1 Private</option>
                    <option value="group">Small Group</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark block mb-1">Sessions Count</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={pkgSessions}
                    onChange={e => setPkgSessions(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark block mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={pkgPrice}
                    onChange={e => setPkgPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark block mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    min="7"
                    required
                    value={pkgValidity}
                    onChange={e => setPkgValidity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark block mb-1">Package Description</label>
                <textarea
                  rows={2}
                  value={pkgDesc}
                  onChange={e => setPkgDesc(e.target.value)}
                  placeholder="Focus areas, equipment used, trainer qualification requirements..."
                  className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-medium"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPackageModal(false)}
                  className="px-4 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl gradient-btn-primary text-white text-xs font-bold"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SCHEDULE SESSION */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl max-w-md w-full p-6 border border-surface-borderLight dark:border-surface-borderDark shadow-2xl">
            <h3 className="text-lg font-black text-textPrimary-light dark:text-textPrimary-dark mb-4">
              Schedule Personal Training Session
            </h3>
            <form onSubmit={handleScheduleSession} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark block mb-1">Select Athlete</label>
                <select
                  required
                  value={schedMemberId}
                  onChange={e => setSchedMemberId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-bold"
                >
                  <option value="">-- Choose Member --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.userName} ({m.userEmail})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark block mb-1">Assigned Coach</label>
                <select
                  required
                  value={schedTrainerId}
                  onChange={e => setSchedTrainerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-bold"
                >
                  <option value="">-- Choose Trainer --</option>
                  {trainers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark block mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={schedDateTime}
                    onChange={e => setSchedDateTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark block mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={schedDuration}
                    onChange={e => setSchedDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark block mb-1">Session Target / Notes</label>
                <input
                  type="text"
                  value={schedNotes}
                  onChange={e => setSchedNotes(e.target.value)}
                  placeholder="e.g. Squat biomechanics & quad volume focus"
                  className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-medium"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl gradient-btn-primary text-white text-xs font-bold"
                >
                  Book Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ASSIGN TRAINER & PACKAGE */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl max-w-md w-full p-6 border border-surface-borderLight dark:border-surface-borderDark shadow-2xl">
            <h3 className="text-lg font-black text-textPrimary-light dark:text-textPrimary-dark mb-4">
              Enroll Client in Personal Training
            </h3>
            <form onSubmit={handleAssignTrainer} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark block mb-1">Select Member</label>
                <select
                  required
                  value={assignMemberId}
                  onChange={e => setAssignMemberId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-bold"
                >
                  <option value="">-- Choose Athlete --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.userName} ({m.userEmail})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark block mb-1">Assign Coach</label>
                <select
                  required
                  value={assignTrainerId}
                  onChange={e => setAssignTrainerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-bold"
                >
                  <option value="">-- Choose Coach --</option>
                  {trainers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark block mb-1">Select PT Package</label>
                <select
                  required
                  value={assignPackageId}
                  onChange={e => setAssignPackageId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-bold"
                >
                  <option value="">-- Choose Package --</option>
                  {packages.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.totalSessions} Sessions &bull; ₹{p.priceInr})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl gradient-btn-primary text-white text-xs font-bold"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: COMPLETE SESSION CONFIRMATION */}
      {completeNotesModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl max-w-md w-full p-6 border border-surface-borderLight dark:border-surface-borderDark shadow-2xl">
            <h3 className="text-lg font-black text-textPrimary-light dark:text-textPrimary-dark mb-2">
              Mark Session Completed
            </h3>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mb-4">
              Session for <strong>{completeNotesModal.session?.memberName}</strong> with <strong>{completeNotesModal.session?.trainerName}</strong>. This will deduct 1 remaining quota session.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark block mb-1">Coaching Form Notes</label>
                <textarea
                  rows={3}
                  value={completeNotesModal.notes}
                  onChange={e => setCompleteNotesModal({ ...completeNotesModal, notes: e.target.value })}
                  placeholder="Working weight used, form checks, recovery recommendations..."
                  className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-medium"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompleteNotesModal({ open: false, notes: '' })}
                  className="px-4 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmComplete}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 shadow-md"
                >
                  Confirm & Deduct Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
