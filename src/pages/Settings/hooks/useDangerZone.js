import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendNotificationEmail } from "../../../services/emailService";
import { useTranslation } from "../../../hooks/useTranslation";

export const useDangerZone = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState('initial');
  const [generatedCode, setGeneratedCode] = useState('');
  const [userInputCode, setUserInputCode] = useState('');

  // Generate random 6-digit code
  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Send verification code
  const startDeletionProcess = async () => {
    const confirmFirst = window.confirm(t('danger.confirm_request'));
    if (!confirmFirst) return;

    const code = generateCode();
    setGeneratedCode(code);

    try {
      await sendNotificationEmail(
        "Your Deletion Code",
        `Your secret code to delete your MoneyAI account is: ${code}. If you did not request this, please ignore this email.`
      );
      setStep('verify');
      alert(t('danger.code_sent'));
    } catch (error) {
      console.log(error);
      alert(t('danger.code_failed'));
    }
  };

  // Verify code and delete account
  const handleFinalDelete = () => {
    if (userInputCode === generatedCode) {
      // Clear all user data
      localStorage.removeItem('user_data');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user_notifications');
      
      alert(t('danger.account_deleted'));
      navigate('/register');
      window.location.reload();
    } else {
      alert(t('danger.incorrect_code'));
    }
  };

  // Reset to initial step
  const resetStep = () => {
    setStep('initial');
    setUserInputCode('');
  };

  return {
    step,
    userInputCode,
    setUserInputCode,
    startDeletionProcess,
    handleFinalDelete,
    resetStep,
    t
  };
};