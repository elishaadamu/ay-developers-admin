import { notification } from "antd";

// Define constants
export const AUTO_LOGOUT_TIME = 60 * 60 * 1000; // 1 hour in milliseconds
const EVENTS = [
  "mousedown",
  "mousemove",
  "keypress",
  "scroll",
  "touchstart",
] as const;

// Add proper typing for the timer
let logoutTimer: ReturnType<typeof setTimeout> | null = null;

export const isAuthenticated = (): boolean => {
  try {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      // If no userData exists, ensure clean logout
      handleLogout();
      return false;
    }
    return true;
  } catch (error) {
    console.error("Auth check failed:", error);
    handleLogout();
    return false;
  }
};

export const handleLogout = (): void => {
  try {
    // Clear all auth related data
    localStorage.removeItem("userData");

    // Clear any other auth-related items if they exist
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    // Clear the auto-logout timer
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      logoutTimer = null;
    }

    // Clear browser history before redirect
    window.history.pushState(null, "", "/signin");
    window.location.href = "/signin";
  } catch (error) {
    console.error("Logout failed:", error);
    notification.error({
      message: "Logout Failed",
      description: "Failed to logout properly. Please try again.",
      duration: 3,
    });
  }
};

// Add a function to check auth status periodically
export const startAuthCheck = (): (() => void) => {
  const checkInterval = setInterval(() => {
    if (!localStorage.getItem("userData")) {
      handleLogout();
    }
  }, 5000); // Check every 5 seconds

  return () => clearInterval(checkInterval);
};

export const setupAutoLogout = (): (() => void) => {
  const resetLogoutTimer = (): void => {
    try {
      // Only setup timer if user is authenticated
      if (!localStorage.getItem("userData")) {
        handleLogout();
        return;
      }

      if (logoutTimer) {
        clearTimeout(logoutTimer);
      }

      logoutTimer = setTimeout(() => {
        notification.warning({
          message: "Session Expired",
          description: "Your session has expired. Please login again.",
          duration: 3,
        });
        handleLogout();
      }, AUTO_LOGOUT_TIME);
    } catch (error) {
      console.error("Failed to reset logout timer:", error);
    }
  };

  try {
    // Setup event listeners for user activity
    EVENTS.forEach((event) => {
      document.addEventListener(event, resetLogoutTimer);
    });

    // Initial setup
    resetLogoutTimer();

    // Start periodic auth check
    const stopAuthCheck = startAuthCheck();

    // Cleanup function
    return () => {
      if (logoutTimer) {
        clearTimeout(logoutTimer);
      }
      EVENTS.forEach((event) => {
        document.removeEventListener(event, resetLogoutTimer);
      });
      stopAuthCheck();
    };
  } catch (error) {
    console.error("Failed to setup auto logout:", error);
    return () => {}; // Return empty cleanup function in case of error
  }
};
