
import React, { useMemo, useState } from 'react';
import { UserProfile, DailyLog, Challenge, UserAchievements } from '../types';
import { WEEKLY_CHALLENGES } from '../constants';

interface ChallengesViewProps {
  profile: UserProfile;
  logs: Record<string, DailyLog>;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

const ChallengesView: React.FC<ChallengesViewProps> = ({ profile, logs, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'current' | 'completed'>('current');
  const [isCreating, setIsCreating] = useState(false);
  const [newChallenge, setNewChallenge] = useState<Partial<Challenge>>({
    title: '',
    description: '',
    icon: '🎯',
    type: 'water',
    targetValue: 2000,
    daysToComplete: 7
  });

  const achievements: UserAchievements = profile.achievements || {
    medals: { gold: 0, silver: 0, bronze: 0 },
    badges: [],
    completedChallenges: []
  };

  const allAvailableChallenges = useMemo(() => {
    return [...WEEKLY_CHALLENGES, ...(profile.customChallenges || [])];
  }, [profile.customChallenges]);

  const activeChallenge = allAvailableChallenges.find(c => c.id === achievements.activeChallengeId);

  const calculateProgress = (challenge: Challenge) => {
    const now = new Date();
    const lastDays = Array.from({ length: challenge.daysToComplete }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (challenge.daysToComplete - 1 - i));
      return d.toISOString().split('T')[0];
    });

    let successDays = 0;

    lastDays.forEach(dateStr => {
      const log = logs[dateStr];
      if (!log) return;

      switch (challenge.type) {
        case 'water':
          if (log.waterIntake >= challenge.targetValue) successDays++;
          break;
        case 'workout':
          const burned = log.workouts?.reduce((s, w) => s + w.caloriesBurned, 0) || 0;
          if (burned >= challenge.targetValue) successDays++;
          break;
        case 'calories':
          const intake = log.meals.reduce((s, m) => s + m.items.reduce((s2, i) => s2 + i.calories, 0), 0);
          if (intake > 0 && intake <= profile.goals.calories) successDays++;
          break;
        case 'fasting':
          // Simplified logic for fasting successes
          successDays++;
          break;
      }
    });

    return successDays;
  };

  const progressCount = activeChallenge ? calculateProgress(activeChallenge) : 0;
  const progressPercent = activeChallenge ? (progressCount / activeChallenge.daysToComplete) * 100 : 0;

  const claimMedal = () => {
    if (!activeChallenge) return;
    
    const count = calculateProgress(activeChallenge);
    let medal: 'gold' | 'silver' | 'bronze' | null = null;
    
    const ratio = count / activeChallenge.daysToComplete;
    if (ratio >= 1) medal = 'gold';
    else if (ratio >= 0.8) medal = 'silver';
    else if (ratio >= 0.5) medal = 'bronze';

    if (medal) {
      const newMedals = { ...achievements.medals };
      newMedals[medal]++;
      
      onUpdateProfile({
        achievements: {
          ...achievements,
          medals: newMedals,
          activeChallengeId: undefined,
          completedChallenges: [...achievements.completedChallenges, activeChallenge.id]
        }
      });
    }
  };

  const selectChallenge = (id: string) => {
    onUpdateProfile({
      achievements: {
        ...achievements,
        activeChallengeId: id
      }
    });
  };

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `custom-${Math.random().toString(36).substr(2, 9)}`;
    const created: Challenge = {
      ...(newChallenge as Challenge),
      id,
      isCustom: true
    };
    
