
import React, { useState, useRef } from 'react';
import { UserProfile, AuthUser } from '../types';

interface EditProfileViewProps {
  user: AuthUser;
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onCancel: () => void;
  onUpdateAvatar: (avatar: string) => void;
}

const EditProfileView: React.FC<EditProfileViewProps> = ({ user, profile, onUpdateProfile, onCancel, onUpdateAvatar }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
  };

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            onUpdateAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const FormRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
      <label className="text-sm font-bold text-slate-500">{label}</label>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center gap-6">
        <button onClick={onCancel} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 transition-all shadow-sm">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h2 className="text-3xl font-black text-slate-900 leading-tight">Editar Perfil Completo</h2>
          <p className="text-slate-500 mt-1 font-medium">Mantenha suas informações sempre atualizadas.</p>
        </div>
      </header>

      <form onSubmit={handleSave} className="bg-white rounded-[3rem] p-8 sm:p-12 shadow-sm border border-slate-100 space-y-8">
        <div className="flex justify-center">
            <div className="relative group">
                <img src={user.avatar} className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover" alt="Avatar"/>
                <button 
                    type="button"
                    onClick={triggerFileUpload}
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2H5a2 2 0 01-2-2V9z" /><circle cx="12" cy="13" r="3" strokeWidth="2" /></svg>
                    <span className="sr-only">Alterar foto</span>
                </button>
                <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/png, image/jpeg"
                />
            </div>
        </div>
        
        {/* Basic Info */}
        <div className="space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Informações Básicas</h3>
          <FormRow label="Nome Completo">
            <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 font-medium text-sm" />
          </FormRow>
          <FormRow label="Idade">
            <input type="number" value={formData.age} onChange={e => handleChange('age', parseInt(e.target.value))} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 font-medium text-sm" />
          </FormRow>
          <FormRow label="Sexo Biológico">
            <select value={formData.sex} onChange={e => handleChange('sex', e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 font-medium text-sm appearance-none">
              <option value="female">Feminino</option>
              <option value="male">Masculino</option>
              <option value="other">Outro</option>
            </select>
          </FormRow>
        </div>
        
        {/* Physical Info */}
        <div className="space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Dados Físicos</h3>
          <FormRow label="Peso Atual (kg)">
            <input type="number" step="0.1" value={formData.weight} onChange={e => handleChange('weight', parseFloat(e.target.value))} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 font-medium text-sm" />
          </FormRow>
          <FormRow label="Altura (cm)">
            <input type="number" value={formData.height} onChange={e => handleChange('height', parseInt(e.target.value))} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 font-medium text-sm" />
          </FormRow>
          <FormRow label="Peso Desejado (kg)">
            <input type="number" step="0.1" value={formData.desiredWeight} onChange={e => handleChange('desiredWeight', parseFloat(e.target.value))} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 font-medium text-sm" />
          </FormRow>
        </div>

        {/* Lifestyle Info */}
        <div className="space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Estilo de Vida</h3>
          <FormRow label="Nível de Atividade">
             <select value={formData.activityLevel} onChange={e => handleChange('activityLevel', parseFloat(e.target.value))} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 font-medium text-sm appearance-none">
              <option value={1.2}>Sedentário</option>
              <option value={1.375}>Levemente Ativo</option>
              <option value={1.55}>Moderadamente Ativo</option>
              <option value={1.725}>Muito Ativo</option>
            </select>
          </FormRow>
          <FormRow label="Estilo de Dieta">
             <select value={formData.dietStyle} onChange={e => handleChange('dietStyle', e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 font-medium text-sm appearance-none">
              <option value="Normal">Normal / Flexível</option>
              <option value="Vegana">Vegetariana / Vegana</option>
              <option value="Keto">Cetogênica / Low Carb</option>
            </select>
          </FormRow>
          <FormRow label="Qualidade do Sono">
             <select value={formData.sleepQuality} onChange={e => handleChange('sleepQuality', e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 font-medium text-sm appearance-none">
              <option value="poor">Ruim</option>
              <option value="medium">Média</option>
              <option value="good">Boa</option>
            </select>
          </FormRow>
        </div>

        <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
          <button type="button" onClick={onCancel} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm">
            Cancelar
          </button>
          <button type="submit" className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileView;
