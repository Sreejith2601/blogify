import { Link, useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import postService from '../services/postService';
import userService from '../services/userService';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import ShareModal from './ShareModal';

const PostCard = ({ post }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { title, content, author, createdAt, categories, _id, likedBy = [] } = post;

  // Initialize isLiked by checking if current user's ID is in likedBy array
  const [isLiked, setIsLiked] = useState(
    user ? likedBy.some((id) => id === user._id || id?.toString() === user._id?.toString()) : false
  );
  const [likesCount, setLikesCount] = useState(likedBy.length);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(
    user?.savedPosts?.some(id => id === _id || id?.toString() === _id?.toString()) || false
  );

  const shareUrl = `${window.location.origin}/post/${_id}`;

  const dateStr = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please log in to like posts');
      return;
    }

    // Optimistic UI update
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

    try {
      const response = await postService.likePost(_id);
      // Sync with real server values
      if (response) {
        setIsLiked(response.liked);
        setLikesCount(response.likesCount);
      }
    } catch (err) {
      // Revert on error
      setIsLiked(!newLikedState);
      setLikesCount(prev => !newLikedState ? prev + 1 : prev - 1);
      toast.error('Failed to update like');
    }
  };

  const handleDeletePost = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this story?')) return;
    try {
      await postService.deletePost(_id);
      toast.success('Story deleted');
      window.location.reload(); // Refresh to update grid
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  const handleComment = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/post/${_id}#discussion`);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShareModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Sign in to save stories');
      return;
    }

    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    try {
      await userService.savePost(_id);
      toast.success(newSavedState ? 'Saved to your library' : 'Removed from saved');
    } catch (err) {
      setIsSaved(!newSavedState);
      toast.error('Failed to update saved status');
    }
  };

  return (
    <div className="group flex flex-col h-full bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden hover:bg-zinc-900/60 hover:border-white/10 transition-all duration-500 hover:shadow-2xl">
      <div className="p-7 flex-grow flex flex-col">

        {/* Category Pill */}
        <div className="mb-5">
          <span className="inline-block px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-brand-accent transition-colors">
            {categories?.[0] || 'Technology'}
          </span>
        </div>

        {/* Title */}
        <Link to={`/post/${_id}`} className="block mb-4">
          <h3 className="text-[20px] font-black text-white leading-tight tracking-tight group-hover:text-brand-accent transition-colors duration-300 line-clamp-2">
            {title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-zinc-500 text-sm leading-relaxed mb-6 line-clamp-2 flex-grow font-medium">
          {content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').substring(0, 120)}...
        </p>

        {/* Read Now */}
        <Link
          to={`/post/${_id}`}
          className="text-sm font-bold text-brand-accent hover:text-brand-accent-hover transition-colors duration-200 inline-flex items-center gap-1.5 mb-5 uppercase tracking-widest text-[10px]"
        >
          Read Now
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Social Bar */}
        <div className="flex items-center justify-between pt-5 border-t border-white/5">
          <div className="flex items-center gap-6">
            {/* Like Button */}
            <button
              onClick={handleLike}
              title={isLiked ? 'Unlike' : 'Like'}
              className={`flex items-center gap-2 transition-colors duration-200 ${isLiked ? 'text-brand-accent' : 'text-zinc-700 hover:text-brand-accent/70'}`}
            >
              <svg
                className={`w-5 h-5 transition-all duration-300 ${isLiked ? 'fill-brand-accent scale-110' : 'fill-none'}`}
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-[10px] font-black tracking-widest text-zinc-500">{likesCount}</span>
            </button>

            {/* Comment Button */}
            <button 
              onClick={handleComment} 
              title="Add a comment"
              className="text-zinc-700 hover:text-white transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>

            {/* Share Button */}
            <button 
              onClick={handleShare} 
              title="Copy Link"
              className="text-zinc-700 hover:text-white transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>

            {/* Author Quick Actions */}
            {user && (user._id === author?._id || user._id === author) && (
              <div className="flex items-center gap-4 ml-2 pl-4 border-l border-white/5">
                <Link 
                  to={`/edit/${_id}`} 
                  onClick={(e) => e.stopPropagation()}
                  title="Edit Story"
                  className="text-zinc-700 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </Link>
                <button 
                  onClick={handleDeletePost} 
                  title="Delete Story"
                  className="text-zinc-700 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            )}
          </div>

        {/* Bookmark */}
        <button 
          onClick={handleSave}
          title={isSaved ? 'Unsave' : 'Save for later'}
          className={`transition-all duration-300 ${isSaved ? 'text-brand-accent' : 'text-zinc-700 hover:text-white hover:scale-110'}`}
        >
          <svg 
            className={`w-5 h-5 ${isSaved ? 'fill-brand-accent' : 'fill-none'}`} 
            stroke="currentColor" 
            strokeWidth={2} 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
        </div>
      </div>

      {/* Author Bar */}
      <div className="px-7 py-5 bg-white/5 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0 bg-zinc-800 flex items-center justify-center">
            {author?.profilePic ? (
              <img
                src={author.profilePic}
                alt={author?.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <span className="text-[10px] font-black text-zinc-600 uppercase">
                {author?.name?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 truncate">
              {author?.name || 'Anonymous'}
            </span>
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-none mt-0.5">{dateStr}</span>
          </div>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-brand-accent shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
      </div>
      {/* Share Modal */}
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
        title={title}
      />
    </div>
  );
};

export default PostCard;
