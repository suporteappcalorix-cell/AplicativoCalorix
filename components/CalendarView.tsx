
import React, { useState, useMemo } from 'react';
import { DailyLog, FastingLog, Workout } from '../types';

interface CalendarViewProps {
  logs: Record<string, DailyLog>;
  fastingHistory: FastingLog[];
  onSelectDate: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ logs, fastingHistory, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewingDay, setViewingDay] = useState<{ date: Date, log: DailyLog | null, fasting: FastingLog[] } | null>(null);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentMonth]);

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const getIndicators = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const log = logs[dateStr];
    const fasting = fastingHistory.filter(f => {
      const fDate = new Date(f.startTime).toISOString().split('T')[0];
      return fDate === dateStr && f.completed;
    });

    const hasMeals = log?.meals.some(m => m.items.length > 0);
    const hasWater = (log?.waterIntake || 0) > 0;
    const hasFasting = fasting.length > 0;
    const hasWorkout = (log?.workouts?.length || 0) > 0;

    return { hasMeals, hasWater, hasFasting, hasWorkout };
  };

  const handleDayClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const log = logs[dateStr] || null;
    const fasting = fastingHistory.filter(f => {
      const fDate = new Date(f.startTime).toISOString().split('T')[0];
      return fDate === dateStr;
    });
    setViewingDay({ date, log, fasting });
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-8 px-2">
        <div>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">Histórico</h2>
          <p className="text-sm font-medium text-slate-400 mt-1">Sua evolução no tempo</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-xl">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="px-4 text-xs font-bold text-slate-700 min-w-[110px] text-center uppercase tracking-widest">
            {currentMonth.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
          </span>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-xl">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-2xl shadow-emerald-900/5 border border-slate-100">
        <div className="grid grid-cols-7 mb-6">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">{d}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-y-2">
          {daysInMonth.map((date, i) => {
            if (!date) return <div key={i} className="h-14" />;
            
            const isToday = new Date().toDateString() === date.toDateString();
            const { hasMeals, hasWater, hasFasting, hasWorkout } = getIndicators(date);

            return (
              <button
                key={i}
                onClick={() => handleDayClick(date)}
                className={`h-14 flex flex-col items-center justify-center rounded-2xl transition-all relative group
                  ${isToday ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-slate-50'}
                `}
              >
                <span className={`text-sm font-bold ${isToday ? 'font-black underline decoration-2 underline-offset-4' : 'text-slate-600'}`}>
                  {date.getDate()}
                </span>
                <div className="flex gap-1 mt-1.5 h-1">
                  {hasMeals && <div className="w-1 h-1 rounded-full bg-emerald-500"></div>}
                  {hasWater && <div className="w-1 h-1 rounded-full bg-blue-400"></div>}
                  {hasWorkout && <div className="w-1 h-1 rounded-full bg-indigo-400"></div>}
                  {hasFasting && <div className="w-1 h-1 rounded-full bg-orange-400"></div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-4">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Refeições
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-blue-400"></div> Água
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-indigo-400"></div> Treino
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-orange-400"></div> Jejum
        </div>
      </div>

      {viewingDay && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10 duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {viewingDay.date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                </h3>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{viewingDay.date.toLocaleDateString('pt-BR', { weekday: 'long' })}</p>
              </div>
              <button onClick={() => setViewingDay(null)} className="p-3 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-8">
              {/* Balanço Rápido */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                  <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">Kcal In</span>
                  <span className="text-sm font-black text-slate-800">{Math.round(viewingDay.log?.meals.reduce((s, m) => s + m.items.reduce((s2, i) => s2 + i.calories, 0), 0) || 0)}</span>
                </div>
                <div className="bg-indigo-50 p-3 rounded-2xl text-center">
                  <span className="block text-[8px] font-black text-indigo-400 uppercase mb-1">Kcal Out</span>
                  <span className="text-sm font-black text-indigo-600">{Math.round(viewingDay.log?.workouts?.reduce((s, w) => s + w.caloriesBurned, 0) || 0)}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                  <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">Proteína</span>
                  <span className="text-sm font-black text-slate-800">{Math.round(viewingDay.log?.meals.reduce((s, m) => s + m.items.reduce((s2, i) => s2 + i.protein, 0), 0) || 0)}g</span>
                </div>
                <div className="bg-blue-50 p-3 rounded-2xl text-center">
                  <span className="block text-[8px] font-black text-blue-400 uppercase mb-1">Água</span>
                  <span className="text-sm font-black text-blue-600">{viewingDay.log?.waterIntake || 0}ml</span>
                </div>
              </div>

              {/* Refeições */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Refeições</h4>
                {viewingDay.log?.meals.some(m => m.items.length > 0) ? (
                  viewingDay.log.meals.filter(m => m.items.length > 0).map((meal, idx) => (
                    <div key={idx} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs font-black text-slate-700 mb-2">{meal.name}</p>
                      <div className="flex flex-wrap gap-1">
                        {meal.items.map((it, ii) => (
                          <span key={ii} className="text-[10px] bg-white px-2 py-1 rounded-lg border border-slate-100 font-bold text-slate-500">{it.name}</span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : <p className="text-xs italic text-slate-300">Nenhuma refeição registrada.</p>}
              </div>

              {/* Treinos */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest border-b border-indigo-100 pb-2">Treinos</h4>
                {viewingDay.log?.workouts && viewingDay.log.workouts.length > 0 ? (
                  viewingDay.log.workouts.map((w, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-indigo-50/30 p-4 rounded-2xl border border-indigo-50">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🏋️</span>
                        <div>
                          <p className="text-xs font-black text-indigo-700">{w.name}</p>
                          <p className="text-[10px] font-bold text-indigo-400">{w.durationMinutes} min • {w.caloriesBurned} kcal</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : <p className="text-xs italic text-slate-300">Nenhum treino registrado.</p>}
              </div>

              {/* Jejum */}
              {viewingDay.fasting.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-widest border-b border-orange-100 pb-2">Jejum</h4>
                  {viewingDay.fasting.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-orange-50/30 p-4 rounded-2xl border border-orange-50">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🔥</span>
                        <div>
                          <p className="text-xs font-black text-orange-700">{f.targetDuration}h de Protocolo</p>
                          <p className="text-[10px] font-bold text-orange-400">{f.completed ? 'CONCLUÍDO' : 'INTERROMPIDO'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button 
                onClick={() => onSelectDate(viewingDay.date)}
                className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all mt-4"
              >
                Abrir no Diário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
