
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getCoachAdvice } from '../services/geminiService';

interface AICoachWidgetProps {
  profile: UserProfile;
  totals: { calories: number; protein: number; carbs: number; fat: number };
}

const AICoachWidget: React.FC<AICoachWidgetProps> = ({ profile, totals }) => {
  const [advice, setAdvice] = useState<string>("Analisando seu dia...");
  const [isLoading, setIsLoading] = useState(false);

  const fetchAdvice = async () => {
    setIsLoading(true);
    const context = `Usuário: ${profile.name}, Objetivo: ${profile.goal}, Consumo: ${totals.calories}/${profile.goals.calories} kcal, Macros: P:${totals.protein}g, C:${totals.carbs}g, F:${totals.fat}g`;
    const prompt = `Dê uma dica rápida de nutrição/fitness para este usuário agora.`;
    const res = await getCoachAdvice(context, prompt);
    setAdvice(res || "Mantenha o foco nos seus objetivos!");
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAdvice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 shadow-xl shadow-emerald-500/20 text-white overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
      
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg">
          <img src="https://picsum.photos/seed/coach/100/100" alt="Coach" />
        </div>
        <div>
          <h3 className="font-bold text-sm">Coach Leo (Harvard)</h3>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse"></span>
            <span className="text-[10px] opacity-75 font-bold uppercase tracking-widest">Online Agora</span>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 min-h-[80px] relative z-10">
        {isLoading ? (
          <div className="flex gap-2 items-center">
            <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
        ) : (
          <p className="text-sm leading-relaxed font-medium">"{advice}"</p>
        )}
      </div>

      <button 
        onClick={fetchAdvice}
        className="mt-4 text-[10px] font-black uppercase tracking-widest opacity-75 hover:opacity-100 transition-opacity flex items-center gap-1"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        Nova Dica
      </button>
    </section>
  );
};

export default AICoachWidget;
