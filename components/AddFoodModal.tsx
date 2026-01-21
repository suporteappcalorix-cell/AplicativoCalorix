
import React, { useState, useMemo } from 'react';
import { Food, UserProfile, FoodCategory } from '../types';
import { COMMON_FOODS, CATEGORY_LABELS } from '../constants';
import FoodCameraModal from './FoodCameraModal';
import EditFoodModal from './EditFoodModal';

interface AddFoodModalProps {
  mealName: string;
  onClose: () => void;
  onAdd: (mealName: string, food: Food) => void;
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

const AddFoodModal: React.FC<AddFoodModalProps> = ({ mealName, onClose, onAdd, profile, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'search' | 'manual' | 'mine'>('search');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'all'>('all');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  const [manualFood, setManualFood] = useState<Partial<Food>>({
    name: '',
    servingSize: '100g',
    category: 'outros',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    micronutrients: {
      fiber: 0,
      sodium: 0
    }
  });

  const playSuccessSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}
  };

  const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const handleSearch = (list: any[]) => {
    const termStr = normalize(search);
    const terms = termStr.split(/\s+/).filter(t => t.length > 0);
    return list.filter(f => {
      const name = normalize(f.name);
      return terms.every(term => name.includes(term)) && (selectedCategory === 'all' || f.category === selectedCategory);
    });
  };

  const filteredGlobal = useMemo(() => handleSearch(COMMON_FOODS), [search, selectedCategory]);
  const filteredMine = useMemo(() => handleSearch(profile.customFoods || []), [search, selectedCategory, profile.customFoods]);

  const handleSelect = (food: any) => {
    playSuccessSound();
    onAdd(mealName, {
      ...food,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSuccessSound();
    const newFood: Food = {
      ...(manualFood as Food),
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    onUpdateProfile({ customFoods: [...(profile.customFoods || []), newFood] });
    onAdd(mealName, newFood);
    onClose();
  };

  if (isCameraOpen) {
    return (
      <FoodCameraModal 
        onClose={() => setIsCameraOpen(false)} 
        onConfirm={(foods) => {
          foods.forEach(f => handleSelect(f));
          onClose();
        }}
        onManualEntry={() => {
          setIsCameraOpen(false);
          setActiveTab('search');
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-white/20">
        <div className="px-8 pt-8 pb-4 border-b border-slate-50 relative">
          <button onClick={onClose} className="absolute right-6 top-6 p-2 text-slate-300 hover:text-slate-600 transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <h2 className="text-xl font-black text-slate-900 leading-tight">Adicionar ao <span className="text-emerald-500">{mealName}</span></h2>
          <div className="flex gap-2 mt-6 bg-slate-50 p-1 rounded-2xl">
            {(['search', 'mine', 'manual'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>
                {tab === 'search' ? 'Banco Global' : tab === 'mine' ? 'Registrados' : 'Manual'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab !== 'manual' ? (
            <>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" placeholder="Pesquisar alimento..." className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:bg-white focus:border-emerald-500 transition-all" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button onClick={() => setIsCameraOpen(true)} className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><circle cx="12" cy="13" r="3" strokeWidth="2" /></svg></button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button onClick={() => setSelectedCategory('all')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap transition-all ${selectedCategory === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>🌐 Tudo</button>
                {Object.entries(CATEGORY_LABELS).map(([key, value]) => (
                  <button key={key} onClick={() => setSelectedCategory(key as FoodCategory)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap transition-all ${selectedCategory === key ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}><span>{value.icon}</span> {value.label}</button>
                ))}
              </div>
              <div className="space-y-2">
                {(activeTab === 'search' ? filteredGlobal : filteredMine).map((food, i) => (
                  <div key={i} className="group flex items-center gap-3 p-4 bg-white hover:bg-slate-50 border border-slate-50 rounded-2xl transition-all cursor-pointer" onClick={() => handleSelect(food)}>
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg">{CATEGORY_LABELS[food.category as FoodCategory]?.icon || '🍽️'}</div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">{food.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{food.servingSize} • {Math.round(food.calories)} kcal</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nome do Alimento</label><input required className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:bg-white focus:border-emerald-500 font-bold" value={manualFood.name} onChange={e => setManualFood({...manualFood, name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Categoria</label><select className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none font-bold appearance-none" value={manualFood.category} onChange={e => setManualFood({...manualFood, category: e.target.value as FoodCategory})}>{Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Calorias</label><input required type="number" className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none font-bold" value={manualFood.calories || ''} onChange={e => setManualFood({...manualFood, calories: parseFloat(e.target.value)})} /></div>
              </div>
              <button type="submit" className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 active:scale-95 transition-all mt-4">Salvar nos Meus Registros</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddFoodModal;
