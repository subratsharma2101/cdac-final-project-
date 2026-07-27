import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Checkbox,
  FormControlLabel,
  Alert,
  Chip,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import api from "../api/axios";
import PostCard from "../components/PostCard";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get("/posts/dashboard");
      setPosts(data);
    } catch (err) {
      console.log("could not load your posts", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setIsPrivate(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        const { data } = await api.put(`/posts/${editingId}`, {
          title,
          content,
          isPrivate,
        });
        setPosts((prev) =>
          prev.map((p) => (p._id === data._id ? data : p))
        );
      } else {
        const { data } = await api.post("/posts", {
          title,
          content,
          isPrivate,
        });
        setPosts((prev) => [data, ...prev]);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save post");
    }
  };

  const handleEdit = (post) => {
    setTitle(post.title);
    setContent(post.content);
    setIsPrivate(post.isPrivate);
    setEditingId(post._id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/posts/${id}`);
      // list se turant hata do -> instant UI update
      setPosts((prev) => prev.filter((p) => p._id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError("Could not delete post");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          My Dashboard
        </Typography>
        <Chip label={`${posts.length} posts`} color="primary" />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* create / edit form */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, position: "sticky", top: 16 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              {editingId ? (
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
              ) : (
                <AddIcon fontSize="small" sx={{ mr: 1 }} />
              )}
              <Typography variant="h6">
                {editingId ? "Edit Post" : "Create New Post"}
              </Typography>
            </Box>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Title"
                margin="normal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Content"
                margin="normal"
                multiline
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                  />
                }
                label="Make this post private"
              />
              <Box sx={{ mt: 2 }}>
                <Button type="submit" variant="contained">
                  {editingId ? "Update" : "Add Post"}
                </Button>
                {editingId && (
                  <Button sx={{ ml: 1 }} onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* my posts list */}
        <Grid item xs={12} md={7}>
          <Typography variant="h6" gutterBottom>
            My Posts
          </Typography>
          {posts.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary">
                You have no posts yet. Create one!
              </Typography>
            </Paper>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
