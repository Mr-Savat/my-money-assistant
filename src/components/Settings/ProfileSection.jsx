import SettingSection from './SettingSection';
import { useState, useEffect } from 'react';
import { User, ChevronRight, Save, X, Camera } from 'lucide-react';
import { sendNotificationEmail } from '../../services/emailService';

function ProfileSection() {
    const [profile, setProfile] = useState({ name: '', email: '', profileImage: null });
    const [isEditing, setIsEditing] = useState(false);
    //  លុប imageFile ចេញ 
    // const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // 1. Load the REAL data from 'user_data' key
    useEffect(() => {
        const savedUserString = localStorage.getItem('user_data');
        if (savedUserString) {
            const savedUser = JSON.parse(savedUserString);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setProfile({
                name: savedUser.name || '',
                email: savedUser.email || '',
                profileImage: savedUser.profileImage || null
            });
            setImagePreview(savedUser.profileImage || null);
        }
    }, []);

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            //  អាន File ដោយផ្ទាល់ មិនរក្សាទុកក្នុង state 
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        // Get the current full object
        const savedUserString = localStorage.getItem('user_data');
        const currentData = savedUserString ? JSON.parse(savedUserString) : {};

        // Merge new profile info with old data
        const updatedData = {
            ...currentData,
            ...profile,
            profileImage: imagePreview || profile.profileImage // Save image
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

        // Trigger storage event for other components
        window.dispatchEvent(new Event('storage'));

        setIsEditing(false);
        //  លែងត្រូវការ setImageFile(null) 
        // setImageFile(null);
        alert("Profile updated successfully! A confirmation email has been sent.");
    };

    const handleCancel = () => {
        // Reset to original values
        const savedUserString = localStorage.getItem('user_data');
        if (savedUserString) {
            const savedUser = JSON.parse(savedUserString);
            setProfile({
                name: savedUser.name || '',
                email: savedUser.email || '',
                profileImage: savedUser.profileImage || null
            });
            setImagePreview(savedUser.profileImage || null);
        }
        setIsEditing(false);
        //  លែងត្រូវការ setImageFile(null) 
        // setImageFile(null);
    };

    return (
        <div>
            <SettingSection
                title="Profile Information"
                description="Update your personal details and how others see you."
                icon={User}
                variant="default"
            >
                {/* Profile Image Section - Responsive */}
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <div className="relative mx-auto sm:mx-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-bold overflow-hidden">
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt={profile.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-3xl sm:text-4xl font-black">
                                    {profile.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            )}
                        </div>

                        {isEditing && (
                            <label className="absolute -bottom-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-white dark:bg-gray-700 rounded-full shadow-md border border-gray-200 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                <Camera size={14} className="sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300" />
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        )}
                    </div>

                    {isEditing && (
                        <div className="text-center sm:text-left text-xs text-gray-400 dark:text-gray-500">
                            <p>Click the camera icon to change your profile picture</p>
                            <p className="mt-1">Supported: JPG, PNG, GIF (max 5MB)</p>
                        </div>
                    )}
                </div>

                {/* Form Fields - Responsive grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    {/* Full Name Field */}
                    <div className="p-3 sm:p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Full Name</span>
                        {isEditing ? (
                            <input
                                type="text"
                                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 mt-1 font-bold text-sm sm:text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            />
                        ) : (
                            <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mt-1">{profile.name || "N/A"}</p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div className="p-3 sm:p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 transition-all focus-within:border-blue-300 dark:focus-within:border-blue-600">
                        <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Email Address</span>
                        {isEditing ? (
                            <input
                                type="email"
                                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 mt-1 font-bold text-sm sm:text-base text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            />
                        ) : (
                            <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mt-1">{profile.email || "N/A"}</p>
                        )}
                    </div>
                </div>

                {/* Edit Toggle Logic - Responsive buttons */}
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center cursor-pointer gap-1 sm:gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs sm:text-sm hover:underline p-2 group w-full sm:w-auto justify-center sm:justify-start"
                    >
                        Edit Public Profile
                        <ChevronRight size={14} className="sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-2">
                        <button
                            onClick={handleSave}
                            className="flex items-center justify-center cursor-pointer gap-1 sm:gap-2 bg-blue-600 dark:bg-blue-500 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/30 active:scale-95 w-full sm:w-auto"
                        >
                            <Save size={14} className="sm:w-4 sm:h-4" /> Save Changes
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex items-center justify-center cursor-pointer gap-1 sm:gap-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95 w-full sm:w-auto"
                        >
                            <X size={14} className="sm:w-4 sm:h-4" /> Cancel
                        </button>
                    </div>
                )}
            </SettingSection>
        </div>
    );
}

export default ProfileSection;