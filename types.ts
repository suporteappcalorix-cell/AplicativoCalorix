
export interface AuthUser {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
}

export type GoalType = 'lose' | 'maintain' | 'gain' | 'define' | 'condition' | 'reduce' | 'healthy';

export type FoodCategory = 'frutas' | 'legumes' | 'verduras' | 'grãos' | 'carnes' | 'laticínios' | 'industrializados' | 'bebidas' | 'outros';

export interface UserProfile {
  id?: string;
  name: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  weight: number;
  height: number;
  units: 'metric' | 'imperial';
  activityLevel: number;
  sportsPractice: boolean;
  sportType?: string;
  goal: GoalType;
  desiredWeight?: number;
  goalDeadline?: '30' | '60' | '90' | 'none';
  healthConditions?: string[];
  hasAllergies: boolean;
  allergies?: string[];
  dietStyle: string;
  eatingPreferences: string[];
  waterLevel: 'low' | 'medium' | 'high';
  alcoholLevel: 'never' | 'sometimes' | 'frequent';
  sleepHours: string;
  sleepQuality: 'poor' | 'medium' | 'good';
  disciplineLevel: 'low' | 'medium' | 'high';
  motivationType: string[];
  notificationPreference: 'all' | 'none' | 'important';
  localStorageConsent: boolean;
  autoPersonalization: boolean;
  goals: NutritionalGoals;
  mealCategories: MealCategory[];
  isPremium: boolean;
  hasCompletedTutorial: boolean;
  reminders?: Reminder[];
  customFoods?: Food[];
  social?: SocialProfile;
  achievements?: UserAchievements;
  customChallenges?: Challenge[];
  points: number;
  integrations?: IntegrationSettings;
  smartNotifications?: SmartNotificationSettings;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  sharedPostId?: string;
}

export interface Conversation {
  id: string;
  participants: string[]; // IDs dos usuários
  lastMessage?: string;
  lastTimestamp?: number;
  unreadCount: number;
}

export interface SmartNotificationSettings {
  enabled: boolean;
  frequency: 'high' | 'medium' | 'low';
  types: {
    water: boolean;
    calories: boolean;
    fasting: boolean;
    workouts: boolean;
  };
}

export interface IntegrationSettings {
  services: {
    id: string;
    connected: boolean;
    syncTypes: string[];
  }[];
  syncLogs: SyncLog[];
  lastAutoSync?: number;
}

export interface SyncLog {
  id: string;
  timestamp: number;
  serviceId: string;
  status: 'success' | 'failed';
  summary: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

export interface UserAchievements {
  medals: {
    gold: number;
    silver: number;
    bronze: number;
  };
  badges: string[];
  activeChallengeId?: string;
  completedChallenges: string[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'water' | 'calories' | 'workout' | 'fasting';
  targetValue: number;
  daysToComplete: number;
  isCustom?: boolean;
}

export interface SocialProfile {
  bio: string;
  following: string[];
  followers: string[];
  savedPosts: string[];
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
  timestamp: number;
  likes: string[];
  comments: PostComment[];
  reportedBy?: string[];
  type?: 'post' | 'recipe' | 'diet' | 'workout';
}

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: number;
  likes?: string[];
  replies?: PostComment[];
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'mention' | 'follow' | 'smart';
  fromId: string;
  fromName: string;
  fromAvatar: string;
  postId?: string;
  timestamp: number;
  read: boolean;
  message?: string;
}

export interface NutritionalGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  micronutrients: {
    fiber: number;
    sodium: number;
    potassium: number;
    calcium: number;
    iron: number;
    vitC: number;
  };
}

export interface MealCategory {
  id: string;
  name: string;
}

export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  timestamp: number;
  imageUrl?: string;
  micronutrients?: {
    fiber?: number;
    sodium?: number;
    potassium?: number;
    calcium?: number;
    iron?: number;
    vitC?: number;
  };
}

export interface Workout {
  id: string;
  name: string;
  caloriesBurned: number;
  durationMinutes: number;
  timestamp: number;
}

export interface Meal {
  name: string;
  items: Food[];
}

export interface DailyLog {
  meals: Meal[];
  waterIntake: number;
  workouts?: Workout[];
}

export interface FastingLog {
  id: string;
  startTime: number;
  endTime: number;
  targetDuration: number;
  completed: boolean;
}

export interface FastingState {
  isFasting: boolean;
  startTime: number | null;
  durationHours: number;
  endTime: number | null;
  completionNotified: boolean;
  history?: FastingLog[];
}

export interface Reminder {
  id: string;
  label: string;
  time: string;
  enabled: boolean;
}
