
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { 
  UserProfile, DailyLog, Food, AuthUser, 
  FastingState, Notification 
} from './types';
import { MEAL_CATEGORIES, APP_ICONS, POINT_VALUES, BADGES } from './constants';
import { calculateNutritionalGoals } from './utils/nutritionUtils';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import FastingView from './components/FastingView';
import CalendarView from './components/CalendarView';
import GoalsSettings from './components/GoalsSettings';
import PerformanceChart from './components/PerformanceChart';
import CommunityView from './components/CommunityView';
import ChallengesView from './components/ChallengesView';
import RankingView from './components/RankingView';
import RewardsView from './components/RewardsView';
import IntegrationsView from './components/IntegrationsView';
import SettingsView from './components/SettingsView';
import ProfileView from './components/ProfileView';
import EditProfileView from './components/EditProfileView';

type View = 'dashboard' | 'calendar' | 'fasting' | 'community' | 'recipes' | 'reports' | 'challenges' | 'ranking' | 'rewards' | 'integrations' | 'settings' | 'profile' | 'editProfile';

const initialFastingState: FastingState = {
  isFasting: false,
  startTime: null,
  durationHours: 0,
  endTime: null,
  completionNotified: false,
  history: []
};

const App: React.FC = () => {
  const [authUser, setAuthUser] = useLocalStorage<AuthUser | null>('calorix_authUser', null);
  const userProfileKey = authUser ? `userProfile_${authUser.uid}` : null;
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>(userProfileKey, null);
  const dailyLogsKey = authUser ? `dailyLogs_${authUser.uid}` : null;
  const [dailyLogs, setDailyLogs] = useLocalStorage<Record<string, DailyLog>>(dailyLogsKey, {});
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [fastingState, setFastingState] = useLocalStorage<FastingState>(authUser ? `fasting_${authUser.uid}` : null, initialFastingState);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Internal notifications state
  const [smartAlert, setSmartAlert] = useState<string | null>(null);

  // Point Notification State
  const [pointsEarned, setPointsEarned] = useState<{ amount: number; label: string } | null>(null);

  const selectedDateString = selectedDate.toISOString().split('T')[0];

  const handleLogin = (user: AuthUser) => setAuthUser(user);
  const handleLogout = () => {
    setAuthUser(null);
    setCurrentView('dashboard');
  };

  const addPoints = useCallback((amount: number, label: string) => {
    if (userProfile) {
      setUserProfile(prev => prev ? ({
        ...prev,
        points: (prev.points || 0) + amount
      }) : null);
      setPointsEarned({ amount, label });
    }
  }, [userProfile, setUserProfile]);

  // Smart Notification Trigger Logic
  useEffect(() => {
    if (!userProfile || !userProfile.smartNotifications?.enabled) return;
    
    const settings = userProfile.smartNotifications;
    const log = dailyLogs[selectedDateString];
    if (!log) return;

    // 1. Water Intake Check
    if (settings.types.water) {
      const remaining = userProfile.goals.water - log.waterIntake;
      if (remaining > 0 && remaining <= 250) {
        setSmartAlert("Falta apenas 1 copo de água para bater sua meta! 💧");
      }
    }

    // 2. Calorie Check
    if (settings.types.calories) {
      const intake = log.meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.calories, 0), 0);
      const remaining = userProfile.goals.calories - intake;
      if (remaining > 0 && remaining <= 100 && intake > 0) {
        setSmartAlert(`Hoje você está a apenas ${Math.round(remaining)} kcal da sua meta! ⚖️`);
      }
    }

    // 3. Fasting Streak Check
    if (settings.types.fasting && fastingState.history) {
      const completedCount = fastingState.history.filter(h => h.completed).length;
      if (completedCount > 0 && completedCount % 3 === 0) {
        // Triggered only once per success
        const lastH = fastingState.history[0];
        const isRecent = Date.now() - lastH.endTime < 3600000; // within 1 hour
        if (isRecent && lastH.completed) {
           setSmartAlert(`Parabéns! Você completou ${completedCount} dias de jejum. ✨`);
        }
      }
    }
  }, [dailyLogs, userProfile, fastingState, selectedDateString]);

  // Check for Badges periodically or on profile updates
  useEffect(() => {
    if (!userProfile) return;
    
    const unlocked = userProfile.achievements?.badges || [];
    const newBadges: string[] = [];

    // Water badges
    const todayLog = dailyLogs[selectedDateString];
    if (todayLog) {
      if (todayLog.waterIntake >= 2000 && !unlocked.includes('water_1')) newBadges.push('water_1');
      if (todayLog.waterIntake >= 3000 && !unlocked.includes('water_2')) newBadges.push('water_2');
      
      // Workout badges
      if (todayLog.workouts && todayLog.workouts.length > 0 && !unlocked.includes('workout_1')) newBadges.push('workout_1');
      if (todayLog.workouts?.some(w => w.caloriesBurned >= 500) && !unlocked.includes('workout_2')) newBadges.push('workout_2');
    }

    if (newBadges.length > 0) {
      handleUpdateProfile({
        achievements: {
          ...userProfile.achievements!,
          badges: [...unlocked, ...newBadges]
        }
      });
    }
  }, [userProfile, dailyLogs, selectedDateString]);

  // Clear notifications
  useEffect(() => {
    if (pointsEarned) {
      const timer = setTimeout(() => setPointsEarned(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [pointsEarned]);

  useEffect(() => {
    if (smartAlert) {
      const timer = setTimeout(() => setSmartAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [smartAlert]);

  const handleProfileCreate = (profile: UserProfile) => {
    const newProfile = { ...profile };
    if (!newProfile.social) {
      newProfile.social = { bio: 'Iniciando minha jornada!', followers: [], following: [], savedPosts: [] };
    }
    if (!newProfile.achievements) {
      newProfile.achievements = { medals: { gold: 0, silver: 0, bronze: 0 }, badges: [], completedChallenges: [] };
    }
    if (newProfile.points === undefined) newProfile.points = 0;
    if (!newProfile.smartNotifications) {
      newProfile.smartNotifications = { enabled: true, frequency: 'medium', types: { water: true, calories: true, fasting: true, workouts: true } };
    }
    
    setUserProfile(newProfile);
  };
  
  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, ...updates });
    }
  };
  
  const handleAvatarUpdate = (newAvatar: string) => {
    if (authUser) {
      setAuthUser(prev => prev ? ({ ...prev, avatar: newAvatar }) : null);
    }
  };

  const handleProfileSave = (updates: Partial<UserProfile>) => {
    if (userProfile) {
      const updatedFullProfile = { ...userProfile, ...updates };
      // Recalculate goals as core data might have changed
      const newGoals = calculateNutritionalGoals(updatedFullProfile);
      setUserProfile({ ...updatedFullProfile, goals: newGoals });
    }
    setCurrentView('profile');
  };

  const currentLog = useMemo(() => {
    return dailyLogs[selectedDateString] || { meals: MEAL_CATEGORIES.map(c => ({ name: c.name, items: [] })), waterIntake: 0 };
  }, [dailyLogs, selectedDateString]);

  const updateLog = useCallback((newLog: DailyLog) => {
    const prevLog = dailyLogs[selectedDateString];
    setDailyLogs(prev => ({ ...prev, [selectedDateString]: newLog }));
    
    if (prevLog) {
      const prevMeals = prevLog.meals.reduce((s, m) => s + m.items.length, 0);
      const newMeals = newLog.meals.reduce((s, m) => s + m.items.length, 0);
      if (newMeals > prevMeals) addPoints(POINT_VALUES.LOG_MEAL, 'Refeição Logada');

      if (newLog.waterIntake > prevLog.waterIntake) {
        const diff = newLog.waterIntake - prevLog.waterIntake;
        const glasses = Math.floor(diff / 250);
        if (glasses > 0) addPoints(POINT_VALUES.DRINK_WATER * glasses, 'Hidratação');
      }

      const prevWorkouts = prevLog.workouts?.length || 0;
      const newWorkouts = newLog.workouts?.length || 0;
      if (newWorkouts > prevWorkouts) addPoints(POINT_VALUES.COMPLETE_WORKOUT, 'Treino Concluído');
    }
  }, [selectedDateString, dailyLogs, setDailyLogs, addPoints]);

  const viewLabels: Record<View, string> = {
    dashboard: 'Diário',
    calendar: 'Histórico',
    fasting: 'Jejum',
    community: 'Social',
    recipes: 'Pratos',
    reports: 'Metas',
    challenges: 'Desafios',
    ranking: 'Ranking',
    rewards: 'Conquistas',
    integrations: 'Conexões',
    settings: 'Ajustes',
    profile: 'Meu Perfil',
    editProfile: 'Editar Perfil'
  };

  const menuIcons = {
    ...APP_ICONS,
    calendar: (className?: string) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    fasting: (className?: string) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  if (!authUser) return <Auth onLogin={handleLogin} />;
  if (!userProfile) return <Onboarding onProfileCreate={handleProfileCreate} defaultName={authUser.name} />;

  return (
    <>
      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/40 animate-in fade-in-20"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Sidebar Panel */}
          <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 p-6 flex flex-col animate-in slide-in-from-left-40 duration-300">
              <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">C</div>
                <h1 className="text-2xl font-bold tracking-tight text-emerald-600">Calorix</h1>
              </div>
              
              <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
                {(['dashboard', 'community', 'ranking', 'challenges', 'rewards', 'integrations', 'fasting', 'calendar', 'reports', 'profile', 'settings'] as View[]).map(view => (
                  <button
                    key={view}
                    onClick={() => {
                      setCurrentView(view);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === view ? 'bg-emerald-50 text-emerald-600 font-semibold shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    {menuIcons[view as keyof typeof menuIcons](`w-5 h-5 ${currentView === view ? 'text-emerald-600' : 'text-slate-400'}`)}
                    <span className="text-sm">{viewLabels[view]}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-auto space-y-4 pt-4 border-t border-slate-100">
                <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xl shadow-slate-900/10">
                  <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Seus Pontos</p>
                  <p className="text-xl font-black text-emerald-400">{(userProfile.points || 0).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  <span className="text-sm font-bold">Sair</span>
                </button>
              </div>
          </aside>
        </div>
      )}

      <div className="min-h-screen bg-slate-50 text-slate-900 lg:pl-64 transition-colors duration-200">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex items-center justify-between h-20">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2">
                <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{viewLabels[currentView]}</h2>
            <button onClick={() => setCurrentView('profile')} className="w-10 h-10">
                <img src={authUser.avatar} alt="User Avatar" className="w-full h-full rounded-full" />
            </button>
        </header>

        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 glass-morphism border-r border-slate-200 p-6 overflow-hidden">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">C</div>
            <h1 className="text-2xl font-bold tracking-tight text-emerald-600">Calorix</h1>
          </div>
          
          <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
            {(['dashboard', 'community', 'ranking', 'challenges', 'rewards', 'integrations', 'fasting', 'calendar', 'reports', 'profile', 'settings'] as View[]).map(view => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === view ? 'bg-emerald-50 text-emerald-600 font-semibold shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                {menuIcons[view as keyof typeof menuIcons](`w-5 h-5 ${currentView === view ? 'text-emerald-600' : 'text-slate-400'}`)}
                <span className="text-sm">{viewLabels[view]}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-4 pt-4 border-t border-slate-100">
            <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xl shadow-slate-900/10">
              <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Seus Pontos</p>
              <p className="text-xl font-black text-emerald-400">{(userProfile.points || 0).toLocaleString()}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span className="text-sm font-bold">Sair</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="p-4 sm:p-8 max-w-5xl mx-auto min-h-screen">
          {currentView === 'dashboard' && (
            <Dashboard 
              profile={userProfile} 
              log={currentLog} 
              onUpdateLog={updateLog}
              fasting={fastingState}
              onUpdateFasting={setFastingState}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              allLogs={dailyLogs}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
          {currentView === 'calendar' && (
            <CalendarView 
              logs={dailyLogs} 
              fastingHistory={fastingState.history || []}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setCurrentView('dashboard');
              }}
            />
          )}
          {currentView === 'fasting' && (
            <FastingView state={fastingState} onUpdate={setFastingState} />
          )}
          {currentView === 'community' && (
            <CommunityView 
              user={authUser}
              profile={userProfile}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
          {currentView === 'challenges' && (
            <ChallengesView 
              profile={userProfile}
              logs={dailyLogs}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
          {currentView === 'ranking' && (
            <RankingView profile={userProfile} />
          )}
          {currentView === 'rewards' && (
            <RewardsView profile={userProfile} />
          )}
          {currentView === 'integrations' && (
            <IntegrationsView profile={userProfile} onUpdateProfile={handleUpdateProfile} />
          )}
          {currentView === 'settings' && (
            <SettingsView profile={userProfile} onUpdateProfile={handleUpdateProfile} />
          )}
          {currentView === 'profile' && (
            <ProfileView 
              user={authUser}
              profile={userProfile} 
              onUpdateProfile={handleUpdateProfile}
              onNavigate={setCurrentView}
              onUpdateAvatar={handleAvatarUpdate}
            />
          )}
          {currentView === 'editProfile' && (
            <EditProfileView
              user={authUser}
              profile={userProfile}
              onUpdateProfile={handleProfileSave}
              onCancel={() => setCurrentView('profile')}
              onUpdateAvatar={handleAvatarUpdate}
            />
          )}
          {currentView === 'recipes' && <div className="p-12 text-center text-slate-500 font-medium">Receitas personalizadas em breve...</div>}
          {currentView === 'reports' && (
            <div className="space-y-12">
              <GoalsSettings 
                profile={userProfile} 
                onUpdateProfile={handleUpdateProfile} 
              />
              <PerformanceChart 
                logs={dailyLogs}
                profile={userProfile}
              />
            </div>
          )}
        </main>

        {/* Smart Helper Notification */}
        {smartAlert && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[400] bg-slate-900 text-white px-6 py-4 rounded-[2rem] shadow-2xl animate-in slide-in-from-top-20 duration-500 flex items-center gap-4 max-w-[90vw] border border-white/10 backdrop-blur-md">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-lg flex-shrink-0">
               ⚡
            </div>
            <div>
              <p className="text-xs font-bold leading-relaxed">{smartAlert}</p>
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest mt-1 block">Alerta do Coach Leo</span>
            </div>
            <button onClick={() => setSmartAlert(null)} className="p-2 text-slate-500 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {/* Point Earned Notification */}
        {pointsEarned && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl animate-in slide-in-from-top-10 duration-500 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-black">
              +{pointsEarned.amount}
            </div>
            <span className="text-xs font-black uppercase tracking-widest">{pointsEarned.label}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default App;
