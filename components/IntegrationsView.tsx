
import React, { useState } from 'react';
import { UserProfile, IntegrationSettings, SyncLog } from '../types';
import { INTEGRATION_SERVICES, SYNC_TYPES } from '../constants';

interface IntegrationsViewProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

const IntegrationsView: React.FC<IntegrationsViewProps> = ({ profile, onUpdateProfile }) => {
  const [syncing, setSyncing] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const settings: IntegrationSettings = profile.integrations || {
    services: [],
    syncLogs: [],
    lastAutoSync: Date.now()
  };

  const toggleConnection = (serviceId: string) => {
    const serviceIndex = settings.services.findIndex(s => s.id === serviceId);
    let updatedServices = [...settings.services];

    if (serviceIndex > -1) {
      // Toggle off
      updatedServices = updatedServices.filter(s => s.id !== serviceId);
    } else {
      // Connect new
      updatedServices.push({
        id: serviceId,
        connected: true,
        syncTypes: ['steps', 'workout', 'calories'] // default
      });
    }

    onUpdateProfile({
      integrations: {
        ...settings,
        services: updatedServices
      }
    });
  };

  const toggleSyncType = (serviceId: string, typeId: string) => {
    const updatedServices = settings.services.map(s => {
      if (s.id === serviceId) {
        const types = s.syncTypes.includes(typeId)
          ? s.syncTypes.filter(t => t !== typeId)
          : [...s.syncTypes, typeId];
        return { ...s, syncTypes: types };
      }
      return s;
    });

    onUpdateProfile({
      integrations: {
        ...settings,
        services: updatedServices
      }
    });
  };

  const handleSyncNow = async () => {
    if (settings.services.length === 0) return;
    
    setSyncing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newLogs: SyncLog[] = settings.services.map(s => ({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      serviceId: s.id,
      status: 'success',
      summary: `Sincronizados ${Math.floor(Math.random() * 5000) + 1000} passos e ${s.syncTypes.length} tipos de dados.`
    }));

    onUpdateProfile({
      integrations: {
        ...settings,
        syncLogs: [...newLogs, ...settings.syncLogs].slice(0, 20)
      }
    });
    setSyncing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 px-2">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 leading-tight">Integrações</h2>
          <p className="text-slate-500 mt-1 font-medium italic">Sincronize seu ecossistema de saúde.</p>
        </div>
        
        <button 
          onClick={handleSyncNow}
          disabled={syncing || settings.services.length === 0}
          className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl ${
            syncing 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95'
          }`}
        >
          {syncing ? (
            <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          )}
          {syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
        </button>
      </header>

      <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-100/50 flex items-center gap-4 text-amber-700">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">⚡</div>
        <p className="text-xs font-bold leading-relaxed">
          <span className="uppercase font-black text-[10px] block mb-1">Sincronização Automática</span>
          Seus dados são sincronizados automaticamente a cada 2 horas quando o app está aberto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Apps & Wearables Selection */}
        <section className="space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Dispositivos e Apps</h3>
          <div className="grid grid-cols-1 gap-3">
            {INTEGRATION_SERVICES.map(service => {
              const connectedService = settings.services.find(s => s.id === service.id);
              const isSelected = selectedServiceId === service.id;

              return (
                <div 
                  key={service.id}
                  className={`bg-white rounded-[2rem] border transition-all ${isSelected ? 'border-emerald-500 ring-4 ring-emerald-500/5' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div 
                    className="p-5 flex items-center justify-between cursor-pointer"
                    onClick={() => setSelectedServiceId(isSelected ? null : service.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${service.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-${service.color.split('-')[1]}-500/20`}>
                        {service.icon}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900">{service.name}</h4>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-wider">
                          {service.category === 'app' ? 'Serviço Cloud' : 'Wearable'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {connectedService && (
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      )}
                      <svg className={`w-5 h-5 text-slate-300 transition-transform ${isSelected ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="px-5 pb-6 pt-2 border-t border-slate-50 space-y-5 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <span className="text-xs font-black text-slate-700 uppercase">Status da Conexão</span>
                        <button 
                          onClick={() => toggleConnection(service.id)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                            connectedService 
                              ? 'bg-rose-50 text-rose-500 hover:bg-rose-100' 
                              : 'bg-emerald-500 text-white hover:bg-emerald-600'
                          }`}
                        >
                          {connectedService ? 'Desconectar' : 'Conectar Agora'}
                        </button>
                      </div>

                      {connectedService && (
                        <div className="space-y-4">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Dados para Sincronizar</span>
                          <div className="grid grid-cols-2 gap-2">
                            {SYNC_TYPES.map(type => (
                              <button
                                key={type.id}
                                onClick={() => toggleSyncType(service.id, type.id)}
                                className={`flex items-center gap-2 p-3 rounded-xl border text-[11px] font-bold transition-all ${
                                  connectedService.syncTypes.includes(type.id)
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                    : 'bg-white border-slate-100 text-slate-400'
                                }`}
                              >
                                <span>{type.icon}</span>
                                {type.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Sync History */}
        <section className="space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Histórico de Sincronização</h3>
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
            {settings.syncLogs.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {settings.syncLogs.map(log => {
                  const service = INTEGRATION_SERVICES.find(s => s.id === log.serviceId);
                  return (
                    <div key={log.id} className="p-6 hover:bg-slate-50 transition-all flex items-start gap-4">
                      <div className={`w-10 h-10 ${service?.color || 'bg-slate-200'} rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>
                        {service?.icon || '❓'}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="font-black text-slate-900 text-sm">{service?.name || 'Serviço Desconhecido'}</h5>
                          <span className="text-[10px] font-black text-slate-300 uppercase">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{log.summary}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            {log.status === 'success' ? 'Sucesso' : 'Falha'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl">🔄</div>
                <p className="text-slate-400 font-bold italic">Nenhum registro ainda.<br/>Conecte um serviço e sincronize seus dados.</p>
              </div>
            )}
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
            <h4 className="font-black text-sm uppercase tracking-widest text-emerald-400 mb-4">Privacidade de Dados</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              O Calorix acessa seus dados apenas para leitura e processamento local. Não enviamos seus dados de saúde para servidores externos. Você tem controle total sobre quais informações deseja compartilhar.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default IntegrationsView;
