const Post = require("../models/Post");

const createPost = async (req, res) => {
  try {
    const { title, content, isPrivate } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content required" });
    }

    const post = await Post.create({
      title,
      content,
      isPrivate: isPrivate || false,
      author: req.userId,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getPublicPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isPrivate: false })
      .populate("author", "name")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createPost, getPublicPosts, getMyPosts };
