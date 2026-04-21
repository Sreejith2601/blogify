const express = require("express");
const { addComment, getComments, updateComment, deleteComment, likeComment } = require("../controllers/commentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get comments for a post
router.get("/:id", getComments);

// Add comment to a post - protected route
router.post("/:id", authMiddleware, addComment);

// Update comment - protected route
router.put("/edit/:id", authMiddleware, updateComment);

// Delete comment - protected route
router.delete("/delete/:id", authMiddleware, deleteComment);

// Like/Unlike comment - protected route
router.post("/like/:id", authMiddleware, likeComment);

module.exports = router;
