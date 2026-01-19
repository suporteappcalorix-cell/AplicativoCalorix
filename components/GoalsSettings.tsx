
import React, { useState } from 'react';
import { UserProfile, NutritionalGoals } from '../types';

interface GoalsSettingsProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

const GoalsSettings: React.FC<GoalsSettingsProps> = ({ profile, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoals, setTempGoals] = useState<NutritionalGoals>(profile.goals);

  const handleSave = () => {
    onUpdateProfile({ goals: tempGoals });
    setIsEditing(false);
  };

  const handleChange = (field: keyof NutritionalGoals, value: string) => {
    const numValue = parseFloat(value) || 0;
    setTempGoals(prev => ({ ...prev, [field]: numValue }));
  };

  const GoalCard = ({ label, value, unit, color, icon, field }: { 
    label: string, value: number, unit: string, color: string, icon: string, field: keyof NutritionalGoals 
  }) => (
    <div className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all ${isEditing ? 'ring-2 ring-emerald-500/10' : ''}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${color} bg-opacity-10`}>
          {icon}
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      
      {isEditing ? (
        <div className="relative">
          <input 
            type="number" 
            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-black text-xl text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            value={tempGoals[field] as number}
            onChange={(e) => handleChange(field, e.target.value)}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">{unit}</span>
        </div>
      ) : (
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-slate-900">{value}</span>
          <span className="text-xs font-bold text-slate-400 uppercase">{unit}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 leading-tight">Metas Diárias</h2>
          <p className="text-slate-500 mt-1 font-medium">Ajuste seus objetivos nutricionais.</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Editar
          </button>
        ) : (
          <div className="flex gap-2">
             <button 
              onClick={() => { setIsEditing(false); setTempGoals(profile.goals); }}
              className="px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              Salvar
            </button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GoalCard 
          label="Calorias" 
          value={profile.goals.calories} 
          unit="kcal" 
          color="text-emerald-500 bg-emerald-500" 
          icon="⚡" 
          field="calories"
        />
        <GoalCard 
          label="Proteínas" 
          value={profile.goals.protein} 
          unit="g" 
          color="text-blue-500 bg-blue-500" 
          icon="🥩" 
          field="protein"
        />
        <GoalCard 
          label="Carboidratos" 
          value={profile.goals.carbs} 
          unit="g" 
          color="text-amber-500 bg-amber-500" 
          icon="🍝" 
          field="carbs"
        />
        <GoalCard 
          label="Gorduras" 
          value={profile.goals.fat} 
          unit="g" 
          color="text-rose-500 bg-rose-500" 
          icon="🥑" 
          field="fat"
        />
      </div>

      <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">💡</div>
          <div>
            <h4 className="text-emerald-900 font-black text-sm uppercase tracking-widest mb-2">Dica do Coach</h4>
            <p className="text-emerald-700 text-sm font-medium leading-relaxed">
              Manter um equilíbrio constante entre proteínas e gorduras ajuda a controlar a saciedade. 
              Se você está tentando perder peso, priorize proteínas e fibras.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsSettings;
