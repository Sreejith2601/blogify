const express = require("express");
const {
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
} = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuth");

const router = express.Router();

// Get all published posts
router.get("/", getAllPosts);

// Get following feed - protected route
router.get("/following", authMiddleware, getFollowingPosts);

// Create post - protected route
router.post("/", authMiddleware, createPost);

// Get posts by user (Optional auth to show drafts to owner)
router.get("/user/:id", optionalAuth, getPostsByUser);

// --- Metadata Management Routes ---
router.get("/meta/user", authMiddleware, getUserMetadata);
router.put("/meta/category/rename", authMiddleware, renameUserCategory);
router.delete("/meta/category/delete", authMiddleware, deleteUserCategory);
router.put("/meta/tag/rename", authMiddleware, renameUserTag);
router.delete("/meta/tag/delete", authMiddleware, deleteUserTag);

// Get post by id (Optional auth to allow owner to see drafts)
router.get("/:id", optionalAuth, getPostById);

// Update post - protected route
router.put("/:id", authMiddleware, updatePost);

// Delete post - protected route
router.delete("/:id", authMiddleware, deletePost);

// Like post (can be auth or not, let's use auth to track sender)
router.put("/:id/like", authMiddleware, likePost);

// Share post
router.put("/:id/share", sharePost);

module.exports = router;
