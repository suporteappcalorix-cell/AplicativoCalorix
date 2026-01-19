
import React from 'react';
import { UserProfile, AuthUser } from '../types';

interface RankingUser {
  name: string;
  points: number;
  avatar: string;
  isMe?: boolean;
}

interface RankingViewProps {
  profile: UserProfile;
}

const RankingView: React.FC<RankingViewProps> = ({ profile }) => {
  // Simulated ranking data
  const users: RankingUser[] = [
    { name: 'Elena Stark', points: 15400, avatar: 'https://i.pravatar.cc/150?u=elena' },
    { name: 'Carlos Nutrition', points: 12850, avatar: 'https://i.pravatar.cc/150?u=carlos' },
    { name: 'Sophia Run', points: 11200, avatar: 'https://i.pravatar.cc/150?u=sophia' },
    { name: profile.name, points: profile.points || 0, avatar: `https://ui-avatars.com/api/?name=${profile.name}&background=10b981&color=fff`, isMe: true },
    { name: 'Junior Silva', points: 9500, avatar: 'https://i.pravatar.cc/150?u=junior' },
    { name: 'Ana Fit', points: 8700, avatar: 'https://i.pravatar.cc/150?u=ana' },
    { name: 'Leo Expert', points: 7200, avatar: 'https://i.pravatar.cc/150?u=leo' },
  ].sort((a, b) => b.points - a.points);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="px-2">
        <h2 className="text-3xl font-black text-slate-900 leading-tight">Ranking Global</h2>
        <p className="text-slate-500 mt-1 font-medium">Veja como você se compara aos outros usuários.</p>
      </header>

      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl">
        <div className="p-8 space-y-4">
          {users.map((u, i) => (
            <div 
              key={u.name} 
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${u.isMe ? 'bg-emerald-50 border-2 border-emerald-100' : 'hover:bg-slate-50'}`}
            >
              <div className="w-8 text-center font-black text-slate-300">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </div>
              <img src={u.avatar} className="w-12 h-12 rounded-xl shadow-sm border border-slate-100" alt={u.name} />
              <div className="flex-1">
                <h4 className={`font-black ${u.isMe ? 'text-emerald-700' : 'text-slate-800'}`}>
                  {u.name} {u.isMe && '(Você)'}
                </h4>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nível {Math.floor(u.points / 1000) + 1}</p>
              </div>
              <div className="text-right">
                <span className={`block font-black ${u.isMe ? 'text-emerald-600' : 'text-slate-900'}`}>{u.points.toLocaleString()}</span>
                <span className="text-[10px] font-black text-slate-300 uppercase">Pontos</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-500 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
        <h3 className="text-xl font-black mb-2 relative z-10">Dica do Ranking</h3>
        <p className="text-sm opacity-90 font-medium leading-relaxed relative z-10">
          A consistência vale mais do que picos de intensidade. Logar suas refeições todos os dias garante o bônus de "Sequência Diária" (+100 pontos)!
        </p>
      </div>
    </div>
  );
};

export default RankingView;
