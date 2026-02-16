import { useState } from "react";
import SettingRow from "./SettingRow";
import SettingSection from "./SettingSection";
import Toggle from "./Toggle";
import { Lock, Shield, Eye} from 'lucide-react';
function SecuritySection() {
    const [twoFactor, setTwoFactor] = useState(false);
    return (
        <div>
            <SettingSection
                title="Security"
                description="Manage your account access and protection."
                icon={Lock}
                variant="green"
            >
                <SettingRow label="Two-Factor Auth" subtext="Add a second step to login" icon={Shield}>
                    <Toggle enabled={twoFactor} onChange={setTwoFactor} />
                </SettingRow>
                <SettingRow label="Password" subtext="Last updated 3 months ago" icon={Eye}>
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition-colors">
                        Change
                    </button>
                </SettingRow>
            </SettingSection>
        </div>
    )
}

export default SecuritySection