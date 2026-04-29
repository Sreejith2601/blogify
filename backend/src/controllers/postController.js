const Post = require("../models/Post");
const { createNotification } = require("./notificationController");

// CREATE POST
const createPost = async (req, res) => {
  try {
    const { title, content, categories, tags } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ message: "Missing required fields: title, content" });
    }

    // Create new post
    const post = await Post.create({
      title,
      content,
      author: req.user.id,
      categories: categories || [],
      tags: tags || [],
      isPublished: req.body.isPublished !== undefined ? req.body.isPublished : false
    });

    res.status(201).json({
      message: "Post created successfully",
      post,
    });

    // --- Broadcast Notification ---
    if (post.isPublished) {
      const User = require("../models/User");
      // Find all followers AND category subscribers
      const recipients = await User.find({
        $or: [
          { following: req.user.id },
          { subscribedCategories: { $in: post.categories } }
        ]
      }).select("_id");

      if (recipients.length > 0) {
        const notificationPromises = recipients.map(recipient => {
          if (recipient._id.toString() !== req.user.id.toString()) {
            return createNotification({
              recipient: recipient._id,
              sender: req.user.id,
              type: 'NEW_POST',
              post: post._id,
              message: `${req.user.name || 'An author you follow'} published a new story: ${post.title}`
            });
          }
          return null;
        }).filter(n => n);
        
        await Promise.all(notificationPromises);
      }
    }
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL POSTS
const getAllPosts = async (req, res) => {
  try {
    // Build filter object from query params
    const filter = { isPublished: true };

    // Add search filter if provided (searches title and content, case-insensitive)
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { content: { $regex: req.query.search, $options: "i" } }
      ];
    }

    // Add category filter if provided
    if (req.query.category) {
      filter.categories = req.query.category;
    }

    // Add tag filter if provided
    if (req.query.tag) {
      filter.tags = req.query.tag;
    }

    // Fetch posts with filters, populate author details, sort by newest first
    const posts = await Post.find(filter)
      .populate("author", "name email profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Posts retrieved successfully",
      posts,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET POST BY ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find post by id, populate author, and increment views
    const post = await Post.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("author", "name email profilePic");

    // Check if post exists
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Privacy Check for Drafts
    if (!post.isPublished) {
      const isAuthor = req.user && req.user.id.toString() === post.author._id.toString();
      if (!isAuthor) {
        return res.status(403).json({ message: "Post is a draft and not publicly accessible" });
      }
    }

    res.status(200).json({
      message: "Post retrieved successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE POST
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, categories, tags } = req.body;

    // Find post by id
    const post = await Post.findById(id);

    // Check if post exists
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update post fields
    if (title) post.title = title;
    if (content) post.content = content;
    if (categories) post.categories = categories;
    if (tags) post.tags = tags;
    if (req.body.isPublished !== undefined) post.isPublished = req.body.isPublished;

    // Save updated post
    await post.save();

    // Populate author and return
    await post.populate("author", "name email");

    res.status(200).json({
      message: "Post updated successfully",
      post,
    });

    // --- Broadcast Notification (if newly published) ---
    // Note: In a production app, we would check if it was previously NOT published
    if (post.isPublished) {
      const User = require("../models/User");
      const recipients = await User.find({
        $or: [
          { following: req.user.id },
          { subscribedCategories: { $in: post.categories } }
        ]
      }).select("_id");

      if (recipients.length > 0) {
        const notificationPromises = recipients.map(recipient => {
          if (recipient._id.toString() !== req.user.id.toString()) {
            return createNotification({
              recipient: recipient._id,
              sender: req.user.id,
              type: 'NEW_POST',
              post: post._id,
              message: `${post.author.name} published a new story: ${post.title}`
            });
          }
          return null;
        }).filter(n => n);
        
        await Promise.all(notificationPromises);
      }
    }
  } catch (error) {
    console.error("Update Post Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE POST
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    // Find post by id
    const post = await Post.findById(id);

    // Check if post exists
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete post
    await Post.findByIdAndDelete(id);

    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// LIKE / UNLIKE POST (Toggle — one like per user)
const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user already liked this post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likedBy.some(
      (likedUserId) => likedUserId.toString() === userId
    );

    let updatedPost;
    if (alreadyLiked) {
      // Unlike: remove user from likedBy
      updatedPost = await Post.findByIdAndUpdate(
        id,
        { $pull: { likedBy: userId } },
        { new: true }
      ).populate("author", "name email profilePic");

      return res.status(200).json({
        message: "Post unliked successfully",
        liked: false,
        likesCount: updatedPost.likedBy.length,
        post: updatedPost,
      });
    } else {
      // Like: add user to likedBy
      updatedPost = await Post.findByIdAndUpdate(
        id,
        { $addToSet: { likedBy: userId } },
        { new: true }
      ).populate("author", "name email profilePic");

      // Trigger notification only on new like
      if (req.user) {
        await createNotification({
          recipient: updatedPost.author._id.toString(),
          sender: req.user.id,
          type: 'LIKE',
          post: updatedPost._id,
          message: `${req.user.name || 'Someone'} liked your post`
        });
      }

      return res.status(200).json({
        message: "Post liked successfully",
        liked: true,
        likesCount: updatedPost.likedBy.length,
        post: updatedPost,
      });
    }
  } catch (error) {
    console.error("Like/Unlike Post Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// SHARE POST
const sharePost = async (req, res) => {
  try {
    const { id } = req.params;

    // Find post and increment shares
    const post = await Post.findByIdAndUpdate(
      id,
      { $inc: { shares: 1 } },
      { new: true }
    ).populate("author", "name email profilePic");

    // Check if post exists
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
      message: "Post shared successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET POST ANALYTICS
const getPostAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    // Find post and get analytics fields
    const post = await Post.findById(id).select("views likes shares commentsCount");

    // Check if post exists
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
      message: "Analytics retrieved successfully",
      analytics: {
        views: post.views,
        likes: post.likes,
        shares: post.shares,
        commentsCount: post.commentsCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET POSTS BY USER
const getPostsByUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const isOwner = req.user && req.user.id.toString() === userId.toString();

    // Filter logic: If owner, show all. If not, show only published.
    const filter = { author: userId };
    if (!isOwner) {
      filter.isPublished = true;
    }

    // Find posts, populate author, sort by newest first
    const posts = await Post.find(filter)
      .populate("author", "name email profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Posts retrieved successfully",
      posts,
    });
  } catch (error) {
    console.error("Get posts by user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUBLISH POST (Toggle)
const publishPost = async (req, res) => {
  try {
    const { id } = req.params;

    // Find post by id
    const post = await Post.findById(id);

    // Check if post exists
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to publish this post" });
    }

    // Toggle publish status
    post.isPublished = !post.isPublished;

    // Save updated post
    const updatedPost = await post.save();

    res.status(200).json({
      message: `Post ${updatedPost.isPublished ? "published" : "unpublished"} successfully`,
      isPublished: updatedPost.isPublished,
    });
  } catch (error) {
    console.error("Publish post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// GET USER CATEGORIES AND TAGS
const getUserMetadata = async (req, res) => {
  try {
    const userId = req.user.id;
    const posts = await Post.find({ author: userId });
    
    const categories = [...new Set(posts.flatMap(p => p.categories))];
    const tags = [...new Set(posts.flatMap(p => p.tags))];

    res.status(200).json({ categories, tags });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// RENAME USER CATEGORY (Bulk)
const renameUserCategory = async (req, res) => {
  try {
    const { oldCategory, newCategory } = req.body;
    const userId = req.user.id;

    if (!oldCategory || !newCategory) {
      return res.status(400).json({ message: "Both old and new category names are required" });
    }

    // Update all posts of this user that contain the old category
    await Post.updateMany(
      { author: userId, categories: oldCategory },
      { $set: { "categories.$": newCategory } }
    );

    res.status(200).json({ message: "Category renamed successfully across your posts" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE USER CATEGORY (Bulk)
const deleteUserCategory = async (req, res) => {
  try {
    const { category } = req.body;
    const userId = req.user.id;

    await Post.updateMany(
      { author: userId },
      { $pull: { categories: category } }
    );

    res.status(200).json({ message: "Category deleted successfully from your posts" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// RENAME USER TAG (Bulk)
const renameUserTag = async (req, res) => {
  try {
    const { oldTag, newTag } = req.body;
    const userId = req.user.id;

    if (!oldTag || !newTag) {
      return res.status(400).json({ message: "Both old and new tag names are required" });
    }

    await Post.updateMany(
      { author: userId, tags: oldTag },
      { $set: { "tags.$": newTag } }
    );

    res.status(200).json({ message: "Tag renamed successfully across your posts" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE USER TAG (Bulk)
const deleteUserTag = async (req, res) => {
  try {
    const { tag } = req.body;
    const userId = req.user.id;

    await Post.updateMany(
      { author: userId },
      { $pull: { tags: tag } }
    );

    res.status(200).json({ message: "Tag deleted successfully from your posts" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET FOLLOWING FEED
const getFollowingPosts = async (req, res) => {
  try {
    const User = require("../models/User");
    const currentUser = await User.findById(req.user.id);
    
    if (!currentUser || !currentUser.following || currentUser.following.length === 0) {
      return res.status(200).json({
        message: "No following found",
        posts: []
      });
    }

    // Find posts by authors in the following list
    const posts = await Post.find({
      author: { $in: currentUser.following },
      isPublished: true
    })
    .populate("author", "name email profilePic")
    .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Following feed retrieved successfully",
      posts
    });
  } catch (error) {
    console.error("Get following posts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  sharePost,
  getPostAnalytics,
  getPostsByUser,
  publishPost,
  getUserMetadata,
  renameUserCategory,
  deleteUserCategory,
  renameUserTag,
  deleteUserTag,
  getFollowingPosts,
};
