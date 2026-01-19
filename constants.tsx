
import React from 'react';
import { FoodCategory, Challenge, Badge } from './types';

export const POINT_VALUES = {
  LOG_MEAL: 10,
  DRINK_WATER: 2, // per glass
  COMPLETE_WORKOUT: 50,
  START_FASTING: 5,
  COMPLETE_FASTING: 20,
  DAILY_STREAK: 100,
};

export const BADGES: Badge[] = [
  { id: 'water_1', name: 'Hidratado I', description: 'Bebeu 2L de água em um dia.', icon: '💧' },
  { id: 'water_2', name: 'Mestre da Água', description: 'Bebeu 3L de água em um dia.', icon: '🌊' },
  { id: 'workout_1', name: 'Iniciante', description: 'Completou o primeiro treino.', icon: '💪' },
  { id: 'workout_2', name: 'Atleta', description: 'Queimou 500 kcal em um único treino.', icon: '🔥' },
  { id: 'consistency_1', name: 'Focado', description: 'Logou refeições por 3 dias seguidos.', icon: '📅' },
  { id: 'consistency_2', name: 'Indomável', description: 'Logou refeições por 7 dias seguidos.', icon: '🏆' },
];

export const INTEGRATION_SERVICES = [
  { id: 'google_fit', name: 'Google Fit', category: 'app', icon: '🏃‍♂️', color: 'bg-blue-500' },
  { id: 'apple_health', name: 'Apple Health', category: 'app', icon: '❤️', color: 'bg-rose-500' },
  { id: 'fitbit', name: 'Fitbit', category: 'app', icon: '💎', color: 'bg-teal-500' },
  { id: 'garmin', name: 'Garmin', category: 'app', icon: '🧭', color: 'bg-slate-800' },
  { id: 'samsung_health', name: 'Samsung Health', category: 'app', icon: '📱', color: 'bg-indigo-600' },
  { id: 'strava', name: 'Strava', category: 'app', icon: '🚴', color: 'bg-orange-600' },
  { id: 'xiaomi', name: 'Xiaomi / Mi Fit', category: 'wearable', icon: '⌚', color: 'bg-orange-500' },
  { id: 'amazfit', name: 'Amazfit / Zepp', category: 'wearable', icon: '⚡', color: 'bg-red-600' },
  { id: 'apple_watch', name: 'Apple Watch', category: 'wearable', icon: '🍏', color: 'bg-slate-900' },
];

export const SYNC_TYPES = [
  { id: 'steps', label: 'Passos', icon: '👣' },
  { id: 'heart', label: 'Batimentos', icon: '💓' },
  { id: 'sleep', label: 'Sono', icon: '💤' },
  { id: 'workout', label: 'Treinos', icon: '🏋️' },
  { id: 'calories', label: 'Queima Calórica', icon: '🔥' },
];

export const MEAL_CATEGORIES = [
  { id: '1', name: 'Café da Manhã' },
  { id: '2', name: 'Almoço' },
  { id: '3', name: 'Jantar' },
  { id: '4', name: 'Lanche' },
];

export const WEEKLY_CHALLENGES: Challenge[] = [
  {
    id: 'h2o_hero',
    title: 'Herói da Hidratação',
    description: 'Beba 2.5L de água por dia durante 7 dias.',
    icon: '💧',
    type: 'water',
    targetValue: 2500,
    daysToComplete: 7
  },
  {
    id: 'workout_warrior',
    title: 'Guerreiro do Treino',
    description: 'Queime pelo menos 300 kcal em exercícios por dia durante 5 dias.',
    icon: '🏋️',
    type: 'workout',
    targetValue: 300,
    daysToComplete: 5
  },
  {
    id: 'calorie_commander',
    title: 'Comandante Calórico',
    description: 'Mantenha-se dentro da sua meta calórica por 7 dias seguidos.',
    icon: '⚖️',
    type: 'calories',
    targetValue: 1, // Logic handled specially
    daysToComplete: 7
  },
  {
    id: 'fasting_fanatic',
    title: 'Fanático do Jejum',
    description: 'Complete 3 sessões de jejum de pelo menos 14h nesta semana.',
    icon: '⏳',
    type: 'fasting',
    targetValue: 14,
    daysToComplete: 3
  }
];

