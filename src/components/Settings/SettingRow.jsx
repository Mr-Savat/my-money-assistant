import React from 'react'

const SettingRow = ({ label, subtext, children, icon: Icon }) => (
    <div className="flex items-center justify-between gap-2 sm:gap-4 py-2 sm:py-4 px-2 rounded-xl hover:bg-gray-50/80 transition-colors duration-200">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {Icon && (
                <div className="p-1.5 sm:p-2.5 rounded-lg bg-gray-50 shrink-0">
                    <Icon size={14} className="sm:w-5 sm:h-5 text-gray-600" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs sm:text-sm lg:text-base text-gray-800 truncate">{label}</p>
                {subtext && <p className="text-[9px] sm:text-xs lg:text-sm text-gray-500 mt-0.5 truncate">{subtext}</p>}
            </div>
        </div>
        <div className="shrink-0">
            {children}
        </div>
    </div>
);

export default SettingRow;