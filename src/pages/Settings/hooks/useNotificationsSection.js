import { useState, useEffect } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { sendNotificationEmail } from "../../../services/emailService";
export const useNotificationsSection = () => {
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
        setTimeout(() => setToast({ show: false, message: "" }), 4000); // Hide after 4 seconds
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
    return {
        handleToggle, toast, notifs, t }

}