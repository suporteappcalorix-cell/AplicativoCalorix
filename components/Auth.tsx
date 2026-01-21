
import React, { useState } from 'react';
import { AuthUser } from '../types';

interface AuthProps {
  onLogin: (user: AuthUser) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulação de autenticação/criação de conta
    // Em um app real, aqui haveria uma chamada para Firebase/Auth0/Supabase
    onLogin({
      uid: `user-${Math.random().toString(36).substr(2, 9)}`,
      name: isRegistering ? name : email.split('@')[0],
      email: email,
      avatar: `https://ui-avatars.com/api/?name=${isRegistering ? name : email.split('@')[0]}&background=10b981&color=fff`
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-emerald-500/10 border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-6 shadow-lg shadow-emerald-500/40">C</div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isRegistering ? 'Crie sua conta' : 'Bem-vindo de volta'}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            {isRegistering ? 'Comece sua jornada com o Calorix.' : 'Seu mentor de saúde inteligente.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegistering && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Nome Completo</label>
              <input 
                required
                type="text" 
                className="w-full px-5 py-4 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 transition-all text-lg font-medium"
                placeholder="Como quer ser chamado?"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Email</label>
            <input 
              required
              type="email" 
              className="w-full px-5 py-4 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 transition-all text-lg font-medium"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Senha</label>
            <input 
              required
              type="password" 
              className="w-full px-5 py-4 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 transition-all text-lg font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/30 transition-all transform hover:scale-[1.02] active:scale-95 mt-4">
            {isRegistering ? 'Criar minha conta' : 'Entrar agora'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center text-slate-400 text-sm font-medium">
          {isRegistering ? (
            <>
              Já possui uma conta?{' '}
              <button 
                onClick={() => setIsRegistering(false)} 
                className="text-emerald-500 font-bold hover:underline"
              >
                Entrar agora
              </button>
            </>
          ) : (
            <>
              Ainda não tem conta?{' '}
              <button 
                onClick={() => setIsRegistering(true)} 
                className="text-emerald-500 font-bold hover:underline"
              >
                Criar agora
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
