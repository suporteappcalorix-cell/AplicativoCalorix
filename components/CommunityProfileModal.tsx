
import React from 'react';
import { UserProfile, Post, AuthUser } from '../types';

interface CommunityProfileModalProps {
  userToShow: UserProfile;
  currentUser: AuthUser;
  currentUserProfile: UserProfile;

  posts: Post[];
  onClose: () => void;
  onToggleFollow: (userId: string) => void;
}

const CommunityProfileModal: React.FC<CommunityProfileModalProps> = ({
  userToShow,
  currentUser,
  currentUserProfile,
  posts,
  onClose,
  onToggleFollow
}) => {
  const userPosts = posts.filter(p => p.authorId === userToShow.id);
  const isFollowing = (currentUserProfile.social?.following || []).includes(userToShow.id!);
  const isMe = currentUser.uid === userToShow.id;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-50 w-full max-w-2xl h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative shrink-0">
          <div className="h-32 bg-gradient-to-r from-emerald-50 to-teal-50"></div>
          
          <div className="px-8 flex items-end -mt-16">
            <img 
              src={userToShow.avatar} 
              alt={userToShow.name}
              className="w-32 h-32 rounded-[2rem] border-4 border-slate-50 shadow-lg object-cover"
            />
            <div className="flex-1 flex justify-between items-center pb-4 pl-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{userToShow.name}</h3>
                <p className="text-sm text-slate-400 font-bold">@{userToShow.name.toLowerCase().replace(/\s/g, '')}</p>
              </div>
              
              {!isMe ? (
                <button
                  onClick={() => onToggleFollow(userToShow.id!)}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                    isFollowing 
                    ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' 
                    : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  {isFollowing ? 'Seguindo' : 'Seguir'}
                </button>
              ) : (
                 <button className="px-6 py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-400 cursor-not-allowed">
                   Este é você
                 </button>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-500 px-8 mt-4 leading-relaxed">
            {userToShow.social?.bio || 'Nenhuma bio ainda.'}
          </p>

          <div className="px-8 mt-4 flex gap-6 text-sm">
             <p><span className="font-black text-slate-800">{userPosts.length}</span> <span className="text-slate-400">Publicações</span></p>
             <p><span className="font-black text-slate-800">{userToShow.social?.followers.length || 0}</span> <span className="text-slate-400">Seguidores</span></p>
             <p><span className="font-black text-slate-800">{userToShow.social?.following.length || 0}</span> <span className="text-slate-400">Seguindo</span></p>
          </div>
          
          <button onClick={onClose} className="absolute top-4 right-4 p-3 bg-black/10 text-white rounded-full hover:bg-black/30 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        {/* User's Feed */}
        <div className="flex-1 overflow-y-auto p-8 mt-4">
          {userPosts.length > 0 ? (
            userPosts.map(post => (
              <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-4">
                <p className="text-slate-700 mb-4">{post.content}</p>
                {post.media && <img src={post.media.url} className="rounded-lg border border-slate-100 mb-4 w-full" />}
                <p className="text-xs text-slate-400">{new Date(post.timestamp).toLocaleString()}</p>
              </article>
            ))
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400 font-medium">Nenhuma publicação ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityProfileModal;
