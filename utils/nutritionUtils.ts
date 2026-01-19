
import { UserProfile, NutritionalGoals } from '../types';

export const calculateNutritionalGoals = (profile: UserProfile): NutritionalGoals => {
  // Mifflin-St Jeor Equation
  let bmr = 0;
  if (profile.sex === 'male') {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  } else {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  }

  // TDEE
  const tdee = bmr * (profile.activityLevel || 1.2);

  let targetCalories = tdee;
  if (profile.goal === 'lose') {
    targetCalories -= 500; // Standard 500kcal deficit
  } else if (profile.goal === 'gain') {
    targetCalories += 300; // Lean bulk
  }

  // Macronutrient split (Expert Recommendation for Weight Loss/Health)
  const protein = profile.weight * 2.0;
  const proteinCalories = protein * 4;

  const fatCalories = targetCalories * 0.25;
  const fat = fatCalories / 9;

  const carbsCalories = targetCalories - proteinCalories - fatCalories;
  const carbs = carbsCalories / 4;

  const water = profile.weight * 35;

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    water: Math.round(water),
    micronutrients: {
      fiber: 25,
      sodium: 2300,
      potassium: 3500,
      calcium: 1000,
      iron: profile.sex === 'female' && profile.age < 50 ? 18 : 8,
      vitC: profile.sex === 'male' ? 90 : 75
    }
  };
};

export const getActivityLevelLabel = (level: number): string => {
  if (level <= 1.2) return 'Sedentário';
  if (level <= 1.375) return 'Levemente Ativo';
  if (level <= 1.55) return 'Moderadamente Ativo';
  if (level <= 1.725) return 'Muito Ativo';
  return 'Extremamente Ativo';
};
