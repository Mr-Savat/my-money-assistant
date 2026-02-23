import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationsSection from './Settings/NotificationsSection';
function DashboardNavigation() {
    const [userName, setUserName] = useState('Guest');
    const [userImage, setUserImage] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);
    
    // ++++++++++ State សម្រាប់ Notification Settings ++++++++++
    const [notifSettings, setNotifSettings] = useState(() => {
        const saved = localStorage.getItem('user_notifications');
        return saved ? JSON.parse(saved) : { email: true, push: true };
    });

    useEffect(() => {
        const loadUserData = () => {
            const savedData = localStorage.getItem('user_data');
            if (savedData) {
                const user = JSON.parse(savedData);
                setUserName(user?.name || 'Guest');
                setUserImage(user?.profileImage || null);
            }
        };

        loadUserData();
        
        // ++++++++++ ស្តាប់ការផ្លាស់ប្តូរ Notifications ++++++++++
        const handleStorageChange = () => {
            const saved = localStorage.getItem('user_notifications');
            if (saved) {
                setNotifSettings(JSON.parse(saved));
            }
        };

        window.addEventListener('storage', loadUserData);
        window.addEventListener('storage', handleStorageChange);
        
        const interval = setInterval(() => {
            loadUserData();
            handleStorageChange();
        }, 1000);

        return () => {
            window.removeEventListener('storage', loadUserData);
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    // ++++++++++ ពិនិត្យថាតើមាន Toggle ណាមួយបើកដែរឬទេ? ++++++++++
    const isAnyNotificationOn = () => {
        return notifSettings.email === true || notifSettings.push === true;
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    Welcome, {userName}!
                </h1>
                <p className="text-gray-500 font-medium">
                    Here's what's happening with your money today.
                </p>
            </div>

            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 px-3 border-r border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold overflow-hidden">
                        {userImage ? (
                            <img
                                src={userImage}
                                alt={userName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-lg font-black">
                                {userName.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-bold leading-none">{userName}</p>
                    </div>
                </div>

                {/* ++++++++++ Bell Button ++++++++++ */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2 transition-colors relative rounded-xl ${
                            isAnyNotificationOn() 
                                ? 'text-indigo-600 bg-indigo-50'  // ++++++++++ Active: មាន Toggle បើក ++++++++++
                                : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-50'
                        }`}
                    >
                        <Bell size={20} className='cursor-pointer'/>
                    </button>

                    {/* Notifications Panel */}
                    {showNotifications && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowNotifications(false)}
                            ></div>
                            <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
                                <div className="sticky top-0 bg-white p-4 border-b border-gray-100 flex justify-between items-center z-10">
                                    <h3 className="font-black text-gray-900">Notification Settings</h3>
                                    <button
                                        onClick={() => setShowNotifications(false)}
                                        className="p-1 hover:bg-gray-100 rounded-full"
                                    >
                                        <span className="text-gray-400">✕</span>
                                    </button>
                                </div>
                                <div className="p-2">
                                    <NotificationsSection />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DashboardNavigation;