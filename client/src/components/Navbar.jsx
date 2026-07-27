import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);

  const handleLogout = () => {
    logout();
    setAnchor(null);
    navigate("/");
  };

  const openMenu = (e) => setAnchor(e.currentTarget);
  const closeMenu = () => setAnchor(null);

  const links = (
    <>
      <Button color="inherit" component={Link} to="/" onClick={closeMenu}>
        Home
      </Button>
      {user ? (
        <>
          <Button
            color="inherit"
            component={Link}
            to="/dashboard"
            onClick={closeMenu}
          >
            Dashboard
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </>
      ) : (
        <>
          <Button color="inherit" component={Link} to="/login" onClick={closeMenu}>
            Login
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/register"
            onClick={closeMenu}
          >
            Register
          </Button>
        </>
      )}
    </>
  );

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(90deg, #6d5bd0, #ec407a)",
      }}
    >
      <Toolbar sx={{ justifyContent: "flex-end" }}>
        {user && (
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              mr: 2,
            }}
          >
            <Avatar sx={{ width: 28, height: 28, mr: 1, fontSize: 14 }}>
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        )}

        {/* desktop buttons */}
        <Box sx={{ display: { xs: "none", sm: "flex" } }}>{links}</Box>

        {/* mobile hamburger */}
        <Box sx={{ display: { xs: "block", sm: "none" } }}>
          <IconButton color="inherit" onClick={openMenu}>
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={closeMenu}>
            {user && (
              <MenuItem disabled>
                <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: 12 }}>
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
                {user.name}
              </MenuItem>
            )}
            {links}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
