import { useState, useEffect } from 'react';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { sendNotificationEmail } from '../../../../../services/emailService';
// បន្ថែម import auth
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

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile
  const handleSave = async () => {
    setLoading(true);

    try {
      // ទាញយក token ពី Firebase Auth
      const token = await getToken();
      if (!token) {
        alert('Please login again');
        return;
      }

      // រៀបចំទិន្នន័យសម្រាប់ផ្ញើទៅ Firebase
      const profileData = {
        name: profile.name,
        gender: profile.gender,
        company: profile.company,
        jobTitle: profile.jobTitle,
        monthlySalary: profile.monthlySalary ? parseFloat(profile.monthlySalary) : 0,
        spendingLimit: profile.spendingLimit ? parseFloat(profile.spendingLimit) : 0
      };

      // ផ្ញើទៅ Firebase API (PUT)
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

      // ប្រសិនបើ Firebase Update ជោគជ័យ ទើប Update localStorage
      const savedUserString = localStorage.getItem('user_data');
      const currentData = savedUserString ? JSON.parse(savedUserString) : {};

      const updatedData = {
        ...currentData,
        ...profile,
        spendingLimit: profile.spendingLimit ? parseFloat(profile.spendingLimit) : 0,
        monthlySalary: profile.monthlySalary ? parseFloat(profile.monthlySalary) : 0,
        profileImage: imagePreview || profile.profileImage
      };

      localStorage.setItem('user_data', JSON.stringify(updatedData));

      // ផ្ញើ Email 
      try {
        await sendNotificationEmail(
          "Profile Updated",
          `Hello ${profile.name}, your MoneyAI profile information has been successfully updated. If you did not make this change, please secure your account.`
        );
      } catch (emailError) {
        console.error("Could not send profile update email:", emailError);
        // មិនប៉ះពាល់ដល់ការ Update ទេ
      }

      // Dispatch events ដើម្បីឲ្យ components ផ្សេងទៀតដឹង
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('profile-updated', {
        detail: {
          spendingLimit: profile.spendingLimit,
          monthlySalary: profile.monthlySalary
        }
      }));
      window.dispatchEvent(new CustomEvent('transactions-updated'));

      // បិទការកែប្រែ និងបង្ហាញសារជោគជ័យ
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