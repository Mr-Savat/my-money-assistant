import React from 'react'

const SettingSection = ({ title, description, icon: Icon, children, variant = "default" }) => {
    const themes = {
        default: "hover:shadow-blue-500/10 hover:border-blue-300/50 from-blue-100 to-indigo-100 text-blue-700",
        purple: "hover:shadow-purple-500/10 hover:border-purple-300/50 from-purple-100 to-pink-100 text-purple-700",
        green: "hover:shadow-green-500/10 hover:border-green-300/50 from-green-100 to-emerald-100 text-green-700",
        orange: "hover:shadow-orange-500/10 hover:border-orange-300/50 from-orange-100 to-amber-100 text-orange-700",
        danger: "border-red-200 hover:shadow-red-500/20 hover:border-red-400 from-red-100 to-pink-100 text-red-600"
    };

    return (
        <div className={`group bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden transition-all duration-500 shadow-sm ${themes[variant]}`}>
            <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                    <div className="flex items-start gap-5">
                        <div className={`p-4 rounded-xl bg-linear-to-br transition-transform duration-300 group-hover:scale-110 ${themes[variant].split(' ').slice(2).join(' ')}`}>
                            <Icon size={28} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className={`text-xl font-bold mb-2 ${variant === 'danger' ? 'text-red-900' : 'text-gray-900'}`}>{title}</h3>
                            <p className="text-gray-600 leading-relaxed">{description}</p>
                        </div>
                    </div>
                    {/* Optional Action Button slot could go here */}
                </div>
                <div className="space-y-2">{children}</div>
            </div>
        </div>
    );
};

export default SettingSection