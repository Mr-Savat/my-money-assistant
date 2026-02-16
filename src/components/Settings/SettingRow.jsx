import React from 'react'


const SettingRow = ({ label, subtext, children, icon: Icon }) => (
    <div className="flex items-center justify-between py-4 px-2 rounded-xl hover:bg-gray-50/80 transition-colors duration-200">
        <div className="flex items-center gap-4">
            {Icon && (
                <div className="p-2.5 rounded-lg bg-gray-50">
                    <Icon size={20} className="text-gray-600" />
                </div>
            )}
            <div>
                <p className="font-semibold text-gray-800">{label}</p>
                {subtext && <p className="text-sm text-gray-500 mt-0.5">{subtext}</p>}
            </div>
        </div>
        {children}
    </div>
);

export default SettingRow