export const MICRONUTRIENT_METADATA = {
  vitC: { label: 'Vitamina C', unit: 'mg', icon: '🍋', description: 'Crucial para imunidade e saúde da pele.' },
  iron: { label: 'Ferro', unit: 'mg', icon: '🩸', description: 'Transporta oxigênio e evita anemia.' },
  calcium: { label: 'Cálcio', unit: 'mg', icon: '🦴', description: 'Mantém ossos e dentes fortes.' },
  potassium: { label: 'Potássio', unit: 'mg', icon: '🍌', description: 'Previne cãibras e regula a pressão.' },
  fiber: { label: 'Fibras', unit: 'g', icon: '🌾', description: 'Essencial para digestão e saciedade.' },
  sodium: { label: 'Sódio', unit: 'mg', icon: '🧂', description: 'Regula fluidos, mas deve ser moderado.' }
};

export const CATEGORY_LABELS: Record<FoodCategory, { label: string, icon: string }> = {
  frutas: { label: 'Frutas', icon: '🍎' },
  legumes: { label: 'Legumes', icon: '🥕' },
  verduras: { label: 'Verduras', icon: '🥬' },
  grãos: { label: 'Grãos', icon: '🍚' },
  carnes: { label: 'Carnes/Ovos', icon: '🥩' },
  laticínios: { label: 'Laticínios', icon: '🧀' },
  industrializados: { label: 'Industrializados', icon: '🥫' },
  bebidas: { label: 'Bebidas', icon: '🥤' },
  outros: { label: 'Outros', icon: '🍽️' }
};

