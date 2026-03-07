import { useState, useEffect } from 'react';
import SettingSection from './SettingSection';
import SettingRow from './SettingRow';
import Toggle from './Toggle';
import { Bell, CheckCircle } from 'lucide-react';
import { sendNotificationEmail } from '../../services/emailService';
import { useTranslation } from '../../hooks/useTranslation';

function NotificationsSection() {
    const { t } = useTranslation();
    const [notifs, setNotifs] = useState(() => {
        const saved = localStorage.getItem('user_notifications');
        return saved ? JSON.parse(saved) : { email: true, push: true };
    });

    // State for the Toast popup
    const [toast, setToast] = useState({ show: false, message: "" });

    useEffect(() => {
        localStorage.setItem('user_notifications', JSON.stringify(notifs));
    }, [notifs]);

    // Function to trigger the toast
    const triggerToast = (msg) => {
        setToast({ show: true, message: msg });
        setTimeout(() => setToast({ show: false, message: "" }), 3000); // Hide after 3 seconds
    };

    const handleToggle = async (type, value) => {
        const updatedNotifs = { ...notifs, [type]: value };
        setNotifs(updatedNotifs);

        // Ensure localStorage is updated before the email service checks it
        localStorage.setItem('user_notifications', JSON.stringify(updatedNotifs));

        if (type === 'email' && value === true) {
            triggerToast(t('notifications.email_enabled'));
            try {
                await sendNotificationEmail(
                    "Notifications Enabled",
                    "You have successfully turned on email alerts."
                );
            } catch (error) {
                console.error(error);
            }
        } else {
            triggerToast(
                type === 'email'
                    ? t('notifications.email_disabled')
                    : t('notifications.push_disabled')
            );
        }
    };
    return (
        <div className="space-y-4 sm:space-y-6 relative">
            <SettingSection
                title={t('settings.notifications')}
                description={t('settings.notifications_desc')}
                icon={Bell}
                variant="purple"
            >
                <div className="space-y-3 sm:space-y-4">
                    <SettingRow
                        label={t('notifications.email')}
                        subtext={t('notifications.email_desc')}
                    >
                        <Toggle enabled={notifs.email} onChange={(v) => handleToggle('email', v)} />
                    </SettingRow>

                    <SettingRow
                        label={t('notifications.push')}
                        subtext={t('notifications.push_desc')}
                    >
                        <Toggle enabled={notifs.push} onChange={(v) => handleToggle('push', v)} />
                    </SettingRow>
                </div>
            </SettingSection>

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-4 sm:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 bg-gray-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-2xl animate-bounce-in z-50 max-w-[90vw] sm:max-w-md">
                    <CheckCircle size={16} className="sm:w-4.5 sm:h-4.5 text-green-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-medium wrap-break-word">{toast.message}</span>
                </div>
            )}
        </div>
    );
}

export default NotificationsSection;