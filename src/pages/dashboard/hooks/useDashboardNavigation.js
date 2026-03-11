import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../../../hooks/useTranslation";

// Read from localStorage once at module level — before first render
const getInitialUserData = () => {
  try {
    const savedData = localStorage.getItem('user_data');
    if (savedData) {
      const user = JSON.parse(savedData);
      return {
        name: user?.name || 'Guest',
        profileImage: user?.profileImage || null,
      };
    }
  } catch {
    // ignore parse errors
  }
  return { name: 'Guest', profileImage: null };
};

export const useDashboardNavigation = () => {
  const { t } = useTranslation();

  const initial = getInitialUserData();

  // Initialize directly from localStorage — no flicker
  const [userName, setUserName] = useState(initial.name);
  const [userImage, setUserImage] = useState(initial.profileImage);
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifSettings, setNotifSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('user_notifications');
      return saved ? JSON.parse(saved) : { email: true, push: true };
    } catch {
      return { email: true, push: true };
    }
  });

  const loadUserData = useCallback(() => {
    try {
      const savedData = localStorage.getItem('user_data');
      if (savedData) {
        const user = JSON.parse(savedData);
        setUserName(user?.name || 'Guest');
        setUserImage(user?.profileImage || null);
      }
    } catch {
      // ignore
    }
  }, []);

  const loadNotifSettings = useCallback(() => {
    try {
      const saved = localStorage.getItem('user_notifications');
      if (saved) setNotifSettings(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    // Listen for cross-tab storage changes
    const handleStorage = () => {
      loadUserData();
      loadNotifSettings();
    };

    window.addEventListener('storage', handleStorage);

    // Listen for same-tab updates (dispatch this when user updates profile)
    // window.dispatchEvent(new Event('user-updated'))
    window.addEventListener('user-updated', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('user-updated', handleStorage);
      // No interval to clean up
    };
  }, [loadUserData, loadNotifSettings]);

  const isAnyNotificationOn = () => {
    return notifSettings.email === true || notifSettings.push === true;
  };

  return {
    userName,
    userImage,
    showNotifications,
    setShowNotifications,
    t,
    isAnyNotificationOn,
  };
};