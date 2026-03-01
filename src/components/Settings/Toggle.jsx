import React from 'react'

const Toggle = ({ enabled, onChange, ariaLabel }) => (
    <button
        role="switch"
        aria-checked={enabled}
        aria-label={ariaLabel}
        onClick={() => onChange(!enabled)}
        className={`relative cursor-pointer inline-flex items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
            ${enabled ? 'bg-linear-to-r from-blue-500 to-indigo-600' : 'bg-gray-200'}
            h-5 w-9 sm:h-6 sm:w-11 lg:h-7 lg:w-14`}
    >
        <span
            className={`inline-block rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out
                h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6
                ${enabled ? 'translate-x-4 sm:translate-x-5 lg:translate-x-7' : 'translate-x-0.5 sm:translate-x-1'}`}
        />
    </button>
);

export default Toggle;