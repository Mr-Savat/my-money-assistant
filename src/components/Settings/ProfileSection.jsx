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
                {/* Profile Image Section */}
                <div className="mb-6 flex items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold overflow-hidden">
                            {imagePreview ? (
                                <img 
                                    src={imagePreview} 
                                    alt={profile.name} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-4xl font-black">
                                    {profile.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            )}
                        </div>
                        
                        {isEditing && (
                            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                                <Camera size={16} className="text-gray-600" />
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
                        <div className="text-xs text-gray-400">
                            <p>Click the camera icon to change your profile picture</p>
                            <p className="mt-1">Supported: JPG, PNG, GIF (max 5MB)</p>
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* Full Name Field */}
                    <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</span>
                        {isEditing ? (
                            <input
                                type="text"
                                className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 mt-1 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            />
                        ) : (
                            <p className="font-bold text-gray-900 mt-1">{profile.name || "N/A"}</p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 transition-all focus-within:border-blue-300">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</span>
                        {isEditing ? (
                            <input
                                type="email"
                                className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 mt-1 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            />
                        ) : (
                            <p className="font-bold text-gray-900 mt-1">{profile.email || "N/A"}</p>
                        )}
                    </div>
                </div>

                {/* Edit Toggle Logic */}
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items- cursor-pointer gap-2 text-blue-600 font-bold text-sm hover:underline p-2 group"
                    >
                        Edit Public Profile
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                ) : (
                    <div className="flex gap-3 p-2">
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                        >
                            <Save size={16} /> Save Changes
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all active:scale-95"
                        >
                            <X size={16} /> Cancel
                        </button>
                    </div>
                )}
            </SettingSection>
        </div>
    );
}

export default ProfileSection;