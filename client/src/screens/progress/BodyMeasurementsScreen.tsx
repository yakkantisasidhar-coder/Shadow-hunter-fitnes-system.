import React, { useEffect, useState } from 'react';
import { Ruler, Plus, ArrowLeft, Calendar, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { BodyMeasurementLog } from '../../types';

interface BodyMeasurementsScreenProps {
  onNavigate: (screen: string) => void;
}

export const BodyMeasurementsScreen: React.FC<BodyMeasurementsScreenProps> = ({ onNavigate }) => {
  const [measurements, setMeasurements] = useState<BodyMeasurementLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [weightKg, setWeightKg] = useState<number>(84);
  const [chestCm, setChestCm] = useState<number>(108);
  const [waistCm, setWaistCm] = useState<number>(83);
  const [armsCm, setArmsCm] = useState<number>(39.5);
  const [thighsCm, setThighsCm] = useState<number>(62);
  const [hipsCm, setHipsCm] = useState<number>(97);
  const [calvesCm, setCalvesCm] = useState<number>(39.2);
  const [notes, setNotes] = useState('');

  const fetchMeasurements = async () => {
    try {
      const res = await api.getMeasurements();
      setMeasurements(res.measurements || []);
    } catch (err) {
      console.error('Failed to load measurements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.logMeasurement({
        weightKg,
        chestCm,
        waistCm,
        armsCm,
        thighsCm,
        hipsCm,
        calvesCm,
        notes
      });
      setShowModal(false);
      fetchMeasurements();
    } catch (err) {
      console.error('Failed to save measurement:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <button
            onClick={() => onNavigate('progress')}
            className="flex items-center space-x-1.5 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Progress Dashboard</span>
          </button>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Body Circumference Tracking
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Centimeter-accurate physical measurement logs across anatomical landmarks.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center space-x-1.5"
        >
          <Plus size={16} />
          <span>Record New Measurements</span>
        </button>
      </div>

      {/* Historical Comparison Table */}
      <div className="rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm overflow-hidden">
        <div className="p-5 border-b border-surface-borderLight dark:border-surface-borderDark">
          <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
            Historical Measurement Logs
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs">Loading measurement records...</div>
        ) : measurements.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold">No measurements recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Weight</th>
                  <th className="py-3 px-4">Chest</th>
                  <th className="py-3 px-4">Waist</th>
                  <th className="py-3 px-4">Arms</th>
                  <th className="py-3 px-4">Thighs</th>
                  <th className="py-3 px-4">Hips</th>
                  <th className="py-3 px-4">Calves</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
                {measurements.map((log) => (
                  <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-primary dark:text-primary-light whitespace-nowrap">
                      {log.date}
                    </td>
                    <td className="py-3 px-4 font-black text-textPrimary-light dark:text-textPrimary-dark">
                      {log.weightKg} kg
                    </td>
                    <td className="py-3 px-4">{log.chestCm} cm</td>
                    <td className="py-3 px-4 font-bold text-emerald-500">{log.waistCm} cm</td>
                    <td className="py-3 px-4">{log.armsCm} cm</td>
                    <td className="py-3 px-4">{log.thighsCm} cm</td>
                    <td className="py-3 px-4">{log.hipsCm} cm</td>
                    <td className="py-3 px-4">{log.calvesCm} cm</td>
                    <td className="py-3 px-4 text-surface-mutedLight dark:text-surface-mutedDark max-w-xs truncate">
                      {log.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-surface-borderLight dark:border-surface-borderDark space-y-4">
            <h3 className="text-lg font-black text-textPrimary-light dark:text-textPrimary-dark">
              Record Body Circumference
            </h3>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
              Use a standard flexible measuring tape. Ensure measurements are taken relaxed before training.
            </p>

            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold mb-1">Bodyweight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={waistCm}
                    onChange={(e) => setWaistCm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold mb-1">Chest (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={chestCm}
                    onChange={(e) => setChestCm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">Upper Arm (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={armsCm}
                    onChange={(e) => setArmsCm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold mb-1">Thighs (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={thighsCm}
                    onChange={(e) => setThighsCm(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Hips (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={hipsCm}
                    onChange={(e) => setHipsCm(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Calves (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={calvesCm}
                    onChange={(e) => setCalvesCm(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1">Notes / Conditions</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Morning fasted measurement"
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs"
                />
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold"
                >
                  Save Metrics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
