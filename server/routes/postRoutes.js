const express = require("express");
const router = express.Router();
const {
  createPost,
  getPublicPosts,
  getMyPosts,
} = require("../controllers/postController");
const protect = require("../middleware/auth");

router.get("/", getPublicPosts);

router.get("/dashboard", protect, getMyPosts);

router.post("/", protect, createPost);

module.exports = router;