    onUpdateProfile({
      customChallenges: [...(profile.customChallenges || []), created]
    });
    setIsCreating(false);
    setNewChallenge({
      title: '',
      description: '',
      icon: '🎯',
      type: 'water',
      targetValue: 2000,
      daysToComplete: 7
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="px-2 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 leading-tight">Desafios</h2>
          <p className="text-slate-500 mt-1 font-medium">Supere seus limites e conquiste medalhas.</p>
        </div>
        {!isCreating && !activeChallenge && (
          <button 
            onClick={() => setIsCreating(true)}
            className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-100 transition-all active:scale-95"
          >
            + Criar Próprio
          </button>
        )}
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        {['gold', 'silver', 'bronze'].map((m) => (
          <div key={m} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <span className="block text-3xl mb-1">{m === 'gold' ? '🥇' : m === 'silver' ? '🥈' : '🥉'}</span>
            <span className="block text-xl font-black text-slate-900">{(achievements.medals as any)[m]}</span>
            <span className="text-[10px] font-black text-slate-300 uppercase">{m === 'gold' ? 'Ouro' : m === 'silver' ? 'Prata' : 'Bronze'}</span>
          </div>
        ))}
      </div>

      {isCreating ? (
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-900">Novo Desafio</h3>
            <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleCreateChallenge} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Título</label>
              <input required className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold" value={newChallenge.title} onChange={e => setNewChallenge({...newChallenge, title: e.target.value})} placeholder="Ex: Corrida Matinal" />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Descrição</label>
              <textarea required className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold resize-none" rows={2} value={newChallenge.description} onChange={e => setNewChallenge({...newChallenge, description: e.target.value})} placeholder="O que você precisa fazer?" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tipo</label>
                <select className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold appearance-none" value={newChallenge.type} onChange={e => setNewChallenge({...newChallenge, type: e.target.value as any})}>
                  <option value="water">Hidratação</option>
                  <option value="workout">Exercícios</option>
                  <option value="calories">Calorias</option>
                  <option value="fasting">Jejum</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Duração (Dias)</label>
                <input required type="number" className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold" value={newChallenge.daysToComplete} onChange={e => setNewChallenge({...newChallenge, daysToComplete: parseInt(e.target.value)})} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Meta Diária (Valor)</label>
              <input required type="number" className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold" value={newChallenge.targetValue} onChange={e => setNewChallenge({...newChallenge, targetValue: parseInt(e.target.value)})} />
              <p className="text-[9px] text-slate-400 italic">ML para água, Kcal para treino, 1 para metas binárias de calorias.</p>
            </div>

            <button type="submit" className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all mt-4">
              Começar Desafio Agora
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
            {['current', 'completed'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
              >
                {tab === 'current' ? 'Ativo' : 'Concluídos'}
              </button>
            ))}
          </div>

          {activeTab === 'current' ? (
            <div className="space-y-6">
              {activeChallenge ? (
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20">
                        {activeChallenge.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-slate-900">{activeChallenge.title}</h3>
                          {activeChallenge.isCustom && <span className="bg-amber-100 text-amber-600 text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase">Meu</span>}
                        </div>
                        <p className="text-sm font-medium text-slate-500">{activeChallenge.description}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Progresso</span>
                        <span className="text-2xl font-black text-emerald-600">{progressCount}/{activeChallenge.daysToComplete} <span className="text-xs text-slate-300">dias</span></span>
                      </div>
                      
                      <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-sm"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                      <button 
                        onClick={claimMedal}
                        disabled={progressCount < activeChallenge.daysToComplete / 2}
                        className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-30 transition-all active:scale-95"
                      >
                        Encerrar e Ver Medalha
                      </button>
                      <button 
                        onClick={() => selectChallenge('')}
                        className="px-6 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                      >
                        Abandonar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {allAvailableChallenges.filter(c => !achievements.completedChallenges.includes(c.id)).map(challenge => (
                    <button
                      key={challenge.id}
                      onClick={() => selectChallenge(challenge.id)}
                      className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all text-left flex items-center gap-5"
                    >
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {challenge.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900">{challenge.title}</h4>
                          {challenge.isCustom && <span className="bg-amber-100 text-amber-600 text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase">Personalizado</span>}
                        </div>
                        <p className="text-xs text-slate-400 font-medium">{challenge.description}</p>
                      </div>
                      <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  ))}
                  {allAvailableChallenges.filter(c => !achievements.completedChallenges.includes(c.id)).length === 0 && (
                    <div className="text-center py-10 text-slate-300 italic">Nenhum desafio disponível. Crie o seu!</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {achievements.completedChallenges.length > 0 ? (
                achievements.completedChallenges.map(id => {
                  const c = allAvailableChallenges.find(ch => ch.id === id);
                  return c ? (
                    <div key={id} className="bg-slate-50 p-6 rounded-[2rem] flex items-center gap-5 opacity-70">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm grayscale">
                        {c.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-slate-900">{c.title}</h4>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Concluído com sucesso ✨</p>
                      </div>
                    </div>
                  ) : null;
                })
              ) : (
                <div className="text-center py-20 text-slate-300 italic">Você ainda não concluiu nenhum desafio.</div>
              )}
            </div>
          )}
        </>
      )}

      {/* Rewards Info */}
      <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100/50">
        <h4 className="text-amber-900 font-black text-xs uppercase tracking-widest mb-2">Sistema de Reconhecimento</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">🥇</span>
            <p className="text-[11px] text-amber-700 font-medium"><b>Ouro:</b> Dedicação total (100% dos dias concluídos).</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl">🥈</span>
            <p className="text-[11px] text-amber-700 font-medium"><b>Prata:</b> Grande esforço (acima de 80%).</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl">🥉</span>
            <p className="text-[11px] text-amber-700 font-medium"><b>Bronze:</b> Iniciando a jornada (acima de 50%).</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengesView;
