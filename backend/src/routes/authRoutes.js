const express = require("express");
const { registerUser, loginUser, forgotPassword, resetPassword, changePassword } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/change-password", authMiddleware, changePassword);

// Protected route - requires valid token
router.get("/protected", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Protected route accessed",
    userId: req.user.id,
  });
});

module.exports = router;