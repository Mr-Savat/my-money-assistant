import {SettingSection, SettingRow} from './index';
import Toggle from '../../../components/Toggle';
import { Bell, CheckCircle } from 'lucide-react';
import { useNotificationsSection } from "../hooks/useNotificationsSection";

function NotificationsSection() {
    const {notifs, t,toast, handleToggle} = useNotificationsSection();
    
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