export const COMMON_FOODS = [
  // Grãos e Cereais
  { name: 'Arroz Branco Cozido', category: 'grãos', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, servingSize: '100g', micronutrients: { fiber: 0.4, sodium: 1, vitC: 0, iron: 0.2, calcium: 10, potassium: 35 } },
  { name: 'Arroz Integral Cozido', category: 'grãos', calories: 124, protein: 2.6, carbs: 25.8, fat: 1, servingSize: '100g', micronutrients: { fiber: 2.7, sodium: 1, iron: 0.5, potassium: 50 } },
  { name: 'Feijão Carioca Cozido', category: 'grãos', calories: 76, protein: 4.8, carbs: 14, fat: 0.5, servingSize: '100g', micronutrients: { fiber: 8.5, potassium: 350, iron: 1.3, calcium: 27 } },
  { name: 'Feijão Preto Cozido', category: 'grãos', calories: 77, protein: 4.5, carbs: 14, fat: 0.5, servingSize: '100g', micronutrients: { fiber: 8.4, iron: 1.5, potassium: 355 } },
  { name: 'Cuscuz de Milho', category: 'grãos', calories: 112, protein: 2.3, carbs: 25, fat: 0.2, servingSize: '100g' },
  { name: 'Tapioca (Goma)', category: 'grãos', calories: 240, protein: 0, carbs: 60, fat: 0, servingSize: '100g' },
  { name: 'Macarrão Espaguete Cozido', category: 'grãos', calories: 158, protein: 5.8, carbs: 31, fat: 0.9, servingSize: '100g' },
  { name: 'Pão Francês', category: 'grãos', calories: 150, protein: 4.7, carbs: 29, fat: 1.5, servingSize: '1 unidade (50g)', micronutrients: { sodium: 320 } },
  { name: 'Pão de Forma Integral', category: 'grãos', calories: 60, protein: 2.5, carbs: 12, fat: 0.8, servingSize: '1 fatia (25g)', micronutrients: { fiber: 1.5 } },

  // Carnes, Ovos e Proteínas
  { name: 'Picanha Grelhada', category: 'carnes', calories: 238, protein: 25, carbs: 0, fat: 15, servingSize: '100g', micronutrients: { sodium: 54, iron: 2.5 } },
  { name: 'Patinho Moído Grelhado', category: 'carnes', calories: 219, protein: 35.9, carbs: 0, fat: 7.3, servingSize: '100g', micronutrients: { iron: 3, potassium: 300 } },
  { name: 'Peito de Frango Grelhado', category: 'carnes', calories: 159, protein: 32, carbs: 0, fat: 2.5, servingSize: '100g', micronutrients: { sodium: 74, potassium: 250 } },
  { name: 'Frango Sobrecoxa (Sem pele)', category: 'carnes', calories: 160, protein: 24, carbs: 0, fat: 7, servingSize: '100g' },
  { name: 'Ovo Cozido', category: 'carnes', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, servingSize: '1 unidade', micronutrients: { calcium: 25, iron: 0.6, sodium: 62 } },
  { name: 'Ovo Frito', category: 'carnes', calories: 155, protein: 13, carbs: 1.1, fat: 11, servingSize: '1 unidade' },
  { name: 'Filé de Tilápia Grelhado', category: 'carnes', calories: 128, protein: 26, carbs: 0, fat: 2.7, servingSize: '100g' },
  { name: 'Bife de Contrafilé Grelhado', category: 'carnes', calories: 194, protein: 29, carbs: 0, fat: 8, servingSize: '100g' },

  // Frutas
  { name: 'Banana Nanica', category: 'frutas', calories: 92, protein: 1.4, carbs: 24, fat: 0.1, servingSize: '1 unidade', micronutrients: { fiber: 2, potassium: 358, vitC: 8 } },
  { name: 'Banana Prata', category: 'frutas', calories: 89, protein: 1.3, carbs: 22.8, fat: 0.3, servingSize: '1 unidade', micronutrients: { potassium: 350, vitC: 7 } },
  { name: 'Mamão Papaya', category: 'frutas', calories: 40, protein: 0.5, carbs: 10, fat: 0.1, servingSize: '100g', micronutrients: { fiber: 1.8, vitC: 60, calcium: 20 } },
  { name: 'Açaí (Polpa Pura)', category: 'frutas', calories: 60, protein: 0.8, carbs: 6, fat: 4, servingSize: '100g', micronutrients: { iron: 1.5, calcium: 35 } },
  { name: 'Abacate', category: 'frutas', calories: 160, protein: 2, carbs: 9, fat: 15, servingSize: '100g', micronutrients: { fiber: 7, potassium: 485 } },
  { name: 'Maçã Fuji', category: 'frutas', calories: 56, protein: 0.3, carbs: 15, fat: 0.1, servingSize: '1 unidade', micronutrients: { fiber: 1.3, vitC: 4.6 } },
  { name: 'Melancia', category: 'frutas', calories: 33, protein: 0.9, carbs: 8.1, fat: 0, servingSize: '100g', micronutrients: { vitC: 8 } },
  { name: 'Abacaxi Pérola', category: 'frutas', calories: 48, protein: 0.9, carbs: 12.3, fat: 0.1, servingSize: '1 fatia (100g)', micronutrients: { vitC: 47 } },

  // Laticínios
  { name: 'Queijo Minas Frescal', category: 'laticínios', calories: 243, protein: 17, carbs: 3, fat: 18, servingSize: '100g', micronutrients: { sodium: 400, calcium: 579 } },
  { name: 'Queijo Mussarela', category: 'laticínios', calories: 330, protein: 22.6, carbs: 3, fat: 25.2, servingSize: '1 fatia (30g)', micronutrients: { calcium: 875 } },
  { name: 'Iogurte Natural Integral', category: 'laticínios', calories: 63, protein: 3.5, carbs: 5, fat: 3.3, servingSize: '100g', micronutrients: { calcium: 121, potassium: 155 } },
  { name: 'Requeijão Cremoso', category: 'laticínios', calories: 257, protein: 9.6, carbs: 3.5, fat: 23, servingSize: '1 colher (30g)', micronutrients: { calcium: 120 } },

  // Bebidas
  { name: 'Leite Integral', category: 'bebidas', calories: 60, protein: 3.2, carbs: 4.8, fat: 3.3, servingSize: '100ml', micronutrients: { calcium: 123, potassium: 150 } },
  { name: 'Leite Desnatado', category: 'bebidas', calories: 35, protein: 3.3, carbs: 5, fat: 0.1, servingSize: '100ml', micronutrients: { calcium: 125 } },
  { name: 'Suco de Laranja Natural', category: 'bebidas', calories: 45, protein: 0.7, carbs: 10.4, fat: 0.2, servingSize: '100ml', micronutrients: { vitC: 50, potassium: 200 } },
  { name: 'Suco de Uva Integral', category: 'bebidas', calories: 60, protein: 0, carbs: 14, fat: 0, servingSize: '100ml' },
  { name: 'Café Sem Açúcar', category: 'bebidas', calories: 2, protein: 0, carbs: 0, fat: 0, servingSize: '1 xícara' },
  { name: 'Refrigerante Cola', category: 'bebidas', calories: 42, protein: 0, carbs: 10.5, fat: 0, servingSize: '100ml' },
  { name: 'Cerveja Pilsen', category: 'bebidas', calories: 43, protein: 0.5, carbs: 3.5, fat: 0, servingSize: '100ml' },

  // Legumes e Verduras
  { name: 'Alface Crespa', category: 'verduras', calories: 11, protein: 1.3, carbs: 1.7, fat: 0.2, servingSize: '100g' },
  { name: 'Brócolis Cozido', category: 'legumes', calories: 25, protein: 2.1, carbs: 4.4, fat: 0.5, servingSize: '100g', micronutrients: { fiber: 3.3, vitC: 89, calcium: 47, potassium: 316 } },
  { name: 'Cenoura Cozida', category: 'legumes', calories: 35, protein: 0.8, carbs: 8, fat: 0.2, servingSize: '100g', micronutrients: { fiber: 2.2, potassium: 320, vitC: 6 } },
  { name: 'Tomate Italiano', category: 'legumes', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, servingSize: '100g', micronutrients: { vitC: 13, potassium: 237 } },
  { name: 'Batata Doce Cozida', category: 'legumes', calories: 77, protein: 0.6, carbs: 18.4, fat: 0.1, servingSize: '100g', micronutrients: { fiber: 2.2, potassium: 337, vitC: 12 } },
  { name: 'Mandioca Cozida', category: 'legumes', calories: 125, protein: 0.6, carbs: 30, fat: 0.3, servingSize: '100g' },

  // Industrializados e Outros
  { name: 'Hambúrguer Bovino', category: 'industrializados', calories: 250, protein: 14, carbs: 2, fat: 20, servingSize: '1 unidade (80g)' },
  { name: 'Pizza de Mussarela', category: 'industrializados', calories: 280, protein: 12, carbs: 30, fat: 12, servingSize: '1 fatia (100g)' },
  { name: 'Presunto Cozido', category: 'industrializados', calories: 94, protein: 14, carbs: 2, fat: 3, servingSize: '2 fatias (40g)', micronutrients: { sodium: 450 } },
  { name: 'Farofa de Mandioca Pronta', category: 'industrializados', calories: 400, protein: 2, carbs: 80, fat: 8, servingSize: '100g' }
];

export const APP_ICONS = {
  dashboard: (className?: string) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  community: (className?: string) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  recipes: (className?: string) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  reports: (className?: string) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  challenges: (className?: string) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  ranking: (className?: string) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  rewards: (className?: string) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  integrations: (className?: string) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  settings: (className?: string) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  profile: (className?: string) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
};
