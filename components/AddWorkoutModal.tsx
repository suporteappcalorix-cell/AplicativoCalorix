
import React, { useState } from 'react';
import { Workout } from '../types';

interface AddWorkoutModalProps {
  onClose: () => void;
  onAdd: (workout: Workout) => void;
}

const COMMON_EXERCISES = [
  { name: 'Caminhada', kcalPerMin: 5 },
  { name: 'Corrida', kcalPerMin: 12 },
  { name: 'Musculação', kcalPerMin: 7 },
  { name: 'Natação', kcalPerMin: 10 },
  { name: 'Ciclismo', kcalPerMin: 8 },
  { name: 'Yoga', kcalPerMin: 3 },
  { name: 'Crossfit', kcalPerMin: 15 }
];

const AddWorkoutModal: React.FC<AddWorkoutModalProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('30');
  const [calories, setCalories] = useState('200');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      name,
      durationMinutes: parseInt(duration),
      caloriesBurned: parseInt(calories),
      timestamp: Date.now()
    });
  };

  const selectQuick = (ex: typeof COMMON_EXERCISES[0]) => {
    setName(ex.name);
    const dur = parseInt(duration);
    setCalories((dur * ex.kcalPerMin).toString());
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-900">Registrar Treino</h3>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
          {COMMON_EXERCISES.map(ex => (
            <button
              key={ex.name}
              onClick={() => selectQuick(ex)}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black whitespace-nowrap hover:bg-indigo-100 transition-all"
            >
              {ex.name}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Atividade</label>
            <input required className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Corrida de Rua" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Duração (min)</label>
              <input required type="number" className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Kcal Queimadas</label>
              <input required type="number" className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold" value={calories} onChange={e => setCalories(e.target.value)} />
            </div>
          </div>

          <button type="submit" className="w-full py-5 bg-indigo-500 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/20 hover:bg-indigo-600 transition-all mt-4">
            Salvar Exercício
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddWorkoutModal;
