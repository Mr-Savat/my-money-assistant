import { useState } from "react";
import { Trash2, AlertCircle, Key } from "lucide-react";
import SettingSection from "./SettingSection";
import { useNavigate } from "react-router-dom";
import { sendNotificationEmail } from "../../services/emailService";
import { useTranslation } from "../../hooks/useTranslation";

function DangerZone() {
    const { t } = useTranslation(); 
    const navigate = useNavigate();
    const [step, setStep] = useState('initial');
    const [generatedCode, setGeneratedCode] = useState('');
    const [userInputCode, setUserInputCode] = useState('');

    // 1. Send the Verification Code Email
    const startDeletionProcess = async () => {
        const confirmFirst = window.confirm(t('danger.confirm_request'));
        if (!confirmFirst) return;

        // Generate a random 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(code);

        try {
            await sendNotificationEmail(
                "Your Deletion Code",
                `Your secret code to delete your MoneyAI account is: ${code}. If you did not request this, please ignore this email.`
            );
            setStep('verify'); // Move to the "Enter Code" screen
            alert(t('danger.code_sent'));
        } catch (error) {
            console.log(error);
            alert(t('danger.code_failed'));
        }
    };

    // 2. Final Deletion after Code Check
    const handleFinalDelete = () => {
        if (userInputCode === generatedCode) {
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

  return (
  <SettingSection 
    title={t('settings.danger')} 
    icon={Trash2} 
    variant="danger" 
    description={t('settings.danger_desc')}
  >
    <div className="p-4 sm:p-5 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl sm:rounded-2xl transition-colors duration-300">
      {step === 'initial' ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 text-red-800 dark:text-red-400">
            <AlertCircle size={16} className="sm:w-5 sm:h-5" />
            <p className="text-xs sm:text-sm font-medium">{t('danger.delete_title')}</p>
          </div>
          <button 
            onClick={startDeletionProcess} 
            className="px-4 sm:px-6 py-2 sm:py-2.5 cursor-pointer bg-red-600 dark:bg-red-700 text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-red-700 dark:hover:bg-red-800 transition-all w-full sm:w-auto"
          >
            {t('danger.delete_button')}
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-3 text-red-800 dark:text-red-400">
            <Key size={16} className="sm:w-5 sm:h-5" />
            <p className="text-xs sm:text-sm font-bold uppercase tracking-tight">{t('danger.enter_code')}</p>
          </div>
          <input
            type="text"
            maxLength="6"
            placeholder="000000"
            className="w-full p-2 sm:p-3 text-center text-lg sm:text-xl lg:text-2xl tracking-[6px] sm:tracking-[10px] font-mono border-2 border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl focus:border-red-500 dark:focus:border-red-400 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-red-100 dark:placeholder-red-900"
            value={userInputCode}
            onChange={(e) => setUserInputCode(e.target.value)}
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <button 
              onClick={handleFinalDelete} 
              className="flex-1 py-2 sm:py-3 bg-red-600 dark:bg-red-700 text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-red-800 dark:hover:bg-red-900 transition-all"
            >
              {t('danger.confirm_delete')}
            </button>
            <button 
              onClick={() => setStep('initial')} 
              className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              {t('danger.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  </SettingSection>
);
}

export default DangerZone;