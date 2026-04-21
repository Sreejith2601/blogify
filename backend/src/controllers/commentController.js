const Comment = require("../models/Comment");
const Post = require("../models/Post");
const { createNotification } = require("./notificationController");

// ADD COMMENT / REPLY
const addComment = async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;
    const { id: postId } = req.params;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    // Create comment
    const comment = await Comment.create({
      content,
      post: postId,
      user: req.user.id,
      parentComment: parentCommentId || null,
    });

    // Increment commentsCount in post (only for top-level if you want, but usually for all)
    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { commentsCount: 1 } }
    );

    // Notification Logic
    if (parentCommentId) {
      // It's a reply -> notify the parent comment's author
      const parentComment = await Comment.findById(parentCommentId);
      if (parentComment && parentComment.user.toString() !== req.user.id) {
        await createNotification({
          recipient: parentComment.user.toString(),
          sender: req.user.id,
          type: 'COMMENT',
          post: postId,
          message: `${req.user.name} replied to your thought: "${parentComment.content.substring(0, 30)}..."`
        });
      }
    } else if (post && post.author.toString() !== req.user.id) {
      // It's a top-level comment -> notify post author
      await createNotification({
        recipient: post.author.toString(),
        sender: req.user.id,
        type: 'COMMENT',
        post: postId,
        message: `${req.user.name} shared a thought on your story: "${content.substring(0, 30)}..."`
      });
    }

    // Populate user info for the new comment
    await comment.populate("user", "name profilePic");

    res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.error('Add Comment Error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL COMMENTS FOR A POST
const getComments = async (req, res) => {
  try {
    const { id: postId } = req.params;

    // Fetch all comments and populate user info
    const allComments = await Comment.find({ post: postId })
      .populate("user", "name profilePic")
      .sort({ createdAt: -1 });

    // Group into Parent -> Replies for easier frontend display (Optional but helpful)
    // For now, let's just return the flat list and let the frontend handle it
    res.status(200).json({
      message: "Comments retrieved",
      comments: allComments,
    });
  } catch (error) {
    console.error('getComments error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// LIKE / UNLIKE COMMENT
const likeComment = async (req, res) => {
  try {
    const { id: commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isLiked = comment.likedBy.includes(userId);
    
    if (isLiked) {
      // Unlike
      comment.likedBy = comment.likedBy.filter(id => id.toString() !== userId);
    } else {
      // Like
      comment.likedBy.push(userId);
      
      // Notify comment author if it's not their own like
      if (comment.user.toString() !== userId) {
        await createNotification({
          recipient: comment.user.toString(),
          sender: userId,
          type: 'LIKE',
          post: comment.post,
          message: `${req.user.name} tipped your thought.`
        });
      }
    }

    await comment.save();
    res.status(200).json({ 
      message: isLiked ? "Unliked" : "Liked", 
      likedBy: comment.likedBy 
    });
  } catch (error) {
    console.error('getComments error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE COMMENT
const updateComment = async (req, res) => {
  try {
    const { id: commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.content = content;
    await comment.save();
    await comment.populate("user", "name profilePic");

    res.status(200).json({ message: "Comment updated", comment });
  } catch (error) {
    console.error('getComments error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE COMMENT
const deleteComment = async (req, res) => {
  try {
    const { id: commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Strictly check if user is the author of the post
    const post = await Post.findById(comment.post);
    if (!post || post.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only the post owner can delete comments for their posts" });
    }

    const postId = comment.post;
    
    // If it's a parent comment, we might want to delete children too
    if (!comment.parentComment) {
      const repliesCount = await Comment.countDocuments({ parentComment: commentId });
      await Comment.deleteMany({ parentComment: commentId });
      await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: -(repliesCount + 1) } });
    } else {
      await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: -1 } });
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({ message: "Comment removed" });
  } catch (error) {
    console.error('getComments error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addComment, getComments, updateComment, deleteComment, likeComment };
