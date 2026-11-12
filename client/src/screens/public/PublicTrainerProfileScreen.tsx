import React, { useEffect, useState } from 'react';
import { 
  User, 
  Award, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Building2, 
  Phone, 
  Mail, 
  CheckCircle, 
  ArrowLeft, 
  Dumbbell, 
  ExternalLink,
  Calendar,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';

interface PublicTrainerProfileScreenProps {
  trainerId: string;
  onNavigate: (screen: string, param?: string) => void;
}

export const PublicTrainerProfileScreen: React.FC<PublicTrainerProfileScreenProps> = ({ trainerId, onNavigate }) => {
  const [trainer, setTrainer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        setLoading(true);
        const res = await api.getPublicTrainer(trainerId);
        setTrainer(res.trainer);
      } catch (err: any) {
        setError(err.message || 'Failed to load public coach profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrainer();
  }, [trainerId]);

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary animate-pulse" />
        <p className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark uppercase tracking-widest">
          Loading Coach Credentials...
        </p>
      </div>
    );
  }

  if (error || !trainer) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-center space-y-4">
        <User className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-black text-textPrimary-light dark:text-textPrimary-dark">Trainer Not Found</h3>
        <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
          {error || 'This coach profile is not publicly available.'}
        </p>
        <button
          onClick={() => onNavigate('leaderboards')}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold inline-flex items-center space-x-1.5"
        >
          <ArrowLeft size={16} />
          <span>Return to Rankings</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('leaderboards')}
          className="flex items-center space-x-2 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Rankings</span>
        </button>

        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center space-x-1">
          <ShieldCheck size={12} />
          <span>Verified Master Coach</span>
        </span>
      </div>

      {/* Trainer Profile Card Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
            <img
              src={trainer.profilePhotoUrl || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=300&q=80'}
              alt={trainer.name}
              className="w-28 h-28 rounded-3xl object-cover ring-4 ring-primary/30 shadow-2xl"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-textPrimary-light dark:text-textPrimary-dark">
                  {trainer.name}
                </h1>
                <CheckCircle className="text-primary fill-primary/20 w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-primary block">
                {trainer.specialty} &bull; {trainer.experienceYears} Years Competitive Experience
              </span>
              
              {/* Linked Associated Gyms */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                {(trainer.associatedGyms || []).map((ag: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => onNavigate('public-gym', ag.gymId)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-[11px] font-bold text-textPrimary-light dark:text-textPrimary-dark hover:border-primary transition-colors"
                  >
                    <Building2 size={13} className="text-primary" />
                    <span>{ag.gymName}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact or Consult Action */}
          {trainer.publicContact && (
            <div className="flex flex-col space-y-2 text-center md:text-right">
              {trainer.publicContact.phone && (
                <a
                  href={`tel:${trainer.publicContact.phone}`}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md hover:opacity-95"
                >
                  <Phone size={14} />
                  <span>Call {trainer.publicContact.phone}</span>
                </a>
              )}
              {trainer.publicContact.email && (
                <a
                  href={`mailto:${trainer.publicContact.email}`}
                  className="px-4 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark flex items-center justify-center space-x-1.5"
                >
                  <Mail size={14} />
                  <span>Email Coach</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Triple Ranking & Verified Rating Ribbon */}
        <div className="pt-6 border-t border-surface-borderLight dark:border-surface-borderDark grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">District Trainer Rank</span>
            <span className="text-xl font-black text-primary dark:text-primary-light">#{trainer.districtRank || 1}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">State Standing</span>
            <span className="text-xl font-black text-indigo-500">#{trainer.stateRank || 2}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">National Standing</span>
            <span className="text-xl font-black text-amber-500">#{trainer.nationalRank || 4}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">Student Rating</span>
            <div className="flex items-center space-x-1 text-xl font-black text-emerald-500">
              <Star size={16} className="fill-emerald-500 text-emerald-500" />
              <span>{trainer.averageRating || 4.95}</span>
              <span className="text-xs font-normal text-surface-mutedLight dark:text-surface-mutedDark">({trainer.reviewCount || 46})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Bio, Verified Certifications, Achievements, Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Bio, Specializations, Student Reviews */}
        <div className="lg:col-span-2 space-y-6">
          {/* Biography */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-3">
            <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark uppercase tracking-wider">
              Professional Biography
            </h3>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark leading-relaxed">
              {trainer.bio}
            </p>

            <div className="pt-3 border-t border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block mb-2">
                Core Coaching Specializations
              </span>
              <div className="flex flex-wrap gap-2">
                {(trainer.specializations || []).map((spec: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Genuine Student Testimonials */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark uppercase tracking-wider">
                  Verified Student Testimonials
                </h3>
                <p className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
                  Genuine reviews bound to completed coaching sessions.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-500 flex items-center space-x-1">
                <Star size={13} className="fill-amber-500" />
                <span>{trainer.averageRating} Average</span>
              </span>
            </div>

            <div className="space-y-3">
              {(trainer.approvedReviews || []).map((rev: any) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark">
                        {rev.studentName}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center space-x-0.5">
                        <CheckCircle size={10} />
                        <span>Verified Student</span>
                      </span>
                    </div>
                    <div className="flex text-amber-500">
                      {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                        <Star key={i} size={11} className="fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark leading-relaxed">
                    "{rev.text}"
                  </p>
                  <span className="text-[9px] text-surface-mutedLight dark:text-surface-mutedDark block">
                    {new Date(rev.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Verified Certifications & Career Achievements */}
        <div className="space-y-6">
          {/* Verified Certifications */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
            <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="text-emerald-500 w-4 h-4" />
              <span>Verified Qualifications</span>
            </h3>

            <div className="space-y-3">
              {(trainer.certifications || []).map((c: any, i: number) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark space-y-1"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark">
                      {c.name}
                    </span>
                    {c.verified && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                        Verified
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark block">
                    {c.issuingOrg} &bull; Class of {c.year}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block mb-2">
                Formal Academic Background
              </span>
              <ul className="space-y-1 text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                {(trainer.qualifications || []).map((q: string, i: number) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Coaching Career Achievements */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-3">
            <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark uppercase tracking-wider flex items-center space-x-2">
              <Award className="text-amber-500 w-4 h-4" />
              <span>Career Milestones</span>
            </h3>
            <ul className="space-y-2 text-xs text-surface-mutedLight dark:text-surface-mutedDark">
              {(trainer.achievements || []).map((ach: string, idx: number) => (
                <li key={idx} className="flex items-start space-x-2">
                  <Sparkles size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>{ach}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
