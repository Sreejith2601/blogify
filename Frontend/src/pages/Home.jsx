import { useEffect, useState, useContext } from 'react';
import postService from '../services/postService';
import PostCard from '../components/PostCard';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);
  
  const [activeTab] = useState('global');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');


  useEffect(() => {
    const timer = setTimeout(() => {
      setTag(tagInput.trim());
      setSearchQuery(searchInput.trim());
    }, 600);
    return () => clearTimeout(timer);
  }, [tagInput, searchInput]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        let response;
        if (activeTab === 'following' && token) {
          response = await postService.getFollowingPosts();
        } else {
          const params = {};
          if (category) params.category = category;
          if (tag) params.tag = tag;
          if (searchQuery) params.search = searchQuery;
          response = await postService.getAllPosts(params);
        }
        
        setPosts(response.posts || response || []);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err.message || 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [category, tag, searchQuery, activeTab, token]);


  return (
    <div className="bg-brand-bg min-h-screen">
      <div className="px-4 sm:px-6 md:px-10 lg:px-20 py-12 md:py-16 lg:py-20">
        {/* Header */}
        <header className="mb-14 md:mb-20">
          <div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-brand-primary tracking-tighter mb-4 leading-[0.9]">
              Latest <span className="opacity-20">Signals</span>.
            </h1>
            <p className="text-base sm:text-lg text-brand-muted max-w-xl font-medium leading-relaxed uppercase tracking-widest text-[10px] sm:text-[11px]">
              A curated flow of perspectives and insights from the edge of the network.
            </p>
          </div>
          <div className="mt-8 w-16 h-1.5 bg-brand-accent rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)]"></div>
        </header>

        {/* Content */}
        <main>
          {loading ? (
            <div className="py-24 flex flex-col items-center gap-4">
               <div className="w-8 h-8 border-2 border-brand-border border-t-brand-accent rounded-full animate-spin"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Connecting to Stream...</span>
            </div>
          ) : error ? (
            <div className="p-8 sm:p-12 bg-white border border-gray-100 rounded-2xl text-center max-w-2xl mx-auto shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
              <p className="text-gray-400 mb-8">{error}</p>
              <button onClick={() => window.location.reload()} className="px-8 py-3 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-gray-800 transition-colors">
                Retry
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-gray-200 rounded-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Nothing here yet</h2>
              <p className="text-gray-400 max-w-xs mx-auto">Check back later for new stories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
