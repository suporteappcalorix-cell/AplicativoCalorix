
import React, { useState, useEffect } from 'react';
import { FastingState } from '../types';

interface FastingTrackerProps {
  state: FastingState;
  onUpdate: (state: FastingState) => void;
}

const FastingTracker: React.FC<FastingTrackerProps> = ({ state, onUpdate }) => {
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00');

  useEffect(() => {
    if (!state.isFasting || !state.endTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = state.endTime! - now;

      if (remaining <= 0) {
        setTimeLeft('00:00:00');
        clearInterval(interval);
        return;
      }

      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isFasting, state.endTime]);

  const startFasting = (hours: number) => {
    const now = Date.now();
    onUpdate({
      isFasting: true,
      startTime: now,
      durationHours: hours,
      endTime: now + hours * 3600000,
      completionNotified: false
    });
  };

  const stopFasting = () => {
    onUpdate({
      isFasting: false,
      startTime: null,
      durationHours: 0,
      endTime: null,
      completionNotified: false
    });
  };

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        Jejum Intermitente
      </h2>

      {state.isFasting ? (
        <div className="space-y-4 text-center">
          <div className="text-4xl font-mono font-black tracking-tighter text-slate-900 bg-slate-50 py-6 rounded-2xl border border-slate-100">
            {timeLeft}
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tempo restante</p>
          <button 
            onClick={stopFasting}
            className="w-full py-3 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-colors"
          >
            Encerrar Jejum
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 mb-4">Escolha o protocolo de hoje:</p>
          <div className="grid grid-cols-2 gap-3">
            {[12, 14, 16, 18].map(h => (
              <button 
                key={h}
                onClick={() => startFasting(h)}
                className="py-3 px-4 rounded-xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 font-bold transition-all text-sm"
              >
                {h}h Protocolo
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default FastingTracker;
