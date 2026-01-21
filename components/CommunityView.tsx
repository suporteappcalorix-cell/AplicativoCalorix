
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UserProfile, AuthUser, Post, PostComment, Conversation, ChatMessage } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface CommunityViewProps {
  user: AuthUser;
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onNavigate: (view: 'editProfile') => void;
}

const CommunityIcons = {
  feed: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  profile: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  messages: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>,
  bookmark: ({ active, className }: { active?: boolean; className?: string }) => <svg className={`${className} ${active ? 'fill-slate-700 stroke-slate-700 text-white' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>,
  notifications: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
  guidelines: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
  like: ({ active, className }: { active?: boolean; className?: string }) => <svg className={`${className} ${active ? 'fill-blue-500 stroke-blue-500' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>,
  comment: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>,
  share: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>,
  more: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>,
  camera: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>,
  send: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
  flag: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>,
};

type ViewType = 'feed' | 'profile' | 'messages' | 'saved' | 'notifications' | 'guidelines';

const CommunityView: React.FC<CommunityViewProps> = ({ user, profile, onUpdateProfile, onNavigate }) => {
  const [currentView, setCurrentView] = useState<ViewType>('feed');
  const [postText, setPostText] = useState('');
  const [postMedia, setPostMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [posts, setPosts] = useLocalStorage<Post[]>('calorix_posts_v3', []);
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('calorix_conversations', [
    { id: 'c1', participants: [user.uid, 'demo-1'], lastMessage: 'Bora focar no treino!', lastTimestamp: Date.now(), unreadCount: 1 }
  ]);
  const [messages, setMessages] = useLocalStorage<Record<string, ChatMessage[]>>(`calorix_messages_${user.uid}`, {
    'c1': [{ id: 'm1', senderId: 'demo-1', text: 'Bora focar no treino!', timestamp: Date.now() - 1000 }]
  });
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [chatMsg, setChatMsg] = useState('');
  const [isSelectingStatus, setIsSelectingStatus] = useState(false);
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [sharingPost, setSharingPost] = useState<Post | null>(null);
  const [viewingPost, setViewingPost] = useState<Post | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hasOutdatedAvatar = posts.some(post => {
      const postOutdated = post.authorId === user.uid && post.authorAvatar !== user.avatar;
      if (postOutdated) return true;

      const checkComments = (comments: PostComment[]): boolean => {
        return comments.some(comment => {
          if (comment.authorId === user.uid && comment.authorAvatar !== user.avatar) {
            return true;
          }
          if (comment.replies) {
            return checkComments(comment.replies);
          }
          return false;
        });
      };

      return post.comments ? checkComments(post.comments) : false;
    });

    if (hasOutdatedAvatar) {
      const updateCommentAvatars = (comments: PostComment[]): PostComment[] => {
        return comments.map(comment => ({
          ...comment,
          authorAvatar: comment.authorId === user.uid ? (user.avatar || '') : comment.authorAvatar,
          replies: comment.replies ? updateCommentAvatars(comment.replies) : undefined,
        }));
      };

      setPosts(prevPosts =>
        prevPosts.map(post => ({
          ...post,
          authorAvatar: post.authorId === user.uid ? (user.avatar || '') : post.authorAvatar,
          comments: post.comments ? updateCommentAvatars(post.comments) : [],
        }))
      );
    }
  }, [user.avatar, user.uid, posts, setPosts]);

  const statusOptions = [
    { emoji: '💪', text: 'Me sentindo motivado(a)!' },
    { emoji: '🎉', text: 'Celebrando uma conquista!' },
    { emoji: '🥗', text: 'Focado(a) na dieta.' },
    { emoji: '🥵', text: 'Treino pesado hoje!' },
    { emoji: '😴', text: 'Precisando de um descanso.' },
    { emoji: '🙏', text: 'Grato(a) pelo progresso.' },
  ];

  useEffect(() => {
    if (posts.length === 0) {
      setPosts([
        {
          id: 'p1',
          authorId: 'demo-1',
          authorName: 'Ana Silva',
          authorAvatar: 'https://i.pravatar.cc/150?u=ana',
          content: 'Treino de pernas concluído! A persistência é a chave do sucesso. 🏋️‍♀️🔥',
          media: { type: 'image', url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800' },
          timestamp: Date.now() - 3600000,
          likes: ['user-1'],
          comments: []
        }
      ]);
    }
  }, []);

  const handleCreatePost = () => {
    if (!postText.trim() && !postMedia) return;
    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      authorId: user.uid,
      authorName: profile.name,
      authorAvatar: user.avatar || '',
      content: postText,
      timestamp: Date.now(),
      likes: [],
      comments: [],
      type: 'post',
      ...(postMedia && { media: { type: postMedia.type, url: postMedia.url } })
    };
    setPosts([newPost, ...posts]);
    setPostText('');
    setPostMedia(null);
  };

  const handleToggleFollow = (authorId: string) => {
    const following = profile.social?.following || [];
    const isFollowing = following.includes(authorId);
    const newFollowing = isFollowing 
      ? following.filter(id => id !== authorId)
      : [...following, authorId];
    
    onUpdateProfile({
      social: {
        ...(profile.social || { bio: '', followers: [], savedPosts: [] }),
        following: newFollowing
      }
    });
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const liked = p.likes.includes(user.uid);
      return { ...p, likes: liked ? p.likes.filter(id => id !== user.uid) : [...p.likes, user.uid] };
    }));
  };

  const handleAddComment = (postId: string, text: string, parentId?: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const newComment: PostComment = {
        id: Math.random().toString(36).substr(2, 9),
        authorId: user.uid,
        authorName: profile.name,
        authorAvatar: user.avatar || '',
        text,
        timestamp: Date.now(),
        replies: []
      };

      if (!parentId) return { ...p, comments: [...p.comments, newComment] };
      return {
        ...p,
        comments: p.comments.map(c => c.id === parentId ? { ...c, replies: [...(c.replies || []), newComment] } : c)
      };
    }));
  };
  
  const handleSavePost = (postId: string) => {
    const saved = profile.social?.savedPosts || [];
    const isSaved = saved.includes(postId);
    const newSaved = isSaved
      ? saved.filter(id => id !== postId)
      : [...saved, postId];

    onUpdateProfile({
      social: {
        ...(profile.social || { bio: '', followers: [], following: [], savedPosts: [] }),
        savedPosts: newSaved,
      },
    });
    setOpenMenuPostId(null);
  };

  const handleReportPost = (postId: string) => {
    setPosts(posts => posts.map(p => {
      if (p.id !== postId) return p;
      const reportedBy = p.reportedBy || [];
      if (reportedBy.includes(user.uid)) return p;
      return { ...p, reportedBy: [...reportedBy, user.uid] };
    }));
    alert('Publicação denunciada. Agradecemos sua colaboração.');
    setOpenMenuPostId(null);
  };

  const handleSendMessage = () => {
    if (!chatMsg.trim() || !selectedConv) return;
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: user.uid,
      text: chatMsg,
      timestamp: Date.now(),
    };
    setMessages(prev => ({
      ...prev,
      [selectedConv.id]: [...(prev[selectedConv.id] || []), newMessage]
    }));
    setConversations(prev => prev.map(c => c.id === selectedConv.id ? { ...c, lastMessage: chatMsg, lastTimestamp: Date.now() } : c));
    setChatMsg('');
  };

  const handleSharePost = (recipientId: string, recipientName: string) => {
    if (!sharingPost) return;

    const existingConv = conversations.find(c => c.participants.includes(user.uid) && c.participants.includes(recipientId));
    let convId: string;

    if (existingConv) {
      convId = existingConv.id;
    } else {
      const newConv: Conversation = {
        id: `conv_${Date.now()}`,
        participants: [user.uid, recipientId],
        lastMessage: `Compartilhou uma publicação.`,
        lastTimestamp: Date.now(),
        unreadCount: 0,
      };
      setConversations(prev => [newConv, ...prev]);
      convId = newConv.id;
    }

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: user.uid,
      text: '',
      timestamp: Date.now(),
      sharedPostId: sharingPost.id
    };

    setMessages(prev => ({ ...prev, [convId]: [...(prev[convId] || []), newMessage] }));
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, lastMessage: `Compartilhou: "${sharingPost.content.substring(0,20)}..."`, lastTimestamp: Date.now() } : c));
    setSharingPost(null);
    alert(`Publicação compartilhada com ${recipientName}!`);
  };

  const allUsers = useMemo(() => {
    const users = new Map<string, {name: string, avatar: string}>();
    posts.forEach(post => {
        if (!users.has(post.authorId)) {
            users.set(post.authorId, { name: post.authorName, avatar: post.authorAvatar });
        }
    });
    users.set(user.uid, { name: profile.name, avatar: user.avatar || '' });
    return users;
  }, [posts, user, profile]);

  const followedUsers = useMemo(() => {
      const followingIds = profile.social?.following || [];
      return followingIds
          .map(id => ({ id, ...allUsers.get(id) }))
          .filter((u): u is { id: string; name: string; avatar: string } => !!u.name && u.id !== user.uid);
  }, [profile.social?.following, allUsers, user.uid]);
  
  const savedPostIds = useMemo(() => profile.social?.savedPosts || [], [profile.social?.savedPosts]);
  const savedPosts = useMemo(() => posts.filter(p => savedPostIds.includes(p.id)), [posts, savedPostIds]);

  const getParticipantDetails = (participantId: string) => {
    if (participantId === user.uid) {
        return { name: profile.name, avatar: user.avatar || '' };
    }
    const details = allUsers.get(participantId);
    return details || { name: 'Usuário', avatar: `https://i.pravatar.cc/150?u=${participantId}` };
  };

  const NavItem = ({ id, label, icon: Icon }: { id: ViewType, label: string, icon: any }) => (
    <button
      onClick={() => setCurrentView(id)}
      className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all relative ${currentView === id ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <Icon className={`w-6 h-6 ${currentView === id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
      <span className={`text-[10px] font-black uppercase tracking-tighter ${currentView === id ? 'opacity-100' : 'opacity-0 md:opacity-60'}`}>{label}</span>
      {currentView === id && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>}
    </button>
  );

  const CommentThread: React.FC<{ comment: PostComment, postId: string, isReply?: boolean }> = ({ comment, postId, isReply = false }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyTxt, setReplyTxt] = useState('');

    return (
      <div className={`flex gap-3 ${isReply ? 'mt-3 ml-8 sm:ml-10' : 'mt-4'}`}>
        <img src={comment.authorAvatar} className="w-8 h-8 rounded-full flex-shrink-0 object-cover border border-slate-100" />
        <div className="flex-1">
          <div className="bg-slate-100 rounded-2xl px-4 py-2 inline-block max-w-full shadow-sm">
            <p className="font-black text-[11px] text-slate-900">{comment.authorName}</p>
            <p className="text-sm text-slate-700 leading-snug">{comment.text}</p>
          </div>
          <div className="flex items-center gap-4 mt-1 ml-2">
            <button className="text-[10px] font-black text-slate-500 hover:underline">Curtir</button>
            {!isReply && <button onClick={() => setIsReplying(!isReplying)} className="text-[10px] font-black text-slate-500 hover:underline">Responder</button>}
            <span className="text-[10px] text-slate-300 font-medium">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {isReplying && (
            <div className="mt-2 flex gap-2">
              <input
                autoFocus
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-200"
                placeholder="Escreva uma resposta..."
                value={replyTxt}
                onChange={e => setReplyTxt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && replyTxt.trim()) { handleAddComment(postId, replyTxt, comment.id); setReplyTxt(''); setIsReplying(false); } }}
              />
            </div>
          )}
          {comment.replies?.map(r => <CommentThread key={r.id} comment={r} postId={postId} isReply />)}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col animate-in fade-in duration-500">
      
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-1 mb-6 -mx-4 sm:mx-0 sm:rounded-2xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
          <NavItem id="feed" label="Feed" icon={CommunityIcons.feed} />
          <NavItem id="profile" label="Perfil" icon={CommunityIcons.profile} />
          <NavItem id="messages" label="Chat" icon={CommunityIcons.messages} />
          <NavItem id="saved" label="Salvos" icon={CommunityIcons.bookmark} />
          <NavItem id="notifications" label="Avisos" icon={CommunityIcons.notifications} />
          <NavItem id="guidelines" label="Regras" icon={CommunityIcons.guidelines} />
        </div>
      </nav>

      <main className="flex-1">
        <div className="max-w-2xl mx-auto space-y-6 pb-20">
          
          {currentView === 'feed' && (
            <>
              {/* CARD DE CRIAÇÃO COM BOTÃO DE PUBLICAR INTEGRADO */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div className="flex gap-3 mb-4">
                  <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm" />
                  <div className="flex-1 bg-slate-100 hover:bg-slate-200 rounded-2xl px-5 py-2.5 flex items-center transition-colors cursor-text">
                    <input 
                      className="bg-transparent w-full text-slate-600 text-sm outline-none placeholder:text-slate-400 font-medium" 
                      placeholder={`O que você tem para compartilhar, ${profile.name.split(' ')[0]}?`}
                      value={postText}
                      onChange={e => setPostText(e.target.value)}
                    />
                  </div>
                </div>
                
                {postMedia && (
                  <div className="mb-4 relative group">
                    {postMedia.type === 'image' ? (
                      <img src={postMedia.url} className="w-full rounded-2xl max-h-80 object-cover border border-slate-100 shadow-md" />
                    ) : (
                      <video src={postMedia.url} controls className="w-full rounded-2xl max-h-80 object-cover border border-slate-100 shadow-md" />
                    )}
                    <button onClick={() => setPostMedia(null)} className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black transition-all backdrop-blur-sm">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg>
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-50 pt-3 relative">
                   <div className="flex gap-2">
                      <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-xl transition-all text-slate-500 font-black text-[10px] uppercase tracking-tighter">
                        <CommunityIcons.camera className="w-5 h-5 text-rose-500" /> Foto/Vídeo
                      </button>
                      <button onClick={() => setIsSelectingStatus(!isSelectingStatus)} className="flex items-center justify-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-xl transition-all text-slate-500 font-black text-[10px] uppercase tracking-tighter">
                        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round"></path><line x1="9" y1="9" x2="9.01" y2="9" strokeLinecap="round"></line><line x1="15" y1="9" x2="15.01" y2="9" strokeLinecap="round"></line></svg> Status
                      </button>
                   </div>
                   
                   {isSelectingStatus && (
                    <div className="absolute bottom-full mb-2 left-0 w-full max-w-sm bg-white rounded-2xl shadow-lg border border-slate-100 p-4 animate-in fade-in zoom-in-95 duration-200 z-10">
                      <p className="text-xs font-bold text-slate-400 mb-3 text-center">Como você está se sentindo?</p>
                      <div className="grid grid-cols-2 gap-2">
                        {statusOptions.map(status => (
                          <button
                            key={status.emoji}
                            onClick={() => {
                              setPostText(prev => `${status.emoji} ${status.text}${prev ? ' ' + prev : ''}`);
                              setIsSelectingStatus(false);
                            }}
                            className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left text-xs font-bold text-slate-600 transition-colors"
                          >
                            <span className="text-lg">{status.emoji}</span>
                            <span>{status.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                   <button 
                     onClick={handleCreatePost}
                     disabled={!postText.trim() && !postMedia}
                     className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                       postText.trim() || postMedia 
                       ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95' 
                       : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                     }`}
                   >
                     Publicar
                     <CommunityIcons.send className="w-4 h-4" />
                   </button>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const result = ev.target?.result as string;
                      const type = file.type.startsWith('image') ? 'image' : 'video';
                      setPostMedia({ url: result, type: type });
                    };
                    reader.readAsDataURL(file);
                  }
                }} />
              </div>

              {/* LISTA DE POSTS COM BOTÃO DE SEGUIR */}
              {posts.map(post => {
                const isFollowing = (profile.social?.following || []).includes(post.authorId);
                const isMe = post.authorId === user.uid;

                return (
                  <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-700">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={post.authorAvatar} className="w-10 h-10 rounded-full border border-slate-50 object-cover shadow-sm" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-800 text-sm leading-none">{post.authorName}</h4>
                            
                            {!isMe && (
                              <>
                                <span className="text-slate-300 text-xs">•</span>
                                <button 
                                  onClick={() => handleToggleFollow(post.authorId)}
                                  className={`text-[11px] font-black uppercase tracking-tight transition-colors ${
                                    isFollowing ? 'text-slate-400' : 'text-blue-600 hover:text-blue-700'
                                  }`}
                                >
                                  {isFollowing ? 'Seguindo' : 'Seguir'}
                                </button>
                              </>
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-slate-300 uppercase mt-1">{new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Público</p>
                        </div>
                      </div>
                      <div className="relative">
                        <button onClick={() => setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)} className="text-slate-300 p-2 hover:bg-slate-50 rounded-full transition-colors">
                          <CommunityIcons.more className="w-5 h-5"/>
                        </button>
                        {openMenuPostId === post.id && (
                          <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-slate-100 z-20 p-2 animate-in fade-in zoom-in-95 duration-200">
                            <button 
                              onClick={() => handleSavePost(post.id)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                              <CommunityIcons.bookmark className="w-4 h-4 text-slate-400" active={(profile.social?.savedPosts || []).includes(post.id)} />
                              {(profile.social?.savedPosts || []).includes(post.id) ? 'Remover dos Salvos' : 'Salvar Publicação'}
                            </button>
                            <div className="h-px bg-slate-100 my-1"></div>
                            <button 
                              onClick={() => handleReportPost(post.id)}
                              disabled={(post.reportedBy || []).includes(user.uid)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <CommunityIcons.flag className="w-4 h-4" />
                              {(post.reportedBy || []).includes(user.uid) ? 'Denunciado' : 'Denunciar Publicação'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="px-4 pb-4">
                      <p className="text-slate-700 text-sm leading-relaxed font-medium whitespace-pre-wrap">{post.content}</p>
                    </div>
                    {post.media && (
                      post.media.type === 'image' ? (
                        <img src={post.media.url} className="w-full border-y border-slate-50 max-h-[550px] object-cover" />
                      ) : (
                        <video src={post.media.url} controls className="w-full border-y border-slate-50 max-h-[550px] bg-black" />
                      )
                    )}
                    
                    <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {post.likes.length > 0 && <div className="flex items-center"><div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm"><CommunityIcons.like className="w-2.5 h-2.5 text-white fill-white" /></div><span className="text-[11px] font-black text-slate-400 ml-1.5">{post.likes.length}</span></div>}
                      </div>
                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-tight">{post.comments.length} comentários</div>
                    </div>

                    <div className="px-2 py-1 grid grid-cols-3 gap-1">
                      <button onClick={() => handleLike(post.id)} className={`flex items-center justify-center gap-2 py-3 rounded-lg transition-all font-black text-[10px] uppercase ${post.likes.includes(user.uid) ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}>
                         <CommunityIcons.like active={post.likes.includes(user.uid)} className="w-5 h-5" /> Curtir
                      </button>
                      <button className="flex items-center justify-center gap-2 py-3 rounded-lg text-slate-500 hover:bg-slate-50 transition-all font-black text-[10px] uppercase">
                         <CommunityIcons.comment className="w-5 h-5" /> Comentar
                      </button>
                      <button 
                        onClick={() => setSharingPost(post)}
                        className="flex items-center justify-center gap-2 py-3 rounded-lg text-slate-500 hover:bg-slate-50 transition-all font-black text-[10px] uppercase"
                      >
                         <CommunityIcons.send className="w-5 h-5" /> Mensagem
                      </button>
                    </div>

                    <div className="px-4 pb-4 bg-slate-50/20">
                      {post.comments.map(c => <CommentThread key={c.id} comment={c} postId={post.id} />)}
                      <div className="mt-4 flex gap-3">
                        <img src={user.avatar} className="w-8 h-8 rounded-full border border-slate-200 object-cover shadow-sm" />
                        <input 
                          className="flex-1 bg-slate-100 hover:bg-slate-200 rounded-2xl px-5 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                          placeholder="Escreva um comentário..."
                          onKeyDown={e => {
                            const input = e.target as HTMLInputElement;
                            if (e.key === 'Enter' && input.value.trim()) {
                              handleAddComment(post.id, input.value);
                              input.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </>
          )}

          {currentView === 'profile' && (
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm text-center space-y-6 animate-in zoom-in-95 duration-500">
               <img src={user.avatar} className="w-32 h-32 rounded-full border-4 border-white shadow-2xl mx-auto object-cover" />
               <div>
                 <h2 className="text-2xl font-black text-slate-900 leading-tight">{profile.name}</h2>
                 <p className="text-slate-400 font-bold italic mt-1">"{profile.social?.bio || 'Buscando minha melhor versão!'}"</p>
               </div>
               <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-8">
                 <div><p className="text-xl font-black text-slate-800">{profile.social?.followers.length || 0}</p><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Seguidores</p></div>
                 <div><p className="text-xl font-black text-slate-800">{posts.filter(p => p.authorId === user.uid).length}</p><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Posts</p></div>
                 <div><p className="text-xl font-black text-slate-800">{profile.social?.following.length || 0}</p><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Seguindo</p></div>
               </div>
               <button onClick={() => onNavigate('editProfile')} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-[0.98]">Editar Perfil</button>
            </div>
          )}

          {currentView === 'messages' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex h-[550px] overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
               <div className={`${selectedConv ? 'hidden md:flex' : 'flex'} w-full md:w-72 border-r border-slate-100 flex flex-col`}>
                 <div className="p-6 font-black border-b border-slate-100 text-slate-800 bg-white">Conversas</div>
                 <div className="flex-1 overflow-y-auto divide-y divide-slate-50 no-scrollbar">
                    {conversations.map(c => {
                      const otherParticipantId = c.participants.find(pId => pId !== user.uid) || '';
                      const participantDetails = getParticipantDetails(otherParticipantId);
                      return (
                        <button onClick={() => setSelectedConv(c)} key={c.id} className={`w-full p-5 flex items-center gap-4 transition-all ${selectedConv?.id === c.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                          <img src={participantDetails.avatar} className="w-12 h-12 bg-slate-200 rounded-2xl flex-shrink-0 object-cover" alt={participantDetails.name}/>
                          <div className="text-left overflow-hidden">
                            <p className="font-black text-sm text-slate-800 truncate">{participantDetails.name}</p>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.lastMessage}</p>
                          </div>
                          {c.unreadCount > 0 && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm"></div>}
                        </button>
                      );
                    })}
                 </div>
               </div>
               <div className={`${!selectedConv ? 'hidden md:flex' : 'flex'} flex-1 flex flex-col bg-slate-50/50`}>
                  {selectedConv ? (() => {
                      const otherParticipantId = selectedConv.participants.find(pId => pId !== user.uid) || '';
                      const participantDetails = getParticipantDetails(otherParticipantId);
                      const chatHistory = messages[selectedConv.id] || [];
                      return (
                        <>
                          <div className="p-5 bg-white border-b border-slate-100 font-black text-slate-700 flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-3">
                              <img src={participantDetails.avatar} className="w-8 h-8 rounded-full bg-slate-200 shadow-inner object-cover" alt={participantDetails.name}/>
                              {participantDetails.name}
                            </div>
                            <button onClick={() => setSelectedConv(null)} className="md:hidden text-slate-400 p-2 hover:bg-slate-100 rounded-xl">Voltar</button>
                          </div>
                          <div className="flex-1 p-6 overflow-y-auto space-y-4 no-scrollbar">
                            {chatHistory.map(msg => {
                              const isMe = msg.senderId === user.uid;
                              const sharedPost = msg.sharedPostId ? posts.find(p => p.id === msg.sharedPostId) : null;
                              return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`rounded-2xl shadow-sm max-w-[85%] text-sm font-medium ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-100 rounded-bl-none text-slate-800'}`}>
                                    {sharedPost ? (
                                      <div className="p-3">
                                        <div className={`flex items-center gap-2 border-b pb-2 mb-2 ${isMe ? 'border-blue-500/50' : 'border-slate-200'}`}>
                                          <img src={sharedPost.authorAvatar} className="w-6 h-6 rounded-full" />
                                          <p className={`text-xs font-bold ${isMe ? 'text-white' : 'text-slate-800'}`}>{sharedPost.authorName}</p>
                                        </div>
                                        <p className={`text-xs italic my-2 ${isMe ? 'text-white/90' : 'text-slate-600'}`}>"{sharedPost.content.substring(0, 80)}..."</p>
                                        {sharedPost.media && <img src={sharedPost.media.url} className="my-2 rounded-lg w-full" />}
                                        <button onClick={() => setViewingPost(sharedPost)} className={`w-full mt-3 pt-3 border-t text-center text-xs font-bold flex items-center justify-center gap-2 transition-colors ${isMe ? 'border-blue-500/50 text-white/80 hover:text-white' : 'border-slate-200 text-slate-500 hover:text-slate-800'}`}>
                                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                          Ver Publicação
                                        </button>
                                      </div>
                                    ) : (
                                      msg.text && <p className="p-4">{msg.text}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                           <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
                              <input 
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-400 transition-colors placeholder:text-slate-400" 
                                placeholder="Mensagem..." 
                                value={chatMsg} 
                                onChange={e => setChatMsg(e.target.value)} 
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                  }
                                }}
                              />
                              <button 
                                onClick={handleSendMessage} 
                                disabled={!chatMsg.trim()}
                                className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/20 active:scale-90 transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                              >
                                <CommunityIcons.send className="w-5 h-5"/>
                              </button>
                          </div>
                        </>
                      );
                  })() : <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12 text-center"><div className="text-5xl mb-4">💬</div><p className="font-bold">Escolha uma conversa.</p></div>}
               </div>
            </div>
          )}

          {currentView === 'notifications' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
               <div className="p-6 font-black border-b border-slate-100 text-slate-800 bg-white">Recentes</div>
               <div className="divide-y divide-slate-50">
                  <div className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-all cursor-pointer">
                     <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-xl shadow-inner">👍</div>
                     <div><p className="text-sm font-bold text-slate-700 leading-snug"><b>Ana Silva</b> curtiu sua publicação.</p><p className="text-[10px] font-black text-slate-300 uppercase mt-1">Há 15 minutos</p></div>
                  </div>
                  <div className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-all cursor-pointer">
                     <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-bold text-xl shadow-inner">✨</div>
                     <div><p className="text-sm font-bold text-slate-700 leading-snug">Parabéns pelo <b>Nível 15</b>!</p><p className="text-[10px] font-black text-slate-300 uppercase mt-1">Há 2 horas</p></div>
                  </div>
               </div>
            </div>
          )}

          {currentView === 'saved' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 px-4">Suas Publicações Salvas</h2>
              {savedPosts.length > 0 ? (
                savedPosts.map(post => {
                  const isFollowing = (profile.social?.following || []).includes(post.authorId);
                  const isMe = post.authorId === user.uid;

                  return (
                    <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-700">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={post.authorAvatar} className="w-10 h-10 rounded-full border border-slate-50 object-cover shadow-sm" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-slate-800 text-sm leading-none">{post.authorName}</h4>
                              
                              {!isMe && (
                                <>
                                  <span className="text-slate-300 text-xs">•</span>
                                  <button 
                                    onClick={() => handleToggleFollow(post.authorId)}
                                    className={`text-[11px] font-black uppercase tracking-tight transition-colors ${
                                      isFollowing ? 'text-slate-400' : 'text-blue-600 hover:text-blue-700'
                                    }`}
                                  >
                                    {isFollowing ? 'Seguindo' : 'Seguir'}
                                  </button>
                                </>
                              )}
                            </div>
                            <p className="text-[10px] font-bold text-slate-300 uppercase mt-1">{new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Público</p>
                          </div>
                        </div>
                        <div className="relative">
                          <button onClick={() => setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)} className="text-slate-300 p-2 hover:bg-slate-50 rounded-full transition-colors">
                            <CommunityIcons.more className="w-5 h-5"/>
                          </button>
                          {openMenuPostId === post.id && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-slate-100 z-20 p-2 animate-in fade-in zoom-in-95 duration-200">
                              <button 
                                onClick={() => handleSavePost(post.id)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                              >
                                <CommunityIcons.bookmark className="w-4 h-4 text-slate-400" active={(profile.social?.savedPosts || []).includes(post.id)} />
                                {(profile.social?.savedPosts || []).includes(post.id) ? 'Remover dos Salvos' : 'Salvar Publicação'}
                              </button>
                              <div className="h-px bg-slate-100 my-1"></div>
                              <button 
                                onClick={() => handleReportPost(post.id)}
                                disabled={(post.reportedBy || []).includes(user.uid)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <CommunityIcons.flag className="w-4 h-4" />
                                {(post.reportedBy || []).includes(user.uid) ? 'Denunciado' : 'Denunciar Publicação'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="px-4 pb-4">
                        <p className="text-slate-700 text-sm leading-relaxed font-medium whitespace-pre-wrap">{post.content}</p>
                      </div>
                      {post.media && (
                        post.media.type === 'image' ? (
                          <img src={post.media.url} className="w-full border-y border-slate-50 max-h-[550px] object-cover" />
                        ) : (
                          <video src={post.media.url} controls className="w-full border-y border-slate-50 max-h-[550px] bg-black" />
                        )
                      )}
                      
                      <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {post.likes.length > 0 && <div className="flex items-center"><div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm"><CommunityIcons.like className="w-2.5 h-2.5 text-white fill-white" /></div><span className="text-[11px] font-black text-slate-400 ml-1.5">{post.likes.length}</span></div>}
                        </div>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-tight">{post.comments.length} comentários</div>
                      </div>

                      <div className="px-2 py-1 grid grid-cols-3 gap-1">
                        <button onClick={() => handleLike(post.id)} className={`flex items-center justify-center gap-2 py-3 rounded-lg transition-all font-black text-[10px] uppercase ${post.likes.includes(user.uid) ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}>
                           <CommunityIcons.like active={post.likes.includes(user.uid)} className="w-5 h-5" /> Curtir
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3 rounded-lg text-slate-500 hover:bg-slate-50 transition-all font-black text-[10px] uppercase">
                           <CommunityIcons.comment className="w-5 h-5" /> Comentar
                        </button>
                        <button 
                          onClick={() => setSharingPost(post)}
                          className="flex items-center justify-center gap-2 py-3 rounded-lg text-slate-500 hover:bg-slate-50 transition-all font-black text-[10px] uppercase"
                        >
                           <CommunityIcons.send className="w-5 h-5" /> Mensagem
                        </button>
                      </div>

                      <div className="px-4 pb-4 bg-slate-50/20">
                        {post.comments.map(c => <CommentThread key={c.id} comment={c} postId={post.id} />)}
                        <div className="mt-4 flex gap-3">
                          <img src={user.avatar} className="w-8 h-8 rounded-full border border-slate-200 object-cover shadow-sm" />
                          <input 
                            className="flex-1 bg-slate-100 hover:bg-slate-200 rounded-2xl px-5 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                            placeholder="Escreva um comentário..."
                            onKeyDown={e => {
                              const input = e.target as HTMLInputElement;
                              if (e.key === 'Enter' && input.value.trim()) {
                                handleAddComment(post.id, input.value);
                                input.value = '';
                              }
                            }}
                          />
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                  <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-100 text-slate-400 font-bold italic animate-in zoom-in-95 duration-500">
                      Você ainda não salvou nenhuma publicação.
                  </div>
              )}
            </div>
          )}

          {currentView === 'guidelines' && (
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-black text-slate-900 leading-tight">Diretrizes do Calorix</h2>
              <div className="space-y-8">
                {[
                  { icon: '🌱', title: 'Comunidade Positiva', text: 'Incentive o progresso alheio. Somos todos parceiros de jornada.' },
                  { icon: '🥗', title: 'Equilíbrio Saudável', text: 'Foco em saúde e longevidade, evitando comportamentos de risco.' },
                  { icon: '🚫', title: 'Sem Publicidade', text: 'Não permitimos spam ou vendas de produtos de terceiros.' },
                  { icon: '🛡️', title: 'Privacidade', text: 'Respeite a privacidade e as fotos de todos os membros.' }
                ].map((g, i) => (
                  <div key={i} className="flex gap-5 group">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform shadow-inner">{g.icon}</div>
                    <div><h4 className="font-black text-slate-800 mb-1 leading-none">{g.title}</h4><p className="text-sm text-slate-500 leading-relaxed font-medium mt-2">{g.text}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {sharingPost && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[70vh]">
            <div className="px-8 pt-8 pb-4 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Compartilhar com...</h2>
              <button onClick={() => setSharingPost(null)} className="p-2 text-slate-300 hover:text-slate-600 transition-all">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {followedUsers.length > 0 ? (
                <div className="space-y-2">
                  {followedUsers.map(fUser => (
                    <div key={fUser.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl">
                      <img src={fUser.avatar} className="w-10 h-10 rounded-full object-cover" />
                      <p className="flex-1 font-bold text-slate-700">{fUser.name}</p>
                      <button onClick={() => handleSharePost(fUser.id, fUser.name)} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors">
                        Enviar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400 font-medium">Você ainda não segue ninguém para compartilhar.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {viewingPost && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setViewingPost(null)} className="sticky top-4 right-4 z-10 p-2 bg-black/20 text-white rounded-full hover:bg-black/50 transition-all float-right m-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <article className="bg-white rounded-2xl p-4 clear-both">
              <div className="p-4 flex items-center gap-3">
                <img src={viewingPost.authorAvatar} className="w-10 h-10 rounded-full border border-slate-50 object-cover shadow-sm" />
                <div>
                  <h4 className="font-black text-slate-800 text-sm leading-none">{viewingPost.authorName}</h4>
                  <p className="text-[10px] font-bold text-slate-300 uppercase mt-1">{new Date(viewingPost.timestamp).toLocaleString('pt-BR')}</p>
                </div>
              </div>
              <div className="px-4 pb-4">
                <p className="text-slate-700 text-sm leading-relaxed font-medium whitespace-pre-wrap">{viewingPost.content}</p>
              </div>
              {viewingPost.media && (
                <div className="px-4 pb-4">
                {viewingPost.media.type === 'image' ? (
                  <img src={viewingPost.media.url} className="w-full rounded-xl border border-slate-100 max-h-[60vh] object-contain" />
                ) : (
                  <video src={viewingPost.media.url} controls className="w-full rounded-xl border border-slate-100 max-h-[60vh] bg-black" />
                )}
                </div>
              )}
            </article>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityView;
