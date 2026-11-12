import React, { useEffect, useState } from 'react';
import { Building2, ArrowLeft, CheckCircle2, ShieldAlert, Check, X } from 'lucide-react';
import { api } from '../../services/api';
import { Gym } from '../../types';

interface GymAdministrationScreenProps {
  onNavigate: (screen: string) => void;
}

export const GymAdministrationScreen: React.FC<GymAdministrationScreenProps> = ({ onNavigate }) => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGyms = async () => {
    try {
      const res = await api.getAdminGyms();
      setGyms(res.gyms || []);
    } catch (err) {
      console.error('Failed to load gyms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGyms();
  }, []);

  const handleUpdateStatus = async (gymId: string, status: 'approved' | 'suspended') => {
    try {
      await api.setGymStatus(gymId, status);
      fetchGyms();
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <button
            onClick={() => onNavigate('admin')}
            className="flex items-center space-x-1.5 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Super Admin Dashboard</span>
          </button>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Gym Facility Approvals & Licensing
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Authorizing partner facilities, commercial join codes, and partnership tier compliance.
          </p>
        </div>

        <button
          onClick={() => onNavigate('gym-register')}
          className="px-4 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold"
        >
          + Register Gym
        </button>
      </div>

      {/* Gym Table */}
      <div className="rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs">Loading gym directories...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Facility Name</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Join Code</th>
                  <th className="py-3 px-4">Capacity / Members</th>
                  <th className="py-3 px-4">Partnership Tier</th>
                  <th className="py-3 px-4">Official Website</th>
                  <th className="py-3 px-4 text-center">Licensing Status</th>
                  <th className="py-3 px-4 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
                {gyms.map((g) => (
                  <tr key={g.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-textPrimary-light dark:text-textPrimary-dark">
                        {g.name}
                      </div>
                      <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
                        Owner: {g.ownerName} ({g.ownerEmail})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-surface-mutedLight dark:text-surface-mutedDark font-medium">
                      {g.city} &bull; {g.address}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-primary dark:text-primary-light text-sm tracking-wider">
                      {g.joinCode}
                    </td>
                    <td className="py-3.5 px-4 font-semibold">
                      {g.memberCount} / {g.capacity}
                    </td>
                    <td className="py-3.5 px-4 uppercase font-bold text-xs text-indigo-500">
                      {g.partnershipTier.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4">
                      {g.websiteUrl ? (
                        <div className="space-y-1">
                          <a
                            href={g.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-primary hover:underline flex items-center space-x-1"
                          >
                            <span>Visit</span>
                            <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark truncate max-w-[120px]">
                              ({g.websiteUrl.replace('https://', '')})
                            </span>
                          </a>
                          <div className="flex items-center space-x-1">
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              g.websiteStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-500' :
                              g.websiteStatus === 'flagged' ? 'bg-rose-500/10 text-rose-500' :
                              'bg-amber-500/10 text-amber-500'
                            }`}>
                              {g.websiteStatus || 'unverified'}
                            </span>
                            {g.websiteStatus !== 'verified' && (
                              <button
                                onClick={async () => {
                                  await api.verifyGymWebsite({ gymId: g.id, action: 'verify' });
                                  fetchGyms();
                                }}
                                className="text-[10px] font-bold text-emerald-500 hover:underline"
                              >
                                Verify
                              </button>
                            )}
                            {g.websiteStatus !== 'flagged' && (
                              <button
                                onClick={async () => {
                                  await api.verifyGymWebsite({ gymId: g.id, action: 'flag' });
                                  fetchGyms();
                                }}
                                className="text-[10px] font-bold text-rose-500 hover:underline"
                              >
                                Flag
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">No website submitted</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        g.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                        g.status === 'suspended' ? 'bg-rose-500/10 text-rose-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {g.status === 'approved' ? (
                        <button
                          onClick={() => handleUpdateStatus(g.id, 'suspended')}
                          className="px-3 py-1 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-bold hover:bg-rose-500/20"
                        >
                          Suspend Facility
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(g.id, 'approved')}
                          className="px-3 py-1 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600"
                        >
                          Approve Licensing
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
