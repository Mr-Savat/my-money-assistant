import React, { useState } from 'react';
import { X, Mail, Key, ArrowLeft, Loader } from 'lucide-react';
import { sendResetPasswordEmail } from '../services/emailService';
import { useTranslation } from '../hooks/useTranslation'; // បន្ថែម Translation

const ForgotPasswordModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation(); // ប្រើ Translation
    const [step, setStep] = useState('email'); // 'email' or 'reset'
    const [email, setEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const generateResetCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    };

    const handleSendCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // ពិនិត្យមើលថាអ៊ីមែលមានក្នុង localStorage ឬអត់
            const savedUserString = localStorage.getItem('user_data');
            const savedUser = savedUserString ? JSON.parse(savedUserString) : null;

            if (!savedUser || savedUser.email !== email) {
                setError(t('forgot.email_not_found'));
                setLoading(false);
                return;
            }

            // បង្កើត Reset Code
            const code = generateResetCode();

            // រក្សាទុក Reset Code ក្នុង localStorage (ផុតកំណត់ 15 នាទី)
            const resetData = {
                email: email,
                code: code,
                expiresAt: Date.now() + 15 * 60 * 1000 // 15 នាទី
            };
            localStorage.setItem('reset_password', JSON.stringify(resetData));

            // ផ្ញើ Email
            await sendResetPasswordEmail(email, code);

            setSuccess(t('forgot.code_sent'));
            setStep('reset');
        } catch (err) {
            setError(t('forgot.send_failed'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // ពិនិត្យពាក្យសម្ងាត់
        if (newPassword !== confirmPassword) {
            setError(t('forgot.passwords_mismatch'));
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError(t('forgot.password_short'));
            setLoading(false);
            return;
        }

        try {
            // ទាញ Reset Data ពី localStorage
            const resetDataString = localStorage.getItem('reset_password');
            if (!resetDataString) {
                setError(t('forgot.no_request'));
                setStep('email');
                setLoading(false);
                return;
            }

            const resetData = JSON.parse(resetDataString);

            // ពិនិត្យថា Code ត្រឹមត្រូវ
            if (resetData.code !== resetCode) {
                setError(t('forgot.invalid_code'));
                setLoading(false);
                return;
            }

            // ពិនិត្យថា Code មិនទាន់ផុតកំណត់
            if (Date.now() > resetData.expiresAt) {
                setError(t('forgot.code_expired'));
                localStorage.removeItem('reset_password');
                setStep('email');
                setLoading(false);
                return;
            }

            // ទាញទិន្នន័យអ្នកប្រើ
            const savedUserString = localStorage.getItem('user_data');
            const savedUser = JSON.parse(savedUserString);

            // ប្តូរពាក្យសម្ងាត់
            savedUser.password = newPassword;
            localStorage.setItem('user_data', JSON.stringify(savedUser));

            // លុប Reset Data
            localStorage.removeItem('reset_password');

            setSuccess(t('forgot.success'));

            // បិទ Modal បន្ទាប់ពី 2 វិនាទី
            setTimeout(() => {
                onClose();
                setStep('email');
                setEmail('');
                setResetCode('');
                setNewPassword('');
                setConfirmPassword('');
            }, 2000);

        } catch (err) {
            setError(t('forgot.reset_failed'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setStep('email');
        setError('');
        setSuccess('');
        setResetCode('');
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {step === 'email' ? t('forgot.title') : t('forgot.reset_title')}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-pointer transition-colors"
                        disabled={loading}
                    >
                        <X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
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

                {step === 'email' ? (
                    // Step 1: Enter Email
                    <form onSubmit={handleSendCode}>
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
                                t('forgot.send_code')
                            )}
                        </button>
                    </form>
                ) : (
                    // Step 2: Enter Code and New Password
                    <form onSubmit={handleResetPassword}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('forgot.code_label')}
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                <input
                                    type="text"
                                    value={resetCode}
                                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                                    placeholder={t('forgot.code_placeholder')}
                                    maxLength="6"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('forgot.new_password')}
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                                placeholder="••••••••"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('forgot.confirm_password')}
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                                placeholder="••••••••"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleBack}
                                disabled={loading}
                                className={`flex-1 py-2 border cursor-pointer border-gray-300 dark:border-gray-600 
                                    text-gray-700 dark:text-gray-300 rounded-lg font-semibold 
                                    hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors 
                                    flex items-center justify-center gap-1
                                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <ArrowLeft size={16} /> {t('common.back')}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-1 py-2 cursor-pointer bg-indigo-600 text-white rounded-lg font-semibold 
                                    hover:bg-indigo-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 
                                    transition-colors flex items-center justify-center gap-2
                                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <>
                                        <Loader size={16} className="animate-spin" />
                                        <span>{t('common.resetting')}</span>
                                    </>
                                ) : (
                                    t('forgot.reset_button')
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordModal;