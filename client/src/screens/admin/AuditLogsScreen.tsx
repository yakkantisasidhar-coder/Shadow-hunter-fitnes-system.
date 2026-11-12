import React, { useEffect, useState } from 'react';
import { FileText, ArrowLeft, ShieldCheck, Search, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { AuditLogItem } from '../../types';

interface AuditLogsScreenProps {
  onNavigate: (screen: string) => void;
}

export const AuditLogsScreen: React.FC<AuditLogsScreenProps> = ({ onNavigate }) => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.getAdminAuditLogs();
        setLogs(res.logs || []);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.actorEmail.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase())
  );

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
            Immutable Administrative Audit Logs
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Tamper-evident chronological record of role escalations, licensing approvals, and security events.
          </p>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="absolute left-3 top-2.5 text-surface-mutedLight dark:text-surface-mutedDark" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, actor, or detail..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs">Loading audit ledger...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold">No matching audit events found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Target Type</th>
                  <th className="py-3 px-4">Event Details</th>
                  <th className="py-3 px-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-surface-mutedLight dark:text-surface-mutedDark">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-sans font-bold">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary dark:text-primary-light">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="font-bold text-textPrimary-light dark:text-textPrimary-dark block">
                        {log.actorEmail}
                      </span>
                      <span className="text-[10px] uppercase text-surface-mutedLight dark:text-surface-mutedDark">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 uppercase font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                      {log.targetType}
                    </td>
                    <td className="py-3 px-4 font-sans text-xs text-textPrimary-light dark:text-textPrimary-dark max-w-sm">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-right text-surface-mutedLight dark:text-surface-mutedDark">
                      {log.ipAddress}
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
