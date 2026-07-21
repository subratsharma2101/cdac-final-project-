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
      isPrivate: Boolean(isPrivate),
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

const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only edit your own post" });
    }

    const { title, content, isPrivate } = req.body;
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (isPrivate !== undefined) post.isPrivate = Boolean(isPrivate);

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only delete your own post" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createPost, getPublicPosts, getMyPosts, updatePost, deletePost };
