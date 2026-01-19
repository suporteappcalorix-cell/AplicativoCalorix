
import React, { useState, useRef } from 'react';
import { UserProfile, AuthUser } from '../types';
import { getActivityLevelLabel } from '../utils/nutritionUtils';

interface ProfileViewProps {
  user: AuthUser;
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onNavigate: (view: 'editProfile') => void;
  onUpdateAvatar: (avatar: string) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, profile, onUpdateProfile, onNavigate, onUpdateAvatar }) => {
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(profile.social?.bio || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveBio = () => {
    onUpdateProfile({ 
      social: {
        ...(profile.social || { followers: [], following: [], savedPosts: [] }),
        bio: tempBio
      }
    });
    setIsEditingBio(false);
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


  const getGoalLabel = (goal: string) => {
    const labels: Record<string, string> = {
      lose: 'Perder Peso',
      gain: 'Ganhar Massa',
      maintain: 'Manter Peso',
    };
    return labels[goal] || 'Definir Corpo';
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-8">
        <div className="relative flex-shrink-0 group">
          <img src={user.avatar} className="w-32 h-32 rounded-[2.5rem] border-4 border-emerald-50 shadow-2xl object-cover" alt="Avatar" />
          
          <button 
            onClick={triggerFileUpload}
            className="absolute inset-0 bg-black/50 rounded-[2.5rem] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2H5a2 2 0 01-2-2V9z" /><circle cx="12" cy="13" r="3" strokeWidth="2" /></svg>
          </button>

          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            accept="image/png, image/jpeg"
          />

          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-3 rounded-2xl shadow-xl border-4 border-white pointer-events-none">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">{profile.name}</h2>
          
          {isEditingBio ? (
            <div className="mt-4 flex gap-2">
              <input 
                className="flex-1 bg-slate-50 rounded-lg px-3 py-2 text-sm"
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveBio()}
              />
              <button onClick={handleSaveBio} className="px-3 bg-emerald-500 text-white rounded-lg text-xs font-bold">Salvar</button>
            </div>
          ) : (
            <div 
              onClick={() => setIsEditingBio(true)}
              className="mt-3 text-slate-500 font-medium italic text-lg group cursor-pointer"
            >
              "{profile.social?.bio || 'Clique para adicionar uma bio...'}"
              <svg className="w-4 h-4 inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          )}
          
          <div className="mt-6 flex flex-wrap justify-center sm:justify-start gap-2">
            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">{getGoalLabel(profile.goal)}</div>
            <div className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">{profile.sex === 'male' ? 'Masculino' : 'Feminino'}</div>
            <div className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">{profile.age} anos</div>
          </div>
        </div>
      </header>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
          <span className="block text-3xl font-black text-slate-900">{profile.weight}<span className="text-sm font-bold text-slate-300">kg</span></span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peso</span>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
          <span className="block text-3xl font-black text-slate-900">{profile.height}<span className="text-sm font-bold text-slate-300">cm</span></span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Altura</span>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
          <span className="block text-3xl font-black text-slate-900">{profile.social?.followers.length || 0}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seguidores</span>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
          <span className="block text-3xl font-black text-slate-900">{profile.social?.following.length || 0}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seguindo</span>
        </div>
      </div>
      
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Informações Adicionais</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-5 rounded-2xl">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nível de Atividade</p>
            <p className="font-bold text-slate-800">{getActivityLevelLabel(profile.activityLevel)}</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estilo de Dieta</p>
            <p className="font-bold text-slate-800">{profile.dietStyle}</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qualidade do Sono</p>
            <p className="font-bold text-slate-800 capitalize">{profile.sleepQuality === 'good' ? 'Boa' : profile.sleepQuality === 'medium' ? 'Média' : 'Ruim'}</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disciplina</p>
            <p className="font-bold text-slate-800 capitalize">{profile.disciplineLevel === 'high' ? 'Alta' : profile.disciplineLevel === 'medium' ? 'Média' : 'Baixa'}</p>
          </div>
        </div>

        <button 
          onClick={() => onNavigate('editProfile')}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all">
          Editar Perfil Completo
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
