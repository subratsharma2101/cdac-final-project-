const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  addComment,
  getComments,
  deleteComment,
} = require("../controllers/commentController");
const protect = require("../middleware/auth");

// post ke andar comments ke routes
router.get("/:postId/comments", getComments);
router.post("/:postId/comments", protect, addComment);

// comment delete (apna hi)
router.delete("/comments/:id", protect, deleteComment);

module.exports = router;
