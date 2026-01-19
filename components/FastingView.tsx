
import React, { useState, useEffect, useMemo } from 'react';
import { FastingState, FastingLog } from '../types';

interface FastingViewProps {
  state: FastingState;
  onUpdate: (state: FastingState) => void;
}

const FastingView: React.FC<FastingViewProps> = ({ state, onUpdate }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [customHours, setCustomHours] = useState<string>('12');

  const protocols = [
    { id: 'rabbit', label: 'Coelho', hours: 12, level: 'Fácil', icon: '🐰', color: 'bg-blue-50', text: 'text-blue-500' },
    { id: 'fox', label: 'Raposa', hours: 14, level: 'Moderado', icon: '🦊', color: 'bg-orange-50', text: 'text-orange-500' },
    { id: 'lion', label: 'Leão', hours: 16, level: 'Desafiador', icon: '🦁', color: 'bg-rose-50', text: 'text-rose-500' }
  ];

  useEffect(() => {
    if (!state.isFasting || !state.endTime) return;

    const tick = () => {
      const remaining = Math.max(0, state.endTime! - Date.now());
      setTimeLeft(remaining);
      
      if (remaining === 0 && !state.completionNotified) {
        // Notificação simples (pode ser expandida para Push API)
        alert("Parabéns! Você completou seu ciclo de jejum.");
        onUpdate({ ...state, completionNotified: true });
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [state.isFasting, state.endTime, state.completionNotified, onUpdate]);

  const startFasting = (hours: number) => {
    const now = Date.now();
    onUpdate({
      ...state,
      isFasting: true,
      startTime: now,
      durationHours: hours,
      endTime: now + hours * 3600000,
      completionNotified: false
    });
  };

  const stopFasting = (completed: boolean) => {
    const history: FastingLog[] = state.history || [];
    if (state.startTime && state.endTime) {
      history.unshift({
        id: Math.random().toString(36).substr(2, 9),
        startTime: state.startTime,
        endTime: Date.now(),
        targetDuration: state.durationHours,
        completed
      });
    }

    onUpdate({
      isFasting: false,
      startTime: null,
      durationHours: 0,
      endTime: null,
      completionNotified: false,
      history: history.slice(0, 10) // Mantém os últimos 10
    });
  };

  const formatTime = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = useMemo(() => {
    if (!state.startTime || !state.endTime) return 0;
    const total = state.endTime - state.startTime;
    const elapsed = Date.now() - state.startTime;
    return Math.min(100, (elapsed / total) * 100);
  }, [state.isFasting, timeLeft]);

  const activeAnimal = protocols.find(p => p.hours === state.durationHours) || { icon: '🧘', label: 'Personalizado' };

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="text-center">
        <h2 className="text-3xl font-black text-slate-900 leading-tight">Jejum Intermitente</h2>
        <p className="text-slate-500 mt-1 font-medium">Sincronize sua saúde com o tempo.</p>
      </header>

      {state.isFasting ? (
        <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-emerald-900/5 border border-slate-100 flex flex-col items-center">
          {/* Círculo de Progresso */}
          <div className="relative w-64 h-64 mb-8">
            <svg className="w-full h-full -rotate-90">
              <circle cx="50%" cy="50%" r="46%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-50" />
              <circle 
                cx="50%" cy="50%" r="46%" stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray="289%" 
                strokeDashoffset={`${289 * (1 - progress / 100)}%`} 
                className="text-emerald-500 transition-all duration-1000 ease-linear" 
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl mb-2">{activeAnimal.icon}</div>
              <span className="text-4xl font-black font-mono tracking-tight text-slate-900">{formatTime(timeLeft)}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{activeAnimal.label}</span>
            </div>
          </div>

          <div className="w-full space-y-4">
            <div className="flex justify-between text-xs font-bold text-slate-400 px-2">
              <span>Início: {new Date(state.startTime!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              <span>Fim: {new Date(state.endTime!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <button 
              onClick={() => stopFasting(timeLeft === 0)}
              className="w-full py-5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-3xl font-black text-lg transition-all"
            >
              {timeLeft === 0 ? 'Concluir Jejum' : 'Interromper'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {protocols.map(p => (
              <button
                key={p.id}
                onClick={() => startFasting(p.hours)}
                className="bg-white p-6 rounded-[2rem] border-2 border-slate-50 hover:border-emerald-500/20 hover:shadow-xl transition-all text-left group"
              >
                <div className={`w-12 h-12 ${p.color} rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {p.icon}
                </div>
                <h3 className="font-black text-slate-900 text-lg">{p.hours}h</h3>
                <p className={`text-xs font-bold uppercase tracking-widest ${p.text}`}>{p.level}</p>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">Protocolo {p.label}</p>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Personalizado
            </h3>
            <div className="flex gap-4">
              <input 
                type="number" 
                className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-lg"
                placeholder="Horas..."
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
              />
              <button 
                onClick={() => startFasting(Number(customHours))}
                className="px-8 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-colors"
              >
                Iniciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Histórico */}
      <section className="space-y-4">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Memórias Recentes</h3>
        <div className="space-y-2">
          {state.history && state.history.length > 0 ? (
            state.history.map(log => (
              <div key={log.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${log.completed ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'}`}>
                    {log.completed ? '✨' : '☕'}
                  </div>
                  <div>
                    <p className="font-black text-sm text-slate-900">{log.targetDuration}h de Jejum</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(log.startTime).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full ${log.completed ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  {log.completed ? 'Concluído' : 'Pausado'}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-slate-100/50 rounded-[2rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 text-sm font-medium italic">Nenhum histórico ainda. Comece hoje!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default FastingView;
