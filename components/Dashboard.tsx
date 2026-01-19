
import React, { useState, useMemo } from 'react';
import { UserProfile, DailyLog, FastingState, Food, Workout } from '../types';
import AddFoodModal from './AddFoodModal';
import WaterTracker from './WaterTracker';
import EditFoodModal from './EditFoodModal';
import MicronutrientsPanel from './MicronutrientsPanel';
import AddWorkoutModal from './AddWorkoutModal';

interface DashboardProps {
  profile: UserProfile;
  log: DailyLog;
  onUpdateLog: (log: DailyLog) => void;
  fasting: FastingState;
  onUpdateFasting: (state: FastingState) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  allLogs?: Record<string, DailyLog>;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  profile, log, onUpdateLog, fasting, onUpdateFasting, selectedDate, onDateChange, allLogs = {}, onUpdateProfile
}) => {
  const [isAddingFood, setIsAddingFood] = useState<string | null>(null);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [editingFood, setEditingFood] = useState<{ mealName: string, food: Food } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'food' | 'workout', mealName?: string, id: string } | null>(null);

  const totals = useMemo(() => {
    const results = log.meals.reduce((acc, meal) => {
      meal.items.forEach(item => {
        acc.calories += item.calories;
        acc.protein += item.protein;
        acc.carbs += item.carbs;
        acc.fat += item.fat;
        
        if (item.micronutrients) {
          Object.entries(item.micronutrients).forEach(([key, val]) => {
            if (val) acc.micronutrients[key] = (acc.micronutrients[key] || 0) + val;
          });
        }
      });
      return acc;
    }, { 
      calories: 0, protein: 0, carbs: 0, fat: 0, 
      micronutrients: {} as Record<string, number>,
      burned: 0
    });

    results.burned = log.workouts?.reduce((sum, w) => sum + w.caloriesBurned, 0) || 0;
    return results;
  }, [log]);

  const handleAddFood = (mealName: string, food: Food) => {
    const newLog = { ...log };
    const meal = newLog.meals.find(m => m.name === mealName);
    if (meal) {
      meal.items.push(food);
    } else {
      newLog.meals.push({ name: mealName, items: [food] });
    }
    onUpdateLog(newLog);
    setIsAddingFood(null);
  };

  const handleAddWorkout = (workout: Workout) => {
    const newLog = { ...log, workouts: [...(log.workouts || []), workout] };
    onUpdateLog(newLog);
    setIsAddingWorkout(false);
  };

  const removeWorkout = (id: string) => {
    const newLog = { ...log, workouts: log.workouts?.filter(w => w.id !== id) || [] };
    onUpdateLog(newLog);
    setConfirmDelete(null);
  };

  const handleEditFood = (mealName: string, updatedFood: Food) => {
    const newLog = { ...log };
    const meal = newLog.meals.find(m => m.name === mealName);
    if (meal) {
      meal.items = meal.items.map(i => i.id === updatedFood.id ? updatedFood : i);
    }
    onUpdateLog(newLog);
    setEditingFood(null);
  };

  const removeFood = (mealName: string, foodId: string) => {
    const newLog = { ...log };
    const meal = newLog.meals.find(m => m.name === mealName);
    if (meal) {
      meal.items = meal.items.filter(i => i.id !== foodId);
    }
    onUpdateLog(newLog);
    setConfirmDelete(null);
  };

  const handleUpdateWater = (newAmount: number) => {
    onUpdateLog({ ...log, waterIntake: newAmount });
  };

  const renderMacroProgress = (label: string, current: number, goal: number, color: string) => {
    const percent = Math.min(100, (current / goal) * 100);
    return (
      <div className="flex-1 w-full">
        <div className="flex justify-between text-[11px] mb-1.5 font-bold text-slate-500 uppercase tracking-wider">
          <span>{label}</span>
          <span>{Math.round(current)} / {Math.round(goal)}g</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} transition-all duration-700 ease-out rounded-full shadow-sm`} 
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  };

  const netCalories = totals.calories - totals.burned;
  const remainingCalories = profile.goals.calories - netCalories;
  
  const points = profile.points || 0;
  const level = Math.floor(points / 1000) + 1;
  const nextLevelProgress = (points % 1000) / 10;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">Olá, {profile.name} 👋</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-widest">Nível {level}</div>
            <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 transition-all duration-700" style={{ width: `${nextLevelProgress}%` }}></div>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{points.toLocaleString()} XP</span>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-2 bg-white p-1 rounded-2xl shadow-sm border border-slate-200 w-full sm:w-auto">
          <button onClick={() => onDateChange(new Date(selectedDate.getTime() - 86400000))} className="p-3 sm:p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="px-2 sm:px-4 font-bold text-xs sm:text-sm whitespace-nowrap">
            {selectedDate.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'long' })}
          </span>
          <button onClick={() => onDateChange(new Date(selectedDate.getTime() + 86400000))} className="p-3 sm:p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <section className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-2xl shadow-emerald-900/5 border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg sm:text-xl font-black flex items-center gap-3">
                <span className="w-2.5 h-6 bg-emerald-500 rounded-full"></span>
                Balanço Calórico
              </h2>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                  -{Math.round(totals.burned)} kcal treino
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-12">
              <div className="relative flex-shrink-0">
                <svg className="w-40 h-40 sm:w-48 sm:h-48 -rotate-90">
                  <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                  <circle 
                    cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="12" fill="transparent" 
                    strokeDasharray="264%" 
                    strokeDashoffset={`${264 * (1 - Math.min(1, netCalories / profile.goals.calories))}%`} 
                    className="text-emerald-500 transition-all duration-1000 ease-in-out" 
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl sm:text-4xl font-black leading-none ${remainingCalories < 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                    {Math.abs(Math.round(remainingCalories))}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 text-center max-w-[80px]">
                    {remainingCalories < 0 ? 'kcal excedidas' : 'kcal restantes'}
                  </span>
                </div>
              </div>

              <div className="w-full space-y-5 flex-1">
                {renderMacroProgress('Proteínas', totals.protein, profile.goals.protein, 'bg-emerald-500')}
                {renderMacroProgress('Carboidratos', totals.carbs, profile.goals.carbs, 'bg-blue-500')}
                {renderMacroProgress('Gorduras', totals.fat, profile.goals.fat, 'bg-amber-500')}
              </div>
            </div>
          </section>

          <MicronutrientsPanel 
            current={totals.micronutrients} 
            goals={profile.goals.micronutrients} 
          />

          <div className="space-y-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 transition-all hover:shadow-md group">
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      Treinos do Dia
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{Math.round(totals.burned)} kcal queimadas</p>
                  </div>
                  <button 
                    onClick={() => setIsAddingWorkout(true)}
                    className="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl hover:scale-110 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
                {(!log.workouts || log.workouts.length === 0) ? (
                  <button 
                    onClick={() => setIsAddingWorkout(true)}
                    className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
                  >
                    + Registrar Exercício
                  </button>
                ) : (
                  <div className="space-y-2">
                    {log.workouts.map(workout => (
                      <div key={workout.id} className="flex items-center justify-between p-4 bg-indigo-50/30 rounded-xl border border-transparent hover:border-indigo-100 transition-all">
                        <div className="flex-1">
                          <p className="font-black text-sm text-slate-800">{workout.name}</p>
                          <p className="text-[11px] font-bold text-slate-400 mt-0.5">{workout.durationMinutes} min • <span className="text-indigo-600">-{workout.caloriesBurned} kcal</span></p>
                        </div>
                        <button 
                          onClick={() => setConfirmDelete({ type: 'workout', id: workout.id })}
                          className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {log.meals.map(meal => (
              <div key={meal.name} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 transition-all hover:shadow-md group">
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">{meal.name}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{Math.round(meal.items.reduce((sum, i) => sum + i.calories, 0))} kcal consumidas</p>
                    </div>
                    <button 
                      onClick={() => setIsAddingFood(meal.name)}
                      className="w-10 h-10 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl hover:scale-110 active:scale-95 transition-all md:opacity-0 md:group-hover:opacity-100"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                  {meal.items.length === 0 ? (
                    <button 
                      onClick={() => setIsAddingFood(meal.name)}
                      className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
                    >
                      + Adicionar Alimento
                    </button>
                  ) : (
                    <div className="space-y-2">
                      {meal.items.map(food => (
                        <div key={food.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group/item border border-transparent hover:border-slate-200 transition-all">
                          <div className="flex-1">
                            <p className="font-black text-sm text-slate-800">{food.name}</p>
                            <p className="text-[11px] font-bold text-slate-400 mt-0.5">{food.servingSize} • {Math.round(food.calories)} kcal</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => setEditingFood({ mealName: meal.name, food })}
                              className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button 
                              onClick={() => setConfirmDelete({ type: 'food', mealName: meal.name, id: food.id })}
                              className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                              title="Excluir"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <WaterTracker 
            current={log.waterIntake} 
            goal={profile.goals.water} 
            onUpdate={handleUpdateWater}
            history={allLogs}
            reminders={profile.reminders || []}
            onUpdateProfile={onUpdateProfile}
          />
          
          <div className="hidden lg:block bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100/50">
            <h3 className="text-emerald-800 font-black text-sm uppercase tracking-widest mb-2">Dica Rápida</h3>
            <p className="text-emerald-600 text-sm font-medium leading-relaxed">
              O exercício regular aumenta sua sensibilidade à insulina, facilitando a queima de gordura e o controle dos carboidratos.
            </p>
          </div>
        </div>
      </div>

      {isAddingFood && (
        <AddFoodModal 
          mealName={isAddingFood} 
          onClose={() => setIsAddingFood(null)} 
          onAdd={handleAddFood} 
          profile={profile}
          onUpdateProfile={onUpdateProfile}
        />
      )}

      {isAddingWorkout && (
        <AddWorkoutModal 
          onClose={() => setIsAddingWorkout(false)}
          onAdd={handleAddWorkout}
        />
      )}

      {editingFood && (
        <EditFoodModal 
          mealName={editingFood.mealName}
          food={editingFood.food}
          onClose={() => setEditingFood(null)}
          onSave={handleEditFood}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Excluir Registro?</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (confirmDelete.type === 'food') removeFood(confirmDelete.mealName!, confirmDelete.id);
                  else removeWorkout(confirmDelete.id);
                }}
                className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold transition-all hover:bg-rose-600"
              >
                Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
