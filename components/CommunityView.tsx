
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UserProfile, AuthUser, Post, PostComment, Notification } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import CommunityProfileModal from './CommunityProfileModal';

interface CommunityViewProps {
  user: AuthUser;
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

const CommunityIcons = {
  like: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>,
  comment: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
  share: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>,
  more: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>,
  save: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>,
  photo: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>,
  video: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>,
  recipe: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  workout: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" /><path d="M20.59 10.15A9 9 0 1 0 12 21" /></svg>,
  feed: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>,
  explore: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>,
  guidelines: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
};

type CommunityViewType = 'all' | 'following' | 'saved';
type PostType = 'post' | 'recipe' | 'workout';
type PostFilterType = 'all' | 'post' | 'recipe' | 'diet' | 'workout';

const FILTER_CATEGORIES: { id: PostFilterType, label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'post', label: 'Postagens' },
  { id: 'recipe', label: 'Receitas' },
  { id: 'diet', label: 'Dietas' },
  { id: 'workout', label: 'Treinos' },
];

const CommunityView: React.FC<CommunityViewProps> = ({ user, profile, onUpdateProfile }) => {
  const [postContent, setPostContent] = useState('');
  const [postMedia, setPostMedia] = useState<{ type: 'image' | 'video'; url: string } | null>(null);
  const [postType, setPostType] = useState<PostType>('post');
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [communityView, setCommunityView] = useState<CommunityViewType>('all');
  const [activeFilter, setActiveFilter] = useState<PostFilterType>('all');
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [posts, setPosts] = useLocalStorage<Post[]>('calorix_posts', []);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('calorix_notifications', []);

  // Mock user data for profile viewing
  const suggestedUsersData: UserProfile[] = useMemo(() => [
    { id: 'user-2', name: 'Ana Silva', avatar: 'https://picsum.photos/seed/ana/100/100', social: { bio: 'Focada em nutrição e bem-estar. Adoro cozinhar pratos saudáveis!', followers: ['user-3', user.uid], following: ['user-3'], savedPosts: [] } } as UserProfile,
    { id: 'user-3', name: 'Marcos Trainer', avatar: 'https://picsum.photos/seed/marcos/100/100', social: { bio: 'Personal trainer. Ajudando você a atingir seus objetivos.', followers: [], following: ['user-2', user.uid], savedPosts: [] } } as UserProfile,
    { id: 'user-4', name: 'Julia Fit', avatar: 'https://picsum.photos/seed/julia/100/100', social: { bio: 'Apaixonada por corrida e ioga.', followers: [user.uid], following: [], savedPosts: [] } } as UserProfile,
  ], [user.uid]);

  const allUsers = useMemo(() => {
    const userList = [...suggestedUsersData, { ...profile, id: user.uid, avatar: user.avatar! }];
    return userList;
  }, [profile, user.uid, user.avatar, suggestedUsersData]);

  const handleViewProfile = (userId: string) => {
    const userToView = allUsers.find(u => u.id === userId);
    if (userToView) {
      setViewingProfile(userToView);
    }
  };

  useEffect(() => {
    if (posts.length === 0) {
      setPosts([
        { id: 'sample1', authorId: 'user-2', authorName: 'Ana Silva', authorAvatar: 'https://picsum.photos/seed/ana/100/100', content: 'Acabei de fazer uma Salada Caesar com frango grelhado! Leve, saudável e delicioso. Perfeito para o pós-treino.', timestamp: Date.now() - 3e5, likes: ['user-3'], comments: [], type: 'recipe', media: { type: 'image', url: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=800' } },
        { id: 'sample2', authorId: 'user-3', authorName: 'Marcos Trainer', authorAvatar: 'https://picsum.photos/seed/marcos/100/100', content: 'Treino de pernas hoje foi intenso! Foco em agachamento livre e leg press. Sentindo que valeu a pena!', timestamp: Date.now() - 1.8e6, likes: [user.uid, 'user-2'], comments: [], type: 'workout' },
        { id: 'sample3', authorId: 'user-4', authorName: 'Julia Fit', authorAvatar: 'https://picsum.photos/seed/julia/100/100', content: 'Comecei uma dieta com foco em proteínas e baixo carboidrato essa semana. Alguém tem dicas de lanches práticos?', timestamp: Date.now() - 7.2e6, likes: [], comments: [], type: 'diet' },
        { id: 'sample4', authorId: user.uid, authorName: profile.name, authorAvatar: user.avatar || '', content: 'Animado(a) para começar a semana com o pé direito! Meta de beber 3L de água hoje.', timestamp: Date.now() - 1.8e7, likes: ['user-4'], comments: [], type: 'post' }
      ]);
    }
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const type = file.type.startsWith('image/') ? 'image' : 'video';
        setPostMedia({ type, url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = (type: 'image' | 'video') => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = `${type}/*`;
      fileInputRef.current.click();
    }
  };

  const filteredPosts = useMemo(() => {
    let basePosts = [...posts];
    const following = profile.social?.following || [];
    const saved = profile.social?.savedPosts || [];

    if (communityView === 'following') {
      basePosts = posts.filter(p => following.includes(p.authorId) || p.authorId === user.uid);
    } else if (communityView === 'saved') {
      basePosts = posts.filter(p => saved.includes(p.id));
    }
    
    if (activeFilter !== 'all') {
      basePosts = basePosts.filter(p => (p.type || 'post') === activeFilter);
    }
    
    if (sortBy === 'popular') {
      return basePosts.sort((a, b) => (b.likes.length + b.comments.length * 2) - (a.likes.length + a.comments.length * 2));
    }
    return basePosts.sort((a, b) => b.timestamp - a.timestamp);
  }, [posts, sortBy, communityView, activeFilter, profile.social, user.uid]);

  const handleCreatePost = () => {
    if (!postContent.trim() && !postMedia) return;
    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      authorId: user.uid,
      authorName: profile.name,
      authorAvatar: user.avatar || '',
      content: postContent,
      timestamp: Date.now(),
      likes: [],
      comments: [],
      type: postType,
      ...(postMedia && { media: postMedia })
    };
    setPosts([newPost, ...posts]);
    setPostContent('');
    setPostMedia(null);
    setPostType('post');
  };

  const toggleLike = (postId: string) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const hasLiked = p.likes.includes(user.uid);
        return { ...p, likes: hasLiked ? p.likes.filter(id => id !== user.uid) : [...p.likes, user.uid] };
      }
      return p;
    }));
  };
  
  const handleSavePost = (postId: string) => {
     const saved = profile.social?.savedPosts || [];
     const isSaved = saved.includes(postId);
     const newSaved = isSaved ? saved.filter(id => id !== postId) : [...saved, postId];
     onUpdateProfile({ 
       social: { ...(profile.social || { bio: '', followers: [], following: [], savedPosts: [] }), savedPosts: newSaved } 
     });
     setActiveDropdown(null);
  };
  
  const handleReportPost = (postId: string) => {
    alert("Obrigado. Nossa equipe revisará este post.");
    setActiveDropdown(null);
  }

  const handleCreateComment = (postId: string) => {
    if (!commentText.trim()) return;
    const newComment: PostComment = {
      id: Math.random().toString(36).substr(2, 9),
      authorId: user.uid,
      authorName: profile.name,
      authorAvatar: user.avatar || '',
      text: commentText,
      timestamp: Date.now(),
      replies: []
    };
    setPosts(posts.map(p => p.id === postId ? { ...p, comments: [newComment, ...(p.comments || [])] } : p));
    setCommentText('');
    setCommentingOn(postId);
  };
  
  const handleToggleFollow = (authorId: string) => {
    const following = profile.social?.following || [];
    const isFollowing = following.includes(authorId);
    const newFollowing = isFollowing ? following.filter(id => id !== authorId) : [...following, authorId];
    onUpdateProfile({
      social: { ...(profile.social || { bio: '', followers: [], following: [], savedPosts: [] }), following: newFollowing }
    });
  };

  const suggestedUsers = suggestedUsersData.filter(u => u.id !== user.uid && !profile.social?.following.includes(u.id!));

  const postPlaceholders: Record<PostType, string> = {
    post: `Qual a sua vitória de hoje, ${profile.name}?`,
    recipe: 'Compartilhe sua receita... Ingredientes, modo de preparo, etc.',
    workout: 'Descreva seu treino... Exercícios, séries, repetições.',
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />

      {/* Mobile community nav */}
      <nav className="lg:hidden col-span-12 bg-white rounded-2xl p-2 border border-slate-100 shadow-sm flex gap-1">
        <button onClick={() => setCommunityView('all')} className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 sm:px-2 py-2 rounded-xl text-xs font-bold ${communityView === 'all' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500'}`}>
            <CommunityIcons.explore className="w-5 h-5" />
            <span>Explorar</span>
        </button>
        <button onClick={() => setCommunityView('following')} className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 sm:px-2 py-2 rounded-xl text-xs font-bold ${communityView === 'following' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500'}`}>
            <CommunityIcons.feed className="w-5 h-5" />
            <span>Meu Feed</span>
        </button>
        <button onClick={() => setCommunityView('saved')} className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 sm:px-2 py-2 rounded-xl text-xs font-bold ${communityView === 'saved' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500'}`}>
            <CommunityIcons.save className="w-5 h-5" />
            <span>Salvos</span>
        </button>
        <button onClick={() => setShowGuidelines(true)} className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 sm:px-2 py-2 rounded-xl text-xs font-bold text-slate-500">
            <CommunityIcons.guidelines className="w-5 h-5" />
            <span>Diretrizes</span>
        </button>
      </nav>

      {/* Left Sidebar */}
      <aside className="hidden lg:block lg:col-span-3 sticky top-8">
         <nav className="bg-white rounded-[2rem] p-3 border border-slate-100 shadow-sm space-y-1">
            <button onClick={() => setCommunityView('all')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold ${communityView === 'all' ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-slate-50 text-slate-500'}`}>
              <CommunityIcons.explore className="w-5 h-5" /> Explorar
            </button>
            <button onClick={() => setCommunityView('following')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold ${communityView === 'following' ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-slate-50 text-slate-500'}`}>
              <CommunityIcons.feed className="w-5 h-5" /> Meu Feed
            </button>
            <button onClick={() => setCommunityView('saved')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold ${communityView === 'saved' ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-slate-50 text-slate-500'}`}>
              <CommunityIcons.save className="w-5 h-5" /> Salvos
            </button>
            <button onClick={() => setShowGuidelines(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-500 font-bold">
              <CommunityIcons.guidelines className="w-5 h-5" /> Diretrizes
            </button>
         </nav>
      </aside>

      {/* Center Column */}
      <main className="col-span-12 lg:col-span-6 space-y-6">
        {/* Create Post */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex gap-3 pb-4 mb-3">
            <img src={user.avatar} className="w-10 h-10 rounded-full" alt="My avatar"/>
            <textarea 
              className="flex-1 bg-transparent text-lg placeholder:text-slate-400 outline-none resize-none"
              placeholder={postPlaceholders[postType]}
              rows={3}
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
            />
          </div>
          {postMedia && (
            <div className="relative mb-3 group">
              {postMedia.type === 'image' ? (
                <img src={postMedia.url} className="rounded-lg max-h-60 w-auto" />
              ) : (
                <video src={postMedia.url} controls className="rounded-lg max-h-60 w-auto" />
              )}
              <button onClick={() => setPostMedia(null)} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
             <div className="flex flex-wrap gap-1">
                <button onClick={() => triggerFileInput('image')} className="flex items-center gap-2 p-2 rounded-lg text-emerald-500 hover:bg-emerald-50 font-bold text-sm"><CommunityIcons.photo className="w-5 h-5"/> Foto</button>
                <button onClick={() => triggerFileInput('video')} className="flex items-center gap-2 p-2 rounded-lg text-indigo-500 hover:bg-indigo-50 font-bold text-sm"><CommunityIcons.video className="w-5 h-5"/> Vídeo</button>
                <button onClick={() => setPostType('recipe')} className={`flex items-center gap-2 p-2 rounded-lg font-bold text-sm ${postType === 'recipe' ? 'bg-orange-50 text-orange-500' : 'text-slate-500 hover:bg-slate-50'}`}><CommunityIcons.recipe className="w-5 h-5"/> Receita</button>
                <button onClick={() => setPostType('workout')} className={`flex items-center gap-2 p-2 rounded-lg font-bold text-sm ${postType === 'workout' ? 'bg-rose-50 text-rose-500' : 'text-slate-500 hover:bg-slate-50'}`}><CommunityIcons.workout className="w-5 h-5"/> Treino</button>
             </div>
             <button onClick={handleCreatePost} disabled={!postContent.trim() && !postMedia} className="w-full sm:w-auto sm:shrink-0 px-6 py-2.5 bg-emerald-500 text-white rounded-lg font-bold text-sm disabled:opacity-40 transition-all shadow-lg shadow-emerald-500/10">Publicar</button>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-2 space-y-2">
          <div className="flex gap-2 p-1 bg-slate-50 rounded-lg">
            {FILTER_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveFilter(cat.id)} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${activeFilter === cat.id ? 'bg-emerald-500 text-white shadow' : 'text-slate-500 hover:bg-slate-200'}`}>{cat.label}</button>
            ))}
          </div>
          <div className="flex gap-2 p-1 bg-slate-50 rounded-lg">
             <button onClick={() => setSortBy('recent')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${sortBy === 'recent' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>Mais Recentes</button>
             <button onClick={() => setSortBy('popular')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${sortBy === 'popular' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>Populares</button>
          </div>
        </div>

        {/* Posts */}
        {filteredPosts.map(post => {
          const isFollowing = (profile.social?.following || []).includes(post.authorId);
          return (
            <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleViewProfile(post.authorId)} className="shrink-0">
                       <img src={post.authorAvatar} className="w-11 h-11 rounded-full" alt={post.authorName}/>
                    </button>
                    <div>
                       <div className="flex items-center gap-2">
                          <button onClick={() => handleViewProfile(post.authorId)} className="font-bold text-slate-800 hover:underline">{post.authorName}</button>
                          {post.authorId !== user.uid && (
                            <button onClick={() => handleToggleFollow(post.authorId)} className={`text-xs font-bold ${isFollowing ? 'text-slate-400' : 'text-emerald-500'}`}>
                              • {isFollowing ? 'Seguindo' : 'Seguir'}
                            </button>
                          )}
                       </div>
                       <p className="text-xs text-slate-400">{new Date(post.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="relative">
                     <button onClick={() => setActiveDropdown(activeDropdown === post.id ? null : post.id)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><CommunityIcons.more className="w-5 h-5" /></button>
                     {activeDropdown === post.id && (
                       <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-10 p-2 text-sm font-medium">
                          <button onClick={() => handleSavePost(post.id)} className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg">{(profile.social?.savedPosts || []).includes(post.id) ? 'Remover dos Salvos' : 'Salvar Post'}</button>
                          <button onClick={() => handleReportPost(post.id)} className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-rose-500">Denunciar</button>
                       </div>
                     )}
                  </div>
                </div>

                <p className="text-slate-700 mb-4 whitespace-pre-wrap">{post.content}</p>

                {post.media && (
                  <div className="mb-4">
                    {post.media.type === 'image' ? (
                      <img src={post.media.url} className="rounded-lg border border-slate-100 w-full max-h-[500px] object-cover" />
                    ) : (
                      <video src={post.media.url} controls className="rounded-lg border border-slate-100 w-full" />
                    )}
                  </div>
                )}
                
                <div className="flex justify-between text-sm text-slate-500 mb-2">
                   <span>{post.likes.length} curtidas</span>
                   <span>{post.comments.length} comentários</span>
                </div>
              </div>
              
              <div className="border-t border-slate-100 grid grid-cols-3">
                 <button onClick={() => toggleLike(post.id)} className={`flex items-center justify-center gap-2 py-3 font-bold transition-colors ${post.likes.includes(user.uid) ? 'text-emerald-500' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <CommunityIcons.like className={`w-5 h-5 ${post.likes.includes(user.uid) ? 'fill-emerald-500' : ''}`}/> Curtir
                 </button>
                 <button onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)} className="flex items-center justify-center gap-2 py-3 font-bold text-slate-500 hover:bg-slate-50 transition-colors border-l border-r border-slate-100">
                    <CommunityIcons.comment className="w-5 h-5"/> Comentar
                 </button>
                 <button className="flex items-center justify-center gap-2 py-3 font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                    <CommunityIcons.share className="w-5 h-5"/> Compartilhar
                 </button>
              </div>

              {commentingOn === post.id && (
                <div className="p-5 border-t border-slate-100 space-y-4">
                   <div className="flex gap-3">
                      <img src={user.avatar} className="w-9 h-9 rounded-full" />
                      <input 
                        autoFocus
                        className="flex-1 bg-slate-100 rounded-full px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                        placeholder="Escreva um comentário..."
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCreateComment(post.id)}
                      />
                   </div>
                   {post.comments.map(comment => (
                      <div key={comment.id} className="flex gap-3">
                         <img src={comment.authorAvatar} className="w-9 h-9 rounded-full" />
                         <div className="flex-1">
                            <div className="bg-slate-100 rounded-xl p-3 text-sm">
                               <span className="font-bold block text-slate-800">{comment.authorName}</span>
                               {comment.text}
                            </div>
                            <div className="flex gap-3 text-xs font-bold text-slate-500 px-3 pt-1">
                               <button>Curtir</button>
                               <button>Responder</button>
                               <span>{new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
              )}
            </article>
          )
        })}
      </main>

      {/* Right Sidebar */}
      <aside className="hidden lg:block lg:col-span-3 sticky top-8 space-y-6">
        <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 text-sm">Sugestões para você</h3>
          <div className="space-y-4">
            {suggestedUsers.map(sUser => (
              <div key={sUser.id} className="flex items-center justify-between">
                <button onClick={() => handleViewProfile(sUser.id!)} className="flex items-center gap-3 text-left">
                  <img src={sUser.avatar} className="w-10 h-10 rounded-full" />
                  <span className="font-bold text-sm text-slate-700">{sUser.name}</span>
                </button>
                <button onClick={() => handleToggleFollow(sUser.id!)} className="px-4 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100">Seguir</button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Guidelines Modal */}
      {showGuidelines && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900">Diretrizes da Comunidade</h3>
                <button onClick={() => setShowGuidelines(false)} className="p-2 text-slate-300 hover:text-slate-600"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
             </div>
             <div className="text-sm text-slate-500 space-y-3 prose-sm prose-p:my-1 prose-ul:my-2">
                <p>Para manter um ambiente seguro e positivo:</p>
                <ul>
                  <li><strong>Seja Respeitoso:</strong> Trate todos com cordialidade.</li>
                  <li><strong>Conteúdo Relevante:</strong> Mantenha o foco em saúde, nutrição e bem-estar.</li>
                  <li><strong>Sem Spam:</strong> Não publique promoções ou conteúdo não solicitado.</li>
                  <li><strong>Denuncie:</strong> Use a função de denúncia para nos alertar sobre conteúdo inadequado.</li>
                </ul>
             </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {viewingProfile && (
        <CommunityProfileModal
          userToShow={viewingProfile}
          currentUser={user}
          currentUserProfile={profile}
          posts={posts}
          onClose={() => setViewingProfile(null)}
          onToggleFollow={handleToggleFollow}
        />
      )}
    </div>
  );
};

export default CommunityView;