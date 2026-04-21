import { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import postService from '../services/postService';
import commentService from '../services/commentService';
import { AuthContext } from '../context/AuthContext';
import userService from '../services/userService';
import toast from 'react-hot-toast';
import ShareModal from '../components/ShareModal';

const Post = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [commentInput, setCommentInput] = useState('');
  const { user: currentUser, refreshUser } = useContext(AuthContext);
  const [submitting, setSubmitting] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const fetchPostData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [postData, commentData] = await Promise.all([
          postService.getPostById(id),
          commentService.getCommentsByPostId(id)
        ]);
        
        setPost(postData.post || postData); 
        setComments(commentData.comments || commentData || []);
        
        // Scroll to discussion if hash exists
        if (window.location.hash === '#discussion') {
          setTimeout(() => {
            const el = document.getElementById('discussion');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 500);
        }
      } catch (err) {
        console.error('Error fetching post details:', err);
        setError(err.message || 'Failed to load post data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPostData();
  }, [id]);

  const handleLike = async () => {
    // Optimistic update for likes array if exists, or count
    const userId = currentUser?._id;
    if (!userId) {
      toast.error('Sign in to like');
      return;
    }

    const isLiked = post.likedBy?.includes(userId);
    setPost(prev => ({
      ...prev,
      likedBy: isLiked 
        ? prev.likedBy.filter(id => id !== userId)
        : [...(prev.likedBy || []), userId]
    }));

    try {
      await postService.likePost(id);
    } catch (err) {
      console.error('Failed to like post:', err);
      // Revert if error
      setPost(prev => ({
        ...prev,
        likedBy: isLiked 
          ? [...(prev.likedBy || []), userId]
          : prev.likedBy.filter(id => id !== userId)
      }));
    }
  };

  const handleShare = async () => {
    setIsShareModalOpen(true);
    try {
      await postService.sharePost(id);
    } catch (err) {
      console.error('Failed to update share count:', err);
    }
  };

  const [replyingTo, setReplyingTo] = useState(null); // { id, name }
  const [expandedReplies, setExpandedReplies] = useState([]); // Array of parent comment IDs

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || !currentUser) return;
    
    setSubmitting(true);
    try {
      const payload = { 
        content: commentInput,
        parentCommentId: replyingTo?.id || null 
      };
      const response = await commentService.addComment(id, payload);
      const newComment = response.comment || response; 
      
      setComments(prev => [newComment, ...prev]);
      setCommentInput('');
      setReplyingTo(null);
      
      if (payload.parentCommentId) {
        setExpandedReplies(prev => [...new Set([...prev, payload.parentCommentId])]);
      }
      
      toast.success(payload.parentCommentId ? 'Reply posted' : 'Comment posted');
    } catch (err) {
      console.error('Failed to add comment:', err);
      toast.error(err.message || 'Error adding comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!currentUser) return toast.error('Sign in to like');
    
    // Optimistic update
    setComments(prev => prev.map(c => {
      if (c._id === commentId) {
        const isLiked = c.likedBy?.includes(currentUser._id);
        return {
          ...c,
          likedBy: isLiked 
            ? c.likedBy.filter(uid => uid !== currentUser._id)
            : [...(c.likedBy || []), currentUser._id]
        };
      }
      return c;
    }));

    try {
      await commentService.likeComment(commentId);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) return;
    try {
      await postService.deletePost(id);
      toast.success('Story deleted');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Error deleting story');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    
    try {
      await commentService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c._id !== commentId));
      toast.success('Comment removed');
    } catch (err) {
      console.error('Failed to delete comment:', err);
      toast.error(err.message || 'Error deleting comment');
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId) 
        : [...prev, commentId]
    );
  };

  const startReply = (comment) => {
    setReplyingTo({ id: comment._id, name: comment.user?.name });
    setCommentInput(''); // or maybe just scroll to input
    document.getElementById('comment-textarea')?.focus();
  };

  // Helper to separate top-level comments and replies
  const topLevelComments = comments.filter(c => !c.parentComment);
  const getReplies = (parentId) => comments.filter(c => c.parentComment === parentId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const handleFollow = async () => {
    if (!currentUser) return toast.error('Sign in to follow');
    setFollowLoading(true);
    try {
      if (isAuthorFollowing) {
        await userService.unfollowUser(postAuthorId);
        toast.success('Unfollowed');
      } else {
        await userService.followUser(postAuthorId);
        toast.success('Following');
      }
      await refreshUser();
    } catch (err) {
      toast.error('Follow failed');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-brand-bg min-h-screen py-24">
        <div className="max-w-3xl mx-auto px-6 animate-pulse">
          <div className="h-4 bg-white/5 rounded w-24 mb-6"></div>
          <div className="h-16 bg-white/5 rounded w-full mb-10"></div>
          <div className="flex gap-6 mb-20">
            <div className="w-14 h-14 bg-white/5 rounded-full"></div>
            <div className="space-y-4">
              <div className="h-4 bg-white/5 rounded w-48"></div>
              <div className="h-3 bg-white/5 rounded w-32"></div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="h-5 bg-white/5 rounded w-full"></div>
            <div className="h-5 bg-white/5 rounded w-full"></div>
            <div className="h-5 bg-white/5 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Post Not Found</h2>
          <p className="text-gray-500 mb-8">{error || "The story you're looking for doesn't exist."}</p>
          <Link to="/" className="inline-block px-8 py-3 bg-gray-900 text-white rounded-lg font-bold text-xs tracking-widest">
            BACK TO HOME
          </Link>
        </div>
      </div>
    );
  }

  const postAuthorId = post.author?._id || post.author;
  const isAuthorFollowing = currentUser?.following?.includes(postAuthorId);

  return (
    <div className="bg-brand-bg min-h-screen text-zinc-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        
        {/* Post Article Section */}
        <article className="mb-24 sm:mb-32">
          <header className="mb-14 sm:mb-16 text-center sm:text-left">
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-8 sm:mb-10">
              {post.categories?.map((cat, idx) => (
                <span key={idx} className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-4 py-1.5 rounded-full">
                  {cat}
                </span>
              ))}
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.1] tracking-tighter mb-10">
              {post.title}.
            </h1>

            <div className="flex flex-col sm:flex-row items-center justify-between py-10 border-y border-white/5 mb-14 gap-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-zinc-900 border border-white/5 rounded-full flex items-center justify-center overflow-hidden">
                  {post.author?.profilePic ? (
                    <img src={post.author.profilePic} alt={post.author.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-zinc-500 font-bold text-lg">{post.author?.name?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-4">
                    <p className="text-base font-black text-white">{post.author?.name || 'Anonymous'}</p>
                    
                    {currentUser && currentUser._id !== postAuthorId && (
                      <button 
                        onClick={handleFollow}
                        disabled={followLoading}
                        className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border transition-all ${
                          isAuthorFollowing
                          ? 'border-white/5 text-zinc-500 hover:text-red-500'
                          : 'border-white text-zinc-950 bg-white hover:bg-transparent hover:text-white'
                        }`}
                      >
                        {followLoading ? '...' : isAuthorFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}

                    {currentUser && currentUser._id === postAuthorId && (
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/edit/${id}`}
                          className="bg-white/5 border border-white/10 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                          Edit Story
                        </Link>
                        <button 
                          onClick={handleDeletePost}
                          className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mt-1">
                    {new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleLike} 
                  className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border transition-all ${
                    post.likedBy?.includes(currentUser?._id)
                    ? 'border-brand-accent/20 bg-brand-accent/5 text-brand-accent'
                    : 'border-white/5 text-zinc-600 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <svg className={`w-5 h-5 ${post.likedBy?.includes(currentUser?._id) ? 'fill-current' : 'fill-none'}`} stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-sm font-black">{post.likedBy?.length || 0}</span>
                </button>
                
                <button onClick={handleShare} className="p-3 text-zinc-600 hover:text-white hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5" title="Copy Link">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </div>
          </header>

          <div 
            id="post-content"
            className="prose prose-invert max-w-none text-zinc-400 leading-[1.8] text-lg sm:text-xl
                       prose-h2:text-white prose-h2:tracking-tighter prose-h2:font-black prose-h2:mt-16 prose-h2:mb-8
                       prose-p:mb-10 prose-strong:text-white prose-a:text-brand-accent prose-a:font-black
                       prose-img:rounded-[2.5rem] prose-img:block prose-img:mx-auto prose-img:shadow-2xl prose-img:border prose-img:border-white/5"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Discussion Section */}
        <section id="discussion" className="pt-20 border-t border-white/5 scroll-mt-24">
          <h3 className="text-3xl font-black text-white tracking-tighter mb-12">Discussion ({comments.length})</h3>

          {currentUser ? (
            <form onSubmit={handleAddComment} className="mb-20">
              {replyingTo && (
                <div className="flex items-center justify-between px-6 py-3 bg-white/5 rounded-t-[2rem] border-t border-x border-white/5">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                    Replying to <span className="text-brand-accent">@{replyingTo.name}</span>
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setReplyingTo(null)}
                    className="text-[10px] font-black text-zinc-600 hover:text-red-400 transition-colors uppercase tracking-[0.2em]"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <textarea
                id="comment-textarea"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={replyingTo ? `Write a reply...` : "Capture your thoughts..."}
                className={`w-full bg-white/2 border border-white/10 text-white p-8 focus:border-brand-accent outline-none transition-all min-h-[160px] placeholder-zinc-700 text-base shadow-2xl ${replyingTo ? 'rounded-b-[2rem]' : 'rounded-[2rem] mb-6'}`}
              />
              <div className={`flex justify-end ${replyingTo ? 'mt-6' : ''}`}>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-10 py-4 bg-brand-accent text-zinc-950 font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-brand-accent-hover transition-all shadow-xl shadow-brand-accent/20 disabled:opacity-50"
                >
                  {submitting ? 'Streaming...' : replyingTo ? 'Post Reply' : 'Publish Comment'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-20 p-12 bg-white/2 rounded-[2.5rem] text-center border border-white/5">
              <p className="text-zinc-500 font-bold mb-8 uppercase tracking-[0.2em] text-xs">Join the network to share your perspective.</p>
              <Link to="/login" className="inline-block px-10 py-4 bg-white text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all shadow-xl">
                Sign In to Comment
              </Link>
            </div>
          )}

          <div className="space-y-10">
            {topLevelComments.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-300">No comments yet. Start the discussion.</p>
              </div>
            ) : (
              topLevelComments.map((comment) => (
                <div key={comment._id} className="group">
                  {/* Top Level Comment */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {comment.user?.profilePic ? (
                        <img src={comment.user.profilePic} alt={comment.user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 font-bold text-xs">{comment.user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{comment.user?.name}</span>
                          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                            {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleLikeComment(comment._id)}
                          className={`p-1 transition-colors ${comment.likedBy?.includes(currentUser?._id) ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
                        >
                          <svg className={`w-3.5 h-3.5 ${comment.likedBy?.includes(currentUser?._id) ? 'fill-current' : 'fill-none'}`} stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap mb-2">{comment.content}</p>
                      
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => startReply(comment)} 
                          className="text-[10px] font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
                        >
                          Reply
                        </button>
                        {comment.likedBy?.length > 0 && (
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{comment.likedBy.length} likes</span>
                        )}
                        {(currentUser?._id === postAuthorId) && (
                          <button 
                            onClick={() => handleDeleteComment(comment._id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-gray-300 hover:text-red-500 uppercase tracking-widest"
                          >
                            Delete
                          </button>
                        )}
                      </div>

                      {/* Replies Toggle */}
                      {getReplies(comment._id).length > 0 && (
                        <div className="mt-4 ml-2">
                          <button 
                            onClick={() => toggleReplies(comment._id)}
                            className="flex items-center gap-3 group/btn"
                          >
                            <div className="w-8 h-[1px] bg-gray-200 group-hover/btn:bg-gray-400 transition-colors"></div>
                            <span className="text-[10px] font-bold text-gray-400 group-hover/btn:text-gray-600 transition-colors uppercase tracking-[0.1em]">
                              {expandedReplies.includes(comment._id) ? 'Hide replies' : `View ${getReplies(comment._id).length} ${getReplies(comment._id).length === 1 ? 'reply' : 'replies'}`}
                            </span>
                          </button>

                          {expandedReplies.includes(comment._id) && (
                            <div className="mt-4 space-y-6 pl-4 border-l-2 border-gray-50 ml-1">
                              {getReplies(comment._id).map(reply => (
                                <div key={reply._id} className="group/reply flex gap-3">
                                  <div className="w-7 h-7 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 mt-1">
                                    {reply.user?.profilePic ? (
                                      <img src={reply.user.profilePic} alt={reply.user.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-gray-400 font-bold text-[9px]">{reply.user?.name?.charAt(0).toUpperCase()}</span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-900">{reply.user?.name}</span>
                                        <span className="text-[9px] text-gray-400 font-medium uppercase">
                                          {new Date(reply.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                      </div>
                                      <button 
                                        onClick={() => handleLikeComment(reply._id)}
                                        className={`transition-colors ${reply.likedBy?.includes(currentUser?._id) ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
                                      >
                                        <svg className={`w-3 h-3 ${reply.likedBy?.includes(currentUser?._id) ? 'fill-current' : 'fill-none'}`} stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                      </button>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-1.5">{reply.content}</p>
                                    <div className="flex items-center gap-4">
                                      <button 
                                        onClick={() => startReply(comment)} 
                                        className="text-[9px] font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest"
                                      >
                                        Reply
                                      </button>
                                      {(currentUser?._id === postAuthorId) && (
                                        <button 
                                          onClick={() => handleDeleteComment(reply._id)}
                                          className="opacity-0 group-hover/reply:opacity-100 transition-opacity text-[9px] font-bold text-gray-300 hover:text-red-500 uppercase tracking-widest"
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
      {/* Share Modal */}
      {post && (
        <ShareModal 
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          shareUrl={window.location.href}
          title={post.title}
        />
      )}
    </div>
  );
};

export default Post;
