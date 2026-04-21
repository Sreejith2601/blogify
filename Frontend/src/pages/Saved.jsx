import { useState, useEffect } from 'react';
import userService from '../services/userService';
import PostCard from '../components/PostCard';
import { Link } from 'react-router-dom';

const Saved = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const data = await userService.getSavedPosts();
        setPosts(data.posts || []);
      } catch (err) {
        setError(err.message || 'Failed to load saved posts');
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-12 bg-white/5 rounded-2xl w-64 mb-14 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-white/2 rounded-[2.5rem] animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg py-16 sm:py-24 px-4 sm:px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-16 sm:mb-20">
          <div>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter mb-3">Saved Library</h1>
            <p className="text-zinc-600 font-bold tracking-[0.2em] uppercase text-[10px] sm:text-[11px]">Your personal archive of digital signals</p>
          </div>
          <Link 
            to="/" 
            className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
          >
            Explore More
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white/2 border border-dashed border-white/5 rounded-[3rem] p-16 sm:p-28 text-center backdrop-blur-sm">
            <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/5">
              <svg className="w-10 h-10 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Archive Empty</h2>
            <p className="text-zinc-600 mb-10 max-w-sm mx-auto text-xs font-bold uppercase tracking-widest leading-loose">Save stories you love and they will materialize here in your private library.</p>
            <Link 
              to="/" 
              className="px-12 py-4 bg-brand-accent text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-accent-hover transition-all shadow-xl shadow-brand-accent/20"
            >
              Discover Stories
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {posts.map(post => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;
