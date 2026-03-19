import { useState, useEffect } from 'react';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { sendNotificationEmail } from '../../../../../services/emailService';
import { auth } from '../../../../../firebase/config';
export const useProfile = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profileImage: null,
    gender: 'male',
    company: '',
    jobTitle: '',
    monthlySalary: '',
    spendingLimit: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // បន្ថែម getToken function ត្រង់នេះ
  const getToken = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  };

  // Load user data from localStorage
  useEffect(() => {
    const savedUserString = localStorage.getItem('user_data');
    if (savedUserString) {
      const savedUser = JSON.parse(savedUserString);
      setProfile({
        name: savedUser.name || '',
        email: savedUser.email || '',
        profileImage: savedUser.profileImage || null,
        gender: savedUser.gender || 'male',
        company: savedUser.company || '',
        jobTitle: savedUser.jobTitle || '',
        monthlySalary: savedUser.monthlySalary || '',
        spendingLimit: savedUser.spendingLimit || ''
      });
      setImagePreview(savedUser.profileImage || null);
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    //  compress image before saving
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
  
    img.onload = () => {
      // resize to max 200x200
      const maxSize = 200;
      let width = img.width;
      let height = img.height;
  
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
  
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
  
      // compress to jpeg quality 0.7
      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      setImagePreview(compressed);
    };
  
    img.src = URL.createObjectURL(file);
  };

  // Save profile
  const handleSave = async () => {
    setLoading(true);
  
    try {
      const token = await getToken();
      if (!token) {
        alert('Please login again');
        return;
      }
  
      //  just use imagePreview directly (base64)
      const finalImageUrl = imagePreview;
  
      const profileData = {
        name: profile.name,
        gender: profile.gender,
        company: profile.company,
        jobTitle: profile.jobTitle,
        monthlySalary: profile.monthlySalary ? parseFloat(profile.monthlySalary) : 0,
        spendingLimit: profile.spendingLimit ? parseFloat(profile.spendingLimit) : 0,
        profileImage: finalImageUrl || null
      };
  
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
  
      const data = await response.json();
  
      if (!data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }
  
      const savedUserString = localStorage.getItem('user_data');
      const currentData = savedUserString ? JSON.parse(savedUserString) : {};
  
      const updatedData = {
        ...currentData,
        ...profile,
        spendingLimit: profile.spendingLimit ? parseFloat(profile.spendingLimit) : 0,
        monthlySalary: profile.monthlySalary ? parseFloat(profile.monthlySalary) : 0,
        profileImage: finalImageUrl || profile.profileImage
      };
  
      localStorage.setItem('user_data', JSON.stringify(updatedData));
  
      try {
        await sendNotificationEmail(
          "Profile Updated",
          `Hello ${profile.name}, your MoneyAI profile information has been successfully updated. If you did not make this change, please secure your account.`
        );
      } catch (emailError) {
        console.error("Could not send profile update email:", emailError);
      }
  
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('profile-updated', {
        detail: {
          spendingLimit: profile.spendingLimit,
          monthlySalary: profile.monthlySalary
        }
      }));
      window.dispatchEvent(new CustomEvent('transactions-updated'));
  
      setIsEditing(false);
      alert(t('profile.updated_success'));
  
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    const savedUserString = localStorage.getItem('user_data');
    if (savedUserString) {
      const savedUser = JSON.parse(savedUserString);
      setProfile({
        name: savedUser.name || '',
        email: savedUser.email || '',
        profileImage: savedUser.profileImage || null,
        gender: savedUser.gender || 'male',
        company: savedUser.company || '',
        jobTitle: savedUser.jobTitle || '',
        monthlySalary: savedUser.monthlySalary || '',
        spendingLimit: savedUser.spendingLimit || ''
      });
      setImagePreview(savedUser.profileImage || null);
    }
    setIsEditing(false);
  };

  return {
    profile,
    setProfile,
    isEditing,
    setIsEditing,
    imagePreview,
    handleImageChange,
    handleSave,
    handleCancel,
    t,
    loading
  };
};