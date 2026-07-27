import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Button,
  Avatar,
} from "@mui/material";
import Comments from "./Comments";

// post ek card mein dikhata hai, author naam bhi (agar backend bhej raha hai)
export default function PostCard({ post, onEdit, onDelete }) {
  const authorName = post.author?.name;

  return (
    <Card
      sx={{
        mb: 2,
        transition: "0.2s",
        "&:hover": { boxShadow: 6 },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
            gap: 1,
          }}
        >
          <Typography variant="h6">{post.title}</Typography>
          {post.isPrivate ? (
            <Chip label="Private" size="small" color="warning" />
          ) : (
            <Chip label="Public" size="small" color="success" />
          )}
        </Box>

        <Typography
          variant="body2"
          sx={{ whiteSpace: "pre-wrap", mb: 2, color: "text.secondary" }}
        >
          {post.content}
        </Typography>

        {post.author && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: 12 }}>
              {authorName?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              by {authorName || "you"}
            </Typography>
          </Box>
        )}

        {(onEdit || onDelete) && (
          <Box sx={{ mt: 1 }}>
            {onEdit && (
              <Button size="small" onClick={() => onEdit(post)}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                size="small"
                color="error"
                onClick={() => onDelete(post._id)}
              >
                Delete
              </Button>
            )}
          </Box>
        )}

        {!post.isPrivate && <Comments postId={post._id} />}
      </CardContent>
    </Card>
  );
}
