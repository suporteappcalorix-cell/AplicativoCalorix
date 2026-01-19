import React from 'react';
// Fix: Import NutritionalGoals from types instead of constants to resolve module error
import { MICRONUTRIENT_METADATA } from '../constants';
import { NutritionalGoals } from '../types';

interface MicronutrientsPanelProps {
  current: Record<string, number>;
  goals: NutritionalGoals['micronutrients'];
}

const MicronutrientsPanel: React.FC<MicronutrientsPanelProps> = ({ current, goals }) => {
  return (
    <section className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-black flex items-center gap-3">
          <span className="w-2.5 h-6 bg-blue-500 rounded-full"></span>
          Vitaminas & Minerais
        </h2>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Metas Diárias</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {Object.entries(MICRONUTRIENT_METADATA).map(([key, meta]) => {
          const currentVal = current[key] || 0;
          const goalVal = (goals as any)[key] || 1;
          const percent = Math.min(100, (currentVal / goalVal) * 100);
          
          return (
            <div key={key} className="space-y-3 group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform">
                    {meta.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm leading-none">{meta.label}</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 leading-tight max-w-[150px]">{meta.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-black text-slate-700">{Math.round(currentVal)}{meta.unit}</span>
                  <span className="text-[9px] font-bold text-slate-300 uppercase">/ {goalVal}{meta.unit}</span>
                </div>
              </div>

              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out rounded-full shadow-sm ${
                    percent < 30 ? 'bg-rose-400' : percent < 70 ? 'bg-amber-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-3 text-slate-400">
        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-xs">ℹ️</div>
        <p className="text-[10px] font-medium leading-relaxed italic">
          Os dados de micronutrientes são baseados em estimativas médias dos alimentos. 
          Consulte um nutricionista para um plano de suplementação específico.
        </p>
      </div>
    </section>
  );
};

export default MicronutrientsPanel;