const express = require("express");
const router = express.Router();
const {
  createPost,
  getPublicPosts,
  getMyPosts,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const protect = require("../middleware/auth");

router.get("/", getPublicPosts);

router.get("/dashboard", protect, getMyPosts);

router.post("/", protect, createPost);

router.put("/:id", protect, updatePost);

router.delete("/:id", protect, deletePost);

module.exports = router;
