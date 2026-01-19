
import React, { useState } from 'react';
import { Food } from '../types';

interface EditFoodModalProps {
  mealName: string;
  food: Food;
  onClose: () => void;
  onSave: (mealName: string, updatedFood: Food) => void;
}

const EditFoodModal: React.FC<EditFoodModalProps> = ({ mealName, food, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: food.name,
    servingSize: food.servingSize,
    calories: food.calories.toString(),
    protein: food.protein.toString(),
    carbs: food.carbs.toString(),
    fat: food.fat.toString()
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(mealName, {
      ...food,
      name: formData.name,
      servingSize: formData.servingSize,
      calories: parseFloat(formData.calories),
      protein: parseFloat(formData.protein),
      carbs: parseFloat(formData.carbs),
      fat: parseFloat(formData.fat)
    });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
        <div className="px-8 pt-10 pb-6 border-b border-slate-50 flex flex-col items-center text-center relative">
          <button 
            onClick={onClose} 
            className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-slate-900 leading-tight">Editar <span className="text-emerald-500">{food.name}</span></h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{mealName}</p>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome do Alimento</label>
            <input 
              required
              type="text" 
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 text-base font-medium outline-none focus:bg-white focus:border-emerald-500 transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Porção</label>
              <input 
                type="text" 
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 text-base font-medium outline-none focus:bg-white focus:border-emerald-500 transition-all"
                value={formData.servingSize}
                onChange={e => setFormData({...formData, servingSize: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Calorias</label>
              <input 
                required
                type="number" 
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 text-base font-medium outline-none focus:bg-white focus:border-emerald-500 transition-all"
                value={formData.calories}
                onChange={e => setFormData({...formData, calories: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Prot. (g)</label>
              <input 
                type="number" 
                className="w-full px-3 py-4 bg-slate-50 rounded-xl border border-slate-100 text-center font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                value={formData.protein}
                onChange={e => setFormData({...formData, protein: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Carb. (g)</label>
              <input 
                type="number" 
                className="w-full px-3 py-4 bg-slate-50 rounded-xl border border-slate-100 text-center font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                value={formData.carbs}
                onChange={e => setFormData({...formData, carbs: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Gord. (g)</label>
              <input 
                type="number" 
                className="w-full px-3 py-4 bg-slate-50 rounded-xl border border-slate-100 text-center font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                value={formData.fat}
                onChange={e => setFormData({...formData, fat: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFoodModal;
