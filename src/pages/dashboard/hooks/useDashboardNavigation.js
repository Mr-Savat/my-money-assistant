import { useState, useEffect } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
export const useDashboardNavigation = () => {
    const { t } = useTranslation();
    const [userName, setUserName] = useState('Guest');
    const [userImage, setUserImage] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);
  
    //  State សម្រាប់ Notification Settings 
    const [notifSettings, setNotifSettings] = useState(() => {
      const saved = localStorage.getItem('user_notifications');
      return saved ? JSON.parse(saved) : { email: true, push: true };
    });
  
    useEffect(() => {
      const loadUserData = () => {
        const savedData = localStorage.getItem('user_data');
        if (savedData) {
          const user = JSON.parse(savedData);
          setUserName(user?.name || 'Guest');
          setUserImage(user?.profileImage || null);
        }
      };
  
      loadUserData();
  
      //  ស្តាប់ការផ្លាស់ប្តូរ Notifications 
      const handleStorageChange = () => {
        const saved = localStorage.getItem('user_notifications');
        if (saved) {
          setNotifSettings(JSON.parse(saved));
        }
      };
  
      window.addEventListener('storage', loadUserData);
      window.addEventListener('storage', handleStorageChange);
  
      const interval = setInterval(() => {
        loadUserData();
        handleStorageChange();
      }, 1000);
  
      return () => {
        window.removeEventListener('storage', loadUserData);
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    }, []);
  
    //  ពិនិត្យថាតើមាន Toggle ណាមួយបើកដែរឬទេ? 
    const isAnyNotificationOn = () => {
      return notifSettings.email === true || notifSettings.push === true;
    };

    return {
        userName, userImage, showNotifications, setShowNotifications, t, isAnyNotificationOn
    }

}