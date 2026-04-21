const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const upload = require("./middleware/uploadMiddleware");
const path = require("path");

const app = express();

// Required for Render/Cloud hosting to correctly detect 'https'
app.set('trust proxy', 1);

// middleware
app.use(cors());
app.use(express.json());

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

// File Upload Route
app.post("/api/upload", authMiddleware, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  // Return relative path for portability across environments
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ url: fileUrl });
});

// Protected route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "Protected route accessed" });
});

// test route
app.get("/", (req, res) => {
  res.send("API is working 🚀");
});

module.exports = app;