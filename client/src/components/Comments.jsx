import { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Divider,
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import CommentIcon from "@mui/icons-material/Comment";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Comments({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/posts/${postId}/comments`);
      setComments(data);
    } catch (err) {
      // private post pe anonymous ho to 403 aata hai — silently ignore
      console.log("could not load comments", err);
    }
  };

  useEffect(() => {
    if (open) fetchComments();
  }, [open]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    if (!text.trim()) return;
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, {
        content: text,
      });
      setComments((prev) => [...prev, data]);
      setText("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not post comment");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/posts/comments/${id}`);
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError("Could not delete comment");
    }
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Button
        size="small"
        startIcon={<CommentIcon />}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "Hide" : "Show"} Comments ({comments.length})
      </Button>

      {open && (
        <Box sx={{ pl: 1, mt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          )}

          {/* comment list */}
          {comments.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              No comments yet.
            </Typography>
          ) : (
            comments.map((c) => (
              <Box
                key={c._id}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  mb: 1,
                  gap: 1,
                }}
              >
                <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                  {c.author?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {c.author?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {c.content}
                  </Typography>
                </Box>
                {user && c.author && user._id === c.author._id && (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(c._id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </Button>
                )}
              </Box>
            ))
          )}

          {/* add comment — sirf logged-in user ke liye */}
          {user ? (
            <>
              <Divider sx={{ my: 1 }} />
              <Box component="form" onSubmit={handleAdd}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Write a comment..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  multiline
                  maxRows={3}
                />
                <Button
                  type="submit"
                  size="small"
                  variant="contained"
                  endIcon={<SendIcon />}
                  sx={{ mt: 1 }}
                  disabled={!text.trim()}
                >
                  Post
                </Button>
              </Box>
            </>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Login to add a comment.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
