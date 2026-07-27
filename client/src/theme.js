import { createTheme } from "@mui/material/styles";

// simple purple-ish theme for the blog app
const theme = createTheme({
  palette: {
    primary: {
      main: "#6d5bd0",
    },
    secondary: {
      main: "#ec407a",
    },
  },
  typography: {
    fontFamily: "Inter, Roboto, Arial, sans-serif",
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default theme;
