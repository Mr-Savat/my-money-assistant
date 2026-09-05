import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { auth } from "../../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useDashboardNavigation = () => {
  const { t } = useTranslation();

  const [userName, setUserName] = useState('Guest');
  const [userImage, setUserImage] = useState(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [notifSettings, setNotifSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('user_notifications');
      return saved ? JSON.parse(saved) : { email: true, push: true };
    } catch {
      return { email: true, push: true };
    }
  });

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        setUserName(user.displayName || 'Guest');
        setUserImage(user.photoURL || null);
      } else {
        setUserName('Guest');
        setUserImage(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const getToken = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  };

  const loadUserData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setUserName(data.user.name || 'Guest');
        setUserImage(data.user.profileImage || null); // fixed from imagePreview
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Load user data when authenticated
  useEffect(() => {
    if (isAuthenticated) loadUserData();
  }, [isAuthenticated, loadUserData]);

  // Listen for events
  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('user_notifications');
        if (saved) setNotifSettings(JSON.parse(saved));

        // also refresh image from localStorage directly
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const parsed = JSON.parse(userData);
          setUserName(parsed.name || 'Guest');
          setUserImage(parsed.profileImage || null);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('profile-updated', loadUserData);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('profile-updated', loadUserData);
    };
  }, [loadUserData, setUserImage, setUserName]);

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
    loading
  };
};