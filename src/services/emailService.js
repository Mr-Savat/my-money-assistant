import emailjs from '@emailjs/browser';

// ផ្ញើ Email ធម្មតា (សម្រាប់ Welcome, Login Notification)
export const sendNotificationEmail = async (title, message) => {
    const userData = JSON.parse(localStorage.getItem('user_data'));
    const notifSettings = JSON.parse(localStorage.getItem('user_notifications'));

    if (!userData || !notifSettings?.email) return;

    const templateParams = {
        name: userData.name,
        email: userData.email,
        title: title,
        message: message,
        time: new Date().toLocaleString()
    };

    try {
        const result = await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            templateParams,
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
        return result;
    } catch (error) {
        console.error("Failed to send email:", error);
    }
};

// ++++++++++ ផ្ញើ Reset Password Email (មិនត្រូវការ Notification Settings) ++++++++++
export const sendResetPasswordEmail = async (email, resetCode) => {
    // រកមើលអ្នកប្រើតាមអ៊ីមែល
    const userData = JSON.parse(localStorage.getItem('user_data'));
    
    // បើគ្មានអ្នកប្រើ ឬអ៊ីមែលមិនត្រូវគ្នា
    if (!userData || userData.email !== email) {
        throw new Error('Email not found');
    }

    const templateParams = {
        name: userData.name || email.split('@')[0],
        email: email,
        title: 'Password Reset Request - MoneyAI',
        message: `Your password reset code is: ${resetCode}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this, please ignore this email.`,
        time: new Date().toLocaleString(),
        reset_code: resetCode // បើ Template របស់អ្នកមាន field នេះ
    };

    try {
        const result = await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            templateParams,
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
        return result;
    } catch (error) {
        console.error("Failed to send reset password email:", error);
        throw error;
    }
};

// ++++++++++ ផ្ញើ Email ដោយគ្មានអ្នកប្រើ (សម្រាប់ Forgot Password) ++++++++++
export const sendEmailDirect = async (toEmail, toName, subject, message) => {
    const templateParams = {
        name: toName,
        email: toEmail,
        title: subject,
        message: message,
        time: new Date().toLocaleString()
    };

    try {
        const result = await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            templateParams,
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
        return result;
    } catch (error) {
        console.error("Failed to send email:", error);
        throw error;
    }
};