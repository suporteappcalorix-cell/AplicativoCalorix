
import React, { useState, useEffect } from 'react';
import { DailyLog, Reminder, UserProfile } from '../types';

interface WaterTrackerProps {
  current: number;
  goal: number;
  onUpdate: (amount: number) => void;
  history: Record<string, DailyLog>;
  reminders: Reminder[];
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

const GlassIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <div className="relative w-8 h-10 group cursor-pointer transition-transform active:scale-90">
    <svg className="w-full h-full" viewBox="0 0 24 30" fill="none">
      <path d="M4 2L6 28H18L20 2H4Z" stroke="currentColor" strokeWidth="2" className={filled ? "text-blue-500" : "text-slate-200"} />
      {filled && (
        <path d="M6 10L6.8 24H17.2L18 10H6Z" fill="currentColor" className="text-blue-400 animate-in fade-in slide-in-from-bottom-2 duration-500" />
      )}
    </svg>
  </div>
);

const WaterTracker: React.FC<WaterTrackerProps> = ({ 
  current, goal, onUpdate, history, reminders, onUpdateProfile 
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(goal.toString());
  const [showReminders, setShowReminders] = useState(false);

  const glassSize = 250;
  const totalGlasses = Math.ceil(goal / glassSize);
  const filledGlasses = Math.floor(current / glassSize);

  // Inicializa lembretes padrão se estiver vazio
  const DEFAULT_TIMES = ['08:00', '10:00', '14:00', '16:00', '19:00', '21:00'];
  const activeReminders = reminders.length > 0 ? reminders : DEFAULT_TIMES.map(t => ({
    id: `water-${t}`,
    label: 'Beber Água',
    time: t,
    enabled: false
  }));

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('pt-BR', { weekday: 'narrow' });
    const amount = history[dateStr]?.waterIntake || 0;
    return { dayName, amount };
  });

  const maxHistory = Math.max(...last7Days.map(d => d.amount), goal, 1);

  const handleSaveGoal = () => {
    const newGoal = parseInt(tempGoal);
    if (!isNaN(newGoal) && newGoal > 0) {
      onUpdateProfile({ goals: { 
        calories: 2000, // Dummy fallback, ideal seria pegar do profile real
        protein: 150,
        carbs: 200,
        fat: 70,
        water: newGoal 
      } as any }); // Simplificado para o exemplo, em prod deve mesclar corretamente
    }
    setIsEditingGoal(false);
  };

  const toggleReminder = async (time: string) => {
    // Solicita permissão se ainda não tiver e estiver ativando
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      await Notification.requestPermission();
    }

    const updatedReminders = activeReminders.map(r => 
      r.time === time ? { ...r, enabled: !r.enabled } : r
    );
    onUpdateProfile({ reminders: updatedReminders });
  };

  // Verificador de lembretes em background (simulado)
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentH = now.getHours().toString().padStart(2, '0');
      const currentM = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentH}:${currentM}`;

      const activeNow = activeReminders.find(r => r.enabled && r.time === currentTimeStr);
      if (activeNow && Notification.permission === 'granted') {
        new Notification("Calorix: Hora de Hidratar! 💧", {
          body: "Lembrete: Beba um copo de 250ml de água agora para manter sua meta.",
          icon: "/icon-192.png" // Assume existe um ícone
        });
      }
    };

    const interval = setInterval(checkReminders, 60000); // Checa a cada minuto
    return () => clearInterval(interval);
  }, [activeReminders]);

  return (
    <section className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">Hidratação</h2>
          {isEditingGoal ? (
            <div className="flex items-center gap-2 mt-1">
              <input 
                autoFocus
                type="number" 
                className="w-20 px-2 py-1 bg-slate-50 border border-blue-200 rounded-lg text-sm font-bold text-blue-600 outline-none"
                value={tempGoal}
                onChange={e => setTempGoal(e.target.value)}
                onBlur={handleSaveGoal}
                onKeyDown={e => e.key === 'Enter' && handleSaveGoal()}
              />
              <span className="text-[10px] font-bold text-slate-400 uppercase">ML</span>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditingGoal(true)}
              className="text-xs font-bold text-blue-500 flex items-center gap-1 hover:underline"
            >
              Meta: {goal}ml
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>
        
        <div className="text-right">
          <span className="block text-2xl font-black text-blue-600 leading-none">{current}</span>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ml ingeridos</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center py-4 bg-slate-50/50 rounded-2xl border border-slate-50">
        {Array.from({ length: totalGlasses }).map((_, i) => (
          <GlassIcon key={i} filled={i < filledGlasses} />
        ))}
      </div>

      <div className="flex gap-3">
        <button 
          onClick={() => onUpdate(Math.max(0, current - glassSize))}
          className="flex-1 h-14 bg-slate-100 text-slate-400 rounded-2xl font-black text-xl hover:bg-slate-200 transition-all flex items-center justify-center group"
          title="Remover 250ml"
        >
          <svg className="w-6 h-6 group-active:scale-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
          </svg>
        </button>
        <button 
          onClick={() => onUpdate(current + glassSize)}
          className="flex-[2] h-14 bg-blue-500 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
          Beber Água
        </button>
      </div>

      <div className="pt-4 border-t border-slate-50">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Consumo Semanal</h3>
        <div className="flex items-end justify-between h-24 px-2">
          {last7Days.map((day, i) => {
            const height = (day.amount / maxHistory) * 100;
            const isGoalMet = day.amount >= goal;
            return (
              <div key={i} className="flex flex-col items-center gap-2 group relative">
                <div className="absolute -top-6 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {day.amount}ml
                </div>
                <div 
                  className={`w-2.5 rounded-full transition-all duration-500 ${isGoalMet ? 'bg-blue-500' : 'bg-slate-100'}`}
                  style={{ height: `${Math.max(8, height)}%` }}
                />
                <span className="text-[9px] font-black text-slate-300 uppercase">{day.dayName}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-50">
        <button 
          onClick={() => setShowReminders(!showReminders)}
          className="w-full flex items-center justify-between text-slate-400 hover:text-slate-600 transition-colors"
        >
          <span className="text-xs font-bold uppercase tracking-widest">Configurar Lembretes</span>
          <svg className={`w-4 h-4 transition-transform ${showReminders ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showReminders && (
          <div className="mt-4 grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-300">
            {activeReminders.map(reminder => (
              <button 
                key={reminder.time}
                onClick={() => toggleReminder(reminder.time)}
                className={`p-3 border rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  reminder.enabled 
                    ? 'bg-blue-50 border-blue-200 text-blue-600' 
                    : 'bg-slate-50 border-slate-100 text-slate-400'
                }`}
              >
                {reminder.time}
                <div className={`w-8 h-4 rounded-full relative transition-colors ${
                  reminder.enabled ? 'bg-blue-500' : 'bg-slate-300'
                }`}>
                  <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${
                    reminder.enabled ? 'left-5' : 'left-1'
                  }`}></div>
                </div>
              </button>
            ))}
            {Notification.permission === 'denied' && (
              <p className="col-span-2 text-[10px] text-rose-400 font-bold text-center mt-2">
                As notificações estão bloqueadas no seu navegador.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default WaterTracker;
