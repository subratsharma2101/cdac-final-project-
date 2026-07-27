import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Skeleton,
} from "@mui/material";
import { Link } from "react-router-dom";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await api.get("/posts");
        setPosts(data);
      } catch (err) {
        console.log("could not fetch posts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <Box>
      {/* hero banner */}
      <Box
        sx={{
          background: "linear-gradient(90deg, #6d5bd0, #ec407a)",
          color: "white",
          py: 5,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom>
            Welcome to BlogApp
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Read public posts or write your own blog.
          </Typography>
          {!user && (
            <Button
              variant="contained"
              color="secondary"
              component={Link}
              to="/register"
              sx={{ mt: 2 }}
            >
              Get Started
            </Button>
          )}
        </Container>
      </Box>

      {/* posts grid */}
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Public Posts
        </Typography>

        {loading ? (
          <Grid container spacing={2}>
            {[0, 1, 2].map((i) => (
              <Grid item xs={12} key={i}>
                <Skeleton variant="rounded" height={140} />
              </Grid>
            ))}
          </Grid>
        ) : posts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }} variant="outlined">
            <Typography variant="h6" color="text.secondary">
              No public posts yet.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Be the first to share something!
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ mt: 2 }}>
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
