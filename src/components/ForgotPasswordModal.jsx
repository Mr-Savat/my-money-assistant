import React, { useState } from 'react';
import { X, Mail, Loader } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { auth } from '../firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const handleSendResetEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Send password reset email via Firebase
            await sendPasswordResetEmail(auth, email, {
                url: window.location.origin + '/login',
            });

            setSuccess(t('forgot.reset_email_sent'));

            // Close modal after 3 seconds
            setTimeout(() => {
                onClose();
                setEmail('');
            }, 3000);

        } catch (error) {
            console.error('Password reset error:', error);

            switch (error.code) {
                case 'auth/user-not-found':
                    setError(t('forgot.email_not_found'));
                    break;
                case 'auth/invalid-email':
                    setError(t('auth.invalid_email'));
                    break;
                case 'auth/too-many-requests':
                    setError(t('forgot.too_many_requests'));
                    break;
                default:
                    setError(t('forgot.send_failed'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {t('forgot.title')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-pointer transition-colors"
                        disabled={loading}
                    >
                        <X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Information Banner */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        🔔 {t('forgot.firebase_info')}
                    </p>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
                        {success}
                    </div>
                )}

                {/* Enter Email Form */}
                <form onSubmit={handleSendResetEmail}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('forgot.email_label')}
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                                placeholder={t('forgot.email_placeholder')}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        {t('forgot.firebase_instruction')}
                    </p>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 cursor-pointer bg-indigo-600 text-white rounded-lg font-semibold 
                            hover:bg-indigo-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 
                            transition-colors flex items-center justify-center gap-2
                            ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <>
                                <Loader size={18} className="animate-spin" />
                                <span>{t('common.sending')}</span>
                            </>
                        ) : (
                            t('forgot.send_reset_link')
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;