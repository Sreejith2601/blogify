const express = require("express");
const { 
  updateUserProfile, 
  followUser, 
  unfollowUser, 
  getUserProfile, 
  getUserById, 
  getUserAnalytics,
  toggleCategorySubscription,
  toggleSavePost,
  getSavedPosts 
} = require("../controllers/userController");
const { getPostsByUser } = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuth");

const router = express.Router();

// Get current user profile - protected route
router.get("/profile", authMiddleware, getUserProfile);

// Update user profile - protected route
router.put("/profile", authMiddleware, updateUserProfile);

// Get user analytics
router.get("/analytics", authMiddleware, getUserAnalytics);

// Follow user - protected route
router.post("/:id/follow", authMiddleware, followUser);

// Unfollow user - protected route
router.post("/:id/unfollow", authMiddleware, unfollowUser);

// Subscribe to category - protected route
router.post("/subscribe-category", authMiddleware, toggleCategorySubscription);

// Get specific user by id
router.get("/:id", getUserById);

// Get all posts by a specific user - public route (optional auth to show drafts to owner)
router.get("/:id/posts", optionalAuth, getPostsByUser);

// Save/Unsave post - protected route
router.post("/save/:id", authMiddleware, toggleSavePost);

// Get saved posts - protected route
router.get("/saved/all", authMiddleware, getSavedPosts);

module.exports = router;
