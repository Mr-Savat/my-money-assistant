import { useState } from "react";
import SettingRow from "./SettingRow";
import SettingSection from "./SettingSection";
import Toggle from "./Toggle";
import { Lock, Shield, Eye} from 'lucide-react';
import { useTranslation } from "../../hooks/useTranslation";

function SecuritySection() {
    const { t } = useTranslation(); 
    const [twoFactor, setTwoFactor] = useState(false);

    return (
        <div>
            <SettingSection
                title={t('settings.security')}
                description={t('settings.security_desc')}
                icon={Lock}
                variant="green"
            >
                <SettingRow 
                    label={t('security.two_factor')} 
                    subtext={t('security.two_factor_desc')} 
                    icon={Shield}
                >
                    <Toggle enabled={twoFactor} onChange={setTwoFactor} />
                </SettingRow>
                <SettingRow 
                    label={t('security.password')} 
                    subtext={t('security.password_desc')} 
                    icon={Eye}
                >
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition-colors">
                        {t('security.change')}
                    </button>
                </SettingRow>
            </SettingSection>
        </div>
    )
}

export default SecuritySection;