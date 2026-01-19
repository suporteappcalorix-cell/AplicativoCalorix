
import React from 'react';
import { UserProfile, Badge } from '../types';
import { BADGES } from '../constants';

interface RewardsViewProps {
  profile: UserProfile;
}

const RewardsView: React.FC<RewardsViewProps> = ({ profile }) => {
  const points = profile.points || 0;
  const level = Math.floor(points / 1000) + 1;
  const pointsInCurrentLevel = points % 1000;
  const progressToNext = (pointsInCurrentLevel / 1000) * 100;
  
  const unlockedBadges = profile.achievements?.badges || [];

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header className="text-center px-4 space-y-4">
        <div className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
          Suas Conquistas
        </div>
        <h2 className="text-4xl font-black text-slate-900 leading-tight">Nível {level}</h2>
        
        <div className="max-w-xs mx-auto space-y-2">
           <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <span>{pointsInCurrentLevel} XP</span>
            <span>1000 XP</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
          <p className="text-xs font-bold text-slate-400">Faltam {1000 - pointsInCurrentLevel} pontos para o Nível {level + 1}</p>
        </div>
      </header>

      <section className="space-y-6">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Medalhas Desbloqueadas</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {BADGES.map(badge => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            return (
              <div 
                key={badge.id} 
                className={`bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm text-center transition-all ${isUnlocked ? 'opacity-100 scale-100' : 'opacity-40 grayscale scale-95'}`}
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">
                  {badge.icon}
                </div>
                <h4 className="font-black text-slate-900 text-sm">{badge.name}</h4>
                <p className="text-[10px] font-medium text-slate-400 mt-1 leading-tight">{badge.description}</p>
                {isUnlocked && <div className="mt-3 text-[9px] font-black text-emerald-500 uppercase tracking-widest">Conquistada!</div>}
              </div>
            );
          })}
        </div>
      </section>

      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-900/20 text-center">
        <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
          🌟
        </div>
        <h3 className="text-2xl font-black mb-4">Mantenha a Sequência</h3>
        <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm mx-auto mb-8">
          Quanto mais dias você registrar continuamente, maior será seu multiplicador de pontos. Não deixe o fogo apagar!
        </p>
        <div className="flex justify-center gap-4">
          <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/10">
            <span className="block text-2xl font-black text-emerald-400">12</span>
            <span className="text-[9px] font-black text-slate-500 uppercase">Dias Seguidos</span>
          </div>
          <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/10">
            <span className="block text-2xl font-black text-amber-400">x1.5</span>
            <span className="text-[9px] font-black text-slate-500 uppercase">Multiplicador</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsView;
