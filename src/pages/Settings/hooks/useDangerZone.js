import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendNotificationEmail } from "../../../services/emailService";
import { useTranslation } from "../../../hooks/useTranslation";
import { auth } from "../../../firebase/config";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useDangerZone = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState('initial');
  const [generatedCode, setGeneratedCode] = useState('');
  const [userInputCode, setUserInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [_token, setToken] = useState(null);

  // Load token on mount for initial state
  useEffect(() => {
    const fetchToken = async () => {
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        setToken(idToken);
      }
    };
    fetchToken();
  }, []);

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const startDeletionProcess = async () => {
    const confirmFirst = window.confirm(t('danger.confirm_request'));
    if (!confirmFirst) return;

    setLoading(true);

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
      console.error(error);
      alert(t('danger.code_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleFinalDelete = async () => {
    if (userInputCode !== generatedCode) {
      alert(t('danger.incorrect_code'));
      return;
    }

    setLoading(true);

    try {
      const user = await new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((u) => {
          unsubscribe();
          resolve(u);
        });
      });

      if (!user) {
        alert('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }

      //  Always get a FRESH token right before the DELETE call
      const currentToken = await user.getIdToken(true);

      //  Backend Request
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        // Handle Firebase security requirement for "Fresh Login"
        if (data.error?.includes('recent-login')) {
           alert("Security check: Please log out and log back in, then try deleting again.");
           return;
        }
        throw new Error(data.error || 'Failed to delete account');
      }

      // Success Cleanup
      // Sign out of Firebase first
      await auth.signOut();
      
      // Wipe all localStorage keys (including the ones in your screenshot)
      localStorage.clear(); 
      
      alert(t('danger.account_deleted'));
      
      // Navigate to register and force a hard reload to reset the app state
      navigate('/register');
      window.location.reload();

    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete account: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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
    t,
    loading
  };
};