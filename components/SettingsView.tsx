
import React from 'react';
import { UserProfile, SmartNotificationSettings } from '../types';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ profile, onUpdateProfile }) => {
  const settings: SmartNotificationSettings = profile.smartNotifications || {
    enabled: true,
    frequency: 'medium',
    types: { water: true, calories: true, fasting: true, workouts: true }
  };

  const updateSettings = (updates: Partial<SmartNotificationSettings>) => {
    onUpdateProfile({
      smartNotifications: { ...settings, ...updates }
    });
  };

  const updateTypes = (key: keyof SmartNotificationSettings['types']) => {
    updateSettings({
      types: { ...settings.types, [key]: !settings.types[key] }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header className="px-2">
        <h2 className="text-3xl font-black text-slate-900 leading-tight">Configurações</h2>
        <p className="text-slate-500 mt-1 font-medium">Personalize sua experiência no Calorix.</p>
      </header>

      <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
        <div>
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Notificações Inteligentes</h3>
          
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl mb-8">
            <div>
              <p className="font-black text-emerald-800">Ativar Notificações</p>
              <p className="text-xs text-emerald-600 font-medium">Receba alertas úteis baseados no seu progresso.</p>
            </div>
            <button 
              onClick={() => updateSettings({ enabled: !settings.enabled })}
              className={`w-12 h-6 rounded-full relative transition-colors ${settings.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.enabled ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>

          <div className={`space-y-6 ${!settings.enabled ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Frequência de Alertas</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1.5 rounded-2xl">
                {(['low', 'medium', 'high'] as const).map(freq => (
                  <button
                    key={freq}
                    onClick={() => updateSettings({ frequency: freq })}
                    className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                      settings.frequency === freq ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {freq === 'low' ? 'Resumo' : freq === 'medium' ? 'Equilibrado' : 'Frequente'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tipos de Notificação</label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(settings.types).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => updateTypes(key as any)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      value ? 'bg-white border-emerald-100 shadow-sm' : 'bg-slate-50 border-transparent text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {key === 'water' ? '💧' : key === 'calories' ? '⚖️' : key === 'fasting' ? '⏳' : '🏋️'}
                      </span>
                      <span className="text-sm font-bold capitalize">
                        {key === 'water' ? 'Hidratação' : key === 'calories' ? 'Calorias' : key === 'fasting' ? 'Jejum' : 'Treinos'}
                      </span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${value ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${value ? 'left-5.5' : 'left-0.5'}`}></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Conta e Privacidade</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg">💾</div>
               <span className="text-sm font-bold text-slate-700">Backup de Dados Local</span>
            </div>
            <svg className="w-5 h-5 text-slate-300 group-hover:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-rose-50 rounded-2xl transition-all group">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center text-lg">⚠️</div>
               <span className="text-sm font-bold text-rose-600">Apagar Todos os Dados</span>
            </div>
          </button>
        </div>
      </section>

      <div className="bg-slate-900 rounded-[2rem] p-8 text-white text-center">
        <p className="text-xs text-slate-400 mb-2">Versão 2.4.0 (Harvard Build)</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Desenvolvido por Expert Performance Health</p>
      </div>
    </div>
  );
};

export default SettingsView;
