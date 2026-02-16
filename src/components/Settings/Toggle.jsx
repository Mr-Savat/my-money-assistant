import React from 'react'

const Toggle = ({ enabled, onChange, ariaLabel }) => (
    <button
        role="switch"
        aria-checked={enabled}
        aria-label={ariaLabel}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${enabled ? 'bg-linear-to-r from-blue-500 to-indigo-600' : 'bg-gray-200'
            }`}
    >
        <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
        />
    </button>
);

export default Toggle