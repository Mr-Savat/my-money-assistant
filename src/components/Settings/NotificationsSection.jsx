import { useState, useEffect } from 'react';
import SettingSection from './SettingSection';
import SettingRow from './SettingRow';
import Toggle from './Toggle';
import { Bell, CheckCircle } from 'lucide-react';
import { sendNotificationEmail } from '../../services/emailService';

function NotificationsSection() {
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
            triggerToast("Email alerts enabled! Sending confirmation...");
            try {
                await sendNotificationEmail(
                    "Notifications Enabled",
                    "You have successfully turned on email alerts."
                );
            } catch (error) {
                console.error(error);
            }
        } else {
            triggerToast(`${type === 'email' ? 'Email' : 'Push'} notifications turned off.`);
        }
    };

    return (
        <div className="space-y-6 relative">
            <SettingSection
                title="Notifications"
                description="Control how you want to be alerted."
                icon={Bell}
                variant="purple"
            >
                <SettingRow label="Email Notifications" subtext="Invoices and security alerts">
                    <Toggle enabled={notifs.email} onChange={(v) => handleToggle('email', v)} />
                </SettingRow>

                <SettingRow label="Push Notifications" subtext="Real-time activity updates">
                    <Toggle enabled={notifs.push} onChange={(v) => handleToggle('push', v)} />
                </SettingRow>
            </SettingSection>

            {/* --- TOAST NOTIFICATION UI --- */}
            {toast.show && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl animate-bounce-in z-50">
                    <CheckCircle size={18} className="text-green-400" />
                    <span className="text-sm font-medium">{toast.message}</span>
                </div>
            )}
        </div>
    );
}

export default NotificationsSection;