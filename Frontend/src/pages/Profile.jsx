import { useState, useEffect } from 'react';
import userService from '../services/userService';
import PostCard from '../components/PostCard';
import { Link } from 'react-router-dom';
import { resolveMediaUrl } from '../services/urlHelper';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'saved'
  const [savedLoading, setSavedLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const profData = await userService.getProfile();
        const user = profData.user || profData;
        setProfile(user);

        if (user && user._id) {
          const [postsData, analyticsData] = await Promise.allSettled([
            userService.getUserPosts(user._id),
            userService.getUserAnalytics()
          ]);
          if (postsData.status === 'fulfilled') {
            setPosts(postsData.value.posts || postsData.value || []);
          }
          if (analyticsData.status === 'fulfilled') {
            setAnalytics(analyticsData.value.analytics || analyticsData.value);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchSavedPosts = async () => {
    if (savedPosts.length > 0) return;
    setSavedLoading(true);
    try {
      const data = await userService.getSavedPosts();
      setSavedPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to load saved posts:', err);
    } finally {
      setSavedLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedPosts();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-xs text-gray-400 font-medium">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6 bg-gray-50">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-500 mb-8">{error || 'Profile not found.'}</p>
          <Link to="/" className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold text-sm hover:bg-gray-700 transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-zinc-400">
      {/* Profile Header */}
      <section className="bg-zinc-900/30 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 to-transparent pointer-events-none"></div>
        <div className="px-4 sm:px-6 md:px-10 lg:px-20 py-12 sm:py-16 relative z-10">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-start sm:items-center">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl bg-zinc-900 flex items-center justify-center">
                {profile.profilePic ? (
                  <img src={resolveMediaUrl(profile.profilePic)} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl sm:text-5xl font-black text-zinc-700 uppercase">{profile.name?.charAt(0)}</span>
                )}
              </div>
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-brand-accent rounded-full border-4 border-zinc-900"></div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter mb-2 truncate">{profile.name}</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4">
                Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              {profile.bio && (
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl mb-6 font-medium">{profile.bio}</p>
              )}

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-6 sm:gap-12 mb-8">
                <div className="text-left">
                  <p className="text-2xl sm:text-3xl font-black text-white">{posts.length}</p>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Stories</p>
                </div>
                <div className="text-left">
                  <p className="text-2xl sm:text-3xl font-black text-white">{profile.followers?.length || 0}</p>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Readers</p>
                </div>
                <div className="text-left">
                  <p className="text-2xl sm:text-3xl font-black text-white">{profile.following?.length || 0}</p>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Following</p>
                </div>
                <div className="text-left">
                  <p className="text-2xl sm:text-3xl font-black text-white">{analytics?.totals?.views || 0}</p>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Impact</p>
                </div>
                <div className="text-left">
                  <p className="text-2xl sm:text-3xl font-black text-brand-accent">{analytics?.totals?.likes || 0}</p>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Tips</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/settings"
                  className="px-6 py-2.5 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                >
                  Settings
                </Link>
                <Link
                  to="/metadata"
                  className="px-6 py-2.5 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                >
                  Tags
                </Link>
                <Link
                  to="/create"
                  className="px-5 py-2 bg-brand-accent text-white text-sm font-semibold rounded-lg hover:bg-brand-accent-hover transition-colors"
                >
                  + New Post
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <main className="px-4 sm:px-6 md:px-10 lg:px-20 py-10 sm:py-14">
        <div className="flex items-center gap-8 border-b border-white/5 mb-10">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'posts' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            My Stories
            {activeTab === 'posts' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-accent rounded-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'saved' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            Saved
            {activeTab === 'saved' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-accent rounded-full"></div>}
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-black text-white">
            {activeTab === 'posts' ? 'My Contributions' : 'Saved Collection'}
          </h2>
          <span className="text-sm text-zinc-600">
            {activeTab === 'posts' ? posts.length : savedPosts.length} items
          </span>
        </div>

        {activeTab === 'posts' ? (
          posts.length === 0 ? (
            <div className="py-24 sm:py-32 text-center border border-dashed border-white/5 rounded-[2.5rem] bg-white/2 backdrop-blur-sm">
              <div className="text-5xl mb-6">✍️</div>
              <p className="text-white font-black uppercase tracking-widest text-xs mb-2">No signals detected</p>
              <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest mb-10">Start sharing your thoughts with the world.</p>
              <Link
                to="/create"
                className="inline-block px-10 py-4 bg-brand-accent text-zinc-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-accent-hover transition-all shadow-lg hover:shadow-brand-accent/20"
              >
                Broadcast First Story
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
              {posts.map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )
        ) : (
          savedLoading ? (
            <div className="py-20 text-center">
              <div className="w-6 h-6 border-2 border-gray-100 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
              <span className="text-xs text-gray-400 uppercase tracking-widest font-black">Scanning Library...</span>
            </div>
          ) : savedPosts.length === 0 ? (
            <div className="py-24 sm:py-32 text-center border border-dashed border-white/5 rounded-[2.5rem] bg-white/2 backdrop-blur-sm">
              <div className="text-5xl mb-6">🔖</div>
              <p className="text-white font-black uppercase tracking-widest text-xs mb-2">Archive Empty</p>
              <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest mb-10">Stories you save will appear in your private library.</p>
              <Link
                to="/"
                className="inline-block px-10 py-4 bg-white text-zinc-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all shadow-lg"
              >
                Discover Content
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
              {savedPosts.map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default Profile;
