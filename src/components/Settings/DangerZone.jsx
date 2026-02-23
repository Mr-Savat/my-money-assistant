import { useState } from "react";
import { Trash2, AlertCircle, Key } from "lucide-react";
import SettingSection from "./SettingSection";
import { useNavigate } from "react-router-dom";
import { sendNotificationEmail } from "../../services/emailService";
function DangerZone() {
    const navigate = useNavigate();
    const [step, setStep] = useState('initial'); // 'initial' or 'verify'
    const [generatedCode, setGeneratedCode] = useState('');
    const [userInputCode, setUserInputCode] = useState('');

    // 1. Send the Verification Code Email
    const startDeletionProcess = async () => {
        const confirmFirst = window.confirm("Request a deletion code via email?");
        if (!confirmFirst) return;

        // Generate a random 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(code);

        try {
            await sendNotificationEmail(
                "Your Deletion Code",
                `Your secret code to delete your MoneyAI account is: ${code}. If you did not request this, please ignore this email.`
            );
            setStep('verify'); // Move to the "Enter Code" screen
            alert("Verification code sent to your email!");
        } catch (error) {
            console.log(error);

            alert("Failed to send code. Check your connection.");
        }
    };

    // 2. Final Deletion after Code Check
    const handleFinalDelete = () => {
        if (userInputCode === generatedCode) {
            localStorage.removeItem('user_data');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('user_notifications');

            alert("Account permanently deleted.");
            navigate('/register');
            window.location.reload();
        } else {
            alert("Incorrect code. Please check your email.");
        }
    };

    return (
        <SettingSection title="Danger Zone" icon={Trash2} variant="danger" description="Permanently remove your account and all data. This action cannot be undone">
            <div className="p-5 bg-red-50/50 border border-red-100 rounded-2xl">
                {step === 'initial' ? (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-red-800">
                            <AlertCircle size={20} />
                            <p className="text-sm font-medium">Delete account (Requires Email Verification)</p>
                        </div>
                        <button onClick={startDeletionProcess} className="px-6 py-2.5 cursor-pointer bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all">
                            Delete Account
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-red-800">
                            <Key size={20} />
                            <p className="text-sm font-bold uppercase tracking-tight">Enter 6-Digit Code</p>
                        </div>
                        <input
                            type="text"
                            maxLength="6"
                            placeholder="000000"
                            className="w-full p-3 text-center text-2xl tracking-[10px] font-mono border-2 border-red-200 rounded-xl focus:border-red-500 outline-none"
                            value={userInputCode}
                            onChange={(e) => setUserInputCode(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <button onClick={handleFinalDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-800">
                                Confirm Permanent Deletion
                            </button>
                            <button onClick={() => setStep('initial')} className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </SettingSection>
    );
}

export default DangerZone;