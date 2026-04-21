const User = require("../models/user");
const { createNotification } = require("./notificationController");

// UPDATE USER PROFILE
const updateUserProfile = async (req, res) => {
  try {
    const { name, bio, profilePic, socialLinks } = req.body;
    const userId = req.user.id;

    // Find user by id
    const user = await User.findById(userId);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update only provided fields
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profilePic !== undefined) user.profilePic = profilePic;
    if (socialLinks !== undefined) user.socialLinks = socialLinks;

    // Save updated user
    const updatedUser = await user.save();

    // Remove password from response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "Profile updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// FOLLOW USER
const followUser = async (req, res) => {
  try {
    const { id: targetId } = req.params;
    const currentUserId = req.user.id;

    // Prevent following self
    if (targetId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Find target user
    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already following
    if (targetUser.followers.includes(currentUserId)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Add target to following list of current user
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: targetId },
    });

    // Add current user to followers list of target user
    await User.findByIdAndUpdate(targetId, {
      $addToSet: { followers: currentUserId },
    });

    // Trigger notification
    await createNotification({
      recipient: targetId,
      sender: currentUserId,
      type: 'FOLLOW',
      message: `${req.user.name || 'Someone'} started tracking your signals`
    });

    res.status(200).json({ message: "User followed successfully" });
  } catch (error) {
    console.error("Follow user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UNFOLLOW USER
const unfollowUser = async (req, res) => {
  try {
    const { id: targetId } = req.params;
    const currentUserId = req.user.id;

    // Remove target from following list of current user
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetId },
    });

    // Remove current user from followers list of target user
    await User.findByIdAndUpdate(targetId, {
      $pull: { followers: currentUserId },
    });

    res.status(200).json({ message: "User unfollowed successfully" });
  } catch (error) {
    console.error("Unfollow user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET CURRENT USER PROFILE
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET USER BY ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Check if the current user (if any) is following this user (Optional, managed by frontend usually)
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET USER ANALYTICS
const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const Post = require("../models/Post");
    const posts = await Post.find({ author: userId }).sort({ createdAt: -1 });
    
    let likes = 0, views = 0, shares = 0, comments = 0;
    const postStats = posts.map(post => {
      const postLikes = post.likedBy?.length || 0;
      likes += postLikes;
      views += post.views || 0;
      shares += post.shares || 0;
      comments += post.commentsCount || 0;
      
      return {
        _id: post._id,
        title: post.title,
        views: post.views || 0,
        likes: postLikes,
        shares: post.shares || 0,
        comments: post.commentsCount || 0,
        createdAt: post.createdAt
      };
    });

    res.status(200).json({ 
      analytics: { 
        totals: { likes, views, shares, comments },
        posts: postStats 
      } 
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// TOGGLE CATEGORY SUBSCRIPTION
const toggleCategorySubscription = async (req, res) => {
  try {
    const { category } = req.body;
    const userId = req.user.id;

    if (!category) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.subscribedCategories.indexOf(category);
    if (index === -1) {
      // Subscribe
      user.subscribedCategories.push(category);
      await user.save();
      res.status(200).json({ 
        message: `Subscribed to ${category}`, 
        subscribed: true,
        categories: user.subscribedCategories 
      });
    } else {
      // Unsubscribe
      user.subscribedCategories.splice(index, 1);
      await user.save();
      res.status(200).json({ 
        message: `Unsubscribed from ${category}`, 
        subscribed: false,
        categories: user.subscribedCategories 
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// TOGGLE SAVE POST
const toggleSavePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const postIndex = user.savedPosts.indexOf(postId);
    if (postIndex === -1) {
      // Save post
      user.savedPosts.push(postId);
      await user.save();
      res.status(200).json({ 
        message: "Post saved successfully", 
        saved: true,
        savedPosts: user.savedPosts 
      });
    } else {
      // Unsave post
      user.savedPosts.splice(postIndex, 1);
      await user.save();
      res.status(200).json({ 
        message: "Post removed from saved", 
        saved: false,
        savedPosts: user.savedPosts 
      });
    }
  } catch (error) {
    console.error("Toggle Save Post Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET SAVED POSTS
const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate({
      path: 'savedPosts',
      populate: {
        path: 'author',
        select: 'name profilePic email'
      },
      options: { sort: { createdAt: -1 } }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ 
      message: "Saved posts retrieved successfully",
      posts: user.savedPosts 
    });
  } catch (error) {
    console.error("Get Saved Posts Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { 
  updateUserProfile, 
  followUser, 
  unfollowUser, 
  getUserProfile, 
  getUserById, 
  getUserAnalytics,
  toggleCategorySubscription,
  toggleSavePost,
  getSavedPosts
};
