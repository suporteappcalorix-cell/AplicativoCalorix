
import React, { useState } from 'react';
import { UserProfile, GoalType } from '../types';
import { calculateNutritionalGoals } from '../utils/nutritionUtils';
import { MEAL_CATEGORIES } from '../constants';

interface OnboardingProps {
  onProfileCreate: (profile: UserProfile) => void;
  defaultName: string;
}

const Onboarding: React.FC<OnboardingProps> = ({ onProfileCreate, defaultName }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: defaultName,
    age: 25,
    sex: 'female',
    weight: 70,
    height: 170,
    units: 'metric',
    activityLevel: 1.375,
    sportsPractice: false,
    goal: 'lose',
    desiredWeight: 65,
    goalDeadline: '60',
    healthConditions: [],
    hasAllergies: false,
    allergies: [],
    dietStyle: 'Normal',
    eatingPreferences: [],
    waterLevel: 'medium',
    alcoholLevel: 'never',
    sleepHours: '7-8h',
    sleepQuality: 'medium',
    disciplineLevel: 'medium',
    motivationType: [],
    notificationPreference: 'important',
    localStorageConsent: true,
    autoPersonalization: true,
    isPremium: false,
    hasCompletedTutorial: true,
    mealCategories: MEAL_CATEGORIES
  });

  const TOTAL_STEPS = 25;

  const next = () => {
    if (step === 8 && !formData.sportsPractice) {
      setStep(10);
    } else if (step === 14 && !formData.hasAllergies) {
      setStep(16);
    } else if (step < TOTAL_STEPS) {
      setStep(s => s + 1);
    } else {
      finish();
    }
  };

  const prev = () => {
    if (step === 10 && !formData.sportsPractice) {
      setStep(8);
    } else if (step === 16 && !formData.hasAllergies) {
      setStep(14);
    } else if (step > 1) {
      setStep(s => s - 1);
    }
  };

  const finish = () => {
    const profile = formData as UserProfile;
    profile.goals = calculateNutritionalGoals(profile);
    onProfileCreate(profile);
  };

  const toggleMultiSelect = (field: keyof UserProfile, value: string) => {
    const current = (formData[field] as string[]) || [];
    if (current.includes(value)) {
      setFormData({ ...formData, [field]: current.filter(v => v !== value) });
    } else {
      setFormData({ ...formData, [field]: [...current, value] });
    }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  const OptionButton = ({ selected, onClick, label, sublabel }: any) => (
    <button
      onClick={onClick}
      className={`w-full p-5 rounded-2xl border transition-all text-left flex items-center justify-between group mb-3 ${
        selected 
          ? 'border-emerald-500 bg-emerald-50/50' 
          : 'border-slate-100 bg-white hover:border-slate-200'
      }`}
    >
      <div className="flex-1 pr-4">
        <p className={`font-semibold text-base ${selected ? 'text-emerald-700' : 'text-slate-700'}`}>{label}</p>
        {sublabel && <p className="text-xs text-slate-400 mt-1">{sublabel}</p>}
      </div>
      <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
        selected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200'
      }`}>
        {selected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
      </div>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased">
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 z-50">
        <div 
          className="h-full bg-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 pb-12">
        <div className="w-full max-w-lg">
          
          <div className="mb-6 text-center">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
              Etapa {step} de {TOTAL_STEPS}
            </span>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 sm:p-12 min-h-[520px] flex flex-col justify-between">
            
            <div className="flex-1">
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 leading-snug">Para começar, qual o <span className="text-emerald-500">seu nome</span>?</h2>
                  <input autoFocus className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-emerald-500 transition-all text-base font-medium" placeholder="Ex: Maria Silva" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 leading-snug">Qual a sua <span className="text-emerald-500">idade</span>?</h2>
                  <input type="number" autoFocus className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-emerald-500 transition-all text-base font-medium" value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 leading-snug">Como você se <span className="text-emerald-500">identifica</span>?</h2>
                  <div className="space-y-1">
                    <OptionButton label="Feminino" selected={formData.sex === 'female'} onClick={() => setFormData({...formData, sex: 'female'})} />
                    <OptionButton label="Masculino" selected={formData.sex === 'male'} onClick={() => setFormData({...formData, sex: 'male'})} />
                    <OptionButton label="Outro" selected={formData.sex === 'other'} onClick={() => setFormData({...formData, sex: 'other'})} />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 leading-snug">Qual o seu <span className="text-emerald-500">peso atual</span>?</h2>
                  <div className="relative">
                    <input type="number" autoFocus className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-emerald-500 transition-all text-base font-medium pr-16" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-300 uppercase">KG</span>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 leading-snug">Qual a sua <span className="text-emerald-500">altura</span>?</h2>
                  <div className="relative">
                    <input type="number" autoFocus className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-emerald-500 transition-all text-base font-medium pr-16" value={formData.height} onChange={e => setFormData({...formData, height: Number(e.target.value)})} />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-300 uppercase">CM</span>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 leading-snug">Prefere qual sistema de <span className="text-emerald-500">medida</span>?</h2>
                  <div className="space-y-1">
                    <OptionButton label="Métrico (kg, cm)" selected={formData.units === 'metric'} onClick={() => setFormData({...formData, units: 'metric'})} />
                    <OptionButton label="Imperial (lb, ft)" selected={formData.units === 'imperial'} onClick={() => setFormData({...formData, units: 'imperial'})} />
                  </div>
                </div>
              )}

              {step === 7 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 leading-snug">Qual seu nível de <span className="text-emerald-500">movimento</span> diário?</h2>
                  <div className="space-y-1">
                    <OptionButton label="Sedentário" sublabel="Passo a maior parte do tempo sentado." selected={formData.activityLevel === 1.2} onClick={() => setFormData({...formData, activityLevel: 1.2})} />
                    <OptionButton label="Atividade Leve" sublabel="Caminhadas leves 1-3x por semana." selected={formData.activityLevel === 1.375} onClick={() => setFormData({...formData, activityLevel: 1.375})} />
                    <OptionButton label="Moderado" sublabel="Exercícios moderados 3-5x por semana." selected={formData.activityLevel === 1.55} onClick={() => setFormData({...formData, activityLevel: 1.55})} />
                    <OptionButton label="Intenso" sublabel="Treinos pesados todos os dias." selected={formData.activityLevel === 1.725} onClick={() => setFormData({...formData, activityLevel: 1.725})} />
                  </div>
                </div>
              )}

              {step >= 8 && step < 25 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 leading-snug">
                    {step === 8 && <>Você pratica <span className="text-emerald-500">esportes</span>?</>}
                    {step === 9 && <>Qual <span className="text-emerald-500">esporte</span> você pratica?</>}
                    {step === 10 && <>Qual o seu principal <span className="text-emerald-500">objetivo</span>?</>}
                    {step === 11 && <>Qual seu <span className="text-emerald-500">peso ideal</span>?</>}
                    {step === 12 && <>Em quanto <span className="text-emerald-500">tempo</span> deseja atingir?</>}
                    {step === 13 && <>Possui alguma <span className="text-emerald-500">condição de saúde</span>?</>}
                    {step === 14 && <>Você tem <span className="text-emerald-500">alergias</span> alimentares?</>}
                    {step === 15 && <>Quais são as suas <span className="text-emerald-500">alergias</span>?</>}
                    {step === 16 && <>Qual seu <span className="text-emerald-500">estilo de dieta</span>?</>}
                    {step === 17 && <>Como é seu consumo de <span className="text-emerald-500">água</span>?</>}
                    {step === 18 && <>Como é seu consumo de <span className="text-emerald-500">álcool</span>?</>}
                    {step === 19 && <>Quantas horas você <span className="text-emerald-500">dorme</span>?</>}
                    {step === 20 && <>Como avalia a <span className="text-emerald-500">qualidade</span> do sono?</>}
                    {step === 21 && <>Como avalia sua <span className="text-emerald-500">disciplina</span>?</>}
                    {step === 22 && <>O que mais te <span className="text-emerald-500">motiva</span> hoje?</>}
                    {step === 23 && <>Deseja receber <span className="text-emerald-500">notificações</span>?</>}
                    {step === 24 && <>Aceita nossos <span className="text-emerald-500">termos</span>?</>}
                  </h2>

                  <div className="space-y-1">
                    {step === 8 && (
                      <>
                        <OptionButton label="Sim, regularmente" selected={formData.sportsPractice === true} onClick={() => setFormData({...formData, sportsPractice: true})} />
                        <OptionButton label="Não no momento" selected={formData.sportsPractice === false} onClick={() => setFormData({...formData, sportsPractice: false})} />
                      </>
                    )}
                    {step === 9 && (
                      <input autoFocus className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-emerald-500 transition-all text-base font-medium" placeholder="Ex: Musculação, Yoga..." value={formData.sportType} onChange={e => setFormData({...formData, sportType: e.target.value})} />
                    )}
                    {step === 10 && (
                      <>
                        <OptionButton label="Perder Peso" selected={formData.goal === 'lose'} onClick={() => setFormData({...formData, goal: 'lose'})} />
                        <OptionButton label="Ganhar Massa" selected={formData.goal === 'gain'} onClick={() => setFormData({...formData, goal: 'gain'})} />
                        <OptionButton label="Manter Saudável" selected={formData.goal === 'maintain'} onClick={() => setFormData({...formData, goal: 'maintain'})} />
                      </>
                    )}
                    {step === 11 && (
                      <div className="relative">
                        <input type="number" autoFocus className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-emerald-500 transition-all text-base font-medium pr-16" value={formData.desiredWeight} onChange={e => setFormData({...formData, desiredWeight: Number(e.target.value)})} />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-300 uppercase">KG</span>
                      </div>
                    )}
                    {step === 12 && (
                      <>
                        <OptionButton label="Em 30 dias" selected={formData.goalDeadline === '30'} onClick={() => setFormData({...formData, goalDeadline: '30'})} />
                        <OptionButton label="Em 60 dias" selected={formData.goalDeadline === '60'} onClick={() => setFormData({...formData, goalDeadline: '60'})} />
                        <OptionButton label="No meu ritmo" selected={formData.goalDeadline === 'none'} onClick={() => setFormData({...formData, goalDeadline: 'none'})} />
                      </>
                    )}
                    {step === 13 && (
                      <>
                        <OptionButton label="Hipertensão" selected={formData.healthConditions?.includes('Hipertensão')} onClick={() => toggleMultiSelect('healthConditions', 'Hipertensão')} />
                        <OptionButton label="Diabetes" selected={formData.healthConditions?.includes('Diabetes')} onClick={() => toggleMultiSelect('healthConditions', 'Diabetes')} />
                        <OptionButton label="Nenhuma condição" selected={formData.healthConditions?.length === 0} onClick={() => setFormData({...formData, healthConditions: []})} />
                      </>
                    )}
                    {step === 14 && (
                      <>
                        <OptionButton label="Sim, possuo alergias" selected={formData.hasAllergies === true} onClick={() => setFormData({...formData, hasAllergies: true})} />
                        <OptionButton label="Não, como de tudo" selected={formData.hasAllergies === false} onClick={() => setFormData({...formData, hasAllergies: false})} />
                      </>
                    )}
                    {step === 15 && (
                      <input autoFocus className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-emerald-500 transition-all text-base font-medium" placeholder="Ex: Glúten, Lactose, Amendoim..." value={formData.allergies?.join(', ')} onChange={e => setFormData({...formData, allergies: e.target.value.split(',').map(s => s.trim())})} />
                    )}
                    {step === 16 && (
                      <>
                        <OptionButton label="Normal / Flexível" selected={formData.dietStyle === 'Normal'} onClick={() => setFormData({...formData, dietStyle: 'Normal'})} />
                        <OptionButton label="Vegetariana / Vegana" selected={formData.dietStyle === 'Vegana'} onClick={() => setFormData({...formData, dietStyle: 'Vegana'})} />
                        <OptionButton label="Cetogênica / Low Carb" selected={formData.dietStyle === 'Keto'} onClick={() => setFormData({...formData, dietStyle: 'Keto'})} />
                      </>
                    )}
                    {step === 17 && (
                      <>
                        <OptionButton label="Bebo muito pouco" selected={formData.waterLevel === 'low'} onClick={() => setFormData({...formData, waterLevel: 'low'})} />
                        <OptionButton label="Quantidade moderada" selected={formData.waterLevel === 'medium'} onClick={() => setFormData({...formData, waterLevel: 'medium'})} />
                        <OptionButton label="Bebo bastante água" selected={formData.waterLevel === 'high'} onClick={() => setFormData({...formData, waterLevel: 'high'})} />
                      </>
                    )}
                    {step === 18 && (
                      <>
                        <OptionButton label="Nunca ou raramente" selected={formData.alcoholLevel === 'never'} onClick={() => setFormData({...formData, alcoholLevel: 'never'})} />
                        <OptionButton label="Ocasionalmente" selected={formData.alcoholLevel === 'sometimes'} onClick={() => setFormData({...formData, alcoholLevel: 'sometimes'})} />
                        <OptionButton label="Socialmente frequente" selected={formData.alcoholLevel === 'frequent'} onClick={() => setFormData({...formData, alcoholLevel: 'frequent'})} />
                      </>
                    )}
                    {step === 19 && (
                      <>
                        <OptionButton label="Menos de 6 horas" selected={formData.sleepHours === '<6h'} onClick={() => setFormData({...formData, sleepHours: '<6h'})} />
                        <OptionButton label="Entre 6 e 8 horas" selected={formData.sleepHours === '6-8h'} onClick={() => setFormData({...formData, sleepHours: '6-8h'})} />
                        <OptionButton label="Mais de 8 horas" selected={formData.sleepHours === '>8h'} onClick={() => setFormData({...formData, sleepHours: '>8h'})} />
                      </>
                    )}
                    {step === 20 && (
                      <>
                        <OptionButton label="Ruim (acordo cansado)" selected={formData.sleepQuality === 'poor'} onClick={() => setFormData({...formData, sleepQuality: 'poor'})} />
                        <OptionButton label="Média (regular)" selected={formData.sleepQuality === 'medium'} onClick={() => setFormData({...formData, sleepQuality: 'medium'})} />
                        <OptionButton label="Boa (acordo disposto)" selected={formData.sleepQuality === 'good'} onClick={() => setFormData({...formData, sleepQuality: 'good'})} />
                      </>
                    )}
                    {step === 21 && (
                      <>
                        <OptionButton label="Baixa (tenho dificuldade)" selected={formData.disciplineLevel === 'low'} onClick={() => setFormData({...formData, disciplineLevel: 'low'})} />
                        <OptionButton label="Média (sou constante)" selected={formData.disciplineLevel === 'medium'} onClick={() => setFormData({...formData, disciplineLevel: 'medium'})} />
                        <OptionButton label="Alta (sou muito focado)" selected={formData.disciplineLevel === 'high'} onClick={() => setFormData({...formData, disciplineLevel: 'high'})} />
                      </>
                    )}
                    {step === 22 && (
                      <>
                        <OptionButton label="Saúde e Longevidade" selected={formData.motivationType?.includes('Health')} onClick={() => toggleMultiSelect('motivationType', 'Health')} />
                        <OptionButton label="Estética e Autoestima" selected={formData.motivationType?.includes('Aesthetics')} onClick={() => toggleMultiSelect('motivationType', 'Aesthetics')} />
                        <OptionButton label="Performance Física" selected={formData.motivationType?.includes('Performance')} onClick={() => toggleMultiSelect('motivationType', 'Performance')} />
                      </>
                    )}
                    {step === 23 && (
                      <>
                        <OptionButton label="Todas as notificações" selected={formData.notificationPreference === 'all'} onClick={() => setFormData({...formData, notificationPreference: 'all'})} />
                        <OptionButton label="Apenas o essencial" selected={formData.notificationPreference === 'important'} onClick={() => setFormData({...formData, notificationPreference: 'important'})} />
                        <OptionButton label="Nenhuma por enquanto" selected={formData.notificationPreference === 'none'} onClick={() => setFormData({...formData, notificationPreference: 'none'})} />
                      </>
                    )}
                    {step === 24 && (
                      <div className="py-4">
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                          Para uma experiência personalizada, o Calorix salva seus dados localmente no seu dispositivo. Não compartilhamos suas informações com terceiros sem sua permissão.
                        </p>
                        <OptionButton label="Aceito os termos e privacidade" selected={formData.localStorageConsent === true} onClick={() => setFormData({...formData, localStorageConsent: true})} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 25 && (
                <div className="text-center py-8 space-y-6">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-snug">Sua estratégia está <span className="text-emerald-500">pronta</span>!</h2>
                  <p className="text-slate-500 text-base max-w-xs mx-auto">Analisamos seu perfil e criamos um plano nutricional exclusivo baseado em ciência.</p>
                </div>
              )}
            </div>

            <div className="mt-10 space-y-3">
              <button 
                onClick={next} 
                disabled={step === 1 && !formData.name}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-base shadow-lg shadow-emerald-500/10 transition-all active:scale-95"
              >
                {step === TOTAL_STEPS ? 'Finalizar e Ver Diário' : 'Continuar'}
              </button>
              {step > 1 && (
                <button 
                  onClick={prev} 
                  className="w-full py-3 text-slate-400 font-semibold text-sm hover:text-slate-600 transition-colors"
                >
                  Voltar para anterior
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
