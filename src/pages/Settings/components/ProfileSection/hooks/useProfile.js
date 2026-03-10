import { useState, useEffect } from 'react';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { sendNotificationEmail } from '../../../../../services/emailService';

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

  // Load user data from localStorage
  useEffect(() => {
    const savedUserString = localStorage.getItem('user_data');
    if (savedUserString) {
      const savedUser = JSON.parse(savedUserString);
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    const savedUserString = localStorage.getItem('user_data');
    const currentData = savedUserString ? JSON.parse(savedUserString) : {};

    const updatedData = {
      ...currentData,
      ...profile,
      profileImage: imagePreview || profile.profileImage
    };

    try {
      await sendNotificationEmail(
        "Profile Updated",
        `Hello ${profile.name}, your MoneyAI profile information has been successfully updated. If you did not make this change, please secure your account.`
      );
    } catch (error) {
      console.error("Could not send profile update email:", error);
    }


    localStorage.setItem('user_data', JSON.stringify(updatedData));
    window.dispatchEvent(new Event('storage'));
    setIsEditing(false);
    alert(t('profile.updated_success'));
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
    t
  };
};