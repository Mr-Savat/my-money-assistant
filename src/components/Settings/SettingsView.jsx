import ProfileSection from './ProfileSection';
import NotificationsSection from './NotificationsSection';
import SecuritySection from './SecuritySection';
import DangerZone from './DangerZone';


const SettingsView = () => {
    return (
        <div className="h-screen w-full overflow-hidden flex flex-col bg-linear-to-br from-gray-50 via-blue-50/30 to-indigo-50/40">

            <header className="shrink-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold bg-linear-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
                                Settings
                            </h1>

                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <p className="text-gray-500 text-sm mt-1 hidden md:block">
                            Refine your experience and security
                        </p>
                    </div>
                </div>
            </header>

            {/* 3. Main: This is the only part that scrolls */}
            <main className="flex-1 overflow-y-auto px-8 py-10">
                <div className="max-w-5xl mx-auto space-y-8 pb-20">

                    {/* Profile Section */}
                    <ProfileSection />

                    {/* Notifications Section */}
                    <NotificationsSection />

                    {/* Security Section */}
                    <SecuritySection />

                    {/* Danger Zone */}
                    <DangerZone />

                </div>
            </main>
        </div>
    );
};
export default SettingsView;