import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: '"Public Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontWeight: 600, color: "#003366" },
    body1: { fontWeight: 400, color: "#003366" }, // Deep Navy for primary reading
  },
  palette: {
    primary: {
      main: "#007BFF", // Bright Blue (Actions/Buttons)
      light: "#E3F2FD", // Pale Blue (Highlights)
      dark: "#003366", // Deep Navy (Headers)
    },
    secondary: {
      main: "#FFD700", // Pale Yellow (Accents)
    },
    success: {
      main: "#2E7D32", // Forest Green (Matches the professional navy)
    },
    error: {
      main: "#D32F2F", // Alert Red
    },
    warning: {
      main: "#ED6C02", // Safety Orange
    },
    text: {
      primary: "#003366", // Deep Navy
      secondary: "#455A64", // Slate Grey (The grey you mentioned!)
    },
    background: {
      default: "#F8F9FA", // Very light grey background for the app
      paper: "#FFFFFF",
    },
  },
  shape: {
    borderRadius: 8, // Modern, slightly rounded corners
  },
});

export default theme;
