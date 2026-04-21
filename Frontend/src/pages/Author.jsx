import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import userService from '../services/userService';
import authService from '../services/authService';
import PostCard from '../components/PostCard';

const Author = () => {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [authorData, postsData] = await Promise.all([
          userService.getUserById(id),
          userService.getUserPosts(id)
        ]);
        
        const authorObj = authorData.user || authorData;
        setAuthor(authorObj);
        setPosts(postsData.posts || postsData || []);
        
        if (currentUser && authorObj.followers) {
          setIsFollowing(authorObj.isFollowing || false); 
        }

      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load author profile.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) return alert('Please log in to follow authors.');
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await userService.unfollowUser(id);
        setIsFollowing(false);
        setAuthor(prev => ({ ...prev, followers: (prev.followers || []).slice(0, -1) }));
      } else {
        await userService.followUser(id);
        setIsFollowing(true);
        setAuthor(prev => ({ ...prev, followers: [...(prev.followers || []), 'new'] }));
      }
    } catch (err) {
      console.error(err);
      alert('Action failed. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500 font-bold">
        <div className="animate-pulse">Loading author details...</div>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-500 font-bold">
        {error || 'Author not found.'}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Author Header section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-12">
        <div className="h-48 bg-gradient-to-r from-purple-600 to-indigo-700"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 mb-6 gap-6">
            <div className="flex items-end gap-6">
              <img 
                src={author.profilePic || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + author._id} 
                alt={author.name} 
                className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md object-cover"
              />
              <div className="pb-2">
                <h1 className="text-3xl font-black text-gray-900">{author.name}</h1>
                <p className="text-gray-500 font-medium">@{author.username || author.name?.toLowerCase().replace(/\s/g, '')}</p>
                <div className="mt-1 flex gap-4 text-sm font-bold text-gray-500">
                  <span><span className="text-gray-900">{author.followers?.length || 0}</span> Followers</span>
                  <span><span className="text-gray-900">{posts.length}</span> Posts</span>
                </div>
              </div>
            </div>
            <div className="pb-2">
              <button 
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`px-8 py-2.5 font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 ${
                  isFollowing 
                  ? 'bg-gray-100 text-gray-800 hover:bg-red-50 hover:text-red-600' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                }`}
              >
                {followLoading ? 'Working...' : isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          </div>

          <div className="max-w-3xl">
            <p className="text-gray-700 text-lg mb-6 leading-relaxed">
              {author.bio || `${author.name} hasn't added a bio yet.`}
            </p>
            
            <div className="flex gap-4">
              {author.socialLinks?.twitter && (
                 <a href={author.socialLinks.twitter} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 font-semibold">Twitter</a>
              )}
              {author.socialLinks?.github && (
                 <a href={author.socialLinks.github} target="_blank" rel="noreferrer" className="text-gray-700 hover:text-black font-semibold">GitHub</a>
              )}
              {author.socialLinks?.website && (
                 <a href={author.socialLinks.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 font-semibold">Website</a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Publications by {author.name}</h2>
        
        {posts.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">📓</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500">This author hasn't published anything yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Author;
