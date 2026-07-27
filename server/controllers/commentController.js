const Comment = require("../models/Comment");
const Post = require("../models/Post");

// ek post pe naya comment add karo (protected)
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    if (!content) {
      return res.status(400).json({ message: "Comment content required" });
    }

    // post exist karti hai ya nahi check karo
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // comments sirf public posts pe allowed hain
    if (post.isPrivate) {
      return res
        .status(403)
        .json({ message: "Comments are only allowed on public posts" });
    }

    const comment = await Comment.create({
      content,
      author: req.userId,
      post: postId,
    });

    // response mein author ka naam bhi bhej do (UI ke liye easy)
    const populated = await comment.populate("author", "name");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// post ke saare comments lao (public, lekin private post pe sirf owner ko)
const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // agar post private hai aur requester owner nahi hai to block
    if (post.isPrivate) {
      // user header se token nikal lo (protect middleware use nahi ki yaha
      // taaki bina login wale ko bhi properly handle kar sakein)
      const authHeader = req.headers.authorization;
      let requesterId = null;
      if (authHeader && authHeader.startsWith("Bearer")) {
        try {
          const jwt = require("jsonwebtoken");
          const decoded = jwt.verify(
            authHeader.split(" ")[1],
            process.env.JWT_SECRET
          );
          requesterId = decoded.id;
        } catch (e) {
          // token invalid — treat as anonymous
        }
      }

      if (post.author.toString() !== requesterId) {
        return res.status(403).json({ message: "Not allowed to see these comments" });
      }
    }

    const comments = await Comment.find({ post: postId })
      .populate("author", "name")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// apna comment delete karo (protected)
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only delete your own comment" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addComment, getComments, deleteComment };
