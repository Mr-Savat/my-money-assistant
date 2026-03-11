import React from 'react';
import SettingSection from '../SettingSection';
import { User } from 'lucide-react';
import ProfileImage from './components/ProfileImage';
import ProfileField from './components/ProfileField';
import ProfileActions from './components/ProfileActions';
import { useProfile } from './hooks/useProfile';

const ProfileSection = () => {
    const {
        profile,
        setProfile,
        isEditing,
        setIsEditing,
        imagePreview,
        handleImageChange,
        handleSave,
        handleCancel,
        t,
        loading
    } = useProfile();

    const genderOptions = [
        { value: 'male', label: t('profile.male') },
        { value: 'female', label: t('profile.female') },
        { value: 'other', label: t('profile.other') }
    ];

    return (
        <SettingSection
            title={t('settings.profile')}
            description={t('settings.profile_desc')}
            icon={User}
            variant="default"
        >
            <ProfileImage
                imagePreview={imagePreview}
                name={profile.name}
                isEditing={isEditing}
                onImageChange={handleImageChange}
                t={t}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <ProfileField
                    label={t('profile.fullname')}
                    value={profile.name}
                    isEditing={isEditing}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />

                <ProfileField
                    label={t('profile.email')}
                    value={profile.email}
                    isEditing={isEditing}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    type="email"
                />

                <ProfileField
                    label={t('profile.gender')}
                    value={profile.gender}
                    isEditing={isEditing}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    options={genderOptions}
                />

                <ProfileField
                    label={t('profile.company')}
                    value={profile.company}
                    isEditing={isEditing}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                />

                <ProfileField
                    label={t('profile.job_title')}
                    value={profile.jobTitle}
                    isEditing={isEditing}
                    onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                />

                <ProfileField
                    label={t('profile.monthly_salary')}
                    value={profile.monthlySalary}
                    isEditing={isEditing}
                    onChange={(e) => setProfile({ ...profile, monthlySalary: e.target.value })}
                    type="number"
                    prefix="$"
                />

                <ProfileField
                    label={t('profile.spending_limit')}
                    value={profile.spendingLimit}
                    isEditing={isEditing}
                    onChange={(e) => setProfile({ ...profile, spendingLimit: e.target.value })}
                    type="number"
                    prefix="$"
                />
            </div>

            <ProfileActions
                isEditing={isEditing}
                onEdit={() => setIsEditing(true)}
                onSave={handleSave}
                onCancel={handleCancel}
                t={t}
                loading={loading} 
            />
        </SettingSection>
    );
};

export default ProfileSection;